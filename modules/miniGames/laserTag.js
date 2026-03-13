export class LaserTag {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        
        this.targets = [];
        this.particles = [];
        this.lasers = [];
        this.hits = 0;
        this.completed = false;
        
        this.spawnTimer = 0;
    }
    
    resize(w, h) {}
    
    update(dt) {
        if (this.completed) {
            this.updateParticles(dt);
            return;
        }
        
        this.spawnTimer += dt;
        if (this.spawnTimer > 1.0 && this.targets.length < 4) {
            this.spawnTimer = 0;
            this.targets.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height / 2) + 100,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 80,
                r: 30,
                active: true
            });
        }
        
        this.targets.forEach(t => {
            t.x += t.vx * dt;
            t.y += t.vy * dt;
            if (t.x < t.r || t.x > this.canvas.width - t.r) t.vx *= -1;
            if (t.y < t.r || t.y > this.canvas.height/2 + 50) t.vy *= -1;
        });
        
        this.lasers.forEach(l => {
            l.life -= dt;
        });
        this.lasers = this.lasers.filter(l => l.life > 0);
        
        this.updateParticles(dt);
        
        if (this.hits >= 5 && !this.completed) {
            this.completed = true;
            setTimeout(() => this.onComplete(), 2000);
        }
    }
    
    updateParticles(dt) {
        this.particles.forEach(p => {
             p.x += p.vx * dt;
             p.y += p.vy * dt;
             p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        ctx.fillStyle = '#800000';
        ctx.font = '20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`Aciertos: ${this.hits}/5`, this.canvas.width/2, 100);
        
        // lasers
        this.lasers.forEach(l => {
            ctx.strokeStyle = `rgba(128, 0, 0, ${l.life / 0.3})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(l.sx, l.sy);
            ctx.lineTo(l.ex, l.ey);
            ctx.stroke();
        });
        
        // targets
        this.targets.forEach(t => {
            if (!t.active) return;
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
            ctx.fill();
            
            ctx.strokeStyle = '#B92B27'; // red neon
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = '#1565C0'; // blue neon inner
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r * 0.4, 0, Math.PI*2);
            ctx.fill();
        });
        
        // particles (hearts)
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            this.drawHeart(ctx, p.x, p.y, p.size);
            ctx.globalAlpha = 1.0;
        });
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
        if (this.completed) return;
        
        // shot laser from bottom center
        let sx = this.canvas.width/2;
        let sy = this.canvas.height * 0.8;
        this.lasers.push({ sx, sy, ex: x, ey: y, life: 0.3 });
        
        // check hit
        for (let i = this.targets.length - 1; i >= 0; i--) {
            let t = this.targets[i];
            if (t.active && Math.hypot(t.x - x, t.y - y) < t.r * 1.5) {
                t.active = false;
                this.targets.splice(i, 1);
                this.hits++;
                
                // spawn particles
                for(let j=0; j<8; j++) {
                     this.particles.push({
                         x: Math.random()*20 - 10 + t.x,
                         y: Math.random()*20 - 10 + t.y,
                         vx: (Math.random()-0.5)*100,
                         vy: (Math.random()-0.5)*100 - 50,
                         life: 1.0,
                         size: Math.random()*5 + 5
                     });
                }
                break;
            }
        }
    }
    onTouchMove(x, y) {}
    onTouchEnd() {}
}
