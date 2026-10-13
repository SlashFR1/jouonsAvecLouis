// Récupération des joueurs et du mot de l'espion
const listJoueurs = JSON.parse(localStorage.getItem('joueurs')) || [];
const joueursMots = JSON.parse(localStorage.getItem('joueursMots')) || [];
const lieuChoisi = localStorage.getItem('lieuChoisi') || "";

let current = 0; // Index du joueur courant
let votes = [];  // Tableau pour stocker les votes

// Références aux éléments du DOM
const joueursRestantsDiv = document.getElementById("joueursRestants");
const preVoteSection = document.getElementById("preVoteSection");
const preVotePlayerName = document.getElementById("preVotePlayerName");
const startVoteBtn = document.getElementById("startVoteBtn");
const voteSection = document.getElementById("voteSection");
const voteButtonsDiv = document.getElementById("voteButtons");
const submitVoteBtn = document.getElementById("submitVote");
const resultSection = document.getElementById("resultSection");
const voteResultsDiv = document.getElementById("voteResults");
const spyResultDiv = document.getElementById("spyResult");

// Variable globale pour gérer la sélection actuelle
let selectionVote = null;

/**
 * ÉTAPE 1: Annonce le joueur dont c'est le tour.
 */
function startTour() {
    // Si tous les joueurs ont voté, on affiche les résultats
    if (current >= listJoueurs.length) {
        afficherResultats();
        return;
    }

    // Cache toutes les sections sauf l'écran d'attente
    joueursRestantsDiv.style.display = "none";
    voteSection.style.display = "none";
    resultSection.style.display = "none";
    preVoteSection.style.display = "block";

    const joueurActuel = listJoueurs[current];
    preVotePlayerName.textContent = `C'est le tour de ${joueurActuel} !`;
}

/**
 * ÉTAPE 2: Affiche l'interface de vote (boutons ou champ texte)
 *          déclenchée par le clic sur "Je suis prêt(e) à voter".
 */
function afficherInterfaceDeVote() {
    // On cache l'écran d'attente et on montre l'interface de vote
    preVoteSection.style.display = "none";
    voteSection.style.display = "block";

    const joueurActuel = listJoueurs[current];
    const motActuel = joueursMots[current];
    const estEspion = motActuel === "Espion";

    // Réinitialise l'interface
    voteButtonsDiv.innerHTML = "";
    submitVoteBtn.disabled = true;
    selectionVote = null;

    if (estEspion) {
        // --- TOUR DE L'ESPION ---
        document.querySelector('#voteSection h3').textContent = "Espion, quel est le lieu selon vous ?";
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'spyGuessInput';
        input.placeholder = 'Entrez votre supposition...';
        voteButtonsDiv.appendChild(input);

        input.addEventListener('input', () => {
            selectionVote = input.value.trim();
            submitVoteBtn.disabled = selectionVote === '';
        });

    } else {
        // --- TOUR D'UN JOUEUR NORMAL ---
        document.querySelector('#voteSection h3').textContent = "Votez pour le joueur que vous pensez être le SPY :";
        const autresJoueurs = listJoueurs.filter(j => j !== joueurActuel);

        autresJoueurs.forEach(nom => {
            const button = document.createElement('button');
            button.textContent = nom;
            button.className = 'vote-btn';
            voteButtonsDiv.appendChild(button);

            button.addEventListener('click', (e) => {
                selectionVote = nom;
                document.querySelectorAll('.vote-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                submitVoteBtn.disabled = false;
            });
        });
    }
}

/**
 * ÉTAPE 3: Gère la soumission d'un vote.
 */
function soumettreLeVote() {
    if (selectionVote === null) return;

    const joueurActuel = listJoueurs[current];
    const estEspion = joueursMots[current] === "Espion";

    if (estEspion) {
        votes.push({ voter: joueurActuel, guess: selectionVote });
    } else {
        votes.push({ voter: joueurActuel, votedFor: selectionVote });
    }

    // Passe au joueur suivant et affiche un message de transition
    current++;
    voteSection.style.display = "none";
    joueursRestantsDiv.textContent = `Vote enregistré ! Cachez l'écran et passez le téléphone...`;
    joueursRestantsDiv.style.display = "block";

    // Petite pause pour simuler la passation du téléphone avant de recommencer
    setTimeout(startTour, 2500);
}

// Ajout des écouteurs d'événements aux boutons
startVoteBtn.addEventListener('click', afficherInterfaceDeVote);
submitVoteBtn.addEventListener('click', soumettreLeVote);

// La fonction afficherResultats() reste la même que la version corrigée précédente
function afficherResultats() {
    joueursRestantsDiv.style.display = 'none';
    voteSection.style.display = 'none';
    resultSection.style.display = 'block';

    // --- 1. Calculer les votes ---
    const voteCounts = {};
    listJoueurs.forEach(j => { voteCounts[j] = 0; });

    const votesContreJoueurs = votes.filter(v => v.votedFor);
    votesContreJoueurs.forEach(vote => {
        if (voteCounts[vote.votedFor] !== undefined) {
            voteCounts[vote.votedFor]++;
        }
    });

    // --- 2. Afficher le détail des votes ---
    let voteResultsHTML = '<h4>Détail des votes :</h4><ul>';
    votesContreJoueurs.forEach(vote => {
        voteResultsHTML += `<li>${vote.voter} a voté contre ${vote.votedFor}</li>`;
    });
    voteResultsHTML += '</ul>';
    voteResultsDiv.innerHTML = voteResultsHTML;

    // --- 3. Déterminer le joueur le plus accusé ---
    let maxVotes = 0;
    let playersWithMaxVotes = [];
    for (const player in voteCounts) {
        if (voteCounts[player] > maxVotes) {
            maxVotes = voteCounts[player];
            playersWithMaxVotes = [player];
        } else if (voteCounts[player] === maxVotes) {
            playersWithMaxVotes.push(player);
        }
    }
    const joueurLePlusVote = playersWithMaxVotes.length === 1 ? playersWithMaxVotes[0] : null;

    // --- 4. Identifier l'espion et sa supposition ---
    const spyIndex = joueursMots.indexOf("Espion");
    const spyName = spyIndex !== -1 ? listJoueurs[spyIndex] : null;
    const spyVote = votes.find(v => v.guess);
    const spyGuess = spyVote ? spyVote.guess : "";
    const spyGuessedLocation = spyGuess.trim().toLowerCase() === lieuChoisi.trim().toLowerCase();

    // --- 5. APPLIQUER LA CLASSE DE VICTOIRE ---
    const joueursGagnent = joueurLePlusVote && joueurLePlusVote === spyName;
    if (joueursGagnent) {
        spyResultDiv.classList.add('victoire-joueurs');
    } else {
        spyResultDiv.classList.add('victoire-espion');
    }

    // --- 6. CONSTRUIRE LE HTML FINAL ---
    let finalOutcomeHTML = `<h3>L'espion était : ${spyName}</h3>`;
    finalOutcomeHTML += `<p>Le lieu était : <strong>${lieuChoisi}</strong></p><hr>`;
    if (joueursGagnent) {
        finalOutcomeHTML += `<h2>Victoire des Joueurs !</h2><p>Vous avez réussi à démasquer l'espion, ${spyName} !</p>`;
    } else {
        finalOutcomeHTML += `<h2>Victoire de l'Espion !</h2>`;
        if (joueurLePlusVote) {
            finalOutcomeHTML += `<p>Vous avez accusé ${joueurLePlusVote} à tort.</p>`;
        } else {
            finalOutcomeHTML += `<p>Vos votes étaient partagés, l'espion s'en sort !</p>`;
        }
    }
    if (spyGuessedLocation) {
        finalOutcomeHTML += `<p>De plus, l'espion a brillamment identifié le lieu !</p>`;
    } else if (spyName && spyGuess) {
        finalOutcomeHTML += `<p>L'espion pensait que le lieu était "${spyGuess}", mais ce n'était pas correct.</p>`;
    }
    spyResultDiv.innerHTML = finalOutcomeHTML;
}


// Démarrer le premier tour de vote au chargement de la page
startTour();