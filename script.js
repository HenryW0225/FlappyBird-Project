const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let boundaries = { 
    height: 20 
};

let bird = {
    x: 50,
    y: 250,
    width: 20,
    height: 20,
    gravity: 0.6,
    lift: -10,
    velocity: 0
};

let portals = [];
let enemy_bird = [];
let pipes = [];
let frame = 0;
let gameOver = false;

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawEnemyBird() {
    ctx.fillStyle = "red";
    for (let enemy of enemy_bird) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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
        if (bird.x + bird.width > enemy.x && bird.x + bird.width < enemy.x + enemy.width) {
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
    if (Math.random() < 0.01) {
        let height = Math.random() * (canvas.height - 2*bird.height);
        enemy_bird.push({
            x: canvas.width,
            y: height,
            width: 2*bird.width,
            height: 2*bird.height,
            velocity: 10
        });
    }
}

function drawPortals() {
    ctx.fillStyle = "blue";
    for (let portal of portals) {
        ctx.fillRect(portal.x, portal.height, portal.width, 200);
    }
}

function movePortals() {
    for (let portal of portals) {
        portal.x -= 3;
        if (bird.x > portal.x + portal.width && portal.activation === 0) {
            bird.lift = -bird.lift;
            bird.velocity = -bird.velocity;
            bird.gravity = -bird.gravity;
            portal.activation = 1;
        }
    }
    
}

function createPipes() {
    if (frame % 100 === 0) {
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
                x: canvas.width,
                width: 50,
                height: height,
                activation: 0
            })
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
    ctx.fillStyle = "green";
    for (let pipe of pipes) {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
    }
}

function drawBoundaries() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, boundaries.height);
    ctx.fillRect(0, canvas.height - boundaries.height, canvas.width, boundaries.height);
    if (bird.y < boundaries.height || bird.y + bird.height > canvas.height - boundaries.width) {
        gameOver = true;
    }
}

function updateGame() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", 150, 300);
        //ctx.fillText("Score: ", frame - 50/100)
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    updateBird();
    createPipes();
    movePipes();
    drawPipes();
    drawBoundaries();
    createEnemyBird();
    moveEnemyBird();
    drawEnemyBird();
    movePortals();
    drawPortals();

    frame++;
    requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        bird.velocity = bird.lift;
    }
});

updateGame();

