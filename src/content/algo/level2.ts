// Informatique 3 · niveau 2 : arbres binaires de recherche
import { Fr } from "../../core/fraction";
import { pick, ri, shuffle } from "../../core/rng";
import { bstOf, height, inorder, leaves, postorder, preorder, bfs, type Node } from "../../core/trees";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { code } from "./util";

const keys = (n: number): number[] => shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, n);
const seq = (a: readonly number[]): string => a.join(", ");

function heightQ(): RawQuestion {
  const ks = keys(ri(6, 8));
  const t = bstOf(ks);
  return Num(
    `On insère dans cet ordre, dans un ABR initialement vide : ${code(seq(ks))}. Quelle est la hauteur de l'arbre (feuille seule = 0) ?`,
    Fr(height(t)),
    `Chaque clé descend jusqu'à sa place (petit à gauche, grand à droite). Hauteur = nombre d'arêtes du plus long chemin racine → feuille = ${height(t)}.`,
  );
}

function leavesQ(): RawQuestion {
  const ks = keys(ri(6, 8));
  const t = bstOf(ks);
  return Num(
    `On insère dans cet ordre, dans un ABR initialement vide : ${code(seq(ks))}. Combien l'arbre a-t-il de feuilles ?`,
    Fr(leaves(t)),
    `Une feuille est un nœud sans fils. Ici : ${leaves(t)}.`,
  );
}

function traversal(): RawQuestion {
  const ks = keys(6);
  const t = bstOf(ks) as Node;
  const which = pick(["préfixe", "postfixe"] as const);
  const good = which === "préfixe" ? preorder(t) : postorder(t);
  const wrongs = [
    which === "préfixe" ? postorder(t) : preorder(t),
    inorder(t),
    bfs(t),
  ].filter((w) => w.join() !== good.join());
  const extra = shuffle([...good]);
  const opts = [good, ...wrongs, extra].map(seq);
  const uniq = [...new Set(opts)].slice(0, 4);
  if (!uniq.includes(seq(good))) uniq[0] = seq(good);
  return Qcm(
    `On insère ${code(seq(ks))} dans un ABR. Quel est le parcours ${which} ?`,
    uniq,
    uniq.indexOf(seq(good)),
    `Préfixe : racine, gauche, droite. Infixe : gauche, racine, droite (clés triées). Postfixe : gauche, droite, racine. Réponse : ${seq(good)}.`,
    true,
  );
}

function sizes(): RawQuestion {
  if (ri(0, 1) === 0) {
    const h = ri(2, 6);
    return Num(`Combien de nœuds au maximum un arbre binaire de hauteur ${h} (feuille seule = 0) peut-il contenir ?`, Fr(2 ** (h + 1) - 1), `1 + 2 + 4 + … + 2^${h} = 2^${h + 1} − 1.`);
  }
  const n = ri(5, 40);
  return Num(`Quelle est la hauteur minimale d'un arbre binaire à ${n} nœuds (feuille seule = 0) ?`, Fr(Math.floor(Math.log2(n))), `Il faut 2^(h+1) − 1 ≥ ${n} : h = ⌊log₂ ${n}⌋ = ${Math.floor(Math.log2(n))}.`);
}

const concepts = poolVF([
  { q: "Le parcours infixe d'un ABR visite les clés dans l'ordre croissant.", t: true, e: "Gauche < racine < droite, récursivement." },
  { q: "Insérer des clés déjà triées dans un ABR produit un arbre équilibré.", t: false, e: "On obtient une chaîne (peigne) de hauteur n−1 : les opérations deviennent O(n)." },
  { q: "La recherche dans un ABR est toujours en O(log n).", t: false, e: "O(h) : O(log n) seulement si l'arbre est équilibré, sinon O(n)." },
  { q: "Le minimum d'un ABR se trouve en descendant toujours à gauche.", t: true, e: "Le plus petit élément est le nœud le plus à gauche." },
  { q: "Dans un ABR, tout élément du sous-arbre droit est supérieur à la racine.", t: true, e: "Propriété d'ordre pour TOUT le sous-arbre, pas seulement pour le fils." },
  { q: "Il suffit que chaque nœud soit supérieur à son fils gauche et inférieur à son fils droit pour avoir un ABR.", t: false, e: "Il faut la condition sur tout le sous-arbre : un petit-fils gauche trop grand viole la propriété." },
]);

function searchBug(): RawQuestion {
  return Bug(
    "Recherche d'une clé `x` dans un ABR. Une ligne est fausse.",
    [
      "rechercher(n, x) :",
      "    si n = NIL : renvoyer faux",
      "    si x = n.clé : renvoyer vrai",
      "    si x < n.clé : renvoyer rechercher(n.droit, x)",
      "    sinon : renvoyer rechercher(n.gauche, x)",
    ],
    3,
    [
      "    si x < n.clé : renvoyer rechercher(n.gauche, x)",
      "    si x < n.clé : renvoyer rechercher(n.gauche, x) ou rechercher(n.droit, x)",
      "    si x > n.clé : renvoyer rechercher(n.gauche, x)",
    ],
    "Les petites clés sont à GAUCHE : si x < n.clé on descend à gauche. (Les deux appels seraient un parcours complet, pas une recherche O(h).)",
  );
}

function insertOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre l'insertion récursive d'une clé `x` dans un ABR.",
    [
      "Si l'arbre est vide, créer et renvoyer un nœud contenant x.",
      "Sinon, comparer x à la clé de la racine.",
      "Si x est plus petit, insérer x dans le sous-arbre gauche et le rattacher.",
      "Sinon, insérer x dans le sous-arbre droit et le rattacher ; renvoyer la racine.",
    ],
    ["Toujours insérer x à la racine en décalant les autres.", "Parcourir l'arbre en largeur pour trouver une place libre."],
    "Cas de base d'abord (arbre vide), puis la comparaison guide la descente.",
  );
}

function bstGuided(): RawQuestion {
  const ks = keys(6);
  const t = bstOf(ks) as Node;
  return Guided(
    `On construit un ABR en insérant ${code(seq(ks))}.`,
    [
      gn("Quelle est la clé de la racine ?", Fr(ks[0] as number), ["La première clé insérée devient la racine."], `La racine est ${ks[0]}.`),
      gn("Quelle est la hauteur de l'arbre ?", Fr(height(t)), ["Compte les arêtes du plus long chemin."], `Hauteur ${height(t)}.`),
      gn("Combien de feuilles ?", Fr(leaves(t)), ["Un nœud sans fils."], `${leaves(t)} feuilles.`),
      gq(
        "Dans quel ordre le parcours infixe visite-t-il les clés ?",
        ["Croissant", "Décroissant", "Ordre d'insertion", "Ordre de hauteur"],
        ["Gauche, racine, droite."],
        "Infixe d'un ABR = clés triées croissantes.",
      ),
    ],
    "Retenir : hauteur ↔ coût des opérations. C'est ce que corrigent les AVL.",
  );
}

export const level: Level = {
  id: "DS2",
  name: "Arbres binaires de recherche",
  fiche: "Structures de données",
  icon: "🌳",
  color: "#2d6a4f",
  gens: [
    ["height", heightQ], ["leaves", leavesQ], ["traversal", traversal], ["sizes", sizes],
    ["concepts", concepts], ["search-bug", searchBug], ["insert-order", insertOrder], ["bst-guided", bstGuided],
  ],
  piege: "ABR trié en entrée = peigne de hauteur n−1. Complexité en O(hauteur), pas O(log n) garanti.",
  rappel: [
    "ABR : gauche < nœud < droite (sur TOUT le sous-arbre). Infixe = tri croissant.",
    "Préfixe : R G D ; infixe : G R D ; postfixe : G D R ; largeur : niveau par niveau.",
    "Hauteur h : au plus 2^(h+1) − 1 nœuds ; au moins ⌊log₂ n⌋ pour n nœuds.",
  ],
};
