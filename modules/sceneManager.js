import { CoffeeClean } from './miniGames/coffeeClean.js';
import { TicketCatch } from './miniGames/ticketCatch.js';
import { LaserTag } from './miniGames/laserTag.js';
import { Archery } from './miniGames/archery.js';

export class SceneManager {
    constructor(canvas, ctx, player, ui) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.ui = ui;
        
        this.isPlaying = false;
        this.currentScene = 0; // 0=start wait, 1=JuanValdez, 2=Playland, 3=LaserTag, 4=Archery, 5=Park, 6=Transition
        this.memories = 0;
        
        this.pathOffset = 0;
        this.scrollSpeed = 50;
        this.isScrolling = false;
        
        this.activeMinigame = null;
        this.time = 0;
        
        // Final transition variables
        this.finalObjects = [];
        this.transitionTime = 0;
        this.heartFormed = false;
        
        this.skyColors = [
            '#FFF6F2', // 0
            '#F0E5D8', // 1
            '#E0D5D8', // 2
            '#CFA27A', // 3
            '#F6D6D6', // 4
            '#E0A288', // 5
            '#B06D6D'  // 6
        ];
        
        this.sceneMinigames = {
            1: CoffeeClean,
            2: TicketCatch,
            3: LaserTag,
            4: Archery
        };
        
        this.sceneData = {
            1: { intro: ["Todo empezó aquí...", "Cuando accidentalmente te regué cappuccino encima."], outro: ["Menos mal no te molestaste...", "De hecho, así empezó todo."] },
            2: { intro: ["Aquí pasó algo importante...", "Nuestro primer beso."], outro: ["Creo que ese fue uno de mis momentos favoritos."] },
            3: { intro: ["Luego descubrimos lo competitivos que somos."], outro: ["Competir contigo también es divertido.", "Aunque creo que tú ganaste."] },
            4: { intro: ["Nuestra primera gran aventura..."], outro: ["Creo que desde ese día me diste directo al corazón."] },
            5: { intro: ["También descubrí algo más...", "Que caminar contigo,", "hablar de libros,", "tomar café", "y simplemente estar juntos...", "es uno de mis lugares favoritos."], outro: [] }
        };
    }

    resize(w, h) {
        if (this.activeMinigame) this.activeMinigame.resize(w, h);
    }

    startGame() {
        this.isPlaying = true;
        this.startScene(1);
    }
    
    startScene(sceneIndex) {
        this.currentScene = sceneIndex;
        this.isScrolling = true;
        this.player.state = 'walk';
        
        setTimeout(() => this.arriveAtScene(), 3000);
    }

    arriveAtScene() {
        this.isScrolling = false;
        this.player.state = 'idle';
        
        const data = this.sceneData[this.currentScene];
        if (data && data.intro.length > 0) {
            this.ui.showDialog(data.intro, () => this.startMinigame());
        } else {
            this.startMinigame();
        }
    }

    startMinigame() {
        const GameClass = this.sceneMinigames[this.currentScene];
        if (GameClass) {
            this.activeMinigame = new GameClass(this.canvas, this.ctx, () => this.completeMinigame());
        } else if (this.currentScene === 5) {
            this.completeMinigame();
        }
    }

    completeMinigame() {
        this.activeMinigame = null;
        this.memories++;
        this.ui.updateProgress(this.memories);
        this.player.state = 'celebrate';
        
        const data = this.sceneData[this.currentScene];
        
        setTimeout(() => {
            if (data && data.outro.length > 0) {
                this.ui.showDialog(data.outro, () => {
                   this.player.state = 'walk';
                   if (this.currentScene < 5) this.startScene(this.currentScene + 1);
                   else this.startFinalTransition();
                });
            } else {
                if (this.currentScene < 5) {
                    this.player.state = 'walk';
                    this.startScene(this.currentScene + 1);
                }
                else this.startFinalTransition();
            }
        }, 1500); 
    }

    startFinalTransition() {
        this.currentScene = 6;
        this.player.walkToCenter();
        
        // initialize floating objects
        let emojis = ['☕', '📚', '🍦', '🥐', '🏹', '🍬'];
        for(let i=0; i<emojis.length; i++) {
             this.finalObjects.push({
                 emoji: emojis[i],
                 x: Math.random() * this.canvas.width,
                 y: this.canvas.height + 50 + Math.random()*100,
                 vx: (Math.random()-0.5)*50,
                 vy: -50 - Math.random()*50,
                 angle: Math.random()*Math.PI,
                 rotSpeed: (Math.random()-0.5)*2
             });
        }
    }

    update(dt) {
        this.time += dt;
        
        if (this.isScrolling) {
            this.pathOffset -= this.scrollSpeed * dt;
            if (this.pathOffset <= -this.canvas.width) this.pathOffset = 0;
        }
        
        if (this.currentScene === 6) {
             this.transitionTime += dt;
             
             let cx = this.canvas.width/2;
             let cy = this.canvas.height/2;
             
             this.finalObjects.forEach(obj => {
                  if (this.transitionTime < 4) {
                       // float up
                       obj.x += obj.vx * dt;
                       obj.y += obj.vy * dt;
                       obj.angle += obj.rotSpeed * dt;
                       // bounce edges
                       if (obj.x < 20 || obj.x > this.canvas.width-20) obj.vx *= -1;
                  } else if (this.transitionTime < 7) {
                       // merge to center
                       obj.x += (cx - obj.x) * dt * 1.5;
                       obj.y += (cy - obj.y) * dt * 1.5;
                       obj.angle += obj.rotSpeed * dt * 5;
                  }
             });
             
             if (this.transitionTime >= 7 && !this.heartFormed) {
                  this.heartFormed = true;
                  setTimeout(() => this.ui.triggerFinalScene(), 1000);
             }
        }
        
        this.player.update(dt);
    }

    draw(ctx) {
        let topColor = this.skyColors[Math.min(this.currentScene, this.skyColors.length - 1)];
        let bottomColor = '#FFF6F2';
        
        // Smooth transition to sunset
        if (this.currentScene === 6) {
             bottomColor = '#E0A288';
        }
        
        const grd = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grd.addColorStop(0, topColor);
        grd.addColorStop(1, bottomColor);
        
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentScene < 6 || this.transitionTime < 4) {
            this.drawEnvironment(ctx);
            this.drawPath(ctx);
        }
        
        if (this.currentScene !== 6 || this.transitionTime < 4) {
            this.player.draw(ctx);
        }
        
        if (this.currentScene === 6) {
             ctx.font = '30px Arial';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             if (!this.heartFormed) {
                 this.finalObjects.forEach(obj => {
                      ctx.save();
                      ctx.translate(obj.x, obj.y);
                      ctx.rotate(obj.angle);
                      ctx.fillText(obj.emoji, 0, 0);
                      ctx.restore();
                 });
             } else {
                 ctx.globalAlpha = Math.min((this.transitionTime - 7) * 2, 1.0);
                 this.player.drawHeart(ctx, this.canvas.width/2, this.canvas.height/2, 60 + Math.sin(this.transitionTime*3)*5);
                 ctx.globalAlpha = 1.0;
             }
        }
    }

    drawEnvironment(ctx) {
        ctx.save();
        ctx.fillStyle = '#8FB996'; 
        ctx.beginPath();
        const baseH = this.canvas.height * 0.6;
        const xOffset = this.isScrolling ? (this.pathOffset * 0.5) % this.canvas.width : 0;
        
        for(let i=-1; i<4; i++) {
            let x = xOffset + i * this.canvas.width * 0.8;
            ctx.ellipse(x, baseH, this.canvas.width * 0.6, 150, 0, Math.PI, 0);
        }
        ctx.fill();
        
        if (this.currentScene === 5) {
             let baseTreeX = this.canvas.width * 0.8;
             ctx.fillStyle = '#5C4033'; 
             ctx.fillRect(baseTreeX, baseH - 120, 20, 120);
             ctx.fillStyle = '#4E6A54'; 
             ctx.beginPath();
             ctx.arc(baseTreeX + 10, baseH - 140, 60, 0, Math.PI*2);
             ctx.fill();
             
             // Bench
             ctx.fillStyle = '#8B4513';
             ctx.fillRect(this.canvas.width * 0.6, baseH - 40, 60, 10);
             ctx.fillRect(this.canvas.width * 0.6 + 5, baseH - 30, 5, 30);
             ctx.fillRect(this.canvas.width * 0.6 + 50, baseH - 30, 5, 30);
             
             // Falling leaves
             ctx.fillStyle = '#4E6A54';
             let t = this.time;
             for(let i=0; i<6; i++) {
                 let lx = baseTreeX + Math.cos(t + i*2)*60;
                 let ly = baseH - 80 + ((t*30 + i*40) % 150);
                 ctx.fillRect(lx, ly, 8, 5);
             }
        }
        ctx.restore();
    }

    drawPath(ctx) {
        ctx.save();
        ctx.fillStyle = '#CFA27A'; 
        const py = this.canvas.height * 0.75;
        ctx.fillRect(0, py - 20, this.canvas.width, 140);
        
        ctx.strokeStyle = '#DABA9A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i=-40; i<this.canvas.width+40; i+=40) {
            let x = (i + this.pathOffset) % this.canvas.width;
            if (x < -20) x += this.canvas.width + 40;
            ctx.moveTo(x, py);
            ctx.lineTo(x + 20, py);
            ctx.moveTo(x + 20, py + 40);
            ctx.lineTo(x + 40, py + 40);
        }
        ctx.stroke();
        
        ctx.restore();
    }
}
