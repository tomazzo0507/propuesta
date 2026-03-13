export class CoffeeClean {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.completed = false;
        
        this.stainRadius = 60;
        this.stainPath = [];
        this.center = { x: canvas.width/2 + 50, y: canvas.height/2 + 20 };
        
        // generate stain shape
        for(let i=0; i<Math.PI*2; i+=0.5) {
            let r = this.stainRadius + Math.random() * 20;
            this.stainPath.push({ angle: i, r: r, active: true });
        }
    }
    resize(w, h) { this.center = { x: w/2 + 50, y: h/2 + 20 }; }
    
    update(dt) {
        // Check if stain is mostly cleaned
        let activeCount = this.stainPath.filter(p => p.active).length;
        if (activeCount < this.stainPath.length * 0.2 && !this.completed) {
            this.completed = true;
            setTimeout(() => this.onComplete(), 1000);
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw tipped coffee cup
        ctx.fillStyle = '#FFF6F2'; // Cream
        ctx.translate(this.canvas.width/2 - 60, this.canvas.height/2);
        ctx.rotate(-Math.PI/4);
        ctx.beginPath();
        ctx.roundRect(-25, -35, 50, 70, 5);
        ctx.fill();
        ctx.strokeStyle = '#800000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();

        // Draw stain
        if (!this.completed) {
            ctx.fillStyle = 'rgba(128, 64, 0, 0.7)'; // Coffee stain color
            ctx.beginPath();
            let first = null;
            this.stainPath.forEach((p, i) => {
                if (p.active) {
                    let x = this.center.x + Math.cos(p.angle) * p.r;
                    let y = this.center.y + Math.sin(p.angle) * p.r;
                    if (!first) { ctx.moveTo(x, y); first = {x, y}; }
                    else ctx.lineTo(x, y);
                } else {
                    let x = this.center.x + Math.cos(p.angle) * (p.r * 0.1); // inner shrunk
                    let y = this.center.y + Math.sin(p.angle) * (p.r * 0.1);
                    if (!first) { ctx.moveTo(x, y); first = {x, y};}
                    else ctx.lineTo(x, y);
                }
            });
            if (first) ctx.lineTo(first.x, first.y);
            ctx.fill();
        }
        
        // Draw instruction
        ctx.fillStyle = '#800000';
        ctx.font = '20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText("Limpia la mancha con el dedo", this.canvas.width/2, 100);
    }
    
    cleanAt(x, y) {
        this.stainPath.forEach(p => {
             let px = this.center.x + Math.cos(p.angle) * p.r;
             let py = this.center.y + Math.sin(p.angle) * p.r;
             let dist = Math.hypot(px - x, py - y);
             if (dist < 40) p.active = false;
        });
    }

    onTouchStart(x, y) { this.cleanAt(x, y); }
    onTouchMove(x, y) { this.cleanAt(x, y); }
    onTouchEnd() {}
}
