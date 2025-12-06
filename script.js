const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');
const highScoreElement = document.querySelector('#high-score');
const ScoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');

const blockHeight = 50;
const blockWidth = 50;

let highScore = parseInt(localStorage.getItem("highScore") || "0", 10);
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerId = null;

const blocks = [];

// Snake & direction state
let snake = [{ x: 1, y: 3 }];
let direction = 'down';        // current move direction
let nextDirection = direction; // input se update hota hai

// --- helper: safe food (snake ke upar na aaye) ---
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols)
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

let food = generateFood();

// grid create
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement('div');
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

/* 🔹 Reverse direction block helper */
function setDirectionIfAllowed(newDir) {
  const opposite = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };

  // agar newDir current direction ka opposite hai, ignore
  if (opposite[newDir] === direction) {
    return;
  }

  nextDirection = newDir;
}

function render() {
  let head = null;

  // nextDirection ko yaha apply karte hain
  direction = nextDirection;

  // food dikhao (agar class missing ho)
  const foodBlock = blocks[`${food.x}-${food.y}`];
  if (foodBlock) foodBlock.classList.add("food");

  // naya head calculate
  if (direction === 'left') {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === 'right') {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === 'down') {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === 'up') {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervalId);
    clearInterval(timerId);
    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';
    return;
  }

  // self-collision
  const isSelfCollision = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (isSelfCollision) {
    clearInterval(intervalId);
    clearInterval(timerId);
    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';
    return;
  }

  // purana snake clear (body + head + direction classes)
  snake.forEach(segment => {
    const blk = blocks[`${segment.x}-${segment.y}`];
    if (!blk) return;
    blk.classList.remove("fill", "head", "up", "down", "left", "right");
  });

  // ✅ food khaya?
  if (head.x === food.x && head.y === food.y) {
    // purana food block
    const oldFoodBlock = blocks[`${food.x}-${food.y}`];
    if (oldFoodBlock) {
      oldFoodBlock.classList.remove("food");
      oldFoodBlock.classList.add("food-pop"); // animation class
      setTimeout(() => {
        oldFoodBlock.classList.remove("food-pop");
      }, 250);
    }

    // naya safe food
    food = generateFood();
    const newFoodBlock = blocks[`${food.x}-${food.y}`];
    if (newFoodBlock) newFoodBlock.classList.add("food");

    // grow snake (tail nahi hata)
    snake.unshift(head);

    score += 10;
    ScoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.innerText = highScore;
    }
  } else {
    // normal move (head add, tail pop)
    snake.unshift(head);
    snake.pop();
  }

  // naya snake draw + head pe eyes
  snake.forEach((segment, index) => {
    const blk = blocks[`${segment.x}-${segment.y}`];
    if (!blk) return;
    blk.classList.add("fill");
    if (index === 0) {
      blk.classList.add("head", direction); // eyes ke liye direction bhi
    }
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";

  if (intervalId) clearInterval(intervalId);
  if (timerId) clearInterval(timerId);

  intervalId = setInterval(render, 300);

  timerId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = time;
  }, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
  // purane fill/food hatao
  const oldFoodBlock = blocks[`${food.x}-${food.y}`];
  if (oldFoodBlock) {
    oldFoodBlock.classList.remove("food", "food-pop");
  }

  snake.forEach(segment => {
    const blk = blocks[`${segment.x}-${segment.y}`];
    if (!blk) return;
    blk.classList.remove("fill", "head", "up", "down", "left", "right");
  });

  clearInterval(intervalId);
  clearInterval(timerId);

  score = 0;
  time = `00-00`;

  ScoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;

  modal.style.display = 'none';

  snake = [{ x: 1, y: 3 }];
  direction = 'down';
  nextDirection = 'down';

  food = generateFood();
  const newFoodBlock = blocks[`${food.x}-${food.y}`];
  if (newFoodBlock) newFoodBlock.classList.add("food");

  intervalId = setInterval(render, 300);
  timerId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = time;
  }, 1000);
}

// 🔹 Keyboard direction change
addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    setDirectionIfAllowed("up");
  } else if (key === "arrowright" || key === "d") {
    setDirectionIfAllowed("right");
  } else if (key === "arrowdown" || key === "s") {
    setDirectionIfAllowed("down");
  } else if (key === "arrowleft" || key === "a") {
    setDirectionIfAllowed("left");
  }
});

/* 📱 Mobile Swipe Controls */
let touchStartX = 0;
let touchStartY = 0;

board.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

board.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const threshold = 20;

  if (Math.max(absX, absY) < threshold) return;

  if (absX > absY) {
    if (dx > 0) {
      setDirectionIfAllowed("right");
    } else {
      setDirectionIfAllowed("left");
    }
  } else {
    if (dy > 0) {
      setDirectionIfAllowed("down");
    } else {
      setDirectionIfAllowed("up");
    }
  }
}, { passive: true });

/* 📱 On-screen buttons (D-pad) for mobile */
function isMobile() {
  return window.innerWidth <= 768 || 'ontouchstart' in window;
}

function createMobileControls() {
  if (!isMobile()) return;
  if (document.querySelector('.onscreen-controls')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'onscreen-controls';

  // 3x3 grid layout: center blank, arrows around
  const layout = [
    '', 'up', '',
    'left', '', 'right',
    '', 'down', ''
  ];

  layout.forEach(role => {
    const btn = document.createElement('button');
    btn.className = 'ctrl-btn';

    if (!role) {
      btn.classList.add('ctrl-btn--empty');
      wrapper.appendChild(btn);
      return;
    }

    let label = '';
    if (role === 'up') label = '↑';
    if (role === 'down') label = '↓';
    if (role === 'left') label = '←';
    if (role === 'right') label = '→';

    btn.textContent = label;
    btn.dataset.dir = role;

    const handle = () => setDirectionIfAllowed(role);

    btn.addEventListener('click', handle);
    btn.addEventListener('mousedown', handle);
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handle();
    }, { passive: false });

    wrapper.appendChild(btn);
  });

  document.body.appendChild(wrapper);
}

// call once on load
createMobileControls();

// resize pe bhi re-check
window.addEventListener('resize', () => {
  createMobileControls();
});
