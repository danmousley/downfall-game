
document.addEventListener("DOMContentLoaded", () => {
    // var canvas = document.getElementById("myCanvas")
    // var ctx = canvas.getContext("2d")


    var myGamePiece
    var myObstacles = []
    var score

    // create canvas and game pieces
    function startGame() {
        myGameArea.start()
        myGamePiece = new component(30, 30, "red", 30, 30)
        score = new component("30px", "Consolas", "black", 280, 40, "text")
        // myObstacle = new component(250, 10, "green", 0, 250)
    }

    //object to define the game area
    var myGameArea = {
        canvas : document.createElement("canvas"),
        start: function() {
            this.canvas.width = 480
            this.canvas.height = 400
            // sets context type of 2d
            this.context = this.canvas.getContext("2d")
            // insert the canvas as the first item in the body
            document.body.insertBefore(this.canvas, document.body.childNodes[0])
            this.frameNo = 0
            // update game area 50 times per second (every 20th millisecond)
            this.interval = setInterval(updateGameArea, 20)

            // create key with keycode as variable if keyboard pressed
            window.addEventListener('keydown', function(e) {
                myGameArea.keys = (myGameArea.keys || []) //create empty array if no keys pressed
                myGameArea.keys[e.keyCode] = true //add keycodes to the array when pressed
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
    function component(width, height, color, x, y, type) {
        this.type = type
        this.width = width
        this.height = height
        this.speedX = 0
        this.speedY = 0
        this.x = x
        this.y = y
        this.gravity = 0.1
        this.gravitySpeed = 0
        this.update = () => {
            ctx = myGameArea.context // this is the 2D rendering context, tool used to paint on canvas
            if (this.type == "text") {
                ctx.font = this.width + " " + this.height
                ctx.fillStyle = color
                ctx.fillText(this.text, this.x, this.y)
            }
            else {
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
        }

        this.hitBottom = function () {
            let rockbottom = myGameArea.canvas.height - this.height
            if (this.y > rockbottom) {
                this.y = rockbottom
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
            let crash = true
            if ((mybottom < othertop) || (mytop > otherbottom) || (myleft > otherright) || (myright < otherleft)) {
                crash = false
            }
            return crash
        }
    }

    // function to clear and update game area
    function updateGameArea() {
        var y, width, gap, minWidth, maxWidth, minGap, maxGap
        let counter = 0
        myGameArea.clear()
        myGameArea.frameNo += 1
        if (myGameArea.frameNo == 1 || everyInterval(150)) {
            y = myGameArea.canvas.height // bottom of the screen
            x = myGameArea.canvas.width
            minWidth = 20
            maxWidth = 450 // min width + max width still allows object to go through the gap
            width = Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth) // randomly generated width in the range
            minGap = 50
            maxGap = 150
            gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap) // randomly generated gap in the range
            myObstacles.push(new component(width, 10, "green", 0, y)) // creat obstacle of height 10 and randomly generated width in the bottom left
            myObstacles.push(new component(x-width-gap, 10, "green", width+gap, y)) // create corresponding obstacle width equal to width of screen-width object1 - width gap
        }
        myGamePiece.speedX = 0 // reset speeds to zero, therefore object stops if button press stops
        myGamePiece.speedY = 0
        for (i = 0; i < myObstacles.length; i++) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                myGamePiece.gravitySpeed = 0
                // myGamePiece.gravity = 0
                // myGamePiece.speedY = -0.5
                myGamePiece.y = myObstacles[i].y - myGamePiece.height
                // myGamePiece.update()
            } 
            if (myGamePiece.y > myObstacles[i].y) {
                counter += 0.5
            }
        }
        if (myGameArea.keys && myGameArea.keys[37]) { // update speeds according to key press
            myGamePiece.speedX = -3
        }
        if (myGameArea.keys && myGameArea.keys[39]) {
            myGamePiece.speedX = 3
        }
        for (i = 0; i < myObstacles.length; i++) {
            myObstacles[i].y += -0.5
            myObstacles[i].update()
        }
        score.text = "SCORE: " + counter
        score.update()
        myGamePiece.newPos()
        myGamePiece.update()
    }

    // allow buttons to control motion
    let moveLeft = () => {
        myGamePiece.speedX -= 1
    }

    let moveRight = () => {
        myGamePiece.speedX += 1
    }

    let stopMove = () => {
        myGamePiece.speedX = 0;
        myGamePiece.speedY = 0;
    }

    let left = document.querySelector("#left")
    left.addEventListener("mousedown", () => {
        moveLeft()
    })
    left.addEventListener("mouseup", () => {
        stopMove()
    })

    let right = document.querySelector("#right")
    right.addEventListener("mousedown", () => {
        moveRight()
    })
    right.addEventListener("mouseup", () => {
        stopMove()
    })

    // function to return true every time the interval is met
    function everyInterval(n) {
        if ((myGameArea.frameNo / n) % 1 == 0) {
            return true
        }
        return false
    }

    startGame()

})
