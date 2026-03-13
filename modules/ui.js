export class UI {
    constructor() {
        this.startScreen = document.getElementById('start-screen');
        this.hud = document.getElementById('hud');
        this.dialogBox = document.getElementById('dialog-box');
        this.dialogText = document.getElementById('dialog-text');
        this.progressText = document.getElementById('progress-text');
        
        this.finalScreen = document.getElementById('final-screen');
        this.yesScreen = document.getElementById('yes-screen');
        this.funnyScreen = document.getElementById('funny-message-screen');
        
        this.sceneManager = null;
    }

    init(sceneManager) {
        this.sceneManager = sceneManager;
        this.bindFinalButtons();
    }

    hideStartScreen() {
        this.startScreen.style.opacity = '0';
        setTimeout(() => {
            this.startScreen.classList.add('hidden');
            this.showHUD();
        }, 1000);
    }

    showHUD() {
        this.hud.classList.remove('hidden');
        this.hud.style.opacity = '1';
    }

    hideHUD() {
        this.hud.classList.add('hidden');
        this.hud.style.opacity = '0';
    }

    updateProgress(memories) {
        this.progressText.innerText = `Recuerdos ${memories}/5`;
    }

    showDialog(texts, onComplete) {
        this.dialogBox.classList.remove('hidden');
        let currentIndex = 0;
        
        const showNext = () => {
            if (currentIndex < texts.length) {
                this.dialogText.innerHTML = texts[currentIndex];
                currentIndex++;
            } else {
                this.dialogBox.classList.add('hidden');
                // Remove the event listener to avoid stacking
                document.removeEventListener('click', handleDialogClick);
                document.removeEventListener('touchstart', handleDialogClick);
                if (onComplete) onComplete();
            }
        };

        const handleDialogClick = (e) => {
            // only respond if dialog is actually showing
            if (!this.dialogBox.classList.contains('hidden')) {
                showNext();
            }
        };

        // Delay the first attachment slightly so the click that triggered the dialog doesn't skip the first text
        setTimeout(() => {
            document.addEventListener('click', handleDialogClick);
            document.addEventListener('touchstart', handleDialogClick);
        }, 100);

        showNext();
    }

    triggerFinalScene() {
        this.hideHUD();
        this.finalScreen.classList.remove('hidden');
        
        const text1 = document.getElementById('final-text-1');
        const text2 = document.getElementById('final-text-2');
        const text3 = document.getElementById('final-text-3');
        const question = document.getElementById('final-question');
        const buttons = document.getElementById('final-buttons');

        setTimeout(() => text1.classList.add('visible'), 500);
        
        setTimeout(() => {
            text1.classList.remove('visible');
            setTimeout(() => {
                text1.classList.add('hidden');
                text2.classList.remove('hidden');
                text2.classList.add('visible');
            }, 1500);
        }, 4000);

        setTimeout(() => {
            text2.classList.remove('visible');
            setTimeout(() => {
                text2.classList.add('hidden');
                text3.classList.remove('hidden');
                text3.classList.add('visible');
                
                setTimeout(() => {
                    question.classList.remove('hidden');
                    question.classList.add('visible');
                    setTimeout(() => buttons.classList.remove('hidden'), 1500);
                }, 2000);
            }, 1000);
        }, 8000);
    }

    bindFinalButtons() {
        document.getElementById('yes-btn').addEventListener('click', () => {
            this.finalScreen.classList.add('hidden');
            this.yesScreen.classList.remove('hidden');
            setTimeout(() => {
                this.yesScreen.querySelector('.title').classList.add('visible');
            }, 500);
        });

        document.getElementById('think-btn').addEventListener('click', () => {
             this.finalScreen.classList.add('hidden');
             this.funnyScreen.classList.remove('hidden');
        });

        document.getElementById('replay-btn').addEventListener('click', () => {
             window.location.reload();
        });
    }
}
