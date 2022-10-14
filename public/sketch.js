
// JL: Choose a different URL depending on the host
const SOCKET_SERVER_URL = 'http://localhost:5500';
// const SOCKET_SERVER_URL = 'https://crazy-monkey.glitch.me';

//pop-up message 
// alert("hit spacebar for a souvenir");


//variables 
var leftBuffer;
var rightBuffer;

var socket;

let faceapi;
let detections = [];

let video;
let canvas;

let c; //colour 
let c1;
let c2;
let cRe;
let strokeW = 5; //stroke weight

let index;

// var colorarr = ['#6369d1','#B88E8D','#34435E','#6369d1','#B88E8D','#34435E','#6369d1','#B88E8D','#34435E'];
var colorarr = ['orange', 'yellow', 'blue', 'green', 'grey', 'purple', 'magenta'];

// GUI variables
var gui_lock = 0;
var visible = true;
var gui_controls;
// var BackgroundColor;
// var BackgroundColor = '#9cd7d8';

var Restart = false;

var socket = io();

function setup() {
  // 800 x 400 (double width to make room for each "sub-canvas")
  createCanvas(windowWidth, windowHeight);
  // background(BackgroundColor);

  video = createCapture(VIDEO);
  video.size(200, 200);
  video.position(0, 0);
  video.hide();

  // Create both of your off-screen graphics buffers
  leftBuffer = createGraphics(200, 200);
  rightBuffer = createGraphics(windowWidth - 200, windowHeight);

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  //Initialize faceapi model
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  //sending using socket.io
  socket = io.connect(SOCKET_SERVER_URL);
  socket.on('mouse', newDrawing);

  c1 = color('#DFA6CE');
  c2 = color('#FBD32B');

  for (let y = 0; y < height; y++) {
    n = map(y, 0, height, 0, 1);
    let newc = lerpColor(c1, c2, n);
    stroke(newc);
    line(0, y, width, y);
  }

  // //create GUI on or off (0 or 1)
  // if (gui_lock == 0){
  //   // Create Layout GUI
  // gui_controls = createGui('Draw with your Emotions').setPosition(windowWidth-220,windowHeight-220);

  // //p5.gui.js automatically identifies the type of UI element based on variable value. so we simply add them to our GUI.
  // gui_controls.addGlobals('Restart'); // Adding UI elements

  // gui_lock++;
  // }  
}

function draw() {
  // Draw on your buffers however you like
  drawLeftBuffer();
  drawRightBuffer();
  // Paint the off-screen buffers onto the main canvas
  image(leftBuffer, 0, 0);
  image(rightBuffer, 400, 0);

}

function drawLeftBuffer() {
  // leftBuffer.background(255,255,255);
  leftBuffer.fill(0, 0, 0); //fill for text
  leftBuffer.textSize(32);
  // leftBuffer.text("This is the left buffer!", 50, 50);
}

function drawRightBuffer() {
  // rightBuffer.background(255, 100, 255);
  rightBuffer.fill(0, 0, 0); //fill for text
  rightBuffer.textSize(32);
  // rightBuffer.text("This is the right buffer!", 50, 50);
}


//face api 

function faceReady() {
  faceapi.detect(gotFaces);// detecting faces
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections
  console.log(detections);

  //   clear();//clear each frame
  fill(c1);
  stroke(c1);
  rect(0, 0, 200, 200); //clearing frame

  drawLandmarks(detections);//// Draw all the face points
  drawExpressions(detections, 1, 58, 59);//Draw face expression

  faceapi.detect(gotFaces);// Call the function again at here

}


function drawLandmarks(detections) {
  if (detections.length > 0) {//If at least 1 face is detected
    for (f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(1, 58, 59); //grey frame
        strokeWeight(3);
        point(points[i]._x, points[i]._y);
      }
    }
  }
}

function drawExpressions(detections, x, y, textYSpace) {
  if (detections.length > 0) {//If at least 1 face is detected
    let { neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[0].expressions;

    textFont('Helvetica');
    textSize(15);
    noStroke();
    fill(1, 58, 59);

    maxExpression = Math.max(neutral, happy, angry, sad, disgusted, surprised, fearful);
    console.log("max :" + maxExpression);
    switch (maxExpression) {
      case neutral:
        // c = 'black';
        strokeW = 10;

        text("neutral:" + nf(neutral * 100, 2, 2) + "%", x + 10, y);

        console.log("max exp. is neutral");
        break;
      case happy:
        // c = 'orange';
        strokeW = 40;

        text("happiness:" + nf(happy * 100, 2, 2) + "%", x + 10, y);
        console.log("max exp. is happy");
        break;
      case angry:
        // c = 'red';
        strokeW = 100;

        text("anger:" + nf(angry * 100, 2, 2) + "%", x + 10, y);
        console.log("max exp. is angry");
        break;
      case sad:
        // c = 'grey';
        strokeW = 2;

        text("sad:" + nf(sad * 100, 2, 2) + "%", x + 10, y);
        console.log("max exp. is sad");
        break;
      case surprised:
        // c = 'yellow';
        strokeW = 60;

        text("surprised:" + nf(surprised * 100, 2, 2) + "%", x + 10, y);
        console.log("max exp. is surprised");
        break;
    }

  } else {//If no faces is detected
    text("neutral: ", x, y);
    // text("happiness: ", x, y + textYSpace);
    // text("anger: ", x, y + textYSpace*2);
    // text("sad: ", x, y + textYSpace*3);
    // text("disgusted: ", x, y + textYSpace*4);
    // text("surprised: ", x, y + textYSpace*5);
    // text("fear: ", x, y + textYSpace*6);

  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//DRAWING

//receive drawing from other user


function mouseDragged() {
  console.log('Sending: ' + mouseX + ',' + mouseY);

  var data = {
    x: mouseX,
    y: mouseY,
    px: pmouseX,
    py: pmouseY,
    user: socket.id
  }

  socket.emit('mouse', data);

  stroke('#000000');
  strokeWeight(strokeW);
  if (mouseIsPressed === true) {
    // ellipse(mouseX,mouseY,30,30);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

// //reset
// if (Restart==true){
//   setup();
// }

//UTILITIES

//save drawing
function keyPressed() {
  if (key == ' ') { //this means space bar, since it is a space inside of the single quotes 
    save('OurDrawing.png');
    return false;
  }
}