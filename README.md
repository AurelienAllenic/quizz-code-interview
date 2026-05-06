# Quizz Code

Application **SPA** de révision pour entretien **fullstack**, construite avec **React** (Vite) : quiz interactifs par thème (**SQL**, **Node.js**, **React**, **Python / Django**, **TypeScript**), mode sombre, cartes par quadrant, feedback immédiat avec explications.

## Fonctionnalités

- **Par catégorie** : SQL, Node, React, Django, TypeScript — chaque thème propose **plusieurs sets** de questions (fondamentaux, avancé, expert, etc.).
- **Choix de session** : **tout mélangé** (toutes les questions du thème dans un ordre aléatoire) ou **un set précis**.
- **Questions QCM** avec correction et texte d’explication après chaque réponse.
- **Score** par catégorie et progression visuelle sur le tableau de bord.
- **Persistance locale** : progression enregistrée dans `localStorage` (clé `fullstack-quiz-scores`).
- **Export / import** : sauvegarde au format **JSON** (changer de navigateur ou vider le cache sans tout perdre).
- **Animations** : Framer Motion sur les transitions et les cartes.

## Prérequis

- [Node.js](https://nodejs.org/) 18+ recommandé (avec `npm`).

## Installation

```bash
git clone <url-du-depot>
cd quizz-code
npm install
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (Vite), par défaut sur [http://localhost:5173](http://localhost:5173). |
| `npm run build` | Build de production (`tsc` + `vite build` selon `package.json`). |
| `npm run preview` | Prévisualise le build localement après `npm run build`. |

Si la commande `build` échoue sur `tsc` (projet surtout en JSX), lance `npx vite build` ou retire `tsc &&` du script dans `package.json`.

## Structure du projet (principale)

```
quizz-code/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx                 # État global, localStorage, export/import, routage Dashboard ↔ Quiz
    ├── index.css               # Tailwind v4 + thèmes néon
    ├── data/
    │   └── quizData.js         # Catégories, sets, questions, helpers (getAllQuestions, shuffle)
    └── components/
        ├── Dashboard.jsx       # Accueil, stats, export/import
        ├── CategoryCard.jsx    # Carte par thème
        ├── SetSelector.jsx    # Modal choix du set ou “tout mélangé”
        ├── QuizMode.jsx       # Déroulé du quiz + écran de résultats
        └── QuestionCard.jsx   # Une question + options + explication
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

## Licence

Projet personnel — usage libre dans le cadre de ta révision ; adapte la licence si tu publies le dépôt.
