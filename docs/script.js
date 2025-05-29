const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const usernameInput = document.getElementById("usernameInput");
const leaderboardBody = document.querySelector('#gameLeaderboard tbody');
let playerName = "";

import * as images from './images.js';
const flapSound = new Audio('sounds/flap.wav');
const backgroundSound = new Audio('sounds/background.wav');
const collisionSound = new Audio('sounds/collision.wav');
const portalSound = new Audio('sounds/portal.wav');

canvas.width = 980;
canvas.height = 600;

ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "black";
ctx.font = "30px Arial";


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
let high_score = 0;

function isContacting(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

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
        if (wall.y <= boundaries.height) {
            wall.trajectory = 1;
        }
        if (wall.y + wall.height >= canvas.height - boundaries.height) {
            wall.trajectory = -1;
        }
        wall.x -= 3;
        wall.y += 4 * wall.trajectory;

        if (isContacting(bird, wall)) {
            gameOver = true;
        }

        if (wall.x + wall.width < 0) {
            walls.shift();
        }
    }
}

function drawWalls() {
    for (let wall of walls) {
        ctx.drawImage(images.pipeImg, wall.x, wall.y, wall.width, wall.height);
    }
}

function movePipes() {
    for (let pipe of pipes) {
        pipe.x -= 3;

        if (isContacting(bird, pipe)) {
            gameOver = true;
        }

        if (pipe.x + pipe.width < 0) {
            pipes.shift();
        }
    }
}

function drawPipes() {
    for (let pipe of pipes) {
        ctx.drawImage(images.pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
    }
}

function movePortals() {
    for (let portal of portals) {
        portal.x -= 3;

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

        if (portal.x + portal.width < 0) {
            portals.shift();
        }
    }
}

function drawPortals() {
    for (let portal of portals) {
        ctx.drawImage(images.portalImg, portal.x, portal.y, portal.width, portal.height);
    }
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
} 

function drawBird() {
    if (bird.gravity === 0.6) {
        ctx.drawImage(images.birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    else {
        ctx.drawImage(images.upsidedownbirdImg, bird.x, bird.y, bird.width, bird.height);
    }
}

function createEnemyBird() {
    if (Math.random() < 0.2 && frame%10  === 0 && frame%100 >= 10 && frame%100 <= 70 && enemy_bird.length < 2) {
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

function moveEnemyBird() {
    for (let enemy of enemy_bird) {
        enemy.x -= enemy.velocity;

        if (isContacting(bird, enemy)) {
            gameOver = true;
        }

        if (enemy.x + enemy.width < 0) {
            enemy_bird.shift();
        }
    }
}

function drawEnemyBird() {
    for (let enemy of enemy_bird) {
        ctx.drawImage(images.enemybirdImg, enemy.x, enemy.y, enemy.width, enemy.height);
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
        bird.y += bird.gravity * 30;
        if (bird.y < boundaries.height) {
            bird.y = boundaries.height;
        }
        if (bird.y + bird.height > canvas.height - boundaries.height) {
            bird.y = canvas.height - boundaries.height - bird.height;
        }

        ctx.drawImage(images.backgroundImg, 0, 0, canvas.width, canvas.height);
        drawPipes();
        drawWalls();
        drawPortals();
        drawEnemyBird();
        drawBoundaries();
        drawBird();

        ctx.fillText("Score: " + score, 100, 35);
        ctx.fillText(playerName, canvas.width / 2, 35);
        ctx.fillText("High Score: " + high_score, canvas.width - 100, 35);
        ctx.fillText("Game Over!", 450, 250);
        ctx.fillText("Press Space to Play Again!", 450, 300);
        ctx.fillText("Press 'a' to view Leaderboard", 450, 350);

        if (bird.y === boundaries.height || bird.y + bird.height === canvas.height - boundaries.height) {
            return;
        }

        requestAnimationFrame(fall);
    }

    fall();
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

function startGame() {
    ctx.fillText("Welcome to Flappy Bird!", canvas.width / 2, 150);
    ctx.fillText("Rules of the game:", canvas.width / 2, 200);
    ctx.fillText("Flappy Bird is you", canvas.width / 2, 250);
    ctx.fillText("Press space to flap higher", canvas.width / 2, 300)
    ctx.fillText("Avoid enemy birds and green pipes", canvas.width / 2, 350);
    ctx.fillText("Yellow portals reverse gravity", canvas.width / 2, 400);
    ctx.fillText("Press space to start", canvas.width / 2, 450);
    preventquickstart();
}

function submitScore(FinalScore) {
    if (!playerName) return;

    fetch('/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score: FinalScore }),
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to save score');
        return res.text();
    })
}

startBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (name !== "") {
        playerName = name;
        document.getElementById("startMenu").style.display = "none";
        startGame();
    } else {
        alert("Please enter a username");
    }
});

function updateGame() {
    if (gameOver) {
        submitScore(high_score);
        ending_sounds();
        collisionSound.play();
        death_scene();
        preventquickstart();
        return;
    }

    ctx.drawImage(images.backgroundImg, 0, 0, canvas.width, canvas.height);
    updateBird();
    createObstacles();
    moveWalls();
    drawWalls();
    movePipes();
    drawPipes();
    movePortals();
    drawPortals();
    createEnemyBird();
    moveEnemyBird();
    drawEnemyBird();
    drawBird();
    drawBoundaries();

    frame++;
    score = Math.max(0, Math.floor((frame - 200) / 100));
    ctx.fillText("Score: " + score, 100, 35);
    ctx.fillText(playerName, canvas.width / 2, 35);
    if (high_score < score) {
        high_score = score;
    }
    ctx.fillText("High Score: " + high_score, canvas.width - 100, 35);
    requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        if (gameOver) {
            if (canStartGame && playerName != "") {
                document.getElementById("gameContainer").style.display = "block";
                document.getElementById("gameLeaderboardPage").style.display = "none";
                reset_positions();
                gameOver = false;
                canStartGame = false;
                backgroundMusic();
                updateGame();
            }
        }
        else {
            bird.velocity = bird.lift;
            playSound(flapSound);
        }
    }
});


document.addEventListener("keydown", function(event) {
    if (event.code === "KeyA" && gameOver && playerName != "") {
        document.getElementById("gameContainer").style.display = "none";
        document.getElementById("gameLeaderboardPage").style.display = "block";
        fetch('/leaderboard')
        .then(res => res.json())
        .then(scores => {
            leaderboardBody.innerHTML = ''; 
            scores.forEach((score, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${score.name}</td>
                    <td>${score.score}</td>
                `;
                leaderboardBody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Failed to load leaderboard', err);
        });

    }
})





