
document.addEventListener("DOMContentLoaded", () => {
    // CONFIGURATION / DONNÉES INITIALLES
    const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || ["Joueur1", "Joueur2", "Joueur3", "Joueur4"];
    const nbJoueurs = listJoueurs.length;
    const totalManches = 3;

    // Exemple de deck: ici on suppose images img1..img40 dans dossier imageDixit/converties/
    const cartesDeck = [];
    for (let i = 1; i <= 40; i++) cartesDeck.push(`imageDixit/converties/img${i}.jpg`);

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

    // STATE
    let scores = {};
    listJoueurs.forEach(j => scores[j] = 0);

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
        // Construire le tableau de nombres de votes par propriétaire
        const votesRecus = {};
        for (const j of listJoueurs) votesRecus[j] = 0;
        for (const voter in votes) {
            const owner = votes[voter];
            if (owner) votesRecus[owner]++;
        }

        const nbVotants = nbJoueurs - 1;
        const votesMaitre = votesRecus[masterPlayer];

        // Scoring Dixit (votre logique de scoring reste inchangée)
        if (votesMaitre === 0 || votesMaitre === nbVotants) {
            scores[masterPlayer] += 0;
            listJoueurs.forEach(p => { if (p !== masterPlayer) scores[p] += 2; });
        } else {
            scores[masterPlayer] += 3;
            for (const voter in votes) if (votes[voter] === masterPlayer) scores[voter] += 3;
            for (const p of listJoueurs) if (p !== masterPlayer) scores[p] += votesRecus[p];
        }

        // Révéler les cartes et afficher les compteurs (votre logique reste inchangée)
        cartesDiv.innerHTML = "";
        phraseDiv.textContent = "🗣️ Phrase du maître : " + selections[masterPlayer].phrase;

        revealList.forEach((entry, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "carte-wrapper";
            const img = document.createElement("img");
            img.src = entry.src;
            img.style.border = entry.owner === masterPlayer ? "3px solid gold" : "2px solid #555";
            wrapper.appendChild(img);
            const info = document.createElement("div");
            info.textContent = `${entry.owner} — votes reçus : ${votesRecus[entry.owner]}`;
            wrapper.appendChild(info);
            cartesDiv.appendChild(wrapper);
        });

        const voteSummary = document.createElement("div");
        voteSummary.style.marginTop = "12px";
        voteSummary.innerHTML = `<strong>Résumé des votes :</strong><br>` + Object.entries(votes).map(([voter, owner]) => `${voter} → ${owner}`).join("<br>");
        zoneVote.innerHTML = "";
        zoneVote.appendChild(voteSummary);

        renderScores();

        // ------ NOUVELLE PARTIE À REMPLACER ------
        // Au lieu d'ajouter un simple bouton, on affiche l'overlay.

        // Délai pour laisser aux joueurs le temps de voir les scores
        setTimeout(showNextRoundOverlay, 3000); // Affiche l'overlay après 3 secondes
    }

    // NOUVELLE FONCTION pour afficher l'overlay de fin de manche
    function showNextRoundOverlay() {
        const overlay = document.getElementById('screenOverlay');
        overlay.innerHTML = ''; // Vide l'overlay au cas où
        overlay.classList.remove('hidden');

        const container = document.createElement('div');
        container.className = 'interstitial';

        const title = document.createElement('h2');
        title.textContent = "Fin de la manche !";
        container.appendChild(title);

        // Affiche le classement actuel
        const scoresList = document.createElement('p');
        scoresList.innerHTML = '<strong>Classement actuel :</strong><br>' +
            Object.entries(scores)
                  .sort(([,a],[,b]) => b - a) // Trie les scores du plus haut au plus bas
                  .map(([player, score]) => `${player}: ${score} pts`)
                  .join('<br>');
        container.appendChild(scoresList);


        const btnNext = document.createElement("button");
        btnNext.textContent = (mancheActuelle >= totalManches) ? "Terminer et voir le gagnant" : "Passer à la manche suivante";

        btnNext.addEventListener("click", () => {
            overlay.classList.add('hidden'); // Cache l'overlay avant de continuer
            if (mancheActuelle >= totalManches) {
                announceWinner();
            } else {
                nouvelleManche();
            }
        });

        container.appendChild(btnNext);
        overlay.appendChild(container);
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
    function announceWinner() {
        // determine max
        let max = -Infinity, gagnant = "";
        for (const p of listJoueurs) {
            if (scores[p] > max) { max = scores[p]; gagnant = p; }
        }
        infoDiv.textContent = `🏆 Fin du jeu ! Le gagnant est ${gagnant} avec ${max} points !`;
        phraseDiv.textContent = "";
        cartesDiv.innerHTML = "";
        zoneVote.innerHTML = "";
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
        infoDiv.textContent = `🎩 Le conteur est du jeu est ${masterPlayer}. Écris une phrase et choisis une carte.`;
        phraseDiv.textContent = "";

        btnValider.classList.remove("hidden");
        btnValider.dataset.selectedIndex = "";
        inputPhrase.classList.remove("hidden");

        currentPlayerIndex = listJoueurs.indexOf(masterPlayer);
        renderHandForPlayer(masterPlayer, "pick");
    }
    // event: valider click (used both for master and for other players)
    btnValider.addEventListener("click", () => {
        if (phase === "master_pick") {
            const idx = btnValider.dataset.selectedIndex;
            const phrase = inputPhrase.value.trim();
            if (idx === "" || idx === undefined) { alert("Veuillez choisir une carte !"); return; }
            if (!phrase) { alert("Veuillez écrire une phrase !"); return; }

            // take card from master's hand
            const cardSrc = mains[masterPlayer].splice(Number(idx), 1)[0];
            selections[masterPlayer] = { carte: cardSrc, isMaster: true, phrase };
            // prepare players pick phase
            phase = "players_pick";
            // set currentPickerIndex to first player after master
            currentPickerIndex = 0;
            // find order of players to pick (listJoueurs order excluding master)
            pickOrder = listJoueurs.filter(p => p !== masterPlayer);
            infoDiv.textContent = `👉 Maintenant chaque joueur (sauf le maître) choisit une carte, à tour de rôle.`;
            // start first picker
            renderHandForPlayer(pickOrder[currentPickerIndex], "pick");
            btnValider.dataset.selectedIndex = "";
        } else if (phase === "players_pick") {
            // determine current picking player (we saved pickOrder above)
            if (!window.pickOrder || !window.pickOrder[currentPickerIndex]) {
                console.error("pickOrder missing");
                return;
            }
            const player = window.pickOrder[currentPickerIndex];
            const idx = btnValider.dataset.selectedIndex;
            if (idx === "" || idx === undefined) { alert("Veuillez choisir une carte !"); return; }
            // remove chosen card from player's hand
            const cardSrc = mains[player].splice(Number(idx), 1)[0];
            selections[player] = { carte: cardSrc, isMaster: false };
            btnValider.dataset.selectedIndex = "";
            // next player
            currentPickerIndex++;
            if (currentPickerIndex < window.pickOrder.length) {
                renderHandForPlayer(window.pickOrder[currentPickerIndex], "pick");
            } else {
                // all players have picked
                btnValider.classList.add("hidden");
                inputPhrase.classList.add("hidden");
                infoDiv.textContent = "Tous les joueurs ont choisi leur carte ! Préparation du reveal.";
                prepareRevealAndVoting();
            }
        } else {
            // other phases should not use this button
        }
    });

    // initial setup
    distribuerCartes();
    renderScores();
    startMasterPick();
});

