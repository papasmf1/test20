// 유틸리티 함수들

class Utils {
    // 두 점 사이의 거리 계산
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 각도를 라디안으로 변환
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // 라디안을 각도로 변환
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // 범위 내로 값 제한
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // 선형 보간
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    // 랜덤 정수 생성 (min 이상 max 미만)
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // 랜덤 실수 생성
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 배열에서 랜덤 요소 선택
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Entity 기본 클래스
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.velocity = { x: 0, y: 0 };
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime / 16;
        this.y += this.velocity.y * deltaTime / 16;
    }

    draw(ctx) {
        // 자식 클래스에서 구현
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    isOffScreen(canvasWidth, canvasHeight, margin = 50) {
        return this.x < -margin ||
               this.x > canvasWidth + margin ||
               this.y < -margin ||
               this.y > canvasHeight + margin;
    }
}

// Object Pool 클래스
class ObjectPool {
    constructor(Type, initialSize = 20) {
        this.pool = [];
        this.Type = Type;
        this.createObjects(initialSize);
    }

    createObjects(count) {
        for (let i = 0; i < count; i++) {
            const obj = new this.Type();
            obj.active = false;
            this.pool.push(obj);
        }
    }

    get(...args) {
        let obj = this.pool.find(o => !o.active);
        if (!obj) {
            obj = new this.Type();
            this.pool.push(obj);
        }
        obj.active = true;
        return obj;
    }

    release(obj) {
        obj.active = false;
    }

    getActive() {
        return this.pool.filter(o => o.active);
    }

    clear() {
        this.pool.forEach(o => o.active = false);
    }
}

