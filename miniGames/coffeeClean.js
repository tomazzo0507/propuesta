// miniGames/coffeeClean.js

export function startCoffeeClean(canvas, ctx, onComplete) {
    let animationId;
    let stainOpacity = 1.0;
    
    // Center of canvas
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const stainRadius = 80;

    let isDrawing = false;
    let lastPoint = null;

    // Draw UI Text
    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = '<h3 style="color:#800000; text-align:center; padding:1rem;">Limpia el café derramado</h3>';
    uiContainer.classList.remove('hidden');

    function down(e) {
        isDrawing = true;
        const pos = getPos(e);
        lastPoint = pos;
    }

    function move(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        
        // Calculate distance from center
        const dist = Math.hypot(pos.x - cx, pos.y - cy);
        
        // If we are wiping inside the stain area
        if (dist < stainRadius + 30) {
            // Calculate movement delta to reduce opacity
            const movement = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
            stainOpacity -= movement * 0.0015; // tuning factor
            if (stainOpacity < 0) stainOpacity = 0;
        }

        lastPoint = pos;

        if (stainOpacity === 0) {
            finish();
        }
    }

    function up() {
        isDrawing = false;
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Event Listeners
    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', up);

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Coffee Stain
        if (stainOpacity > 0) {
            ctx.fillStyle = `rgba(101, 67, 33, ${stainOpacity})`; // dark brown
            ctx.beginPath();
            
            // Draw an irregular blob shape
            ctx.moveTo(cx, cy - stainRadius);
            ctx.bezierCurveTo(cx + stainRadius, cy - stainRadius, cx + stainRadius, cy + stainRadius, cx, cy + stainRadius);
            ctx.bezierCurveTo(cx - stainRadius, cy + stainRadius + 20, cx - stainRadius - 20, cy - stainRadius, cx, cy - stainRadius);
            ctx.fill();

            // Inner darker stain
            ctx.fillStyle = `rgba(80, 50, 20, ${stainOpacity})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy, stainRadius * 0.6, stainRadius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        animationId = requestAnimationFrame(loop);
    }

    function finish() {
        // Cleanup
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousedown', down);
        canvas.removeEventListener('mousemove', move);
        canvas.removeEventListener('mouseup', up);
        canvas.removeEventListener('touchstart', down);
        canvas.removeEventListener('touchmove', move);
        canvas.removeEventListener('touchend', up);
        
        // Delay slightly before completing
        setTimeout(() => {
            onComplete();
        }, 500);
    }

    // Start
    loop();
}
