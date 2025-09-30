// 입력 처리 시스템

class InputHandler {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // 스페이스바와 화살표 키의 기본 동작 방지
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 포커스를 잃었을 때 모든 키 초기화
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    // 여러 키 중 하나라도 눌렸는지 확인
    isAnyKeyPressed(keyCodes) {
        return keyCodes.some(code => this.keys[code]);
    }

    // 모든 키 상태 초기화
    reset() {
        this.keys = {};
    }
}

