// Informatique 3 · niveau 3 : arbres AVL
import { Fr } from "../../core/fraction";
import { pick, ri, shuffle } from "../../core/rng";
import { avlOf, balance, bstOf, height, preorder, type Case, type Node } from "../../core/trees";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { code } from "./util";

const keys = (n: number): number[] => shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, n);
const seq = (a: readonly number[]): string => a.join(", ");

function rootAfter(): RawQuestion {
  const ks = keys(ri(5, 7));
  const { tree } = avlOf(ks);
  return Num(
    `On insère ${code(seq(ks))} dans cet ordre dans un AVL initialement vide. Quelle est la clé de la racine à la fin ?`,
    Fr((tree as Node).key),
    `On rééquilibre dès que |facteur d'équilibre| = 2. Racine finale : ${(tree as Node).key}. (Hauteur ${height(tree)}, parcours préfixe : ${seq(preorder(tree))}.)`,
  );
}

function rotationCount(): RawQuestion {
  const ks = keys(ri(5, 7));
  const r = avlOf(ks);
  return Num(
    `On insère ${code(seq(ks))} dans un AVL. Combien de rotations SIMPLES sont effectuées au total (une rotation double compte pour 2) ?`,
    Fr(r.rotations),
    `Cas rencontrés dans l'ordre : ${r.cases.length ? r.cases.join(", ") : "aucun"}. Simple (LL, RR) = 1 rotation ; double (LR, RL) = 2.`,
  );
}

function rotationCase(): RawQuestion {
  const [a, b, c] = [...new Set(keys(3))].sort((x, y) => x - y) as [number, number, number];
  const orders: Array<[number[], Case]> = [
    [[c, b, a], "LL"], [[a, b, c], "RR"], [[c, a, b], "LR"], [[a, c, b], "RL"],
  ];
  const [ins, cas] = pick(orders);
  const names: Case[] = ["LL", "RR", "LR", "RL"];
  const labels = {
    LL: "Déséquilibre gauche-gauche : rotation droite",
    RR: "Déséquilibre droite-droite : rotation gauche",
    LR: "Gauche-droite : rotation gauche du fils gauche puis rotation droite",
    RL: "Droite-gauche : rotation droite du fils droit puis rotation gauche",
  };
  return Qcm(
    `On insère ${code(seq(ins))} dans un AVL vide. Quel rééquilibrage est nécessaire à la 3ᵉ insertion ?`,
    names.map((n) => labels[n]),
    names.indexOf(cas),
    `Chaîne ${seq(ins)} : le nœud déséquilibré est ${ins[0]}, ${cas === "LL" || cas === "RR" ? "le déséquilibre va dans le même sens que celui du fils" : "le fils penche dans le sens opposé : il faut d'abord le redresser"}. Cas ${cas}.`,
    false,
  );
}

function minNodes(): RawQuestion {
  const h = ri(1, 6);
  const N: number[] = [1, 2];
  for (let i = 2; i <= h; i++) N[i] = 1 + (N[i - 1] as number) + (N[i - 2] as number);
  return Num(
    `Quel est le nombre MINIMAL de nœuds d'un AVL de hauteur ${h} (feuille seule = 0) ? (N₀ = 1, N₁ = 2)`,
    Fr(N[h] as number),
    `N_h = 1 + N_{h−1} + N_{h−2} (un fils de hauteur h−1, l'autre h−2, au minimum) : ${N.slice(0, h + 1).join(", ")}.`,
  );
}

const concepts = poolVF([
  { q: "Dans un AVL, le facteur d'équilibre de chaque nœud est −1, 0 ou 1.", t: true, e: "|h(gauche) − h(droite)| ≤ 1 en tout nœud." },
  { q: "La recherche dans un AVL est en O(log n) au pire.", t: true, e: "La hauteur d'un AVL est O(log n)." },
  { q: "Une rotation ne modifie pas l'ordre infixe.", t: true, e: "C'est ce qui garantit qu'on conserve un ABR." },
  { q: "Un AVL est toujours un arbre binaire complet.", t: false, e: "Seule la différence de hauteur est contrainte, pas le remplissage des niveaux." },
  { q: "Une insertion dans un AVL peut nécessiter plusieurs rotations simples successives en remontant jusqu'à la racine.", t: false, e: "Pour l'insertion, un seul rééquilibrage (simple ou double) suffit ; c'est la suppression qui peut en demander O(log n)." },
  { q: "Dans un AVL, l'insertion se fait comme dans un ABR, puis on remonte en corrigeant.", t: true, e: "Insertion ABR + mise à jour des hauteurs + rotation au premier nœud déséquilibré." },
]);

function lrBug(): RawQuestion {
  return Bug(
    "Cas gauche-droite (LR) : le nœud " + "`z`" + " a un facteur d'équilibre +2 et son fils gauche `y` penche à droite. Une ligne est fausse.",
    [
      "z est déséquilibré à gauche (facteur +2).",
      "Son fils gauche y a un facteur −1 : le déséquilibre est de type gauche-droite.",
      "Une seule rotation droite sur z suffit à rétablir l'équilibre.",
      "Sinon : rotation gauche sur y puis rotation droite sur z.",
    ],
    2,
    [
      "Une seule rotation droite sur z ne suffit pas : elle déplacerait simplement le déséquilibre.",
      "Une rotation gauche sur z suffit.",
      "Une rotation gauche sur y suffit.",
    ],
    "Dans le cas LR, la rotation droite simple sur z laisse un déséquilibre : il faut d'abord redresser y (rotation gauche), puis tourner z à droite.",
  );
}

function rotOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre l'insertion d'une clé dans un AVL.",
    [
      "Insérer la clé comme dans un ABR, en descendant jusqu'à la place libre.",
      "Remonter vers la racine en recalculant la hauteur de chaque ancêtre.",
      "Au premier ancêtre de facteur d'équilibre ±2, identifier le cas (LL, RR, LR ou RL).",
      "Appliquer la rotation simple ou double correspondante : l'arbre est de nouveau équilibré.",
    ],
    ["Rééquilibrer d'abord, puis insérer.", "Reconstruire entièrement l'arbre à partir de la liste triée."],
    "Rééquilibrage a posteriori, au premier nœud fautif en remontant.",
  );
}

function avlGuided(): RawQuestion {
  const ks = keys(5);
  const r = avlOf(ks);
  const bst = bstOf(ks);
  return Guided(
    `On insère ${code(seq(ks))} dans cet ordre, d'abord dans un ABR simple, puis dans un AVL.`,
    [
      gn("Quelle est la hauteur de l'ABR simple ?", Fr(height(bst)), ["Longueur du plus long chemin."], `Hauteur ${height(bst)}.`),
      gq(
        "L'ABR obtenu est-il un AVL ?",
        ["Oui, tous les facteurs d'équilibre sont dans {−1, 0, 1}", "Non, un nœud a un facteur d'équilibre de module ≥ 2"],
        ["Teste chaque nœud : |h(G) − h(D)| ≤ 1 ?"],
        "L'ABR est un AVL si tous les facteurs d'équilibre valent −1, 0 ou 1.",
      ),
      gn("Combien de rotations simples l'AVL effectue-t-il (double = 2) ?", Fr(r.rotations), ["Compte au fil des insertions."], `Cas rencontrés : ${r.cases.length ? r.cases.join(", ") : "aucun"} ⇒ ${r.rotations}.`),
      gn("Quelle est la clé de la racine de l'AVL final ?", Fr((r.tree as Node).key), ["Elle peut avoir changé avec les rotations."], `Racine : ${(r.tree as Node).key}.`),
    ],
    `Hauteur finale de l'AVL : ${height(r.tree)}. Facteur d'équilibre de la racine : ${balance(r.tree)}.`,
  );
}

export const level: Level = {
  id: "DS3",
  name: "Arbres AVL",
  fiche: "Structures de données",
  icon: "⚖️",
  color: "#1b4332",
  gens: [
    ["root", rootAfter], ["rotations", rotationCount], ["case", rotationCase], ["minN", minNodes],
    ["concepts", concepts], ["lr-bug", lrBug], ["avl-order", rotOrder], ["avl-guided", avlGuided],
  ],
  piege: "Cas LR/RL = rotation DOUBLE (d'abord sur le fils). Une insertion AVL demande au plus un rééquilibrage.",
  rappel: [
    "AVL : |h(G) − h(D)| ≤ 1 en tout nœud ; hauteur O(log n) ⇒ recherche, insertion, suppression en O(log n).",
    "LL → rotation droite ; RR → rotation gauche ; LR → gauche sur le fils puis droite ; RL → droite sur le fils puis gauche.",
    "Nombre minimal de nœuds : N_h = 1 + N_{h−1} + N_{h−2}.",
  ],
};
