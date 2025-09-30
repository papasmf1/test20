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
        
        // 무기 업그레이드 시스템
        this.weaponLevel = 1;
        this.maxWeaponLevel = 5;
        this.bombCount = 3; // 특수 폭탄 개수
        this.maxBombCount = 10;
        this.hasShield = false;
        this.shieldDuration = 0;
        this.maxShieldDuration = 10000; // 10초
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

        // 쉴드 시간 업데이트
        if (this.hasShield) {
            this.shieldDuration += deltaTime;
            if (this.shieldDuration >= this.maxShieldDuration) {
                this.hasShield = false;
                this.shieldDuration = 0;
            }
        }
    }

    fireLaser() {
        if (this.laserCooldown === 0) {
            // 무기 레벨에 따른 연사 속도 증가
            const fireRateBonus = (this.weaponLevel - 1) * 20;
            this.laserCooldown = Math.max(80, this.laserFireRate - fireRateBonus);
            
            const projectiles = [];
            const centerX = this.x + this.width / 2;
            const topY = this.y;

            // 무기 레벨에 따른 발사 패턴
            switch(this.weaponLevel) {
                case 1:
                    // 레벨 1: 기본 단발
                    projectiles.push({
                        x: centerX,
                        y: topY,
                        type: 'laser',
                        angle: -90
                    });
                    break;

                case 2:
                    // 레벨 2: 강화된 단발 (더 굵고 강함)
                    projectiles.push({
                        x: centerX,
                        y: topY,
                        type: 'laser',
                        angle: -90,
                        enhanced: true
                    });
                    break;

                case 3:
                    // 레벨 3: 2발 발사
                    projectiles.push({
                        x: centerX - 8,
                        y: topY,
                        type: 'laser',
                        angle: -90
                    });
                    projectiles.push({
                        x: centerX + 8,
                        y: topY,
                        type: 'laser',
                        angle: -90
                    });
                    break;

                case 4:
                    // 레벨 4: 3발 발사 (약간 확산)
                    projectiles.push({
                        x: centerX,
                        y: topY,
                        type: 'laser',
                        angle: -90
                    });
                    projectiles.push({
                        x: centerX - 10,
                        y: topY + 5,
                        type: 'laser',
                        angle: -80
                    });
                    projectiles.push({
                        x: centerX + 10,
                        y: topY + 5,
                        type: 'laser',
                        angle: -100
                    });
                    break;

                case 5:
                    // 레벨 5: 5발 발사 (와이드 확산)
                    projectiles.push({
                        x: centerX,
                        y: topY,
                        type: 'laser',
                        angle: -90,
                        enhanced: true
                    });
                    projectiles.push({
                        x: centerX - 8,
                        y: topY + 3,
                        type: 'laser',
                        angle: -85
                    });
                    projectiles.push({
                        x: centerX + 8,
                        y: topY + 3,
                        type: 'laser',
                        angle: -95
                    });
                    projectiles.push({
                        x: centerX - 16,
                        y: topY + 8,
                        type: 'laser',
                        angle: -75
                    });
                    projectiles.push({
                        x: centerX + 16,
                        y: topY + 8,
                        type: 'laser',
                        angle: -105
                    });
                    break;
            }

            return projectiles;
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

        // 쉴드가 있으면 쉴드만 제거
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldDuration = 0;
            return false;
        }

        this.health--;
        
        // 피격 시 무기 레벨 1단계 하락
        if (this.weaponLevel > 1) {
            this.weaponLevel--;
        }

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
        this.weaponLevel = 1;
        this.bombCount = 3;
        this.hasShield = false;
        this.shieldDuration = 0;
    }

    // 파워업 획득
    powerUp(type) {
        switch(type) {
            case 'weapon':
                if (this.weaponLevel < this.maxWeaponLevel) {
                    this.weaponLevel++;
                    return true;
                }
                break;
            case 'life':
                if (this.health < this.maxHealth) {
                    this.health++;
                    return true;
                }
                break;
            case 'bomb':
                if (this.bombCount < this.maxBombCount) {
                    this.bombCount += 3;
                    if (this.bombCount > this.maxBombCount) {
                        this.bombCount = this.maxBombCount;
                    }
                    return true;
                }
                break;
            case 'shield':
                this.hasShield = true;
                this.shieldDuration = 0;
                return true;
        }
        return false;
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

        // 쉴드 표시
        if (this.hasShield) {
            const shieldAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2;
            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

