// Game state
let gameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  score: 0,
  gameActive: false
};

// Manual backup icon sets (always available)
const backupIconSets = [
  ['🍎', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸'],
  ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒'],
  ['🎵', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻', '🎤'],
  ['🌟', '⭐', '💫', '✨', '🌙', '☀️', '🌈', '⚡']
];

// API configurations
const iconAPIs = {
  // FontAwesome API (free tier)
  fontawesome: {
    categories: ['solid', 'regular', 'brands'],
    icons: {
      solid: ['heart', 'star', 'home', 'user', 'bell', 'car', 'phone', 'book', 'music', 'gift', 'camera', 'leaf'],
      regular: ['smile', 'heart', 'star', 'moon', 'sun', 'clock', 'envelope', 'eye', 'thumbs-up', 'handshake', 'gem', 'lightbulb'],
      brands: ['apple', 'google', 'twitter', 'facebook', 'youtube', 'spotify', 'github', 'linkedin', 'instagram', 'discord', 'steam', 'twitch']
    }
  }
};

// Function to get icons from API
async function fetchIconsFromAPI() {
  try {
    // Try to fetch from a simple API that returns SVG icons
    // Using a placeholder API structure - you can replace with actual API
    const categories = ['animals', 'food', 'sports', 'technology', 'nature', 'transportation'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Simulated API call - replace with actual API endpoint
    // const response = await fetch(`https://api.example.com/icons/${randomCategory}?limit=12`);
    
    // For demonstration, we'll use a mock API response
    // In practice, you'd replace this with a real API call
    const mockAPIResponse = await simulateAPICall(randomCategory);
    
    if (mockAPIResponse && mockAPIResponse.length >= 6) {
      return mockAPIResponse.slice(0, 6);
    }
    
    throw new Error('Not enough icons from API');
    
  } catch (error) {
    console.log('API fetch failed, using backup icons:', error.message);
    return null;
  }
}

// Simulate API call with FontAwesome-style icons
async function simulateAPICall(category) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const iconSets = {
        animals: ['🦁', '🐸', '🐙', '🦋', '🐢', '🦅', '🐺', '🦒'],
        food: ['🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🥗', '🍰'],
        sports: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🏓', '🥊'],
        technology: ['💻', '📱', '⌚', '📷', '🎮', '💾', '🖨️', '📡'],
        nature: ['🌸', '🌲', '🍄', '🌊', '⛰️', '🔥', '❄️', '🌪️'],
        transportation: ['🚗', '✈️', '🚂', '🚢', '🚁', '🚴', '🛵', '🚀']
      };
      
      // Simulate occasional API failure
      if (Math.random() < 0.2) { // 20% chance of "API failure"
        resolve(null);
      } else {
        resolve(iconSets[category] || iconSets.animals);
      }
    }, 500); // Simulate network delay
  });
}

// Enhanced function to get icons (API first, then backup)
async function getIconSet() {
  // First try to get icons from API
  const apiIcons = await fetchIconsFromAPI();
  
  if (apiIcons) {
    console.log('Using icons from API');
    return apiIcons;
  }
  
  // Fall back to manual emoji sets
  console.log('Using backup emoji icons');
  const randomIndex = Math.floor(Math.random() * backupIconSets.length);
  return backupIconSets[randomIndex];
}

async function createCardArray() {
  const icons = await getIconSet();
  const pairs = icons.slice(0, 6); // Use 6 different icons for 12 cards
  const cardArray = [...pairs, ...pairs]; // Create pairs
  return shuffleArray(cardArray);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function createBoard() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  
  // Show loading message
  document.getElementById('gameMessage').innerHTML = '<span class="loading">Loading new icons...</span>';
  
  gameState.cards = await createCardArray();
  
  // Clear loading message
  document.getElementById('gameMessage').innerHTML = '';
  
  gameState.cards.forEach((icon, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = index;
    card.dataset.icon = icon;
    card.innerHTML = '<div class="card-back">?</div>';
    card.addEventListener('click', flipCard);
    grid.appendChild(card);
  });
}

function flipCard(event) {
  if (!gameState.gameActive) {
    gameState.gameActive = true;
  }

  const card = event.currentTarget;
  const cardId = parseInt(card.dataset.id);
  
  // Prevent flipping same card twice or more than 2 cards
  if (gameState.flippedCards.length >= 2 || 
      gameState.flippedCards.includes(cardId) || 
      card.classList.contains('matched')) {
    return;
  }

  // Flip the card
  card.classList.add('flipped');
  card.innerHTML = `<div class="card-icon">${card.dataset.icon}</div>`;
  gameState.flippedCards.push(cardId);

  if (gameState.flippedCards.length === 2) {
    setTimeout(() => {
      checkForMatch();
    }, 800);
  }
}

function checkForMatch() {
  const [firstId, secondId] = gameState.flippedCards;
  const firstCard = document.querySelector(`[data-id="${firstId}"]`);
  const secondCard = document.querySelector(`[data-id="${secondId}"]`);
  
  if (gameState.cards[firstId] === gameState.cards[secondId]) {
    // Match found
    firstCard.classList.remove('flipped');
    firstCard.classList.add('matched');
    secondCard.classList.remove('flipped');
    secondCard.classList.add('matched');
    
    gameState.matchedPairs++;
    gameState.score += 100; // Base points for match
    
    checkWinCondition();
  } else {
    // No match
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard.innerHTML = '<div class="card-back">?</div>';
    secondCard.innerHTML = '<div class="card-back">?</div>';
    
    // Lose points for wrong guess
    gameState.score = Math.max(0, gameState.score - 10);
  }
  
  gameState.flippedCards = [];
  updateDisplay();
}

function checkWinCondition() {
  if (gameState.matchedPairs === 6) { // 6 pairs = 12 cards
    gameState.gameActive = false;
    
    const message = `🎉 Congratulations! You won!<br>
                    Final Score: ${gameState.score}`;
    
    document.getElementById('gameMessage').innerHTML = message;
    updateDisplay();
  }
}

function updateDisplay() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('matches').textContent = gameState.matchedPairs;
}

async function startNewGame() {
  resetGame();
  await createBoard();
  document.getElementById('gameMessage').innerHTML = '';
}

function resetGame() {
  gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    score: 0,
    gameActive: false
  };
  
  updateDisplay();
  document.getElementById('gameMessage').innerHTML = '';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  startNewGame();
});