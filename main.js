import { SceneManager } from './modules/sceneManager.js';
import { Player } from './modules/player.js';
import { UI } from './modules/ui.js';

let canvas, ctx;
let lastTime = 0;
let sceneManager, player, ui;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Check mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 600;
    if (!isMobile) {
        document.getElementById('mobile-only-message').classList.remove('hidden');
        document.getElementById('game-container').classList.add('hidden');
        // We do not stop execution strictly but let's hide the UI.
    }

    // Initialize modules
    ui = new UI();
    player = new Player(canvas);
    sceneManager = new SceneManager(canvas, ctx, player, ui);
    
    ui.init(sceneManager);
    
    // Bind Start Button
    document.getElementById('start-btn').addEventListener('click', () => {
        ui.hideStartScreen();
        sceneManager.startGame();
    });

    // Handle touch inputs for minigames
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for dev tools touch emulation / fallback
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (sceneManager) {
        sceneManager.resize(canvas.width, canvas.height);
    }
}

function gameLoop(time) {
    const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (sceneManager && sceneManager.isPlaying) {
        sceneManager.update(deltaTime);
        sceneManager.draw(ctx);
        
        // Render minigame on top if active
        if (sceneManager.activeMinigame) {
            sceneManager.activeMinigame.update(deltaTime);
            sceneManager.activeMinigame.draw(ctx);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Input Handlers routes
function handleTouchStart(e) {
    e.preventDefault();
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchStart) {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];
        sceneManager.activeMinigame.onTouchStart(t.clientX - rect.left, t.clientY - rect.top);
    }
}
function handleTouchMove(e) {
    e.preventDefault();
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchMove) {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];
        sceneManager.activeMinigame.onTouchMove(t.clientX - rect.left, t.clientY - rect.top);
    }
}
function handleTouchEnd(e) {
    e.preventDefault();
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchEnd) {
        sceneManager.activeMinigame.onTouchEnd();
    }
}

function handleMouseDown(e) {
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchStart) {
        const rect = canvas.getBoundingClientRect();
        sceneManager.activeMinigame.onTouchStart(e.clientX - rect.left, e.clientY - rect.top);
    }
}
function handleMouseMove(e) {
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchMove) {
         const rect = canvas.getBoundingClientRect();
         sceneManager.activeMinigame.onTouchMove(e.clientX - rect.left, e.clientY - rect.top);
    }
}
function handleMouseUp(e) {
    if (sceneManager && sceneManager.activeMinigame && sceneManager.activeMinigame.onTouchEnd) {
         sceneManager.activeMinigame.onTouchEnd();
    }
}

window.onload = init;
