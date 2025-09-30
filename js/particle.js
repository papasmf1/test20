// 파티클 시스템

class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.color = '#ff6600';
        this.lifetime = 500;
        this.age = 0;
        this.size = 3;
        this.active = false;
    }

    init(x, y, vx, vy, color, lifetime, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.size = size;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.x += this.vx;
        this.y += this.vy;
        this.age += deltaTime;

        if (this.age >= this.lifetime) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const alpha = 1 - (this.age / this.lifetime);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.pool = new ObjectPool(Particle, 100);
    }

    createExplosion(x, y, count = 10, color = '#ff6600') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 2 + Math.random() * 3;
            const particle = this.pool.get();
            particle.init(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                300 + Math.random() * 300,
                2 + Math.random() * 3
            );
        }
    }

    createSmallExplosion(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const particle = this.pool.get();
            particle.init(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffff00',
                200 + Math.random() * 200,
                2 + Math.random() * 2
            );
        }
    }

    createTrail(x, y, color = '#00ffff') {
        const particle = this.pool.get();
        particle.init(
            x, y,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            color,
            150 + Math.random() * 100,
            2
        );
    }

    update(deltaTime) {
        const active = this.pool.getActive();
        active.forEach(particle => particle.update(deltaTime));
    }

    draw(ctx) {
        const active = this.pool.getActive();
        active.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.pool.clear();
    }
}

