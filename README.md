# Quizz Code — Interview Prep

Application **SPA** de révision pour entretien **fullstack**, construite avec **React** (Vite) : quiz interactifs par thème (**SQL**, **Node.js**, **React**, **Python / Django**, **TypeScript**), mode sombre, cartes par quadrant, feedback immédiat avec explications.

## Dépôt & déploiement

| | Lien |
|---|-----|
| **Code source** | [github.com/AurelienAllenic/quizz-code-interview](https://github.com/AurelienAllenic/quizz-code-interview) |

L’application est prévue pour être hébergée sur **GitHub** (historique, issues, PR) et déployée en production sur **Vercel** (build automatique à chaque push sur `main`, site statique depuis `dist/`).

## Fonctionnalités

- **Par catégorie** : SQL, Node, React, Django, TypeScript — chaque thème propose **plusieurs sets** de questions (fondamentaux, avancé, expert, etc.).
- **Choix de session** : **tout mélangé** (toutes les questions du thème dans un ordre aléatoire) ou **un set précis**.
- **Questions QCM** avec correction et texte d’explication après chaque réponse.
- **Score** par catégorie et progression visuelle sur le tableau de bord.
- **Persistance locale** : progression enregistrée dans `localStorage` (clé `fullstack-quiz-scores`).
- **Export / import** : sauvegarde au format **JSON** (changer de navigateur ou vider le cache sans tout perdre).
- **Modale de choix de set** : scroll uniquement dans la modale, pas sur la page derrière.
- **Animations** : Framer Motion sur les transitions et les cartes.

## Prérequis

- [Node.js](https://nodejs.org/) 18+ recommandé (avec `npm`).

## Installation (local)

```bash
git clone https://github.com/AurelienAllenic/quizz-code-interview.git
cd quizz-code-interview
npm install
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (Vite), par défaut sur [http://localhost:5173](http://localhost:5173). |
| `npm run build` | Build de production (`vite build` → dossier `dist/`). |
| `npm run preview` | Prévisualise le build localement après `npm run build`. |

## Publier sur GitHub

1. Crée un dépôt sur GitHub (ou utilise [quizz-code-interview](https://github.com/AurelienAllenic/quizz-code-interview) si tu en es déjà propriétaire).
2. En local : `git remote add origin https://github.com/AurelienAllenic/quizz-code-interview.git` (ou `git remote set-url origin …` si le remote existe déjà).
3. Pousse la branche principale : `git push -u origin main`.

## Déploiement sur Vercel

1. Connecte-toi sur [Vercel](https://vercel.com) et **Import** le dépôt [AurelienAllenic/quizz-code-interview](https://github.com/AurelienAllenic/quizz-code-interview).
2. Laisse la détection **Vite** / **Framework Preset** telle quelle : build `npm run build`, sortie **`dist`**.
3. Aucune variable d’environnement n’est nécessaire pour cette app statique.
4. Le fichier **`vercel.json`** à la racine configure une **réécriture SPA** vers `index.html`, ce qui évite les **404** lors d’un rafraîchissement ou d’une URL profonde.

Après le premier déploiement, Vercel te fournit une URL de production (et des prévisualisations par branche / PR).

## Structure du projet (principale)

```
quizz-code-interview/
├── index.html
├── vercel.json              # Réécritures SPA
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── hooks/
    │   └── useBodyScrollLock.js
    ├── data/
    │   └── quizData.js
    └── components/
        ├── Dashboard.jsx
        ├── CategoryCard.jsx
        ├── SetSelector.jsx
        ├── QuizMode.jsx
        └── QuestionCard.jsx
```

## Données et personnalisation

Les questions sont définies dans **`src/data/quizData.js`** :

- chaque **catégorie** a un `id`, un `theme` (couleurs UI) et un tableau **`sets`** ;
- chaque **set** contient un tableau **`questions`** avec au minimum : `id`, `keyword`, `question`, `options`, `correct` (index), `explanation`.

Pour ajouter des entrées, respecte les **IDs uniques** dans tout le fichier (éviter les doublons entre sets).

## Export / import de la progression

- Sur le tableau de bord : **Exporter** génère un fichier JSON (scores + métadonnées).
- **Importer** fusionne les données avec la progression actuelle puis ré-enregistre le tout dans `localStorage`.

En cas de problème d’import, vérifie que le fichier provient bien de l’export de cette app ou respecte la structure attendue (objet avec clés de catégories connues).

## Stack technique

React 19 · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · Framer Motion · Lucide React

## Licence

Ce projet est sous **licence MIT** : tu peux réutiliser et modifier le code librement, sous réserve de conserver l’avis de copyright et le texte de la licence. Les détails juridiques sont dans le fichier [`LICENSE`](LICENSE) à la racine du dépôt.
