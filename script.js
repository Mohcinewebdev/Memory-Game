// 🎴 Emojis
const emojis = ["🍎", "🍌", "🍇", "🍒", "🥝", "🍍", "🍉", "🍑"];

// 🧩 Game state
let cards = [];
let flippedCards = [];
let lockedBoard = false;
let moves = 0;

// 🎯 DOM
const gameBoard = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const resetBtn = document.getElementById("reset");

// 🔀 Shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
// 🏗️ Create board
function createBoard() {
  gameBoard.innerHTML = "";
  moves = 0;
  movesDisplay.textContent = moves;
  flippedCards = [];
  lockedBoard = false;

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

  const inner = card.querySelector(".card-inner");

  if (inner.classList.contains("flipped")) return;

  inner.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockedBoard = true;
    moves++;
    movesDisplay.textContent = moves;
    setTimeout(checkMatch, 800);
  }
}

// ✅ Check match
function checkMatch() {
  const [card1, card2] = flippedCards;
  const i1 = card1.dataset.index;
  const i2 = card2.dataset.index;

  if (cards[i1] !== cards[i2]) {
    card1.querySelector(".card-inner").classList.remove("flipped");
    card2.querySelector(".card-inner").classList.remove("flipped");
  }

  flippedCards = [];
  lockedBoard = false;
}

// 🔁 Restart
resetBtn.addEventListener("click", createBoard);

// ▶️ Start game
createBoard();
