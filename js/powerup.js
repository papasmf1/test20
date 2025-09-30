// 파워업 아이템 클래스

class PowerUp extends Entity {
    constructor() {
        super(0, 0, 24, 24);
        this.type = 'weapon'; // weapon, life, bomb, shield
        this.velocity.y = 2;
        this.rotationAngle = 0;
    }

    init(x, y, type = 'weapon') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.rotationAngle = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotationAngle += deltaTime * 0.003;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle);

        // 외곽 발광 효과
        ctx.shadowBlur = 15;

        switch(this.type) {
            case 'weapon':
                // 무기 업그레이드 (빨간색 다이아몬드)
                ctx.shadowColor = '#ff0000';
                ctx.fillStyle = '#ff3333';
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(12, 0);
                ctx.lineTo(0, 12);
                ctx.lineTo(-12, 0);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = '#ff9999';
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(6, 0);
                ctx.lineTo(0, 6);
                ctx.lineTo(-6, 0);
                ctx.closePath();
                ctx.fill();

                // 'W' 글자
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('W', 0, 0);
                break;

            case 'life':
                // 생명 회복 (녹색 하트)
                ctx.shadowColor = '#00ff00';
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(-5, -3, 5, 0, Math.PI * 2);
                ctx.arc(5, -3, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-10, 0);
                ctx.lineTo(0, 10);
                ctx.lineTo(10, 0);
                ctx.closePath();
                ctx.fill();
                break;

            case 'bomb':
                // 폭탄 아이템 (노란색 별)
                ctx.shadowColor = '#ffff00';
                ctx.fillStyle = '#ffff00';
                this.drawStar(ctx, 0, 0, 5, 12, 6);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('B', 0, 0);
                break;

            case 'shield':
                // 쉴드 (파란색 육각형)
                ctx.shadowColor = '#00ffff';
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = Math.cos(angle) * 10;
                    const y = Math.sin(angle) * 10;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('S', 0, 0);
                break;
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}

