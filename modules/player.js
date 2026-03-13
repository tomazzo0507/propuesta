export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 4; // Stay roughly at 1/4 of screen when walking
        this.y = canvas.height * 0.7; // Lower third of screen
        
        this.state = 'idle'; // 'idle', 'walk', 'celebrate'
        this.time = 0;
        this.targetX = this.x;
        this.isWalkingToCenter = false;
        
        // Colors
        this.colorMaroon = '#800000';
        this.colorSkin = '#FFDAC1';
    }

    update(dt) {
        this.time += dt;
        
        if (this.isWalkingToCenter) {
            this.x += (this.targetX - this.x) * 2 * dt;
            if (Math.abs(this.targetX - this.x) < 1) {
                this.x = this.targetX;
                this.isWalkingToCenter = false;
                this.state = 'idle';
            }
        }
    }
    
    walkToCenter() {
        this.targetX = this.canvas.width / 2;
        this.isWalkingToCenter = true;
        this.state = 'walk';
    }
    
    resetPos() {
        this.x = this.canvas.width / 4;
        this.state = 'walk';
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Breathing / Walking animation offsets
        let yOffset = 0;
        let rotation = 0;
        
        if (this.state === 'idle') {
            yOffset = Math.sin(this.time * 2) * 2; // slow breathing
        } else if (this.state === 'walk') {
            yOffset = Math.abs(Math.sin(this.time * 8)) * -5; // bopping up and down
            rotation = Math.sin(this.time * 8) * 0.1; // slight sway
        }
        
        ctx.rotate(rotation);
        
        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(0, 20, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (Maroon Clothing)
        ctx.fillStyle = this.colorMaroon;
        ctx.beginPath();
        ctx.roundRect(-10, yOffset - 15, 20, 25, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = this.colorSkin;
        ctx.beginPath();
        ctx.arc(0, yOffset - 25, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (dot eyes)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(3, yOffset - 27, 2, 0, Math.PI * 2); // Right eye
        ctx.arc(8, yOffset - 27, 2, 0, Math.PI * 2); // Left eye
        ctx.fill();

        // If celebrate, draw a heart above
        if (this.state === 'celebrate') {
            this.drawHeart(ctx, 0, yOffset - 50, 10 + Math.sin(this.time * 5) * 2);
        }

        ctx.restore();
    }
    
    drawHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#800000'; // maroon heart
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.bezierCurveTo(-size, size, -size, -size, 0, -size / 2);
        ctx.bezierCurveTo(size, -size, size, size, 0, size);
        ctx.fill();
        ctx.restore();
    }
}
