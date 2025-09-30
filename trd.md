# TRD: 제비우스 스타일 세로 스크롤 슈팅 게임

## 1. 기술 스택

### 1.1 프론트엔드 기술
- **HTML5**: 게임 컨테이너 및 UI 구조
- **CSS3**: 스타일링, 레이아웃, 메뉴 화면
- **JavaScript (ES6+)**: 게임 로직 및 렌더링
- **Canvas API**: 2D 그래픽 렌더링

### 1.2 개발 도구
- 텍스트 에디터: VS Code
- 버전 관리: Git
- 브라우저 개발자 도구: 디버깅 및 성능 프로파일링

### 1.3 선택적 라이브러리
- 사운드 처리: Web Audio API (네이티브) 또는 Howler.js
- 충돌 감지: 자체 구현 (AABB 방식)
- 에셋 관리: 자체 구현

## 2. 아키텍처 설계

### 2.1 프로젝트 구조
```
game1/
├── index.html              # 메인 HTML 파일
├── css/
│   ├── style.css          # 전역 스타일
│   └── game.css           # 게임 화면 스타일
├── js/
│   ├── main.js            # 진입점, 게임 초기화
│   ├── game.js            # 게임 메인 루프 및 상태 관리
│   ├── player.js          # 플레이어 클래스
│   ├── enemy.js           # 적 클래스
│   ├── projectile.js      # 투사체 클래스 (레이저, 폭탄)
│   ├── background.js      # 배경 스크롤 관리
│   ├── collision.js       # 충돌 감지 시스템
│   ├── input.js           # 키보드 입력 처리
│   ├── audio.js           # 사운드 관리
│   ├── ui.js              # UI 렌더링 및 메뉴
│   ├── particle.js        # 파티클 효과
│   └── utils.js           # 유틸리티 함수
├── assets/
│   ├── images/            # 스프라이트 이미지
│   ├── sounds/            # 효과음 및 배경음악
│   └── data/              # 스테이지 데이터 (JSON)
├── prd.md                 # 제품 요구사항 문서
└── trd.md                 # 기술 요구사항 문서 (본 문서)
```

### 2.2 게임 아키텍처 패턴

#### 2.2.1 게임 루프
```javascript
// 기본 게임 루프 구조
class Game {
  constructor() {
    this.state = 'menu'; // menu, playing, paused, gameover
    this.lastTime = 0;
    this.deltaTime = 0;
  }
  
  gameLoop(timestamp) {
    this.deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(this.deltaTime);
    this.render();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime) {
    // 게임 상태 업데이트
  }
  
  render() {
    // 화면 렌더링
  }
}
```

#### 2.2.2 객체 지향 설계
- **Entity 기본 클래스**: 모든 게임 오브젝트의 부모 클래스
- **Player 클래스**: 플레이어 전투기
- **Enemy 클래스**: 적 객체 (상속으로 다양한 적 타입 구현)
- **Projectile 클래스**: 투사체 (레이저, 폭탄, 적 미사일)
- **GameState 클래스**: 게임 상태 관리

## 3. 핵심 시스템 설계

### 3.1 렌더링 시스템

#### 3.1.1 Canvas 설정
```javascript
// Canvas 초기화
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
```

#### 3.1.2 렌더링 레이어
1. **배경 레이어**: 스크롤되는 지형과 구름
2. **지상 목표물 레이어**: 지상 적
3. **그림자 레이어**: 공중 적의 그림자
4. **게임 객체 레이어**: 플레이어, 공중 적, 투사체
5. **효과 레이어**: 폭발, 파티클
6. **UI 레이어**: HUD, 점수, 생명

#### 3.1.3 스프라이트 시스템
```javascript
class Sprite {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  draw(ctx, dx, dy, scale = 1) {
    ctx.drawImage(
      this.image,
      this.x, this.y, this.width, this.height,
      dx, dy, this.width * scale, this.height * scale
    );
  }
}
```

### 3.2 입력 처리 시스템

#### 3.2.1 키보드 입력
```javascript
class InputHandler {
  constructor() {
    this.keys = {};
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }
  
  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }
}
```

#### 3.2.2 키 매핑
- `ArrowUp`: 위로 이동
- `ArrowDown`: 아래로 이동
- `ArrowLeft`: 왼쪽으로 이동
- `ArrowRight`: 오른쪽으로 이동
- `Space`: 레이저 발사
- `KeyZ`: 폭탄 발사
- `Escape`: 일시정지
- `Enter`: 메뉴 선택/재시작

### 3.3 충돌 감지 시스템

#### 3.3.1 AABB 충돌 감지
```javascript
class CollisionDetector {
  static checkAABB(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
  
  static checkCircle(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }
}
```

#### 3.3.2 충돌 처리 흐름
1. 플레이어 레이저 vs 공중 적
2. 플레이어 폭탄 vs 지상 목표물
3. 적 투사체 vs 플레이어
4. 적 vs 플레이어 (충돌)
5. 공간 분할 최적화 (필요 시)

### 3.4 게임 객체 시스템

#### 3.4.1 Entity 기본 클래스
```javascript
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
}
```

#### 3.4.2 Player 클래스
```javascript
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed = 5;
    this.health = 3;
    this.laserCooldown = 0;
    this.bombCooldown = 0;
  }
  
  update(deltaTime, input) {
    // 이동 처리
    if (input.isKeyPressed('ArrowLeft')) {
      this.x -= this.speed;
    }
    // ... 기타 입력 처리
    
    // 쿨다운 업데이트
    this.laserCooldown = Math.max(0, this.laserCooldown - deltaTime);
    this.bombCooldown = Math.max(0, this.bombCooldown - deltaTime);
  }
  
  fireLaser() {
    if (this.laserCooldown === 0) {
      this.laserCooldown = 200; // 200ms 쿨다운
      return new Laser(this.x + this.width / 2, this.y);
    }
    return null;
  }
  
  fireBomb() {
    if (this.bombCooldown === 0) {
      this.bombCooldown = 500; // 500ms 쿨다운
      return new Bomb(this.x + this.width / 2, this.y);
    }
    return null;
  }
}
```

#### 3.4.3 Enemy 클래스
```javascript
class Enemy extends Entity {
  constructor(x, y, type) {
    super(x, y, 32, 32);
    this.type = type; // 'zigzag', 'straight', 'curve'
    this.health = 1;
    this.score = 100;
    this.pattern = this.getPattern(type);
  }
  
  getPattern(type) {
    // 적 이동 패턴 정의
    switch(type) {
      case 'zigzag':
        return new ZigzagPattern();
      case 'straight':
        return new StraightPattern();
      case 'curve':
        return new CurvePattern();
    }
  }
  
  update(deltaTime) {
    this.pattern.update(this, deltaTime);
    super.update(deltaTime);
  }
}
```

### 3.5 배경 스크롤 시스템

```javascript
class Background {
  constructor(canvas) {
    this.canvas = canvas;
    this.scrollSpeed = 2;
    this.layers = [
      { y: 0, image: null, speed: 1.0 },    // 전경
      { y: 0, image: null, speed: 0.5 }     // 후경 (시차 효과)
    ];
  }
  
  update(deltaTime) {
    this.layers.forEach(layer => {
      layer.y += this.scrollSpeed * layer.speed * deltaTime / 16;
      if (layer.y >= this.canvas.height) {
        layer.y = 0;
      }
    });
  }
  
  draw(ctx) {
    this.layers.forEach(layer => {
      ctx.drawImage(layer.image, 0, layer.y);
      ctx.drawImage(layer.image, 0, layer.y - this.canvas.height);
    });
  }
}
```

### 3.6 적 생성 시스템 (Spawner)

```javascript
class EnemySpawner {
  constructor(stageData) {
    this.stageData = stageData;
    this.currentWave = 0;
    this.timer = 0;
  }
  
  update(deltaTime, scrollY) {
    this.timer += deltaTime;
    
    // 스크롤 위치 또는 시간 기반으로 적 생성
    const wave = this.stageData.waves[this.currentWave];
    if (wave && this.shouldSpawn(wave, scrollY)) {
      return this.spawnEnemies(wave);
    }
    return [];
  }
  
  shouldSpawn(wave, scrollY) {
    return scrollY >= wave.spawnPosition;
  }
  
  spawnEnemies(wave) {
    const enemies = [];
    wave.enemies.forEach(enemyDef => {
      enemies.push(new Enemy(
        enemyDef.x,
        enemyDef.y,
        enemyDef.type
      ));
    });
    this.currentWave++;
    return enemies;
  }
}
```

### 3.7 파티클 시스템

```javascript
class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        '#ff6600',
        500 // lifetime in ms
      ));
    }
  }
  
  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      return p.isAlive();
    });
  }
  
  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
}

class Particle {
  constructor(x, y, vx, vy, color, lifetime) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.age = 0;
  }
  
  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.age += deltaTime;
  }
  
  isAlive() {
    return this.age < this.lifetime;
  }
  
  draw(ctx) {
    const alpha = 1 - (this.age / this.lifetime);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(this.x, this.y, 3, 3);
    ctx.globalAlpha = 1;
  }
}
```

### 3.8 사운드 시스템

```javascript
class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
  }
  
  loadSound(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds[name] = audio;
  }
  
  playSound(name, volume = 1.0) {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds[name];
    if (sound) {
      const clone = sound.cloneNode();
      clone.volume = volume;
      clone.play().catch(e => console.warn('Audio play failed:', e));
    }
  }
  
  playMusic(name, loop = true) {
    if (!this.musicEnabled) return;
    
    this.stopMusic();
    this.music = this.sounds[name];
    if (this.music) {
      this.music.loop = loop;
      this.music.volume = 0.3;
      this.music.play().catch(e => console.warn('Music play failed:', e));
    }
  }
  
  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }
}
```

### 3.9 상태 관리 시스템

```javascript
class GameStateManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.stage = 1;
    this.lives = 3;
  }
  
  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }
  
  loseLife() {
    this.lives--;
    return this.lives <= 0;
  }
  
  nextStage() {
    this.stage++;
  }
  
  reset() {
    this.score = 0;
    this.stage = 1;
    this.lives = 3;
  }
  
  saveHighScore() {
    localStorage.setItem('xevious_highscore', this.highScore);
  }
  
  loadHighScore() {
    return parseInt(localStorage.getItem('xevious_highscore') || '0');
  }
}
```

## 4. 데이터 구조

### 4.1 스테이지 데이터 형식 (JSON)

```json
{
  "stage": 1,
  "scrollSpeed": 2,
  "length": 5000,
  "background": "stage1_bg.png",
  "waves": [
    {
      "spawnPosition": 100,
      "enemies": [
        {
          "type": "zigzag",
          "x": 200,
          "y": -50,
          "health": 1
        },
        {
          "type": "straight",
          "x": 400,
          "y": -50,
          "health": 1
        }
      ]
    },
    {
      "spawnPosition": 500,
      "enemies": [
        {
          "type": "curve",
          "x": 300,
          "y": -50,
          "health": 2
        }
      ]
    }
  ],
  "groundTargets": [
    {
      "type": "tank",
      "x": 250,
      "y": 1000,
      "health": 1,
      "score": 500
    },
    {
      "type": "radar",
      "x": 400,
      "y": 2000,
      "health": 3,
      "score": 2000
    }
  ]
}
```

## 5. 성능 최적화

### 5.1 최적화 전략
1. **Object Pooling**: 투사체, 파티클 재사용
2. **Off-screen Culling**: 화면 밖 객체는 렌더링 스킵
3. **Sprite Atlas**: 여러 이미지를 하나의 스프라이트 시트로 통합
4. **requestAnimationFrame**: 브라우저 최적화 활용
5. **Canvas 최적화**: 
   - 불필요한 상태 변경 최소화
   - 정수 좌표 사용
   - 레이어 캐싱

### 5.2 메모리 관리
```javascript
class ObjectPool {
  constructor(Type, size) {
    this.pool = [];
    this.Type = Type;
    for (let i = 0; i < size; i++) {
      this.pool.push(new Type());
    }
  }
  
  get() {
    return this.pool.pop() || new this.Type();
  }
  
  release(obj) {
    obj.reset();
    this.pool.push(obj);
  }
}
```

## 6. 테스트 전략

### 6.1 테스트 항목
- [ ] 플레이어 이동 범위 제한 (화면 경계)
- [ ] 충돌 감지 정확도
- [ ] 적 생성 타이밍
- [ ] 점수 계산 정확성
- [ ] 생명 감소 및 게임 오버
- [ ] 스테이지 전환
- [ ] 사운드 재생
- [ ] 로컬 저장소 저장/로드

### 6.2 성능 테스트
- 다수의 객체 동시 존재 시 FPS 측정
- 메모리 누수 확인
- 다양한 브라우저에서 호환성 테스트

### 6.3 디버그 모드
```javascript
const DEBUG = {
  showFPS: true,
  showHitboxes: true,
  godMode: false
};

if (DEBUG.showHitboxes) {
  // 충돌 박스 시각화
  ctx.strokeStyle = 'red';
  ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
}
```

## 7. 배포 및 호스팅

### 7.1 빌드 프로세스
- 이미지 최적화 (압축, 적절한 포맷)
- JavaScript 압축 (선택사항)
- 에셋 프리로딩

### 7.2 호스팅 옵션
- GitHub Pages
- Netlify
- Vercel
- 간단한 웹 서버

### 7.3 브라우저 호환성
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 8. 향후 확장 고능성

### 8.1 기술적 확장
- WebGL을 사용한 고급 그래픽
- Web Workers를 이용한 백그라운드 처리
- WebSocket을 이용한 멀티플레이어
- IndexedDB를 이용한 복잡한 저장

### 8.2 기능적 확장
- 파워업 시스템
- 보스전
- 스토리 모드
- 업적 시스템
- 온라인 리더보드

## 9. 보안 고려사항

- 클라이언트 측 점수 조작 방지 (서버 검증 없이는 제한적)
- XSS 방지
- 안전한 로컬 저장소 사용

## 10. 개발 일정

### Week 1: 기초 설정
- 프로젝트 구조 생성
- Canvas 렌더링 기본 구현
- 플레이어 이동 구현

### Week 2: 핵심 게임플레이
- 적 생성 시스템
- 충돌 감지
- 레이저/폭탄 발사

### Week 3: 게임 시스템
- 스테이지 시스템
- 점수 및 생명 관리
- 배경 스크롤

### Week 4: 완성도
- 사운드 추가
- 파티클 효과
- UI/UX 개선
- 테스트 및 버그 수정

