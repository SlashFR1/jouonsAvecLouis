    function validerJoueurs() {
      const form = document.getElementById('joueursForm');
      const inputs = form.querySelectorAll('input');
      const joueurs = [];

      inputs.forEach(input => {
        const prenom = input.value.trim();
        if (prenom) { // Pas besoin de vérifier les doublons ici, laissez les gens avoir le même prénom s'ils le souhaitent
          joueurs.push(prenom);
        }
      });

      if (joueurs.length === 0) {
        alert("Veuillez entrer au moins un joueur !");
        return;
      }

      // Stocker les joueurs dans le localStorage pour la page suivante
      localStorage.setItem("joueurs", JSON.stringify(joueurs));

      // Redirection vers le jeu
      window.location.href = "vraioufaux2.html"; // Mettre le nom de votre page Vrai ou Faux ici
    }