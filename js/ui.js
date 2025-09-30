// UI 관리 시스템

class UIManager {
    constructor() {
        // UI 요소들
        this.mainMenu = document.getElementById('mainMenu');
        this.gameScreen = document.getElementById('gameScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');

        // 버튼들
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.mainMenuButton = document.getElementById('mainMenuButton');
        this.soundToggle = document.getElementById('soundToggle');

        // 디스플레이 요소들
        this.highScoreDisplay = document.getElementById('highScoreDisplay');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.stageDisplay = document.getElementById('stageDisplay');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.weaponLevelDisplay = document.getElementById('weaponLevelDisplay');
        this.finalScore = document.getElementById('finalScore');
        this.newHighScore = document.getElementById('newHighScore');
    }

    showMainMenu() {
        this.hideAll();
        this.mainMenu.classList.remove('hidden');
    }

    showGameScreen() {
        this.hideAll();
        this.gameScreen.classList.remove('hidden');
    }

    showPauseScreen() {
        this.pauseScreen.classList.remove('hidden');
    }

    hidePauseScreen() {
        this.pauseScreen.classList.add('hidden');
    }

    showGameOverScreen(score, highScore, isNewHighScore) {
        this.finalScore.textContent = score;
        
        if (isNewHighScore) {
            this.newHighScore.classList.remove('hidden');
        } else {
            this.newHighScore.classList.add('hidden');
        }

        this.gameOverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }

    hideAll() {
        this.mainMenu.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    updateScore(score) {
        this.scoreDisplay.textContent = score;
    }

    updateHighScore(highScore) {
        this.highScoreDisplay.textContent = highScore;
    }

    updateStage(stage) {
        this.stageDisplay.textContent = stage;
    }

    updateLives(lives) {
        this.livesDisplay.textContent = '❤'.repeat(Math.max(0, lives));
    }

    updateWeaponLevel(level) {
        if (this.weaponLevelDisplay) {
            this.weaponLevelDisplay.textContent = '★'.repeat(level);
        }
    }

    isSoundEnabled() {
        return this.soundToggle.checked;
    }

    onStartGame(callback) {
        this.startButton.addEventListener('click', callback);
    }

    onRestartGame(callback) {
        this.restartButton.addEventListener('click', callback);
    }

    onMainMenu(callback) {
        this.mainMenuButton.addEventListener('click', callback);
    }

    onSoundToggle(callback) {
        this.soundToggle.addEventListener('change', (e) => {
            callback(e.target.checked);
        });
    }
}

