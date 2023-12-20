const startButton = document.getElementById('start-button');
let plane = document.getElementById('plane');
let gameBackground = document.getElementById('game-background');
let score = document.getElementById('score');
let currentScore = 0;
let gameOver = false;
let gameStarted = false;
let bombInterval;

function createSun() {
    let sun = document.createElement('div');
    sun.classList.add('sun-style');
    gameBackground.appendChild(sun);
}

function createClouds() {
    for (let i = 1; i < 20; ++i) {
        let clouds = document.createElement('div');
        clouds.classList.add('cloud-style');
        gameBackground.appendChild(clouds);
        setTimeout(() => {
            clouds.style.left =  Math.random() * (gameBackground.offsetWidth - clouds.offsetWidth) + 'px';
            clouds.style.top =  Math.random() * (gameBackground.offsetHeight - clouds.offsetHeight) + 'px';
        }, 0);
    }
}

function moveClouds() {
    let clouds = document.querySelectorAll('.cloud-style');
    clouds.forEach(cloud => {
        let interval = setInterval(() => {
            let currentPosition = parseInt(cloud.style.left, 10);
            cloud.style.left = currentPosition + 5 + 'px';
            if (currentPosition >= gameBackground.offsetWidth - cloud.offsetWidth) {
                cloud.style.left = '0px';
            }
        }, 1000); 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createClouds();
    moveClouds();
    createSun();
});

function hideStartButton() {
    startButton.style.display = 'none';
}

function createPlane() {
    plane.textContent = '\u2708'; 
    plane.classList.add('plane');
}

function startGame(event) {
    hideStartButton();
    createPlane();
    setInterval(createBombs, 500);
    event.stopPropagation();
    gameStarted = true;
}

document.addEventListener('keydown', function(event) {
    let currentPosition = plane.offsetLeft;
    if (event.key == 'ArrowLeft') {
        plane.style.left = Math.max(currentPosition - 10, 0) + 'px';
    } else if (event.key == 'ArrowRight') {
        plane.style.left = Math.min(currentPosition + 10, gameBackground.offsetWidth - plane.offsetWidth) + 'px';
    }
});

function createBombs() {
    if (plane.textContent == '\u2708') {
        let bomb = document.createElement('div');
        bomb.classList.add('bomb-style');
        gameBackground.appendChild(bomb);
        let maxPosition = gameBackground.offsetWidth - bomb.offsetWidth;
        let randomPosition = Math.floor(Math.random() * maxPosition);
        bomb.style.left = randomPosition + 'px';
        bomb.style.top = '0px';
        let fallingSpeed = 3;
        let currentPosition = 0;
        let interval = setInterval(function() {
            currentPosition += fallingSpeed;
            bomb.style.top = currentPosition + 'px';
            if (currentPosition >= (gameBackground.offsetHeight - bomb.offsetHeight)) {
                clearInterval(interval);
                bomb.remove();
            }
        }, 20);
    }
}

function fireMissile() {
    if (!gameOver && gameStarted) {
        let missile = document.createElement('div');
        missile.classList.add('missile-style');
        missile.style.left = plane.offsetLeft + plane.offsetWidth / 2 + 'px';
        missile.style.top = plane.offsetTop + 'px';
        gameBackground.appendChild(missile);
        let interval = setInterval(function() {
            let currentPosition = missile.offsetTop;
            if (currentPosition <= 0) {
                clearInterval(interval); 
                missile.remove(); 
            } else {
                missile.style.top = currentPosition - 10 + 'px'; 
            }
        }, 20);
    }
}

function collisionMissileBomb(object1, object2) {
    let element1 = object1.getBoundingClientRect();
    let element2 = object2.getBoundingClientRect();
    return (
        element1.x < element2.x + element2.width &&
        element1.x + element1.width > element2.x &&
        element1.y < element2.y + element2.height &&
        element1.y + element1.height > element2.y
    );
}

function collisionPlaneBomb(object1, object2) {
    let element1 = object1.getBoundingClientRect();
    let element2 = object2.getBoundingClientRect();

    let adjustedElement1 = {
        left: element1.left + element1.width * 0.25,
        right: element1.right - element1.width * 0.25,
        top: element1.top + element1.height * 0.45, 
        bottom: element1.bottom
    };

    return (
        adjustedElement1.left < element2.right &&
        adjustedElement1.right > element2.left &&
        adjustedElement1.top < element2.bottom &&
        adjustedElement1.bottom > element2.top
    );
}

function checkCollisions() {
    let missiles = document.querySelectorAll('.missile-style');
    let bombs = document.querySelectorAll('.bomb-style');
    missiles.forEach(missile => {
        bombs.forEach(bomb => {
            if (collisionMissileBomb(missile, bomb)) {
                missile.remove();
                bomb.remove();
                if (!gameOver) {
                    ++currentScore;
                    score.textContent = currentScore;
                }
            } 
        });
    });
    bombs.forEach(bomb => {
        if (collisionPlaneBomb(plane, bomb)) {
            endGame();
            gameOver = true;
        }
    })
}

function gameLoop() {
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function clearBombs() {
    let bombs = document.querySelectorAll('.bomb-style');
    bombs.forEach(bomb => {
        bomb.remove();
    });
}

function createRestartButton() {
    let restartButton = document.createElement('div');
    restartButton.classList.add('restart-button');
    restartButton.textContent = 'Restart';
    gameBackground.appendChild(restartButton);
    restartButton.addEventListener("click", function(event) {
        restartGame(event);
    });
}

function endGame() {
    clearBombs();
    plane.style.display = 'none';
    bombInterval = setInterval(createBombs, 0);
    let gameOverText = document.createElement('div');
    gameOverText.classList.add('game-over');
    gameBackground.appendChild(gameOverText);
    gameOver = true;
    gameStarted = false;
    createRestartButton();
}

function removeRestartButton() {
    let restartButton = document.querySelector('.restart-button');
    restartButton.remove();
}

function removeGameOver() {
    let gameOverText = document.querySelector('.game-over');
    gameOverText.remove();
}

function restartGame(event) {
    removeRestartButton();
    removeGameOver();
    clearBombs();
    plane.style.display = 'inline-block';
    if (bombInterval) {
        clearInterval(bombInterval);
    }
    currentScore = 0;
    score.textContent = currentScore;
    gameOver = false;
    gameStarted = true;
    event.stopPropagation();
}