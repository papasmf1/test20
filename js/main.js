// 게임 진입점

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // 게임 시작
    game.start();

    console.log('%c제비우스 스타일 슈팅 게임', 'font-size: 20px; color: #00ff00; font-weight: bold;');
    console.log('%c게임이 시작되었습니다!', 'font-size: 14px; color: #00ffff;');
    console.log('%c조작법:', 'font-size: 12px; color: #ffff00;');
    console.log('  방향키: 이동');
    console.log('  스페이스: 레이저 (공중 적 공격)');
    console.log('  Z: 폭탄 (지상 목표물 공격)');
    console.log('  ESC: 일시정지/재개');
});

