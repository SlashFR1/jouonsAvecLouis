  // --- LISTES DE DONNÉES ---
    const themes = ["couleurs", "fruits", "légumes", "animaux domestiques", "animaux sauvages", "animaux marins",
        "objets de la cuisine", "objets de la salle de bain", "vêtements", "chaussures", "métiers",
        "instruments de musique", "parties du corps", "super-héros", "films célèbres", "séries TV",
        "chansons connues", "personnages de dessins animés", "marques célèbres", "voitures", "pays",
        "capitales de pays", "sports", "jouets", "fêtes et célébrations", "contes et légendes",
        "émissions de télévision", "inventions improbables", "super-pouvoirs", "objets volants",
        "planètes fictives", "cafés imaginaires", "titres de films inventés", "animaux hybrides",
        "dinosaures", "robots", "créatures fantastiques", "actions depuis hier matin", "habitudes du matin",
        "nourriture préférée", "passe-temps", "bonnes manières", "choses à faire avant de dormir",
        "choses qu’on déteste", "choses qu’on aime", "films ou séries regardés récemment", "célébrités connues",
        "pays d’Afrique", "capitale asiatique", "montagnes célèbres", "fleuves connus", "monuments célèbres",
        "langues parlées dans le monde", "traditions locales", "plats typiques", "artistes célèbres",
        "écrivains connus", "choses rouges", "choses qu’on trouve dans un frigo", "choses qui volent",
        "choses qu’on peut porter sur la tête", "choses qui font du bruit", "choses sucrées",
        "choses qu’on trouve à l’école", "choses qu’on trouve dans un salon", "choses qu’on trouve dans une valise",
        "choses qui se mangent", "héros de Marvel", "héros de DC", "jeux vidéo", "films Disney", "films Pixar",
        "séries Netflix", "personnages de manga", "chansons à succès", "influenceurs connus", "sports célèbres",
        "objets dans une chambre", "choses à emporter en voyage", "types de danse", "styles de musique",
        "genres de films", "types de livres", "saisons de l'année", "mois de l'année", "jours de la semaine",
        "heures de la journée", "types de nuages", "phases de la lune", "planètes du système solaire",
        "constellations", "types de fleurs", "arbres", "animaux nocturnes", "animaux diurnes", "insectes",
        "types de poissons", "types d'oiseaux", "types de reptiles", "types de mammifères", "types d'amphibiens",
        "types de crustacés", "types de mollusques", "types de champignons", "types de bactéries",
        "types de virus", "types de champignons comestibles", "types de champignons toxiques", "types de fromages",
        "types de pain", "types de pâtes", "types de riz", "types de pommes de terre", "types de légumes",
        "types de fruits", "types de noix", "types de graines", "types de céréales", "types de légumineuses",
        "types de viandes", "types de poissons", "types de fruits de mer", "types de crustacés", "types de mollusques",
        "types de sauces", "types de soupes", "types de plats", "types de desserts", "types de boissons",
        "types de cocktails", "types de vins", "types de bières", "types de fromages", "types de charcuterie",
        "types de pains", "types de pâtisseries", "types de chocolats", "types de bonbons", "types de glaces",
        "types de fruits", "types de légumes", "types de noix", "types de graines", "types de céréales",
        "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "types de pains", "types de pâtisseries", "types de chocolats",
        "types de bonbons", "types de glaces", "types de fruits", "types de légumes", "types de noix", "types de graines",
        "types de céréales", "types de légumineuses", "types de viandes", "types de poissons", "types de fruits de mer",
        "types de crustacés", "types de mollusques", "types de sauces", "types de soupes", "types de plats",
        "types de desserts", "types de boissons", "types de cocktails", "types de vins", "types de bières",
        "types de fromages", "types de charcuterie", "grands philosophes", "principes de la physique", "inventions du XXe siècle", "grands peintres",
        "œuvres littéraires célèbres", "grandes découvertes scientifiques", "pays membres de l’ONU",
        "capitales européennes", "océans et mers", "montagnes célèbres", "fleuves importants",
        "écrivains français", "poètes célèbres", "phénomènes naturels", "animaux menacés",
        "réalisateurs de cinéma célèbres", "prix Nobel", "événements historiques du XXe siècle",
        "révolutions célèbres", "grandes batailles", "philosophies orientales", "courants artistiques",
        "sciences naturelles", "sciences sociales", "techniques de peinture", "instruments de musique classique",
        "compositeurs célèbres", "langues parlées dans le monde", "types de gouvernements",
        "grandes religions du monde", "principes économiques", "théories mathématiques célèbres",
        "grands inventeurs", "découvertes médicales", "maladies célèbres et leur traitement",
        "pièces de théâtre célèbres", "grands explorateurs", "civilisations anciennes", "dinosaures connus",
        "constellations et étoiles", "phénomènes astronomiques", "éléments chimiques", "types de volcans",
        "catastrophes naturelles célèbres", "formes géométriques", "mathématiciens célèbres",
        "technologies modernes", "réseaux sociaux importants", "grandes entreprises", "grandes inventions militaires",
        "sciences de la terre", "sciences du climat", "principes de chimie", "grandes philosophies antiques",
        "courants littéraires", "écoles artistiques", "grands compositeurs", "genres musicaux",
        "films oscarisés", "prix littéraires célèbres", "écrivains contemporains", "littérature classique",
        "histoire de France", "révolutions industrielles", "grandes découvertes archéologiques",
        "monuments historiques célèbres", "sites UNESCO", "patrimoine mondial", "pièces musicales célèbres",
        "festivals culturels", "grands poètes français", "inventions de Léonard de Vinci",
        "technologies spatiales", "explorations lunaires", "missions martiennes", "grandes innovations médicales",
        "grands mouvements sociaux", "droits humains célèbres", "grands discours historiques",
        "périodes historiques importantes", "événements politiques majeurs", "philosophes modernes",
        "théories psychologiques", "concepts économiques", "théories politiques", "courants religieux",
        "architectes célèbres", "styles architecturaux", "peintures célèbres", "sculptures célèbres",
        "biographies célèbres", "grandes aventures maritimes", "explorateurs polaires", "expéditions célèbres",
        "phénomènes météorologiques", "planètes du système solaire", "satellites célèbres",
        "grandes inventions agricoles", "innovations technologiques", "robots célèbres", "intelligence artificielle",
        "grandes épidémies", "personnalités scientifiques", "grandes avancées biologiques", "découvertes génétiques", "types de bières", "cocktails célèbres", "alcools forts", "marques de vin", "cocktails exotiques",
        "boissons énergisantes", "apéritifs connus", "cocktails classiques", "bières artisanales", "alcools régionaux",
        "habitudes de consommation", "cocktails maison", "types de whisky", "types de rhum", "types de vodka",
        "types de tequila", "cigares célèbres", "lieux de fête célèbres", "festivals alcoolisés",
        "films sur l’alcool", "séries sur l’alcool", "jeux d’alcool", "cocktails célèbres du cinéma",
        "cocktails historiques", "cocktails innovants", "cocktails tropicaux", "cocktails sans alcool",
        "marques de champagne", "types de digestifs", "mixologie", "techniques de bartending",
        "types de drogues (loi ou usage)", "effets des drogues", "drogues célèbres", "consommation responsable",
        "produits psychoactifs", "stupéfiants historiques", "usage récréatif", "effets secondaires",
        "stimulants", "hallucinogènes", "drogues naturelles", "drogues synthétiques", "prévention",
        "réhabilitation", "méthodes de consommation", "culture et drogues", "festivals et drogues",
        "lois sur la drogue", "histoire des drogues", "mythes sur la drogue",
        "parties du corps", "préliminaires", "positions sexuelles", "jouets érotiques", "films X",
        "tabous sexuels", "orientation sexuelle", "mythes sexuels", "contraception", "IST célèbres",
        "éducation sexuelle", "fantasmes célèbres", "sexualité dans la littérature", "sexualité dans le cinéma",
        "sexualité et société", "sexualité et santé", "règles et menstruations", "pratiques sexuelles célèbres",
        "célébrités et sexualité", "humour sur le sexe", "chansons à double sens"];

    const gages = ["Fais le tour de la table à cloche-pied.", "Sers le prochain verre à tout le monde.", "Raconte une blague. Si personne ne rit, bois une gorgée.", "Fais le tour de la table à cloche-pied.",
        "Sers le prochain verre à tout le monde.",
        "Raconte une blague. Si personne ne rit, bois une gorgée.",
        "Fais 10 pompes en criant le nom d’un joueur à chaque fois.",
        "Imite ton animal préféré pendant 30 secondes.",
        "Chante le refrain d’une chanson au hasard.",
        "Fais un compliment à chaque joueur autour de la table.",
        "Danse sur place pendant 20 secondes sans musique.",
        "Mime une scène de film célèbre et laisse les autres deviner.",
        "Fais un bruit d’animal à chaque fois que tu parles pendant 1 minute.",
        "Écris un message drôle et envoie-le à la dernière personne dans tes contacts.",
        "Bois une gorgée en fermant les yeux et en pointant un joueur au hasard pour deviner le contenu.",
        "Fais le robot pendant 15 secondes.",
        "Parle avec un accent choisi par les autres joueurs jusqu’au prochain tour.",
        "Chante l’alphabet à l’envers.",
        "Fais une déclaration d’amour dramatique à un objet dans la pièce.",
        "Mime une célébrité et laisse les autres deviner qui c’est.",
        "Bois une gorgée en faisant une grimace et en gardant la pose pendant 5 secondes.",
        "Raconte une anecdote embarrassante sur toi-même.",
        "Fais 5 sauts sur place en criant un mot choisi par les autres joueurs.",
        "Donne un surnom ridicule à chaque joueur pour le reste du jeu.",
        "Imite un bruit d’instrument de musique et fais deviner lequel.",
        "Écris un poème ridicule sur la personne à ta gauche.",
        "Fais une danse ridicule en chantant 'la la la'.",
        "Parle comme un robot jusqu’au prochain tour.",
        "Mime que tu es en train de voler un objet imaginaire.",
        "Fais semblant de tomber et dramatise la chute.",
        "Chante une chanson connue en remplaçant tous les mots par 'patate'.",
        "Écris ton nom avec ton pied et montre-le aux autres.",
        "Fais une déclaration de type telenovela à un joueur au hasard.",
        "Fais un massage rapide à la personne de ton choix.",
        "Fais un bisou sur la joue de chaque joueur.",
        "Fais un compliment sexy à quelqu’un autour de la table.",
        "Mime une scène de flirt avec un joueur au hasard.",
        "Fais un lap dance imaginaire pour un joueur.",
        "Chante une chanson d’amour à quelqu’un.",
        "Raconte ton fantasme le plus drôle (ou invente-en un).",
        "Fais semblant d’embrasser un objet de la pièce.",
        "Fais un strip-tease express (juste les mains et les épaules).",
        "Mime un baiser passionné avec ton doigt.",
        "Fais semblant de tomber amoureux de quelqu’un dans la pièce.",
        "Imite une pose de mannequin sexy pendant 10 secondes.",
        "Chuchote un mot coquin à l’oreille d’un joueur.",
        "Fais semblant d’être dans un film romantique avec quelqu’un.",
        "Fais un regard de séduction à la personne de ton choix.",
        "Fais semblant de danser sensuellement sur une chaise.",
        "Raconte ton premier crush ou flirt.",
        "Mime un scénario de drague ridicule avec un joueur.",
        "Fais un compliment coquin à un joueur au hasard.",
        "Fais semblant de faire un selfie sexy.",];



// --- VARIABLES DU JEU ---
let joueurs = [];
let bombeTimeout;
let currentPlayerIndex = -1;
let ticTacSound = document.getElementById("sonTicTac");
let boomSound = document.getElementById("sonBoom");

// --- INITIALISATION ---
window.onload = function () {
    // 1. Récupérer les sons (si présents dans le HTML)
    ticTacSound = document.getElementById("sonTicTac");
    boomSound = document.getElementById("sonBoom");

    // 2. Récupérer les joueurs stockés par la Page 1
    const joueursStockes = localStorage.getItem("joueurs");

    if (joueursStockes) {
        joueurs = JSON.parse(joueursStockes);
        // Vérification de sécurité
        if (joueurs.length < 1) {
            alert("Il faut au moins 1 joueur !");
            window.location.href = "bomb1.html";
        } else {
            console.log("Joueurs chargés :", joueurs);
            nouveauTour(); // Lancer le jeu immédiatement
        }
    } else {
        alert("Aucun joueur trouvé ! Retour au menu.");
        window.location.href = "bomb1.html";
    }
};

// --- LOGIQUE DU JEU ---

function nouveauTour() {
    // Réinitialiser l'affichage
    document.getElementById('page2').style.display = 'block';
    document.getElementById('page3').style.display = 'none';
    document.getElementById('zoneDefi').style.display = 'none';
    document.getElementById('visuelBombe').style.transform = "scale(1)";

    // Arrêter les sons précédents si nécessaire
    if(boomSound) { boomSound.pause(); boomSound.currentTime = 0; }
    
    // 1. Choisir un thème aléatoire
    const themeChoisi = themes[Math.floor(Math.random() * themes.length)];
    document.getElementById('thème').textContent = themeChoisi;

    // 2. Choisir le premier joueur
    choisirProchainJoueur(true); // true = c'est le début du tour

    // 3. Lancer le compte à rebours aléatoire (entre 20s et 60s par exemple)
    // Astuce : ne fais pas trop long pour garder le rythme
    const minTime = 20000; // 20 secondes
    const maxTime = 60000; // 60 secondes
    const tempsAleatoire = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
    
    console.log("Explosion dans : " + (tempsAleatoire/1000) + " secondes");

    // Démarrer le son tic-tac
    if(ticTacSound) {
        ticTacSound.playbackRate = 1.0; // Vitesse normale
        ticTacSound.play().catch(e => console.log("Audio bloqué par le navigateur, interaction requise"));
    }

    // Programmer l'explosion
    clearTimeout(bombeTimeout);
    bombeTimeout = setTimeout(exploser, tempsAleatoire);
}

function passerLeTour() {
    // Animation visuelle simple (petit rebond)
    const bombe = document.getElementById('visuelBombe');
    bombe.style.transform = "scale(1.2)";
    setTimeout(() => bombe.style.transform = "scale(1)", 200);

    // Accélérer légèrement le son tic-tac pour le stress (optionnel)
    if(ticTacSound && ticTacSound.playbackRate < 2.0) {
        ticTacSound.playbackRate += 0.1; 
    }

    // Changer de joueur
    choisirProchainJoueur(false);
}

function choisirProchainJoueur(isNewTour) {
    if (joueurs.length === 0) return;

    let nouveauIndex;
    
    if (joueurs.length === 1) {
        nouveauIndex = 0; // Si un seul joueur joue tout seul
    } else {
        // On s'assure de ne pas choisir la même personne deux fois de suite
        // Sauf si c'est le tout début du tour
        do {
            nouveauIndex = Math.floor(Math.random() * joueurs.length);
        } while (!isNewTour && nouveauIndex === currentPlayerIndex);
    }

    currentPlayerIndex = nouveauIndex;
    document.getElementById('joueurActuel').textContent = joueurs[currentPlayerIndex];
}

function exploser() {
    // 1. Gérer les sons
    if(ticTacSound) ticTacSound.pause();
    if(boomSound) boomSound.play();

    // 2. Vibration (si sur mobile)
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]); 

    // 3. Changer d'écran
    document.getElementById('page2').style.display = 'none';
    document.getElementById('page3').style.display = 'block';

    // 4. Afficher le perdant
    const perdant = joueurs[currentPlayerIndex];
    document.getElementById('perdant').textContent = perdant + ", c'est pour toi !";
}

function afficherGage() {
    const gageChoisi = gages[Math.floor(Math.random() * gages.length)];
    const zoneDefi = document.getElementById('zoneDefi');
    const texteDefi = document.getElementById('defiText');
    
    texteDefi.textContent = gageChoisi;
    zoneDefi.style.display = 'block';
}