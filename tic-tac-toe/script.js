const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const modeSelect = document.getElementById("modeSelect");

const xWinsDisplay = document.getElementById("xWins");
const oWinsDisplay = document.getElementById("oWins");
const drawsDisplay = document.getElementById("draws");

let gameState = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp";

let xWins = 0, oWins = 0, draws = 0;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Initialize game
function initGame() {
  createBoard();
  setMode(modeSelect.value);
  updateStatus();
}

// Create board cells
function createBoard() {
  board.innerHTML = "";
  gameState = Array(9).fill("");
  gameActive = true;
  currentPlayer = "X";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  }
}

// Handle cell click
function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (!gameActive || gameState[index] !== "") return;

  makeMove(index, currentPlayer);

  if (checkGameOver(currentPlayer)) return;

  switchTurn();

  if (isAIPlaying() && currentPlayer === "O") {
    setTimeout(() => {
      const aiMove = getAIMove(gameMode);
      makeMove(aiMove, "O");

      if (!checkGameOver("O")) {
        switchTurn();
      }
    }, 400);
  }
}

// Make a move
function makeMove(index, player) {
  gameState[index] = player;
  document.querySelector(`.cell[data-index='${index}']`).textContent = player;
}

// Switch player
function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

// Update status text
function updateStatus() {
  statusText.textContent = `Current Player: ${currentPlayer}`;
}

// Check for win/draw
function checkGameOver(player) {
  if (isWinner(player)) {
    statusText.textContent = `Player ${player} wins!`;
    updateScore(player);
    gameActive = false;
    return true;
  }

  if (gameState.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    updateScore("draw");
    gameActive = false;
    return true;
  }

  return false;
}

// Check if player wins
function isWinner(player) {
  return winPatterns.some(pattern =>
    pattern.every(index => gameState[index] === player)
  );
}

// Update score display
function updateScore(result) {
  if (result === "X") xWins++;
  else if (result === "O") oWins++;
  else draws++;

  xWinsDisplay.textContent = xWins;
  oWinsDisplay.textContent = oWins;
  drawsDisplay.textContent = draws;
}

// Check if AI is enabled
function isAIPlaying() {
  return gameMode !== "pvp";
}

// Get AI move based on difficulty
function getAIMove(mode) {
  const emptyIndices = gameState.map((val, i) => val === "" ? i : null).filter(v => v !== null);

  if (mode === "easy") {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (mode === "medium") {
    return Math.random() < 0.5
      ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      : minimax(gameState, "O").index;
  }

  return minimax(gameState, "O").index; // Hard mode
}

// Minimax algorithm for unbeatable AI
function minimax(state, player) {
  const empty = state.map((val, i) => val === "" ? i : null).filter(i => i !== null);

  if (isWinnerFromState(state, "X")) return { score: -10 };
  if (isWinnerFromState(state, "O")) return { score: 10 };
  if (empty.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < empty.length; i++) {
    const newState = [...state];
    newState[empty[i]] = player;

    const result = minimax(newState, player === "O" ? "X" : "O");
    moves.push({ index: empty[i], score: result.score });
  }

  return player === "O"
    ? moves.reduce((best, move) => move.score > best.score ? move : best)
    : moves.reduce((best, move) => move.score < best.score ? move : best);
}

// Re-check win condition for minimax
function isWinnerFromState(state, player) {
  return winPatterns.some(pattern =>
    pattern.every(index => state[index] === player)
  );
}

// Set game mode
function setMode(selectedMode) {
  gameMode = selectedMode;
}

// Event listeners
restartBtn.addEventListener("click", createBoard);
modeSelect.addEventListener("change", () => {
  setMode(modeSelect.value);
  createBoard();
});

initGame();
