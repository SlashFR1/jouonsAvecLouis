// --- CONFIGURATION & ÉTAT ---
let teams = [];
let currentTeamIndex = 0;
let targetScore = 50;
let isBonusMode = false;
let usedQuestions = new Set(); // Pour éviter les répétitions

// État temporaire du tour
let currentQuestionLevel = 0;
let isRiskTurn = false;
let currentQuestionId = null;

// --- INITIALISATION ---

function startGame() {
    // Récupérer les options
    targetScore = parseInt(document.getElementById('target-score').value);
    isBonusMode = document.getElementById('bonus-mode').checked;

    // Créer les équipes
    const inputs = ['team1', 'team2', 'team3', 'team4'];
    teams = [];
    inputs.forEach((id, index) => {
        const name = document.getElementById(id).value.trim();
        if (name) {
            teams.push({
                id: index,
                name: name,
                score: 0,
                streak: 0 // Compteur de bonnes réponses consécutives pour le bonus
            });
        }
    });

    if (teams.length < 2) {
        alert("Il faut au moins 2 équipes !");
        return;
    }

    // Changement d'écran
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    // Générer les boutons de niveau
    generateLevelButtons();
    
    // Initialiser l'affichage
    updateUI();
}

// --- MOTEUR DE JEU ---

function updateUI() {
    renderScoreboard();
    const currentTeam = teams[currentTeamIndex];
    document.getElementById('turn-indicator').innerText = `Au tour de : ${currentTeam.name}`;
    document.getElementById('turn-indicator').style.color = getTeamColor(currentTeamIndex);
    
    // Réinitialiser les vues
    document.getElementById('level-selector').classList.remove('hidden');
    document.getElementById('question-card').classList.add('hidden');
    document.getElementById('bonus-card').classList.add('hidden');
    document.getElementById('risk-mode').checked = false;
}

function renderScoreboard() {
    const board = document.getElementById('scoreboard');
    board.innerHTML = '';

    teams.forEach((team, index) => {
        const isActive = index === currentTeamIndex;
        const progress = Math.min((team.score / targetScore) * 100, 100);
        
        const div = document.createElement('div');
        div.className = `team-score-card ${isActive ? 'active-turn' : ''}`;
        div.innerHTML = `
            <h3>${team.name}</h3>
            <div class="score-display">${team.score} pts</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
        board.appendChild(div);
    });
}

function generateLevelButtons() {
    const grid = document.getElementById('level-buttons');
    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'lvl-btn';
        btn.innerText = `Niveau ${i}`;
        btn.onclick = () => selectLevel(i);
        grid.appendChild(btn);
    }
}

// --- LOGIQUE TOUR PAR TOUR ---

function selectLevel(level) {
    currentQuestionLevel = level;
    isRiskTurn = document.getElementById('risk-mode').checked;

    // Trouver une question de ce niveau non utilisée
    const questionKeys = Object.keys(DB.questions).filter(key => {
        return DB.questions[key].niveau === level && !usedQuestions.has(key);
    });

    if (questionKeys.length === 0) {
        alert("Plus de questions à ce niveau ! Réinitialisation des questions.");
        usedQuestions.clear();
        selectLevel(level); // Récursif
        return;
    }

    // Aléatoire
    const randomKey = questionKeys[Math.floor(Math.random() * questionKeys.length)];
    const questionObj = DB.questions[randomKey];
    usedQuestions.add(randomKey);

    displayQuestion(questionObj);
}

function displayQuestion(q) {
    document.getElementById('level-selector').classList.add('hidden');
    const card = document.getElementById('question-card');
    card.classList.remove('hidden');

    // UI Updates
    document.getElementById('q-level').innerText = `Niveau ${q.niveau} ${isRiskTurn ? '(RISQUÉ)' : ''}`;
    document.getElementById('q-category').innerText = "Culture G";
    document.getElementById('q-text').innerText = q.texte;
    
    // Reset Answer Area
    document.getElementById('btn-reveal').classList.remove('hidden');
    document.getElementById('answer-area').classList.add('hidden');
    document.getElementById('a-text').innerText = q.reponse;
}

function revealAnswer() {
    document.getElementById('btn-reveal').classList.add('hidden');
    document.getElementById('answer-area').classList.remove('hidden');
}

function handleResult(success) {
    const team = teams[currentTeamIndex];
    let points = currentQuestionLevel;

    if (success) {
        if (isRiskTurn) points *= 2; // Bonus risque
        team.score += points;
        team.streak += 1;
    } else {
        if (isRiskTurn) {
            team.score -= points; // Malus risque
            if(team.score < 0) team.score = 0;
        }
        team.streak = 0; // Reset streak
    }

    // Vérification Victoire
    if (team.score >= targetScore) {
        showVictory(team);
        return;
    }

    // Vérification Bonus Card (si mode actif)
    if (isBonusMode && success && team.streak > 0 && team.streak % 4 === 0) {
        triggerBonusCard();
    } else {
        nextTurn();
    }
}

function triggerBonusCard() {
    document.getElementById('question-card').classList.add('hidden');
    const bonusCard = document.getElementById('bonus-card');
    bonusCard.classList.remove('hidden');

    const challenges = DB.bonus;
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    document.getElementById('bonus-text').innerText = randomChallenge;
}

function closeBonus() {
    // On considère que le défi est fait (ou ignoré), on passe au tour suivant
    nextTurn();
}

function nextTurn() {
    currentTeamIndex = (currentTeamIndex + 1) % teams.length;
    updateUI();
}

function showVictory(team) {
    document.getElementById('victory-modal').classList.remove('hidden');
    document.getElementById('winner-name').innerText = `L'équipe "${team.name}" a gagné avec ${team.score} points !`;
}

// Helper couleur (optionnel)
function getTeamColor(index) {
    const colors = ['#6c5ce7', '#ff7675', '#00b894', '#fdcb6e'];
    return colors[index % colors.length];
}