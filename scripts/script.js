/***********************************************************************
THIS IS THE CODE FOR THE VIDEO MACHINE VERSION 2.
MID-TERM ITP PROJECT BY MINT WORAYA BOONYAPANACHOTI & DROR AYALON.
FOR MORE DETAILS GO TO: https://github.com/dodiku/the_video_machine_v2
***********************************************************************/


/*********************************************
SERIAL COMMUNICATION VARIABLES
*********************************************/
var serial;
var portName = '/dev/cu.usbmodemFA131';


/*********************************************
VIDEO OBJECT CONSTRUCTOR
*********************************************/
function tv(status, steps, speed, cut, vol) {
  this.status = status;   // play or stop (0 or 1)
  this.volume = vol;      // level of amplitude (e.g. 100 == 100% volume)
  this.speed = speed;     // playback speed (e.g. 1 == regular speed; 100 == x2 of regular speed)
  this.cut = cut;         // video trimming (e.g. 100% == no trimming)
  this.steps = steps;     // number of steps per bar (e.g. number between 1-4)
}

/*********************************************
GLOBAL VARIABLES
*********************************************/
var videos = [];    // array of video objects
var newData = [];   // array of new data coming from the Arduino
var allVideosPart;  // part object for all video phrases

// initializing video objects, with default values, and adding them into an array
for (var i=0; i<16; i++){
  videos.push(new tv(0,5,1, 100, 1));
}
console.log(videos);


var currentStep = 0; // holds that index value of current step of the squence array


/*********************************************
SETUP FUNCTION (P5.JS)
*********************************************/
function setup() {
  noCanvas();

  // setting up serial communication
  serial = new p5.SerialPort();
  serial.on('connected', serverConnected);
  serial.on('open', portOpen);
  serial.on('data', serialEvent);
  serial.on('error', serialError);
  serial.list();
  serial.open(portName);

  // creating a new 'part' object (http://p5js.org/reference/#/p5.Part)
  allVideosPart = new p5.Part();
  allVideosPart.setBPM(56.5);

  // adding general phrase (http://p5js.org/reference/#/p5.Phrase) to the 'part'
  var generalSequence = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
  generalPhrase = new p5.Phrase('general', countSteps, generalSequence);
  allVideosPart.addPhrase(generalPhrase);

  for (var i = 0; i<16; i++){
    allVideosPart.addPhrase(new p5.Phrase(i, videoSteps, [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]));
  }

  console.log(allVideosPart);
  allVideosPart.loop();

}

/*********************************************
PHRASE CALLBACK FUNCTIONS
*********************************************/
function countSteps(time, playbackRate) {
  console.log('step: ' + currentStep);
  currentStep = currentStep + 4;
  if (currentStep == 32){
    currentStep = 0;
  }
}

// <<< this thing happens when array value is 1
function videoSteps(time, playbackRate) {
  // console.log('this.name:');
  // console.log(this.name);
  stopVideo(this.name);
  playVideo(this.name);
}


/*********************************************
SERIAL COMMINICATION CALLBACK FUNCTIONS
*********************************************/
function serverConnected(){
  console.log('server is connected :)');
}

function portOpen(){
  console.log('port was opened :)');
}

function serialError(){
  console.log('darn! we got an error :((');
}

function serialEvent(){
  var newData = serial.readStringUntil('\r\n');
  // console.log(newData);
  if (newData.length > 0) {
    if (newData === 'hello'){ // starting the serial communication
      serial.write(1);
    }
    else{
      parseData(newData);
    }
  }
}

/*********************************************
DRAW FUNCTION (P5.JS) -- CURRENTLY NOT IN USE
*********************************************/
function draw(){
}


/*********************************************
PARSER FOR THE DATA COMING FROM THE ARDUINO
*********************************************/
function parseData(data){

  // parsing the data by ','
  var newStatus = data.split(",");

  // turning strings into integers
  for (var x=0; x<newStatus.length; x++){
    newStatus[x] = parseInt(newStatus[x]);
  }
  // console.log(newStatus);

  // going over all videos to check out if there was a change in video.status
  for (var i=0; i<16; i++){
    if (newStatus[i] ===  videos[i].status){
      continue;
    }
    else {
      videos[i].status = newStatus[i];
      videos[i].volume = (newStatus[16])/100;
      // videos[i].cut = (100-newStatus[17])/100;
      videos[i].steps = newStatus[17];
      videos[i].speed = (100+newStatus[18])/100;
      var phraseIndex = i;
      var updatedPhrase = allVideosPart.getPhrase(phraseIndex);
      console.log(updatedPhrase);
      if (newStatus[i] === 1){
        var stepsArray = [];
        var stepNum = currentStep;
        for (var m=0; m<videos[i].steps; m++){
          updatedPhrase.sequence[stepNum] = 1;
          console.log('adding step on: ' + stepNum);
          stepNum = stepNum + 8;
          if (stepNum > 31) {
            stepNum = stepNum - 32;
          }

        }

      }
      if (newStatus[i] === 0){
        for (var n=0; n<32; n++){
          updatedPhrase.sequence[n] = 0;
        }
      }
    }
  }
  serial.write(1);
}


/*********************************************
PLAYBACK FUNCTIONS: playVideo() + stopVideo()
*********************************************/
function playVideo(vidNum){

  // getting video element as 'vid'
  var videoElemNum = vidNum + 1;
  var videoId = 'video'+videoElemNum;
  var vid = document.getElementById(videoId);

  // setting up video playback configurations
  vid.playbackRate = videos[vidNum].speed;
  vid.volume = videos[vidNum].volume;
  // vid.currentTime = vid.duration * videos[vidNum].cut;

  // playing the video
  vid.play();

  // if (videos[vidNum].loop === 5){
  //   // vid.loop = true;
  //   vid.play();
  //   vid.onended=function(){
  //     // videos[vidNum].loop = videos[vidNum].loop - 1;
  //     // playVideo(vidNum); ////// REMOVED FROM ORIGINAL VERSION
  //   };
  //
  // }
  // else if (videos[vidNum].loop === 0) {
  //   stopVideo(vidNum);
  //   serial.write(vidNum);
  // }
  // else {
  //   vid.play();
  //   vid.onended=function(){
  //     // videos[vidNum].loop = videos[vidNum].loop - 1;
  //     playVideo(vidNum);
  //   };
  // }

  // this.loop = loop;
  // this.speed = speed;
  // this.cut = cut;
  // this.volume = vol;

}

function stopVideo(vidNum){
  var videoElemNum = vidNum+1;
  var videoId = 'video'+videoElemNum;
  var vid = document.getElementById(videoId);
  vid.currentTime = 0;
  // vid.loop = false;
  vid.pause();
}


/*********************************************
APPENDING VIDEO ELEMENTS TO THE PAGE
*********************************************/
function addVideos(){
  var screenArray = $('.video_screen');
  var url;
  for (var i=1;i<17;i++){
    url = 'videos/' + i + '.mp4';
    $(screenArray[i-1]).empty();
    $(screenArray[i-1]).append('<video id="video'+ i + '" width="100%"><source src="' + url + '" type="video/mp4"></video>');
  }
}

$(document).ready(addVideos);
