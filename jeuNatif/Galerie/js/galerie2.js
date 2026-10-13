
document.addEventListener("DOMContentLoaded", () => {
    // ----------------------
    // CONFIGURATION GLOBALE
    // ----------------------
    const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || ["Joueur1", "Joueur2", "Joueur3", "Joueur4"];
    const nbJoueurs = listJoueurs.length;
    const totalManches = 3;

    // cartesDeck doit être accessible par le reste du script
    let cartesDeck = [];

    // mapping des thèmes disponibles → dossiers (valeurs attendues depuis galerie1.html)
    const themesConfig = {
        art: { folder: 'images/art', ext: 'png' },
        histoire: { folder: 'images/histoire', ext: 'png' },
        memes: { folder: 'images/memes', ext: 'png' },
        nature: { folder: 'images/nature', ext: 'png' },
        cosmos: { folder: 'images/cosmos', ext: 'png' }
    };

    // Si la page contient un overlay de sélection de thème, l'activer
    const themeOverlay = document.getElementById('themeSelectionOverlay');
    if (themeOverlay) {
        const btns = themeOverlay.querySelectorAll('.theme-btn');
        btns.forEach(b => b.addEventListener('click', (e) => {
            const t = e.currentTarget.dataset.theme;
            if (t) {
                localStorage.setItem('themeGalerie', t);
                // recharge pour que l'init async détecte le nouveau thème
                location.reload();
            }
        }));
    }

    // Utilitaire: teste si une image existe en la préchargeant
    function testImageExists(url, timeout = 3000) {
        return new Promise(resolve => {
            const img = new Image();
            let done = false;
            const t = setTimeout(() => { if (!done) { done = true; resolve(false); } }, timeout);
            img.onload = () => { if (!done) { done = true; clearTimeout(t); resolve(true); } };
            img.onerror = () => { if (!done) { done = true; clearTimeout(t); resolve(false); } };
            img.src = url;
        });
    }

    // Construit le deck en détectant automatiquement les images présentes.
    // Stratégie : on teste séquentiellement img1..imgN et on stoppe après X échecs consécutifs.
    async function buildDeckForTheme(themeKey) {
        const cfg = themesConfig[themeKey] || themesConfig['memes'];
        const folder = cfg.folder;
        const ext = cfg.ext || 'png';

        const result = [];
        const maxProbe = 300; // sécurité
        let consecutiveMiss = 0;
        const stopAfterMisses = 12;

        for (let i = 1; i <= maxProbe; i++) {
            const url = `${folder}/img${i}.${ext}`;
            // eslint-disable-next-line no-await-in-loop
            const ok = await testImageExists(url, 1000);
            if (ok) {
                result.push(url);
                consecutiveMiss = 0;
            } else {
                consecutiveMiss++;
            }
            if (consecutiveMiss >= stopAfterMisses && result.length > 0) break;
        }
        return result;
    }

    // Initialisation asynchrone : construction du deck puis démarrage du jeu
    (async function init() {
        const themeGalerie = localStorage.getItem('themeGalerie') || 'memes';
        console.log('Galerie initialisation — thème:', themeGalerie);
        cartesDeck = await buildDeckForTheme(themeGalerie);
        if (!cartesDeck || cartesDeck.length === 0) {
            console.warn('Aucune image trouvée pour le thème', themeGalerie, '. Vérifie dossiers/images.');
        } else {
            console.log(`cartesDeck construit (${cartesDeck.length} images)`);
        }
        // Après construction du deck, on lance l'initialisation normale (les fonctions
        // distribuerCartes / renderScores / startMasterPick sont définies plus bas)
        distribuerCartes();
        renderScores();
        startMasterPick();
    })();
    // UI elements
    const cartesDiv = document.getElementById("cartesContainer");
    const infoDiv = document.getElementById("infoJoueur");
    const phraseDiv = document.getElementById("phraseMaître");
    const inputPhrase = document.getElementById("inputPhrase");
    const btnValider = document.getElementById("valider");
    const btnReveal = document.getElementById("btnReveal");
    const zoneVote = document.getElementById("zoneVote");
    const scoresBoard = document.getElementById("scoresBoard");
    const mancheInfo = document.getElementById("mancheInfo");
    const voteDetailsOverlay = document.getElementById('voteDetailsOverlay');
    const closeVoteDetailsBtn = document.getElementById('closeVoteDetails');

    // Gestionnaire pour fermer la modale (déclaré une seule fois)
    closeVoteDetailsBtn.addEventListener('click', () => {
        voteDetailsOverlay.classList.add('hidden');
    });

    // STATE
    let scores = {};
    listJoueurs.forEach(j => scores[j] = 0);

    let activePlayerName = null;

    let mancheActuelle = 1;
    // Hands: { joueur: [carteSrc,...] }
    let mains = {};
    // selections: { joueur: { carte: src, isMaster:boolean, phrase? } }
    let selections = {};
    // votes: { votant: ownerPlayer } (ownerPlayer is the player who owns that card)
    let votes = {};
    // shuffled reveal array: { owner, src, revealIndex }
    let revealList = [];

    // turn state machine
    // phase: "master_pick" -> master chooses phrase+carte
    // "players_pick" -> each non-master chooses card, in order
    // "voting" -> players vote one by one
    // "results" -> display scores, allow next manche
    let phase = "master_pick";
    let masterIndex = Math.floor(Math.random() * listJoueurs.length);;//Maths.random(3); // index in listJoueurs of current master
    let currentPickerIndex = 0; // used during players_pick to point to which player chooses
    let currentVoterIndex = 0; // used during voting to indicate who must vote now (skipping master)
    let masterPlayer = listJoueurs[masterIndex];
    //let masterPlayer = listJoueurs[Maths.random(listJoueurs)]

    // initial distribution
    function distribuerCartes() {
        // copie du deck
        const paquet = [...cartesDeck];
        // shuffle paquet
        for (let i = paquet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [paquet[i], paquet[j]] = [paquet[j], paquet[i]];
        }
        mains = {};
        let ptr = 0;
        listJoueurs.forEach(j => {
            mains[j] = [];
            for (let k = 0; k < 4; k++) {
                mains[j].push(paquet[ptr++]);
            }
        });
    }
    // helper to update score display
    function renderScores() {
        scoresBoard.innerHTML = "";
        for (const j of listJoueurs) {
            const box = document.createElement("div");
            box.className = "scoreBox";
            if (j === activePlayerName) {
                box.classList.add("active-player");
            }
            box.innerHTML = `<div><strong>${j}</strong></div><div class="small">${scores[j]} pts</div>`;
            scoresBoard.appendChild(box);
        }
        mancheInfo.textContent = `Manche ${mancheActuelle} / ${totalManches}`;
    }
    // ------------------- Phase de sélection des cartes -------------------
    function renderHandForPlayer(player, mode = "pick") {
        cartesDiv.innerHTML = "";
        zoneVote.innerHTML = "";
        inputPhrase.value = "";

        // Affichage du texte du joueur
        if (mode === "pick" && phase === "master_pick") {
            infoDiv.textContent = `🎩 Maître : ${player} — écris une phrase puis choisis une carte.`;
        } else {
            infoDiv.textContent = `👉 ${player}, choisis une carte (ta main).`;
        }

        // On conserve la phrase du maître tout au long de la manche
        if (selections[masterPlayer]?.phrase) {
            phraseDiv.textContent = "🗣️ Phrase du maître : " + selections[masterPlayer].phrase;
        }

        const hand = mains[player];
        if (!hand || hand.length === 0) {
            const p = document.createElement("div");
            p.textContent = "Aucune carte dans la main.";
            cartesDiv.appendChild(p);
            return;
        }

        // Crée un conteneur pour les cartes
        const cartesZone = document.createElement("div");
        cartesZone.id = "zoneCartesJoueur";
        cartesZone.classList.add("hidden");
        cartesDiv.appendChild(cartesZone);

        // Bouton pour voir les cartes
        const btnVoir = document.createElement("button");
        btnVoir.textContent = "👁️ Voir mes cartes";
        btnVoir.addEventListener("click", () => {
            cartesZone.classList.toggle("hidden");
            btnVoir.textContent = cartesZone.classList.contains("hidden") ? "👁️ Voir mes cartes" : "🙈 Cacher mes cartes";
        });
        cartesDiv.appendChild(btnVoir);
        if (selections[masterPlayer]?.phrase) {
            phraseDiv.textContent = "🗣️ Phrase du maître : " + selections[masterPlayer].phrase;
        }

        // Affiche les cartes du joueur
        hand.forEach((src, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "carte-wrapper";
            const img = document.createElement("img");
            img.src = src;
            img.dataset.index = idx;
            img.addEventListener("click", () => {
                if (mode !== "pick") return;
                cartesZone.querySelectorAll("img").forEach(i => i.classList.remove("selected"));
                img.classList.add("selected");
                btnValider.dataset.selectedIndex = idx;
            });
            wrapper.appendChild(img);
            cartesZone.appendChild(wrapper);
        });

        // Avant d'ajouter les boutons
        if (phase === "master_pick" && player === masterPlayer) {
            inputPhrase.classList.remove("hidden"); // le maître peut écrire
            if (!inputPhrase.parentNode) {
                cartesDiv.appendChild(inputPhrase); // ajouter seulement si pas déjà attaché
            }
            btnValider.textContent = "Valider phrase & carte";
        } else {
            inputPhrase.classList.add("hidden"); // les autres joueurs ne voient rien
            if (inputPhrase.parentNode) {
                inputPhrase.parentNode.removeChild(inputPhrase); // retirer du DOM
            }
            btnValider.textContent = "Valider carte";
        }


    }
    // called after all players selected their cards
    function prepareRevealAndVoting() {
        // build revealList: array { owner, src }
        revealList = [];
        for (const pl in selections) {
            revealList.push({ owner: pl, src: selections[pl].carte });
        }
        // shuffle display order
        for (let i = revealList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [revealList[i], revealList[j]] = [revealList[j], revealList[i]];
        }

        // render phrase
        phraseDiv.textContent = "🗣️ Phrase du maître : " + selections[masterPlayer].phrase;

        // show "Révéler les cartes" button
        btnReveal.classList.remove("hidden");
        btnReveal.onclick = () => {
            btnReveal.classList.add("hidden");
            startVotingPhase();
        };
        infoDiv.textContent = "Cliquez sur 'Révéler les cartes' pour débuter le vote.";
    }
    // ------------------- Phase de vote -------------------
    function startVotingPhase() {
        phase = "voting";
        cartesDiv.innerHTML = "";
        zoneVote.innerHTML = "";
        votes = {};         // { votant: owner }
        voteCount = {};     // compteur de votes par carte

        // Crée les éléments de carte mais les garde cachés ; les afficher
        // uniquement lorsque le votant appuie sur 'Voter'.
        revealList.forEach((entry, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "carte-wrapper hidden"; // caché entre les votes
            wrapper.dataset.idx = idx;

            const img = document.createElement("img");
            img.src = entry.src;
            img.dataset.idx = idx;
            wrapper.appendChild(img);

            const numDiv = document.createElement("div");
            numDiv.className = "small";
            numDiv.textContent = `Carte #${idx + 1}`;
            wrapper.appendChild(numDiv);

            const countDiv = document.createElement("div");
            countDiv.className = "vote-count";
            countDiv.id = `voteCount_${idx}`;
            countDiv.style.visibility = 'hidden';
            wrapper.appendChild(countDiv);

            cartesDiv.appendChild(wrapper);
        });

        // ordre de vote : tous sauf le maître
        votingOrder = listJoueurs.filter(p => p !== masterPlayer);
        currentVoterIndex = 0;
        // lancer l'appel au premier votant (affiche interstitiel "Au tour de X - Voter")
        proceedToNextVoter();
    }
    // ------------------- Avancer au prochain votant -------------------
    function proceedToNextVoter() {
        // clear previous selections visuals
        clearCardSelections();

        if (currentVoterIndex >= votingOrder.length) {
            infoDiv.textContent = "Tous les joueurs ont voté ! Révélation des résultats...";
            // révéler compteurs puis calculer
            revealVoteCounts();
            computeResults();
            return;
        }

        const voter = votingOrder[currentVoterIndex];
        // show interstitial prompting to pass device to voter
        showInterstitialForVoter(voter);
    }

    // Affiche un écran intermédiaire demandant au joueur courant d'appuyer sur "Voter"
    function showInterstitialForVoter(voter) {
        // show overlay interstitial to hide board
        activePlayerName = voter; // Le votant actuel devient actif
        renderScores();
        const overlay = document.getElementById('screenOverlay');
        overlay.innerHTML = '';
        overlay.classList.remove('hidden');
        const container = document.createElement('div');
        container.className = 'interstitial';
        const title = document.createElement('h2');
        title.textContent = `${voter}`;
        title.style.margin = '0 0 8px 0';
        title.style.fontSize = '2em';
        title.style.color = 'var(--color-accent)';
        container.appendChild(title);
        const msg = document.createElement('div');
        msg.textContent = `🗳️ C'est à ton tour de voter.`;
        msg.style.marginBottom = '12px';
        container.appendChild(msg);

        const btn = document.createElement('button');
        btn.textContent = 'Voter';
        btn.addEventListener('click', () => {
            // hide overlay and afficher les cartes pour ce votant
            overlay.classList.add('hidden');
            showCardsForCurrentVoter();
        });
        container.appendChild(btn);

        overlay.appendChild(container);
        infoDiv.textContent = `Passez l'appareil à ${voter} et appuyez sur Voter.`;
    }

    // Affiche les cartes (localement) et active le clic pour voter.
    function showCardsForCurrentVoter() {
        zoneVote.innerHTML = '';
        const voter = votingOrder[currentVoterIndex];
        infoDiv.textContent = `🗳️ ${voter}, choisis une carte en cliquant dessus.`;

        // clear any residual visual selection and make cards visible
        clearCardSelections();
        const wrappers = Array.from(cartesDiv.querySelectorAll('.carte-wrapper'));
        wrappers.forEach(w => {
            w.classList.remove('hidden');
            // ensure images are not marked as selected
            w.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
        });

        // activer les clics pour ce votant uniquement
        wrappers.forEach(w => {
            const img = w.querySelector('img');
            const idx = Number(img.dataset.idx);
            // remove previous handlers by cloning
            const newImg = img.cloneNode(true);
            img.parentNode.replaceChild(newImg, img);
            newImg.addEventListener('click', () => {
                // enregistrer vote
                if (votes[voter]) return; // déjà voté
                const entry = revealList[idx];
                votes[voter] = entry.owner;
                // marquer visuellement le choix
                newImg.classList.add('selected');

                // afficher bouton Suivant pour passer au votant suivant
                const btnNext = document.createElement('button');
                btnNext.textContent = 'Suivant';
                btnNext.addEventListener('click', () => {
                    // cacher les cartes à nouveau
                    wrappers.forEach(w => w.classList.add('hidden'));
                    // ré-afficher overlay au prochain appel
                    const overlay = document.getElementById('screenOverlay');
                    overlay.classList.remove('hidden');
                    currentVoterIndex++;
                    proceedToNextVoter();
                });
                zoneVote.innerHTML = '';
                const confirm = document.createElement('div');
                confirm.textContent = `Vote enregistré pour ${voter}. Appuyez sur Suivant.`;
                confirm.style.marginBottom = '8px';
                zoneVote.appendChild(confirm);
                zoneVote.appendChild(btnNext);
            });
        });
    }

    function clearCardSelections() {
        // retire toutes les classes 'selected' et 'highlight-for-voter'
        cartesDiv.querySelectorAll('img').forEach(i => i.classList.remove('selected', 'highlight-for-voter'));
    }
    // ------------------- Calcul des scores -------------------
    // ... (début de votre fonction computeResults)

    function computeResults() {
        phase = "results";
        activePlayerName = null;

        // 1. Calcul des votes reçus
        const votesRecus = {};
        for (const j of listJoueurs) votesRecus[j] = 0;

        // On compte combien de votes chaque proprietaire a recu
        for (const voter in votes) {
            const owner = votes[voter];
            if (owner) votesRecus[owner]++;
        }

        const nbVotants = nbJoueurs - 1;
        const votesMaitre = votesRecus[masterPlayer];

        // 2. Attribution des points (Règles galerie)
        if (votesMaitre === 0 || votesMaitre === nbVotants) {
            // Le maitre a perdu (trop facile ou trop dur)
            scores[masterPlayer] += 0;
            listJoueurs.forEach(p => { if (p !== masterPlayer) scores[p] += 2; });
        } else {
            // Le maitre a marqué
            scores[masterPlayer] += 3;
            for (const voter in votes) {
                if (votes[voter] === masterPlayer) scores[voter] += 3; // Ceux qui ont trouvé le maitre
            }
            // Bonus pour les autres cartes votées
            for (const p of listJoueurs) {
                if (p !== masterPlayer) scores[p] += votesRecus[p];
            }
        }

        // 3. Affichage visuel (Cartes encadrées + propriétaires)
        cartesDiv.innerHTML = "";
        phraseDiv.textContent = "🗣️ Phrase du maître : " + selections[masterPlayer].phrase;

        revealList.forEach((entry, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "carte-wrapper";

            const img = document.createElement("img");
            img.src = entry.src;
            // Bordure Or pour le maitre, Gris pour les autres
            img.style.border = entry.owner === masterPlayer ? "4px solid #FFD700" : "4px solid #aaa";
            wrapper.appendChild(img);

            const info = document.createElement("div");
            info.innerHTML = `<strong>${entry.owner}</strong><br>Votes reçus : ${votesRecus[entry.owner]}`;
            info.style.marginTop = "5px";
            wrapper.appendChild(info);

            cartesDiv.appendChild(wrapper);
        });

        zoneVote.innerHTML = "";
        zoneVote.style.display = "flex";       // Active l'alignement
        zoneVote.style.justifyContent = "center";
        zoneVote.style.gap = "15px";           // Espace entre les boutons

        // Bouton 1 : Voir le détail
        const btnShowVotes = document.createElement("button");
        btnShowVotes.textContent = "🔍 Détails des votes";
        btnShowVotes.className = "btn-secondary"; // Ajoute du style si tu en as
        btnShowVotes.addEventListener("click", showVoteDetails);

        // Bouton 2 : Suite du jeu
        const btnNext = document.createElement("button");
        btnNext.textContent = (mancheActuelle >= totalManches) ? "🏁 Voir le Vainqueur" : "➡️ Manche suivante";
        btnNext.className = "btn-primary";
        btnNext.addEventListener("click", showNextRoundOverlay);

        // Ajout des deux boutons dans la zone
        zoneVote.appendChild(btnShowVotes);
        zoneVote.appendChild(btnNext);

        // Mise à jour des scores
        renderScores();
    }

    // NOUVELLE FONCTION pour afficher l'overlay de fin de manche
    // MODIFIÉ : Affiche l'overlay de fin de manche ou de fin de jeu
    function showNextRoundOverlay() {
        const overlay = document.getElementById('screenOverlay');
        overlay.innerHTML = ''; // Vide l'overlay
        overlay.classList.remove('hidden');

        const container = document.createElement('div');
        container.className = 'interstitial';

        const title = document.createElement('h2');
        container.appendChild(title);

        const scoresList = document.createElement('p');
        scoresList.innerHTML = '<strong>Classement actuel :</strong><br>' +
            Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .map(([player, score]) => `${player}: ${score} pts`)
                .join('<br>');
        container.appendChild(scoresList);

        const btnNext = document.createElement("button");
        container.appendChild(btnNext);
        overlay.appendChild(container);

        // ---- MODIFICATION PRINCIPALE ICI ----
        if (mancheActuelle >= totalManches) {
            // C'est la fin du jeu
            title.textContent = "La partie est terminée !";
            btnNext.textContent = "Voir le vainqueur"; // Le texte que vous vouliez
            btnNext.addEventListener("click", () => {
                announceWinner(); // Appelle la fonction finale
            });
        } else {
            // C'est juste la fin d'une manche
            title.textContent = "Fin de la manche !";
            btnNext.textContent = "Passer à la manche suivante";
            btnNext.addEventListener("click", () => {
                overlay.classList.add('hidden');
                nouvelleManche();
            });
        }
    }
    // Faire apparaître les compteurs et indiquer visuellement les votes
    function revealVoteCounts() {
        // compter votes par carte (selon l'ordre revealList)
        const counts = Array(revealList.length).fill(0);
        for (const voter in votes) {
            const owner = votes[voter];
            // trouver l'index dans revealList
            const idx = revealList.findIndex(r => r.owner === owner);
            if (idx >= 0) counts[idx]++;
        }
        // afficher compteurs
        counts.forEach((c, idx) => {
            const el = document.getElementById(`voteCount_${idx}`);
            if (el) {
                el.textContent = `Votes : ${c}`;
                el.style.visibility = 'visible';
                el.style.fontWeight = 'bold';
                el.style.color = c > 0 ? '#ffbf00' : '#ccc';
            }
        });
    }

    function revealResults() {
        btnReveal.classList.add("hidden");
        infoDiv.textContent = "Résultats finaux :";

        // effet visuel + texte final sous les cartes
        revealList.forEach((entry, idx) => {
            const count = voteCount[idx];
            const countDiv = document.getElementById(`voteCount_${idx}`);
            countDiv.textContent = `Votes : ${count}`;
            countDiv.style.fontWeight = "bold";
            countDiv.style.color = count > 0 ? "#ffbf00" : "#ccc";
        });

        // bouton Nouvelle Manche
        const btnNext = document.createElement("button");
        btnNext.textContent = (mancheActuelle >= totalManches) ? "Terminer et afficher gagnant" : "Nouvelle manche";
        btnNext.addEventListener("click", () => {
            if (mancheActuelle >= totalManches) {
                announceWinner();
            } else {
                nouvelleManche();
            }
        });

        zoneVote.innerHTML = ""; // efface zone précédente
        zoneVote.appendChild(btnNext);
    }

    btnValider.addEventListener("click", () => {
        const selectedIndex = btnValider.dataset.selectedIndex;
        if (selectedIndex === undefined) {
            alert("Choisis une carte avant de valider !");
            return;
        }

        const currentPlayer = players[currentPlayerIndex];

        // Si c’est le conteur
        if (phase === "master_pick" && currentPlayer === masterPlayer) {
            const phrase = inputPhrase.value.trim();
            if (!phrase) {
                alert("Tu dois écrire une phrase !");
                return;
            }
            selections[masterPlayer] = {
                carte: mains[masterPlayer][selectedIndex], // ⚠️ adapte à "carte" si ton code utilise ce nom
                phrase
            };
            inputPhrase.value = "";
            phase = "players_pick";
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            renderHandForPlayer(players[currentPlayerIndex]);
            return;
        }

        // Si c’est un joueur normal
        selections[currentPlayer] = {
            carte: mains[currentPlayer][selectedIndex] // idem ici
        };

        currentPlayerIndex++;
        if (currentPlayerIndex < players.length) {
            renderHandForPlayer(players[currentPlayerIndex]);
        } else {
            prepareRevealAndVoting(); // ← on passe à la phase de révélation avant le vote
        }
    });
    // compute points using votes
    // MODIFIÉ : Calcule le gagnant et affiche un écran de victoire final
    function announceWinner() {
        // 1. Calculer le gagnant (logique inchangée)
        let maxScore = -Infinity;
        let winners = [];
        for (const player in scores) {
            if (scores[player] > maxScore) {
                maxScore = scores[player];
                winners = [player]; // Nouveau gagnant
            } else if (scores[player] === maxScore) {
                winners.push(player); // Égalité
            }
        }
        const winnerText = winners.join(' et ');

        // 2. Créer l'écran de victoire sur l'overlay
        const overlay = document.getElementById('screenOverlay');
        overlay.innerHTML = ''; // Nettoie l'overlay (enlève le bouton "voir vainqueur")
        overlay.classList.remove('hidden'); // S'assure qu'il est visible

        const container = document.createElement('div');
        container.className = 'interstitial';

        const title = document.createElement('h2');
        title.innerHTML = `🏆 Le Vainqueur est... 🏆`;
        container.appendChild(title);

        const winnerName = document.createElement('p');
        winnerName.className = 'winner-name'; // Classe pour un style spécial
        winnerName.textContent = winnerText;
        container.appendChild(winnerName);

        const finalScore = document.createElement('p');
        finalScore.className = 'final-score';
        finalScore.textContent = `avec ${maxScore} points !`;
        container.appendChild(finalScore);

        const btnReplay = document.createElement('button');
        btnReplay.textContent = "Rejouer";
        btnReplay.style.marginTop = '20px';
        btnReplay.onclick = () => location.reload(); // La façon la plus simple de rejouer
        container.appendChild(btnReplay);

        overlay.appendChild(container);
    }
    // reset for next manche (rotate master)
    function nouvelleManche() {
        // rotation du maître
        masterIndex = (masterIndex + 1) % nbJoueurs;
        masterPlayer = listJoueurs[masterIndex];

        // incrémente la manche
        mancheActuelle++;
        if (mancheActuelle > totalManches) {
            announceWinner();
            return;
        }

        // réinitialisation des états
        selections = {};
        votes = {};
        revealList = [];
        currentPickerIndex = 0;

        // distribution de nouvelles cartes
        distribuerCartes();

        // mise à jour du score et de l'affichage
        renderScores();

        // lancement de la phase maître
        startMasterPick();
    }

    // start phases
    function startMasterPick() {
        phase = "master_pick";
        selections = {};
        votes = {};
        revealList = [];
        currentPickerIndex = 0;

        masterPlayer = listJoueurs[masterIndex];
        activePlayerName = masterPlayer; // Le maître est le joueur actif
        renderScores();
        infoDiv.textContent = `🎩 Le conteur est du jeu est ${masterPlayer}. Écris une phrase et choisis une carte.`;
        phraseDiv.textContent = "";

        btnValider.classList.remove("hidden");
        btnValider.dataset.selectedIndex = "";
        inputPhrase.classList.remove("hidden");

        currentPlayerIndex = listJoueurs.indexOf(masterPlayer);
        renderHandForPlayer(masterPlayer, "pick");
    }
    btnValider.addEventListener("click", () => {
        const idx = btnValider.dataset.selectedIndex;

        // Vérification basique
        if (idx === "" || idx === undefined) {
            alert("Veuillez sélectionner une carte en cliquant dessus !");
            return;
        }

        // --- LOGIQUE MAÎTRE ---
        if (phase === "master_pick") {
            const phrase = inputPhrase.value.trim();
            if (!phrase) { alert("Le maître doit écrire une phrase !"); return; }

            // Retirer la carte de la main du maître
            const cardSrc = mains[masterPlayer].splice(Number(idx), 1)[0];

            // Enregistrer la sélection
            selections[masterPlayer] = { carte: cardSrc, isMaster: true, phrase: phrase };

            // Préparer la phase suivante (Joueurs choisissent)
            phase = "players_pick";
            inputPhrase.value = ""; // Reset input

            // Définir l'ordre de passage (tous sauf le maître)
            window.pickOrder = listJoueurs.filter(p => p !== masterPlayer);
            currentPickerIndex = 0;

            // Mettre à jour l'interface pour le premier joueur
            infoDiv.textContent = "👉 Les autres joueurs choisissent une carte correspondant à la phrase.";
            renderHandForPlayer(window.pickOrder[currentPickerIndex], "pick");

            // Mettre à jour le joueur actif (visuel score)
            activePlayerName = window.pickOrder[currentPickerIndex];
            renderScores();

            // Reset du bouton
            btnValider.dataset.selectedIndex = "";
        }

        // --- LOGIQUE JOUEURS ---
        else if (phase === "players_pick") {
            const currentPlayer = window.pickOrder[currentPickerIndex];

            // Retirer la carte de la main du joueur
            const cardSrc = mains[currentPlayer].splice(Number(idx), 1)[0];
            selections[currentPlayer] = { carte: cardSrc, isMaster: false };

            btnValider.dataset.selectedIndex = "";
            currentPickerIndex++;

            // Y a-t-il encore des joueurs qui doivent choisir ?
            if (currentPickerIndex < window.pickOrder.length) {
                // Oui, au suivant
                const nextPlayer = window.pickOrder[currentPickerIndex];
                renderHandForPlayer(nextPlayer, "pick");
                activePlayerName = nextPlayer;
                renderScores();
            } else {
                // Non, tout le monde a choisi -> On passe au REVEAL
                btnValider.classList.add("hidden");
                inputPhrase.classList.add("hidden");
                activePlayerName = null;
                renderScores();

                infoDiv.textContent = "Tout le monde a choisi. Prêt pour le vote !";
                prepareRevealAndVoting();
            }
        }
    });
    function showVoteDetails() {
        const grid = document.getElementById('voteDetailsGrid');

        // 1. Préparation des données (Regrouper les votes par propriétaire)
        const votesByOwner = {};
        listJoueurs.forEach(p => votesByOwner[p] = []);

        for (const [voterName, ownerName] of Object.entries(votes)) {
            if (votesByOwner[ownerName]) {
                votesByOwner[ownerName].push(voterName);
            }
        }

        // 2. On vide la grille précédente (important !)
        grid.innerHTML = '';

        // 3. Génération des cartes
        revealList.forEach(entry => {
            const owner = entry.owner;
            const voters = votesByOwner[owner];
            const isMaster = (owner === masterPlayer);

            // Création de l'élément carte
            const cardDiv = document.createElement('div');
            cardDiv.className = 'vote-detail-card'; // Classe CSS

            // Logique de style pour le maître
            const borderStyle = isMaster ? "border: 4px solid gold;" : "border: 2px solid #ccc;";
            const titleClass = isMaster ? "master-title" : "";
            const icon = isMaster ? "👑" : "";

            cardDiv.innerHTML = `
            <img src="${entry.src}" style="${borderStyle}" alt="Carte de ${owner}">
            <p class="${titleClass}">${owner} ${icon}</p>
            <div class="voters-list">
                <em>Votes reçus :</em>
                <ul>
                    ${voters.length > 0
                    ? voters.map(v => `<li>${v}</li>`).join('')
                    : '<li style="opacity:0.5; list-style:none;">Aucun</li>'}
                </ul>
            </div>
        `;

            grid.appendChild(cardDiv);
        });

        // 4. Afficher l'overlay
        voteDetailsOverlay.classList.remove('hidden');
    }

    // initial setup
    distribuerCartes();
    renderScores();
    startMasterPick();


});
