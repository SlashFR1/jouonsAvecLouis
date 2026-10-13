/* ==========================================================================
   BOOM BOOM (LA BOMBE) - LOGIQUE DE JEU REFACTORISÉE
   Gestion sans fuite mémoire, deck sans doublon, accélération sonore & stress visuel
   ========================================================================== */

(function() {
  'use strict';

  // Récupération des données depuis bomb1.js ou défaut
  const defaultThemes = [
    "Marques de voitures", "Animaux sauvages", "Choses qu'on trouve dans un frigo",
    "Pays d'Europe", "Super-héros", "Films d'animation", "Objets qui font du bruit",
    "Capitales du monde", "Matières scolaires", "Choses rondes", "Sports olympiques",
    "Choses qui volent", "Personnages de dessins animés", "Plats italiens",
    "Séries Netflix", "Choses sucrées", "Marques de vêtements", "Instruments de musique"
  ];

  const defaultGages = [
    "Bois 2 gorgées et fais 5 pompes !",
    "Fais l'imitation d'un poulet jusqu'au prochain tour.",
    "Révèle le dernier message que tu as reçu sur ton téléphone.",
    "Bois 1 shot les yeux fermés.",
    "Laisse la personne à ta droite envoyer un emoji de son choix à un de tes contacts.",
    "Chante le refrain d'une chanson choisie par les autres joueurs.",
    "Raconte ta pire honte en soirée ou bois 3 gorgées.",
    "Reste immobile comme une statue pendant tout le prochain tour."
  ];

  const rawThemes = (typeof themes !== 'undefined' && Array.isArray(themes)) ? themes : defaultThemes;
  const rawGages = (typeof gages !== 'undefined' && Array.isArray(gages)) ? gages : defaultGages;

  // État de la partie
  const state = {
    joueurs: [],
    currentPlayerIndex: -1,
    themesDeck: [],
    gagesDeck: [],
    bombeTimeout: null,
    pulseInterval: null,
    isExploded: false,
    ticTacSound: null,
    boomSound: null
  };

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function stopAllSounds() {
    if (state.ticTacSound) {
      state.ticTacSound.pause();
      state.ticTacSound.currentTime = 0;
    }
    if (state.boomSound) {
      state.boomSound.pause();
      state.boomSound.currentTime = 0;
    }
  }

  function clearTimers() {
    if (state.bombeTimeout) {
      clearTimeout(state.bombeTimeout);
      state.bombeTimeout = null;
    }
    if (state.pulseInterval) {
      clearInterval(state.pulseInterval);
      state.pulseInterval = null;
    }
  }

  // Teardown universel pour éviter les fuites mémoires
  window.onGameTeardown = function() {
    clearTimers();
    stopAllSounds();
    window.isGameInProgress = false;
  };

  window.nouveauTour = function() {
    clearTimers();
    stopAllSounds();
    state.isExploded = false;
    window.isGameInProgress = true;

    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const zoneDefi = document.getElementById('zoneDefi');
    const visuelBombe = document.getElementById('visuelBombe');
    const passBtn = document.getElementById('passerTourButton');

    if (page2) page2.style.display = 'block';
    if (page3) page3.style.display = 'none';
    if (zoneDefi) zoneDefi.style.display = 'none';
    if (passBtn) passBtn.disabled = false;
    if (visuelBombe) {
      visuelBombe.style.transform = "scale(1)";
      visuelBombe.classList.remove("bomb-stress");
    }

    // 1. Piocher un thème sans doublon
    if (state.themesDeck.length === 0) {
      state.themesDeck = shuffle(rawThemes);
    }
    const themeChoisi = state.themesDeck.shift();
    const themeEl = document.getElementById('thème');
    if (themeEl) themeEl.textContent = themeChoisi;

    // 2. Choisir le premier joueur
    choisirProchainJoueur(true);

    // 3. Durée secrète aléatoire entre 18s et 45s
    const tempsAleatoire = Math.floor(Math.random() * (45000 - 18000 + 1)) + 18000;

    // Son tic-tac
    if (state.ticTacSound) {
      state.ticTacSound.playbackRate = 1.0;
      state.ticTacSound.play().catch(() => {
        console.log("Audio en attente d'interaction utilisateur");
      });
    }

    // Pulse visuel de stress croissant
    let elapsed = 0;
    state.pulseInterval = setInterval(() => {
      elapsed += 1000;
      const progress = elapsed / tempsAleatoire;
      if (progress > 0.6 && visuelBombe) {
        visuelBombe.classList.add("bomb-stress");
      }
      if (state.ticTacSound && state.ticTacSound.playbackRate < 2.2) {
        state.ticTacSound.playbackRate += 0.03;
      }
    }, 1000);

    state.bombeTimeout = setTimeout(exploser, tempsAleatoire);
  };

  window.passerLeTour = function() {
    if (state.isExploded) return;

    const bombe = document.getElementById('visuelBombe');
    if (bombe) {
      bombe.style.transform = "scale(1.25) rotate(6deg)";
      setTimeout(() => {
        bombe.style.transform = "scale(1) rotate(0deg)";
      }, 150);
    }

    if (state.ticTacSound && state.ticTacSound.playbackRate < 2.5) {
      state.ticTacSound.playbackRate += 0.08;
    }

    choisirProchainJoueur(false);
  };

  function choisirProchainJoueur(isNewTour) {
    if (!state.joueurs || state.joueurs.length === 0) return;

    if (state.joueurs.length === 1) {
      state.currentPlayerIndex = 0;
    } else {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * state.joueurs.length);
      } while (!isNewTour && nextIdx === state.currentPlayerIndex);
      state.currentPlayerIndex = nextIdx;
    }

    const currentName = state.joueurs[state.currentPlayerIndex];
    const joueurActuelEl = document.getElementById('joueurActuel');
    if (joueurActuelEl) joueurActuelEl.textContent = currentName;
  }

  function exploser() {
    state.isExploded = true;
    clearTimers();
    stopAllSounds();

    if (state.boomSound) {
      state.boomSound.play().catch(() => {});
    }

    if (navigator.vibrate) {
      navigator.vibrate([400, 150, 400, 150, 600]);
    }

    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const perdantEl = document.getElementById('perdant');

    if (page2) page2.style.display = 'none';
    if (page3) page3.style.display = 'block';

    const perdant = state.joueurs[state.currentPlayerIndex] || "Quelqu'un";
    if (perdantEl) perdantEl.textContent = `💥 ${perdant}, tu as explosé !`;

    afficherGage();
  }

  window.afficherGage = function() {
    if (state.gagesDeck.length === 0) {
      state.gagesDeck = shuffle(rawGages);
    }
    const gageChoisi = state.gagesDeck.shift();
    const zoneDefi = document.getElementById('zoneDefi');
    const texteDefi = document.getElementById('defiText');

    if (texteDefi) texteDefi.textContent = gageChoisi;
    if (zoneDefi) zoneDefi.style.display = 'block';
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Récupération des joueurs
    const stored = localStorage.getItem("joueurs");
    if (stored) {
      try {
        state.joueurs = JSON.parse(stored);
      } catch(e) {
        state.joueurs = ["Joueur 1", "Joueur 2"];
      }
    } else {
      state.joueurs = ["Joueur 1", "Joueur 2"];
    }

    // Audio elements
    state.ticTacSound = document.getElementById('sonTicTac');
    state.boomSound = document.getElementById('sonBoom');

    // Initialiser les decks
    state.themesDeck = shuffle(rawThemes);
    state.gagesDeck = shuffle(rawGages);

    nouveauTour();
  });

  window.addEventListener("beforeunload", () => {
    window.onGameTeardown();
  });
})();