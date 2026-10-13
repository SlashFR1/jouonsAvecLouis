const joueursContainer = document.getElementById('joueursContainer');

// Ajouter automatiquement 2 champs au départ
for (let i = 0; i < 2; i++) {
    ajouterJoueur();
}

function ajouterJoueur() {
    const div = document.createElement('div');
    div.className = 'joueur-input';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Joueur ${joueursContainer.children.length + 1}`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Supprimer';
    removeBtn.onclick = () => div.remove();
    div.appendChild(input);
    div.appendChild(removeBtn);
    joueursContainer.appendChild(div);
}

function toggleRegles() {
    var x = document.getElementById("regles");
    // Si c'est caché (none) ou vide, on affiche (block), sinon on cache
    if (x.style.display === "none" || x.style.display === "") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function validerJoueurs() {
    const inputs = joueursContainer.querySelectorAll('input');
    const joueurs = [];
    const themeSelect = document.getElementById('choixTheme');
    const themeChoisi = themeSelect.value;

    inputs.forEach(input => {
        const prenom = input.value.trim();
        if (prenom && !joueurs.includes(prenom)) {
            joueurs.push(prenom);
        }
    });

    if (joueurs.length <= 1) {
        alert("Veuillez entrer au moins 2 prénoms !");
        return;
    } else {
        alert("Joueurs validés");
        localStorage.setItem('joueurs', JSON.stringify(joueurs));
        localStorage.setItem('nombreJoueurs', joueurs.length);
        localStorage.setItem('themeGalerie', themeChoisi);
        window.location.assign('galerie2.html');
    }
}