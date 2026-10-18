// Informatique 3 · niveau 1 : listes, piles, files
import { Fr } from "../../core/fraction";
import { pick, ri, shuffle } from "../../core/rng";
import { code } from "./util";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolVF } from "../factories";

function stackOps(): RawQuestion {
  const vals = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  const st: number[] = [];
  const ops: string[] = [];
  let popped = -1;
  for (const v of vals) {
    st.push(v);
    ops.push(`push(${v})`);
    if (ops.length === 2 || ops.length === 5) { popped = st.pop() as number; ops.push("pop()"); }
  }
  if (ops.length < 6) { popped = st.pop() as number; ops.push("pop()"); }
  const askTop = ri(0, 1) === 0;
  const lastPop = popped;
  return Num(
    `Une pile initialement vide subit : ${code(ops.join(", "))}. ${askTop ? "Quelle valeur est au sommet à la fin ?" : "Quelle valeur renvoie le DERNIER pop() ?"}`,
    Fr(askTop ? (st[st.length - 1] as number) : lastPop),
    "Pile = LIFO : le dernier entré est le premier sorti. On rejoue les opérations une à une.",
  );
}

function queueOps(): RawQuestion {
  const vals = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
  const q: number[] = [];
  const ops: string[] = [];
  let out = -1;
  vals.forEach((v, i) => {
    q.push(v);
    ops.push(`enfiler(${v})`);
    if (i === 1 || i === 3) { out = q.shift() as number; ops.push("défiler()"); }
  });
  const askFront = ri(0, 1) === 0;
  return Num(
    `Une file initialement vide subit : ${code(ops.join(", "))}. ${askFront ? "Quelle valeur est en tête de file à la fin ?" : "Quelle valeur renvoie le DERNIER défiler() ?"}`,
    Fr(askFront ? (q[0] as number) : out),
    "File = FIFO : le premier entré est le premier sorti.",
  );
}

function postfix(): RawQuestion {
  const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), op1 = pick(["+", "-", "*"]), op2 = pick(["+", "-", "*"]);
  const ap = (x: number, y: number, o: string) => (o === "+" ? x + y : o === "-" ? x - y : x * y);
  const val = ap(a, ap(b, c, op1), op2);
  return Num(
    `Quelle est la valeur de l'expression postfixée ${code(`${a} ${b} ${c} ${op1} ${op2}`)} évaluée avec une pile ?`,
    Fr(val),
    `On empile ${a}, ${b}, ${c} ; « ${op1} » dépile ${c} et ${b} (ordre : ${b} ${op1} ${c} = ${ap(b, c, op1)}) puis « ${op2} » combine ${a} et ${ap(b, c, op1)} : ${val}.`,
  );
}

const complexity = poolVF([
  { q: "Accéder au k-ième élément d'un tableau est en O(1).", t: true, e: "Adressage direct par indice." },
  { q: "Accéder au k-ième élément d'une liste chaînée simple est en O(1).", t: false, e: "Il faut parcourir k maillons : O(k) donc O(n) au pire." },
  { q: "Insérer en tête d'une liste chaînée simple est en O(1).", t: true, e: "Un seul pointeur à modifier." },
  { q: "Insérer au milieu d'un tableau (sans espace libre) est en O(1).", t: false, e: "Il faut décaler les éléments suivants : O(n)." },
  { q: "Dans une pile, push et pop se font en O(1).", t: true, e: "On n'agit qu'au sommet." },
  { q: "Une pile suit la discipline FIFO.", t: false, e: "Pile = LIFO ; file = FIFO." },
  { q: "Une liste doublement chaînée permet de supprimer un maillon connu en O(1).", t: true, e: "Il a un pointeur vers son prédécesseur." },
  { q: "Rechercher une valeur dans une liste chaînée non triée est en O(log n).", t: false, e: "Parcours séquentiel : O(n)." },
]);

function reverseBug(): RawQuestion {
  return Bug(
    "On inverse une liste chaînée simple (`prec`, `cour`). Une ligne est fausse.",
    [
      "prec ← NIL ; cour ← tête",
      "tant que cour ≠ NIL :",
      "    cour.suivant ← prec ; prec ← cour ; cour ← cour.suivant",
      "tête ← prec",
    ],
    2,
    [
      "    suiv ← cour.suivant ; cour.suivant ← prec ; prec ← cour ; cour ← suiv",
      "    prec ← cour ; cour.suivant ← prec ; cour ← cour.suivant",
      "    cour.suivant ← NIL ; prec ← cour ; cour ← cour.suivant",
    ],
    "On écrase cour.suivant avant de le sauvegarder : on perd le reste de la liste. Il faut mémoriser suiv ← cour.suivant d'abord.",
  );
}

function reverseOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre les étapes de l'insertion d'un maillon `x` après le maillon `p` dans une liste simplement chaînée.",
    [
      "Créer le maillon x avec sa valeur.",
      "x.suivant ← p.suivant (x pointe vers l'ancien successeur).",
      "p.suivant ← x (p pointe vers x).",
      "La liste contient désormais p → x → ancien successeur.",
    ],
    ["p.suivant ← x avant d'avoir copié p.suivant dans x.", "Parcourir toute la liste jusqu'à la fin avant d'insérer."],
    "L'ordre compte : si l'on fait p.suivant ← x en premier, on perd l'accès à l'ancien successeur.",
  );
}

function postfixGuided(): RawQuestion {
  const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9);
  const op1 = pick(["+", "*"]);
  const t1 = op1 === "+" ? b + c : b * c;
  return Guided(
    `Évaluer ${code(`${a} ${b} ${c} ${op1} -`)} avec une pile.`,
    [
      gq("Que contient la pile (du bas vers le sommet) après avoir lu les trois premiers nombres ?", [`${a}, ${b}, ${c}`, `${a}, ${b + c}`, `${a + b + c}`, `${a}, ${b}`], ["Un nombre = on empile."], "On empile dans l'ordre de lecture ; le sommet est donc le dernier lu."),
      gn(`On lit « ${op1} » : quelle valeur est empilée ?`, Fr(t1), [`On dépile ${c} puis ${b}.`], `${b} ${op1} ${c} = ${t1}.`),
      gn("On lit « - » : quel est le résultat final ?", Fr(a - t1), ["Dépile d'abord le sommet (opérande de droite), puis l'autre (gauche) : gauche − droite."], `${a} − ${t1} = ${a - t1}.`),
    ],
    "Postfixe : le premier dépilé est l'opérande de DROITE. Piège classique pour - et /.",
  );
}

export const level: Level = {
  id: "DS1",
  name: "Listes, piles, files",
  fiche: "Structures de données",
  icon: "📚",
  color: "#06d6a0",
  gens: [
    ["stack", stackOps], ["queue", queueOps], ["postfix", postfix], ["complexity", complexity],
    ["reverse-bug", reverseBug], ["insert-order", reverseOrder], ["postfix-guided", postfixGuided],
  ],
  piege: "Postfixe : le premier dépilé est l'opérande de droite. Liste chaînée : sauvegarder le suivant avant d'écraser un pointeur.",
  rappel: [
    "Pile LIFO (push/pop en O(1)) ; file FIFO (enfiler/défiler en O(1)).",
    "Tableau : accès O(1), insertion O(n). Liste chaînée : insertion en tête O(1), accès O(n).",
  ],
};
