// HTML Elemets used
const paddle1 = document.getElementById("left");
const paddle2 = document.getElementById("right");
const ball = document.getElementById("ball");
const scoreleft = document.getElementById("scoreleft");
const scoreright = document.getElementById("scoreright");
const gameArea = document.getElementById("gameArea");
const winnerBox = document.getElementById("winnerBox");
const winnerMsg = document.getElementById("winnerMsg");
const replayBtn = document.getElementById("replay");

// Ball variables 
const speed = 6;
const speedIncr = 6;

let ballSpeedX = speed;
let ballSpeedY = speed;
let ballX = gameArea.clientWidth / 2;
let ballY = gameArea.clientHeight / 2;

// Scores
let scoreL = 0;
let scoreR = 0;

// Paddles variables 
let paddle1Y = paddle1.offsetTop;
let paddle2Y = paddle2.offsetTop;
const paddleSpeed = 12;

// Used to test bottom colision
const limitY = gameArea.clientHeight - ball.clientHeight;

// Used to detect paddle movements
let paddle1Up = false;
let paddle1Down = false;

let paddle2Up = false;
let paddle2Down = false;

// MAX score points
const MAX_SCORE = 2;

// SFX (Sound effects)
const paddle = new Audio('../assets/paddle-sfx.mp3');
const wall = new Audio('../assets/wall-sfx.mp3');
const score = new Audio('../assets/score-sfx.mp3');

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
    case 'z':
      paddle1Up = true;
      break;
    case 's':
      paddle1Down = true;
      break;
    case 'ArrowUp':
      paddle2Up = true;
      break;
    case 'ArrowDown':
      paddle2Down = true;
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'z':
      paddle1Up = false;
      break;
    case 's':
      paddle1Down = false;
      break;
    case 'ArrowUp':
      paddle2Up = false;
      break;
    case 'ArrowDown':
      paddle2Down = false;
      break;
  }
});

function ResetBall() {
  ballX = gameArea.clientWidth / 2;
  ballY = gameArea.clientHeight / 2;

  // random angle between -45deg and 45deg
  const initialAngle = (Math.random() * Math.PI / 2) - (Math.PI / 4);
  // calculate horizontal speed of the ball
  ballSpeedX = speed * Math.cos(initialAngle);
  // calculate vertical speed of the ball 
  ballSpeedY = speed * Math.sin(initialAngle);

  // make first throw direction random
  const dir = Math.floor(Math.random() * 2);
  if (dir === 1) {
    ballSpeedX = -ballSpeedX;
  }
}

function CalculateBounceAngle(ballY, paddleY, paddleHeight) {
  // distance between center of paddle and center of ball
  // positive if ball below center
  // negative if ball above center
  const relativeIntersectY = (paddleY + (paddleHeight / 2)) - ballY;
  // normalizes the value of relativeIntersectY to a value
  // between -1 and 1 (negative if nearer to top and 1 to bottom)
  // normalization is required because sin/cos produce outcomes
  // for -1 to 1 value of theta
  const normalizedRelativeIntersectionY = (relativeIntersectY / (paddleHeight / 2));
  console.log(normalizedRelativeIntersectionY);
  // angle between -45deg and 45deg depending on
  // normalizedRelativeIntersectionY
  const bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4;
  console.log(bounceAngle);
  return bounceAngle;
}

function DisplayWinnerBox(player) {
  let winner = '';
  switch (player) {
    case "RED":
      winner = 'RED';
      winnerBox.setAttribute("class", 'winnerMessageRed');
      replayBtn.setAttribute('class', 'replayRed');
      break;
    case "BLUE":
      winner = 'BLUE';
      winnerBox.setAttribute("class", 'winnerMessageBlue');
      replayBtn.setAttribute('class', 'replayBlue');
      break;
  }
  winnerMsg.innerText = "PLAYER " + winner + " WINS";
  winnerBox.style.display = "block";
  PauseGame();

  // function removes itself after one usage 
  // to ensure it cannot be called during game
  function handleKeyDown(e) {
    switch (e.key) {
      case ' ':
        console.log("hello space");
        replayBtn.click();
        // removes the event listener after usage
        document.removeEventListener('keydown', handleKeyDown);
        break;
    }
  }
  document.addEventListener('keydown', handleKeyDown);
}

function PauseGame() {
  ballSpeedX = 0;
  ballSpeedY = 0;
}

function ResetGame() {
  scoreL = 0;
  scoreR = 0;
  ResetBall();
  // set score to default value when restarting game 
  scoreleft.innerText = 0;
  scoreright.innerText = 0;
}

replayBtn.onclick = () => {
  ResetGame();
  winnerBox.style.display = "none";
};

scoreleft.innerText = 0;
scoreright.innerText = 0;

function update() {
  // update ball speed
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // test ball top collision
  if (ballY <= 0) {
    ballY = 0; // Adjust position to the limit
    ballSpeedY = -ballSpeedY; // Reverse direction
    wall.play(); // plays wall sfx
  }

  // test ball bottom collision
  if (ballY >= limitY) {
    ballY = limitY;
    ballSpeedY = -ballSpeedY;
    wall.play();
  }

  // check if any player has won
  if (scoreR === MAX_SCORE) {
    DisplayWinnerBox("BLUE");
  } else if (scoreL === MAX_SCORE) {
    DisplayWinnerBox("RED");
  }

  // add point to player left
  if (ballX >= gameArea.clientWidth - ball.clientWidth) {
    scoreL++;
    scoreleft.innerText = scoreL;
    score.play();
    ResetBall();
  }

  // add point to player right
  if (ballX <= 0) {
    scoreR++;
    scoreright.innerText = scoreR;
    score.play();
    ResetBall();
  }

  // Ball collision with left paddle 
  if (
    // test if ball touch paddle (horizontal overlap) 
    ballX <= paddle1.offsetLeft + paddle1.clientWidth &&
    // test if ball went past paddle (horizontal overlap) 
    ballX + ball.clientWidth >= paddle1.offsetLeft &&
    // test if ball is within range of paddle (bottom edge)
    ballY + ball.clientHeight >= paddle1.offsetTop &&
    // test if ball is within range of paddle (top edge)
    ballY <= paddle1.offsetTop + paddle1.clientHeight
  ) {
    // ball center, 
    const bounceAngle = CalculateBounceAngle(ballY + ball.clientHeight / 2, paddle1.offsetTop, paddle1.clientHeight);
    // calculate horizontal movement
    ballSpeedX = speed * Math.cos(bounceAngle);
    // calculate vertical movement
    ballSpeedY = speed * -Math.sin(bounceAngle);
    // increment speed depending on direction
    ballSpeedX += (ballSpeedX > 0 ? speedIncr : -speedIncr);
    ballSpeedY += (ballSpeedY > 0 ? speedIncr : -speedIncr);
    // Adjust position to avoid sticking
    ballX = paddle1.offsetLeft + paddle1.clientWidth;
    // play paddle hitting sound
    paddle.play();
  }

  // Ball collision with right paddle
  if (
    ballX + ball.clientWidth >= paddle2.offsetLeft &&
    ballX <= paddle2.offsetLeft + paddle2.clientWidth &&
    ballY + ball.clientHeight >= paddle2.offsetTop &&
    ballY <= paddle2.offsetTop + paddle2.clientHeight
  ) {
    const bounceAngle = CalculateBounceAngle(ballY + ball.clientHeight / 2, paddle2.offsetTop, paddle2.clientHeight);
    ballSpeedX = -speed * Math.cos(bounceAngle);
    ballSpeedY = speed * -Math.sin(bounceAngle);
    ballSpeedX += (ballSpeedX > 0 ? speedIncr : -speedIncr);
    ballSpeedY += (ballSpeedY > 0 ? speedIncr : -speedIncr);
    ballX = paddle2.offsetLeft - ball.clientWidth;
    paddle.play();
  }

  // update ball coordinates
  ball.style.left = ballX + 'px';
  ball.style.top = ballY + 'px';

  // logic for paddle movement 
  if (paddle1Up) {
    // test if paddle go below 0
    paddle1Y = Math.max(paddle1Y - paddleSpeed, 0);
  }
  if (paddle1Down) {
    // test if paddle go beyond game height
    paddle1Y = Math.min(paddle1Y + paddleSpeed, gameArea.clientHeight - paddle1.clientHeight);
  }
  // update paddle movement accordingly
  paddle1.style.top = paddle1Y + "px";

  if (paddle2Up) {
    paddle2Y = Math.max(paddle2Y - paddleSpeed, 0);
  }
  if (paddle2Down) {
    paddle2Y = Math.min(paddle2Y + paddleSpeed, gameArea.clientHeight - paddle2.clientHeight);
  }
  paddle2.style.top = paddle2Y + "px";

  requestAnimationFrame(update);
}

requestAnimationFrame(update);
