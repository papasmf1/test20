// 적 클래스 및 패턴

// 이동 패턴 클래스들
class MovementPattern {
    update(enemy, deltaTime, scrollSpeed) {
        // 기본 구현
    }
}

class StraightPattern extends MovementPattern {
    update(enemy, deltaTime, scrollSpeed) {
        enemy.velocity.y = scrollSpeed + 2;
    }
}

class ZigzagPattern extends MovementPattern {
    constructor() {
        super();
        this.time = 0;
        this.amplitude = 3;
        this.frequency = 0.05;
    }

    update(enemy, deltaTime, scrollSpeed) {
        this.time += deltaTime / 16;
        enemy.velocity.x = Math.sin(this.time * this.frequency) * this.amplitude;
        enemy.velocity.y = scrollSpeed + 2;
    }
}

class CurvePattern extends MovementPattern {
    constructor() {
        super();
        this.time = 0;
        this.amplitude = 4;
        this.frequency = 0.03;
    }

    update(enemy, deltaTime, scrollSpeed) {
        this.time += deltaTime / 16;
        enemy.velocity.x = Math.cos(this.time * this.frequency) * this.amplitude;
        enemy.velocity.y = scrollSpeed + 1.5;
    }
}

class DiverPattern extends MovementPattern {
    constructor(targetX) {
        super();
        this.targetX = targetX;
        this.diving = false;
        this.returnY = 0;
    }

    update(enemy, deltaTime, scrollSpeed) {
        if (!this.diving && enemy.y > 100) {
            this.diving = true;
            this.returnY = enemy.y;
        }

        if (this.diving) {
            const dx = this.targetX - enemy.x;
            const dy = 300 - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                enemy.velocity.x = (dx / distance) * 6;
                enemy.velocity.y = (dy / distance) * 6;
            } else {
                this.diving = false;
                enemy.velocity.y = scrollSpeed + 3;
            }
        } else {
            enemy.velocity.y = scrollSpeed + 2;
        }
    }
}

// 적 클래스
class Enemy extends Entity {
    constructor() {
        super(0, 0, 28, 28);
        this.type = 'straight';
        this.health = 1;
        this.maxHealth = 1;
        this.score = 100;
        this.pattern = null;
        this.canShoot = false;
        this.shootCooldown = 0;
        this.shootRate = 2000; // 2초마다 발사
        this.isGroundTarget = false;
    }

    init(x, y, type, canShoot = false, isGroundTarget = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.canShoot = canShoot;
        this.isGroundTarget = isGroundTarget;
        this.shootCooldown = Math.random() * 1000; // 랜덤 초기 쿨다운

        // 타입에 따른 설정
        switch(type) {
            case 'straight':
                this.pattern = new StraightPattern();
                this.health = 1;
                this.score = 100;
                this.width = 24;
                this.height = 24;
                break;
            case 'zigzag':
                this.pattern = new ZigzagPattern();
                this.health = 1;
                this.score = 150;
                this.width = 26;
                this.height = 26;
                break;
            case 'curve':
                this.pattern = new CurvePattern();
                this.health = 2;
                this.score = 200;
                this.width = 30;
                this.height = 30;
                break;
            case 'diver':
                this.pattern = new DiverPattern(400); // 화면 중앙 목표
                this.health = 1;
                this.score = 250;
                this.width = 28;
                this.height = 28;
                break;
            case 'tank':
                this.isGroundTarget = true;
                this.health = 1;
                this.score = 500;
                this.width = 32;
                this.height = 24;
                this.velocity.y = 0;
                break;
            case 'turret':
                this.isGroundTarget = true;
                this.health = 2;
                this.score = 800;
                this.width = 28;
                this.height = 28;
                this.velocity.y = 0;
                this.canShoot = true;
                break;
            case 'radar':
                this.isGroundTarget = true;
                this.health = 3;
                this.score = 2000;
                this.width = 40;
                this.height = 40;
                this.velocity.y = 0;
                break;
        }

        this.maxHealth = this.health;
    }

    update(deltaTime, scrollSpeed, playerX, playerY) {
        if (!this.active) return null;

        // 패턴에 따른 이동
        if (this.pattern && !this.isGroundTarget) {
            this.pattern.update(this, deltaTime, scrollSpeed);
        } else if (this.isGroundTarget) {
            // 지상 목표물은 스크롤 속도로만 이동
            this.velocity.y = scrollSpeed;
        }

        super.update(deltaTime);

        // 발사 가능한 적의 공격
        let projectile = null;
        if (this.canShoot && this.active) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.shootCooldown = this.shootRate + Math.random() * 1000;
                projectile = {
                    x: this.x + this.width / 2,
                    y: this.y + this.height,
                    type: 'enemyBullet'
                };
            }
        }

        return projectile;
    }

    hit(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            return true; // 파괴됨
        }
        return false;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        if (this.isGroundTarget) {
            // 지상 목표물 그리기
            if (this.type === 'tank') {
                // 탱크
                ctx.fillStyle = '#888888';
                ctx.fillRect(this.x, this.y + 10, this.width, 14);
                ctx.fillStyle = '#666666';
                ctx.fillRect(this.x + 8, this.y + 4, this.width - 16, 10);
                ctx.fillStyle = '#555555';
                ctx.fillRect(this.x + this.width / 2 - 2, this.y, 4, 8);
            } else if (this.type === 'turret') {
                // 포탑
                ctx.fillStyle = '#995555';
                ctx.fillRect(this.x + 4, this.y + 10, this.width - 8, 18);
                ctx.fillStyle = '#ff5555';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + 14, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#cc3333';
                ctx.fillRect(this.x + this.width / 2 - 2, this.y, 4, 14);
            } else if (this.type === 'radar') {
                // 레이더
                ctx.fillStyle = '#4444aa';
                ctx.fillRect(this.x + 8, this.y + 20, this.width - 16, 20);
                ctx.strokeStyle = '#6666ff';
                ctx.lineWidth = 3;
                const time = Date.now() / 1000;
                const angle = (time % 2) * Math.PI;
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
                ctx.lineTo(
                    this.x + this.width / 2 + Math.cos(angle) * 15,
                    this.y + this.height / 2 + Math.sin(angle) * 15
                );
                ctx.stroke();
                ctx.strokeStyle = '#8888ff';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 18, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else {
            // 공중 적 그리기
            ctx.fillStyle = '#ff3333';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8;

            if (this.type === 'straight') {
                // 기본 적 - 사각형
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
            } else if (this.type === 'zigzag') {
                // 지그재그 적 - 다이아몬드
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width / 2, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height / 2);
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 'curve') {
                // 곡선 적 - 원형 (더 강함)
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff6666';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'diver') {
                // 다이버 적 - 삼각형
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y + this.height);
                ctx.lineTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.closePath();
                ctx.fill();
            }
        }

        // 체력바 (체력이 1 이상인 경우)
        if (this.maxHealth > 1) {
            const barWidth = this.width;
            const barHeight = 3;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x, this.y - 6, barWidth, barHeight);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 6, barWidth * healthPercent, barHeight);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// 적 생성 관리자
class EnemySpawner {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.spawnTimer = 0;
        this.spawnInterval = 1500; // 1.5초마다 생성
        this.waveTimer = 0;
        this.currentWave = 0;
        this.stage = 1;
    }

    update(deltaTime, stage) {
        this.stage = stage;
        this.spawnTimer += deltaTime;

        const spawnData = [];

        // 난이도에 따른 생성 간격 조정
        const adjustedInterval = Math.max(800, this.spawnInterval - (stage - 1) * 200);

        if (this.spawnTimer >= adjustedInterval) {
            this.spawnTimer = 0;

            // 랜덤 적 생성
            const enemyTypes = ['straight', 'zigzag', 'curve', 'diver'];
            const weights = [0.4, 0.3, 0.2, 0.1]; // 확률 가중치
            
            const type = this.weightedRandom(enemyTypes, weights);
            const x = Utils.randomInt(50, this.canvasWidth - 50);
            const canShoot = Math.random() < (0.1 + stage * 0.05); // 스테이지가 높을수록 발사 확률 증가

            spawnData.push({
                x: x,
                y: -30,
                type: type,
                canShoot: canShoot,
                isGroundTarget: false
            });

            // 스테이지가 높을수록 동시에 더 많이 생성
            if (stage >= 2 && Math.random() < 0.3) {
                const x2 = Utils.randomInt(50, this.canvasWidth - 50);
                spawnData.push({
                    x: x2,
                    y: -60,
                    type: Utils.randomChoice(['straight', 'zigzag']),
                    canShoot: false,
                    isGroundTarget: false
                });
            }
        }

        // 지상 목표물 생성 (더 낮은 빈도)
        this.waveTimer += deltaTime;
        if (this.waveTimer >= 5000) { // 5초마다
            this.waveTimer = 0;
            const groundTypes = ['tank', 'turret', 'radar'];
            const type = Utils.randomChoice(groundTypes);
            const x = Utils.randomInt(100, this.canvasWidth - 100);

            spawnData.push({
                x: x,
                y: -50,
                type: type,
                canShoot: type === 'turret',
                isGroundTarget: true
            });
        }

        return spawnData;
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

    reset() {
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.currentWave = 0;
    }
}

