// 플레이어 클래스

class Player extends Entity {
    constructor(x, y, canvasWidth, canvasHeight) {
        super(x, y, 32, 32);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.speed = 5;
        this.health = 3;
        this.maxHealth = 3;
        this.laserCooldown = 0;
        this.bombCooldown = 0;
        this.laserFireRate = 150; // 밀리초
        this.bombFireRate = 400;
        this.invincible = false;
        this.invincibleTime = 0;
        this.invincibleDuration = 2000; // 2초
    }

    update(deltaTime, input) {
        if (!this.active) return;

        // 이동 처리
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (input.isKeyPressed('ArrowLeft')) {
            this.velocity.x = -this.speed;
        }
        if (input.isKeyPressed('ArrowRight')) {
            this.velocity.x = this.speed;
        }
        if (input.isKeyPressed('ArrowUp')) {
            this.velocity.y = -this.speed;
        }
        if (input.isKeyPressed('ArrowDown')) {
            this.velocity.y = this.speed;
        }

        // 위치 업데이트
        super.update(deltaTime);

        // 화면 경계 제한
        this.x = Utils.clamp(this.x, 0, this.canvasWidth - this.width);
        this.y = Utils.clamp(this.y, this.canvasHeight / 2, this.canvasHeight - this.height);

        // 쿨다운 업데이트
        if (this.laserCooldown > 0) {
            this.laserCooldown = Math.max(0, this.laserCooldown - deltaTime);
        }
        if (this.bombCooldown > 0) {
            this.bombCooldown = Math.max(0, this.bombCooldown - deltaTime);
        }

        // 무적 시간 업데이트
        if (this.invincible) {
            this.invincibleTime += deltaTime;
            if (this.invincibleTime >= this.invincibleDuration) {
                this.invincible = false;
                this.invincibleTime = 0;
            }
        }
    }

    fireLaser() {
        if (this.laserCooldown === 0) {
            this.laserCooldown = this.laserFireRate;
            return {
                x: this.x + this.width / 2,
                y: this.y,
                type: 'laser'
            };
        }
        return null;
    }

    fireBomb() {
        if (this.bombCooldown === 0) {
            this.bombCooldown = this.bombFireRate;
            return {
                x: this.x + this.width / 2,
                y: this.y + this.height,
                type: 'bomb'
            };
        }
        return null;
    }

    hit() {
        if (this.invincible) return false;

        this.health--;
        if (this.health <= 0) {
            this.active = false;
            return true; // 사망
        }

        // 피격 후 무적 시간
        this.invincible = true;
        this.invincibleTime = 0;
        return false;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.active = true;
        this.invincible = false;
        this.invincibleTime = 0;
        this.laserCooldown = 0;
        this.bombCooldown = 0;
    }

    draw(ctx) {
        if (!this.active) return;

        // 무적 상태일 때 깜빡임 효과
        if (this.invincible) {
            const blink = Math.floor(this.invincibleTime / 100) % 2;
            if (blink === 0) return;
        }

        // 플레이어 전투기 그리기
        ctx.save();
        
        // 본체 (삼각형)
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // 상단 중앙
        ctx.lineTo(this.x, this.y + this.height); // 좌하단
        ctx.lineTo(this.x + this.width, this.y + this.height); // 우하단
        ctx.closePath();
        ctx.fill();

        // 날개
        ctx.fillStyle = '#00cc00';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.7);
        ctx.lineTo(this.x - 8, this.y + this.height * 0.9);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width + 8, this.y + this.height * 0.9);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.fill();

        // 조종석
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height * 0.3, 6, 8);

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

