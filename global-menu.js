/* ==========================================================================
   LOUSTIC - MENU & HEADER UNIVERSEL (THEME CARTOON RUBBER HOSE)
   Navigation unifiée, gestion du profil, règles du jeu & sécurité de partie
   ========================================================================== */

(function() {
  const currentScriptTag = document.currentScript;
  const backUrlAttr = currentScriptTag ? currentScriptTag.getAttribute("data-back") : null;

  document.addEventListener("DOMContentLoaded", function() {
    // 1. Détection de chemin vers l'accueil
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let homeUrl = "index.html";
    const currentFile = pathParts[pathParts.length - 1] || "";
    const isRoot = currentFile === "" || currentFile.toLowerCase() === "index.html" || pathParts.length <= 1;

    if (!isRoot) {
      const scriptSrc = currentScriptTag ? currentScriptTag.getAttribute("src") || "" : "";
      if (scriptSrc.startsWith("../../")) {
        homeUrl = "../../index.html";
      } else {
        homeUrl = "../index.html";
      }
    }

    const backTarget = backUrlAttr || homeUrl;

    // 2. Chargement des polices Rubber Hose
    if (!document.getElementById('loustic-fonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'loustic-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Carter+One&family=Fredoka:wght@400;600;700&display=swap';
      document.head.appendChild(fontLink);
    }

    // 3. Titre dynamique pour le header
    let pageTitle = document.title ? document.title.split(/[-–|]/)[0].trim() : "Loustic";
    if (pageTitle.toLowerCase().includes("accueil") || pageTitle === "") pageTitle = "LOUSTIC";

    // 4. Si la page utilise le nouveau GameLayout (<game-layout>), ne pas injecter le header legacy
    if (document.querySelector('game-layout') || document.querySelector('.game-layout-header') || document.getElementById('loustic-top-bar')) {
      return;
    }

    // Injection du Header Universel et des Modales Legacy
    const navRoot = document.createElement("div");
    navRoot.id = "loustic-universal-nav-root";
    navRoot.innerHTML = `
      <!-- HEADER UNIVERSEL COMPACT STICKY -->
      <nav id="loustic-top-bar" aria-label="Navigation principale">
        <div class="nav-group-left">
          <button id="bg-btn" class="nav-circle-btn" onclick="toggleMenu()" title="Ouvrir le menu" aria-label="Menu">☰</button>
          ${!isRoot ? `<button id="loustic-back-btn" class="nav-circle-btn" onclick="handleSafeNavigation('${backTarget}')" title="Retour" aria-label="Retour">⬅</button>` : ''}
        </div>

        <div class="nav-group-center">
          <span id="loustic-header-badge" class="header-title-badge">${pageTitle}</span>
        </div>

        <div class="nav-group-right">
          <button id="loustic-rules-btn" class="nav-circle-btn" onclick="openRules()" title="Consignes & Règles" aria-label="Règles">❓</button>
          <button id="loustic-profile-btn" class="nav-circle-btn profile-slot" onclick="openProfileModal()" title="Mon Profil" aria-label="Profil">
            <span class="profile-avatar">👤</span>
            <span class="profile-dot-status"></span>
          </button>
        </div>
      </nav>

      <!-- SIDEBAR DRAWER -->
      <div id="bg-overlay" onclick="closeMenu()"></div>
      <aside id="bg-sidebar" aria-label="Menu latéral">
        <div class="sidebar-header">
          <h2>LOUSTIC</h2>
          <span class="version-tag">Mini-Jeux v2.0</span>
        </div>
        <div class="sidebar-links">
          <button class="sidebar-link-btn" onclick="handleSafeNavigation('${homeUrl}')">🏠 Accueil</button>
          ${!isRoot ? `<button class="sidebar-link-btn" onclick="handleSafeNavigation('${backTarget}')">⬅ Écran Précédent</button>` : ''}
          <button class="sidebar-link-btn" onclick="openRules()">📜 Règles du jeu</button>
          <button class="sidebar-link-btn" onclick="openProfileModal()">👤 Mon Profil Joueur</button>
        </div>
        <button class="sidebar-close-btn" onclick="closeMenu()">Fermer ✕</button>
      </aside>

      <!-- MODALE RÈGLES / CONSIGNES UNIFIÉE -->
      <div id="bg-modal-overlay" class="modal-backdrop" onclick="closeRules()">
        <div id="bg-modal-box" class="modal-card" onclick="event.stopPropagation()">
          <button id="bg-modal-close" class="modal-close-icon" onclick="closeRules()" title="Fermer">✕</button>
          <div id="bg-modal-content"></div>
          <button class="modal-confirm-btn" onclick="closeRules()">C'est Compris ! 🚀</button>
        </div>
      </div>

      <!-- MODALE PROFIL / COMPTE UTILISATEUR -->
      <div id="loustic-profile-overlay" class="modal-backdrop" onclick="closeProfileModal()">
        <div id="loustic-profile-box" class="modal-card" onclick="event.stopPropagation()">
          <button class="modal-close-icon" onclick="closeProfileModal()" title="Fermer">✕</button>
          <div class="profile-header">
            <div class="avatar-large">👤</div>
            <h2 id="profile-display-name">Joueur Loustic</h2>
            <span class="profile-badge-pill">Compte Local</span>
          </div>
          <div class="profile-body">
            <label for="profile-name-input">Pseudo du Joueur :</label>
            <input type="text" id="profile-name-input" maxlength="20" placeholder="Ton pseudo...">
            <button class="modal-action-btn" onclick="saveProfilePseudo()">Enregistrer le pseudo</button>
            <hr class="profile-divider">
            <div class="profile-stats">
              <div class="stat-card">
                <span class="stat-val" id="stat-games-played">7</span>
                <span class="stat-label">Jeux Débloqués</span>
              </div>
              <div class="stat-card">
                <span class="stat-val">Online</span>
                <span class="stat-label">Mode Synchro</span>
              </div>
            </div>
            <p class="profile-hint">💡 Connectez vos amis en local ou scannez les QR codes pour jouer ensemble !</p>
          </div>
        </div>
      </div>

      <!-- MODALE CONFIRMATION DE QUITTER (SI PARTIE EN COURS) -->
      <div id="loustic-confirm-overlay" class="modal-backdrop" style="display:none;">
        <div class="modal-card confirm-card" onclick="event.stopPropagation()">
          <h3>⚠️ Quitter la partie ?</h3>
          <p>Une manche est en cours ! Si tu quittes maintenant, la progression de cette session sera réinitialisée.</p>
          <div class="confirm-actions">
            <button class="confirm-cancel-btn" onclick="dismissQuitConfirmation()">Continuer à jouer</button>
            <button class="confirm-danger-btn" id="loustic-btn-do-quit">Oui, quitter</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(navRoot);

    // Initialiser les données du profil utilisateur
    initProfileData();

    // 5. Swipe tactile sur mobile pour fermer le tiroir
    let startX = 0;
    const sidebar = document.getElementById("bg-sidebar");
    if (sidebar) {
      sidebar.addEventListener("touchstart", e => {
        if (sidebar.classList.contains("open")) startX = e.touches[0].clientX;
      }, { passive: true });
      sidebar.addEventListener("touchend", e => {
        if (!sidebar.classList.contains("open")) return;
        if (e.changedTouches[0].clientX - startX < -60) closeMenu();
      });
    }

    // 6. Navigation Sécurisée avec détection de partie active
    window.handleSafeNavigation = function(url) {
      closeMenu();
      if (window.isGameInProgress === true) {
        showQuitConfirmation(url);
      } else {
        teardownGame();
        window.location.href = url;
      }
    };

    function showQuitConfirmation(url) {
      const ov = document.getElementById("loustic-confirm-overlay");
      const btn = document.getElementById("loustic-btn-do-quit");
      if (ov && btn) {
        btn.onclick = function() {
          teardownGame();
          window.location.href = url;
        };
        ov.style.display = "flex";
      } else {
        if (confirm("Une partie est en cours ! Veux-tu vraiment quitter ?")) {
          teardownGame();
          window.location.href = url;
        }
      }
    }

    window.dismissQuitConfirmation = function() {
      const ov = document.getElementById("loustic-confirm-overlay");
      if (ov) ov.style.display = "none";
    };

    function teardownGame() {
      window.isGameInProgress = false;
      if (typeof window.onGameTeardown === "function") {
        try { window.onGameTeardown(); } catch(e) { console.warn(e); }
      }
    }

    // 7. Fonctions Sidebar & Menu
    window.toggleMenu = function() {
      const sb = document.getElementById("bg-sidebar");
      const ov = document.getElementById("bg-overlay");
      if (sb && ov) {
        sb.classList.toggle("open");
        ov.classList.toggle("show");
      }
    };

    window.closeMenu = function() {
      const sb = document.getElementById("bg-sidebar");
      const ov = document.getElementById("bg-overlay");
      if (sb && ov) {
        sb.classList.remove("open");
        ov.classList.remove("show");
      }
    };

    // 8. Fonctions Modale Règles
    window.openRules = function() {
      closeMenu();
      const src = document.getElementById("regles-du-jeu");
      const content = document.getElementById("bg-modal-content");
      if (content) {
        content.innerHTML = src ? src.innerHTML : `
          <h2>📜 Règles du Jeu</h2>
          <div class="rules-block">
            <h3>🎯 Ce que tu dois faire :</h3>
            <p>Suivez les instructions à l'écran, passez le téléphone ou votez tous ensemble !</p>
          </div>
          <div class="rules-block penalty">
            <h3>⚠️ Gages & Pénalités :</h3>
            <p>Le perdant boit une gorgée ou réalise un gage désigné par les autres joueurs !</p>
          </div>
        `;
      }
      const modal = document.getElementById("bg-modal-overlay");
      if (modal) modal.style.display = "flex";
    };

    window.closeRules = function() {
      const modal = document.getElementById("bg-modal-overlay");
      if (modal) modal.style.display = "none";
    };

    // 9. Fonctions Modale Profil
    window.openProfileModal = function() {
      closeMenu();
      const ov = document.getElementById("loustic-profile-overlay");
      if (ov) ov.style.display = "flex";
      const savedName = localStorage.getItem("loustic_user_pseudo") || "Joueur Loustic";
      const inp = document.getElementById("profile-name-input");
      if (inp) inp.value = savedName;
    };

    window.closeProfileModal = function() {
      const ov = document.getElementById("loustic-profile-overlay");
      if (ov) ov.style.display = "none";
    };

    window.saveProfilePseudo = function() {
      const inp = document.getElementById("profile-name-input");
      const val = inp ? inp.value.trim() : "";
      if (val) {
        localStorage.setItem("loustic_user_pseudo", val);
        const nameDisp = document.getElementById("profile-display-name");
        if (nameDisp) nameDisp.textContent = val;
        alert("Pseudo enregistré !");
      }
    };

    function initProfileData() {
      const savedName = localStorage.getItem("loustic_user_pseudo") || "Joueur Loustic";
      const nameDisp = document.getElementById("profile-display-name");
      if (nameDisp) nameDisp.textContent = savedName;
    }

    window.addEventListener("beforeunload", () => {
      closeMenu();
      teardownGame();
    });
  });
})();