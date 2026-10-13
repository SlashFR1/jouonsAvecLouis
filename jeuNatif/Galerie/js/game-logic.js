// ==========================================
// FICHIER 3 : LOGIQUE DU JEU (CONTROLLER)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    
    // --- GESTION DU THÈME ---
    const themeOverlay = document.getElementById('themeSelectionOverlay');
    if (themeOverlay) {
        themeOverlay.querySelectorAll('.theme-btn').forEach(b => {
            b.addEventListener('click', (e) => {
                localStorage.setItem('themeGalerie', e.currentTarget.dataset.theme);
                location.reload();
            });
        });
    }

    // --- INITIALISATION ASYNCHRONE ---
    const currentTheme = localStorage.getItem('themeGalerie') || 'memes';
    console.log('Initialisation avec thème :', currentTheme);
    
    GameState.cartesDeck = await buildDeckForTheme(currentTheme);
    
    if (!GameState.cartesDeck || GameState.cartesDeck.length === 0) {
        console.warn("Aucune image trouvée. Vérifiez les dossiers.");
    } else {
        console.log(`Deck construit : ${GameState.cartesDeck.length} cartes.`);
        startGame(); // Lancement du jeu
    }

    // --- BOUCLE DE JEU ---

    function startGame() {
        distribuerCartes();
        UI.renderScores();
        startMasterPhase();
    }

    // Phase 1 : Le maître choisit
    function startMasterPhase() {
        GameState.phase = "master_pick";
        GameState.selections = {};
        GameState.votes = {};
        GameState.revealList = [];
        
        // Joueur actif = Maître
        GameState.activePlayer = GameState.getMaster();
        UI.renderScores();
        
        // Afficher l'interface pour le maître
        UI.showInterstitial(GameState.activePlayer, "Tu es le conteur !", () => {
            UI.renderHand(GameState.activePlayer, true);
        });
    }

    // Phase 2 : Les autres joueurs choisissent
    function startPlayersPickPhase() {
        GameState.phase = "players_pick";
        GameState.pickOrder = listJoueurs.filter(p => p !== GameState.getMaster());
        GameState.currentPickerIdx = 0;
        
        nextPlayerPick();
    }

    function nextPlayerPick() {
        if (GameState.currentPickerIdx >= GameState.pickOrder.length) {
            // Tout le monde a choisi -> Transition vers le vote
            prepareRevealAndVoting();
            return;
        }

        const player = GameState.pickOrder[GameState.currentPickerIdx];
        GameState.activePlayer = player;
        UI.renderScores();

        UI.showInterstitial(player, "Choisis une carte correspondant à la phrase.", () => {
            UI.renderHand(player, false);
        });
    }

    // Phase 3 : Préparation au vote
    function prepareRevealAndVoting() {
        GameState.phase = "voting";
        GameState.activePlayer = null;
        UI.renderScores();

        // Construire la liste de révélation
        GameState.revealList = Object.entries(GameState.selections).map(([p, data]) => ({
            owner: p,
            src: data.carte
        }));
        
        // Mélanger pour cacher qui a joué quoi
        for (let i = GameState.revealList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [GameState.revealList[i], GameState.revealList[j]] = [GameState.revealList[j], GameState.revealList[i]];
        }

        DOM.btnReveal.classList.remove("hidden");
        DOM.infoDiv.textContent = "Tout le monde a choisi. Place au vote !";
        DOM.cartesDiv.innerHTML = ""; // Cacher les cartes temporairement
        DOM.btnValider.classList.add("hidden");
        DOM.inputPhrase.classList.add("hidden");

        DOM.btnReveal.onclick = () => {
            DOM.btnReveal.classList.add("hidden");
            startVotingSequence();
        };
    }

    // Séquence de vote (tour par tour)
    function startVotingSequence() {
        GameState.votingOrder = listJoueurs.filter(p => p !== GameState.getMaster());
        GameState.currentVoterIdx = 0;
        nextVoter();
    }

    function nextVoter() {
        if (GameState.currentVoterIdx >= GameState.votingOrder.length) {
            computeAndShowResults();
            return;
        }

        const voter = GameState.votingOrder[GameState.currentVoterIdx];
        GameState.activePlayer = voter;
        UI.renderScores();

        UI.showInterstitial(voter, "C'est à toi de voter (retrouve la carte du conteur).", () => {
            DOM.infoDiv.textContent = `🗳️ ${voter}, vote en cliquant sur une carte.`;
            UI.setupVotingBoard(GameState.revealList, (idx) => handleVote(voter, idx));
        });
    }

    function handleVote(voter, cardIdx) {
        const entry = GameState.revealList[cardIdx];
        
        // Interdiction de voter pour soi-même
        if (entry.owner === voter) {
            alert("Tu ne peux pas voter pour ta propre carte !");
            return;
        }

        GameState.votes[voter] = entry.owner;
        GameState.currentVoterIdx++;
        
        // Masquer tout immédiatement pour le prochain
        DOM.cartesDiv.innerHTML = "";
        DOM.zoneVote.innerHTML = "";
        
        nextVoter();
    }

    // Calcul des scores
    function computeAndShowResults() {
        GameState.phase = "results";
        GameState.activePlayer = null;
        
        const votesRecus = {};
        listJoueurs.forEach(p => votesRecus[p] = 0);
        
        const master = GameState.getMaster();
        let votesMaitre = 0;

        // Comptage brut
        for (const [voter, owner] of Object.entries(GameState.votes)) {
            if (owner) votesRecus[owner]++;
            if (owner === master) votesMaitre++;
        }

        const nbVotants = listJoueurs.length - 1;

        // Règles de score
        if (votesMaitre === 0 || votesMaitre === nbVotants) {
            // Tout le monde a trouvé ou personne n'a trouvé : 2pts pour les autres, 0 pour le maitre
            listJoueurs.forEach(p => {
                if (p !== master) GameState.scores[p] += 2;
            });
        } else {
            // Cas standard : 3pts pour le maitre et ceux qui ont trouvé
            GameState.scores[master] += 3;
            for (const [voter, owner] of Object.entries(GameState.votes)) {
                if (owner === master) GameState.scores[voter] += 3;
            }
            // Bonus par vote reçu pour les autres
            listJoueurs.forEach(p => {
                if (p !== master) GameState.scores[p] += votesRecus[p];
            });
        }

        UI.renderScores();
        UI.showRoundResults(votesRecus, handleNextRoundOrEnd, UI.showVoteDetailsModal);
    }

    function handleNextRoundOrEnd() {
        if (GameState.mancheActuelle >= totalManches) {
            announceWinner();
        } else {
            // Nouvelle Manche
            GameState.mancheActuelle++;
            GameState.masterIndex = (GameState.masterIndex + 1) % nbJoueurs;
            distribuerCartes();
            startMasterPhase();
        }
    }

    function announceWinner() {
        let maxScore = -Infinity;
        let winners = [];
        for (const [p, s] of Object.entries(GameState.scores)) {
            if (s > maxScore) { maxScore = s; winners = [p]; }
            else if (s === maxScore) { winners.push(p); }
        }
        UI.showWinnerScreen(winners.join(' et '), maxScore, () => location.reload());
    }

    // --- GESTIONNAIRE UNIFIÉ DU BOUTON VALIDER ---
    DOM.btnValider.addEventListener("click", () => {
        const idx = DOM.btnValider.dataset.selectedIndex;
        if (idx === "" || idx === undefined) {
            alert("Sélectionne une carte d'abord !");
            return;
        }
        
        const cardIndex = Number(idx);
        const player = GameState.activePlayer; // Défini par les fonctions de phase

        // Logique Maître
        if (GameState.phase === "master_pick" && player === GameState.getMaster()) {
            const phrase = DOM.inputPhrase.value.trim();
            if (!phrase) { alert("Écris une phrase !"); return; }
            
            const cardSrc = GameState.mains[player].splice(cardIndex, 1)[0];
            GameState.selections[player] = { carte: cardSrc, isMaster: true, phrase: phrase };
            
            startPlayersPickPhase();
        } 
        // Logique Joueurs
        else if (GameState.phase === "players_pick") {
            const cardSrc = GameState.mains[player].splice(cardIndex, 1)[0];
            GameState.selections[player] = { carte: cardSrc, isMaster: false };
            
            GameState.currentPickerIdx++;
            nextPlayerPick();
        }
    });

});