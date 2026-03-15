// modules/player.js

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30; // approx body width
        this.height = 60; // approx 60px tall per requirements
        this.speed = 2.5; // Walking speed
        
        // Animation States
        this.state = 'idle'; // 'idle', 'walking', 'reaction'
        this.timer = 0;
        this.reactionTimer = 0;
    }

    update(dt) {
        this.timer += dt;

        if (this.state === 'walking') {
            this.x += this.speed;
        }

        if (this.state === 'reaction') {
            this.reactionTimer -= dt;
            if (this.reactionTimer <= 0) {
                this.state = 'idle';
            }
        }
    }

    draw(ctx, drawX) {
        ctx.save();
        ctx.translate(drawX, this.y);

        // We use Math.sin based on timer for simple procedural animation
        let bounceY = 0;
        let legAngle = 0;
        let lookAngle = 0;

        if (this.state === 'walking') {
            bounceY = Math.abs(Math.sin(this.timer * 0.01)) * -3;
            legAngle = Math.sin(this.timer * 0.01) * 20; // 20 degrees swing
        } else if (this.state === 'idle') {
            bounceY = Math.sin(this.timer * 0.005) * -1; // subtle breathing
            lookAngle = Math.sin(this.timer * 0.002) * 10; // looking around
        }

        // Apply bounce to entire body
        ctx.translate(0, bounceY);

        // Draw Shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        // Adjust shadow based on bounce
        ctx.ellipse(0, this.height / 2 + (-bounceY) + 5, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Colors
        const hairColor = '#111111';
        const shirtColor = '#FFFFFF';
        const pantsColor = '#DDE1E4'; // soft gray

        // --- Left Leg ---
        ctx.save();
        ctx.translate(0, 10);
        ctx.rotate(legAngle * Math.PI / 180);
        ctx.fillStyle = pantsColor;
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 20, 5); 
        ctx.fill();
        ctx.restore();

        // --- Right Leg ---
        ctx.save();
        ctx.translate(0, 10);
        ctx.rotate(-legAngle * Math.PI / 180);
        ctx.fillStyle = pantsColor;
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 20, 5);
        ctx.fill();
        ctx.restore();

        // --- Body (Shirt) ---
        ctx.fillStyle = shirtColor;
        ctx.beginPath();
        // A minimal tapered or pill shape body
        ctx.roundRect(-12, -20, 24, 30, 8);
        ctx.fill();

        // --- Head ---
        ctx.save();
        ctx.translate(0, -25);
        ctx.rotate(lookAngle * Math.PI / 180);
        
        // Hair (back)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI, true);
        ctx.fill();

        // Face
        ctx.fillStyle = '#FFE0C8'; // skin tone
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hair (front style)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(1, -2, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        // Hair bang
        ctx.beginPath();
        ctx.ellipse(-5, -5, 10, 8, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(4, 3, 2, 0, Math.PI * 2); // looking right automatically
        ctx.arc(10, 3, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // --- Reaction Heart ---
        if (this.state === 'reaction') {
            drawHeart(ctx, 0, -50 + Math.sin(this.timer * 0.01) * 5, 8);
        }

        ctx.restore();
    }

    walk() {
        this.state = 'walking';
    }

    stop() {
        this.state = 'idle';
    }

    react() {
        this.state = 'reaction';
        this.reactionTimer = 2000; // 2 seconds
    }
}

// Global heart drawing function shared
export function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#800000'; // Maroon
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.bezierCurveTo(-size, size, -size * 1.5, -size * 0.5, 0, -size);
    ctx.bezierCurveTo(size * 1.5, -size * 0.5, size, size, 0, size);
    ctx.fill();
    ctx.restore();
}
