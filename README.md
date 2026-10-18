# EduQuest

Jeu de révision gamifié (XP, niveaux, streak, boss, quête du jour) pour les cours de CY Tech.
Premier chapitre : **Séries** (fiches 1 à 7 du dépôt `recherche`). Les exercices sont **générés** :
paramètres aléatoires, réponses calculées par le code (fractions exactes), jamais deux parties identiques.

TypeScript strict · Vite · KaTeX · Vitest. Aucune dépendance CDN : tout est dans le build.

## Commandes

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 58 tests (génération + logique de partie)
npm run build      # typecheck + build dans dist/ (base relative : déployable n'importe où)
```

## Architecture

```
src/
  core/      rng.ts (aléatoire + graine), fraction.ts (fractions exactes), tex.ts (helpers LaTeX)
  content/   factories.ts (Qcm, Num, Nat, VF…), level1.ts … level7.ts, index.ts (mission, boss)
  game/      store.ts (localStorage), progress.ts (niveaux, streak), answer.ts, session.ts (une partie)
  ui/        home / play / result, fx (sons, confettis), styles.css
  types.ts   Question, Level…
tests/       content.test.ts (chaque générateur + vérifs numériques), session.test.ts
```

`game/` ne touche jamais au DOM : toute la logique (XP, combo, cœurs, boss, quête) est testable seule.

## Règles

- **Mission** : 6 questions + 1 boss (×2 XP) tiré des niveaux ouverts. 3 cœurs. Une erreur repose une question du même niveau (2 fois max). Étoiles = cœurs restants. 1 étoile ouvre le niveau suivant.
- **XP** : `10 × n° du niveau × combo × (boss ? 2 : 1) × (éclair ? 1,5 : 1)`. Combo : +0,25 par bonne réponse d'affilée, plafonné à ×3. 500 XP par niveau de joueur.
- **Quête du jour** : 3 questions fixées par la date, +50 XP, sans perte de cœur.
- **Mode infini** : les types de questions les plus ratés reviennent plus souvent.
- **Mode éclair** : chrono par question (25 s en QCM, 45 s en saisie).

## Ajouter du contenu

Un niveau = un fichier `src/content/levelN.ts` qui exporte un `Level` :

```ts
const riemann = (): RawQuestion => {
  const a = pick([Fr(1, 2), Fr(3, 2), Fr(2)]);
  return Nat("Nature de " + m(L`\sum\frac{1}{${powN(a)}}`) + " ?", fgt1(a), "Riemann : α > 1.");
};
export const level: Level = { id: "L8", name: "…", fiche: "Fiche 8", icon: "🎯", color: "#f5b400",
  gens: [["riemann", riemann]], piege: "…", rappel: ["…"] };
```

Puis l'ajouter à `LEVELS` dans `src/content/index.ts`. Règles à respecter dans les générateurs :
utiliser `rand/ri/pick` de `core/rng` (jamais `Math.random`, sinon la quête du jour change à chaque lancement)
et écrire le LaTeX avec `L\`…\`` et `m(…)` pour les `$…$`.

Pour un autre chapitre (Analyse dans ℝⁿ, Algèbre linéaire…), dupliquer `content/` en un tableau de niveaux
par chapitre et choisir le chapitre à l'accueil.
