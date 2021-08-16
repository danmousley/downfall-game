
document.addEventListener("DOMContentLoaded", () => {
    // var canvas = document.getElementById("myCanvas")
    // var ctx = canvas.getContext("2d")


    var myGamePiece
    var myObstacles = []

    // create canvas and game pieces
    function startGame() {
        myGameArea.start()
        myGamePiece = new component(30, 30, "red", 30, 30)
        // myObstacle = new component(250, 10, "green", 0, 250)
    }

    //object to define the game area
    var myGameArea = {
        canvas : document.createElement("canvas"),
        start: function() {
            this.canvas.width = 480
            this.canvas.height = 270
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
    function component(width, height, color, x, y) {
        this.width = width
        this.height = height
        this.speedX = 0
        this.speedY = 0
        this.x = x
        this.y = y
        this.update = () => {
            ctx = myGameArea.context // this is the 2D rendering context, tool used to paint on canvas
            ctx.fillStyle = color
            ctx.fillRect(this.x, this.y, this.width, this.height) // draws a rectangle filled with above style
        }
        // move the component by number of pixels defined in speed variables, this is done each interval
        this.newPos = function() {
            this.x += this.speedX
            this.y += this.speedY
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
        var x, y
        myGameArea.clear()
        myGameArea.frameNo += 1
        if (myGameArea.frameNo == 1 || everyInterval(150)) {
            x = myGameArea.canvas.width - 200
            y = myGameArea.canvas.height
            myObstacles.push(new component(250, 10, "green", x, y))
        }
        myGamePiece.speedX = 0 // reset speeds to zero, therefore object stops if button press stops
        myGamePiece.speedY = 0
        for (i = 0; i < myObstacles.length; i++) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                myGamePiece.speedY = -0.5
            }
        }
        if (myGameArea.keys && myGameArea.keys[37]) { // update speeds according to key press
            myGamePiece.speedX = -1
        }
        if (myGameArea.keys && myGameArea.keys[39]) {
            myGamePiece.speedX = +1
        }
        for (i = 0; i < myObstacles.length; i++) {
            myObstacles[i].y += -0.5
            myObstacles[i].update()
        }
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
