import { SCENES } from './sceneManager.js';

export class NarrativeManager {
    constructor() {
        this.container = document.getElementById('narrative-text');
        this.messages = [
            "Ese día no esperaba nada…\npero apareciste tú\ny todo se sintió diferente",
            "Tu risa, tu forma de hablar…\nno sé qué fue exactamente\npero me encantó",
            "Fuimos solo por maquillaje…\ny terminamos viviendo\nalgo que no esperaba",
            "Creo que en ese momento\ntodo cambió un poco\npara los dos",
            "Para ti tal vez era solo una salida…\npero para mí\nya era algo más",
            "Y aunque no lo sabías…\nyo ya estaba empezando\na enamorarme de ti",
            "Ese día entendí algo muy simple…\nverte\nya era suficiente",
            "No importaba el lugar\nni el plan…\nsolo tú",
            "Intentaba concentrarme en la película…\npero era imposible\nno mirarte",
            "Te veías tan hermosa…\nque todo lo demás\ndejó de importar"
        ];
        
        // Triggers map: Coffee: 1150, Playland: 2850, Laser: 3650, Archery: 4650, Cinema: 5400
        this.triggers = [
            { id: 0, minX: 300, maxX: 700 },
            { id: 1, minX: 750, maxX: 1100 },
            
            { id: 2, minX: 1300, maxX: 1900 },
            { id: 3, minX: 2000, maxX: 2700 },
            
            { id: 4, minX: 3000, maxX: 3250 },
            { id: 5, minX: 3350, maxX: 3550 },
            
            { id: 6, minX: 3800, maxX: 4150 },
            { id: 7, minX: 4250, maxX: 4500 },
            
            { id: 8, minX: 4750, maxX: 5000 },
            { id: 9, minX: 5100, maxX: 5350 }
        ];
        
        this.shown = new Array(10).fill(false);
        this.currentMessageId = -1;
        this.hideTimeout = null;
    }

    update(state, playerX) {
        // Only run when walking
        if (state !== SCENES.WALKING) {
            this.forceHide();
            return;
        }

        let found = false;
        for (let i = 0; i < this.triggers.length; i++) {
            const trigger = this.triggers[i];
            if (!this.shown[i] && playerX >= trigger.minX && playerX <= trigger.maxX) {
                if (this.currentMessageId !== i) {
                    this.show(i);
                }
                found = true;
                break;
            }
        }

        // Auto hide if we walk out of bounds of the current message
        if (!found && this.currentMessageId !== -1) {
            const currTrigger = this.triggers[this.currentMessageId];
            if (playerX > currTrigger.maxX) {
                this.shown[this.currentMessageId] = true;
                this.forceHide();
            }
        }
    }

    show(id) {
        this.currentMessageId = id;
        this.container.innerHTML = this.messages[id].replace(/\n/g, '<br>');
        this.container.classList.remove('hidden');
        
        // Small delay to allow CSS transition to trigger
        setTimeout(() => {
            this.container.classList.add('show');
        }, 50);
        
        // Hide after ~4.5 seconds if player just stands inside the zone
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.shown[id] = true;
            this.forceHide();
        }, 4500);
    }

    forceHide() {
        if (this.currentMessageId === -1) return;
        this.container.classList.remove('show');
        this.currentMessageId = -1;
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        
        setTimeout(() => {
            if (this.currentMessageId === -1) {
                this.container.classList.add('hidden');
            }
        }, 1000); // matches CSS transition 1s
    }
}
