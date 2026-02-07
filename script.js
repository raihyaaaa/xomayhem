        let board = [];
        let playerSymbol = 'X';
        let computerSymbol = 'O';
        let currentPlayer = 'X';
        let gameActive = false;
        let playerScore = 0;
        let computerScore = 0;
        let tieScore = 0;
        let difficulty = 'medium';
        let gridSize = 3;
        let winCondition = 3;

        function getWinningConditions(size) {
            const conditions = [];
            const winLength = size === 3 ? 3 : size === 5 ? 4 : 5;
            
            // Horizontal
            for (let row = 0; row < size; row++) {
                for (let col = 0; col <= size - winLength; col++) {
                    const condition = [];
                    for (let i = 0; i < winLength; i++) {
                        condition.push(row * size + col + i);
                    }
                    conditions.push(condition);
                }
            }
            
            // Vertical
            for (let col = 0; col < size; col++) {
                for (let row = 0; row <= size - winLength; row++) {
                    const condition = [];
                    for (let i = 0; i < winLength; i++) {
                        condition.push((row + i) * size + col);
                    }
                    conditions.push(condition);
                }
            }
            
            // Diagonal (top-left to bottom-right)
            for (let row = 0; row <= size - winLength; row++) {
                for (let col = 0; col <= size - winLength; col++) {
                    const condition = [];
                    for (let i = 0; i < winLength; i++) {
                        condition.push((row + i) * size + col + i);
                    }
                    conditions.push(condition);
                }
            }
            
            // Diagonal (top-right to bottom-left)
            for (let row = 0; row <= size - winLength; row++) {
                for (let col = winLength - 1; col < size; col++) {
                    const condition = [];
                    for (let i = 0; i < winLength; i++) {
                        condition.push((row + i) * size + col - i);
                    }
                    conditions.push(condition);
                }
            }
            
            return conditions;
        }

        function selectPlayer(symbol) {
            playerSymbol = symbol;
            computerSymbol = symbol === 'X' ? 'O' : 'X';
            
            document.querySelectorAll('.player-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            event.currentTarget.classList.add('selected');
        }

        function selectDifficulty(level) {
            difficulty = level;
            
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            event.currentTarget.classList.add('selected');
        }

        function selectGrid(size) {
            gridSize = size;
            winCondition = size === 3 ? 3 : size === 5 ? 4 : 5;
            
            document.querySelectorAll('.grid-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            event.currentTarget.classList.add('selected');
        }

        function initializeBoard() {
            board = Array(gridSize * gridSize).fill('');
            const boardElement = document.getElementById('board');
            boardElement.innerHTML = '';
            boardElement.className = `board grid-${gridSize}`;
            
            for (let i = 0; i < gridSize * gridSize; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('data-index', i);
                cell.onclick = () => handleCellClick(i);
                boardElement.appendChild(cell);
            }
        }

        function startGame() {
            document.getElementById('playerModal').classList.add('hidden');
            document.getElementById('playerLabel').textContent = `You (${playerSymbol})`;
            document.getElementById('computerLabel').textContent = `AI (${computerSymbol})`;
            
            initializeBoard();
            gameActive = true;
            
            if (playerSymbol === 'O') {
                currentPlayer = 'X';
                updateStatus("AI's turn...");
                setTimeout(computerMove, 800);
            } else {
                currentPlayer = 'X';
                updateStatus('Your turn! Click any square');
            }
        }

        function handleCellClick(index) {
            if (board[index] !== '' || !gameActive || currentPlayer !== playerSymbol) {
                return;
            }

            makeMove(index, playerSymbol);
            
            if (gameActive) {
                currentPlayer = computerSymbol;
                updateStatus("AI's turn...");
                setTimeout(computerMove, 600);
            }
        }

        function makeMove(index, player) {
            board[index] = player;
            const cell = document.querySelectorAll('.cell')[index];
            cell.textContent = player;
            cell.classList.add('taken', player.toLowerCase());

            checkResult();
        }

        function computerMove() {
            if (!gameActive) return;

            let move;
            
            if (difficulty === 'easy') {
                move = getRandomMove();
            } else if (difficulty === 'medium') {
                move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            } else {
                move = getBestMove();
            }

            makeMove(move, computerSymbol);
            currentPlayer = playerSymbol;
            
            if (gameActive) {
                updateStatus('Your turn! Click any square');
            }
        }

        function getRandomMove() {
            const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        function getBestMove() {
            const winningConditions = getWinningConditions(gridSize);
            
            // Try to win
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = computerSymbol;
                    if (checkWinner(computerSymbol)) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }

            // Block player
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = playerSymbol;
                    if (checkWinner(playerSymbol)) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }

            // Take center if available
            const center = Math.floor((gridSize * gridSize) / 2);
            if (board[center] === '') {
                return center;
            }

            // Take corners
            const corners = gridSize === 3 ? [0, 2, 6, 8] : 
                           gridSize === 5 ? [0, 4, 20, 24] :
                           [0, 6, 42, 48];
            const availableCorners = corners.filter(i => board[i] === '');
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }

            return getRandomMove();
        }

        function checkWinner(player) {
            const winningConditions = getWinningConditions(gridSize);
            return winningConditions.some(condition => {
                return condition.every(index => board[index] === player);
            });
        }

        function checkResult() {
            const winningConditions = getWinningConditions(gridSize);
            let roundWon = false;
            let winningCombination = null;

            for (let condition of winningConditions) {
                if (condition.every(index => board[index] !== '' && board[index] === board[condition[0]])) {
                    roundWon = true;
                    winningCombination = condition;
                    break;
                }
            }

            if (roundWon) {
                const winner = board[winningCombination[0]];
                
                winningCombination.forEach(index => {
                    document.querySelectorAll('.cell')[index].classList.add('winner');
                });

                if (winner === playerSymbol) {
                    playerScore++;
                    document.getElementById('playerScore').textContent = playerScore;
                    updateStatus('🎉 You Win! Amazing! New game in 2 seconds...', 'win');
                } else {
                    computerScore++;
                    document.getElementById('computerScore').textContent = computerScore;
                    updateStatus('🤖 AI Wins! Try again! New game in 2 seconds...', 'lose');
                }
                
                gameActive = false;
                
                // Automatically start new game after 2 seconds
                setTimeout(() => {
                    newGame();
                }, 2000);
                
                return;
            }

            if (!board.includes('')) {
                tieScore++;
                document.getElementById('tieScore').textContent = tieScore;
                updateStatus("🤝 It's a Tie! Well played! New game in 2 seconds...", 'tie');
                gameActive = false;
                
                // Automatically start new game after 2 seconds
                setTimeout(() => {
                    newGame();
                }, 2000);
            }
        }

        function updateStatus(message, className = '') {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + className;
        }

        function newGame() {
            initializeBoard();
            gameActive = true;

            if (playerSymbol === 'O') {
                currentPlayer = 'X';
                updateStatus("AI's turn...");
                setTimeout(computerMove, 800);
            } else {
                currentPlayer = 'X';
                updateStatus('Your turn! Click any square');
            }
        }

        function resetScores() {
            playerScore = 0;
            computerScore = 0;
            tieScore = 0;
            
            document.getElementById('playerScore').textContent = '0';
            document.getElementById('computerScore').textContent = '0';
            document.getElementById('tieScore').textContent = '0';
            
            newGame();
        }

        function changeSymbol() {
            document.getElementById('playerModal').classList.remove('hidden');
            gameActive = false;
            initializeBoard();
        }

        function openInfoPage(page) {
            const pages = {
                'about': 'aboutPage',
                'howto': 'howtoPage',
                'contact': 'contactPage'
            };
            
            const pageId = pages[page];
            if (pageId) {
                document.getElementById(pageId).classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeInfoPage(page) {
            const pages = {
                'about': 'aboutPage',
                'howto': 'howtoPage',
                'contact': 'contactPage'
            };
            
            const pageId = pages[page];
            if (pageId) {
                document.getElementById(pageId).classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }

        function handleContactSubmit(event) {
            event.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            alert(`Thank you for your message, ${name}! 🎉\n\nWe've received your message and will get back to you at ${email} as soon as possible.\n\nKeep enjoying the game!`);
            
            event.target.reset();
            closeInfoPage('contact');
        }

        // Initialize on load
        initializeBoard();