class CartoonFooter extends HTMLElement {
  connectedCallback() {
    const logoUrl = "../Loustic-icon.png"; 
    const githubUrl = "https://github.com/SlashFR1";

    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap');

        cartoon-footer {
          display: block;
          width: 100%;
          font-family: 'Fredoka', sans-serif;
        }

        .c-footer {
          background-color: #87CEEB;
          border-top: 4px solid #000;
          padding: 15px 20px; /* Padding un peu réduit de base */
          display: flex;
          justify-content: space-between; /* Espace mieux réparti */
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          box-shadow: 0 -5px 0 rgba(0,0,0,0.1);
        }

        /* --- LOGO --- */
        .c-footer-img-container img {
          width: 60px;
          height: 60px;
          border: 3px solid #000;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.3s ease;
          display: block; /* Évite les décalages de ligne */
        }

        .c-footer-img-container img:hover {
          transform: rotate(15deg) scale(1.1);
        }

        /* --- TEXTE --- */
        .c-footer-text {
          font-size: 1.1rem;
          color: #000;
          font-weight: 600;
          text-align: center;
          text-shadow: 2px 2px 0px #fff;
        }

        /* --- BOUTON --- */
        .c-github-link {
          text-decoration: none;
          background-color: #FFEB3B;
          color: #000;
          padding: 8px 16px; /* Bouton légèrement plus compact */
          border: 3px solid #000;
          border-radius: 12px;
          font-weight: bold;
          box-shadow: 4px 4px 0px #000;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .c-github-link:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000;
        }

        .c-github-link:active {
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0px #000;
        }

        .c-github-icon {
          width: 20px;
          height: 20px;
        }

        /* --- SUPER RESPONSIVE MOBILE --- */
        @media (max-width: 600px) {
          .c-footer {
            /* On passe en Grid pour mieux contrôler l'espace */
            display: grid;
            /* 2 colonnes : une pour le logo, une pour le bouton */
            grid-template-columns: auto auto; 
            /* Le texte prend toute la largeur en dessous */
            grid-template-areas: 
              "logo btn"
              "text text";
            padding: 10px 15px; /* Padding très fin sur mobile */
            gap: 10px; /* Espace réduit entre les éléments */
            justify-content: space-between;
            align-items: center;
          }

          /* Assignation des zones de grille */
          .c-footer-img-container { grid-area: logo; }
          .c-github-link          { grid-area: btn; justify-self: end; }
          .c-footer-text          { grid-area: text; }

          /* Réductions de taille spécifiques au mobile */
          .c-footer-img-container img {
            width: 45px; /* Logo plus petit */
            height: 45px;
            border-width: 2px;
          }

          .c-github-link {
            padding: 6px 12px; /* Bouton plus petit */
            font-size: 0.85rem;
            box-shadow: 3px 3px 0px #000;
            border-width: 2px;
          }
          
          .c-footer-text {
            font-size: 0.8rem; /* Texte plus petit */
            width: 100%;
            margin-top: 2px;
          }
        }
      </style>

      <footer class="c-footer">
        <div class="c-footer-img-container">
           <img src="${logoUrl}" alt="Logo">
        </div>

        <div class="c-footer-text">
          &copy; 2026 Loustic
        </div>

        <a href="${githubUrl}" target="_blank" class="c-github-link">
          <svg class="c-github-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Github
        </a>
      </footer>
    `;
  }
}

customElements.define('cartoon-footer', CartoonFooter);