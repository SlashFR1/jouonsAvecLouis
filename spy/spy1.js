function validerJoueurs() {
    const form = document.getElementById('joueursForm');
    const inputs = form.querySelectorAll('input');
    const joueurs = [];

    inputs.forEach(input => {
        const prenom = input.value.trim();
        // On ne garde que les prénoms non vides et uniques
        if (prenom && !joueurs.includes(prenom)) {
            joueurs.push(prenom);
        }
    });

    console.log("Joueurs récupérés :", joueurs);

    // Vérification du nombre minimum
    if (joueurs.length < 3) {
        alert("Veuillez entrer au moins 3 prénoms !");
        return;
    }

    // Stocker la liste et le nombre de joueurs dans localStorage
    localStorage.setItem('joueurs', JSON.stringify(joueurs));
    localStorage.setItem('nombreJoueurs', joueurs.length);

    // Redirection vers l'autre page
    window.location.assign('spy2.html');
}
