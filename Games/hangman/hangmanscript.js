document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const wordDisplay = document.getElementById('word-display');
    const wrongLettersEl = document.getElementById('wrong-letters');
    const messageEl = document.getElementById('message');
    const keyboardEl = document.getElementById('keyboard');
    const newGameBtn = document.getElementById('new-game-btn');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    const hangmanParts = document.querySelectorAll('.hangman-part');

    // Game state
    let selectedWord = '';
    let correctLetters = [];
    let wrongLetters = [];
    let score = 0;
    let highScore = localStorage.getItem('hangmanHighScore') || 0;
    let isPlaying = false;

    // Initialize high score
    highScoreEl.textContent = highScore;

    // Create keyboard
    function createKeyboard() {
        keyboardEl.innerHTML = '';
        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
            const button = document.createElement('button');
            button.className = 'key';
            button.textContent = letter;
            button.id = `key-${letter}`;
            button.addEventListener('click', () => handleGuess(letter));
            keyboardEl.appendChild(button);
        });
    }

    // Fetch random word
    async function getRandomWord() {
        try {
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5');
            const data = await response.json();
            return data?.[0]?.toUpperCase() || getFallbackWord();
        } catch (error) {
            console.error('Error fetching word:', error);
            return getFallbackWord();
        }
    }

    // Fallback words
    function getFallbackWord() {
        const words = ['REACT', 'JAVASCRIPT', 'HANGMAN', 'PYTHON', 'DEVELOPER'];
        return words[Math.floor(Math.random() * words.length)];
    }

    // Initialize game
    async function initGame() {
        isPlaying = true;
        correctLetters = [];
        wrongLetters = [];
        selectedWord = await getRandomWord();
        
        // Reset UI
        hangmanParts.forEach(part => part.style.display = 'none');
        wrongLettersEl.textContent = '';
        messageEl.textContent = '';
        wordDisplay.classList.remove('shake', 'bounce');
        
        // Display underscores
        updateWordDisplay();
        
        // Reset keyboard
        createKeyboard();
        showMessage(`Guess the ${selectedWord.length}-letter word!`, 'info');
    }

    // Update word display
    function updateWordDisplay() {
        wordDisplay.innerHTML = selectedWord
            .split('')
            .map(letter => `<span class="letter">${correctLetters.includes(letter) ? letter : '_'}</span>`)
            .join('');
        
        // Check win condition
        if (!wordDisplay.textContent.includes('_')) {
            gameOver(true);
        }
    }

    // Handle guesses
    function handleGuess(letter) {
        if (!isPlaying) return;
        
        const upperLetter = letter.toUpperCase();
        const keyButton = document.getElementById(`key-${letter}`);
        
        // Ignore duplicate guesses
        if (correctLetters.includes(upperLetter) || wrongLetters.includes(upperLetter)) {
            showMessage('Already guessed!', 'error');
            return;
        }
        
        // Process guess
        if (selectedWord.includes(upperLetter)) {
            correctLetters.push(upperLetter);
            updateScore(10);
            keyButton.classList.add('correct', 'bounce');
            updateWordDisplay();
        } else {
            wrongLetters.push(upperLetter);
            updateScore(-4);
            keyButton.classList.add('wrong', 'shake');
            updateWrongLetters();
        }
        
        keyButton.disabled = true;
    }

    // Update wrong letters
    function updateWrongLetters() {
        wrongLettersEl.textContent = wrongLetters.join(', ');
        if (wrongLetters.length < hangmanParts.length) {
    hangmanParts[wrongLetters.length].style.display = 'block';
}

if (wrongLetters.length >= hangmanParts.length) {
    gameOver(false);
}

    }

    // Game over (FIXED)
    function gameOver(isWin) {
        isPlaying = false;
        
        // Reveal the full word
        wordDisplay.innerHTML = selectedWord
            .split('')
            .map(letter => `<span class="letter">${letter}</span>`)
            .join('');
        
        // Disable all keys
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = true;
        });
        
        // Show result
        if (isWin) {
            updateScore(100);
            showMessage(`You won! The word was ${selectedWord}.`, 'success');
            wordDisplay.classList.add('bounce');
        } else {
            updateScore(-70);
            showMessage(`Game over! The word was ${selectedWord}.`, 'error');
            wordDisplay.classList.add('shake');
        }
    }

    // Update score
    function updateScore(points) {
        score += points;
        scoreEl.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('hangmanHighScore', highScore);
        }
    }

    // Show message
    function showMessage(msg, type) {
        messageEl.textContent = msg;
        messageEl.className = `message ${type}`;
        setTimeout(() => messageEl.textContent = '', 3000);
    }

    // Event listeners
    newGameBtn.addEventListener('click', initGame);
    document.addEventListener('keydown', e => {
        if (isPlaying && /^[a-z]$/i.test(e.key)) {
            const letter = e.key.toLowerCase();
            const keyButton = document.getElementById(`key-${letter}`);
            if (keyButton && !keyButton.disabled) {
                handleGuess(letter);
            }
        }
    });

    // Start the game
    initGame();
});