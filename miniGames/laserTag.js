// miniGames/laserTag.js

export function startLaserTag(canvas, ctx, onComplete) {
    let animationId;
    const targets = [];
    const lasers = [];
    let score = 0;
    const maxScore = 5;

    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = `<h3 id="laser-score" style="color:#800000; text-align:center; padding:1rem; position:absolute; top:20px; width:100%;">Dispara a los objetivos: 0/${maxScore}</h3>`;
    uiContainer.classList.remove('hidden');
    let scoreEl = document.getElementById('laser-score');

    // Spawn initial targets
    spawnTarget();
    spawnTarget();

    function spawnTarget() {
        targets.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height * 0.5) + 50, // Top half
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 20,
            active: true
        });
    }

    function tap(e) {
        const pos = getPos(e);
        
        // Shoot laser from bottom center to tap position
        const startX = canvas.width / 2;
        const startY = canvas.height - 20;

        const angle = Math.atan2(pos.y - startY, pos.x - startX);
        
        lasers.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10,
            radius: 8
        });
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

    canvas.addEventListener('mousedown', tap);
    canvas.addEventListener('touchstart', tap, {passive: false});

    function loop(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw targets
        targets.forEach(t => {
            if (!t.active) return;
            t.x += t.vx;
            t.y += t.vy;

            // Bounce
            if (t.x < t.radius || t.x > canvas.width - t.radius) t.vx *= -1;
            if (t.y < t.radius || t.y > canvas.height * 0.7) t.vy *= -1;

            // Draw target (alien/robot head)
            ctx.fillStyle = '#444';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye
            ctx.fillStyle = '#F6D6D6';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#800000';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Update and draw lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.x += l.vx;
            l.y += l.vy;

            // Remove out of bounds
            if (l.x < 0 || l.x > canvas.width || l.y < 0) {
                lasers.splice(i, 1);
                continue;
            }

            // Collision check
            let hit = false;
            for (let j = 0; j < targets.length; j++) {
                const t = targets[j];
                if (t.active) {
                    const dist = Math.hypot(l.x - t.x, l.y - t.y);
                    if (dist < l.radius + t.radius) {
                        t.active = false;
                        hit = true;
                        score++;
                        scoreEl.innerText = `Dispara a los objetivos: ${score}/${maxScore}`;
                        
                        // Spawn new target if not finished
                        if (score < maxScore && targets.filter(t=>t.active).length < 2) {
                            spawnTarget();
                        }
                        
                        if (score >= maxScore) {
                            finish();
                        }
                        break; // exit target loop
                    }
                }
            }

            if (hit) {
                lasers.splice(i, 1);
                continue;
            }

            // Draw laser (Heart)
            drawHeart(ctx, l.x, l.y, l.radius);
        }

        // Draw Player Ship (abstract)
        ctx.fillStyle = '#CFA27A';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height - 40);
        ctx.lineTo(canvas.width / 2 - 20, canvas.height);
        ctx.lineTo(canvas.width / 2 + 20, canvas.height);
        ctx.fill();

        animationId = requestAnimationFrame(loop);
    }

    function finish() {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousedown', tap);
        canvas.removeEventListener('touchstart', tap);
        setTimeout(() => onComplete(), 500);
    }

    // Reuse heart draw from here or export it globally in another way, 
    // since UI is standalone, I'll copy the minimal heart draw function here
    function drawHeart(c, x, y, size) {
        c.save();
        c.translate(x, y);
        c.fillStyle = '#800000';
        c.beginPath();
        c.moveTo(0, size);
        c.bezierCurveTo(-size, size, -size * 1.5, -size * 0.5, 0, -size);
        c.bezierCurveTo(size * 1.5, -size * 0.5, size, size, 0, size);
        c.fill();
        c.restore();
    }

    requestAnimationFrame(loop);
}
