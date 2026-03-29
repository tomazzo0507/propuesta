import { Camera } from './modules/camera.js';
import { Player } from './modules/player.js';
import { World } from './modules/world.js';
import { SceneManager, SCENES } from './modules/sceneManager.js';
import { UI } from './modules/ui.js';
import { AudioController } from './modules/audio.js';

import { startCoffeeClean } from './miniGames/coffeeClean.js';
import { startTicketCatch } from './miniGames/ticketCatch.js';
import { startLaserTag } from './miniGames/laserTag.js';
import { startArchery } from './miniGames/archery.js';
import { startCinemaScene } from './miniGames/cinemaScene.js';
import { NarrativeManager } from './modules/narrativeManager.js';

let canvas, ctx;
let camera, player, world, sceneManager, ui, audio, narrativeManager;
let lastTime = 0;
let isLooping = false;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    if (isDesktopDevice()) {
        showDesktopMessage();
        return;
    }

    const gameContainer = document.getElementById("game-container");
    gameContainer.classList.remove("hidden");

    const startBtn = document.getElementById("start-btn");
    startBtn.addEventListener("click", () => {
        document.getElementById("start-screen").classList.add("hidden");
        startGame();
    });
}

function isDesktopDevice() {
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return (window.innerWidth > 900 || !isMobileUA);
}

function showDesktopMessage() {
    document.getElementById("desktop-message").classList.remove("hidden");
    document.getElementById("game-container").classList.add("hidden");
}

function startGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Resize main canvas
    resizeCanvas(canvas);
    
    // Also size minigame canvas
    const mgCanvas = document.getElementById('minigameCanvas');
    resizeCanvas(mgCanvas);

    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        resizeCanvas(mgCanvas);
    });

    // Initialize Modules
    ui = new UI();
    audio = new AudioController();
    camera = new Camera();
    narrativeManager = new NarrativeManager();
    
    // Create world & player
    world = new World(canvas.width, canvas.height);
    player = new Player(100, world.groundY);
    camera.y = world.groundY;

    // Initialize Scene Manager
    sceneManager = new SceneManager(world.width, launchMinigame, startFinalScene);
    sceneManager.state = SCENES.WALKING;

    audio.playMusic();

    // Start Loop
    lastTime = performance.now();
    isLooping = true;
    player.walk(); // Empezar a caminar
    requestAnimationFrame(gameLoop);
}

function resizeCanvas(c) {
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    if (c === canvas && camera) {
        camera.resize(c.width, c.height);
    }
}

function gameLoop(timestamp) {
    if (!isLooping) return;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    narrativeManager.update(sceneManager.state, player.x);
    
    if (sceneManager.state === SCENES.WALKING || sceneManager.state === SCENES.START) {
        player.update(dt);
        camera.update(player.x - canvas.width * 0.3); // Follow player, keeping player at 30% of screen
        
        sceneManager.checkTriggers(player.x);
    }
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw world with camera offset
    world.draw(ctx, camera);

    // Draw player
    player.draw(ctx, camera.getDrawX(player.x));
}

function launchMinigame(gameType) {
    player.stop(); // Stop walking
    player.react(); // Show heart reaction
    
    ui.showMinigame();

    const mgCanvas = document.getElementById('minigameCanvas');
    const mgCtx = mgCanvas.getContext('2d');
    
    const onComplete = () => {
        ui.hideMinigame();
        sceneManager.completeMinigame();
        ui.updateProgress(sceneManager.memoriesCompleted, sceneManager.totalMemories);
        player.walk(); // Resume walking
    };

    switch (gameType) {
        case 'coffeeClean':
            startCoffeeClean(mgCanvas, mgCtx, onComplete);
            break;
        case 'ticketCatch':
            startTicketCatch(mgCanvas, mgCtx, onComplete);
            break;
        case 'laserTag':
            startLaserTag(mgCanvas, mgCtx, onComplete);
            break;
        case 'archery':
            startArchery(mgCanvas, mgCtx, onComplete);
            break;
        case 'cinemaScene':
            startCinemaScene(mgCanvas, mgCtx, onComplete);
            break;
        default:
            setTimeout(onComplete, 2000);
            break;
    }
}

function startFinalScene() {
    isLooping = false; // Stop main loop
    player.stop();
    ui.showFinalScreen();
    // Render the final canvas scene (merging objects into a heart)
    renderFinalAnimation();
}

function renderFinalAnimation() {
    // We already cleared old loop. Start an animation on the main canvas under the transparent UI final screen
    let finalObjects = [
        { emoji: '☕', x: canvas.width * 0.2, y: canvas.height * 0.3, a: 0 },
        { emoji: '🎟️', x: canvas.width * 0.8, y: canvas.height * 0.4, a: 0 },
        { emoji: '🏹', x: canvas.width * 0.3, y: canvas.height * 0.8, a: 0 },
        { emoji: '🔫', x: canvas.width * 0.7, y: canvas.height * 0.7, a: 0 },
        { emoji: '🌳', x: canvas.width * 0.5, y: canvas.height * 0.2, a: 0 }
    ];

    let timer = 0;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw sky
        ctx.fillStyle = '#CFA27A'; // sunset color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        timer += 0.02;

        const mergeProgress = Math.min(1, Math.max(0, timer - 3) * 0.5); // Starts merging after 3 seconds

        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        finalObjects.forEach((obj, i) => {
            obj.a += 0.05;
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            const currentX = obj.x + Math.sin(obj.a) * 20;
            const currentY = obj.y + Math.cos(obj.a) * 20;

            const drawX = currentX + (cx - currentX) * mergeProgress;
            const drawY = currentY + (cy - currentY) * mergeProgress;

            ctx.globalAlpha = 1 - mergeProgress;
            // Only draw while alpha is > 0
            if (ctx.globalAlpha > 0) {
                ctx.fillText(obj.emoji, drawX, drawY);
            }
        });

        // Draw massive heart that fades in
        ctx.globalAlpha = mergeProgress;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 - 50);
        
        const scale = 1 + Math.sin(timer * 5) * 0.05;
        ctx.scale(scale, scale);
        
        ctx.fillStyle = '#800000';
        ctx.beginPath();
        const size = 100;
        ctx.moveTo(0, size);
        ctx.bezierCurveTo(-size, size, -size * 1.5, -size * 0.5, 0, -size);
        ctx.bezierCurveTo(size * 1.5, -size * 0.5, size, size, 0, size);
        ctx.fill();
        ctx.restore();

        ctx.globalAlpha = 1.0;

        // If not completely merged, or user hasn't selected "Necesito pensarlo" which overwrites DOM
        requestAnimationFrame(animate);
    }

    animate();
}
