// 투사체 클래스들

class Projectile extends Entity {
    constructor() {
        super(0, 0, 4, 12);
        this.damage = 1;
        this.speed = 10;
        this.type = 'laser';
        this.angle = -90; // 기본 위쪽
        this.enhanced = false;
    }

    init(x, y, type = 'laser', angle = -90, enhanced = false) {
        this.x = x - this.width / 2;
        this.y = y;
        this.type = type;
        this.angle = angle;
        this.enhanced = enhanced;
        this.active = true;

        if (type === 'laser') {
            this.width = enhanced ? 6 : 4;
            this.height = enhanced ? 16 : 12;
            this.speed = 10;
            this.damage = enhanced ? 2 : 1;
            
            // 각도에 따른 속도 설정
            const radians = (angle * Math.PI) / 180;
            this.velocity.x = Math.cos(radians) * this.speed;
            this.velocity.y = Math.sin(radians) * this.speed;
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
            // 플레이어 레이저
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate((this.angle + 90) * Math.PI / 180); // 회전 적용
            
            if (this.enhanced) {
                // 강화된 레이저 - 더 밝고 굵음
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                
                // 내부 밝은 부분
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-this.width / 4, -this.height / 2, this.width / 2, this.height);
            } else {
                // 기본 레이저
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 5;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
            
            ctx.shadowBlur = 0;
            ctx.restore();
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

