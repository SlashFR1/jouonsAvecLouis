# 📚 Documentation Technique - Projet Loustic

Bienvenue dans la documentation officielle de l'architecture et des règles de jeu de la plateforme **Loustic**.

Ce dossier rassemble l'ensemble des spécifications techniques, des diagrammes logiques, des chartes de développement et des explications approfondies des mini-jeux multijoueurs.

---

## 🗂️ Sommaire de la documentation

| Document | Description |
| :--- | :--- |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Vue d'ensemble de la stack (Spring Boot 3, React 19, STOMP WebSockets, Neon PostgreSQL, Render Cloud), modèle de synchronisation et scalabilité sur 512 Mo de RAM. |
| **[GAMES_LOGIC.md](./GAMES_LOGIC.md)** | Guide détaillé des algorithmes, machines à états et mécaniques des jeux les plus complexes (*Motus, Classe Moi Ça, Limite Prison, Synapse, Bomb Party, La Taupe, Parasite, Alias*). |
| **[STANDARDS_COMMENTAIRES.md](./STANDARDS_COMMENTAIRES.md)** | Charte stricte de documentation du code : normes Javadoc complètes pour Java et JSDoc typé pour JavaScript. |

---

## 🎯 Objectif de la plateforme

Loustic est une plateforme de jeux d'ambiance et de fête hybride :
1. **Pass & Play / 1 téléphone** : Des jeux locaux légers où les joueurs se passent le téléphone.
2. **Multi-téléphones en temps réel** : Chaque joueur rejoint la salle avec son propre smartphone en scannant un QR Code ou en tapant un code à 5 caractères. La synchronisation est assurée par un broker STOMP sans latence perceptible.
