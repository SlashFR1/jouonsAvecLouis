// express/timer.js

document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const endBtn = document.getElementById('endBtn');
    const addTimeBtn = document.getElementById('addTimeBtn');

    let timeLeft = 30; // Temps initial en secondes
    let timerInterval;
    let isTimerRunning = false; // Pour savoir si le timer est actif

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Changer la couleur du timer quand il reste peu de temps
        if (timeLeft <= 10 && timeLeft > 0) {
            timerDisplay.style.color = 'var(--cuphead-accent-red)';
            timerDisplay.style.animation = 'pulseRed 0.8s infinite alternate';
        } else if (timeLeft === 0) {
            timerDisplay.style.color = 'var(--cuphead-accent-red)';
            timerDisplay.style.animation = 'none'; // Arrêter l'animation à 0
        } else {
            timerDisplay.style.color = 'var(--timer-text)';
            timerDisplay.style.animation = 'timerGlow 2s infinite alternate';
        }
    }

    function startTimer() {
        if (isTimerRunning) return; // Ne pas démarrer si déjà en cours
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                alert("Temps écoulé !"); // Ou une autre action pour la fin du débat
                // Optionnel: Désactiver les boutons ou passer à la question suivante
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        alert("Débat terminé !"); // Notification de fin
        timeLeft = 30; // Réinitialiser le temps pour le prochain débat
        updateTimerDisplay();
        // Optionnel: Passer à la question suivante
    }

    function addTime(seconds) {
        timeLeft += seconds;
        updateTimerDisplay();
        // Si le timer était fini, le redémarrer
        if (!isTimerRunning && timeLeft > 0) {
            startTimer();
        }
        // Pour un petit effet visuel lorsque le temps est ajouté
        addTimeBtn.style.animation = 'flashGreen 0.3s ease-out';
        setTimeout(() => {
            addTimeBtn.style.animation = 'none';
        }, 300);
    }

    // Gestionnaires d'événements pour les boutons
    endBtn.addEventListener('click', stopTimer);
    addTimeBtn.addEventListener('click', () => addTime(15)); // Ajoute 15 secondes

    // Initialisation
    updateTimerDisplay();
    startTimer(); // Démarre le timer automatiquement au chargement de la page

    // NOUVEAU : Animation de pulsation rouge pour le timer quand le temps est bas
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes pulseRed {
            0% { box-shadow: 0 0 5px rgba(211,47,47,0.5), 6px 6px 0px var(--cuphead-border-color); }
            100% { box-shadow: 0 0 15px rgba(211,47,47,1), 6px 6px 0px var(--cuphead-border-color); }
        }
        @keyframes flashGreen {
            0% { background-color: var(--timer-add-btn-bg); }
            50% { background-color: #A5D6A7; } /* Vert clair éclatant */
            100% { background-color: var(--timer-add-btn-bg); }
        }
    `;
    document.head.appendChild(styleSheet);
});