// modules/audio.js

export class AudioController {
    constructor() {
        this.bgMusic = new Audio('modules/assets/bgmusic/there is hopecore.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3; // soft volume
    }

    playMusic() {
        // Play might fail if there's no user interaction, but we call this after 'Comenzar' button
        this.bgMusic.play().catch(e => console.log('Audio play failed:', e));
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
}
