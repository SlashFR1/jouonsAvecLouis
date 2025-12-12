class MessMemeGame {
    constructor() {
        // Récupérer les joueurs depuis localStorage
        this.players = JSON.parse(localStorage.getItem('joueurs_messmeme')) || [];
        if (this.players.length < 2) {
            alert("Il faut au moins 3 joueurs pour jouer ! Retour au menu.");
            window.location.href = "index.html"; // Change "index.html" si ton menu a un autre nom
            return;
        }

        this.app = document.getElementById('game-app');
        this.scores = this.players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
        this.round = 1;
        this.maxImages = 50; // Ajuste selon le nombre d'images que tu as (img1.png à img50.png)
        this.submissions = [];
        this.currentPlayerIndex = 0;
        this.selectedSubmissionIndex = null; // Pour le choix du maître

        this.startRound();
    }

    startRound() {
        // Choisir un maître au hasard
        this.currentMasterIndex = Math.floor(Math.random() * this.players.length);
        this.submissions = [];
        this.currentPlayerIndex = 0;
        this.selectedSubmissionIndex = null;

        // Image aléatoire
        const imgNum = Math.floor(Math.random() * this.maxImages) + 1;
        this.currentImage = `images/img${imgNum}.png`;

        this.showImageToAll();
    }

    showImageToAll() {
        const masterName = this.players[this.currentMasterIndex];
        this.app.innerHTML = `
            <div class="screen">
                <h2>Round ${this.round}</h2>
                <h3>Maître du round : <strong style="color:#ff3333;">${masterName}</strong></h3>
                <div class="image-container">
                    <img src="${this.currentImage}" class="round-image" alt="Image du round" onerror="this.src='images/placeholder.png'">
                </div>
                <p>Tous les joueurs sauf le maître : préparez-vous à écrire une légende !</p>
                <button class="btn-start" onclick="game.startCaptionTurns()">Commencer les soumissions</button>
            </div>
        `;
    }

    startCaptionTurns() {
        this.nextCaptionTurn();
    }

    nextCaptionTurn() {
        // Trouver le prochain joueur qui n'est PAS le maître et qui n'a pas encore soumis
        let attempts = 0;
        while (attempts < this.players.length) {
            const playerName = this.players[this.currentPlayerIndex % this.players.length];
            this.currentPlayerIndex++;

            const alreadySubmitted = this.submissions.some(s => s.playerName === playerName);
            if (playerName !== this.players[this.currentMasterIndex] && !alreadySubmitted) {
                this.showCaptionInput(playerName);
                return;
            }
            attempts++;
        }

        // Tous les joueurs non-maître ont soumis → passage au choix du maître
        this.showMasterChoice();
    }

    showCaptionInput(playerName) {
        this.app.innerHTML = `
            <div class="screen">
                <h2>${playerName}, à ton tour !</h2>
                <div class="image-container">
                    <img src="${this.currentImage}" class="round-image" alt="Image">
                </div>
                <p>Écris une légende drôle :</p>
                <textarea id="captionInput" placeholder="Ta légende ici..." maxlength="300"></textarea>
                <br><br>
                <button class="btn-start" onclick="game.submitCaption('${playerName}')">Valider et passer →</button>
            </div>
        `;
        document.getElementById('captionInput').focus();
    }

    submitCaption(playerName) {
        const input = document.getElementById('captionInput');
        const caption = input.value.trim();
        if (!caption) {
            alert("Tu dois écrire une légende !");
            return;
        }

        this.submissions.push({ playerName, caption });
        this.nextCaptionTurn(); // Passe au suivant automatiquement
    }

    showMasterChoice() {
        // Mélanger pour anonymat
        this.shuffle(this.submissions);

        const masterName = this.players[this.currentMasterIndex];

        const captionsHTML = this.submissions.map((sub, i) => `
            <div class="caption-card" data-index="${i}">
                <p>${sub.caption}</p>
            </div>
        `).join('');

        this.app.innerHTML = `
            <div class="screen">
                <h2>${masterName}, choisis ta légende préférée !</h2>
                <div class="image-container">
                    <img src="${this.currentImage}" class="round-image">
                </div>
                <div class="captions-grid">
                    ${captionsHTML || '<p>Aucune soumission...</p>'}
                </div>
                <div id="confirm-area" style="display:none; margin-top:30px;">
                    <button class="btn-start" onclick="game.confirmWinner()">Confirmer le gagnant</button>
                </div>
            </div>
        `;

        // Gestion du clic sur une carte
        document.querySelectorAll('.caption-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.caption-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedSubmissionIndex = parseInt(card.dataset.index);
                document.getElementById('confirm-area').style.display = 'block';
            });
        });
    }

    confirmWinner() {
        if (this.selectedSubmissionIndex === null) {
            alert("Choisis une légende d'abord !");
            return;
        }

        const winner = this.submissions[this.selectedSubmissionIndex];
        this.scores[winner.playerName]++;

        this.showRoundResult(winner);
    }

    showRoundResult(winner) {
        const winnerName = winner.playerName;
        const hasGameWinner = Object.values(this.scores).some(score => score >= 5);
        const gameWinner = hasGameWinner ? Object.keys(this.scores).find(p => this.scores[p] >= 5) : null;

        this.app.innerHTML = `
            <div class="screen">
                <h2>🏆 ${winnerName} gagne ce round !</h2>
                <div class="winner-caption">"${winner.caption}"</div>
                <div class="image-container">
                    <img src="${this.currentImage}" class="round-image">
                </div>

                <h3>Scores actuels :</h3>
                <div class="scores">
                    ${this.players.map(p => `
                        <div><strong>${p}</strong> : ${this.scores[p]} point${this.scores[p] > 1 ? 's' : ''}</div>
                    `).join('')}
                </div>

                ${hasGameWinner ? `
                    <h1 style="color:#ff3333; margin:40px 0;">🎉 ${gameWinner} remporte la partie ! 🎉</h1>
                    <button class="btn-start" onclick="window.location.href='index.html'">Retour au menu</button>
                ` : `
                    <button class="btn-start" onclick="game.round++; game.startRound()">Round suivant →</button>
                `}
            </div>
        `;
    }

    // Mélange aléatoire
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Lancement du jeu
const game = new MessMemeGame();