// 배경 스크롤 시스템

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.scrollSpeed = 2;
        this.layers = [];
        this.stars = [];
        this.clouds = [];
        this.groundTiles = [];
        
        this.initStars();
        this.initClouds();
        this.initGround();
    }

    initStars() {
        // 별 생성 (배경 레이어)
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                brightness: Math.random()
            });
        }
    }

    initClouds() {
        // 구름 생성 (중간 레이어)
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: Utils.randomInt(60, 120),
                height: Utils.randomInt(30, 50),
                speed: Math.random() * 0.5 + 0.3,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }

    initGround() {
        // 지상 타일 생성
        const tileHeight = 100;
        const numTiles = Math.ceil(this.canvas.height / tileHeight) + 2;
        
        for (let i = 0; i < numTiles; i++) {
            this.groundTiles.push({
                y: i * tileHeight,
                height: tileHeight,
                features: this.generateGroundFeatures()
            });
        }
    }

    generateGroundFeatures() {
        const features = [];
        const numFeatures = Utils.randomInt(3, 8);
        
        for (let i = 0; i < numFeatures; i++) {
            features.push({
                x: Math.random() * this.canvas.width,
                type: Utils.randomChoice(['tree', 'rock', 'building', 'crater']),
                size: Utils.randomInt(10, 30)
            });
        }
        
        return features;
    }

    update(deltaTime, stage = 1) {
        // 스테이지에 따른 스크롤 속도 조정
        const baseSpeed = 2 + (stage - 1) * 0.5;

        // 별 업데이트
        this.stars.forEach(star => {
            star.y += star.speed * baseSpeed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
            // 반짝임 효과
            star.brightness += (Math.random() - 0.5) * 0.1;
            star.brightness = Utils.clamp(star.brightness, 0.3, 1);
        });

        // 구름 업데이트
        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed * baseSpeed;
            if (cloud.y > this.canvas.height) {
                cloud.y = -cloud.height;
                cloud.x = Math.random() * this.canvas.width;
            }
        });

        // 지상 타일 업데이트
        this.groundTiles.forEach(tile => {
            tile.y += this.scrollSpeed * baseSpeed;
        });

        // 화면 밖으로 나간 타일 재활용
        if (this.groundTiles[0].y > this.canvas.height) {
            const removed = this.groundTiles.shift();
            removed.y = this.groundTiles[this.groundTiles.length - 1].y - removed.height;
            removed.features = this.generateGroundFeatures();
            this.groundTiles.push(removed);
        }
    }

    draw(ctx) {
        // 배경 그라디언트
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(0.5, '#000055');
        gradient.addColorStop(1, '#003300');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 별 그리기
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 구름 그리기
        this.clouds.forEach(cloud => {
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // 지상 타일 그리기
        this.groundTiles.forEach(tile => {
            // 지상 기본색
            ctx.fillStyle = '#2a4a2a';
            ctx.fillRect(0, tile.y, this.canvas.width, tile.height);

            // 그리드 라인
            ctx.strokeStyle = 'rgba(100, 150, 100, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = tile.y + (tile.height / 5) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.canvas.width, y);
                ctx.stroke();
            }

            // 지형 특징물 그리기
            tile.features.forEach(feature => {
                ctx.fillStyle = this.getFeatureColor(feature.type);
                
                switch(feature.type) {
                    case 'tree':
                        // 나무
                        ctx.fillRect(feature.x - 2, tile.y + 40, 4, feature.size / 2);
                        ctx.beginPath();
                        ctx.arc(feature.x, tile.y + 40, feature.size / 3, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'rock':
                        // 바위
                        ctx.fillRect(feature.x - feature.size / 2, tile.y + 50, feature.size, feature.size / 2);
                        break;
                    case 'building':
                        // 건물
                        ctx.fillRect(feature.x - feature.size / 2, tile.y + 30, feature.size, feature.size);
                        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                        ctx.fillRect(feature.x - feature.size / 3, tile.y + 40, feature.size / 3, feature.size / 4);
                        break;
                    case 'crater':
                        // 크레이터
                        ctx.beginPath();
                        ctx.arc(feature.x, tile.y + 50, feature.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            });
        });
    }

    getFeatureColor(type) {
        switch(type) {
            case 'tree': return '#1a3a1a';
            case 'rock': return '#555555';
            case 'building': return '#4a4a4a';
            case 'crater': return '#1a1a1a';
            default: return '#333333';
        }
    }

    reset() {
        this.stars = [];
        this.clouds = [];
        this.groundTiles = [];
        this.initStars();
        this.initClouds();
        this.initGround();
    }
}

