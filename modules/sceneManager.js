// modules/sceneManager.js

export const SCENES = {
    START: 0,
    WALKING: 1,
    MINIGAME: 2,
    FINAL: 3
};

export class SceneManager {
    constructor(worldWidth, onMinigameLaunch, onFinalScene) {
        this.state = SCENES.START;
        this.memoriesCompleted = 0;
        this.totalMemories = 5;

        this.onMinigameLaunch = onMinigameLaunch;
        this.onFinalScene = onFinalScene;

        // Spread 5 memories evenly across the world path
        const sectionWidth = worldWidth / (this.totalMemories + 1);

        this.triggers = [
            { id: 'memory1_coffee', x: 1150, completed: false, game: 'coffeeClean' },
            { id: 'memory2_laser', x: 2850, completed: false, game: 'laserTag' },
            { id: 'memory3_playland', x: 3650, completed: false, game: 'ticketCatch' },
            { id: 'memory4_cinema', x: 4650, completed: false, game: 'cinemaScene' },
            { id: 'memory5_archery', x: 5400, completed: false, game: 'archery' }
        ];

        this.finalX = worldWidth - 100; // End of the world
    }

    checkTriggers(playerX) {
        if (this.state !== SCENES.WALKING) return;

        // Check if reached end of world for final scene
        if (playerX >= this.finalX) {
            this.state = SCENES.FINAL;
            this.onFinalScene();
            return;
        }

        // Check memories
        for (const trigger of this.triggers) {
            // Trigger if player is close enough
            if (!trigger.completed && playerX >= trigger.x) {
                this.launchMinigame(trigger);
                break;
            }
        }
    }

    launchMinigame(trigger) {
        this.state = SCENES.MINIGAME;
        this.currentTrigger = trigger;
        this.onMinigameLaunch(trigger.game);
    }

    completeMinigame() {
        if (this.currentTrigger) {
            this.currentTrigger.completed = true;
            this.memoriesCompleted++;
        }
        this.state = SCENES.WALKING;
        this.currentTrigger = null;
    }
}
