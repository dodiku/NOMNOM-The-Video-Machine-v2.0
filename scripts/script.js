/***********************************************************************
this is the code for the VIDEO MACHINE:
mid-term itp project by Mint Woraya Boonyapanachoti & Dror Ayalon
***********************************************************************/

// serial communication variables
var serial;
var portName = '/dev/cu.usbmodemFA131';

// video object
function tv(status, loop, speed, cut, vol) {
  this.status = status;
  this.loop = loop;
  this.speed = speed;
  this.cut = cut;
  this.volume = vol;
}

// global array of video objects
var videos = [];

// global array for new data
var newData = [];

// initializing video objects and adding them into an array
for (var i=0; i<16; i++){
  videos.push(new tv(0,5,1, 100, 1));
}
console.log(videos);

// starting serial communication
function setup() {
  noCanvas();
  serial = new p5.SerialPort();
  serial.on('connected', serverConnected);
  serial.on('open', portOpen);
  serial.on('data', serialEvent);
  serial.on('error', serialError);
  serial.list();
  serial.open(portName);
}

// currently not in use
function draw(){
}

function serverConnected(){
  console.log('server is connected :)))');
}

function portOpen(){
  console.log('port was opened :))))');
}

function serialError(){
  console.log('darn! we got an error :((((');
}

function serialEvent(){
  var newData = serial.readStringUntil('\r\n');
  // console.log(newData);
  if (newData.length > 0) {
    if (newData === 'hello'){
      serial.write(1);
    }
    else{
      parseData(newData);
      // playVideo(newData);
    }
  }
}

function parseData(data){
  // parsing the data by ','
  var newStatus = data.split(",");
  // var closeLed = 20;

  // turning strings into integers
  for (var x=0; x<newStatus.length; x++){
    newStatus[x] = parseInt(newStatus[x]);
  }
  console.log(newStatus);

  // going over all videos to check out if there was a change in video.status
  for (var i=0; i<16; i++){
    if (newStatus[i] ===  videos[i].status){
      continue;
    }
    else {
      videos[i].status = newStatus[i];
      videos[i].speed = (100+newStatus[16])/100;
      videos[i].volume = (newStatus[17])/100;
      // videos[i].loop = newStatus[17]; // currently we do not support loop configurations
      videos[i].cut = (100-newStatus[18])/100;   // currently we do not support cutting configurations
      // var videoNum = i+1;
      // var videoId = 'video'+videoNum;
      // var vid = document.getElementById(videoId);
      if (newStatus[i] === 1){
        // vid.currentTime = 0;
        // vid.playbackRate = videos[i].speed;
        // vid.volume = videos[i].volume;
        // var cut = 1*videoStatus[16]/100;
        // vid.currentTime = cut;
        // vid.loop = true;
        // vid.play();
        playVideo(i);
      }
      if (newStatus[i] === 0){
        // vid.currentTime = 0;
        // vid.loop = false;
        // vid.pause();
        stopVideo(i);
        closeLed = i;
      }
    }
  }
  serial.write(1);
}

function playVideo(vidNum){
  var videoElemNum = vidNum+1;
  var videoId = 'video'+videoElemNum;
  var vid = document.getElementById(videoId);
  // var vidObj = videos[vidNum];
  vid.currentTime = vid.duration * videos[vidNum].cut;
  vid.playbackRate = videos[vidNum].speed;
  vid.volume = videos[vidNum].volume;
  if (videos[vidNum].loop === 5){
    // vid.loop = true;
    vid.play();
    vid.onended=function(){
      // videos[vidNum].loop = videos[vidNum].loop - 1;
      playVideo(vidNum);
    };

  }
  else if (videos[vidNum].loop === 0) {
    stopVideo(vidNum);
    serial.write(vidNum);
  }
  else {
    vid.play();
    vid.onended=function(){
      // videos[vidNum].loop = videos[vidNum].loop - 1;
      playVideo(vidNum);
    };
  }

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



// appending video files to the page
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
