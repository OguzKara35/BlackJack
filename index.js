// Card values
const cardValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Deck of cards
let deck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Game state
let playerHand = [];
let dealerHand = [];
let playerMoney = 1000;
let currentBet = 0;
let gameInProgress = false;

// DOM elements
const playerMoneyElement = document.getElementById('playerMoney');
const currentBetElement = document.getElementById('currentBet');
const messageElement = document.getElementById('message');
const dealerCardsElement = document.getElementById('dealerCards');
const playerCardsElement = document.getElementById('playerCards');
const dealerScoreElement = document.getElementById('dealerScore');
const playerScoreElement = document.getElementById('playerScore');
const bettingControls = document.getElementById('bettingControls');
const gameControls = document.getElementById('gameControls');
const decreaseBetButton = document.getElementById('decreaseBet');
const increaseBetButton = document.getElementById('increaseBet');
const dealButton = document.getElementById('dealBtn');
const hitButton = document.getElementById('hitBtn');
const standButton = document.getElementById('standBtn');
const doubleButton = document.getElementById('doubleBtn');

// DOM elements for start screen
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startButton = document.getElementById('startButton');

// Function to start the game
function startGame() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    startNewGame();
}

// Event listener for start button
startButton.addEventListener('click', startGame);

// Initialize deck
function initializeDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
}

// Shuffle deck
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Deal a card
function dealCard() {
  return deck.pop();
}

// Calculate hand value
function calculateHandValue(hand) {
  let value = 0;
  let aceCount = 0;

  for (let card of hand) {
    value += cardValues[card.value];
    if (card.value === 'A') aceCount++;
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
}

// Update UI
function updateUI() {
  playerMoneyElement.textContent = playerMoney;
  currentBetElement.textContent = currentBet;
  playerScoreElement.textContent = calculateHandValue(playerHand);
  dealerScoreElement.textContent = gameInProgress ? calculateHandValue([dealerHand[0]]) : calculateHandValue(dealerHand);

  playerCardsElement.innerHTML = '';
  dealerCardsElement.innerHTML = '';

  playerHand.forEach(card => {
    playerCardsElement.appendChild(createCardElement(card));
  });

  dealerHand.forEach((card, index) => {
    if (index === 1 && gameInProgress) {
      dealerCardsElement.appendChild(createCardElement(null, true));
    } else {
      dealerCardsElement.appendChild(createCardElement(card));
    }
  });
}

// Create card element
function createCardElement(card, faceDown = false) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  
  if (!faceDown && card) {
    cardElement.textContent = `${card.value}${card.suit}`;
    cardElement.style.color = (card.suit === '♥' || card.suit === '♦') ? 'var(--accent-color)' : 'var(--text-color)';
  } else {
    cardElement.textContent = '?';
    cardElement.style.color = 'var(--primary-color)';
  }
  
  return cardElement;
}

// Start new game
function startNewGame() {
  gameInProgress = false;
  playerHand = [];
  dealerHand = [];
  currentBet = 0;
  updateUI();
  setMessage("Place your bet!");
  toggleControls(true);
}

// Place bet
function placeBet(amount) {
  if (playerMoney >= amount) {
    currentBet += amount;
    playerMoney -= amount;
    updateUI();
    dealButton.disabled = currentBet === 0;
  }
}

// Increase bet
function increaseBet() {
  placeBet(5);
}

// Decrease bet
function decreaseBet() {
  if (currentBet >= 5) {
    currentBet -= 5;
    playerMoney += 5;
    updateUI();
    dealButton.disabled = currentBet === 0;
  }
}

// Deal initial cards
function dealInitialCards() {
  initializeDeck();
  shuffleDeck();
  playerHand = [dealCard(), dealCard()];
  dealerHand = [dealCard(), dealCard()];
  gameInProgress = true;
  updateUI();
  checkForBlackjack();
}

// Hit
function hit() {
  playerHand.push(dealCard());
  updateUI();
  if (calculateHandValue(playerHand) > 21) {
    endGame("Player busts! Dealer wins.");
  }
}

// Stand
function stand() {
  gameInProgress = false;
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(dealCard());
  }
  updateUI();
  determineWinner();
}

// Double down
function doubleDown() {
  if (playerMoney >= currentBet) {
    playerMoney -= currentBet;
    currentBet *= 2;
    playerHand.push(dealCard());
    updateUI();
    if (calculateHandValue(playerHand) > 21) {
      endGame("Player busts! Dealer wins.");
    } else {
      stand();
    }
  }
}

// Check for blackjack
function checkForBlackjack() {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  if (playerValue === 21 && dealerValue === 21) {
    endGame("Both have Blackjack! It's a tie!");
  } else if (playerValue === 21) {
    endGame("Blackjack! Player wins!");
  } else if (dealerValue === 21) {
    endGame("Dealer has Blackjack! Dealer wins.");
  } else {
    toggleControls(false);
    setMessage("Hit or Stand?");
  }
}

// Determine winner
function determineWinner() {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  if (dealerValue > 21) {
    endGame("Dealer busts! Player wins!");
  } else if (playerValue > dealerValue) {
    endGame("Player wins!");
  } else if (dealerValue > playerValue) {
    endGame("Dealer wins!");
  } else {
    endGame("It's a tie!");
  }
}

// End game
function endGame(message) {
  gameInProgress = false;
  setMessage(message);
  updateUI();
  
  if (message.includes("Player wins")) {
    playerMoney += currentBet * 2;
  } else if (message.includes("tie")) {
    playerMoney += currentBet;
  }
  
  setTimeout(() => {
    startNewGame();
  }, 3000);
}

// Toggle controls
function toggleControls(isBetting) {
  bettingControls.style.display = isBetting ? 'flex' : 'none';
  gameControls.style.display = isBetting ? 'none' : 'flex';
}

// Set message
function setMessage(message) {
  messageElement.textContent = message;
}

// Event listeners
decreaseBetButton.addEventListener('click', decreaseBet);
increaseBetButton.addEventListener('click', increaseBet);
dealButton.addEventListener('click', dealInitialCards);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
doubleButton.addEventListener('click', doubleDown);

// Initialize the game
startScreen.style.display = 'block';
gameScreen.style.display = 'none';
