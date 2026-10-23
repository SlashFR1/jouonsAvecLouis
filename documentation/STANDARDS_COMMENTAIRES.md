# 📝 Norme et Standard de Commentaires du Projet Loustic

Ce document définit les exigences de qualité et de style pour tous les commentaires, annotations et documentation du code source de Loustic.

---

## ☕ 1. Standards Java (Javadoc Backend)

Chaque classe, record, énumération et méthode publique ou protégée de `loustic-backend` **doit** respecter les règles suivantes :

### A. Format et structure minimale d'une classe
```java
/**
 * <h3>Nom du Service ou Composant</h3>
 * <p>
 * Description concise et précise du rôle métier et des responsabilités de la classe.
 * Préciser s'il s'agit d'un état persistant, d'un singleton de logique ou d'une machine à états.
 * </p>
 *
 * <h4>Thread-Safety & Concurrence</h4>
 * <ul>
 *   <li>Indiquer si la classe est thread-safe (ex: utilisation de {@link java.util.concurrent.ConcurrentHashMap}).</li>
 *   <li>Préciser les verrous éventuels ou l'atomicité des transitions de phase.</li>
 * </ul>
 *
 * @author Loustic Core Team
 * @see com.loustic.service.GameRoomService
 */
```

### B. Format des méthodes
Toute méthode ayant une logique métier, une validation ou une publication WebSocket doit expliciter :
1. **La description de l'action** (en français, style indicatif clair).
2. **`@param`** : rôle précis de chaque argument (ex : `roomCode`, `playerId`).
3. **`@return`** : valeur et cas limites (ex : null si partie terminée, DTO masqué).
4. **`@throws`** : exceptions métier levées (ex: `GameExceptions.roomNotFound(code)`).
5. **Effet de bord réseau** : si la méthode diffuse un événement WebSocket sur `/topic/room/{code}`.

Exemple :
```java
/**
 * Valide et évalue la tentative d'un joueur pour le jeu Motus.
 * <p>
 * Exécute un algorithme d'évaluation en 2 passes (lettres bien placées prioritaires,
 * puis lettres mal placées avec comptage d'occurrences exactes pour éviter les faux positifs).
 * </p>
 *
 * @param roomCode identifiant unique de la salle (5 caractères alphanumériques)
 * @param playerId identifiant de session unique du joueur
 * @param guess    mot proposé par le joueur (doit faire la taille requise)
 * @throws IllegalArgumentException si la salle est introuvable ou si le mot n'a pas la bonne longueur
 * @see #evaluateGuess(String, String)
 */
public void submitGuess(String roomCode, String playerId, String guess) { ... }
```

### C. Anti-Triche et Sérialisation
Toute donnée renvoyée aux clients **ne doit jamais** exposer de secret d'un autre joueur (par exemple le mot Motus avant la fin, la carte noire ou les cartes secrètes de l'espion). Documenter explicitement l'anti-triche :
```java
/**
 * Génère le DTO d'état public destiné aux téléphones des joueurs.
 * <p>
 * <strong>Garantie anti-triche :</strong> Le mot secret est masqué (remplacé par des astérisques
 * ou la première lettre) tant que la manche est active pour empêcher la triche via l'inspecteur réseau.
 * </p>
 */
```

---

## ⚛️ 2. Standards JavaScript / React (JSDoc Frontend)

Chaque composant majeur, hook personnalisé ou client d'API de `loustic-frontend` doit être documenté selon la norme **JSDoc**.

### A. Hooks personnalisés
```javascript
/**
 * Hook de synchronisation WebSocket STOMP avec reconnexion exponentielle.
 * 
 * @param {string|null} roomCode - Code alphanumérique de la salle courante.
 * @param {(event: {type: string, room: object, payload: object}) => void} onEvent - Gestionnaire d'événements distants.
 * @param {Record<string, (data: any) => void>} [extraSubscriptions={}] - Topics supplémentaires à écouter.
 * @returns {{ connected: boolean, send: (action: string, payload?: object) => boolean }}
 */
export function useGameSocket(roomCode, onEvent, extraSubscriptions = {}) { ... }
```

### B. Composants d'écrans de jeu
```javascript
/**
 * Composant de salle pour le mini-jeu Motus.
 * 
 * @component
 * @description
 * Gère l'affichage de la grille cartoon Rubber Hose, le clavier virtuel réactif,
 * la synchronisation des essais des autres joueurs en temps réel et le podium de fin de manche.
 */
export default function MotusRoom() { ... }
```

---

## 🧹 3. Règle du Boy Scout (Nettoyage proactif)
- Tout import non utilisé (`unused import`) détecté par l'IDE ou le compilateur doit être éliminé immédiatement.
- Les méthodes dépréciées ou doublons orphelins doivent être purgés ou clairement signalés avec `@Deprecated(forRemoval = true)`.
- Aucun `System.out.println` ou `console.log` de debug verbeux ne doit subsister en production ; utiliser les loggers SLF4J (`log.info`, `log.warn`) avec parcimonie.
