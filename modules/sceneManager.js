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
            { id: 'memory1_coffee', x: sectionWidth * 1, completed: false, game: 'coffeeClean' },
            { id: 'memory2_playland', x: sectionWidth * 2, completed: false, game: 'ticketCatch' },
            { id: 'memory3_laser', x: sectionWidth * 3, completed: false, game: 'laserTag' },
            { id: 'memory4_archery', x: sectionWidth * 4, completed: false, game: 'archery' },
            { id: 'memory5_park', x: sectionWidth * 5, completed: false, game: 'parkWalk' } // Park memory might just be a walk or simple interaction
        ];

        // Ensure triggers align with special backgrounds roughly
        this.triggers[0].x = 1150; // near juan valdez (900)
        this.triggers[1].x = 2850; // near playland (2400)
        
        // Spread the rest evenly to the end
        // If finalX is roughly 7 mobile screens (e.g. 7 * 400 = 2800? It's canvasWidth * 7, which usually is ~380x7 = 2660, let's make it proportional)
        this.triggers[2].x = 3650;
        this.triggers[3].x = 4650;
        this.triggers[4].x = 5650;
        
        this.finalX = worldWidth - 400; // End of the world
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
