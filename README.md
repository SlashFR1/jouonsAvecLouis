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
