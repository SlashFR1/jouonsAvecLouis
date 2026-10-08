/* ==========================================================================
   LOUSTIC - MENU GLOBAL (THEME UNIFORME RUBBER HOSE CARTOON)
   ========================================================================== */

var myScript = document.currentScript;
var backUrl = myScript ? myScript.getAttribute("data-back") : null;

document.addEventListener("DOMContentLoaded", function() {

  // 1. Détection de la profondeur pour le lien vers l'accueil
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let homeUrl = "index.html";
  
  // Si on est dans un sous-dossier (ex: Bomb/bomb1.html ou Debat/Climp/climp.html)
  const currentFile = pathParts[pathParts.length - 1] || "";
  const isRoot = currentFile === "" || currentFile.toLowerCase() === "index.html" || pathParts.length <= 1;
  
  if (!isRoot) {
    // Calculer le nombre de "../" nécessaires
    const scriptSrc = myScript ? myScript.getAttribute("src") || "" : "";
    if (scriptSrc.startsWith("../../")) {
      homeUrl = "../../index.html";
    } else if (scriptSrc.startsWith("../")) {
      homeUrl = "../index.html";
    } else {
      homeUrl = "../index.html";
    }
  }

  // 2. Chargement des polices Rubber Hose
  if (!document.getElementById('loustic-fonts')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'loustic-fonts';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Carter+One&family=Fredoka:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);
  }

  // 3. Bouton Retour si défini
  const boutonRetour = backUrl
    ? `<button class="menu-action-btn" onclick="window.location.href='${backUrl}'">⬅ Retour</button>`
    : "";

  // 4. Injection HTML du Menu
  const menuContainer = document.createElement("div");
  menuContainer.id = "loustic-global-nav-container";
  menuContainer.innerHTML = `
    <button id="bg-btn" onclick="toggleMenu()" title="Ouvrir le menu">☰</button>
    <div id="bg-overlay" onclick="closeMenu()"></div>
    <div id="bg-sidebar">
      <h2>LOUSTIC</h2>
      <a href="${homeUrl}">🏠 Accueil</a>
      ${boutonRetour}
      <button class="menu-action-btn" onclick="openRules()">📜 Règles du jeu</button>
      <button class="menu-action-btn" onclick="closeMenu()" style="margin-top:auto; background:#eb4d4b; color:white;">Fermer ✕</button>
    </div>
    <div id="bg-modal-overlay" onclick="closeRules()">
      <div id="bg-modal-box" onclick="event.stopPropagation()">
        <button id="bg-modal-close" onclick="closeRules()">✕</button>
        <div id="bg-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(menuContainer);

  // 5. Gestes Mobile (Swipe vers la gauche pour fermer)
  let startX = 0;
  const sidebar = document.getElementById("bg-sidebar");
  if (sidebar) {
    sidebar.addEventListener("touchstart", e => {
      if (sidebar.classList.contains("open")) {
        startX = e.touches[0].clientX;
      }
    }, { passive: true });

    sidebar.addEventListener("touchend", e => {
      if (!sidebar.classList.contains("open")) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (diff < -60) closeMenu();
    });
  }

  // 6. Fonctions Globales
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

  window.openRules = function() {
    closeMenu();
    const src = document.getElementById("regles-du-jeu");
    const content = document.getElementById("bg-modal-content");
    if (content) {
      content.innerHTML = src ? src.innerHTML : `<h2>📜 Règles</h2><p>Amusez-vous bien et suivez les instructions à l'écran !</p>`;
    }
    const modal = document.getElementById("bg-modal-overlay");
    if (modal) modal.style.display = "flex";
  };

  window.closeRules = function() {
    const modal = document.getElementById("bg-modal-overlay");
    if (modal) modal.style.display = "none";
  };

  window.addEventListener("beforeunload", closeMenu);
});