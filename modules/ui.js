// modules/ui.js

export class UI {
    constructor() {
        this.progressEl = document.getElementById('memory-progress');
        this.finalScreen = document.getElementById('final-screen');
        this.gameUI = document.getElementById('game-ui');
        
        // Minigame overlays
        this.minigameOverlay = document.getElementById('minigame-overlay');
        this.minigameCanvas = document.getElementById('minigameCanvas');
        this.minigameUI = document.getElementById('minigame-ui');
    }

    updateProgress(current, total) {
        this.progressEl.innerText = `${current}/${total}`;
    }

    showFinalScreen() {
        this.finalScreen.classList.remove('hidden');
        this.gameUI.classList.add('hidden'); // hide standard HUD
    }

    showMinigame() {
        this.minigameOverlay.classList.remove('hidden');
    }

    hideMinigame() {
        this.minigameOverlay.classList.add('hidden');
        this.minigameUI.innerHTML = '';
        this.minigameUI.classList.add('hidden');
        
        // clear canvas
        const ctx = this.minigameCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.minigameCanvas.width, this.minigameCanvas.height);
    }
}
