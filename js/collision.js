// 충돌 감지 시스템

class CollisionDetector {
    // AABB (Axis-Aligned Bounding Box) 충돌 감지
    static checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // 원형 충돌 감지
    static checkCircle(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    // Entity 간 충돌 확인
    static checkEntityCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        return this.checkAABB(bounds1, bounds2);
    }

    // 점이 사각형 안에 있는지 확인
    static pointInRect(px, py, rect) {
        return px >= rect.x &&
               px <= rect.x + rect.width &&
               py >= rect.y &&
               py <= rect.y + rect.height;
    }
}

