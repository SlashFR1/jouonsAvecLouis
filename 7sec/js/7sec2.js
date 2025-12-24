

        let timer = 7;       // durée du tour
        let interval;        // pour le décompte du tour
        let secondes = 0;    // compteur global
        let chrono;          // pour le décompte total (optionnel)
        let para;            // élément pour l'affichage global
        let joueurs = JSON.parse(localStorage.getItem("joueurs")) || ["Alice", "Bob"];

        // Fonction appelée au chargement de la page
        window.onload = function () {
            // Récupérer joueurs depuis localStorage
            joueurs = JSON.parse(localStorage.getItem("joueurs")) || ["Alice", "Bob"];

            // Chronomètre global
            para = document.getElementById("affichage");
            if (para) {
                secondes = 0;
                chrono = setInterval(tictictic, 1000);
            }

            // Si page2 est déjà affichée, tirer une question
            const page2 = document.getElementById('page2');
            if (page2 && page2.style.display !== 'none') {
                nouvelleQuestion();
            }
        };


        // Chronomètre global (facultatif)
        function tictictic() {
            secondes++;
            para.textContent = secondes + " s";
        }

        // Fonction appelée depuis la page d'accueil
        function commencerJeu() {
            const input = document.getElementById('joueurs').value.trim();
            if (input === "") {
                alert("Merci d'entrer au moins un joueur !");
                return;
            }
            joueurs = input.split(',').map(j => j.trim());
            document.getElementById('page1').style.display = 'none';
            document.getElementById('page2').style.display = 'block';
            nouvelleQuestion();
        }

        // Tire un joueur et une question au hasard
        function nouvelleQuestion() {
            clearInterval(interval);
            document.getElementById('message').textContent = "";
            document.getElementById('suivante').style.display = "none";
            timer = 7;
            document.getElementById('timer').textContent = timer;

            // Tirage du joueur
            const joueur = joueurs[Math.floor(Math.random() * joueurs.length)];

            // Tirage de la question
            let question = questions[Math.floor(Math.random() * questions.length)];

            // Remplace {joueur} par le nom du joueur tiré si nécessaire
            question = question.replace("{joueur}", joueur);

            document.getElementById('joueur').textContent = "À " + joueur + " de jouer !";
            document.getElementById('question').textContent = question;

            // Réactive le bouton "Démarrer" pour ce tour
            const demarrerBtn = document.getElementById('demarrerBtn');
            demarrerBtn.style.display = "inline";
            demarrerBtn.disabled = true;

        }

        // Lance le compte à rebours de 7 secondes
        function demarrer() {
            clearInterval(interval);
            timer = 7;
            document.getElementById('timer').textContent = timer;
            document.getElementById('message').textContent = "";

            // Masquer GO et afficher Reset + Finir
            document.getElementById('demarrerbtn').style.display = "none";
            document.getElementById('resetbtn').style.display = "inline";
            document.getElementById('finirbtn').style.display = "inline";

            // Masquer Question suivante au début
            document.getElementById('suivante').style.display = "none";

            interval = setInterval(() => {
                timer--;
                document.getElementById('timer').textContent = timer;
                if (timer <= 0) {
                    clearInterval(interval);
                    document.getElementById('timer').textContent = "0";
                    document.getElementById('message').textContent = "⏰ Temps écoulé !";

                    // Afficher Question suivante
                    document.getElementById('suivante').style.display = "inline";

                    // Masquer Reset + Finir
                    document.getElementById('resetbtn').style.display = "none";
                    document.getElementById('finirbtn').style.display = "none";
                }
            }, 1000);
        }

        function resetTimer() {
            clearInterval(interval);
            timer = 7;
            document.getElementById('timer').textContent = timer;
            document.getElementById('message').textContent = "";
            demarrer(); // relance le timer comme si on appuyait sur GO
        }

        function finirTour() {
            clearInterval(interval);
            document.getElementById('timer').textContent = "7";
            document.getElementById('message').textContent = "";

            // Masquer Reset + Finir et réafficher GO
            document.getElementById('resetbtn').style.display = "none";
            document.getElementById('finirbtn').style.display = "none";
            document.getElementById('demarrerbtn').style.display = "inline";

            // Afficher Question suivante
            document.getElementById('suivante').style.display = "inline";
        }

