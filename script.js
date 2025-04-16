import * as images from './images.js';
const flapSound = new Audio('sounds/flap.wav');
const backgroundSound = new Audio('sounds/background.wav');
const collisionSound = new Audio('sounds/collision.wav');
const portalSound = new Audio('sounds/portal.wav');
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let boundaries = { 
    height: 20 
};

let bird = {
    x: 50,
    y: 250,
    width: 30,
    height: 30,
    gravity: 0.6,
    lift: -10,
    velocity: 0
};

let portals = [];

let enemy_bird = [];

let pipes = [];

let walls = [];

let frame = 0;
let gameOver = true;
let canStartGame = false;
let score = 0;

function createObstacles() {
    if (frame % 100 === 0) {
        if (Math.random() < 0.15) {
            let height = 4 * Math.floor(Math.random() * (canvas.height / 6));
            let direction = Math.random() < 0.5 ? 1 : -1;
            walls.push({
                x: canvas.width,
                y: height,
                width: 50,
                height: 200,
                trajectory: direction
            })
        }
        else {
            let height = Math.random() * (canvas.height / 2);
            pipes.push({
                x: canvas.width,
                y: 0,
                width: 50,
                height: height
            });
            pipes.push({
                x: canvas.width,
                y: height + 200,
                width: 50,
                height: canvas.height - height - 200
            });
            if (Math.random() < 0.2) {
                portals.push({
                    x: canvas.width + 10,
                    y: height,
                    width: 30,
                    height: 200,
                    activation: 0,
                    sound: 0
                })
            }
        }
    }
}


function moveWalls() {
    for (let wall of walls) {
        if (wall.x + wall.width < 0) {
            walls.shift();
        }
        if (wall.y === 0) {
            wall.trajectory = 1;
        }
        if (wall.y + wall.height == 600) {
            wall.trajectory = -1;
        }
        wall.x -= 3;
        wall.y += 4 * wall.trajectory;
        if (bird.x + bird.width > wall.x && bird.x < wall.x + wall.width) {
            if (bird.y > wall.y && bird.y < wall.y + wall.height) {
                gameOver = true;
            }
            if (bird.y + bird.height > wall.y && bird.y + bird.height < wall.y + wall.height) {
                gameOver = true;
            }
        }
    }
}

function drawWalls() {
    for (let wall of walls) {
        ctx.drawImage(images.pipeImg, wall.x, wall.y, wall.width, wall.height);
    }
}

function drawBird() {
    if (bird.gravity === 0.6) {
        ctx.drawImage(images.birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    else {
        ctx.drawImage(images.upsidedownbirdImg, bird.x, bird.y, bird.width, bird.height);
    }
}

function drawEnemyBird() {
    for (let enemy of enemy_bird) {
        ctx.drawImage(images.enemybirdImg, enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }
}

function moveEnemyBird() {
    for (let enemy of enemy_bird) {
        enemy.x -= enemy.velocity;
        if (enemy.x + enemy.width < 0) {
            enemy_bird.shift();
        }
        if (bird.x + bird.width > enemy.x && bird.x < enemy.x + enemy.width) {
            if (bird.y > enemy.y && bird.y < enemy.y + enemy.height) {
                gameOver = true;
            }
            if (bird.y + bird.height > enemy.y && bird.y + bird.height < enemy.y + enemy.height) {
                gameOver = true;
            }
        }
    }
}

function createEnemyBird() {
    if (Math.random() < 0.06 && frame%4 === 0 && enemy_bird.length < 2) {
        let height = Math.random() * (canvas.height - 2*bird.height);
        enemy_bird.push({
            x: canvas.width,
            y: height,
            width: 3*bird.width,
            height: 2*bird.height,
            velocity: 10
        });
    }
}

function drawPortals() {
    for (let portal of portals) {
        ctx.drawImage(images.portalImg, portal.x, portal.y, portal.width, portal.height);
    }
}

function movePortals() {
    for (let portal of portals) {
        portal.x -= 3;
        if (portal.x + portal.width < 0) {
            portals.shift();
        }
        if (bird.x + bird.width > portal.x && portal.sound === 0) {
            portalSound.play();
            portal.sound = 1;
        }
        if (bird.x + bird.width/2 > portal.x + portal.width/2 && portal.activation === 0) {
            bird.lift = -bird.lift;
            bird.velocity = 0;
            bird.gravity = -bird.gravity;
            portal.activation = 1;
        }
    }
}


function movePipes() {
    for (let pipe of pipes) {
        pipe.x -= 3;

        if (pipe.x + pipe.width < 0) {
            pipes.shift();
        }

        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y
        ) {
            gameOver = true;
        }
    }
}

function drawPipes() {
    for (let pipe of pipes) {
        ctx.drawImage(images.pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
    }
}

function drawBoundaries() {
    ctx.drawImage(images.borderImg, 0, 0, canvas.width, boundaries.height);
    ctx.drawImage(images.borderImg, 0, canvas.height - boundaries.height, canvas.width, boundaries.height);
    if (bird.y < boundaries.height || bird.y + bird.height > canvas.height - boundaries.height) {
        gameOver = true;
    }
}

function preventquickstart() {
    setTimeout(() => {
        canStartGame = true;
    }, 1000);
}

function startGame() {
    ctx.fillStyle = "green";
    ctx.font = "30px Arial";
    ctx.fillText("Welcome to Flappy Bird!", 150, 50);
    ctx.fillText("Rules of the game:", 175, 100);
    ctx.fillText("Flappy Bird is you", 175, 150);
    ctx.fillText("Press space to flap higher", 125, 200)
    ctx.fillText("Avoid enemy birds and green pipes", 75, 250);
    ctx.fillText("Yellow portals reverse gravity", 100, 300);
    ctx.fillText("Press space to start", 175, 350);
    preventquickstart();
}

function ending_sounds() {
    portalSound.pause();
    portalSound.currentTime = 0;
    flapSound.pause();
    flapSound.currentTime = 0;
    backgroundSound.pause();
    backgroundSound.currentTime = 0;
}

function death_scene() {
    function fall() {
        ctx.drawImage(images.backgroundImg, 0, 0, canvas.width, canvas.height);
        drawBoundaries();
        drawPipes();
        drawWalls();
        drawPortals();
        drawEnemyBird();

        bird.y += bird.gravity * 5;
        drawBird();
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.drawImage(images.gameoverImg, 75, 200, 250, 75);
        ctx.fillText("Press space to start again", 75, 350);

        if (
            bird.y > boundaries.height &&
            bird.y + bird.height < canvas.height - boundaries.height
        ) {
            requestAnimationFrame(fall);
        }
    }
    fall();
}


function updateGame() {
    if (gameOver) {
        ending_sounds();
        collisionSound.play();
        death_scene();
        preventquickstart();
        return;
    }

    ctx.drawImage(images.backgroundImg, 0, 0, canvas.width, canvas.height);
    createObstacles();
    drawBoundaries();
    movePipes();
    drawPipes();
    moveWalls();
    drawWalls();
    createEnemyBird();
    moveEnemyBird();
    drawEnemyBird();
    movePortals();
    drawPortals();
    drawBird();
    updateBird();

    frame++;
    score = Math.max(0, Math.floor((frame - 200) / 100));
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 20);

    requestAnimationFrame(updateGame);
}

function reset_positions() {
    bird.x = 50,
    bird.y = 250,
    bird.width = 30,
    bird.height = 30,
    bird.gravity = 0.6,
    bird.lift = -10,
    bird.velocity = 0
    
    portals.length = 0;
    enemy_bird.length = 0;
    pipes.length = 0;
    walls.length = 0;
    frame = 0;
    score = 0;
}

function backgroundMusic() {
    backgroundSound.loop = true;
    backgroundSound.volume = 0.05;
    backgroundSound.play();
}

function playSound(audio) {
    const clone = audio.cloneNode();
    clone.play();
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        if (gameOver) {
            if (canStartGame) {
                reset_positions();
                gameOver = false;
                canStartGame = false;
                backgroundMusic();
                updateGame();
            }
        }
        else {
            bird.velocity = bird.lift;
            //flapSound.pause();
            //flapSound.currentTime = 0;
            playSound(flapSound);
        }
    }
});

startGame();




