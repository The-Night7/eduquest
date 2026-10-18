# EduQuest

Jeu de révision gamifié (XP, niveaux, étoiles, streak, boss, quête du jour) pour les cours de CY Tech Préing 2.
Les exercices sont **générés** : paramètres aléatoires, réponses calculées par le code (fractions exactes),
jamais deux parties identiques. Tout est écrit à la main à partir des DS/TD corrigés et **recoupé par des tests**.

TypeScript strict · Vite · KaTeX · Vitest. Aucune dépendance CDN : tout est dans le build.

## Chapitres

| Chapitre | Niveaux |
|---|---|
| Séries | 7 |
| Analyse dans ℝⁿ | 5 |
| Algèbre linéaire | 5 |
| Intégration & probabilités | 5 |
| Physique moderne | 3 (quanta, ondes de matière, Schrödinger) |
| Électromagnétisme | 3 (Coulomb, Gauss, potentiel/condensateurs) |
| Ondes | 4 (libres/amortis, forcé/résonance, propagation, couplées) |
| Informatique 3 | 3 (piles/files, ABR, AVL) |
| Informatique 4 | 3 (HTML/CSS, JS/DOM, PHP/AJAX/jQuery) |
| SHS | 2 (démarche de recherche, quanti/quali) |

## Des questions qui font réfléchir

- **Problème guidé** (façon DS) : plusieurs étapes, indices progressifs payants (−20 % d'XP par indice, plancher 40 %). Valide seulement si aucune étape n'est ratée.
- **Trouve l'erreur** : une démonstration ou un code avec une ligne fausse ; il faut désigner la ligne ET la bonne correction.
- **Reconstitue la preuve** : remettre les étapes dans l'ordre, avec des intrus.
- **Parie avant de voir** : sur les boss et ~30 % des questions, choisir une confiance (1/2/3 → ×1, ×1,5, ×2). Un pari 3 raté coûte 10×niveau XP et un cœur en plus. Les statistiques de calibration sont affichées.

## Commandes

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # ~380 tests (structure de chaque générateur + recoupements numériques + logique de partie)
npm run build      # typecheck + build dans dist/
```

## Architecture

```
src/
  core/      rng, fraction, tex (LaTeX, dec()), poly, matrix, combi, trees (ABR/AVL)
  content/   factories.ts (Qcm, Num, VF, Bug, Order, Guided…) ; un dossier par chapitre (index.ts + levelN.ts)
  game/      store (localStorage), progress, answer, session (une partie) : aucune dépendance au DOM
  ui/        home / chapter / play / kinds / result ; styles.css
tests/       content (structure de TOUTES les questions) · session · un fichier de recoupement par chapitre
```

Sauvegarde : clé `eduquest:v2` (l'ancienne `eduquest:series:v1` est migrée).

## Règles

- **Mission** : 6 questions + 1 boss (×2 XP) tiré des niveaux ouverts du chapitre. 3 cœurs. Une erreur repose une question du même niveau (2 fois max). Étoiles = cœurs restants. 1 étoile ouvre le niveau suivant.
- **XP** : `10 × n° du niveau × combo × boss × éclair × pari × poids × indices`. Combo +0,25 par bonne réponse d'affilée, plafonné à ×3.
- **Quête du jour** : 3 questions tirées dans tous les chapitres selon la date, +50 XP, sans perte de cœur.
- **Mode infini** par chapitre ou global ; **mode éclair** avec chrono.

## Ajouter du contenu

1. Créer `src/content/<chapitre>/levelN.ts` exportant un `Level` (`id` unique dans tout le jeu, `gens`, `piege`, `rappel`), puis `index.ts` exportant un `Chapter`, et l'ajouter à `CHAPTERS` dans `src/content/index.ts`.
2. Dans les générateurs, utiliser `rand/ri/pick/shuffle` de `core/rng` (jamais `Math.random`, sinon la quête du jour change à chaque lancement).
3. LaTeX : `L\`…\`` et `m(…)` pour les `$…$` ; décimales en texte via `dec()`. Le code en ligne (surtout avec `$`) va entre backticks, rendu en `<code>` et protégé de KaTeX.
4. Les réponses numériques sont des fractions exactes : choisir des paramètres « rationnels » (triplets pythagoriciens, carrés parfaits…). Écrire dans `tests/` un recoupement **indépendant** (différences finies, Simpson, énumération, exécution réelle du code affiché).
