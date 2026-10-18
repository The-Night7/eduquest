/** Arbres binaires de recherche et AVL (sans mutation) pour fabriquer des exercices vérifiables. */
export interface Node {
  key: number;
  left: Node | null;
  right: Node | null;
}
export const leaf = (key: number): Node => ({ key, left: null, right: null });

export function bstInsert(t: Node | null, key: number): Node {
  if (!t) return leaf(key);
  return key < t.key ? { ...t, left: bstInsert(t.left, key) } : { ...t, right: bstInsert(t.right, key) };
}
export const bstOf = (keys: readonly number[]): Node | null => keys.reduce<Node | null>((t, k) => bstInsert(t, k), null);

/** Hauteur : nombre d'arêtes du plus long chemin (arbre vide : −1, feuille : 0). */
export const height = (t: Node | null): number => (t ? 1 + Math.max(height(t.left), height(t.right)) : -1);
export const size = (t: Node | null): number => (t ? 1 + size(t.left) + size(t.right) : 0);
export const leaves = (t: Node | null): number => (!t ? 0 : !t.left && !t.right ? 1 : leaves(t.left) + leaves(t.right));
export const inorder = (t: Node | null): number[] => (t ? [...inorder(t.left), t.key, ...inorder(t.right)] : []);
export const preorder = (t: Node | null): number[] => (t ? [t.key, ...preorder(t.left), ...preorder(t.right)] : []);
export const postorder = (t: Node | null): number[] => (t ? [...postorder(t.left), ...postorder(t.right), t.key] : []);
export const bfs = (t: Node | null): number[] => {
  const out: number[] = [];
  const q: Node[] = t ? [t] : [];
  while (q.length) {
    const n = q.shift() as Node;
    out.push(n.key);
    if (n.left) q.push(n.left);
    if (n.right) q.push(n.right);
  }
  return out;
};
export const balance = (t: Node | null): number => (t ? height(t.left) - height(t.right) : 0);

const rotR = (t: Node): Node => {
  const l = t.left as Node;
  return { ...l, right: { ...t, left: l.right } };
};
const rotL = (t: Node): Node => {
  const r = t.right as Node;
  return { ...r, left: { ...t, right: r.left } };
};

export type Case = "LL" | "RR" | "LR" | "RL";
export interface AvlStep {
  tree: Node;
  rotations: number; // rotations simples effectuées (une double = 2)
  cases: Case[];
}
/** Insertion AVL ; renvoie l'arbre, le nombre de rotations simples et les cas rencontrés. */
export function avlInsert(t: Node | null, key: number): AvlStep {
  if (!t) return { tree: leaf(key), rotations: 0, cases: [] };
  const goLeft = key < t.key;
  const sub = avlInsert(goLeft ? t.left : t.right, key);
  let n: Node = goLeft ? { ...t, left: sub.tree } : { ...t, right: sub.tree };
  let rotations = sub.rotations;
  const cases = [...sub.cases];
  const b = balance(n);
  if (b > 1) {
    if (balance(n.left) >= 0) { n = rotR(n); rotations += 1; cases.push("LL"); }
    else { n = rotR({ ...n, left: rotL(n.left as Node) }); rotations += 2; cases.push("LR"); }
  } else if (b < -1) {
    if (balance(n.right) <= 0) { n = rotL(n); rotations += 1; cases.push("RR"); }
    else { n = rotL({ ...n, right: rotR(n.right as Node) }); rotations += 2; cases.push("RL"); }
  }
  return { tree: n, rotations, cases };
}
export function avlOf(keys: readonly number[]): { tree: Node | null; rotations: number; cases: Case[] } {
  let tree: Node | null = null, rotations = 0;
  const cases: Case[] = [];
  for (const k of keys) {
    const s = avlInsert(tree, k);
    tree = s.tree; rotations += s.rotations; cases.push(...s.cases);
  }
  return { tree, rotations, cases };
}
export const isBalanced = (t: Node | null): boolean => !t || (Math.abs(balance(t)) <= 1 && isBalanced(t.left) && isBalanced(t.right));
