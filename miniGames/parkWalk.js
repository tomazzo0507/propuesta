// miniGames/parkWalk.js

export function startParkWalk(canvas, ctx, onComplete) {
    const uiContainer = document.getElementById('minigame-ui');
    uiContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding: 2rem;">
            <div style="font-size:3rem; margin-bottom:1rem; animation: float 2s infinite ease-in-out;">👩‍❤️‍👨</div>
            <h3 style="color:#800000;">Un paseo por el parque...</h3>
            <p style="color:#CFA27A; margin-top: 1rem;">Nuestras charlas y risas.</p>
        </div>
        <style>@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }</style>
    `;
    uiContainer.classList.remove('hidden');

    // No canvas drawing needed here, just a UI overlay that completes after a few seconds
    setTimeout(() => {
        onComplete();
    }, 4000); // 4 seconds of reading/enjoying the moment
}
