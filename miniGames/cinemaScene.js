// miniGames/cinemaScene.js

export function startCinemaScene(canvas, ctx, onComplete) {
    let animationId;
    let lastTime = performance.now();
    
    let isHolding = false;
    let holdTimer = 0;
    let attempt = 1;
    let boyState = 'screen'; // 'screen' or 'girl'
    let message = 'Mantén presionado para mirar la película';
    let messageAlpha = 1;
    let heartTimer = 0;
    
    // UI Setup
    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = '';
    // Disable text selection and touch highlights for this scene
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.msUserSelect = "none";
    document.body.style.webkitTouchCallout = "none";
    document.body.style.webkitTapHighlightColor = "transparent";

    function down(e) {
        if (e.cancelable && e.type.startsWith('touch')) {
            e.preventDefault();
        }
        if (boyState === 'girl') {
            // Reset after failure
            boyState = 'screen';
            holdTimer = 0;
            attempt++;
            messageAlpha = 0;
        }
        isHolding = true;
    }

    function up(e) {
        if (isHolding && boyState === 'screen') {
            isHolding = false;
            triggerFail('Es imposible no mirarte');
        }
        isHolding = false;
    }

    function triggerFail(msg) {
        isHolding = false;
        boyState = 'girl';
        message = msg;
        messageAlpha = 1;
        heartTimer = 2000;
    }

    function move(e) {
        if (e.cancelable && e.type.startsWith('touch')) {
            e.preventDefault();
        }
    }

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('touchstart', down, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);

    function loop(now) {
        const dt = now - lastTime;
        lastTime = now;

        update(dt);
        draw(ctx, canvas);

        animationId = requestAnimationFrame(loop);
    }

    function update(dt) {
        if (heartTimer > 0) heartTimer -= dt;

        if (isHolding && boyState === 'screen') {
            holdTimer += dt;
            
            if (attempt === 1 && holdTimer > 3000) {
                triggerFail('Es imposible no mirarte');
            } else if (attempt === 2 && holdTimer > 5000) {
                triggerFail('Es imposible no mirarte');
            } else if (attempt >= 3 && holdTimer >= 10000) {
                isHolding = false;
                finish();
            }
        } else if (!isHolding && boyState === 'screen') {
             // If not holding but hasn't failed yet (e.g. at the very start)
             // We can just let it sit or drain timer. Let's drain timer slowly or just do nothing.
             if (holdTimer > 0) holdTimer = 0;
        }

        if (messageAlpha > 0 && boyState === 'screen' && isHolding) {
            messageAlpha = Math.max(0, messageAlpha - dt * 0.002);
        }
    }

    function draw(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Cinema environment (dark)
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Screen glow at the top
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
        gradient.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Screen (movie)
        ctx.fillStyle = '#DDD';
        ctx.fillRect(canvas.width * 0.1, -20, canvas.width * 0.8, canvas.height * 0.2);

        // Seats (red)
        ctx.fillStyle = '#500';
        const seatY = canvas.height * 0.6;
        ctx.fillRect(canvas.width * 0.2, seatY, canvas.width * 0.6, canvas.height * 0.4);

        // Draw Girl (right side)
        drawCharacter(ctx, canvas.width * 0.6, seatY + 40, 'screen', '#FFE0C8', '#8FB996');

        // Draw Boy (left side)
        drawCharacter(ctx, canvas.width * 0.4, seatY + 40, boyState, '#FFE0C8', '#FFFFFF');

        // Draw Heart if failed
        if (heartTimer > 0 && boyState === 'girl') {
            const progress = 1 - (heartTimer / 2000);
            const floatY = (seatY - 50) - (progress * 30);
            const alpha = Math.min(1, heartTimer / 500); // Fades out smoothly
            
            let scale = 1;
            if (progress < 0.15) {
                scale = progress / 0.15; // Pop effect
            }
            
            ctx.save();
            ctx.globalAlpha = alpha;
            drawSimpleHeart(ctx, canvas.width * 0.4, floatY, 15 * scale);
            ctx.restore();
        }

        // Progress bar for holding
        if (isHolding && boyState === 'screen') {
            let targetTime = 10000;
            if (attempt === 1) targetTime = 3000;
            else if (attempt === 2) targetTime = 5000;
            const progress = Math.min(1, holdTimer / targetTime);
            
            // Actually, showing 10 seconds progress always looks better
            const visualProgress = Math.min(1, holdTimer / 10000);
            
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(canvas.width * 0.2, canvas.height * 0.85, canvas.width * 0.6, 10);
            ctx.fillStyle = '#800000';
            ctx.fillRect(canvas.width * 0.2, canvas.height * 0.85, (canvas.width * 0.6) * visualProgress, 10);
        }

        // Message
        if (messageAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${messageAlpha})`;
            ctx.font = '24px Outfit, sans-serif';
            ctx.textAlign = 'center';
            if (message === 'Mantén presionado para mirar la película') {
                ctx.fillText('Mantén presionado', canvas.width * 0.5, canvas.height * 0.4 - 15);
                ctx.fillText('para mirar la película', canvas.width * 0.5, canvas.height * 0.4 + 15);
            } else {
                ctx.fillText(message, canvas.width * 0.5, canvas.height * 0.4);
            }
        }
    }

    function drawCharacter(ctx, x, y, state, skin, shirt) {
        ctx.save();
        ctx.translate(x, y);

        // Body
        ctx.fillStyle = shirt;
        ctx.beginPath();
        ctx.roundRect(-20, -30, 40, 60, 10);
        ctx.fill();

        // Head
        ctx.translate(0, -45);
        ctx.fillStyle = '#111'; // hair back
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        if (state === 'girl') {
            // Profile facing right
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(5, 5, 22, 0, Math.PI * 2); // face offset right
            ctx.fill();

            // Eye
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(15, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            // Smile
            ctx.beginPath();
            ctx.arc(15, 12, 5, 0.2, Math.PI * 0.8);
            ctx.stroke();
        } else {
            // Screen (facing away / back of head)
            // Just more hair covering the back of the head
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(0, 5, 26, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawSimpleHeart(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#800000'; 
        ctx.beginPath();
        // A clean, symmetrical, recognizable bezier heart shape
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size * 0.5, -size * 0.5, -size * 1.5, size * 0.5, 0, size * 1.5);
        ctx.bezierCurveTo(size * 1.5, size * 0.5, size * 0.5, -size * 0.5, 0, size * 0.3);
        ctx.fill();
        ctx.restore();
    }

    let finished = false;
    function finish() {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousedown', down);
        canvas.removeEventListener('touchstart', down);
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
        canvas.removeEventListener('touchmove', move);
        
        // Restore styles
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.msUserSelect = "";
        document.body.style.webkitTouchCallout = "";
        document.body.style.webkitTapHighlightColor = "";
        
        // Show romantic ending message explicitly before completing
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Al final, la mejor película", canvas.width * 0.5, canvas.height * 0.45);
        ctx.fillText("siempre fuiste tú", canvas.width * 0.5, canvas.height * 0.45 + 35);
        
        drawSimpleHeart(ctx, canvas.width * 0.5, canvas.height * 0.45 - 60, 15);

        setTimeout(() => {
            onComplete();
        }, 3000);
    }

    requestAnimationFrame(loop);
}
