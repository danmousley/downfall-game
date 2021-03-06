document.addEventListener("DOMContentLoaded", () => {

    let myGamePiece
    let myObstacles = []
    let score
    let backgroundMusic
    let menuMusic
    let levelUp
    let gameOver
    let gravity = 1
    let ballSpeed = 8
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    let highScore = 0
    let gameTitle
    let highestScore
    let info
    let isMenuScreen
    let isGameOver
    let newHighScore
    let blinker = false
    let mute = false
    let muteButton = document.querySelector('#mute')
    
    muteButton.addEventListener("click", (event) => {
        dummy = document.querySelector("audio")
        if (dummy.muted == true) {
            document.querySelectorAll("audio").forEach((sound) => {
                sound.muted = false
                mute = false
            })
            muteButton.innerHTML = "<i class='fas fa-volume-mute'></i>"
        } else {
            document.querySelectorAll("audio").forEach((sound) => {
                sound.muted = true
                mute = true
            })
            
            muteButton.innerHTML = "<i class='fas fa-volume-up'></i>"
        }
    })

    // create canvas and game pieces
    function startGame() {
        document.querySelector("#game-canvas").classList.remove("dark")
        document.querySelector(".side--right").classList.add("dark")
        document.querySelector(".side--left").classList.add("dark")
        isMenuScreen = false
        myGamePiece = new component(30, 30, "#FFFF00", 30, 30, "circle")
        score = new component("20px", "Consolas", "white", 360, 40, "text")
        gameTitle = new component("60px", "Warnes", "white", 50, 0.25*vh, "text")
        highestScore = new component("20px", "Consolas", "white", 200, 0.35*vh, "text")
        info = new component("20px", "Consolas", "white", 125, 0.6*vh, "text")
        newHighScore = new component("20px", "Consolas", "red", 165, 0.45*vh, "text")
        backgroundMusic = new sound("music/game-music.mp3")
        levelUp = new sound("music/level-up.mp3")
        gameOver = new sound("music/game-over.mp3")
        if (mute == false) {
            backgroundMusic.play()
        }
        myGameArea.start()
    }

    function menuScreen() {
        document.querySelector("#game-canvas").classList.add("dark")
        document.querySelector(".side--right").classList.remove("dark")
        document.querySelector(".side--left").classList.remove("dark")
        isGameOver = false
        isMenuScreen = true
        menuMusic = new sound("music/start-screen.mp3")
        if (mute == false) {
            menuMusic.play()
        }
        gameTitle = new component("60px", "Warnes", "white", 65, 0.25*vh, "text")
        highestScore = new component("20px", "Consolas", "white", 170, 0.35*vh, "text")
        info = new component("20px", "Consolas", "white", 120, 0.6*vh, "text")
        myMenu.start()
    }

    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function(){
          this.sound.play();
        }
        this.stop = function(){
          this.sound.pause();
        }
      }

    let myMenu = {
        canvas : document.querySelector("#game-canvas"),
        start: function() {
            this.canvas.width = 480
            this.canvas.height = 0.8 * vh
            this.context = this.canvas.getContext("2d") // sets context type of 2d
            this.frameNo = 0
            this.interval = setInterval(updateMenu, 20) // update game area 50 times per second (every 20th millisecond)

            // create key with keycode as variable if keyboard pressed
            window.addEventListener('keydown', function(e) {
                myMenu.keys = true 
            })
            window.addEventListener('keyup', function(e) {
                myMenu.keys = false
            })
        },
        // function to clear canvas
        clear: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        },
        stop: function() {
            clearInterval(this.interval) //clears the timer set with setInterval() method above
        }
    }

    //object to define the gameplay area
    let myGameArea = {
        canvas : document.querySelector("#game-canvas"),
        start: function() {
            this.canvas.width = 480
            this.canvas.height = 0.8 * vh
            this.context = this.canvas.getContext("2d") // sets context type of 2d
            this.frameNo = 0
            this.score = 0
            this.interval = setInterval(updateGameArea, 20) // update game area 50 times per second (every 20th millisecond)

            // create key with keycode as variable if keyboard pressed
            window.addEventListener('keydown', function(e) {
                myGameArea.keys = (myGameArea.keys || []) //create empty array if no keys pressed
                myGameArea.keys[e.keyCode] = true //add keycodes to the array when respective key pressed
            })
            window.addEventListener('keyup', function(e) {
                myGameArea.keys[e.keyCode] = false
            })
        },
        // function to clear canvas
        clear: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        },
        stop: function() {
            clearInterval(this.interval) //clears the timer set with setInterval() method above
        }
    }

    // class to define components
    function component(width, height, color, x, y, type) { //
        this.type = type
        this.width = width
        this.height = height
        this.speedX = 0
        this.speedY = 0
        this.x = x
        this.y = y
        this.gravity = gravity
        this.gravitySpeed = 0
        this.update = () => {
            ctx = isMenuScreen ? myMenu.context : myGameArea.context // this is the 2D rendering context, tool used to paint on canvas
            if (this.type == "text") {
                ctx.font = this.width + " " + this.height
                ctx.fillStyle = color
                ctx.fillText(this.text, this.x, this.y)
            } else if (this.type == "circle") {
                ctx.beginPath()
                ctx.arc(this.x+this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI*2, false)
                ctx.fillStyle = color
                ctx.fill()
                ctx.closePath()
            } else {
                ctx.fillStyle = color
                ctx.fillRect(this.x, this.y, this.width, this.height) // draws a rectangle filled with above style
            }
        }
        // move the component by number of pixels defined in speed variables, this is done each interval
        this.newPos = function() {
            this.gravitySpeed += this.gravity
            this.x += this.speedX

            this.y += this.speedY + this.gravitySpeed
            this.hitBottom()
            this.crossRight()
            this.crossLeft()
        }

        //stop the ball if it touches the bottom
        this.hitBottom = function () {
            let rockbottom = myGameArea.canvas.height - this.height
            if (this.y > rockbottom) {
                this.y = rockbottom
            }
        }

        //make the ball come back onto the other side
        this.crossRight = function() {
            if (this.x > myGameArea.canvas.width) {
                this.x = ballSpeed +1
            }
        }

        this.crossLeft = function() {
            if (this.x + this.width < 0) {
                this.x = myGameArea.canvas.width - ballSpeed - 1
            }
        }

        // function that determines if the objects overlap
        this.crashWith = function(otherobj) {
            let myleft = this.x
            let myright = this.x + (this.width)
            let mytop = this.y
            let mybottom = this.y + (this.height)
            let otherleft = otherobj.x
            let otherright = otherobj.x + (otherobj.width)
            let othertop = otherobj.y
            let otherbottom = otherobj.y + (otherobj.height)
            let crash = false // always true, unless there is no overlap
            if ((mybottom > othertop) && (myright > otherleft) && (myleft < otherright) && (mytop < otherbottom)) { // || (mytop > otherbottom) || (myleft > otherright) || (myright < otherleft)
                crash = true
            }
            return crash
        }
        // function to check if ball touches left side of an object
        this.touchLeft = function(otherobj) {
            let myleft = this.x
            let myright = this.x + (this.width)
            let mytop = this.y
            let mybottom = this.y + (this.height)
            let otherleft = otherobj.x
            let otherright = otherobj.x + (otherobj.width)
            let othertop = otherobj.y
            let otherbottom = otherobj.y + (otherobj.height)
            let touch = false
            if ((mybottom > othertop) && (myright > otherleft) && (myleft < (otherleft-myGamePiece.width+ballSpeed+1)) && (mytop < otherbottom)) {
                touch = true
            }
            return touch
        }

        this.touchRight = function(otherobj) {
            let myleft = this.x
            let myright = this.x + (this.width)
            let mytop = this.y
            let mybottom = this.y + (this.height)
            let otherleft = otherobj.x
            let otherright = otherobj.x + (otherobj.width)
            let othertop = otherobj.y
            let otherbottom = otherobj.y + (otherobj.height)
            let touch = false
            if ((mybottom > othertop) && (myright-myGamePiece.width+ballSpeed+1 > otherright) && (myleft < otherright) && (mytop < otherbottom)) {
                touch = true
            }
            return touch
        }
    }

    function updateMenu() {
        if (myMenu.keys && isMenuScreen) { // press any key to start game
            console.log("keys work")
            myMenu.clear()
            myObstacles = []
            myMenu.stop()
            myMenu.clear()
            menuMusic.stop()
            startGame()
        } 
        else {
            myMenu.clear()
            myMenu.frameNo += 1
            
            if (myMenu.frameNo == 1 || everyInterval(80)) {
                y = myMenu.canvas.height // bottom of the screen
                x = myMenu.canvas.width
                minWidth = 20
                maxWidth = 450 // min width + max width still allows object to go through the gap
                width = Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth) // randomly generated width in the range
                minGap = 50
                maxGap = 150
                gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap) // randomly generated gap in the range
                myObstacles.push(new component(width, 10, "#394752b7", 0, y)) // create obstacle of height 10 and randomly generated width in the bottom left
                myObstacles.push(new component(x-width-gap, 10, "#394752b7", width+gap, y)) // create corresponding obstacle width equal to width of screen-width object1 - width gap
            }
            for (i = 0; i < myObstacles.length; i++) {
                myObstacles[i].y += -1.5
                myObstacles[i].update()
            }
            gameTitle.text = "Down Fall"
            highestScore.text = `High score: ${highScore}`
            if (myMenu.frameNo == 1 || everyInterval(40)) {
                if (blinker == false) {
                    info.text = "Press any key to start"
                    blinker = true
                } else {
                    info.text = " "
                    blinker = false
                }
            }
            gameTitle.update()
            highestScore.update()
            info.update()
        }
    }

    // function to clear and draw the game area
    function updateGameArea() {
        // function to end game
        let y, width, gap, minWidth, maxWidth, minGap, maxGap
        let interval, levelColor, levelSpeed
        let counter = 0
        if (myGamePiece.y && myGamePiece.y < 0) {
            isGameOver = true
            backgroundMusic.stop()
            if (mute == false) {
                gameOver.play()
            }
            myGameArea.clear()
            gameTitle.text = "Game Over"
            highestScore.text = "SCORE: " + myGameArea.score
            if (myGameArea.score > highScore) {
                highScore = myGameArea.score
                newHighScore.text = "New highscore!"
            }
            info.text = "Press space to continue"
            gameTitle.update()
            highestScore.update()
            info.update()
            newHighScore.update()
            myGamePiece.newPos()
            myGamePiece.y = 1
            myGamePiece.update()
            myGameArea.stop()
            window.addEventListener('keyup', function(e) {
                if (isGameOver == true && e.keyCode == 32) {
                    myGameArea.clear()
                    myGameArea.stop()
                    menuScreen()
                }
            })
        } else { // increase speed and colour of obstacles as users score increases
            if (myGameArea.score > 49.0) {
                interval = 16
                levelColor = "#FC6E22"
                levelSpeed = -7
            } else if (myGameArea.score > 39.0) {
                interval = 20
                levelColor = "#02B8A2"
                levelSpeed = -6
            } else if (myGameArea.score > 29.0) {
                interval = 25
                levelColor = "#0310EA"
                levelSpeed = -5
            } else if (myGameArea.score > 19.0) {
                interval = 30
                levelColor = "#FD1C03"
                levelSpeed = -4
            } else if (myGameArea.score > 9.0) {
                console.log("true")
                interval = 40
                levelColor = "#FE53BB"
                levelSpeed = -3
            } else { //1.5 80
                interval = 60
                levelColor = "#09FBD3"
                levelSpeed = -2
            }
            myGameArea.clear()
            myGameArea.frameNo += 1
            if (myGameArea.frameNo == 1 || everyInterval(interval)) {
                y = myGameArea.canvas.height // bottom of the screen
                x = myGameArea.canvas.width
                minWidth = 20
                maxWidth = 450 // min width + max width still allows object to go through the gap
                width = Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth) // randomly generated width in the range
                minGap = 50
                maxGap = 150
                gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap) // randomly generated gap in the range
                myObstacles.push(new component(width, 10, levelColor, 0, y)) // create obstacle of height 10 and randomly generated width in the bottom left
                myObstacles.push(new component(x-width-gap, 10, levelColor, width+gap, y)) // create corresponding obstacle width equal to width of screen-width object1 - width gap
            }
            myGamePiece.speedX = 0 // reset speeds to zero, therefore object stops if button press stops
            myGamePiece.speedY = 0
            if (myGameArea.score != 0 && myGameArea.score % 10 == 0 && myGameArea.score < 52) { //play sound when level up
                if (mute == false) {
                    levelUp.play()
                }
                myObstacles.pop()
                myObstacles.pop()
                myGameArea.score += 1
            }
            for (i = 0; i < myObstacles.length; i++) {
                if (myGamePiece.touchLeft(myObstacles[i])) {
                    myGamePiece.speedX = 0
                    myGamePiece.x = myObstacles[i].x - myGamePiece.width
                } else if (myGamePiece.touchRight(myObstacles[i])) {
                    myGamePiece.speedX = 0
                    myGamePiece.x = myObstacles[i].x + myObstacles[i].width
                } else if (myGamePiece.crashWith(myObstacles[i])) {
                    myGamePiece.gravitySpeed = 0
                    myGamePiece.y = myObstacles[i].y - myGamePiece.height
                }
                if (myGamePiece.y > myObstacles[i].y) {
                    counter += 0.5
                }
                if (counter > myGameArea.score) {
                    myGameArea.score = counter
                }
            }
            if (myGameArea.keys && myGameArea.keys[37]) { // update speeds according to key press
                myGamePiece.speedX = -ballSpeed
            }
            if (myGameArea.keys && myGameArea.keys[39]) {
                myGamePiece.speedX = ballSpeed
            }
            for (i = 0; i < myObstacles.length; i++) {
                myObstacles[i].y += levelSpeed
                myObstacles[i].update()
            }
            score.text = "SCORE: " + myGameArea.score
            score.update()
            myGamePiece.newPos()
            myGamePiece.update()
        }
    }

    // function to return true every time the interval is met
    function everyInterval(n) {
        if ((myGameArea.frameNo / n) % 1 == 0 || (myMenu.frameNo / n) % 1 == 0) {
            return true
        }
        return false
    }

    menuScreen()

})
