"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var myGamePiece;
  var myObstacles = [];
  var score;
  var backgroundMusic;
  var menuMusic;
  var levelUp;
  var gameOver;
  var gravity = 1;
  var ballSpeed = 8;
  var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  var highScore = 0;
  var gameTitle;
  var highestScore;
  var info;
  var isMenuScreen; // create canvas and game pieces

  function startGame() {
    document.querySelector("#game-canvas").classList.remove("dark");
    document.querySelector(".side--right").classList.add("dark");
    document.querySelector(".side--left").classList.add("dark");
    isMenuScreen = false;
    myGamePiece = new component(30, 30, "#FFFF00", 30, 30, "circle");
    score = new component("20px", "Consolas", "white", 360, 40, "text");
    backgroundMusic = new sound("music/game-music.mp3");
    levelUp = new sound("music/level-up.mp3");
    gameOver = new sound("music/game-over.mp3"); // menuMusic.stop()

    backgroundMusic.play();
    myGameArea.start();
  }

  function menuScreen() {
    isMenuScreen = true;
    menuMusic = new sound("music/start-screen.mp3");
    menuMusic.play();
    gameTitle = new component("60px", "Warnes", "white", 65, 170, "text");
    highestScore = new component("20px", "Consolas", "white", 150, 220, "text");
    info = new component("20px", "Consolas", "white", 120, 370, "text");
    myMenu.start();
  }

  function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);

    this.play = function () {
      this.sound.play();
    };

    this.stop = function () {
      this.sound.pause();
    };
  }

  var myMenu = {
    canvas: document.querySelector("#game-canvas"),
    start: function start() {
      this.canvas.width = 480;
      this.canvas.height = 0.8 * vh;
      this.context = this.canvas.getContext("2d"); // sets context type of 2d

      this.frameNo = 0;
      this.interval = setInterval(updateMenu, 20); // update game area 50 times per second (every 20th millisecond)
      // create key with keycode as variable if keyboard pressed

      window.addEventListener('keydown', function (e) {
        myMenu.keys = true; //create empty array if no keys pressed
        // myMenu.keys[e.keyCode] = true //add keycodes to the array when respective key pressed
      });
    },
    // function to clear canvas
    clear: function clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function stop() {
      clearInterval(this.interval); //clears the timer set with setInterval() method above
    }
  }; //object to define the gameplay area

  var myGameArea = {
    canvas: document.querySelector("#game-canvas"),
    start: function start() {
      this.canvas.width = 480;
      this.canvas.height = 0.8 * vh;
      this.context = this.canvas.getContext("2d"); // sets context type of 2d

      this.frameNo = 0;
      this.interval = setInterval(updateGameArea, 20); // update game area 50 times per second (every 20th millisecond)
      // create key with keycode as variable if keyboard pressed

      window.addEventListener('keydown', function (e) {
        myGameArea.keys = myGameArea.keys || []; //create empty array if no keys pressed

        myGameArea.keys[e.keyCode] = true; //add keycodes to the array when respective key pressed
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

    //
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = gravity;
    this.gravitySpeed = 0;

    this.update = function () {
      ctx = isMenuScreen ? myMenu.context : myGameArea.context; // this is the 2D rendering context, tool used to paint on canvas

      if (_this.type == "text") {
        ctx.font = _this.width + " " + _this.height;
        ctx.fillStyle = color;
        ctx.fillText(_this.text, _this.x, _this.y);
      } else if (_this.type == "circle") {
        ctx.beginPath();
        ctx.arc(_this.x + _this.width / 2, _this.y + _this.height / 2, _this.width / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
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
      this.crossRight();
      this.crossLeft();
    }; //stop the ball if it touches the bottom


    this.hitBottom = function () {
      var rockbottom = myGameArea.canvas.height - this.height;

      if (this.y > rockbottom) {
        this.y = rockbottom;
      }
    }; //make the ball come back onto the other side


    this.crossRight = function () {
      if (this.x > myGameArea.canvas.width) {
        this.x = ballSpeed + 1;
      }
    };

    this.crossLeft = function () {
      if (this.x + this.width < 0) {
        this.x = myGameArea.canvas.width - ballSpeed - 1;
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
    }; // function to check if ball touches left side of an object


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

      if (mybottom > othertop && myright > otherleft && myleft < otherleft - myGamePiece.width + ballSpeed + 1 && mytop < otherbottom) {
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

      if (mybottom > othertop && myright - myGamePiece.width + ballSpeed + 1 > otherright && myleft < otherright && mytop < otherbottom) {
        touch = true;
      }

      return touch;
    };
  }

  function updateMenu() {
    myMenu.clear();
    myMenu.frameNo += 1;

    if (myMenu.frameNo == 1 || everyInterval(80)) {
      y = myMenu.canvas.height; // bottom of the screen

      x = myMenu.canvas.width;
      minWidth = 20;
      maxWidth = 450; // min width + max width still allows object to go through the gap

      width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth); // randomly generated width in the range

      minGap = 50;
      maxGap = 150;
      gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap); // randomly generated gap in the range

      myObstacles.push(new component(width, 10, "#394752b7", 0, y)); // create obstacle of height 10 and randomly generated width in the bottom left

      myObstacles.push(new component(x - width - gap, 10, "#394752b7", width + gap, y)); // create corresponding obstacle width equal to width of screen-width object1 - width gap
    }

    for (i = 0; i < myObstacles.length; i++) {
      myObstacles[i].y += -1.5;
      myObstacles[i].update();
    }

    if (myMenu.keys) {
      // press any key to start game
      console.log("keys work");
      myMenu.stop();
      myMenu.clear();
      menuMusic.stop();
      startGame();
    }

    gameTitle.text = "Down Fall";
    highestScore.text = "High score: ";
    info.text = "Press any key to start";

    if (myMenu.frameNo == 1 || everyInterval(80)) {
      if (info.text = " ") {
        info.text = "Press any key to start";
      } else if (info.text = "Press any key to start") {
        info.text == " ";
      }
    }

    gameTitle.update();
    highestScore.update();
    info.update();
  } // function to clear and draw the game area


  function updateGameArea() {
    var y, width, gap, minWidth, maxWidth, minGap, maxGap;
    var counter = 0;
    var interval, levelColor, levelSpeed;

    if (counter > 49.0) {
      interval = 20;
      levelColor = "00207F";
      levelSpeed = -6;
    } else if (counter > 39.0) {
      interval = 25;
      levelColor = "#02B8A2";
      levelSpeed = -5;
    } else if (counter > 29.0) {
      interval = 30;
      levelColor = "#13CA91";
      levelSpeed = -4;
    } else if (counter > 19.0) {
      interval = 40;
      levelColor = "#01FFD";
      levelSpeed = -3;
    } else if (counter > 9.0) {
      console.log("true");
      interval = 60;
      levelColor = "#FE53BB";
      levelSpeed = -2;
    } else {
      //1.5 80
      interval = 80;
      levelColor = "#09FBD3";
      levelSpeed = -1.5;
    }

    myGameArea.clear();
    myGameArea.frameNo += 1;

    if (myGameArea.frameNo == 1 || everyInterval(interval)) {
      y = myGameArea.canvas.height; // bottom of the screen

      x = myGameArea.canvas.width;
      minWidth = 20;
      maxWidth = 450; // min width + max width still allows object to go through the gap

      width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth); // randomly generated width in the range

      minGap = 50;
      maxGap = 150;
      gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap); // randomly generated gap in the range

      myObstacles.push(new component(width, 10, levelColor, 0, y)); // create obstacle of height 10 and randomly generated width in the bottom left

      myObstacles.push(new component(x - width - gap, 10, levelColor, width + gap, y)); // create corresponding obstacle width equal to width of screen-width object1 - width gap
    }

    myGamePiece.speedX = 0; // reset speeds to zero, therefore object stops if button press stops

    myGamePiece.speedY = 0;

    for (i = 0; i < myObstacles.length; i++) {
      if (myGamePiece.touchLeft(myObstacles[i])) {
        myGamePiece.speedX = 0;
        myGamePiece.x = myObstacles[i].x - myGamePiece.width;
      } else if (myGamePiece.touchRight(myObstacles[i])) {
        myGamePiece.speedX = 0;
        myGamePiece.x = myObstacles[i].x + myObstacles[i].width;
      } else if (myGamePiece.crashWith(myObstacles[i])) {
        myGamePiece.gravitySpeed = 0;
        myGamePiece.y = myObstacles[i].y - myGamePiece.height;
      }

      if (myGamePiece.y > myObstacles[i].y) {
        counter += 0.5;
      }

      if (counter > highScore) {
        highScore = counter;
      }
    }

    if (myGameArea.keys && myGameArea.keys[37]) {
      // update speeds according to key press
      myGamePiece.speedX = -ballSpeed;
    }

    if (myGameArea.keys && myGameArea.keys[39]) {
      myGamePiece.speedX = ballSpeed;
    }

    for (i = 0; i < myObstacles.length; i++) {
      myObstacles[i].y += levelSpeed;
      myObstacles[i].update();
    } // function to end game


    if (myGamePiece.y < 0) {
      backgroundMusic.stop();
      gameOver.play();
      myGameArea.stop();
      document.querySelector("#game-canvas").classList.add("dark");
      document.querySelector(".side--right").classList.remove("dark");
      document.querySelector(".side--left").classList.remove("dark");
    }

    if (counter != 0 && counter % 10 == 0) {
      levelUp.play();
    }

    score.text = "SCORE: " + counter;
    score.update();
    myGamePiece.newPos();
    myGamePiece.update();
  } // function to return true every time the interval is met


  function everyInterval(n) {
    if (myGameArea.frameNo / n % 1 == 0 || myMenu.frameNo / n % 1 == 0) {
      return true;
    }

    return false;
  }

  menuScreen();
});