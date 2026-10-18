import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab, texFn } from "./texeval";

const CI = 5;
const N = 200;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

describe("Électromagnétisme — recoupements", () => {
  it("point d'annulation : le champ total y est bien nul", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 1);
      const k2 = Number(grab(/\$(\d+)q\$ en/, q.q)[1]);
      const d = Number(grab(/x=(\d+)\}?\$ \(cm\)/, q.q)[1]);
      const x = fval(q.ans);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(d);
      expect(1 / (x * x) - k2 / ((d - x) ** 2)).toBeCloseTo(0, 9);
    }
  });
  it("charge de la boule : intégrale numérique de ρ·4πr²", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 2);
      const p = Number(grab(/\)\^\{(\d)\}/, q.q)[1]);
      const Q = simpson((r) => r ** p * 4 * Math.PI * r * r, 0, 1);
      expect(fval(q.ans) * Math.PI).toBeCloseTo(Q, 8);
    }
  });
  it("Gauss : exposant de E(r) à l'intérieur (différences finies sur Q_int/r²)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 0);
      const p = Number(grab(/\)\^\{(\d)\}/, q.q)[1]);
      const E = (r: number) => simpson((u) => u ** p * 4 * Math.PI * u * u, 0, r, 400) / (4 * Math.PI * r * r);
      const s = Math.log(E(0.8) / E(0.4)) / Math.log(2);
      expect(fval(q.ans)).toBeCloseTo(s, 6);
    }
  });
  it("E = −∇V par différences finies sur le LaTeX affiché", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 0);
      const V = texFn(grab(/V\(x,y,z\)=(.*?)\$/, q.q)[1] as string, ["x", "y", "z"]);
      const comp = grab(/composante \$E_(\w)\$/, q.q)[1] as string;
      const pt = grab(/\$\((-?\d+),(-?\d+),(-?\d+)\)\$/, q.q).slice(1, 4).map(Number) as [number, number, number];
      const i = "xyz".indexOf(comp);
      const h = 1e-4;
      const a = [...pt], b = [...pt];
      a[i] = (a[i] as number) + h;
      b[i] = (b[i] as number) - h;
      const dV = (V(...(a as [number, number, number])) - V(...(b as [number, number, number]))) / (2 * h);
      expect(fval(q.ans)).toBeCloseTo(-dV, 5);
    }
  });
  it("condensateurs en série et en parallèle", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 1);
      const m = /(\d+) µF et (\d+) µF/.exec(q.q);
      if (!m) continue;
      const [c1, c2] = [Number(m[1]), Number(m[2])];
      expect(fval(q.ans)).toBeCloseTo(q.q.includes("série") ? 1 / (1 / c1 + 1 / c2) : c1 + c2, 9);
    }
  });
  it("problème guidé du condensateur : la tension et l'énergie suivent Q fixée", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 2, 6);
      if (q.k !== "guided") throw new Error();
      const k = Number(grab(/multiplie la distance entre ses armatures par (\d+)/, q.q)[1]);
      const get = (i: number) => { const a = q.steps[i]!.ans; if (a.k !== "num") throw new Error(); return fval(a.ans); };
      const C = 1 / k;
      expect(get(1)).toBeCloseTo(C, 9);
      expect(get(2)).toBeCloseTo(1 / C, 9);
      expect(get(3)).toBeCloseTo(1 / C, 9); // U = QV/2, Q fixée
    }
  });
});
