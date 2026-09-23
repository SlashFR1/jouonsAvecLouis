# Belote Multijoueur en Temps Réel ♠️♥️♦️♣️

Application web de jeu de Belote multijoueur temps réel fidèle aux règles officielles de la Fédération Française de Belote (FFB) avec la variante de la **Quinch (annonces)**.

---

## 🛠️ Stack Technique

- **Framework :** [Next.js](https://nextjs.org/) 14 (App Router) & TypeScript
- **Style :** [Tailwind CSS](https://tailwindcss.com/) (Tapis feutre, animations fluides, surbrillance dorée d'atout, grisé strict des cartes non jouables)
- **Base de données :** [Neon](https://neon.tech/) (Serverless PostgreSQL) avec [Prisma](https://www.prisma.io/)
- **Temps Réel :** Pusher Channels (compatible Vercel Serverless) avec synchronisation d'état et masquage des cartes adverses
- **Hébergement :** [Vercel](https://vercel.com/)

---

## 🃏 Règles & Fonctionnalités Implémentées

### 1. Salon & Lobby
- Création et connexion par code de salon à 4 lettres.
- Choix de l'objectif de points : **501 points (rapide)** ou **1001 points (standard)**.
- Activation / Désactivation de la variante **Quinch (annonces)**.
- 4 places réparties en 2 équipes :
  - **Équipe 1 :** Joueur 1 (Sud) & Joueur 3 (Nord - Partenaire)
  - **Équipe 2 :** Joueur 2 (Ouest) & Joueur 4 (Est)

### 2. Enchères & Prise
- **Distribution officielle :** 5 cartes par joueur (3 puis 2), 1 carte retournée au centre.
- **Tour 1 :** Prise de la carte retournée (devient la couleur d'atout) ou Passer.
- **Tour 2 :** Choix d'une couleur au choix (Pique, Cœur, Carreau, Trèfle), ou **Tout Atout (TA)**, ou **Sans Atout (SA)**, ou Passer.
- Distribution du complément à 8 cartes pour tous les joueurs.

### 3. Variante "Quinch" (Les Annonces)
- Détection automatique et arbitrage des annonces :
  - **Tierce** (3 cartes qui se suivent) = 20 points
  - **Quarte** (4 cartes qui se suivent) = 50 points
  - **Quinte** (5 cartes qui se suivent) = 100 points
  - **Carré** (4 Valets = 200 pts, 4 Neuf = 150 pts, 4 As/10/R/D = 100 pts)
- **Hiérarchie stricte :** Carré > Quinte > Quarte > Tierce. Seule l'équipe avec la plus haute annonce marque les points de toutes ses annonces.

### 4. Moteur de Règles Strictes
- **Surbrillance dorée :** Les cartes d'atout sont entourées d'une bordure dorée lumineuse (`shadow-trump-glow`).
- **Grisé des cartes interdites :** Les cartes qu'un joueur n'a pas le droit de poser sont automatiquement grisées (`opacity-40 grayscale cursor-not-allowed`) avec indication de la raison.
- **Obligations respectées :**
  - Obligation de fournir la couleur demandée.
  - Obligation de couper si l'adversaire est maître du pli.
  - Obligation de surcouper (monter à l'atout) si possible.
  - Autorisation de pisser/défausser si le partenaire est maître du pli.
- **Belote - Rebelote :** Détection automatique (+20 points si Roi et Dame d'atout joués).
- **Dix de Der :** +10 points pour l'équipe remportant le 8ème pli.
- **Calculs de Chute (Dedans) et Capot (250 pts).**

---

## 🚀 Installation Locale

```bash
cd Belote
npm install
npm run dev
```
Ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.

---

## ☁️ Déploiement sur Vercel

1. Créez un projet gratuit sur [Neon](https://neon.tech) et copiez votre `DATABASE_URL`.
2. Créez une application gratuite sur [Pusher Channels](https://pusher.com) et copiez vos clés.
3. Déployez le dossier `Belote` sur Vercel et ajoutez les variables d'environnement listées dans `.env.example`.
