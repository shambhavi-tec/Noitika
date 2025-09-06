// 2048 Game with Supabase Leaderboard Integration
document.addEventListener("DOMContentLoaded", () => {
    // Supabase configuration
    const SUPABASE_URL = 'https://uipjgsthdtclfxmahxsa.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcGpnc3RoZHRjbGZ4bWFoeHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTc1MDMsImV4cCI6MjA2NDczMzUwM30.408LIhibOoLXoMzZFRIQEFLIpu21wqjTYhWlU1ZM65o';
    
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Game variables
    const gridDisplay = document.querySelector(".grid")
    const scoreDisplay = document.querySelector("#score")
    const resultDisplay = document.querySelector("#result")
    const width = 4
    let squares = []
    let score = 0
    let gameStartTime = Date.now()
    let gameOver = false
    let playerName = null

    // Get player name for leaderboard
    function getPlayerName() {
        if (!playerName) {
            playerName = prompt("Enter your name for the leaderboard:") || "Anonymous"
        }
        return playerName
    }

    // Save score to Supabase - Updated to match your table structure
    async function saveScoreToSupabase(finalScore, timeInSeconds) {
        try {
            const { data, error } = await supabase
                .from('game_scores')
                .insert([
                    {
                        game_name: '2048',
                        player_name: getPlayerName(),
                        score: finalScore,
                        time_played: timeInSeconds,
                        created_at: new Date().toISOString()
                    }
                ])

            if (error) {
                console.error('Error saving score:', error)
                // Fallback to localStorage if Supabase fails
                saveToLocalStorage(finalScore, timeInSeconds)
            } else {
                console.log('Score saved successfully:', data)
                showMessage("Score saved to leaderboard!")
            }
        } catch (err) {
            console.error('Network error:', err)
            // Fallback to localStorage
            saveToLocalStorage(finalScore, timeInSeconds)
        }
    }

    // Fallback localStorage function - Updated
    function saveToLocalStorage(finalScore, timeInSeconds) {
        const gameData = {
            score: finalScore,
            time: timeInSeconds,
            date: new Date().toISOString(),
            playerName: getPlayerName()
        }
        
        let savedScores = JSON.parse(localStorage.getItem('2048_scores') || '[]')
        savedScores.push(gameData)
        
        // Keep only top 10 scores
        savedScores.sort((a, b) => b.score - a.score)
        savedScores = savedScores.slice(0, 10)
        
        localStorage.setItem('2048_scores', JSON.stringify(savedScores))
        console.log('Score saved to localStorage as backup')
    }

    // Load and display leaderboard - Updated to match your table
    async function loadLeaderboard() {
        try {
            const { data, error } = await supabase
                .from('game_scores')
                .select('*')
                .eq('game_name', '2048')
                .order('score', { ascending: false })
                .limit(10)

            if (error) {
                console.error('Error loading leaderboard:', error)
                return []
            }

            return data || []
        } catch (err) {
            console.error('Network error loading leaderboard:', err)
            return []
        }
    }

    // Show message to user
    function showMessage(message) {
        const messageDiv = document.createElement('div')
        messageDiv.textContent = message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #8f7a66;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        `
        document.body.appendChild(messageDiv)
        
        setTimeout(() => {
            document.body.removeChild(messageDiv)
        }, 3000)
    }

    // Create leaderboard button
    function createLeaderboardButton() {
        const button = document.createElement('button')
        button.textContent = 'View Leaderboard'
        button.style.cssText = `
            margin-top: 10px;
            padding: 10px 20px;
            background: #8f7a66;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 16px;
        `
        
        button.addEventListener('click', async () => {
            const scores = await loadLeaderboard()
            displayLeaderboard(scores)
        })
        
        document.querySelector('.container').appendChild(button)
    }

    // Display leaderboard modal - Updated to remove level column
    function displayLeaderboard(scores) {
        const modal = document.createElement('div')
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `
        
        const content = document.createElement('div')
        content.style.cssText = `
            background: #faf8ef;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        `
        
        let html = '<h2 style="color: #776E65; text-align: center;">🏆 Leaderboard</h2>'
        
        if (scores.length === 0) {
            html += '<p style="text-align: center;">No scores yet. Be the first!</p>'
        } else {
            html += '<ol style="padding-left: 20px;">'
            scores.forEach((score, index) => {
                const date = new Date(score.created_at).toLocaleDateString()
                const timeMinutes = Math.floor(score.time_played / 60)
                const timeSeconds = score.time_played % 60
                const timeDisplay = timeMinutes > 0 ? `${timeMinutes}m ${timeSeconds}s` : `${timeSeconds}s`
                
                html += `
                    <li style="margin: 10px 0; padding: 10px; background: #ede0c8; border-radius: 5px;">
                        <strong>${score.player_name}</strong><br>
                        Score: ${score.score} | Time: ${timeDisplay}<br>
                        <small>Date: ${date}</small>
                    </li>
                `
            })
            html += '</ol>'
        }
        
        html += '<button onclick="this.parentElement.parentElement.remove()" style="display: block; margin: 20px auto; padding: 10px 20px; background: #8f7a66; color: white; border: none; border-radius: 3px; cursor: pointer;">Close</button>'
        
        content.innerHTML = html
        modal.appendChild(content)
        document.body.appendChild(modal)
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal)
            }
        })
    }

    // create the playing board
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div")
            square.innerHTML = 0
            gridDisplay.appendChild(square)
            squares.push(square)
        }
        generate()
        generate()
    }
    createBoard()

    //generate a new number
    function generate() {
        const randomNumber = Math.floor(Math.random() * squares.length)
        if (squares[randomNumber].innerHTML == 0) {
            squares[randomNumber].innerHTML = 2
            checkForGameOver()
        } else generate()
    }

    function moveRight() {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let totalOne = squares[i].innerHTML
                let totalTwo = squares[i + 1].innerHTML
                let totalThree = squares[i + 2].innerHTML
                let totalFour = squares[i + 3].innerHTML
                let row = [parseInt(totalOne), parseInt(totalTwo), parseInt(totalThree), parseInt(totalFour)]

                let filteredRow = row.filter(num => num)
                let missing = 4 - filteredRow.length
                let zeros = Array(missing).fill(0)
                let newRow = zeros.concat(filteredRow)

                squares[i].innerHTML = newRow[0]
                squares[i + 1].innerHTML = newRow[1]
                squares[i + 2].innerHTML = newRow[2]
                squares[i + 3].innerHTML = newRow[3]
            }
        }
    }

    function moveLeft() {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let totalOne = squares[i].innerHTML
                let totalTwo = squares[i + 1].innerHTML
                let totalThree = squares[i + 2].innerHTML
                let totalFour = squares[i + 3].innerHTML
                let row = [parseInt(totalOne), parseInt(totalTwo), parseInt(totalThree), parseInt(totalFour)]

                let filteredRow = row.filter(num => num)
                let missing = 4 - filteredRow.length
                let zeros = Array(missing).fill(0)
                let newRow = filteredRow.concat(zeros)

                squares[i].innerHTML = newRow[0]
                squares[i + 1].innerHTML = newRow[1]
                squares[i + 2].innerHTML = newRow[2]
                squares[i + 3].innerHTML = newRow[3]
            }
        }
    }

    function moveUp() {
        for (let i = 0; i < 4; i++) {
            let totalOne = squares[i].innerHTML
            let totalTwo = squares[i + width].innerHTML
            let totalThree = squares[i + width * 2].innerHTML
            let totalFour = squares[i + width * 3].innerHTML
            let column = [parseInt(totalOne), parseInt(totalTwo), parseInt(totalThree), parseInt(totalFour)]

            let filteredColumn = column.filter(num => num)
            let missing = 4 - filteredColumn.length
            let zeros = Array(missing).fill(0)
            let newColumn = filteredColumn.concat(zeros)

            squares[i].innerHTML = newColumn[0]
            squares[i + width].innerHTML = newColumn[1]
            squares[i + width * 2].innerHTML = newColumn[2]
            squares[i + width * 3].innerHTML = newColumn[3]
        }
    }

    function moveDown() {
        for (let i = 0; i < 4; i++) {
            let totalOne = squares[i].innerHTML
            let totalTwo = squares[i + width].innerHTML
            let totalThree = squares[i + width * 2].innerHTML
            let totalFour = squares[i + width * 3].innerHTML
            let column = [parseInt(totalOne), parseInt(totalTwo), parseInt(totalThree), parseInt(totalFour)]

            let filteredColumn = column.filter(num => num)
            let missing = 4 - filteredColumn.length
            let zeros = Array(missing).fill(0)
            let newColumn = zeros.concat(filteredColumn)

            squares[i].innerHTML = newColumn[0]
            squares[i + width].innerHTML = newColumn[1]
            squares[i + width * 2].innerHTML = newColumn[2]
            squares[i + width * 3].innerHTML = newColumn[3]
        }
    }

    function combineRow() {
        for (let i = 0; i < 15; i++) {
            if (squares[i].innerHTML === squares[i + 1].innerHTML) {
                let combinedTotal = parseInt(squares[i].innerHTML) + parseInt(squares[i + 1].innerHTML)
                squares[i].innerHTML = combinedTotal
                squares[i + 1].innerHTML = 0
                score += combinedTotal
                scoreDisplay.innerHTML = score
            }
        }
        checkForWin()
    }

    function combineColumn() {
        for (let i = 0; i < 12; i++) {
            if (squares[i].innerHTML === squares[i + width].innerHTML) {
                let combinedTotal = parseInt(squares[i].innerHTML) + parseInt(squares[i + width].innerHTML)
                squares[i].innerHTML = combinedTotal
                squares[i + width].innerHTML = 0
                score += combinedTotal
                scoreDisplay.innerHTML = score
            }
        }
        checkForWin()
    }

    function control(e) {
        if (e.key === "ArrowLeft") {
            keyLeft()
        } else if (e.key === "ArrowRight") {
            keyRight()
        } else if (e.key === "ArrowUp") {
            keyUp()
        } else if (e.key === "ArrowDown") {
            keyDown()
        }
    }
    document.addEventListener("keydown", control)

    function keyLeft() {
        moveLeft()
        combineRow()
        moveLeft()
        generate()
    }

    function keyRight() {
        moveRight()
        combineRow()
        moveRight()
        generate()
    }

    function keyUp() {
        moveUp()
        combineColumn()
        moveUp()
        generate()
    }

    function keyDown() {
        moveDown()
        combineColumn()
        moveDown()
        generate()
    }

    function getHighestTile() {
        let highest = 0;
        for (let i = 0; i < squares.length; i++) {
            let value = parseInt(squares[i].innerHTML);
            if (value > highest) {
                highest = value;
            }
        }
        return highest;
    }

    function checkForWin() {
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].innerHTML == 2048) {
                resultDisplay.innerHTML = "You WIN!"
                document.removeEventListener("keydown", control)
                gameOver = true;
                // Save score to Supabase when game ends - removed level parameter
                saveScoreToSupabase(score, Math.floor((Date.now() - gameStartTime) / 1000));
                setTimeout(clear, 3000)
            }
        }
    }

    function checkForGameOver() {
        let zeros = 0
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].innerHTML == 0) {
                zeros++
            }
        }
        if (zeros === 0) {
            resultDisplay.innerHTML = "You LOSE!"
            document.removeEventListener("keydown", control)
            gameOver = true;
            // Save score to Supabase when game ends - removed level parameter
            saveScoreToSupabase(score, Math.floor((Date.now() - gameStartTime) / 1000));
            setTimeout(clear, 3000)
        }
    }

    function clear() {
        clearInterval(myTimer)
    }

    function addColours() {
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].innerHTML == 0) squares[i].style.backgroundColor = "#afa192"
            else if (squares[i].innerHTML == 2) squares[i].style.backgroundColor = "#eee4da"
            else if (squares[i].innerHTML == 4) squares[i].style.backgroundColor = "#ede0c8"
            else if (squares[i].innerHTML == 8) squares[i].style.backgroundColor = "#f2b179"
            else if (squares[i].innerHTML == 16) squares[i].style.backgroundColor = "#ffcea4"
            else if (squares[i].innerHTML == 32) squares[i].style.backgroundColor = "#e8c064"
            else if (squares[i].innerHTML == 64) squares[i].style.backgroundColor = "#ffab6e"
            else if (squares[i].innerHTML == 128) squares[i].style.backgroundColor = "#fd9982"
            else if (squares[i].innerHTML == 256) squares[i].style.backgroundColor = "#ead79c"
            else if (squares[i].innerHTML == 512) squares[i].style.backgroundColor = "#76daff"
            else if (squares[i].innerHTML == 1024) squares[i].style.backgroundColor = "#beeaa5"
            else if (squares[i].innerHTML == 2048) squares[i].style.backgroundColor = "#d7d4f0"
        }
    }
    addColours()

    let myTimer = setInterval(addColours, 50)
    
    // Initialize leaderboard button
    createLeaderboardButton()
})