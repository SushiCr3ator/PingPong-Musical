/*
-PingPong HandPong musical-
Author: Andreaz Kurt Prado, Carlos Wambui Mwangi
Experimentelles Gestalung Semester Abgabe

Describtion: Principles of Ping Pong with the use of our hands and rythmic melodies

Libraries implemented: P5.js, Ml5.js, Matter.js
Other files: 
  - './particles.js'
  - './snowParticles.js'
*/
//for particles
let systems =[];
let snowflakes = [];

//for staticBalls
let fix = [];
const options = { isStatic: true };

let connections;//handskeleton
let video, rad, prevPos;
let fixCooldown = 0;//for fixBalls
let ballColour;

//matter.js preloads:
const { Engine, World, Bodies, Body } = Matter;

let engine, world;
let ball;
let walls = [];
let handBodies = [];

let hands = [];//for keypoints of the hands to be saved

//loads AI to scan hands
function preload() {
  handPose = ml5.handPose();
  
  //to access soundfiles
  soundFormats('mp3', 'ogg');
  pongSound = loadSound("./assets/pongSound.mp3");
  //music = loadSound("./assets/music.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  ballColour = color(255, 0, 0);
  //music.loop();
  rad = 60;

  //for snow particles
  for (let i = 0; i < 300; i++) {
    snowflakes.push(new Snowflake());
  }
  
  //creates engine for matter.js
  engine = Engine.create();
  world = engine.world;

  //start webcam
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide(); //hide the HTML element if you want to draw it manually ( if not we have 2 intances)
  
  //starts webcam to detect hands
  handPose.detectStart(video, _gotHands);
  connections = handPose.getConnections();

  //ball.
  ball = Bodies.circle(windowWidth/2, windowHeight/2, rad, { restitution: 0.9 });
  World.add(world, ball);

  //walls.
  //walls.push(Bodies.rectangle(windowWidth/2, -10, windowWidth, 20, options)); //top
  walls.push(Bodies.rectangle(windowWidth/2, windowHeight+30, windowWidth, 20, options)); //bottom
  walls.push(Bodies.rectangle(-10, windowHeight/2, 20, windowHeight, options)); //left
  walls.push(Bodies.rectangle(windowWidth+10, windowHeight/2, 20, windowHeight, options)); //right
  World.add(world, walls);

  /*
  //no gravity
  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0; */

  _ballCreation(windowWidth/2, windowHeight/2);
  
  //for particles to trail
  //prevPos = createVector(ball.position.x, ball.position.y);
}

function _ballCreation(locX, locY){
  if(ball) World.remove(world,ball);
  ball = Bodies.circle(locX, locY, rad, { restitution: 0.9 });
  World.add(world, ball);
}

// output data for hands
function _gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}

//not used
/*function _handchecking(pointX,pointY){//need to check
  tempVector = createVector(pointX,pointY);
  if(currPos.dist(tempVector) >= 0 ){
    acc = p5.Vector.random2D().mult(random(1, 3));
  }
}*/

function _updateParticle(){
  for (let i = systems.length - 1; i >= 0; i--) {
    systems[i].run();

    //delete instance of system if finished
    if (systems[i].isDead()) {
      systems.splice(i, 1);
    }
  }
}

//------------------------------gestures-----------------------------------

function _gesture(p1,p2) {
  let thumpTip =p1;
  let pinkyTip = p2;

  if(!thumpTip || !pinkyTip) return;
  
  let d = dist(thumpTip.x, thumpTip.y, pinkyTip.x, pinkyTip.y);
  if(d < 20){
    _fixBalls(thumpTip.x, thumpTip.y);
  }
}

//fixed ball walls
function _fixBalls(posiX, posiY) {
  if (fixCooldown > 0) return;
  const ballf = Bodies.circle(posiX, posiY, rad, options);

  fix.push(ballf);
  World.add(world, ballf);

  //checks if more than 3 then it will change the oldest with the newest
  if (fix.length > 4) {
    const oldBall = fix.shift();
    World.remove(world, oldBall);
  }

  fixCooldown = 20;
}


function draw() {
  //draw the webcam inputs to the canvas
  //image(video, 0, 0, windowWidth, windowHeight);

  //updates engine
  //Engine.update(engine, 1000 / 120);// force a 120fps

  //realtime updating for the matter.js & a realtime timers -ish
  Engine.update(engine, deltaTime);
  if (fixCooldown > 0) fixCooldown--;

  background(0);

  //playable ball
  noFill();
  strokeWeight(5);
  stroke(ballColour);
  ellipse(ball.position.x, ball.position.y, rad * 2);

  //fixed ball
  noStroke();
  fill(255);
  for (let i = 0; i < fix.length; i++) {
    let b = fix[i];
    ellipse(b.position.x, b.position.y, rad * 2);
  }

  //snowUpdates
  for (let flake of snowflakes) {// (let flake = 0; flake < snowflakes; flake++)
    flake.update(frameCount / 60);
    flake.display();
  }

  //---------particles----------------
  /*
  //see if its moving
  let ballPos = createVector(ball.position.x, ball.position.y);

  let movement = p5.Vector.sub(ballPos, prevPos);
  let distance = movement.mag();
  //if moving create particles
  if (distance > 0.1) {
    let steps = floor(distance / 2); //how many particles along path
    for (let i = 0; i < steps; i++) {
      let pos = p5.Vector.add(prevPos, movement.copy().mult(i / steps));//pos where it will be created
      systems.push(new ParticleSystem(pos.x, pos.y, 1, 255, 0, 0));
    }
    prevPos = ballPos.copy();
  }
  _updateParticle();*/
  //---------------------------------
  
  //ball creation
  if(ball.position.y > windowHeight){
    _ballCreation(windowWidth/2, windowHeight/2);
  }

  //creates rigidBodies to "match hands"
  while (handBodies.length < hands.length) {
  handBodies.push([]);
  }
  //saves all points of hand and hand itself
  for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let handsArr = handBodies[i];
    
    // Ensure handsArr matches connections
    while (handsArr.length < connections.length) {
      handsArr.push(null);
    }
    
    for (let j = 0; j < connections.length; j++) {
      //saves data for handskeleton
      let pointA = hand.keypoints[connections[j][0]];
      let pointB = hand.keypoints[connections[j][1]];

      let dx = pointB.x - pointA.x;
      let dy = pointB.y - pointA.y;
      let length = dist(pointA.x, pointA.y, pointB.x, pointB.y);
      let angle = atan2(dy, dx);

      //creates a rigidfinger
      if(!handsArr[j]){
        let rectBody = Bodies.rectangle(
          (pointA.x + pointB.x)/2,
          (pointA.y + pointB.y)/2,
          length,
          15,
          { isStatic: true, angle: angle }
        );
        //updates it into world 
        World.add(world, rectBody);
        handsArr[j] = rectBody;
      }else{
        //Update existing body
        Body.setPosition(handsArr[j], { 
          x: (pointA.x + pointB.x)/2, 
          y: (pointA.y + pointB.y)/2 
        });
        Body.setAngle(handsArr[j], angle);
      }
      
      //check collision with ball and update velocity
      let handBody = handsArr[j];
      let distToBall = dist(ball.position.x, ball.position.y, handBody.position.x, handBody.position.y);
      if (distToBall < rad + 10) { // 10 = half thickness of hand body
        let pushAngle = atan2(ball.position.y - handBody.position.y, ball.position.x - handBody.position.x);
        let currentSpeed = Math.hypot(ball.velocity.x, ball.velocity.y);
        let newSpeed = currentSpeed + 4; // increase speed after hit
        Body.setVelocity(ball, {
          x: Math.cos(pushAngle) * newSpeed,
          y: Math.sin(pushAngle) * newSpeed
        });
        ballColour = color(random(50, 256), random(50, 256), random(50, 256)); //changes colour
        systems.push(new ParticleSystem(ball.position.x, ball.position.y, 4, 255, 255, 255)); //pushes particles
      }
    }
    // save updated array
    handBodies[i] = handsArr;
  }
  _updateParticle();

  //wall sounds
  if (
      ball.position.x > windowWidth - rad || ball.position.x < rad || 
      ball.position.y > windowHeight - rad || ball.position.y < rad
    ){
    pongSound.play();
    pongSound.playMode('restart');
  }

  // draw hands and keypoints
  push();
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < connections.length; j++) {
      let pointA = hand.keypoints[connections[j][0]];
      let pointB = hand.keypoints[connections[j][1]];
      line(pointA.x, pointA.y, pointB.x, pointB.y);
    }

    for (let k = 0; k < hand.keypoints.length; k++) {
      let keypoint = hand.keypoints[k];
       circle(keypoint.x, keypoint.y, 5);
      _gesture(hand.keypoints[4], hand.keypoints[12]);
    }
  }
  pop();

  
}