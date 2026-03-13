export class TicketCatch {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        
        this.tickets = [];
        this.caught = 0;
        this.completed = false;
        
        this.spawnTimer = 0;
    }
    
    resize(w, h) {}
    
    update(dt) {
        if (this.completed) return;
        
        this.spawnTimer += dt;
        if (this.spawnTimer > 1) {
            this.spawnTimer = 0;
            this.tickets.push({
                x: Math.random() > 0.5 ? -50 : this.canvas.width + 50,
                y: Math.random() * (this.canvas.height - 300) + 100,
                vx: (Math.random() * 100 + 50) * (Math.random() > 0.5 ? 1 : -1),
                vy: (Math.random() - 0.5) * 50,
                angle: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 5,
                w: 80, h: 40
            });
        }
        
        this.tickets.forEach(t => {
            t.x += t.vx * dt;
            t.y += t.vy * dt;
            t.angle += t.rotSpeed * dt;
        });
        
        this.tickets = this.tickets.filter(t => t.x > -150 && t.x < this.canvas.width + 150);
        
        if (this.caught >= 10 && !this.completed) {
            this.completed = true;
            setTimeout(() => this.onComplete(), 1000);
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#800000';
        ctx.font = '20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`Atrapa los tickets: ${this.caught}/10`, this.canvas.width/2, 100);
        
        this.tickets.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.angle);
            
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-t.w/2, -t.h/2, t.w, t.h);
            
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.strokeRect(-t.w/2 + 4, -t.h/2 + 4, t.w - 8, t.h - 8);
            
            ctx.fillStyle = '#800000';
            ctx.beginPath();
            ctx.arc(-t.w/4, 0, 4, 0, Math.PI*2);
            ctx.arc(t.w/4, 0, 4, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    onTouchStart(x, y) {
        if (this.completed) return;
        for (let i = this.tickets.length - 1; i >= 0; i--) {
            let t = this.tickets[i];
            let dist = Math.hypot(t.x - x, t.y - y);
            if (dist < 50) {
                this.tickets.splice(i, 1);
                this.caught++;
                break;
            }
        }
    }
    onTouchMove(x, y) {}
    onTouchEnd() {}
}
