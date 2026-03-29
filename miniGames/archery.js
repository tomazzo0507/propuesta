// miniGames/archery.js

export function startArchery(canvas, ctx, onComplete) {
    let animationId;
    
    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = `<h3 style="color:#800000; text-align:center; padding:1rem;">Apunta y dispara al corazón</h3>`;
    uiContainer.classList.remove('hidden');

    const target = {
        x: canvas.width / 2,
        y: canvas.height * 0.2, // top 20%
        radius: 30,
        vx: 2 // moving side to side
    };

    const bow = {
        x: canvas.width / 2,
        y: canvas.height * 0.8 // bottom 20%
    };

    let isAiming = false;
    let dragPos = null;
    let arrow = null; // {x, y, vx, vy, active}
    let hit = false;

    function down(e) {
        if (hit || arrow) return; // Only one arrow at a time
        const pos = getPos(e);
        // Only start aiming if dragging near bow
        if (pos.y > canvas.height * 0.5) {
            isAiming = true;
            dragPos = pos;
        }
    }

    function move(e) {
        if (!isAiming) return;
        dragPos = getPos(e);
    }

    function up(e) {
        if (!isAiming) return;
        isAiming = false;
        
        // Calculate release vector
        const dx = dragPos.x - bow.x;
        const dy = dragPos.y - bow.y;
        
        // Shoot arrow in opposite direction of drag
        arrow = {
            x: bow.x,
            y: bow.y,
            vx: -dx * 0.1, // power based on drag distance
            vy: -dy * 0.1,
            active: true
        };
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? (e.touches[0] ? e.touches[0].clientX : e.changedTouches[0].clientX) : e.clientX;
        const clientY = e.touches ? (e.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY) : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', up);

    function loop(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!hit) {
            // Move target
            target.x += target.vx;
            if (target.x < target.radius || target.x > canvas.width - target.radius) {
                target.vx *= -1;
            }

            // Draw target (a large heart)
            drawHeart(ctx, target.x, target.y, target.radius);
        }

        // Draw Bow
        ctx.save();
        ctx.translate(bow.x, bow.y);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // A simple arc
        ctx.arc(0, 0, 50, Math.PI, 0);
        ctx.stroke();
        
        // Bowstring
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (isAiming && dragPos) {
            // Draw string pulled back
            ctx.moveTo(-50, 0);
            const pullX = dragPos.x - bow.x;
            const pullY = dragPos.y - bow.y;
            ctx.lineTo(pullX, pullY);
            ctx.lineTo(50, 0);
        } else {
            ctx.moveTo(-50, 0);
            ctx.lineTo(50, 0);
        }
        ctx.stroke();

        // Draw aiming arrow
        if (isAiming && dragPos) {
            const dx = dragPos.x - bow.x;
            const dy = dragPos.y - bow.y;
            const angle = Math.atan2(dy, dx) + Math.PI; // point opposite
            
            ctx.rotate(angle);
            ctx.fillStyle = '#111';
            ctx.fillRect(0, -2, 60, 4); // shaft
            // tip
            ctx.beginPath();
            ctx.moveTo(60, -5);
            ctx.lineTo(70, 0);
            ctx.lineTo(60, 5);
            ctx.fill();
        }
        ctx.restore();

        // Draw flying arrow
        if (arrow && arrow.active) {
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;

            // gravity? minimal.
            // Check collision
            const dist = Math.hypot(arrow.x - target.x, arrow.y - target.y);
            if (!hit && dist < target.radius + 10) {
                hit = true;
                arrow.active = false;
                finish();
            }

            // Remove if offscreen
            if (arrow.x < 0 || arrow.x > canvas.width || arrow.y < 0 || arrow.y > canvas.height) {
                arrow = null; // allowing retry
            }

            if (arrow && arrow.active) {
                const angle = Math.atan2(arrow.vy, arrow.vx);
                ctx.save();
                ctx.translate(arrow.x, arrow.y);
                ctx.rotate(angle);
                ctx.fillStyle = '#111';
                ctx.fillRect(-30, -2, 60, 4);
                ctx.beginPath();
                ctx.moveTo(30, -5);
                ctx.lineTo(40, 0);
                ctx.lineTo(30, 5);
                ctx.fill();
                ctx.restore();
            }
        }

        animationId = requestAnimationFrame(loop);
    }

    function drawHeart(c, x, y, size) {
        c.save();
        c.translate(x, y - size/2); // Center vertically
        c.fillStyle = hit ? '#F6D6D6' : '#800000'; // Flash pink when hit
        c.beginPath();
        c.moveTo(0, size / 4);
        c.bezierCurveTo(0, -size / 4, -size, -size / 4, -size, size / 4);
        c.bezierCurveTo(-size, size, 0, size * 1.25, 0, size * 1.5);
        c.bezierCurveTo(0, size * 1.25, size, size, size, size / 4);
        c.bezierCurveTo(size, -size / 4, 0, -size / 4, 0, size / 4);
        c.fill();
        c.restore();
    }

    function finish() {
        // Show success msg
        uiContainer.innerHTML = `<h3 style="color:#800000; text-align:center; padding:1rem;">¡Directo al corazón!</h3>`;
        
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            canvas.removeEventListener('mousedown', down);
            canvas.removeEventListener('mousemove', move);
            canvas.removeEventListener('mouseup', up);
            canvas.removeEventListener('touchstart', down);
            canvas.removeEventListener('touchmove', move);
            canvas.removeEventListener('touchend', up);
            onComplete();
        }, 1500);
    }

    requestAnimationFrame(loop);
}
