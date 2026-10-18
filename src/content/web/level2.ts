// Informatique 4 · niveau 2 : JavaScript et DOM
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { code } from "../algo/util";

/** Expressions JS dont le résultat est vérifié par exécution dans les tests. */
export const JS_EXPRS: ReadonlyArray<{ expr: string; r: string; w: string[]; e: string }> = [
  { expr: `"5" + 3`, r: "53", w: ["8", "NaN", "Erreur"], e: "+ avec une chaîne = concaténation : « 5 » + 3 = « 53 »." },
  { expr: `"5" - 3`, r: "2", w: ["53", "NaN", "Erreur"], e: "« - » force la conversion numérique : 5 − 3 = 2." },
  { expr: `"5" * "2"`, r: "10", w: ["52", "NaN", "\"10\" (chaîne)"], e: "* convertit les deux opérandes en nombres." },
  { expr: `5 == "5"`, r: "true", w: ["false", "undefined", "Erreur"], e: "== convertit les types : 5 == « 5 »." },
  { expr: `5 === "5"`, r: "false", w: ["true", "undefined", "Erreur"], e: "=== compare aussi les types : nombre ≠ chaîne." },
  { expr: `typeof null`, r: "object", w: ["null", "undefined", "number"], e: "Bizarrerie historique de JavaScript." },
  { expr: `typeof undefined`, r: "undefined", w: ["object", "null", "string"], e: "undefined est son propre type." },
  { expr: `[] + []`, r: "", w: ["0", "[]", "undefined"], e: "Chaque tableau devient une chaîne vide ; la somme est la chaîne vide." },
  { expr: `0.1 + 0.2 === 0.3`, r: "false", w: ["true", "undefined", "NaN"], e: "Erreur d'arrondi binaire : 0.1 + 0.2 = 0.30000000000000004." },
  { expr: `"b" > "a"`, r: "true", w: ["false", "undefined", "NaN"], e: "Comparaison lexicographique des chaînes." },
  { expr: `Number("abc")`, r: "NaN", w: ["0", "undefined", "Erreur"], e: "Conversion impossible : NaN." },
  { expr: `NaN === NaN`, r: "false", w: ["true", "undefined", "Erreur"], e: "NaN n'est égal à rien, pas même à lui-même ; utiliser Number.isNaN." },
  { expr: `[1, 2, 3].length`, r: "3", w: ["2", "4", "undefined"], e: "length = nombre d'éléments." },
  { expr: `"radar".split("").reverse().join("")`, r: "radar", w: ["radra", "rdaar", "undefined"], e: "radar est un palindrome." },
];

function exprQ(): RawQuestion {
  const it = pick(JS_EXPRS);
  const opts = [it.r, ...it.w].map((o) => (o === "" ? "(chaîne vide)" : o));
  return Qcm(`Que vaut l'expression JavaScript ${code(it.expr)} ?`, opts, 0, it.e, true);
}

function arrayQ(): RawQuestion {
  const a = Array.from({ length: ri(4, 6) }, () => ri(1, 9));
  const kind = pick(["somme paire", "carrés", "max-min"] as const);
  const lit = `[${a.join(", ")}]`;
  let expr = "", val = 0;
  if (kind === "somme paire") { expr = `${lit}.filter(x => x % 2 === 0).reduce((s, x) => s + x, 0)`; val = a.filter((x) => x % 2 === 0).reduce((s, x) => s + x, 0); }
  else if (kind === "carrés") { expr = `${lit}.map(x => x * x).reduce((s, x) => s + x, 0)`; val = a.reduce((s, x) => s + x * x, 0); }
  else { expr = `Math.max(...${lit}) - Math.min(...${lit})`; val = Math.max(...a) - Math.min(...a); }
  return Num(`Quelle valeur renvoie ${code(expr)} ?`, Fr(val), `On applique les méthodes de gauche à droite : ${val}.`);
}

function stringQ(): RawQuestion {
  const words = ["javascript", "interface", "programme", "variable", "fonction", "tableau", "document"];
  const w = pick(words);
  const i = ri(1, 3), j = ri(i + 2, i + 5);
  const kind = pick(["slice", "indexOf", "length"] as const);
  if (kind === "slice")
    return Num(`Quelle est la longueur de ${code(`"${w}".slice(${i}, ${j})`)} ?`, Fr(Math.min(j, w.length) - i), `slice(début, fin) exclut l'indice fin : ${j} − ${i} = ${j - i} caractères.`);
  const ch = pick([...w]);
  if (kind === "indexOf") return Num(`Que renvoie ${code(`"${w}".indexOf("${ch}")`)} ? (les indices commencent à 0)`, Fr(w.indexOf(ch)), `indexOf renvoie la première position de « ${ch} ».`);
  return Num(`Quelle valeur renvoie ${code(`"${w}".length`)} ?`, Fr(w.length), `Nombre de caractères de « ${w} ».`);
}

function loopTrace(): RawQuestion {
  const n = ri(3, 8);
  let s = 0;
  for (let i = 1; i <= n; i++) s += i * i;
  return Num(
    `Que renvoie ${code(`f(${n})`)} avec ${code("function f(n) { let s = 0; for (let i = 1; i <= n; i++) { s += i * i; } return s; }")} ?`,
    Fr(s),
    `On additionne 1² + 2² + … + ${n}² = ${s}.`,
  );
}

const dom = poolVF([
  { q: "document.getElementById('x') renvoie un seul élément (ou null).", t: true, e: "Un id est unique." },
  { q: "document.getElementsByClassName('a') renvoie directement un seul élément.", t: false, e: "Renvoie une collection : il faut indexer ([0]) ou boucler." },
  { q: "innerHTML interprète le texte comme du HTML, textContent comme du texte brut.", t: true, e: "textContent protège des injections HTML." },
  { q: "Le DOM est une représentation en arbre de la page, manipulable par JavaScript.", t: true, e: "Nœuds éléments, texte, attributs." },
  { q: "let permet de redéclarer deux fois la même variable dans le même bloc.", t: false, e: "let interdit la redéclaration ; var l'autorise." },
  { q: "Une fonction peut être passée en argument à une autre fonction en JavaScript.", t: true, e: "Les fonctions sont des valeurs (callbacks : addEventListener, map, filter)." },
  { q: "L'attribut onclick d'un bouton exécute du JavaScript au clic.", t: true, e: "Gestionnaire d'événement en ligne ; addEventListener est préférable." },
  { q: "Pour cacher un élément avec JavaScript, on peut modifier element.style.visibility.", t: true, e: "= 'hidden' (garde la place) ; style.display = 'none' (retire du flux)." },
]);

function loopBug(): RawQuestion {
  return Bug(
    "Fonction censée tester si une chaîne est un palindrome. Une ligne est fausse.",
    [
      "function palindrome(s) {",
      "  for (let i = 0; i < s.length / 2; i++) {",
      "    if (s[i] === s[s.length - i]) return false;",
      "  }",
      "  return true;",
      "}",
    ],
    2,
    [
      "    if (s[i] !== s[s.length - 1 - i]) return false;",
      "    if (s[i] === s[s.length - 1 - i]) return false;",
      "    if (s[i] !== s[s.length - i]) return false;",
    ],
    "Deux erreurs combinées : il faut comparer s[i] au symétrique s[length − 1 − i] et retourner false quand ils DIFFÈRENT.",
  );
}

function domBug(): RawQuestion {
  return Bug(
    "On veut mettre en rouge tous les paragraphes de classe `note`. Une ligne est fausse.",
    [
      "const notes = document.getElementsByClassName('note');",
      "for (let i = 0; i < notes.length; i++) {",
      "  notes.style.color = 'red';",
      "}",
    ],
    2,
    [
      "  notes[i].style.color = 'red';",
      "  notes[i].style = 'red';",
      "  notes[i].color = 'red';",
    ],
    "notes est une collection : on modifie chaque élément notes[i], pas la collection.",
  );
}

function clickOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre : réagir au clic d'un bouton en modifiant la page.",
    [
      "Récupérer le bouton : `const b = document.getElementById('btn')`.",
      "Écrire la fonction qui modifie le DOM (par ex. changer un texte).",
      "Associer la fonction à l'événement : `b.addEventListener('click', fonction)`.",
      "Au clic, le navigateur appelle la fonction et la page est mise à jour.",
    ],
    ["Appeler la fonction soi-même avant que l'utilisateur clique.", "Recharger toute la page pour afficher le changement."],
    "Sélection → traitement → liaison à l'événement.",
  );
}

function funcGuided(): RawQuestion {
  const n = ri(4, 7);
  let s = 0;
  const parts: number[] = [];
  for (let i = 1; i <= n; i++) { s += i * i; parts.push(s); }
  return Guided(
    `On exécute ${code("function f(n) { let s = 0; for (let i = 1; i <= n; i++) { s += i * i; } return s; }")} avec n = ${n}.`,
    [
      gq("Que calcule cette fonction ?", ["La somme des carrés de 1 à n", "Le carré de la somme de 1 à n", "La somme de 1 à n", "n au carré"], ["Regarde ce qu'on ajoute à s à chaque tour."], "s += i * i : on ajoute i²."),
      gn("Valeur de s après le tour i = 2 ?", Fr(parts[1] as number), ["1² + 2²."], "1 + 4 = 5."),
      gn(`Valeur de s après le tour i = ${n - 1} ?`, Fr(parts[n - 2] as number), ["Continue d'ajouter les carrés."], `Somme des carrés de 1 à ${n - 1}.`),
      gn(`Valeur renvoyée par f(${n}) ?`, Fr(s), ["Ajoute encore le carré de n."], `${parts[n - 2]} + ${n * n} = ${s}.`),
    ],
    "Tracer le contenu des variables à chaque tour est la méthode sûre pour tout code de DS.",
  );
}

export const level: Level = {
  id: "WEB2",
  name: "JavaScript & DOM",
  fiche: "TD4-TD5",
  icon: "⚙️",
  color: "#f7b538",
  gens: [
    ["expr", exprQ], ["array", arrayQ], ["string", stringQ], ["trace", loopTrace],
    ["dom", dom], ["pal-bug", loopBug], ["dom-bug", domBug], ["click-order", clickOrder], ["func-guided", funcGuided],
  ],
  piege: "getElementsByClassName renvoie une collection (indexer !). « == » convertit, « === » non. Dernier indice d'une chaîne : length − 1.",
  rappel: [
    "Types : \"5\" + 3 = \"53\", \"5\" - 3 = 2 ; == convertit, === compare le type ; NaN ≠ NaN.",
    "DOM : getElementById (1 élément), getElementsByClassName (collection), innerHTML/textContent, style.*, addEventListener.",
    "Tableaux : map, filter, reduce ; chaînes : slice (fin exclue), indexOf, split/join.",
  ],
};
