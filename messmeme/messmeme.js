// --- 1. GESTION DES JOUEURS ---
        let joueurs = [];
        const inputElement = document.getElementById("inputJoueur");
        const listeElement = document.getElementById("listeJoueurs");

        // Permet d'ajouter avec la touche "Entrée"
        inputElement.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                ajouterJoueur();
            }
        });

        function ajouterJoueur() {
            const prenom = inputElement.value.trim();

            if (prenom === "") return; // Ne rien faire si vide
            if (joueurs.includes(prenom)) {
                alert("Ce joueur est déjà dans la liste !");
                return;
            }

            // Ajout à la liste logique
            joueurs.push(prenom);
            
            // Mise à jour de l'affichage
            afficherJoueurs();
            
            // Vider le champ
            inputElement.value = "";
            inputElement.focus();
        }

        function supprimerJoueur(index) {
            joueurs.splice(index, 1); // Retire le joueur du tableau
            afficherJoueurs();
        }

        function afficherJoueurs() {
            listeElement.innerHTML = ""; // On efface tout pour reconstruire

            if (joueurs.length === 0) {
                listeElement.innerHTML = '<div class="empty-message">Ajoutez des joueurs...</div>';
                return;
            }

            joueurs.forEach((joueur, index) => {
                // Création de l'étiquette joueur
                const tag = document.createElement("div");
                tag.className = "player-tag";
                tag.innerHTML = `
                    <span>${joueur}</span>
                    <button class="delete-btn" onclick="supprimerJoueur(${index})">×</button>
                `;
                listeElement.appendChild(tag);
            });
        }

        // --- 2. LANCEMENT DU JEU ---
        function lancerJeu() {
            if (joueurs.length < 2) {
                alert("Il faut au moins 2 joueurs pour jouer !");
                return;
            }

            // Sauvegarde dans le navigateur
            localStorage.setItem("joueurs_messmeme", JSON.stringify(joueurs));

            // Redirection vers la page de jeu (adapte le nom du fichier si besoin)
            window.location.href = "messmeme2.html";
        }

        // --- 3. GESTION DES RÈGLES ---
        function toggleRegles() {
            const modal = document.getElementById("overlay-regles");
            if (modal.style.display === "flex") {
                modal.style.display = "none";
            } else {
                modal.style.display = "flex";
            }
        }

