/* ==========================================================================
   LOUSTIC - GAME LAYOUT COMPONENT (WEB COMPONENT APP SHELL)
   Architecture 3 zones : Navbar (64px) / Contenu (Flex-1) / Thumb Zone (Bas)
   Hitboxes 48px+ WCAG AAA, Safe-Areas, Zéro Débordement, Anti-Layout-Shift
   ========================================================================== */

(function() {
  'use strict';

  // Détection du chemin vers l'accueil
  function resolveHomeUrl() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const currentFile = pathParts[pathParts.length - 1] || "";
    const isRoot = currentFile === "" || currentFile.toLowerCase() === "index.html" || pathParts.length <= 1;
    if (isRoot) return "index.html";
    return "../index.html";
  }

  // Chargement automatique des polices Rubber Hose si absentes
  function ensureFonts() {
    if (!document.getElementById('loustic-fonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'loustic-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Carter+One&family=Fredoka:wght@400;600;700&display=swap';
      document.head.appendChild(fontLink);
    }
  }

  class GameLayoutElement extends HTMLElement {
    constructor() {
      super();
      this._initialized = false;
    }

    connectedCallback() {
      if (this._initialized) return;
      ensureFonts();
      this.initShell();
      this._initialized = true;
    }

    initShell() {
      const homeUrl = resolveHomeUrl();
      const backUrlAttr = this.getAttribute('back-url') || this.getAttribute('data-back') || homeUrl;
      const gameTitleAttr = this.getAttribute('title') || this.getAttribute('game-title') || document.title.split(/[-–|]/)[0].trim() || "Loustic";
      const isRoot = backUrlAttr === "index.html" || backUrlAttr === "./index.html" || backUrlAttr === "";

      // 1. Extraire les slots ou enfants
      const rulesSlot = this.querySelector('[slot="rules"]') || document.getElementById('regles-du-jeu');
      const contentSlot = this.querySelector('[slot="content"]') || this.querySelector('main') || this.querySelector('.game-stage');
      const footerSlot = this.querySelector('[slot="footer"]') || this.querySelector('footer') || this.querySelector('.action-footer');

      // Sauvegarder le contenu des règles
      if (rulesSlot) {
        window._lousticRulesContent = rulesSlot.innerHTML;
        rulesSlot.remove();
      }

      // Conserver les nœuds de contenu et footer
      const contentNodes = contentSlot ? Array.from(contentSlot.childNodes) : [];
      const footerNodes = footerSlot ? Array.from(footerSlot.childNodes) : [];

      // Nettoyer l'intérieur du composant pour reconstruire la structure 3-zones
      this.innerHTML = '';

      // 2. ZONE 1 : NAVBAR FIXÉE (64px)
      const headerEl = document.createElement('header');
      headerEl.className = 'game-layout-header';
      headerEl.setAttribute('role', 'banner');
      headerEl.innerHTML = `
        <div class="nav-group-left">
          <button id="bg-btn" class="nav-touch-btn" onclick="toggleMenu()" title="Menu principal" aria-label="Menu">☰</button>
          ${!isRoot ? `<button id="loustic-back-btn" class="nav-touch-btn" onclick="handleSafeNavigation('${backUrlAttr}')" title="Retour" aria-label="Retour">⬅</button>` : ''}
        </div>

        <div class="nav-title-center">
          <span id="layout-game-title" class="header-title-badge">${gameTitleAttr}</span>
        </div>

        <div class="nav-group-right">
          <button id="loustic-rules-btn" class="nav-touch-btn" onclick="openRules()" title="Consignes & Règles" aria-label="Règles">❓</button>
          <button id="loustic-profile-btn" class="nav-touch-btn profile-touch-btn" onclick="openProfileModal()" title="Mon Profil" aria-label="Profil">
            <span class="profile-avatar">👤</span>
            <span class="profile-badge-dot"></span>
          </button>
        </div>
      `;
      this.appendChild(headerEl);

      // 3. ZONE 2 : SCÈNE CENTRALE / CONTENU DE JEU (Flex-1)
      const mainEl = document.createElement('main');
      mainEl.className = 'game-layout-content';
      mainEl.id = 'game-layout-content-area';
      mainEl.setAttribute('role', 'main');

      if (contentSlot) {
        contentSlot.removeAttribute('slot');
        mainEl.appendChild(contentSlot);
      } else {
        const cardPlaceholder = document.createElement('div');
        cardPlaceholder.className = 'game-stage-card';
        cardPlaceholder.innerHTML = '<p>Chargement du jeu...</p>';
        mainEl.appendChild(cardPlaceholder);
      }
      this.appendChild(mainEl);

      // 4. ZONE 3 : FOOTER D'ACTION (THUMB ZONE)
      const footerEl = document.createElement('footer');
      footerEl.className = 'game-layout-footer';
      footerEl.id = 'game-layout-footer-area';
      footerEl.setAttribute('role', 'contentinfo');

      if (footerSlot) {
        footerSlot.removeAttribute('slot');
        footerEl.appendChild(footerSlot);
      }
      this.appendChild(footerEl);

      // 5. INJECTER LES MODALES & DRAWER (si non encore créés)
      this.injectModals(homeUrl, backUrlAttr, isRoot);
    }

    injectModals(homeUrl, backTarget, isRoot) {
      if (document.getElementById('loustic-modals-root')) return;

      const modalsRoot = document.createElement('div');
      modalsRoot.id = 'loustic-modals-root';
      modalsRoot.innerHTML = `
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

        <!-- MODALE RÈGLES / CONSIGNES -->
        <div id="bg-modal-overlay" class="modal-backdrop" onclick="closeRules()">
          <div id="bg-modal-box" class="modal-card" onclick="event.stopPropagation()">
            <button id="bg-modal-close" class="modal-close-icon" onclick="closeRules()" title="Fermer">✕</button>
            <div id="bg-modal-content"></div>
            <button class="modal-confirm-btn btn-cta" onclick="closeRules()">C'est Compris ! 🚀</button>
          </div>
        </div>

        <!-- MODALE PROFIL JOUEUR -->
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
              <button class="modal-action-btn btn-cta" style="margin-top:12px;" onclick="saveProfilePseudo()">Enregistrer le pseudo</button>
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

        <!-- MODALE DE QUITTER (CONFIRMATION PARTIE EN COURS) -->
        <div id="loustic-confirm-overlay" class="modal-backdrop" style="display:none;">
          <div class="modal-card confirm-card" onclick="event.stopPropagation()">
            <h3>⚠️ Quitter la partie ?</h3>
            <p>Une manche est en cours ! Si tu quittes maintenant, la progression de cette session sera perdue.</p>
            <div class="confirm-actions">
              <button class="confirm-cancel-btn btn-cta btn-secondary" onclick="dismissQuitConfirmation()">Continuer à jouer</button>
              <button class="confirm-danger-btn btn-cta btn-danger" id="loustic-btn-do-quit">Oui, quitter</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalsRoot);
      initProfile();
    }
  }

  // Définir le Custom Element
  if (!customElements.get('game-layout')) {
    customElements.define('game-layout', GameLayoutElement);
  }

  // 6. Navigation Sécurisée & Fonctions Globales
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

  // 7. Tiroir & Sidebar
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

  // 8. Modale Règles
  window.openRules = function() {
    closeMenu();
    const content = document.getElementById("bg-modal-content");
    if (content) {
      content.innerHTML = window._lousticRulesContent || `
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

  // 9. Modale Profil
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

  function initProfile() {
    const savedName = localStorage.getItem("loustic_user_pseudo") || "Joueur Loustic";
    const nameDisp = document.getElementById("profile-display-name");
    if (nameDisp) nameDisp.textContent = savedName;
  }

  // 10. API Publique GameLayout
  window.GameLayout = {
    setTitle: function(text) {
      const el = document.getElementById("layout-game-title");
      if (el) el.textContent = text;
    },
    setBadge: function(text) {
      const el = document.getElementById("layout-game-title");
      if (el) el.textContent = text;
    },
    openRules: window.openRules,
    closeRules: window.closeRules,
    openProfile: window.openProfileModal,
    closeProfile: window.closeProfileModal,
    showQuitConfirmation: showQuitConfirmation,
    teardown: teardownGame
  };

  window.addEventListener("beforeunload", () => {
    closeMenu();
    teardownGame();
  });
})();
