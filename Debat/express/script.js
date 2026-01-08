document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DOM ---
    const timerDisplay = document.getElementById('timer');
    const endBtn = document.getElementById('endBtn');
    const addTimeBtn = document.getElementById('addTimeBtn');
    const nextBtn = document.getElementById('nextBtn');
    const hotToggle = document.getElementById('hotToggle');
    const cardContent = document.querySelector('.card-content');
    const counterDisplay = document.getElementById('counter');

    // --- VARIABLES D'ÉTAT ---
    let timeLeft = 30;
    let timerInterval;
    let isTimerRunning = false;
    
    let currentQuestions = []; // Liste des questions actuellement utilisée
    let currentIndex = 0;      // Index de la question en cours
    let isExtremeMode = false; // Mode actuel

    // --- LOGIQUE DES QUESTIONS ---

    // Fonction pour mélanger un tableau (Fisher-Yates)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        const newArray = [...array]; // Copie pour ne pas modifier l'original
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [newArray[currentIndex], newArray[randomIndex]] = [
                newArray[randomIndex], newArray[currentIndex]];
        }
        return newArray;
    }

    function initQuestions() {
        // Choisir la source selon le mode
        const source = isExtremeMode ? propositionsHot : propositionsNormal;
        currentQuestions = shuffle(source);
        currentIndex = 0;
        displayQuestion();
    }

    function displayQuestion() {
        if (currentQuestions.length === 0) {
            cardContent.textContent = "Aucune question disponible.";
            return;
        }
        
        cardContent.textContent = currentQuestions[currentIndex];
        counterDisplay.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
        
        // Relancer le timer à chaque nouvelle question
        resetTimer();
    }

    function nextQuestion() {
        currentIndex++;
        // Si on arrive à la fin, on remélange
        if (currentIndex >= currentQuestions.length) {
            currentQuestions = shuffle(isExtremeMode ? propositionsHot : propositionsNormal);
            currentIndex = 0;
        }
        displayQuestion();
    }

    // --- LOGIQUE DU TIMER (Ton code intégré) ---

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 10 && timeLeft > 0) {
            timerDisplay.style.color = 'var(--cuphead-accent-red)';
            timerDisplay.style.animation = 'pulseRed 0.8s infinite alternate';
        } else if (timeLeft === 0) {
            timerDisplay.style.color = 'var(--cuphead-accent-red)';
            timerDisplay.style.animation = 'none';
        } else {
            timerDisplay.style.color = 'var(--timer-text)';
            timerDisplay.style.animation = 'timerGlow 2s infinite alternate';
        }
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                // Optionnel : un petit son ou effet visuel ici
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 30; // Reset à 30 secondes
        updateTimerDisplay();
        startTimer();
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        alert("Débat terminé !");
    }

    function addTime(seconds) {
        timeLeft += seconds;
        updateTimerDisplay();
        if (!isTimerRunning && timeLeft > 0) {
            startTimer();
        }
        addTimeBtn.style.animation = 'flashGreen 0.3s ease-out';
        setTimeout(() => { addTimeBtn.style.animation = 'none'; }, 300);
    }

    // --- ÉVÉNEMENTS ---

    nextBtn.addEventListener('click', nextQuestion);

    endBtn.addEventListener('click', stopTimer);

    addTimeBtn.addEventListener('click', () => addTime(15));

    hotToggle.addEventListener('click', () => {
        isExtremeMode = !isExtremeMode;
        
        // Changement visuel du bouton
        if (isExtremeMode) {
            hotToggle.classList.add('active');
            hotToggle.textContent = "🔥 Mode Extrême : ON";
            document.body.classList.add('extreme-theme'); // Optionnel: pour changer le fond
        } else {
            hotToggle.classList.remove('active');
            hotToggle.textContent = "🔥 Mode Extrême";
            document.body.classList.remove('extreme-theme');
        }
        
        initQuestions(); // Re-mélange et recommence avec le nouveau mode
    });

    // --- INITIALISATION AU CHARGEMENT ---
    initQuestions();

    // Ton CSS dynamique pour les animations
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes pulseRed {
            0% { transform: scale(1); text-shadow: 0 0 5px red; }
            100% { transform: scale(1.1); text-shadow: 0 0 20px red; }
        }
        @keyframes flashGreen {
            0% { background-color: initial; }
            50% { background-color: #4CAF50; }
            100% { background-color: initial; }
        }
        .extreme-theme {
            background-color: #1a0000; /* Fond très sombre en mode extrême */
        }
        #hotToggle.active {
            background-color: var(--cuphead-accent-red);
            color: white;
            box-shadow: 0 0 15px red;
        }
    `;
    document.head.appendChild(styleSheet);
});