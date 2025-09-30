// 투사체 클래스들

class Projectile extends Entity {
    constructor() {
        super(0, 0, 4, 12);
        this.damage = 1;
        this.speed = 10;
        this.type = 'laser';
    }

    init(x, y, type = 'laser') {
        this.x = x - this.width / 2;
        this.y = y;
        this.type = type;
        this.active = true;

        if (type === 'laser') {
            this.width = 4;
            this.height = 12;
            this.speed = 10;
            this.velocity.y = -this.speed;
        } else if (type === 'bomb') {
            this.width = 6;
            this.height = 8;
            this.speed = 8;
            this.velocity.y = this.speed;
        } else if (type === 'enemyBullet') {
            this.width = 5;
            this.height = 5;
            this.speed = 6;
            this.velocity.y = this.speed;
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    draw(ctx) {
        if (!this.active) return;

        if (this.type === 'laser') {
            // 플레이어 레이저 - 밝은 청록색
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 5;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        } else if (this.type === 'bomb') {
            // 폭탄 - 노란색
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.type === 'enemyBullet') {
            // 적 탄환 - 빨간색
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

