/* --- 1. RECUPERATION DU LIEN (Doit être la toute première ligne) --- */
var myScript = document.currentScript;
var backUrl = myScript.getAttribute("data-back");

document.addEventListener("DOMContentLoaded", function() {
    
    /* --- 2. CSS STYLE (Inchangé) --- */
    const style = document.createElement('style');
    style.innerHTML = `
      :root { --c-bg: #fff; --c-acc: #ffce00; --c-brd: #000; --shd: 4px 4px 0 #000; }
      
      .cartoon-text { font-family: 'Verdana', sans-serif; font-size: 16px; font-weight: bold; }

      #bg-btn {
        position: absolute; top: 20px; left: 20px; z-index: 2147483647;
        background: var(--c-acc); border: 3px solid var(--c-brd);
        box-shadow: var(--shd); border-radius: 8px; 
        font-size: 24px; cursor: pointer; padding: 5px 12px; transition: transform 0.1s;
      }
      #bg-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }
      
      #bg-sidebar {
        position: fixed; top: 0; left: -280px; width: 250px; height: 100vh;
        background: var(--c-bg); border-right: 3px solid var(--c-brd); z-index: 2147483647;
        display: flex; flex-direction: column; padding: 20px; box-sizing: border-box;
        transition: left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
      }
      #bg-sidebar.open { left: 0; }
      
      #bg-sidebar h2 { 
        border-bottom: 3px solid var(--c-brd); padding-bottom: 10px; margin-top:0; 
        text-align:center; font-weight:900; font-family: 'Verdana', sans-serif;
      }
      
      #bg-sidebar a, #bg-sidebar button {
        font-family: 'Verdana', sans-serif; font-size: 16px; font-weight: bold;
        text-align: center; text-decoration: none; color: var(--c-brd);
        border: 2px solid var(--c-brd); margin: 10px 0; padding: 12px;
        border-radius: 8px; background: #eee; box-shadow: 2px 2px 0 #000;
        cursor: pointer; transition: 0.1s; 
        display: block; width: 100%; box-sizing: border-box; 
      }
      
      #bg-sidebar a:hover, #bg-sidebar button:hover { background: var(--c-acc); transform: translate(-2px, -2px); box-shadow: 4px 4px 0 #000; }

      #bg-modal-overlay {
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(5px);
        z-index: 20000; justify-content: center; align-items: center;
      }
      #bg-modal-box {
        background: #fff; color: #000; border: 3px solid #000; box-shadow: 10px 10px 0 #000;
        padding: 40px; width: 85%; max-width: 550px; border-radius: 25px;
        position: relative; max-height: 80vh; overflow-y: auto; 
        font-family: 'Verdana', sans-serif; line-height: 1.6; font-size: 16px;
      }
      #bg-modal-box h2 {
        margin-top: 0; text-align: center; text-transform: uppercase; letter-spacing: 1px;
        background: #ffce00; display: inline-block; padding: 5px 15px; border: 2px solid #000;
        transform: rotate(-2deg); border-radius: 10px; box-shadow: 3px 3px 0 #000;
      }
      #bg-modal-close {
        position: absolute; top: 15px; right: 15px; background: #ff6b6b; color: #fff;
        width: 35px; height: 35px; border: 2px solid #000; border-radius: 50%;
        font-weight: bold; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 2px 2px 0 #000; transition: 0.2s;
      }
      #bg-modal-close:hover { transform: scale(1.1); }
    `;
    document.head.appendChild(style);

    /* --- 3. CREATION HTML --- */
    
    // Si backUrl existe, on crée un bouton avec redirection JS. Sinon chaîne vide.
    const boutonRetour = backUrl 
        ? `<button onclick="window.location.href='${backUrl}'">⬅ Retour</button>` 
        : '';

    const menuContainer = document.createElement('div');
    menuContainer.innerHTML = `
      <button id="bg-btn" onclick="toggleMenu()">☰</button>
      <div id="bg-sidebar">
        <h2>MENU</h2>
        <a href="../Index.html">🏠 Accueil</a>
        
        <!-- On injecte le bouton ici -->
        ${boutonRetour}
        
        <button onclick="openRules()">📜 Règles du jeu</button>
        <a href="settings.html">⚙️ Paramètres</a>
        <a href="connexion.html">👤 Connexion</a>
        <button onclick="toggleMenu()" style="margin-top:auto; background:#ff6b6b">Fermer</button>
      </div>

      <div id="bg-modal-overlay" onclick="closeRules()">
        <div id="bg-modal-box" onclick="event.stopPropagation()">
            <div id="bg-modal-close" onclick="closeRules()">✕</div>
            <div id="bg-modal-content">Chargement...</div>
        </div>
      </div>
    `;
    document.body.appendChild(menuContainer);
});

/* --- 4. FONCTIONS --- */
window.toggleMenu = function() {
    document.getElementById('bg-sidebar').classList.toggle('open');
}
window.openRules = function() {
    toggleMenu(); 
    const source = document.getElementById('regles-du-jeu');
    const dest = document.getElementById('bg-modal-content');
    if (source) dest.innerHTML = source.innerHTML;
    else dest.innerHTML = "<center><h2>Oups</h2><p>Pas de règles.</p></center>";
    document.getElementById('bg-modal-overlay').style.display = 'flex';
}
window.closeRules = function() {
    document.getElementById('bg-modal-overlay').style.display = 'none';
}