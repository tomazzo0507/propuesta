// miniGames/ticketCatch.js

export function startTicketCatch(canvas, ctx, onComplete) {
    let animationId;
    const tickets = [];
    const totalToCatch = 10;
    let caughtCount = 0;

    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = `<h3 id="ticket-score" style="color:#800000; text-align:center; padding:1rem; position:absolute; top:20px; width:100%;">Atrapa los boletos: 0/${totalToCatch}</h3>`;
    uiContainer.classList.remove('hidden');
    let scoreEl = document.getElementById('ticket-score');

    // Create tickets
    for (let i = 0; i < totalToCatch + 5; i++) { // Spawn a few extra
        tickets.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height * 2 - 50, // spread vertically above
            width: 60,
            height: 30,
            speed: 1.5 + Math.random() * 2,
            sway: Math.random() * Math.PI * 2,
            caught: false,
            color: ['#F6D6D6', '#CFA27A', '#8FB996', '#D4AF37'][Math.floor(Math.random() * 4)]
        });
    }

    function tap(e) {
        const pos = getPos(e);
        
        // Find tapped ticket (reverse order to catch top-most if overlapping)
        for (let i = tickets.length - 1; i >= 0; i--) {
            const t = tickets[i];
            if (!t.caught) {
                // simple box collision
                if (pos.x >= t.x && pos.x <= t.x + t.width && pos.y >= t.y && pos.y <= t.y + t.height) {
                    t.caught = true;
                    caughtCount++;
                    scoreEl.innerText = `Atrapa los boletos: ${caughtCount}/${totalToCatch}`;
                    
                    if (caughtCount >= totalToCatch) {
                        finish();
                    }
                    break;
                }
            }
        }
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

        tickets.forEach(t => {
            if (t.caught) return;

            // Move
            t.y += t.speed;
            t.x += Math.sin(now * 0.002 + t.sway) * 1.5;

            // Loop back to top if off screen bottom
            if (t.y > canvas.height + 50) {
                t.y = -50;
                t.x = Math.random() * canvas.width;
            }

            // Draw Ticket
            ctx.save();
            ctx.translate(t.x, t.y);
            // slight rotation based on sway
            ctx.rotate(Math.sin(now * 0.003 + t.sway) * 0.2);
            
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.roundRect(0, 0, t.width, t.height, 5);
            ctx.fill();

            // ticket details (dots on side)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(5, t.height / 2, 5, 0, Math.PI * 2);
            ctx.arc(t.width - 5, t.height / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });

        animationId = requestAnimationFrame(loop);
    }

    function finish() {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousedown', tap);
        canvas.removeEventListener('touchstart', tap);
        
        setTimeout(() => {
            onComplete();
        }, 500);
    }

    requestAnimationFrame(loop);
}
