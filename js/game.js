// 게임 메인 클래스

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = 'menu'; // menu, playing, paused, gameover
        this.lastTime = 0;
        this.deltaTime = 0;

        // 게임 시스템들
        this.input = new InputHandler();
        this.ui = new UIManager();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.background = new Background(canvas);

        // 게임 상태
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.stage = 1;
        this.lives = 3;

        // 게임 객체들
        this.player = new Player(canvas.width / 2 - 16, canvas.height - 100, canvas.width, canvas.height);
        this.projectilePool = new ObjectPool(Projectile, 100); // 풀 크기 증가
        this.enemyPool = new ObjectPool(Enemy, 30);
        this.enemySpawner = new EnemySpawner(canvas.width, canvas.height);
        this.powerUpPool = new ObjectPool(PowerUp, 10);
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 15000; // 15초마다 파워업 생성

        // 스테이지 관리
        this.stageScore = 10000; // 스테이지 클리어 점수
        this.nextStageThreshold = this.stageScore;

        this.setupEventListeners();
        this.ui.updateHighScore(this.highScore);
    }

    setupEventListeners() {
        // UI 이벤트
        this.ui.onStartGame(() => this.startGame());
        this.ui.onRestartGame(() => this.restartGame());
        this.ui.onMainMenu(() => this.returnToMenu());
        this.ui.onSoundToggle((enabled) => {
            this.audio.setSoundEnabled(enabled);
        });

        // 키보드 이벤트 (일시정지)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.state === 'playing') {
                this.pauseGame();
            } else if (e.code === 'Escape' && this.state === 'paused') {
                this.resumeGame();
            }
        });

        // 사운드 설정 초기화
        this.audio.setSoundEnabled(this.ui.isSoundEnabled());
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.stage = 1;
        this.lives = 3;
        this.nextStageThreshold = this.stageScore;

        // 게임 객체 초기화
        this.player.reset(this.canvas.width / 2 - 16, this.canvas.height - 100);
        this.projectilePool.clear();
        this.enemyPool.clear();
        this.powerUpPool.clear();
        this.enemySpawner.reset();
        this.particles.clear();
        this.background.reset();
        this.powerUpSpawnTimer = 0;

        // UI 업데이트
        this.ui.showGameScreen();
        this.updateUI();
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.ui.showPauseScreen();
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.ui.hidePauseScreen();
        }
    }

    gameOver() {
        this.state = 'gameover';
        this.audio.playGameOver();

        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.ui.updateHighScore(this.highScore);
        }

        this.ui.showGameOverScreen(this.score, this.highScore, isNewHighScore);
    }

    restartGame() {
        this.ui.hideGameOverScreen();
        this.startGame();
    }

    returnToMenu() {
        this.state = 'menu';
        this.ui.showMainMenu();
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        // 배경 업데이트
        this.background.update(deltaTime, this.stage);

        // 플레이어 업데이트
        this.player.update(deltaTime, this.input);

        // 플레이어 발사
        if (this.input.isKeyPressed('Space')) {
            const laserDataArray = this.player.fireLaser();
            if (laserDataArray) {
                laserDataArray.forEach(laserData => {
                    const projectile = this.projectilePool.get();
                    projectile.init(
                        laserData.x, 
                        laserData.y, 
                        laserData.type, 
                        laserData.angle || -90,
                        laserData.enhanced || false
                    );
                });
                this.audio.playLaser();
            }
        }

        if (this.input.isKeyPressed('KeyZ')) {
            const bombData = this.player.fireBomb();
            if (bombData) {
                const projectile = this.projectilePool.get();
                projectile.init(bombData.x, bombData.y, bombData.type, -90, false);
                this.audio.playBomb();
            }
        }

        // 파워업 생성
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.powerUpSpawnTimer = 0;
            this.spawnPowerUp();
        }

        // 파워업 업데이트
        const powerUps = this.powerUpPool.getActive();
        powerUps.forEach(powerUp => {
            powerUp.update(deltaTime);
            
            // 화면 밖으로 나가면 제거
            if (powerUp.isOffScreen(this.canvas.width, this.canvas.height)) {
                this.powerUpPool.release(powerUp);
            }
        });

        // 투사체 업데이트
        const projectiles = this.projectilePool.getActive();
        projectiles.forEach(projectile => {
            projectile.update(deltaTime);

            // 화면 밖으로 나가면 제거
            if (projectile.isOffScreen(this.canvas.width, this.canvas.height)) {
                this.projectilePool.release(projectile);
            }

            // 레이저/폭탄 트레일 효과
            if (projectile.type === 'laser' && Math.random() < 0.3) {
                this.particles.createTrail(projectile.x + projectile.width / 2, projectile.y + projectile.height);
            }
        });

        // 적 생성
        const spawnData = this.enemySpawner.update(deltaTime, this.stage);
        spawnData.forEach(data => {
            const enemy = this.enemyPool.get();
            enemy.init(data.x, data.y, data.type, data.canShoot, data.isGroundTarget);
        });

        // 적 업데이트
        const enemies = this.enemyPool.getActive();
        enemies.forEach(enemy => {
            const enemyProjectile = enemy.update(deltaTime, this.background.scrollSpeed, this.player.x, this.player.y);

            // 적이 발사한 투사체
            if (enemyProjectile) {
                const projectile = this.projectilePool.get();
                projectile.init(enemyProjectile.x, enemyProjectile.y, enemyProjectile.type);
            }

            // 화면 밖으로 나가면 제거
            if (enemy.isOffScreen(this.canvas.width, this.canvas.height, 100)) {
                this.enemyPool.release(enemy);
            }
        });

        // 충돌 감지
        this.checkCollisions();

        // 파티클 업데이트
        this.particles.update(deltaTime);

        // 스테이지 진행
        if (this.score >= this.nextStageThreshold) {
            this.nextStage();
        }
    }

    checkCollisions() {
        const projectiles = this.projectilePool.getActive();
        const enemies = this.enemyPool.getActive();

        // 플레이어 투사체 vs 적
        projectiles.forEach(projectile => {
            if (!projectile.active) return;
            if (projectile.type === 'enemyBullet') return;

            enemies.forEach(enemy => {
                if (!enemy.active) return;

                // 레이저는 공중 적만, 폭탄은 지상 목표물만
                if (projectile.type === 'laser' && enemy.isGroundTarget) return;
                if (projectile.type === 'bomb' && !enemy.isGroundTarget) return;

                if (CollisionDetector.checkEntityCollision(projectile, enemy)) {
                    const destroyed = enemy.hit(projectile.damage);
                    this.projectilePool.release(projectile);

                    if (destroyed) {
                        this.score += enemy.score;
                        this.particles.createExplosion(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2,
                            enemy.isGroundTarget ? 15 : 10
                        );
                        this.audio.playExplosion();
                        
                        // 파워업 드롭 확률 (10%)
                        if (Math.random() < 0.1) {
                            this.spawnPowerUpAt(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        }
                        
                        this.enemyPool.release(enemy);
                    } else {
                        this.particles.createSmallExplosion(
                            projectile.x,
                            projectile.y
                        );
                        this.audio.playHit();
                    }

                    this.ui.updateScore(this.score);
                }
            });
        });

        // 적 투사체 vs 플레이어
        projectiles.forEach(projectile => {
            if (!projectile.active) return;
            if (projectile.type !== 'enemyBullet') return;

            if (CollisionDetector.checkEntityCollision(projectile, this.player)) {
                this.projectilePool.release(projectile);
                this.hitPlayer();
            }
        });

        // 적 vs 플레이어 (충돌)
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            if (enemy.isGroundTarget) return; // 지상 목표물은 충돌 안함

            if (CollisionDetector.checkEntityCollision(enemy, this.player)) {
                this.enemyPool.release(enemy);
                this.particles.createExplosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2
                );
                this.audio.playExplosion();
                this.hitPlayer();
            }
        });

        // 파워업 vs 플레이어
        const powerUps = this.powerUpPool.getActive();
        powerUps.forEach(powerUp => {
            if (!powerUp.active) return;

            if (CollisionDetector.checkEntityCollision(powerUp, this.player)) {
                const success = this.player.powerUp(powerUp.type);
                if (success) {
                    this.audio.playPowerUp();
                    this.particles.createExplosion(
                        powerUp.x + powerUp.width / 2,
                        powerUp.y + powerUp.height / 2,
                        8,
                        this.getPowerUpColor(powerUp.type)
                    );
                    this.powerUpPool.release(powerUp);
                    
                    // UI 업데이트
                    this.ui.updateLives(this.player.health);
                    this.ui.updateWeaponLevel(this.player.weaponLevel);
                }
            }
        });
    }

    getPowerUpColor(type) {
        switch(type) {
            case 'weapon': return '#ff3333';
            case 'life': return '#00ff00';
            case 'bomb': return '#ffff00';
            case 'shield': return '#00ffff';
            default: return '#ffffff';
        }
    }

    spawnPowerUp() {
        const x = Utils.randomInt(50, this.canvas.width - 50);
        const y = -30;
        const types = ['weapon', 'life', 'bomb', 'shield'];
        const weights = [0.5, 0.2, 0.2, 0.1]; // weapon이 가장 높은 확률
        const type = this.weightedRandom(types, weights);
        
        const powerUp = this.powerUpPool.get();
        powerUp.init(x, y, type);
    }

    spawnPowerUpAt(x, y) {
        const types = ['weapon', 'life', 'bomb', 'shield'];
        const weights = [0.6, 0.2, 0.15, 0.05];
        const type = this.weightedRandom(types, weights);
        
        const powerUp = this.powerUpPool.get();
        powerUp.init(x, y, type);
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[0];
    }

    hitPlayer() {
        const died = this.player.hit();
        
        if (died) {
            this.lives = 0;
            this.particles.createExplosion(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                20,
                '#00ff00'
            );
            this.gameOver();
        } else {
            this.lives = this.player.health;
            this.particles.createExplosion(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                8,
                '#ffff00'
            );
            this.audio.playHit();
        }

        this.ui.updateLives(this.lives);
    }

    nextStage() {
        this.stage++;
        this.nextStageThreshold += this.stageScore;
        this.audio.playPowerUp();
        this.ui.updateStage(this.stage);

        // 보너스 생명 (3스테이지마다)
        if (this.stage % 3 === 0 && this.player.health < this.player.maxHealth) {
            this.player.health++;
            this.lives = this.player.health;
            this.ui.updateLives(this.lives);
        }
    }

    render() {
        // 화면 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'menu') {
            return;
        }

        // 배경 그리기
        this.background.draw(this.ctx);

        // 적 그리기
        const enemies = this.enemyPool.getActive();
        const groundEnemies = enemies.filter(e => e.isGroundTarget);
        const airEnemies = enemies.filter(e => !e.isGroundTarget);

        // 지상 목표물 먼저 그리기
        groundEnemies.forEach(enemy => enemy.draw(this.ctx));

        // 파워업 그리기
        const powerUps = this.powerUpPool.getActive();
        powerUps.forEach(powerUp => powerUp.draw(this.ctx));

        // 투사체 그리기
        const projectiles = this.projectilePool.getActive();
        projectiles.forEach(projectile => projectile.draw(this.ctx));

        // 공중 적 그리기
        airEnemies.forEach(enemy => enemy.draw(this.ctx));

        // 플레이어 그리기
        this.player.draw(this.ctx);

        // 파티클 그리기
        this.particles.draw(this.ctx);
    }

    gameLoop(timestamp) {
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // deltaTime 제한 (탭이 백그라운드에 있다가 돌아올 때)
        if (this.deltaTime > 100) {
            this.deltaTime = 16;
        }

        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    start() {
        this.ui.showMainMenu();
        requestAnimationFrame((t) => {
            this.lastTime = t;
            this.gameLoop(t);
        });
    }

    updateUI() {
        this.ui.updateScore(this.score);
        this.ui.updateStage(this.stage);
        this.ui.updateLives(this.lives);
        this.ui.updateWeaponLevel(this.player.weaponLevel);
    }

    saveHighScore() {
        localStorage.setItem('xevious_highscore', this.highScore.toString());
    }

    loadHighScore() {
        const saved = localStorage.getItem('xevious_highscore');
        return saved ? parseInt(saved) : 0;
    }
}

