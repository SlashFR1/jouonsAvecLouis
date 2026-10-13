// ==========================================
// FICHIER 2 : INTERFACE UTILISATEUR (UI) - CORRIGÉ
// ==========================================

// UTILISATION DE GETTERS : 
// Cela permet d'éviter l'erreur où le script ne trouve pas les div au chargement
const DOM = {
    get cartesDiv() { return document.getElementById("cartesContainer"); },
    get infoDiv() { return document.getElementById("infoJoueur"); },
    get phraseDiv() { return document.getElementById("phraseMaître"); },
    get inputPhrase() { return document.getElementById("inputPhrase"); },
    get btnValider() { return document.getElementById("valider"); },
    get btnReveal() { return document.getElementById("btnReveal"); },
    get zoneVote() { return document.getElementById("zoneVote"); },
    get scoresBoard() { return document.getElementById("scoresBoard"); },
    get mancheInfo() { return document.getElementById("mancheInfo"); },
    get overlay() { return document.getElementById('screenOverlay'); },
    get voteDetailsOverlay() { return document.getElementById('voteDetailsOverlay'); },
    get voteGrid() { return document.getElementById('voteDetailsGrid'); }
};

const UI = {
    // Affiche les scores en haut
    renderScores: () => {
        // Sécurité : si le div n'existe pas encore, on ne fait rien
        if (!DOM.scoresBoard) return;

        DOM.scoresBoard.innerHTML = "";
        listJoueurs.forEach(j => {
            const box = document.createElement("div");
            box.className = "scoreBox" + (j === GameState.activePlayer ? " active-player" : "");
            // Style inline pour être sûr que ça s'affiche
            box.style.border = "1px solid #ccc";
            box.style.padding = "5px";
            box.style.margin = "5px";
            box.style.display = "inline-block";
            
            box.innerHTML = `<div><strong>${j}</strong></div><div class="small">${GameState.scores[j]} pts</div>`;
            DOM.scoresBoard.appendChild(box);
        });
        if(DOM.mancheInfo) DOM.mancheInfo.textContent = `Manche ${GameState.mancheActuelle} / ${totalManches}`;
    },

    // Affiche la main du joueur courant
    renderHand: (player, isMasterPick) => {
        // Sécurité critique
        if (!DOM.cartesDiv) {
            console.error("ERREUR CRITIQUE : <div id='cartesContainer'> est introuvable dans le HTML.");
            return;
        }

        DOM.cartesDiv.innerHTML = "";
        DOM.zoneVote.innerHTML = "";
        DOM.inputPhrase.value = "";
        DOM.btnValider.dataset.selectedIndex = ""; 

        // Textes d'instruction
        if (isMasterPick) {
            DOM.infoDiv.textContent = `🎩 Maître : ${player} — écris une phrase et choisis une carte.`;
            DOM.inputPhrase.classList.remove("hidden");
            DOM.inputPhrase.style.display = "block"; // Force l'affichage
            DOM.btnValider.textContent = "Valider phrase & carte";
        } else {
            DOM.infoDiv.textContent = `👉 ${player}, choisis une carte.`;
            DOM.inputPhrase.classList.add("hidden");
            DOM.inputPhrase.style.display = "none"; 
            DOM.btnValider.textContent = "Valider carte";
        }

        // Phrase du maître
        if (GameState.selections[GameState.getMaster()]?.phrase) {
            DOM.phraseDiv.textContent = "🗣️ " + GameState.selections[GameState.getMaster()].phrase;
        } else {
            DOM.phraseDiv.textContent = "";
        }

        // --- CORRECTION SLOT ---
        // On crée la zone directement visible
        const cartesZone = document.createElement("div");
        cartesZone.id = "zoneCartesJoueur";
        cartesZone.style.display = "flex";
        cartesZone.style.flexWrap = "wrap";
        cartesZone.style.gap = "10px";
        cartesZone.style.marginTop = "15px";

        // Bouton pour masquer/voir (Optionnel, mais on le laisse)
        const btnVoir = document.createElement("button");
        btnVoir.textContent = "👁️ Masquer / Voir mes cartes";
        btnVoir.style.marginBottom = "10px";
        btnVoir.onclick = () => {
            if (cartesZone.style.display === "none") {
                cartesZone.style.display = "flex";
            } else {
                cartesZone.style.display = "none";
            }
        };
        DOM.cartesDiv.appendChild(btnVoir);
        DOM.cartesDiv.appendChild(cartesZone);

        // Récupération des cartes
        const hand = GameState.mains[player] || [];

        // Si la main est vide, afficher un message d'erreur clair
        if (hand.length === 0) {
            cartesZone.innerHTML = `<p style="color:red; font-weight:bold;">⚠️ Aucune carte distribuée à ${player}. Vérifiez que les images existent dans le dossier !</p>`;
            return;
        }

        // Génération des slots
        hand.forEach((src, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "carte-wrapper";
            
            // STYLES FORCÉS POUR VOIR LES SLOTS MÊME SANS IMAGE
            wrapper.style.width = "150px";
            wrapper.style.height = "220px";
            wrapper.style.border = "2px dashed #999"; // Pointillés si pas d'image
            wrapper.style.backgroundColor = "#f0f0f0";
            wrapper.style.cursor = "pointer";
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.overflow = "hidden";

            const img = document.createElement("img");
            img.src = src;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            
            // Si l'image plante, on affiche un placeholder
            img.onerror = function() {
                this.src = "https://placehold.co/150x220?text=Image+Introuvable";
            };

            wrapper.onclick = () => {
                // Gestion de la sélection visuelle
                Array.from(cartesZone.children).forEach(child => {
                    child.style.border = "2px dashed #999";
                    child.style.transform = "scale(1)";
                });
                wrapper.style.border = "4px solid #2ecc71"; // Vert quand sélectionné
                wrapper.style.transform = "scale(1.05)";
                
                DOM.btnValider.dataset.selectedIndex = idx;
            };

            wrapper.appendChild(img);
            cartesZone.appendChild(wrapper);
        });
        
        DOM.btnValider.classList.remove("hidden");
        DOM.btnValider.style.display = "block";
    },

    // Affiche l'interstitiel
    showInterstitial: (playerName, message, onReady) => {
        if(!DOM.overlay) return;
        DOM.overlay.innerHTML = '';
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.style.display = "flex"; // Force flex
        
        const container = document.createElement('div');
        container.className = 'interstitial';
        container.style.background = "white";
        container.style.padding = "20px";
        container.style.borderRadius = "8px";
        container.style.textAlign = "center";

        container.innerHTML = `<h2 style="color:#333">${playerName}</h2><p>${message}</p>`;
        
        const btn = document.createElement('button');
        btn.textContent = "C'est moi !";
        btn.style.fontSize = "1.2rem";
        btn.style.padding = "10px 20px";
        btn.style.marginTop = "15px";
        btn.onclick = () => {
            DOM.overlay.classList.add('hidden');
            DOM.overlay.style.display = "none";
            onReady();
        };
        container.appendChild(btn);
        DOM.overlay.appendChild(container);
    },

    // Affiche le plateau de vote
    setupVotingBoard: (revealList, onVoteCallback) => {
        DOM.cartesDiv.innerHTML = "";
        DOM.zoneVote.innerHTML = "";
        
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexWrap = "wrap";
        container.style.gap = "10px";
        DOM.cartesDiv.appendChild(container);

        revealList.forEach((entry, idx) => {
            const wrapper = document.createElement("div");
            wrapper.style.width = "150px";
            wrapper.style.height = "220px";
            wrapper.style.border = "2px solid #ccc";
            wrapper.style.cursor = "pointer";
            
            const img = document.createElement("img");
            img.src = entry.src;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";

            img.onclick = () => {
                // Reset styles
                Array.from(container.children).forEach(c => c.style.border = "2px solid #ccc");
                wrapper.style.border = "4px solid #3498db"; // Bleu
                
                DOM.zoneVote.innerHTML = "";
                const btnConfirm = document.createElement('button');
                btnConfirm.textContent = "Confirmer le vote";
                btnConfirm.style.marginTop = "20px";
                btnConfirm.style.padding = "10px";
                btnConfirm.onclick = () => onVoteCallback(idx);
                DOM.zoneVote.appendChild(btnConfirm);
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        });
    },

    // Résultats
    showRoundResults: (votesRecus, onNext, onDetails) => {
        const masterPlayer = GameState.getMaster();
        DOM.cartesDiv.innerHTML = "";
        
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexWrap = "wrap";
        container.style.gap = "15px";
        DOM.cartesDiv.appendChild(container);

        GameState.revealList.forEach((entry) => {
            const wrapper = document.createElement("div");
            wrapper.style.textAlign = "center";
            wrapper.style.width = "150px";
            
            const img = document.createElement("img");
            img.src = entry.src;
            img.style.width = "150px";
            img.style.height = "220px";
            img.style.objectFit = "cover";
            img.style.border = entry.owner === masterPlayer ? "5px solid gold" : "2px solid #aaa";
            
            const info = document.createElement("div");
            info.innerHTML = `<strong>${entry.owner}</strong><br>Votes : ${votesRecus[entry.owner] || 0}`;
            
            wrapper.appendChild(img);
            wrapper.appendChild(info);
            container.appendChild(wrapper);
        });

        DOM.zoneVote.innerHTML = "";
        
        const btnDetails = document.createElement("button");
        btnDetails.textContent = "🔍 Détails";
        btnDetails.onclick = onDetails;

        const btnNext = document.createElement("button");
        btnNext.textContent = (GameState.mancheActuelle >= totalManches) ? "🏁 Fin de partie" : "➡️ Manche suivante";
        btnNext.onclick = onNext;

        DOM.zoneVote.append(btnDetails, btnNext);
    },

    showVoteDetailsModal: () => {
        if(!DOM.voteGrid) return;
        DOM.voteGrid.innerHTML = '';
        
        // Logique inchangée, juste sécurisée
        const votesByOwner = {};
        listJoueurs.forEach(p => votesByOwner[p] = []);
        for (const [voter, owner] of Object.entries(GameState.votes)) {
            if (votesByOwner[owner]) votesByOwner[owner].push(voter);
        }

        GameState.revealList.forEach(entry => {
            const isMaster = (entry.owner === GameState.getMaster());
            const cardDiv = document.createElement('div');
            cardDiv.style.border = "1px solid #ddd";
            cardDiv.style.padding = "10px";
            cardDiv.style.marginBottom = "10px";
            
            cardDiv.innerHTML = `
                <div style="font-weight:bold; color:${isMaster ? 'orange' : 'black'}">
                    ${entry.owner} ${isMaster ? '👑' : ''}
                </div>
                <div>Votes reçus: ${votesByOwner[entry.owner].join(', ') || 'Aucun'}</div>
            `;
            DOM.voteGrid.appendChild(cardDiv);
        });
        DOM.voteDetailsOverlay.classList.remove('hidden');
        DOM.voteDetailsOverlay.style.display = "flex";
    },

    showWinnerScreen: (winnerText, maxScore, onReplay) => {
        if(!DOM.overlay) return;
        DOM.overlay.innerHTML = '';
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.style.display = "flex";
        
        const box = document.createElement('div');
        box.style.background = "white";
        box.style.padding = "30px";
        box.innerHTML = `
            <h2>🏆 Victoire ! 🏆</h2>
            <p class="winner-name" style="font-size:1.5em; font-weight:bold;">${winnerText}</p>
            <p>Score : ${maxScore} points</p>
        `;
        const btn = document.createElement('button');
        btn.textContent = "Rejouer";
        btn.style.marginTop = "20px";
        btn.onclick = onReplay;
        box.appendChild(btn);
        DOM.overlay.appendChild(box);
    }
};

// Fermeture de la modale détail
const closeBtn = document.getElementById('closeVoteDetails');
if(closeBtn) {
    closeBtn.onclick = () => { 
        DOM.voteDetailsOverlay.classList.add('hidden'); 
        DOM.voteDetailsOverlay.style.display = "none";
    };
}