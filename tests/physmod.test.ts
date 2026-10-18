import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab } from "./texeval";

const CI = 4;
const N = 200;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
const fr = (s: string): number => Number(s.replace(",", "."));
function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

describe("Physique moderne — recoupements", () => {
  it("E = 1240/λ", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 0);
      expect(fval(q.ans)).toBeCloseTo(1240 / Number(grab(/(\d+) nm/, q.q)[1]), 9);
    }
  });
  it("Ec = hc/λ − W (positive)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 1);
      const W = fr(grab(/W = ([\d,]+) eV/, q.q)[1] as string);
      const l = Number(grab(/(\d+) nm/, q.q)[1]);
      expect(fval(q.ans)).toBeGreaterThan(0);
      expect(fval(q.ans)).toBeCloseTo(1240 / l - W, 9);
    }
  });
  it("λ seuil = hc/W", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 2);
      expect(fval(q.ans)).toBeCloseTo(1240 / fr(grab(/W = ([\d,]+) eV/, q.q)[1] as string), 9);
    }
  });
  it("facteurs de de Broglie et de confinement", () => {
    for (let t = 0; t < N; t++) {
      const a = num(1, 0);
      const k2 = Number(grab(/(\d+) fois plus massive/, a.q)[1]);
      expect(fval(a.ans) ** 2).toBeCloseTo(k2, 9);
      const c = num(1, 3);
      const k = Number(grab(/facteur (\d+)\./, c.q)[1]);
      expect(fval(c.ans)).toBeCloseTo(((1 / k) ** -2), 9);
    }
  });
  it("dimension de ψ : ∫|ψ|²d^dr sans dimension ⇒ p = −d/2", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 2);
      const d = Number(grab(/d\^\{(\d)\}r/, q.q)[1]);
      expect(fval(q.ans) * 2).toBeCloseTo(-d, 9);
    }
  });
  it("puits : E_n, transitions, nœuds", () => {
    for (let t = 0; t < N; t++) {
      const e = num(2, 0);
      const E1 = fr(grab(/= ([\d,]+) eV/, e.q)[1] as string);
      const n = Number(grab(/n = (\d+) \?/, e.q)[1]);
      expect(fval(e.ans)).toBeCloseTo(n * n * E1, 9);
      const d = num(2, 1);
      const E1b = fr(grab(/= ([\d,]+) eV/, d.q)[1] as string);
      const g = /niveau n = (\d+) au niveau n = (\d+)/.exec(d.q) as RegExpExecArray;
      const hi = Number(g[1]), lo = Number(g[2]);
      expect(hi).toBeGreaterThan(lo);
      expect(fval(d.ans)).toBeCloseTo((hi * hi - lo * lo) * E1b, 9);
      const z = num(2, 4);
      const nn = Number(grab(/n = (\d+) du/, z.q)[1]);
      let sc = 0, prev = 1;
      for (let i = 1; i < 1000; i++) {
        const v = Math.sin((nn * Math.PI * (i + 0.5)) / 1000);
        if (v * prev < 0) sc++;
        prev = v;
      }
      expect(fval(z.ans)).toBe(sc);
    }
  });
  it("normalisation et probabilité par Simpson", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 2);
      const a = Number(grab(/a = (\d+) m/, q.q)[1]);
      const sin = q.q.includes("sin");
      const A2 = fval(q.ans);
      const tot = simpson((x) => A2 * (sin ? Math.sin(Math.PI * x / a) ** 2 : 1), 0, a);
      expect(tot).toBeCloseTo(1, 6);
      const p = num(2, 3);
      const n = Number(grab(/état n = (\d+)/, p.q)[1]);
      const j = Number(grab(/\\frac\{(\d+)a\}/, p.q)[1]);
      const P = simpson((x) => 2 * Math.sin(n * Math.PI * x) ** 2, 0, j / (2 * n));
      expect(fval(p.ans)).toBeCloseTo(P, 6);
    }
  });
  it("problème guidé du puits : la dernière étape est bien hc/(8E1)", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 2, 8);
      if (q.k !== "guided") throw new Error();
      const E1 = fr(grab(/= ([\d,]+) eV/, q.q)[1] as string);
      const last = q.steps[3]!.ans;
      if (last.k !== "num") throw new Error();
      expect(fval(last.ans)).toBeCloseTo(1240 / (8 * E1), 9);
    }
  });
});
