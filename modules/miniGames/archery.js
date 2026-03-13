export class Archery {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        
        this.target = { x: canvas.width/2, y: canvas.height * 0.2, r: 40 };
        this.arrow = {
            baseX: canvas.width/2,
            baseY: canvas.height * 0.8,
            x: canvas.width/2,
            y: canvas.height * 0.8,
            vx: 0, vy: 0,
            active: true,
            isDragging: false
        };
        
        this.completed = false;
        this.morphed = false;
        this.morphProgress = 0; // 0 to 1
    }
    resize(w, h) {
        this.target.x = w/2;
        this.target.y = h*0.2;
        this.arrow.baseX = w/2;
        this.arrow.baseY = h*0.8;
        if (this.arrow.active && !this.arrow.isDragging) {
            this.arrow.x = this.arrow.baseX;
            this.arrow.y = this.arrow.baseY;
        }
    }
    
    update(dt) {
        if (this.morphed) {
           this.morphProgress += dt;
           if (this.morphProgress >= 1) this.morphProgress = 1;
           return;
        }
        
        if (this.arrow.vx !== 0 || this.arrow.vy !== 0) { // flying
            this.arrow.x += this.arrow.vx * dt;
            this.arrow.y += this.arrow.vy * dt;
            
            // Check hit
            let dist = Math.hypot(this.target.x - this.arrow.x, this.target.y - this.arrow.y);
            if (dist < this.target.r) {
                 this.morphed = true;
                 this.arrow.vx = 0;
                 this.arrow.vy = 0;
                 setTimeout(() => this.completed = true, 1500);
                 setTimeout(() => this.onComplete(), 2000);
            }
            
            // Out of bounds reset
            if (this.arrow.x < 0 || this.arrow.x > this.canvas.width || this.arrow.y < 0) {
                 this.resetArrow();
            }
        }
    }
    
    resetArrow() {
         this.arrow.x = this.arrow.baseX;
         this.arrow.y = this.arrow.baseY;
         this.arrow.vx = 0;
         this.arrow.vy = 0;
         this.arrow.active = true;
    }
    
    draw(ctx) {
         // Target
         if (!this.morphed) {
             ctx.fillStyle = '#FFFFFF';
             ctx.beginPath(); ctx.arc(this.target.x, this.target.y, this.target.r, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#800000';
             ctx.beginPath(); ctx.arc(this.target.x, this.target.y, this.target.r * 0.6, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#FFD700';
             ctx.beginPath(); ctx.arc(this.target.x, this.target.y, this.target.r * 0.2, 0, Math.PI*2); ctx.fill();
         } else {
             // draw morphed target (heart)
             ctx.globalAlpha = this.morphProgress;
             this.drawHeart(ctx, this.target.x, this.target.y, 40 + Math.sin(this.morphProgress * Math.PI) * 10);
             ctx.globalAlpha = 1.0;
         }
         
         // Arrow base area (bow string visual)
         ctx.strokeStyle = '#333';
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.moveTo(this.arrow.baseX - 40, this.arrow.baseY);
         if (this.arrow.isDragging) {
             ctx.lineTo(this.arrow.x, this.arrow.y);
         } else if (this.arrow.vx === 0 && this.arrow.vy === 0) {
             ctx.lineTo(this.arrow.baseX, this.arrow.baseY);
         }
         ctx.lineTo(this.arrow.baseX + 40, this.arrow.baseY);
         ctx.stroke();
         
         // Arrow
         if (this.arrow.active || this.morphed) {
             ctx.save();
             ctx.translate(this.arrow.x, this.arrow.y);
             
             let angle = -Math.PI/2;
             if (this.arrow.vx !== 0 || this.arrow.vy !== 0) {
                 angle = Math.atan2(this.arrow.vy, this.arrow.vx);
             } else if (this.arrow.isDragging) {
                 angle = Math.atan2(this.arrow.baseY - this.arrow.y, this.arrow.baseX - this.arrow.x);
             }
             
             ctx.rotate(angle);
             
             // draw arrow shaft
             ctx.strokeStyle = '#8B4513';
             ctx.lineWidth = 3;
             ctx.beginPath();
             ctx.moveTo(-20, 0);
             ctx.lineTo(10, 0);
             ctx.stroke();
             
             // draw arrow head
             ctx.fillStyle = '#A9A9A9';
             ctx.beginPath();
             ctx.moveTo(10, -5);
             ctx.lineTo(20, 0);
             ctx.lineTo(10, 5);
             ctx.fill();
             
             ctx.restore();
         }
         
         // Trajectory visual
         if (this.arrow.isDragging) {
             ctx.strokeStyle = 'rgba(0,0,0,0.2)';
             ctx.setLineDash([5, 5]);
             ctx.beginPath();
             ctx.moveTo(this.arrow.baseX, this.arrow.baseY);
             
             let dx = this.arrow.baseX - this.arrow.x;
             let dy = this.arrow.baseY - this.arrow.y;
             
             ctx.lineTo(this.arrow.baseX + dx*2, this.arrow.baseY + dy*2);
             ctx.stroke();
             ctx.setLineDash([]);
         }
         
         // Instructions
         ctx.fillStyle = '#800000';
         ctx.font = '20px Outfit';
         ctx.textAlign = 'center';
         ctx.fillText("Apunta al centro (arrastra y suelta)", this.canvas.width/2, 100);
    }
    
    drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#800000'; 
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.bezierCurveTo(-size, size, -size, -size, 0, -size / 2);
        ctx.bezierCurveTo(size, -size, size, size, 0, size);
        ctx.fill();
        ctx.restore();
    }
    
    onTouchStart(x, y) {
         if (this.morphed || this.arrow.vx !== 0) return;
         let dist = Math.hypot(this.arrow.x - x, this.arrow.y - y);
         if (dist < 60) {
             this.arrow.isDragging = true;
         }
    }
    onTouchMove(x, y) {
         if (this.arrow.isDragging) {
             this.arrow.x = x;
             this.arrow.y = y;
             // clamp distance
             let dx = this.arrow.x - this.arrow.baseX;
             let dy = this.arrow.y - this.arrow.baseY;
             let dist = Math.hypot(dx, dy);
             if (dist > 100) {
                 this.arrow.x = this.arrow.baseX + (dx/dist)*100;
                 this.arrow.y = this.arrow.baseY + (dy/dist)*100;
             }
         }
    }
    onTouchEnd() {
         if (this.arrow.isDragging) {
             this.arrow.isDragging = false;
             let dx = this.arrow.baseX - this.arrow.x;
             let dy = this.arrow.baseY - this.arrow.y;
             // launch
             if (Math.hypot(dx, dy) > 10) { // minimum drag
                  this.arrow.vx = dx * 8;
                  this.arrow.vy = dy * 8;
             } else {
                  this.resetArrow();
             }
         }
    }
}
