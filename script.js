// Supabase configuration (replace with your own project details)
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Game names mapping for consistency
const GAME_NAMES = {
    '2048': '2048',
    'wordle': 'Wordle',
    'rock-paper-scissors': 'Rock Paper Scissors',
    'memory': 'Memory Tiles',
    'mario': 'Mario',
    'word-guessing': 'Word Guessing',
    'hangman': 'Hangman'
};

// Navigation menu toggle
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('active');
  });
});

// Theme toggle functionality
function toggleTheme() {
  const body = document.body;
  const icon = document.querySelector('.theme-toggle i');
  body.classList.toggle('dark');
  icon.classList.toggle('bx-moon');
  icon.classList.toggle('bx-sun');

  // Save theme preference
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
}

// Load saved theme and initialize page
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    document.querySelector('.theme-toggle i').classList.replace('bx-moon', 'bx-sun');
  }
  
  // Check auth state on page load
  checkAuthState();
  
  // Load high scores for game cards
  loadHighScores();
});

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.nav-search input');
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      
      // Check if the search term is found in either title or description
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Display message if no results found
    let visibleCount = 0;
    gameCards.forEach(card => {
      if (card.style.display !== 'none') {
        visibleCount++;
      }
    });
    
    const noResultsMessage = document.getElementById('no-results-message');
    
    if (searchTerm && visibleCount === 0) {
      if (!noResultsMessage) {
        const message = document.createElement('div');
        message.id = 'no-results-message';
        message.textContent = 'No games found matching your search.';
        message.style.textAlign = 'center';
        message.style.padding = '2rem';
        message.style.gridColumn = '1 / -1'; // Span all columns
        document.querySelector('.game-grid').appendChild(message);
      }
    } else if (noResultsMessage) {
      noResultsMessage.remove();
    }
  });
  
  // Clear search when X is clicked (for browsers that support it)
  searchInput.addEventListener('search', function() {
    if (this.value === '') {
      // Reset all cards to visible
      document.querySelectorAll('.game-card').forEach(card => {
        card.style.display = 'block';
      });
      
      // Remove no results message if it exists
      const noResultsMessage = document.getElementById('no-results-message');
      if (noResultsMessage) {
        noResultsMessage.remove();
      }
    }
  });
});

// Typing animation for the search bar
const searchInput = document.querySelector('.nav-search input');
const placeholderText = "Search games...";
let typingIndex = 0;

function typeSearchPlaceholder() {
  if (typingIndex < placeholderText.length && document.activeElement !== searchInput) {
    searchInput.setAttribute("placeholder", placeholderText.slice(0, typingIndex + 1));
    typingIndex++;
    setTimeout(typeSearchPlaceholder, 100);
  }
}

// Reset placeholder if user focuses
searchInput.addEventListener('focus', () => {
  searchInput.setAttribute("placeholder", "");
});

searchInput.addEventListener('blur', () => {
  if (!searchInput.value.trim()) {
    typingIndex = 0;
    typeSearchPlaceholder();
  }
});

// Kick off typing animation
window.addEventListener('DOMContentLoaded', () => {
  if (!searchInput.value.trim()) typeSearchPlaceholder();
});

// Auth functionality
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userWelcome = document.getElementById('user-welcome');

// Direct to login page
loginButton.addEventListener('click', () => {
  window.location.href = "Login/SignUp_LogIn_Form.html";
});

// Handle logout
logoutButton.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  
  if (error) {
    alert(`Error logging out: ${error.message}`);
  } else {
    updateAuthUI(null);
    alert("You have been logged out successfully.");
    // Reload high scores to show only global scores
    loadHighScores();
  }
});

// Check auth state and update UI accordingly
async function checkAuthState() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (session) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    updateAuthUI(user);
  } else {
    updateAuthUI(null);
  }
}

// Update UI based on auth state
function updateAuthUI(user) {
  if (user) {
    loginButton.style.display = 'none';
    logoutButton.style.display = 'flex';
    
    // Display username or email
    const displayName = user.user_metadata?.username || user.email;
    userWelcome.textContent = `Welcome, ${displayName}`;
    userWelcome.style.display = 'block';
  } else {
    loginButton.style.display = 'flex';
    logoutButton.style.display = 'none';
    userWelcome.style.display = 'none';
  }
}

// Score Management Functions
// async function saveScore(gameName, score, levelReached = null, timePlayed = null) {
//   const { data: { session } } = await supabaseClient.auth.getSession();
  
//   if (!session) {
//     console.log('User not logged in, score not saved');
//     return false;
//   }

//   try {
//     const { error } = await supabaseClient
//       .from('game_scores')
//       .insert({
//         user_id: session.user.id,
//         game_name: gameName,
//         score: score,
//         level_reached: levelReached,
//         time_played: timePlayed
//       });

//     if (error) throw error;
    
//     console.log(`Score saved for ${gameName}: ${score}`);
//     // Refresh high scores after saving
//     loadHighScores();
//     return true;
//   } catch (error) {
//     console.error('Error saving score:', error);
//     return false;
//   }
// }

//Alternate VERSION
// Function to save game score and update user stats

async function saveScore(gameName, score, levelReached = null, timePlayed = null) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    console.log('User not logged in, score not saved');
    return false;
  }

  try {
    const userId = session.user.id;

    // Insert new score into game_scores
    const { error: insertError } = await supabaseClient
      .from('game_scores')
      .insert({
        user_id: userId,
        game_name: gameName,
        score: score,
        level_reached: levelReached,
        time_played: timePlayed
      });

    if (insertError) throw insertError;

    // Update user_game_stats
    await supabaseClient.rpc('update_user_stats', {
      game_name_param: gameName,
      user_id_param: userId,
      new_score: score
    });

    console.log(`Score saved for ${gameName}: ${score}`);
    loadHighScores();
    return true;

  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}

async function getUserHighScore(gameName) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) return null;

  try {
    const { data, error } = await supabaseClient
      .from('user_game_stats')
      .select('highest_score, total_games_played, last_played')
      .eq('user_id', session.user.id)
      .eq('game_name', gameName)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user high score:', error);
    return null;
  }
}

async function getGlobalHighScore(gameName) {
  try {
    const { data, error } = await supabaseClient
      .from('game_scores')
      .select('score, achieved_at')
      .eq('game_name', gameName)
      .order('score', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching global high score:', error);
    return null;
  }
}

async function loadHighScores() {
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach(async (card) => {
    const gameTitle = card.querySelector('h3').textContent;
    const gameName = GAME_NAMES[gameTitle.toLowerCase().replace(/\s+/g, '-')] || gameTitle;
    
    // Remove existing score display
    const existingScoreDiv = card.querySelector('.score-display');
    if (existingScoreDiv) {
      existingScoreDiv.remove();
    }
    
    // Create score display container
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-display';
    
    // Get global high score
    const globalHigh = await getGlobalHighScore(gameName);
    
    // Get user high score if logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    let userStats = null;
    if (session) {
      userStats = await getUserHighScore(gameName);
    }
    
    // Build score display HTML
    let scoreHTML = '';
    
    if (globalHigh) {
      scoreHTML += `<div class="global-score">🏆 Global High: ${globalHigh.score}</div>`;
    }
    
    if (userStats) {
      scoreHTML += `<div class="user-score">⭐ Your Best: ${userStats.highest_score}</div>`;
      scoreHTML += `<div class="games-played">🎮 Played: ${userStats.total_games_played} times</div>`;
    }
    
    if (!globalHigh && !userStats) {
      scoreHTML = '<div class="no-scores">No scores yet - be the first!</div>';
    }
    
    scoreDiv.innerHTML = scoreHTML;
    
    // Insert score display before the play button
    const playButton = card.querySelector('a');
    playButton.parentNode.insertBefore(scoreDiv, playButton);
  });
}

// Make saveScore function globally available for games to use
window.saveGameScore = saveScore;

// Listen for score updates from games
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'gameScore') {
    const { gameName, score, levelReached, timePlayed } = event.data;
    saveScore(gameName, score, levelReached, timePlayed);
  }
});

// Refresh scores when user logs in/out
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    loadHighScores();
  }
});