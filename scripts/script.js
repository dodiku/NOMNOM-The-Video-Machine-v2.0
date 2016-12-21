/***********************************************************************
NOMNOM 2: VIDEO MACHINE VERSION
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
  this.originStep = 0;    // the number of step on which the user started to play the video
}

/*********************************************
GLOBAL VARIABLES
*********************************************/
var videos = [];    // array of video objects
var newData = [];   // array of new data coming from the Arduino
var allVideosPart;  // part object for all video phrases
var knobs = [];     // array of all knob objects

// initializing video objects, with default values, and adding them into an array
for (var i=0; i<16; i++){
  videos.push(new tv(0,5,1, 100, 1));
}
// console.log(videos);

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
  var generalSequence = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0];
  generalPhrase = new p5.Phrase('general', countSteps, generalSequence);
  allVideosPart.addPhrase(generalPhrase);

  for (var i = 0; i<16; i++){
    allVideosPart.addPhrase(new p5.Phrase(i, videoSteps, [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]));
  }

  // console.log(allVideosPart);
  allVideosPart.loop();

}

/*********************************************
PHRASE CALLBACK FUNCTIONS
*********************************************/
function countSteps(time, playbackRate) {
  // 0 , 8 , 16 , 24
  console.log('step: ' + currentStep);

  currectDiv = currentStep + 8;
  currectDiv = '#step' + currectDiv;
  $('.step').css('background-color', '#EDEDF4');
  $(currectDiv).css('background-color', 'rgba(177,15,46,0.8)');
  currentStep = currentStep + 8;

  if (currentStep == 32){
    currentStep = 0;
  }

}

function videoSteps(time, playbackRate) {
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
PARSER: PARSE DATA THAT ARRIVES FROM
ARDUINO, AND APPLY CHANGES IF NEEDED
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

    var vol = (newStatus[17])/100;
    var speed = (100+newStatus[18])/100;
    var cut;

    if (newStatus[19] <= 5) {
      cut = 0;
    }
    else {
      cut = (newStatus[19])/200;
    }

    changeUI(vol, speed, cut);

    // NO CHANGE IN THE STATUS OF THE VIDEO ---> CONTINUE
    if ((newStatus[i] !== 3) && (newStatus[i] === videos[i].status)){
      var vidID = i+1;
      vidID = "#video" + vidID;
      $(vidID).css('border-color', "rgba(177,15,46,0)");
      continue;
    }
    else {

      // getting the relevant phrase
      var phraseIndex = i;
      var updatedPhrase = allVideosPart.getPhrase(phraseIndex);

      if (newStatus[i] === 3){

        if (videos[i].originStep === null) {
          videos[i].originStep = currentStep;
        }

        changeColor(i, 1);
        showKnobs(i);

        videos[i].volume = vol;
        videos[i].cut = cut;
        videos[i].speed = speed;
        videos[i].steps = newStatus[16];
        changeKnobs(i);

        // making the video border blink
        var vidID = i+1;
        vidID = "#video" + vidID;
        if (newStatus[20] === 2) {
          if (($(vidID).css('border-color')) === "rgba(177, 15, 46, 0)"){
            $(vidID).css('border-color', "rgba(255,255,255,0.9)");
          }
          else {
            $(vidID).css('border-color', "rgba(177, 15, 46, 0)");
          }
        }


        // clearing the sequence
        for (var n=0; n<32; n++){
          updatedPhrase.sequence[n] = 0;
        }

        // applying steps changes, if any
        var stepNum = videos[i].originStep;
        for (var m=0; m<videos[i].steps; m++){
          updatedPhrase.sequence[stepNum] = 1;
          console.log('adding step on: ' + stepNum);
          stepNum = stepNum + 8;
          if (stepNum > 31) {
            stepNum = stepNum - 32;
          }
        }

      }

      else if (newStatus[i] === 1) {
        videos[i].status = 1;
        changeColor(i, videos[i].status);
        var vidID = i+1;
        vidID = "#video" + vidID;
        $(vidID).css('border-color', "rgba(177,15,46,0)");
      }

      else if (newStatus[i] === 0) {
        videos[i].status = 0;
        hideKnobs(i);
        changeColor(i, videos[i].status);
        var vidID = i+1;
        vidID = "#video" + vidID;
        $(vidID).css('border-color', "rgba(177,15,46,0)");

        // clearing the sequence
        for (var n=0; n<32; n++){
          updatedPhrase.sequence[n] = 0;
        }

        videos[i].originStep = null;

      }
    } // end of new else
  } // end of for loop
  serial.write(1);
} // end of function


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
  vid.currentTime = vid.duration * videos[vidNum].cut;

  // playing the video
  vid.play();
}

function stopVideo(vidNum){
  var videoElemNum = vidNum + 1;
  var videoId = 'video'+videoElemNum;
  var vid = document.getElementById(videoId);
  // vid.currentTime = 0;
  vid.pause();
}

/*********************************************
KNOBS GRAPHICAL UI FUNCTIONS
*********************************************/
function changeUI(vol, speed, cut) {
  var volPixels = vol*100;
  volPixels = volPixels + "%";
  $('.volume').css('width', volPixels);

  var cutPixels = cut + "%";
  $('.cut').css('width', cutPixels);

  var speedPixels = (speed - 1)*100;
  speedPixels = speedPixels + "%";
  $('.speed').css('width', speedPixels);
}

function changeColor(vidNum, status) {
  var screenArray = $('.video_screen');

  if (status === 0) {
    $(screenArray[vidNum]).css('filter', 'grayscale(100%)');
  }
  else {
    $(screenArray[vidNum]).css('filter', 'grayscale(0%)');
  }

}

function showKnobs(vidNum) {
  vidNum++;
  var knobsID = '#knob_video' + vidNum;
  $(knobsID).css('display', 'inline');
}

function hideKnobs(vidNum) {
  vidNum++;
  var knobsID = '#knob_video' + vidNum;
  $(knobsID).css('display', 'none');

  var vidKnobs = (vidNum-1)*4;
  knobs[vidKnobs].setCell(0,0,false);
  knobs[vidKnobs].setCell(1,0,false);
  knobs[vidKnobs].setCell(2,0,false);
  knobs[vidKnobs].setCell(3,0,false);

}

function changeKnobs(vidNum) {
  var knobNum = vidNum * 4;
  var originStep;
  knobs[knobNum+1].val.value = videos[vidNum].volume;
  knobs[knobNum+1].draw();
  knobs[knobNum+2].val.value = videos[vidNum].speed-1;
  knobs[knobNum+2].draw();
  knobs[knobNum+3].val.value = (videos[vidNum].cut * 2);
  knobs[knobNum+3].draw();


  if (videos[vidNum].originStep === 24) {
    originStep = 0;
  }
  else if (videos[vidNum].originStep === 0) {
    originStep = 1;
  }
  else if (videos[vidNum].originStep === 8) {
    originStep = 2;
  }
  else {
    originStep = 3;
  }

  knobs[knobNum].setCell(0,0,false);
  knobs[knobNum].setCell(1,0,false);
  knobs[knobNum].setCell(2,0,false);
  knobs[knobNum].setCell(3,0,false);

  for (var y=0; y<videos[vidNum].steps; y++){
    knobs[knobNum].setCell(originStep,0,true);
    originStep++;
    if (originStep > 3) {
      originStep = 0;
    }
  }
}

function colorStep(vidNum, stepNum) {
  vidNum++;
  var element = "#vidstep" + vidNum;
  var steps = $(element).children();
  if (stepNum === 32) {
    $(steps[0]).css('background-color', '#B10F2E');
  }
  else if (stepNum === 8) {
    $(stepNum[1]).css('background-color', '#B10F2E');
  }
  else if (stepNum === 16) {
    $(stepNum[2]).css('background-color', '#B10F2E');
  }
  else {
    $(stepNum[3]).css('background-color', '#B10F2E');
  }
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
    $(screenArray[i-1]).append('</div><div class="knobs_video" id="knob_video'+ i +'"></div><video id="video'+ i + '"width="85%" heigh="85%"><source src="' + url + '" type="video/mp4"></video></div>');
    var knobsID = "knob_video" + i;

    var settings0 = {
      'parent': knobsID,
      'w': '200px',
      'h': '2px',
    };


    var settings1 = {
      'parent': knobsID,
      'w': '200px',
      'h': '8px',
    };

    var settings2 = {
      'parent': knobsID,
      'w': '30px',
      'h': '30px',
    };

    nx.add('matrix', settings1);
    nx.add('dial', settings2);
    nx.add('dial', settings2);
    nx.add('dial', settings2);

  }
  knobs = Object.values(nx.widgets);
  var m = 0;
  for (var x=0; x<16; x++){
    Object.values(nx.widgets)[m].row = 1;
    Object.values(nx.widgets)[m].init();
    m = m + 4;
  }
  nx.colorize('rgba(255,255,255,0.9)');
  nx.colorize('fill', 'rgba(255,255,255,0.2)');
}

$(document).ready(addVideos);
