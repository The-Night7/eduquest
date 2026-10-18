import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { fval } from "../src/core/fraction";
import { avlOf, bstOf, height, inorder, isBalanced, leaves, postorder, preorder } from "../src/core/trees";
import type { Question } from "../src/types";
import { grab } from "./texeval";

const CI = 7;
const N = 200;
const ints = (s: string): number[] => s.split(",").map((x) => Number(x.trim()));
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};

/** ABR « à plat » indépendant : tableaux parent/gauche/droit, sans récursion. */
function flat(keys: number[]) {
  const L = new Map<number, number>(), R = new Map<number, number>();
  for (let i = 1; i < keys.length; i++) {
    let c = keys[0] as number;
    for (;;) {
      const side = (keys[i] as number) < c ? L : R;
      const nx = side.get(c);
      if (nx === undefined) { side.set(c, keys[i] as number); break; }
      c = nx;
    }
  }
  let depthMax = 0;
  const stack: Array<[number, number]> = [[keys[0] as number, 0]];
  let leafCount = 0;
  while (stack.length) {
    const [k, d] = stack.pop() as [number, number];
    depthMax = Math.max(depthMax, d);
    const l = L.get(k), r = R.get(k);
    if (l === undefined && r === undefined) leafCount++;
    if (l !== undefined) stack.push([l, d + 1]);
    if (r !== undefined) stack.push([r, d + 1]);
  }
  return { h: depthMax, leaves: leafCount };
}

describe("Informatique 3 — recoupements", () => {
  it("piles et files : rejeu indépendant", () => {
    for (let t = 0; t < N; t++) {
      const s = num(0, 0);
      const ops = grab(/: `(.*?)`\./, s.q)[1] as string;
      const st: number[] = [];
      let last = -1;
      for (const o of ops.split(", ")) {
        const m = /push\((\d)\)/.exec(o);
        if (m) st.push(Number(m[1])); else last = st.pop() as number;
      }
      expect(fval(s.ans)).toBe(s.q.includes("sommet") ? st[st.length - 1] : last);
      const f = num(0, 1);
      const ops2 = grab(/: `(.*?)`\./, f.q)[1] as string;
      const q: number[] = [];
      let out = -1;
      for (const o of ops2.split(", ")) {
        const m = /enfiler\((\d)\)/.exec(o);
        if (m) q.push(Number(m[1])); else out = q.splice(0, 1)[0] as number;
      }
      expect(fval(f.ans)).toBe(f.q.includes("tête") ? q[0] : out);
    }
  });
  it("postfixe : équivalent infixe évalué par JS", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 2);
      const [a, b, c, o1, o2] = (grab(/`(\d) (\d) (\d) (\S) (\S)`/, q.q) as unknown as string[]).slice(1);
      // a b c o1 o2  ≡  a o2 (b o1 c)
      expect(fval(q.ans)).toBe(Function(`return ${a} ${o2} (${b} ${o1} ${c});`)());
    }
  });
  it("hauteur et feuilles d'un ABR : recoupement non récursif", () => {
    for (let t = 0; t < N; t++) {
      const h = num(1, 0);
      const ks = ints(grab(/: `(.*?)`\./, h.q)[1] as string);
      expect(fval(h.ans)).toBe(flat(ks).h);
      const l = num(1, 1);
      const ks2 = ints(grab(/: `(.*?)`\./, l.q)[1] as string);
      expect(fval(l.ans)).toBe(flat(ks2).leaves);
    }
  });
  it("parcours : infixe trié, bonne réponse présente une seule fois", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 1, 2);
      if (q.k !== "qcm") throw new Error();
      const ks = ints(grab(/`(.*?)`/, q.q)[1] as string);
      const tr = bstOf(ks);
      expect(inorder(tr)).toEqual([...ks].sort((a, b) => a - b));
      const want = q.q.includes("préfixe") ? preorder(tr) : postorder(tr);
      expect(ints(q.o[q.a] as string)).toEqual(want);
      expect(new Set(q.o).size).toBe(q.o.length);
    }
  });
  it("AVL : équilibré, ordonné, hauteur ≤ 1,45·log2(n+2)", () => {
    for (let t = 0; t < N; t++) {
      const n = 3 + Math.floor(Math.random() * 25);
      const ks = Array.from({ length: n }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      const { tree } = avlOf(ks);
      expect(isBalanced(tree)).toBe(true);
      expect(inorder(tree)).toEqual([...ks].sort((a, b) => a - b));
      expect(height(tree)).toBeLessThanOrEqual(1.4405 * Math.log2(n + 2));
      expect(leaves(tree)).toBeGreaterThan(0);
    }
  });
  it("AVL : suites triées → racine au milieu, et nombres minimaux de nœuds (Fibonacci)", () => {
    expect(avlOf([1, 2, 3]).tree?.key).toBe(2);
    expect(avlOf([3, 2, 1]).tree?.key).toBe(2);
    expect(avlOf([3, 1, 2]).tree?.key).toBe(2);
    expect(avlOf([1, 3, 2]).tree?.key).toBe(2);
    expect(avlOf([1, 2, 3]).rotations).toBe(1);
    expect(avlOf([3, 1, 2]).rotations).toBe(2);
    for (let t = 0; t < 50; t++) {
      const q = num(2, 3);
      const h = Number(grab(/hauteur (\d)/, q.q)[1]);
      const N: number[] = [1, 2];
      for (let i = 2; i <= h; i++) N[i] = 1 + N[i - 1]! + N[i - 2]!;
      expect(fval(q.ans)).toBe(N[h]);
    }
  });
});
