var mySound, myPhrase, myPart;

var msg = 'click to play';

// function preload() {
//   mySound = loadSound('assets/bd2.wav');
// }

// function preload() {
//   mySound = loadSound('assets/bd.wav');
// }

function setup() {
	createCanvas(200, 200);
	mySound = loadSound("assets/bd2.wav", soundLoaded, soundError, soundLoading);


	// configurations for the PHRASE << new p5.Phrase(name,callback,sequence) >>
	var sequence = [1,3,0,2,0,1,0,0];
	myPhrase = new p5.Phrase('bbox', makeSound, sequence);

	// configurations for the PART
  myPart = new p5.Part();
  myPart.addPhrase(myPhrase);
  myPart.setBPM(60);
}
var bla = 0;
function makeSound(time, playbackRate) {
  mySound.rate(playbackRate);
  mySound.play(time);
	bla++;
	console.log('bla: ' + bla);
	console.log('got it');
}

function draw() {
  background(220);
}

// playing the PART
function mouseClicked() {
		myPart.loop();
    // myPart.start();
  }
// myPart.start();

// debug
function soundError (){
  console.log('there was a problem loading the tune...');
}

function soundLoading (value){
  console.log('loading...');
}

function soundLoaded (value){
	mySound.setVolume(0.1);
	mySound.play();
}
