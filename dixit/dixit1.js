function validerJoueurs() {
    const form = document.getElementById('joueursForm');
    const inputs = form.querySelectorAll('input');
    const joueurs = [];

    inputs.forEach(input => {
        const prenom = input.value.trim();
        if (prenom && !joueurs.includes(prenom)) {
            joueurs.push(prenom);
        }
    });
    console.log(joueurs);
    if (joueurs.length <= 1) {
        alert("Veuillez entrer au moins 1 prénoms !");
        return;
    } else {
        alert("Joueurs validés");

        // Stocker la liste et le nombre de joueurs dans localStorage
        localStorage.setItem('joueurs', JSON.stringify(joueurs));
        localStorage.setItem('nombreJoueurs', joueurs.length);

        // Redirection vers l'autre page
        window.location.assign('dixit2.html');
    }
}