// modules/world.js
import { drawHeart } from './player.js';

export class World {
    constructor(canvasWidth, canvasHeight) {
        this.width = 6000; // Fixed large world width to fit all spaced triggers
        this.screenHeight = canvasHeight;
        this.screenWidth = canvasWidth;

        this.groundY = canvasHeight * 0.75; // ground is 75% down the screen

        // Preload memory background images
        this.bgJuanValdez = new Image();
        this.bgJuanValdez.src = 'modules/assets/Juanvaldez.png';

        this.bgPlayland = new Image();
        this.bgPlayland.src = 'modules/assets/playland.png';
        
        // Generate world elements randomly along the path
        this.elements = [];
        this.generateEnvironment();
    }

    generateEnvironment() {
        // Add trees
        for (let i = 0; i < 30; i++) {
            this.elements.push({
                type: 'tree',
                x: Math.random() * this.width,
                scale: 0.5 + Math.random() * 0.8
            });
        }
        
        // Add lamps
        for(let i=0; i<15; i++) {
             this.elements.push({
                type: 'lamp',
                x: 200 + (Math.random() * this.width),
            });
        }

        // Sort by x position or pseudo Z
        this.elements.sort((a,b) => a.x - b.x);
    }

    draw(ctx, camera) {
        // Sky background (Gradient from afternoon to sunset based on camera.x)
        const progress = Math.min(1, Math.max(0, camera.x / this.width));
        
        const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
        
        // Afternoon colors -> Sunset colors
        // from Soft Pink to secondary to Park Green mixing
        
        // Let's interpolate colors 
        const r1 = 255 - progress * 50;
        const g1 = 246 - progress * 100;
        const b1 = 242 - progress * 150;

        const r2 = 246 + progress * 9;
        const g2 = 214 - progress * 100;
        const b2 = 214 - progress * 100;

        gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`); 
        gradient.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // --- Parallax Far Hills ---
        this.drawHills(ctx, camera, 0.3, '#E6D2C4', 150, 0.6); // back
        this.drawHills(ctx, camera, 0.5, '#D2BCAD', 100, 0.75); // front

        // Special Backgrounds (anchored)
        // Juan Valdez at worldX = 900
        this.drawSpecialImage(ctx, camera, this.bgJuanValdez, 900, 20, 0.6);
        // Playland at worldX = 2400 (spaced out to allow walking transition)
        this.drawSpecialImage(ctx, camera, this.bgPlayland, 2400, 50, 2.0);

        // Ground / Path
        ctx.fillStyle = '#8FB996'; // Park Green
        ctx.beginPath();
        // A slightly curved path
        ctx.moveTo(0, this.groundY);
        // We can make the ground a solid rect since we will draw a path on top
        ctx.fillRect(0, this.groundY, this.screenWidth, this.screenHeight - this.groundY);

        // The path itself
        ctx.fillStyle = '#CFA27A'; // Light Coffee
        ctx.beginPath();
        ctx.ellipse(this.screenWidth / 2, this.groundY + 20, this.screenWidth * 2, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Environment Elements
        for (const el of this.elements) {
            const drawX = camera.getDrawX(el.x);
            // Only draw if within screen horizontally
            if (drawX > -200 && drawX < this.screenWidth + 200) {
                if (el.type === 'tree') this.drawTree(ctx, drawX, this.groundY, el.scale);
                if (el.type === 'lamp') this.drawLamp(ctx, drawX, this.groundY);
            }
        }
    }

    drawSpecialImage(ctx, camera, img, worldX, offsetY, scale) {
        if (!img.complete) return;
        const drawX = camera.getDrawX(worldX);
        const w = img.width * scale;
        const h = img.height * scale;
        
        // Draw resting near ground
        const y = this.groundY - h + offsetY;

        // Optimization: only draw if visible
        if (drawX + w > -100 && drawX < this.screenWidth + 100) {
           ctx.drawImage(img, drawX, y, w, h);
        }
    }

    drawHills(ctx, camera, parallaxSpeed, color, heightOffset, yScale) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const startX = -(camera.x * parallaxSpeed) % this.screenWidth;
        ctx.moveTo(0, this.screenHeight);
        
        // Draw sine wave hills
        for (let x = 0; x <= this.screenWidth + 50; x += 50) {
            const worldX = x + (camera.x * parallaxSpeed);
            const y = this.groundY - heightOffset + Math.sin(worldX * 0.005) * (50 * yScale);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.screenWidth, this.screenHeight);
        ctx.fill();
    }

    drawTree(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(-5, -60, 10, 60);

        // Leaves (Minimalist circle or overlapping circles)
        ctx.fillStyle = '#6DA57A'; // A darker green
        ctx.beginPath();
        ctx.arc(0, -70, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8FB996'; 
        ctx.beginPath();
        ctx.arc(15, -90, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawLamp(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Pole
        ctx.fillStyle = '#444';
        ctx.fillRect(-2, -90, 4, 90);

        // Top
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, -90, 8, Math.PI, Math.PI*2);
        ctx.fill();

        // Light bulb
        ctx.fillStyle = '#FFF6F2';
        ctx.beginPath();
        ctx.arc(0, -85, 5, 0, Math.PI * 2);
        ctx.shadowColor = '#FFF6F2';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.restore();
    }
}
