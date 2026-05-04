// 🎴 Emojis
const emojis = ["🍎", "🍌", "🍇", "🍒", "🥝", "🍍", "🍉", "🍑"];

// 🧩 Game state
let cards = [];
let flippedCards = [];
let lockedBoard = false;
let moves = 0;

// 🎵 Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 🎵 Background Music (MP3)
const bgAudio = new Audio("bg-music.mp3");
bgAudio.loop = true;
bgAudio.volume = 0.3; // Soft background volume

function startBgMusic() {
  bgAudio.play().catch(e => console.log("Audio play failed:", e));
}

function stopBgMusic() {
  bgAudio.pause();
  bgAudio.currentTime = 0;
}

function playMatchSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function playWinSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);

    osc.start(audioCtx.currentTime + i * 0.15);
    osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
  });
}

function showResult() {
  let message = "";
  if (moves > 20) {
    message = "Your memory is weak.";
  } else if (moves > 16 && moves <= 20) {
    message = "Your memory is average.";
  } else if (moves >= 15 && moves <= 16) {
    message = "Your memory is very good!";
  } else {
    message = "Your memory is incredible!";
  }

  // Show custom modal instead of alert
  setTimeout(() => {
    document.getElementById("final-score").textContent = moves;
    document.getElementById("evaluation-message").textContent = message;
    
    const modal = document.getElementById("win-modal");
    modal.classList.add("active");
    
    // Optional: add a game-over class to the board to dim it
    gameBoard.classList.add("game-over");
  }, 500);
}

// 🎯 DOM
const gameBoard = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const resetBtn = document.getElementById("reset");
const modalCloseBtn = document.getElementById("modal-close");

modalCloseBtn.addEventListener("click", () => {
  document.getElementById("win-modal").classList.remove("active");
  createBoard();
});

// 🔀 Shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
// 🏗️ Create board
function createBoard() {
  gameBoard.innerHTML = "";
  gameBoard.classList.remove("game-over");
  moves = 0;
  movesDisplay.textContent = moves;
  flippedCards = [];
  lockedBoard = false;
  stopBgMusic();

  cards = shuffle([...emojis, ...emojis]);

  cards.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.className = "card perspective";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    gameBoard.appendChild(card);
  });
}

// 🔄 Flip card
function flipCard(card) {
  if (lockedBoard) return;

  // Start background music on first interaction
  if (moves === 0 && flippedCards.length === 0) {
    startBgMusic();
  }

  const inner = card.querySelector(".card-inner");

  if (inner.classList.contains("flipped")) return;

  inner.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockedBoard = true;
    moves++;
    movesDisplay.textContent = moves;

    const [card1, card2] = flippedCards;
    const i1 = card1.dataset.index;
    const i2 = card2.dataset.index;

    if (cards[i1] === cards[i2]) {
      playMatchSound();
      
      // Check for win
      if (document.querySelectorAll('.card-inner.flipped').length === cards.length) {
        stopBgMusic();
        playWinSound();
        showResult();
      }
    }

    setTimeout(checkMatch, 800);
  }
}

// ✅ Check match
function checkMatch() {
  const [card1, card2] = flippedCards;
  const i1 = card1.dataset.index;
  const i2 = card2.dataset.index;

  const inner1 = card1.querySelector(".card-inner");
  const inner2 = card2.querySelector(".card-inner");

  if (cards[i1] !== cards[i2]) {
    inner1.classList.remove("flipped");
    inner2.classList.remove("flipped");
  } else {
    // Add matched class for the pop animation
    inner1.classList.add("matched");
    inner2.classList.add("matched");
  }

  flippedCards = [];
  lockedBoard = false;
}

// 🔁 Restart
resetBtn.addEventListener("click", createBoard);

// ▶️ Start game
createBoard();
