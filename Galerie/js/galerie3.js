// Galerie 3 - Victoire & Résultats
document.addEventListener("DOMContentLoaded", () => {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    const pageResultat = document.getElementById('pageResultat');
    const h1Victoire = document.querySelector('h1');

    const entries = Object.entries(scores);
    if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        const vainqueur = entries[0];
        if (h1Victoire) {
            h1Victoire.textContent = `🎉 Victoire de ${vainqueur[0]} avec ${vainqueur[1]} points ! 🎉`;
        }

        if (pageResultat) {
            let html = '<div class="card" style="max-width:500px; margin:20px auto; padding:20px;"><h2>Scores Finaux</h2><ul style="list-style:none; padding:0;">';
            entries.forEach(([nom, score], idx) => {
                html += `<li style="padding:10px; font-size:1.2rem; border-bottom:2px dashed #000; display:flex; justify-content:space-between;">
                    <span>${idx === 0 ? '👑 ' : ''}${nom}</span>
                    <strong>${score} pts</strong>
                </li>`;
            });
            html += '</ul><button onclick="window.location.href=\'galerie1.html\'" style="margin-top:20px;">Rejouer 🔄</button></div>';
            pageResultat.innerHTML = html;
        }
    } else {
        if (h1Victoire) h1Victoire.textContent = "Victoire & Résultats";
        if (pageResultat) {
            pageResultat.innerHTML = '<div class="card" style="max-width:400px; margin:20px auto; padding:20px;"><p>Aucune partie enregistrée.</p><button onclick="window.location.href=\'galerie1.html\'">Nouvelle Partie</button></div>';
        }
    }
});
