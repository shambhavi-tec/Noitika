// Word Guessing Game Integration Template
// Replace your existing script.js with this enhanced version

// Array of words to choose from
const words = [
    "java",
    "javascript",
    "python",
    "pascal",
    "ruby",
    "perl",
    "swift",
    "kotlin",
];

// Game state variables
let randomIndex = Math.floor(Math.random() * words.length);
let selectedWord = words[randomIndex];
let guessedlist = [];
let gameStartTime = Date.now();
let gameOver = false;
let wrongGuesses = 0;
let maxWrongGuesses = 6; // Traditional hangman limit

console.log(selectedWord);

// For initial display Word
let displayWord = "";
for (let i = 0; i < selectedWord.length; i++) {
    displayWord += "_ ";
}
document.getElementById("displayWord").textContent = displayWord;

// Initialize wrong guesses display
function updateWrongGuessesDisplay() {
    const wrongGuessesElement = document.getElementById("wrongGuesses");
    if (wrongGuessesElement) {
        wrongGuessesElement.textContent = `Wrong guesses: ${wrongGuesses}/${maxWrongGuesses}`;
    }
}

// Call this initially if the element exists
updateWrongGuessesDisplay();

// Function to check Guessed letter
function guessLetter() {
    if (gameOver) return;

    let inputElement = document.getElementById("letter-input");

    // To check empty input
    if (!inputElement.value) {
        alert("Empty Input box. Please add input letter");
        return;
    }

    let letter = inputElement.value.toLowerCase();

    // Clear the input field
    inputElement.value = "";

    // Check if the letter has already been guessed
    if (guessedlist.includes(letter)) {
        alert("You have already guessed that letter!");
        return;
    }

    // Add the letter to the guessed letters array
    guessedlist.push(letter);

    // Check if the letter is in the word
    let isCorrectGuess = selectedWord.includes(letter);
    
    if (!isCorrectGuess) {
        wrongGuesses++;
        updateWrongGuessesDisplay();
    }

    // Update the word display based on the guessed letters
    let updatedDisplay = "";
    let allLettersGuessed = true;
    for (let i = 0; i < selectedWord.length; i++) {
        if (guessedlist.includes(selectedWord[i])) {
            updatedDisplay += selectedWord[i] + " ";
        } else {
            updatedDisplay += "_ ";
            allLettersGuessed = false;
        }
    }
    document.getElementById("displayWord").textContent = updatedDisplay;

    // Check win condition
    if (allLettersGuessed) {
        gameOver = true;
        alert("Congratulations! You guessed the word correctly!");
        
        // Calculate score based on performance
        let finalScore = calculateScore();
        let timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
        
        // Save the score
        saveCurrentScore(finalScore, selectedWord.length, timePlayed);
    }
    // Check lose condition
    else if (wrongGuesses >= maxWrongGuesses) {
        gameOver = true;
        alert(`Game Over! The word was: ${selectedWord}`);
        
        // Save score even on loss (could be 0 or partial score)
        let finalScore = calculateScore();
        let timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
        
        saveCurrentScore(finalScore, selectedWord.length, timePlayed);
    }
}

// Calculate score based on game performance
function calculateScore() {
    if (gameOver && wrongGuesses < maxWrongGuesses) {
        // Won the game
        let baseScore = selectedWord.length * 10; // Base points for word length
        let bonusPoints = (maxWrongGuesses - wrongGuesses) * 5; // Bonus for fewer wrong guesses
        let timeBonus = Math.max(0, 60 - Math.floor((Date.now() - gameStartTime) / 1000)); // Time bonus
        
        return baseScore + bonusPoints + timeBonus;
    } else {
        // Lost the game - give partial credit for correct letters
        let correctLetters = 0;
        for (let i = 0; i < selectedWord.length; i++) {
            if (guessedlist.includes(selectedWord[i])) {
                correctLetters++;
            }
        }
        return correctLetters * 2; // 2 points per correct letter
    }
}

// Reset game function
function resetGame() {
    randomIndex = Math.floor(Math.random() * words.length);
    selectedWord = words[randomIndex];
    guessedlist = [];
    gameStartTime = Date.now();
    gameOver = false;
    wrongGuesses = 0;
    
    // Reset display
    displayWord = "";
    for (let i = 0; i < selectedWord.length; i++) {
        displayWord += "_ ";
    }
    document.getElementById("displayWord").textContent = displayWord;
    updateWrongGuessesDisplay();
    
    console.log("New word:", selectedWord);
}

// Score saving function for Word Guessing Game
function saveCurrentScore(finalScore, level = null, timeInSeconds = null) {
    // Check if we're in an iframe or can access parent window
    if (window.parent && window.parent !== window) {
        // Send score to parent window (main site)
        window.parent.postMessage({
            type: 'gameScore',
            gameName: 'WordGuess',
            score: finalScore,
            levelReached: level,
            timePlayed: timeInSeconds
        }, '*');
    } else if (window.saveGameScore) {
        // Direct function call if available
        window.saveGameScore('WordGuess', finalScore, level, timeInSeconds);
    }
    
    console.log(`Score ${finalScore} saved for Word Guessing Game`);
}

// Add event listener for Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        guessLetter();
    }
});

// Add reset button functionality if it exists
const resetButton = document.getElementById("resetButton");
if (resetButton) {
    resetButton.addEventListener('click', resetGame);
}