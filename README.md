# Loustic (PlayWithLouis) – Jeux de soirée interactifs

Jeux de soirée drôles, rapides et sans prise de tête à jouer entre amis :
- **1 seul téléphone (Pass & Play)** : on se passe l'appareil au fil des défis.
- **Plusieurs téléphones en direct (Rooms)** : synchronisation temps réel par WebSockets (STOMP).

---

## 🏛️ Nouvelle Architecture (React + Spring Boot 3)

Le projet a été migré vers une architecture modulaire :
- **Backend :** `loustic-backend/` — Java 17 + Spring Boot 3
  - **Decks CSV en mémoire vive :** 19 fichiers CSV fixes chargés au démarrage (`src/main/resources/data/*.csv`)
  - **API REST :** consultation et filtrage des cartes (`/api/games/{key}/cards`)
  - **WebSockets STOMP :** synchronisation temps réel des salles multi-téléphones (`/ws-game` et `/topic/room/{code}`)
  - **Moteurs de jeu autoritaires côté serveur :**
    - 💣 **Boom boom :** mèche secrète aléatoire, passage de bombe et détonation
    - ⚠️ **Limite PRISON :** mains privées de 5 cartes, soumission anonyme, vote en direct et podium
    - 🔢 **Classe moi ça (Top Ten) :** échelle 1 à 10, chiffres secrets, classement par le capitaine et calcul d'erreurs
    - 🔍 **La taupe (Undercover) :** attribution secrète (Innocents, Taupe, Fantôme), débat et vote éliminatoire
    - 🕵️ **SPY (Spyfall) :** distribution du lieu secret, questions-réponses et vote pour démasquer l'espion
    - 🗣️ **Alias (Time's Up) :** descripteur tournant, chrono de 60s, score en direct et podium
    - ⏱️ **7 secondes en direct :** défi simultané, compte à rebours 7s synchronisé et validation par les pairs
- **Frontend :** `loustic-frontend/` — React 19 + Vite 6 + React Router 7 + `@stomp/stompjs`
  - Thème vintage cartoon **Rubber Hose** (1930s, Cuphead / Steamboat Willie)
  - Layout universel 3 zones : Navbar sticky, Scène centrale, Thumb zone ergonomique
  - Composant réutilisable `RoomLobby` pour la création/rejoint de salle sur n'importe quel jeu
  - Mode hors-ligne / Pass & Play pour les jeux solo et duels

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Java 17+** et **Maven 3.9+**
- **Node.js 20+** et **npm**

### 2. Démarrage en 1 commande

```bash
# Lance simultanément le backend Spring Boot (8080) et le frontend React (5173) :
./start.sh
# (ou : npm start)
```

Le script :
- Vérifie les prérequis et libère les ports si occupés.
- Lance le serveur Spring Boot et attend qu'il soit prêt.
- Lance le serveur Vite en mode réseau local (`--host`).
- Affiche l'adresse IP locale pour connecter vos téléphones.
- Ouvre votre navigateur automatiquement sur Mac.
- Arrête proprement tous les services avec `Ctrl + C`.

### 3. Autres commandes disponibles

```bash
# Lancer séparément
npm run dev:back    # Backend seul
npm run dev:front   # Frontend seul

# Tester le backend Java
npm run test:back

# Re-générer les 19 fichiers CSV depuis les données JS existantes
npm run export:csv
```

---

## 📱 Tester à plusieurs téléphones en local

1. Lancez `npm run dev:back` puis `npm run dev:front`.
2. Vite affiche l'URL réseau (ex. `http://192.168.1.XX:5173`).
3. Connectez les téléphones au même réseau Wi-Fi :
   - Écran d'accueil : appuyez sur **Plusieurs Téléphones**
   - Choisissez un jeu (ex: **Limite PRISON**, **Boom boom**, **Classe moi ça**, **La taupe**, **SPY**, **Alias** ou **7 secondes**)
   - Téléphone 1 : saisit son pseudo et clique sur **Créer une salle**
   - Téléphones 2+ : entrent le code à 5 lettres affiché sur le premier écran
   - L'hôte démarre : toutes les actions et les cartes se synchronisent en temps réel sans latence !

---

## 📁 Organisation du Dépôt

```text
jouonsAvecLouis/
├── loustic-backend/                 # ☕ Backend Spring Boot 3
│   ├── src/main/resources/data/     # 19 fichiers CSV fixes (~16 000 cartes et défis)
│   ├── tools/export-csv.cjs         # Script d'extraction des anciens data.js -> CSV
│   └── src/main/java/com/loustic/
│       ├── controller/              # GameWebSocketController & REST endpoints
│       ├── model/                   # Modèles (GameRoom, GameDeck, Player...)
│       └── service/                 # Moteurs de jeu (Bomb, Limite, CMC, Taupe, Spy, Alias, 7sec...)
├── loustic-frontend/                # ⚛️ Frontend React Vite
│   ├── src/pages/                   # Accueil (Home) et pages de salle dédiées (Rooms)
│   ├── src/components/              # App Shell GameLayout, CardStage, CartoonButton, RoomLobby
│   └── src/styles/                  # Styles Rubber Hose 1930s (responsive-global.css, game-layout.css, app.css)
└── [anciens dossiers de jeux]       # Code HTML/JS vanilla d'origine (archivé)
```

Used tool: manage_task

**Oui, absolument ! Tous les jeux du catalogue sans exception sont intégralement implémentés en React avec leur logique métier complète**, sans aucune redirection legacy ni iframe.

Voici le récapitulatif détaillé de l'implémentation frontend, de la logique de jeu et des équivalents dans la vraie vie :

---

### 🎮 Tableau exhaustif des jeux implémentés

| Jeu Loustic | Composant React | Équivalent dans la vraie vie | Logique métier implémentée |
| :--- | :--- | :--- | :--- |
| **Alias** 🗣️ | [AliasGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/AliasGame.jsx) | **Codenames / Taboo / Time’s Up** | Sprint de 60s chrono, tirage de mots, boutons *Trouvé (+1 pt)* et *Passer*, décompte du score et récapitulatif. |
| **Boom boom** 💣 | [BombGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/BombGame.jsx) | **Tic Tac Boum / Pass the Bomb** | Patate chaude avec tic-tac animé, mèche secrète aléatoire (18 à 35s), bouton passage de bombe et gage immédiat à l'explosion. |
| **7 secondes** ⏱️ | [SevenSecGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/SevenSecGame.jsx) | **5 Second Rule (5 Secondes)** | Chrono circulaire SVG temps réel de 7 secondes avec alerte visuelle sous les 3s, validation ou gorgée de pénalité. |
| **Limite PRISON** ⚠️ | [LimitePrisonGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/LimitePrisonGame.jsx) | **Cards Against Humanity / Blanc Manger Coco** | Carte bleue question avec trou (« ___ »), pioche de cartes blanches, sélection tactile et vote de la pire réponse. |
| **Classe moi ça** 🔢 | [ClasseMoiCaGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/ClasseMoiCaGame.jsx) | **Top Ten / Ito / Wavelength** | Thème d'échelle (1 à 10), attribution secrète des chiffres aux coéquipiers, manche du Capitaine qui ordonne et gestion de 4 vies. |
| **La taupe** 🔍 | [LaTaupeGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/LaTaupeGame.jsx) | **Undercover / Loup-Garou** | Paires de mots secrets (Civils vs Taupe), tour d'indices, débat et tribunal de vote d'élimination de la taupe. |
| **SPY** 🕵️ | [SpyGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/SpyGame.jsx) | **Spyfall (L'Espion qui venait du froid)** | Attribution secrète du lieu de mission aux agents et rôle d'Espion, minuteur d'interrogatoire (3 min) et accusation. |
| **Yams** 🎲 | [YamsGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/YamsGame.jsx) | **Yahtzee / Yam's officiel** | 5 dés cartoon avec pips, 3 lancers max par tour, verrouillage des dés gardés, feuille de score complète (1-6, bonus 63 à +35 pts, brelan, carré, full, suites, yams, chance). |
| **Synapse** ⚡ | [SynapseGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/SynapseGame.jsx) | **TTMC (Tu Te Mets Combien ?)** | Auto-évaluation de 1 à 10 par le joueur, tirage de la question correspondante, vérification de la réponse et cumul des points. |
| **Raconte-moi** 📖 | [RaconteMoiGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/RaconteMoiGame.jsx) | **Black Stories / Dark Stories / Darwin Awards** | Histoires réelles folles, lecture secrète du conteur (réponses par OUI/NON), déblocage progressif de 3 indices et révélation de la phrase clé. |
| **Universal mind** 🌐 | [UniversalMindGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/UniversalMindGame.jsx) | **Concept / Pictionary à symboles** | Mot secret à deviner, grille interactive de 28 pictogrammes (Monde, Feu, Amour, Transport, Couleurs...) activables pour guider son équipe sans parler. |
| **Devine qui ?** 🎭 | [DevineQuiGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DevineQuiGame.jsx) | **Hedbanz / Post-it sur le front / Qui est-ce ?** | Attribution de personnages célèbres / pop-culture, masquage à l'intéressé, compteur de questions posées et chrono. |
| **Débat** 📢 | [DebatGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DebatGame.jsx) | **Taggle / Le Grand Débat** | Thèmes polémiques, minuteur de parole réglable (30s, 60s, 90s) avec barre de progression, votes du public (Pour / Contre / Égalité). |
| **Parasite** 🦠 | [ParasiteGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/ParasiteGame.jsx) | **Among Us / The Thing** | Déduction spatiale, attribution secrète des rôles (Astronautes sains vs Parasite), débat d'alibis et tribunal d'éjection du sas. |
| **Galerie** 🎨 | [GalerieGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/GalerieGame.jsx) | **Dixit / Muse / Mysterium** | Le conteur saisit un indice poétique, exposition d'œuvres cartoon, vote des joueurs et révélation de la carte originale. |
| **Mess Meme** 😂 | [MessMemeGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/MessMemeGame.jsx) | **What Do You Meme? / Meme Match** | Situations et mèmes cultes, soumission de punchlines par les joueurs et vote pour la légende la plus drôle. |
| **Désolé** 💌 | [DesoleGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DesoleGame.jsx) | **Secret Identity / Dilemmes intimes** | Confessions croustillantes, tribunal de la table avec votes (Pardonné 😇, Coupable 🚨, 1 Shot 🥃). |
| **Je n'ai jamais** 🍷 | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **Never Have I Ever / Picolo** | Cartes révélations avec switch Normal / Hot 🔥, gorgée pour ceux qui l'ont fait. |
| **Tu préfères** 🔥 | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **Would You Rather** | Dilemmes absurdes, vote simultané, gorgée pour la minorité. |
| **Vrai ou Faux** 🧠 | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **Trivial Pursuit / Tu mourras moins bête** | Affirmations insolites par thèmes, bouton révélation avec tampon officiel VRAI/FAUX. |
| **Vote ou shot** 🗳️ | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **Juduku / Who's Most Likely To** | « Qui est le plus susceptible de... », pointage à 3 et comptage de shots. |
| **Juge** ⚖️ | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **C'est un 10 mais... (Trend TikTok)** | Situation toxique ou ridicule ajoutée à une personne idéale, débat et notation révisée sur 10. |
| **Switch** ⚡ | [DeckGame.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/DeckGame.jsx) | **Picolo / Action ou Vérité** | Gages instantanés, échanges de places ou de verres, mode Hot. |

---

### 🌐 Salles multi-téléphones synchronisées (STOMP WebSockets)
Les 7 salles multi-joueurs disposent de leur propre salle temps réel :
- **Boom boom en direct** : [BombRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/BombRoom.jsx)
- **Limite PRISON multi** : [LimitePrisonRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/LimitePrisonRoom.jsx)
- **Classe moi ça multi** : [ClasseMoiCaRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/ClasseMoiCaRoom.jsx)
- **La taupe multi** : [LaTaupeRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/LaTaupeRoom.jsx)
- **SPY multi** : [SpyRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/SpyRoom.jsx)
- **Alias multi** : [AliasRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/AliasRoom.jsx)
- **7 secondes multi** : [SevenSecRoom.jsx](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/pages/games/SevenSecRoom.jsx)

---

### 📜 Règles enrichies dans [`rules.js`](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/config/rules.js)
Le fichier [rules.js](file:///Users/baffourlouis/Desktop/jouonsAvecLouis%20copie/loustic-frontend/src/config/rules.js) intègre désormais pour chaque jeu :
1. **La propriété `equivalent`** qui affiche un badge doré en haut de la modale : `🎲 Comme dans : Codenames / Taboo / Time’s Up`, etc.
2. **La section « 🎲 Équivalent dans la vraie vie »** expliquant le parallèle avec le jeu de société physique culte.
3. **Le détail tour par tour** des règles, des pénalités (gorgées/shots) et de la condition de victoire.