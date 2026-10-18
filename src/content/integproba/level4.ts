// Intégration & probabilités · niveau 4 : dénombrement
import { Fr } from "../../core/fraction";
import { arr, binom, factNum, multinomial } from "../../core/combi";
import { ri, shuffle } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, Guided, Num, Order, poolVF } from "../factories";

const LETTERS = "ABCDEGHKLMNPRST".split("");

function anagrams(): RawQuestion {
  let counts: number[];
  do counts = Array.from({ length: ri(2, 4) }, () => ri(1, 4)); while (counts.reduce((a, b) => a + b, 0) > 9 || counts.every((c) => c === 1));
  const ls = shuffle(LETTERS).slice(0, counts.length);
  const word = shuffle(ls.flatMap((l, i) => Array<string>(counts[i]!).fill(l))).join("");
  return Num(
    "Combien d'anagrammes (avec ou sans sens) a le mot « " + word + " » ?",
    Fr(multinomial(counts)),
    `${word.length}! / (${counts.map((c) => c + "!").join(" · ")}) = ${multinomial(counts)} : on divise par les permutations des lettres répétées.`,
  );
}

function committee(): RawQuestion {
  const men = ri(3, 7), women = ri(2, 5), k = ri(2, Math.min(5, men + women - 1));
  return Num(
    `Un comité de ${k} personnes est choisi parmi ${men} hommes et ${women} femmes. Combien de comités contiennent AU MOINS une femme ?`,
    Fr(binom(men + women, k) - binom(men, k)),
    `Complémentaire : tous les comités C(${men + women},${k}) = ${binom(men + women, k)} moins ceux sans femme C(${men},${k}) = ${binom(men, k)}.`,
  );
}

function codes(): RawQuestion {
  const n = ri(5, 10), k = ri(2, 4);
  const rep = ri(0, 1) === 0;
  return Num(
    `Un code a ${k} chiffres choisis parmi ${n} symboles distincts, ${rep ? "les répétitions étant autorisées" : "sans aucune répétition"}. Combien de codes ?`,
    Fr(rep ? n ** k : arr(n, k)),
    rep ? `${n}^${k} = ${n ** k} (k choix indépendants).` : `Arrangements A(${n},${k}) = ${n}!/${n - k}! = ${arr(n, k)} (l'ordre compte, pas de répétition).`,
  );
}

function diagonals(): RawQuestion {
  const n = ri(5, 12);
  return Num(
    `Combien de diagonales a un polygone convexe à ${n} côtés ?`,
    Fr((n * (n - 3)) / 2),
    `C(${n},2) − ${n} = ${binom(n, 2)} − ${n} = ${(n * (n - 3)) / 2} (on retire les côtés).`,
  );
}

function inclusion(): RawQuestion {
  const A = ri(10, 40), B = ri(10, 40), I = ri(1, Math.min(A, B) - 1), U = A + B - I + ri(1, 20);
  const neither = ri(0, 1) === 0;
  return Num(
    `Dans un groupe de ${U} étudiants, ${A} font de l'anglais, ${B} de l'espagnol et ${I} les deux. Combien ${neither ? "ne font NI l'un NI l'autre" : "font au moins une des deux langues"} ?`,
    Fr(neither ? U - (A + B - I) : A + B - I),
    `Inclusion–exclusion : |A ∪ B| = ${A} + ${B} − ${I} = ${A + B - I}${neither ? `, donc ${U} − ${A + B - I} = ${U - (A + B - I)} n'en font aucune` : ""}.`,
  );
}

const facts = poolVF([
  { q: "C(n,k) = C(n, n−k).", t: true, e: "Choisir k éléments revient à choisir les n−k laissés de côté." },
  { q: "Le nombre de permutations de n objets distincts est n^n.", t: false, e: "C'est n! (n choix, puis n−1, …)." },
  { q: "Σ_{k=0}^n C(n,k) = 2ⁿ.", t: true, e: "Nombre de parties d'un ensemble à n éléments (binôme avec a = b = 1)." },
  { q: "A(n,k) = C(n,k) · k!.", t: true, e: "On choisit les k éléments, puis on les ordonne." },
  { q: "Tirer 3 cartes simultanément parmi 10 se compte par A(10,3).", t: false, e: "Simultané = sans ordre : C(10,3) = 120." },
  { q: "Le nombre de parties à k éléments d'un ensemble à n éléments est n!/k!.", t: false, e: "C'est C(n,k) = n!/(k!(n−k)!)." },
  { q: "Si A et B sont disjoints, |A ∪ B| = |A| + |B|.", t: true, e: "Principe additif." },
]);

function orderedBug(): RawQuestion {
  const n = ri(8, 12), k = 3;
  return Bug(
    `On choisit un bureau de ${k} délégués (sans rôles distincts) parmi ${n} étudiants. Une ligne est fausse.`,
    [
      `Les ${k} délégués ont tous le même rôle : seul l'ensemble choisi compte.`,
      `L'ordre dans lequel on les cite n'a donc aucune importance.`,
      `On compte donc des arrangements : $A(${n},${k})=${arr(n, k)}$ bureaux.`,
      `Chaque bureau est compté plusieurs fois si l'on ordonne les délégués.`,
    ],
    2,
    [
      `On compte donc des combinaisons : $\\binom{${n}}{${k}}=${binom(n, k)}$ bureaux.`,
      `On compte donc $${n}^{${k}}=${n ** k}$ bureaux.`,
      `On compte donc $${k}!=6$ bureaux.`,
    ],
    `L'ordre ne compte pas ⇒ combinaisons. A(${n},${k}) = ${arr(n, k)} compte chaque bureau ${factNum(k)} fois (une par ordre) ; la bonne réponse est ${arr(n, k)}/${factNum(k)} = ${binom(n, k)}.`,
  );
}

function pascalProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve combinatoire de " + m(L`\binom{n}{k}=\binom{n-1}{k-1}+\binom{n-1}{k}`) + ".",
    [
      "On fixe un élément $e$ de l'ensemble à $n$ éléments et on compte les parties à $k$ éléments.",
      "Celles qui contiennent $e$ : on choisit les $k-1$ autres parmi $n-1$, soit $\\binom{n-1}{k-1}$.",
      "Celles qui ne contiennent pas $e$ : on choisit les $k$ éléments parmi $n-1$, soit $\\binom{n-1}{k}$.",
      "Ces deux familles forment une partition des parties à $k$ éléments : on additionne.",
    ],
    ["Celles qui contiennent $e$ : $\\binom{n-1}{k}$.", "Ces deux familles se recoupent : on multiplie."],
  );
}

function wordsGuided(): RawQuestion {
  const s = ri(3, 5), l = ri(3, 5);
  return Guided(
    `Combien de mots de ${l} lettres écrits avec un alphabet de ${s} lettres (dont la lettre A) contiennent AU MOINS un A ?`,
    [
      gn(`Combien de mots de ${l} lettres au total ?`, Fr(s ** l), [`${l} positions, chacune ${s} choix.`], `${s}^${l} = ${s ** l}.`),
      gn("Combien n'ont AUCUN A ?", Fr((s - 1) ** l), [`Chaque position a ${s - 1} choix (tout sauf A).`], `${s - 1}^${l} = ${(s - 1) ** l}.`),
      gn("Combien ont au moins un A ?", Fr(s ** l - (s - 1) ** l), ["Total moins ceux sans A."], `${s ** l} − ${(s - 1) ** l} = ${s ** l - (s - 1) ** l}.`),
    ],
    "« Au moins un » : on passe au complémentaire (aucun), presque toujours plus simple.",
  );
}

export const level: Level = {
  id: "ITP4",
  name: "Dénombrement",
  fiche: "TD4–TD6",
  icon: "🎲",
  color: "#6a4c93",
  gens: [["anagrams", anagrams], ["committee", committee], ["codes", codes], ["diagonals", diagonals], ["inclusion", inclusion], ["facts", facts], ["ordered-bug", orderedBug], ["pascal-proof", pascalProof], ["words-guided", wordsGuided]],
  piege: "L'ordre compte-t-il ? Oui → arrangements/produit ; non → combinaisons. « Au moins un » → complémentaire.",
  rappel: [
    "Permutations : n!. Arrangements : A(n,k) = n!/(n−k)!. Combinaisons : C(n,k) = n!/(k!(n−k)!).",
    "Avec répétitions : nᵏ mots de longueur k. Anagrammes : n!/(m₁!·m₂!…).",
    "Inclusion–exclusion : |A ∪ B| = |A| + |B| − |A ∩ B|.",
    "Pascal : C(n,k) = C(n−1,k−1) + C(n−1,k) ; Σ C(n,k) = 2ⁿ.",
  ],
};
