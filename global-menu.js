/* --- 1. RECUPERATION DU LIEN (Doit être la toute première ligne) --- */
var myScript = document.currentScript;
var backUrl = myScript.getAttribute("data-back");

document.addEventListener("DOMContentLoaded", function() {

  /* --- 2. CSS STYLE --- */
  const style = document.createElement("style");
  style.innerHTML = `
  :root {
    --c-bg:#fff;
    --c-acc:#ffce00;
    --c-brd:#000;
    --shd:4px 4px 0 #000;
  }

  #bg-btn{
    position:fixed;top:20px;left:20px;
    z-index:2147483647;
    background:var(--c-acc);
    border:3px solid var(--c-brd);
    box-shadow:var(--shd);
    border-radius:8px;
    font-size:24px;
    padding:5px 12px;
    cursor:pointer;
    transition:transform .15s ease;
  }

  #bg-btn:active{
    transform:translate(2px,2px);
    box-shadow:2px 2px 0 #000;
  }

  #bg-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.3);
    backdrop-filter:blur(2px);
    z-index:2147483645;
    opacity:0;
    pointer-events:none;
    transition:opacity .25s ease;
  }

  #bg-overlay.show{
    opacity:1;
    pointer-events:auto;
  }

  #bg-sidebar{
    position:fixed;
    top:0;
    left:-320px;
    width:280px;
    height:100vh;
    background:var(--c-bg);
    border-right:3px solid var(--c-brd);
    z-index:2147483646;
    padding:20px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    transition:
      left .45s cubic-bezier(.22,1,.36,1);
    will-change:left;
    overflow-y:auto;
  }

  #bg-sidebar.open{
    left:0;
    box-shadow:30px 0 80px rgba(0,0,0,.35);
  }

  #bg-sidebar h2{
    margin-top:0;
    text-align:center;
    border-bottom:3px solid #000;
    padding-bottom:10px;
    font-family:Verdana;
  }

  #bg-sidebar a,
  #bg-sidebar button{
    font-family:Verdana;
    font-weight:bold;
    font-size:16px;
    border:2px solid #000;
    background:#eee;
    box-shadow:2px 2px 0 #000;
    padding:12px;
    border-radius:8px;
    margin:8px 0;
    cursor:pointer;
    text-decoration:none;
    color:#000;
    transition:.15s;
  }

  #bg-sidebar a:hover,
  #bg-sidebar button:hover{
    background:var(--c-acc);
    transform:translate(-2px,-2px);
    box-shadow:4px 4px 0 #000;
  }

  /* MODAL */
  #bg-modal-overlay{
    display:none;
    position:fixed;
    inset:0;
    background:rgba(255,255,255,.8);
    backdrop-filter:blur(5px);
    z-index:2147483644;
    justify-content:center;
    align-items:center;
  }

  #bg-modal-box{
    background:#fff;
    border:3px solid #000;
    box-shadow:10px 10px 0 #000;
    border-radius:20px;
    padding:30px;
    max-width:550px;
    width:85%;
    max-height:80vh;
    overflow:auto;
    position:relative;
    font-family:Verdana;
  }

  #bg-modal-close{
    position:absolute;
    top:10px;right:10px;
    width:32px;height:32px;
    border-radius:50%;
    border:2px solid #000;
    background:#ff6b6b;
    color:#fff;
    font-weight:bold;
    cursor:pointer;
  }

  /* MOBILE / TABLETTE */
  @media(max-width:768px){
    #bg-sidebar{
      width:80vw;
      max-width:320px;
    }
  }
  `;
  document.head.appendChild(style);

  /* --- 3. HTML --- */
  const boutonRetour = backUrl
    ? `<button onclick="window.location.href='${backUrl}'">⬅ Retour</button>`
    : "";

  const menu = document.createElement("div");
  menu.innerHTML = `
    <button id="bg-btn" onclick="toggleMenu()">☰</button>
    <div id="bg-overlay" onclick="closeMenu()"></div>

    <div id="bg-sidebar">
      <h2>MENU</h2>
      <a href="../Index.html">🏠 Accueil</a>
      ${boutonRetour}
      <button onclick="openRules()">📜 Règles du jeu</button>
      <a href="settings.html">⚙️ Paramètres</a>
      <a href="connexion.html">👤 Connexion</a>
      <button onclick="closeMenu()" style="margin-top:auto;background:#ff6b6b">Fermer</button>
    </div>

    <div id="bg-modal-overlay" onclick="closeRules()">
      <div id="bg-modal-box" onclick="event.stopPropagation()">
        <button id="bg-modal-close" onclick="closeRules()">✕</button>
        <div id="bg-modal-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  /* --- 4. SWIPE MOBILE --- */
  let startX = 0;
  const sidebar = document.getElementById("bg-sidebar");

  sidebar.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  sidebar.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (diff < -60) closeMenu();
  });

});

/* --- 5. FONCTIONS --- */
window.toggleMenu = function(){
  document.getElementById("bg-sidebar").classList.toggle("open");
  document.getElementById("bg-overlay").classList.toggle("show");
};

window.closeMenu = function(){
  document.getElementById("bg-sidebar").classList.remove("open");
  document.getElementById("bg-overlay").classList.remove("show");
};

window.openRules = function(){
  closeMenu();
  const src = document.getElementById("regles-du-jeu");
  document.getElementById("bg-modal-content").innerHTML =
    src ? src.innerHTML : "<h2>Oups</h2><p>Pas de règles.</p>";
  document.getElementById("bg-modal-overlay").style.display="flex";
};

window.closeRules = function(){
  document.getElementById("bg-modal-overlay").style.display="none";
};

/* --- 6. FERMETURE AUTO AU CHANGEMENT DE PAGE --- */
window.addEventListener("beforeunload", closeMenu);
