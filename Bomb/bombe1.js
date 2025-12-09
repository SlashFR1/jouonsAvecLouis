        // Tableau pour stocker les joueurs en mémoire
        let listeJoueurs = [];

        const input = document.getElementById('ajoutInput');
        const container = document.getElementById('joueursList');

        // Écouter la touche "Entrée"
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                ajouterJoueur();
            }
        });

        function ajouterJoueur() {
            const prenom = input.value.trim();

            // Vérifications basiques
            if (!prenom) return;
            if (listeJoueurs.length >= 15) {
                alert("Maximum 15 joueurs !");
                return;
            }
            if (listeJoueurs.includes(prenom)) {
                alert("Ce joueur est déjà dans la liste !");
                input.value = '';
                return;
            }

            // Ajout au tableau JS
            listeJoueurs.push(prenom);

            // Création de l'élément visuel (La carte 3D)
            const card = document.createElement('div');
            card.className = 'player-card';
            card.textContent = prenom;
            
            // Événement pour supprimer au clic
            card.onclick = function() {
                // Animation de suppression
                card.style.transform = "scale(0) rotate(360deg)";
                setTimeout(() => {
                    container.removeChild(card);
                    // Retirer du tableau
                    listeJoueurs = listeJoueurs.filter(j => j !== prenom);
                }, 300);
            };

            container.appendChild(card);

            // Reset l'input
            input.value = '';
            input.focus();
        }

        // Ta fonction de validation modifiée pour utiliser notre liste
        function validerJoueurs() {
            if (listeJoueurs.length === 0) {
                alert("Veuillez entrer au moins un joueur !");
                return;
            }

            // Stocker les joueurs dans le localStorage
            localStorage.setItem("joueurs", JSON.stringify(listeJoueurs));

            // Effet visuel avant redirection (optionnel)
            document.body.style.transform = "scale(10)";
            document.body.style.opacity = "0";
            document.body.style.transition = "1s ease-in";

            setTimeout(() => {
                window.location.href = "bomb2.html";
            }, 800);
        }