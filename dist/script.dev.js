"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // var canvas = document.getElementById("myCanvas")
  // var ctx = canvas.getContext("2d")
  var myGamePiece;
  var myObstacles = [];
  var score; // create canvas and game pieces

  function startGame() {
    myGameArea.start();
    myGamePiece = new component(30, 30, "red", 30, 30);
    score = new component("30px", "Consolas", "black", 280, 40, "text"); // myObstacle = new component(250, 10, "green", 0, 250)
  } //object to define the game area


  var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function start() {
      this.canvas.width = 480;
      this.canvas.height = 400; // sets context type of 2d

      this.context = this.canvas.getContext("2d"); // insert the canvas as the first item in the body

      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.frameNo = 0; // update game area 50 times per second (every 20th millisecond)

      this.interval = setInterval(updateGameArea, 20); // create key with keycode as variable if keyboard pressed

      window.addEventListener('keydown', function (e) {
        myGameArea.keys = myGameArea.keys || []; //create empty array if no keys pressed

        myGameArea.keys[e.keyCode] = true; //add keycodes to the array when pressed
      });
      window.addEventListener('keyup', function (e) {
        myGameArea.keys[e.keyCode] = false;
      });
    },
    // function to clear canvas
    clear: function clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function stop() {
      clearInterval(this.interval); //clears the timer set with setInterval() method above
    }
  }; // class to define components

  function component(width, height, color, x, y, type) {
    var _this = this;

    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0.1;
    this.gravitySpeed = 0;

    this.update = function () {
      ctx = myGameArea.context; // this is the 2D rendering context, tool used to paint on canvas

      if (_this.type == "text") {
        ctx.font = _this.width + " " + _this.height;
        ctx.fillStyle = color;
        ctx.fillText(_this.text, _this.x, _this.y);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(_this.x, _this.y, _this.width, _this.height); // draws a rectangle filled with above style
      }
    }; // move the component by number of pixels defined in speed variables, this is done each interval


    this.newPos = function () {
      this.gravitySpeed += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY + this.gravitySpeed;
      this.hitBottom();
    };

    this.hitBottom = function () {
      var rockbottom = myGameArea.canvas.height - this.height;

      if (this.y > rockbottom) {
        this.y = rockbottom;
      }
    }; // function that determines if the objects overlap


    this.crashWith = function (otherobj) {
      var myleft = this.x;
      var myright = this.x + this.width;
      var mytop = this.y;
      var mybottom = this.y + this.height;
      var otherleft = otherobj.x;
      var otherright = otherobj.x + otherobj.width;
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + otherobj.height;
      var crash = false; // always true, unless there is no overlap

      if (mybottom > othertop && myright > otherleft && myleft < otherright && mytop < otherbottom) {
        // || (mytop > otherbottom) || (myleft > otherright) || (myright < otherleft)
        crash = true;
      }

      return crash;
    };

    this.touchLeft = function (otherobj) {
      var myleft = this.x;
      var myright = this.x + this.width;
      var mytop = this.y;
      var mybottom = this.y + this.height;
      var otherleft = otherobj.x;
      var otherright = otherobj.x + otherobj.width;
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + otherobj.height;
      var touch = false;

      if (mybottom > othertop && myright > otherleft && myleft < otherleft - myGamePiece.width + 4 && mytop < otherbottom) {
        touch = true;
      }

      return touch;
    };

    this.touchRight = function (otherobj) {
      var myleft = this.x;
      var myright = this.x + this.width;
      var mytop = this.y;
      var mybottom = this.y + this.height;
      var otherleft = otherobj.x;
      var otherright = otherobj.x + otherobj.width;
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + otherobj.height;
      var touch = false;

      if (mybottom > othertop && myright - myGamePiece.width + 4 > otherright && myleft < otherright && mytop < otherbottom) {
        touch = true;
      }

      return touch;
    };
  } // function to clear and update game area


  function updateGameArea() {
    var y, width, gap, minWidth, maxWidth, minGap, maxGap;
    var counter = 0;
    myGameArea.clear();
    myGameArea.frameNo += 1;

    if (myGameArea.frameNo == 1 || everyInterval(150)) {
      y = myGameArea.canvas.height; // bottom of the screen

      x = myGameArea.canvas.width;
      minWidth = 20;
      maxWidth = 450; // min width + max width still allows object to go through the gap

      width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth); // randomly generated width in the range

      minGap = 50;
      maxGap = 150;
      gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap); // randomly generated gap in the range

      myObstacles.push(new component(width, 10, "green", 0, y)); // creat obstacle of height 10 and randomly generated width in the bottom left

      myObstacles.push(new component(x - width - gap, 10, "green", width + gap, y)); // create corresponding obstacle width equal to width of screen-width object1 - width gap
    }

    myGamePiece.speedX = 0; // reset speeds to zero, therefore object stops if button press stops

    myGamePiece.speedY = 0;

    for (i = 0; i < myObstacles.length; i++) {
      if (myGamePiece.touchLeft(myObstacles[i])) {
        myGamePiece.speedX = 0;
        myGamePiece.x = myObstacles[i].x - myGamePiece.width;
      } else if (myGamePiece.touchRight(myObstacles[i])) {
        console.log("true");
        myGamePiece.speedX = 0;
        myGamePiece.x = myObstacles[i].x + myObstacles[i].width;
      } else if (myGamePiece.crashWith(myObstacles[i])) {
        myGamePiece.gravitySpeed = 0; // myGamePiece.speedY = -0.5

        myGamePiece.y = myObstacles[i].y - myGamePiece.height; // myGamePiece.update()
      }

      if (myGamePiece.y > myObstacles[i].y) {
        counter += 0.5;
      }
    }

    if (myGameArea.keys && myGameArea.keys[37]) {
      // update speeds according to key press
      myGamePiece.speedX = -3;
    }

    if (myGameArea.keys && myGameArea.keys[39]) {
      myGamePiece.speedX = 3;
    }

    for (i = 0; i < myObstacles.length; i++) {
      myObstacles[i].y += -0.5;
      myObstacles[i].update();
    }

    score.text = "SCORE: " + counter;
    score.update();
    myGamePiece.newPos();
    myGamePiece.update();
  } // allow buttons to control motion


  var moveLeft = function moveLeft() {
    myGamePiece.speedX -= 1;
  };

  var moveRight = function moveRight() {
    myGamePiece.speedX += 1;
  };

  var stopMove = function stopMove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
  };

  var left = document.querySelector("#left");
  left.addEventListener("mousedown", function () {
    moveLeft();
  });
  left.addEventListener("mouseup", function () {
    stopMove();
  });
  var right = document.querySelector("#right");
  right.addEventListener("mousedown", function () {
    moveRight();
  });
  right.addEventListener("mouseup", function () {
    stopMove();
  }); // function to return true every time the interval is met

  function everyInterval(n) {
    if (myGameArea.frameNo / n % 1 == 0) {
      return true;
    }

    return false;
  }

  startGame();
});