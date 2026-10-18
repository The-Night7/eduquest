import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab, texFn } from "./texeval";

const CI = 1; // chapitre Analyse
const N = 300;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
const parseF = (q: string): ((x: number, y: number) => number) => texFn(grab(/f\(x,y\)=([^$]*)\$/, q)[1] as string, ["x", "y"]);
const h = 1e-3;
const dx = (f: (x: number, y: number) => number, x: number, y: number): number => (f(x + h, y) - f(x - h, y)) / (2 * h);
const dy = (f: (x: number, y: number) => number, x: number, y: number): number => (f(x, y + h) - f(x, y - h)) / (2 * h);

describe("Analyse ℝⁿ — recoupements numériques", () => {
  it("N1 : norme ssi aucun vecteur non nul d'annulation (force brute)", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 0, 0);
      if (q.k !== "qcm") throw new Error();
      const m = grab(/N\(x,y\)=\|(.*?)\|\+\|(.*?)\|\$ sur/, q.q);
      const u = texFn(m[1] as string, ["x", "y"]), v = texFn(m[2] as string, ["x", "y"]);
      // N s'annule en un vecteur entier non nul de [-6,6]² ?
      let zero = false;
      for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) if ((x || y) && u(x, y) === 0 && v(x, y) === 0) zero = true;
      expect(q.a).toBe(zero ? 1 : 0);
    }
  });
  it("N1 : aire de la boule unité (comptage de points)", () => {
    for (let t = 0; t < 60; t++) {
      const q = num(0, 1);
      const [a, b] = [Number(grab(/\{(\d)\}/, q.q)[1]), Number(grab(/\{(\d)\}.*\{(\d)\}/, q.q)[2])];
      const diamond = !q.q.includes("max");
      const M = 400, step = 2 * 6 / M;
      let cnt = 0;
      for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
        const x = -6 + (i + 0.5) * step, y = -6 + (j + 0.5) * step;
        const n = diamond ? Math.abs(x) / a + Math.abs(y) / b : Math.max(Math.abs(x) / a, Math.abs(y) / b);
        if (n <= 1) cnt++;
      }
      expect(Math.abs(cnt * step * step - fval(q.ans))).toBeLessThan(0.15 * Math.max(1, fval(q.ans)) * 0.1 + 0.2);
    }
  });
  it("N2 : limite en 0 par échantillonnage polaire", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 1, 0);
      if (q.k !== "qcm") throw new Error();
      const m = grab(/\\frac\{(.*?)\}\{\(x\^2\+y\^2\)(?:\^\{(\d)\})?\}/, q.q);
      const f = texFn(`(${m[1]})/((x*x+y*y)**${m[2] ?? 1})`, ["x", "y"]);
      const sup = (r: number): number => {
        let s = 0;
        for (let k = 0; k < 360; k++) s = Math.max(s, Math.abs(f(r * Math.cos((k * Math.PI) / 180), r * Math.sin((k * Math.PI) / 180))));
        return s;
      };
      // limite 0 ⇔ le sup sur le cercle de rayon r tend vers 0
      const shrinks = sup(1e-3) < 0.5 * sup(1e-2) + 1e-12 && sup(1e-3) < 0.05;
      expect(q.a).toBe(shrinks ? 0 : 1);
    }
  });
  it("N2 : valeur le long de y = mx", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 1);
      const m = grab(/\\frac\{(.*?)\}\{\(x\^2\+y\^2\)(?:\^\{(\d)\})?\}/, q.q);
      const f = texFn(`(${m[1]})/((x*x+y*y)**${m[2] ?? 1})`, ["x", "y"]);
      const raw = grab(/droite \$y=(-?\d*)x\$/, q.q)[1] as string;
      const mm = Number(raw === "" ? "1" : raw);
      expect(f(1e-3, mm * 1e-3)).toBeCloseTo(fval(q.ans), 6);
    }
  });
  it("N3 : dérivées partielles par différences finies", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 0);
      const f = parseF(q.q);
      const [a, b] = [Number(grab(/\((-?\d+),(-?\d+)\)\$\.$/, q.q)[1]), Number(grab(/\((-?\d+),(-?\d+)\)\$\.$/, q.q)[2])];
      const want = fval(q.ans);
      let got: number;
      if (q.q.includes("partial^2 f}{\\partial x\\,\\partial y}")) got = (f(a + h, b + h) - f(a + h, b - h) - f(a - h, b + h) + f(a - h, b - h)) / (4 * h * h);
      else if (q.q.includes("\\partial x^2")) got = (f(a + h, b) - 2 * f(a, b) + f(a - h, b)) / (h * h);
      else if (q.q.includes("\\partial y^2")) got = (f(a, b + h) - 2 * f(a, b) + f(a, b - h)) / (h * h);
      else if (q.q.includes("\\partial f}{\\partial x}")) got = dx(f, a, b);
      else got = dy(f, a, b);
      expect(got).toBeCloseTo(want, 2);
    }
  });
  it("N3 : dérivée directionnelle", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 1);
      const f = parseF(q.q);
      const pt = grab(/au point \$\((-?\d+),(-?\d+)\)\$/, q.q);
      const u = grab(/\\frac\{1\}\{(\d+)\}\((-?\d+),(-?\d+)\)/, q.q);
      const [a, b, n, uu, vv] = [pt[1], pt[2], u[1], u[2], u[3]].map(Number) as [number, number, number, number, number];
      expect(dx(f, a, b) * (uu / n) + dy(f, a, b) * (vv / n)).toBeCloseTo(fval(q.ans), 2);
    }
  });
  it("N3 : composition g = f(x(t), y(t))", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 2);
      const f = parseF(q.q);
      const X = texFn(grab(/x\(t\)=([^$]*)\$/, q.q)[1] as string, ["t"]);
      const Y = texFn(grab(/y\(t\)=([^$]*)\$/, q.q)[1] as string, ["t"]);
      const t0 = Number(grab(/g'\((-?\d+)\)/, q.q)[1]);
      const g = (s: number): number => f(X(s), Y(s));
      const got = (g(t0 + h) - g(t0 - h)) / (2 * h);
      expect(Math.abs(got - fval(q.ans))).toBeLessThan(1e-4 * Math.abs(fval(q.ans)) + 0.01);
    }
  });
  it("N4 : minimum de x²+ay²+bx+cy (recherche entière)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(3, 0);
      const f = texFn(grab(/f\(x,y\)=([^$]*)\$/, q.q)[1] as string, ["x", "y"]);
      let best = Infinity;
      for (let x = -40; x <= 40; x++) for (let y = -40; y <= 40; y++) best = Math.min(best, f(x, y));
      expect(best).toBeCloseTo(fval(q.ans), 9);
    }
  });
  it("N4 : nature du point critique d'une forme quadratique", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 3, 1);
      if (q.k !== "qcm") throw new Error();
      const f = texFn(grab(/f\(x,y\)=([^$]*)\$/, q.q)[1] as string, ["x", "y"]);
      let pos = 0, neg = 0;
      for (let k = 0; k < 720; k++) {
        const v = f(Math.cos((k * Math.PI) / 360), Math.sin((k * Math.PI) / 360));
        if (v > 1e-9) pos++;
        if (v < -1e-9) neg++;
      }
      const kind = pos && neg ? 2 : pos ? 0 : 1;
      expect(q.a).toBe(kind);
    }
  });
  it("N5 : ∬ sur un pavé et sur un triangle (somme de Riemann)", () => {
    for (let t = 0; t < 120; t++) {
      const q = num(4, t % 2);
      const f = texFn(grab(/\\left\((.*)\\right\)dx/, q.q)[1] as string, ["x", "y"]);
      let dom: (x: number) => [number, number], xr: [number, number];
      if (t % 2 === 0) {
        const m = grab(/\[(-?\d+),(-?\d+)\]\\times\[(-?\d+),(-?\d+)\]/, q.q).slice(1).map(Number) as [number, number, number, number];
        xr = [m[0], m[1]];
        dom = () => [m[2], m[3]];
      } else {
        const n = Number(grab(/0\\le x\\le (\d)/, q.q)[1]);
        xr = [0, n];
        if (q.q.includes("0\\le y\\le x")) dom = (x) => [0, x];
        else if (q.q.includes("x\\le y\\le")) dom = (x) => [x, n];
        else dom = (x) => [0, n - x];
      }
      const M = 400;
      let s = 0;
      for (let i = 0; i < M; i++) {
        const x = xr[0] + ((i + 0.5) * (xr[1] - xr[0])) / M;
        const [lo, hi] = dom(x);
        for (let j = 0; j < M; j++) s += f(x, lo + ((j + 0.5) * (hi - lo)) / M) * ((hi - lo) / M) * ((xr[1] - xr[0]) / M);
      }
      expect(s).toBeCloseTo(fval(q.ans), 2);
    }
  });
  it("N5 : intégrale en polaires (coefficient de π)", () => {
    for (let t = 0; t < 120; t++) {
      const q = num(4, 2);
      const R = Math.sqrt(Number(grab(/x\^2\+y\^2\\le (\d+)/, q.q)[1]));
      const k = q.q.includes("^2)^2") ? 2 : q.q.includes("{x^2+y^2}\\,dx") || /\\iint_\{[^}]*\}x\^2\+y\^2/.test(q.q) ? 1 : 0;
      const frac = q.q.includes("x\\ge0") ? 0.25 : q.q.includes("y\\ge0") ? 0.5 : 1;
      let s = 0;
      const M = 20000;
      for (let i = 0; i < M; i++) {
        const r = ((i + 0.5) * R) / M;
        s += Math.pow(r * r, k) * r * (R / M);
      }
      expect((2 * frac * s)).toBeCloseTo(fval(q.ans), 2);
    }
  });

  const steps = (li: number, gi: number): { q: Question & { k: "guided" }; nums: number[] } => {
    const q = build(CI, li, gi);
    if (q.k !== "guided") throw new Error("guidé attendu");
    return { q, nums: q.steps.filter((st) => st.ans.k === "num").map((st) => fval((st.ans as { ans: { n: number; d: number } }).ans)) };
  };
  it("guidé N2 : ∂y f(0,0) = k et reste dans la direction (1,1)", () => {
    for (let t = 0; t < 100; t++) {
      const { q, nums } = steps(1, 2);
      const f = texFn(grab(/f\(x,y\)=([^$]*)\$/, q.q)[1] as string, ["x", "y"]);
      const e = 1e-4;
      expect(nums[0]).toBe(0);
      expect(f(0, e) / e).toBeCloseTo(nums[1] as number, 3);
      expect((f(e, e) - (nums[1] as number) * e) / e).toBeCloseTo(nums[2] as number, 3);
    }
  });
  it("guidé N4 : x³+y³−3axy — points critiques, hessiennes, valeur", () => {
    for (let t = 0; t < 60; t++) {
      const { q, nums } = steps(3, 2);
      const a = Number(grab(/-(\d*)xy/, q.q)[1]) / 3;
      const f = (x: number, y: number): number => x ** 3 + y ** 3 - 3 * a * x * y;
      const e = 1e-3;
      const hess = (x: number, y: number): number => {
        const fxx = (f(x + e, y) - 2 * f(x, y) + f(x - e, y)) / (e * e), fyy = (f(x, y + e) - 2 * f(x, y) + f(x, y - e)) / (e * e);
        const fxy = (f(x + e, y + e) - f(x + e, y - e) - f(x - e, y + e) + f(x - e, y - e)) / (4 * e * e);
        return fxx * fyy - fxy * fxy;
      };
      expect(dx(f, a, a)).toBeCloseTo(0, 3);
      expect(dy(f, a, a)).toBeCloseTo(0, 3);
      expect(hess(0, 0)).toBeCloseTo(nums[0] as number, 1);
      expect(hess(a, a)).toBeCloseTo(nums[1] as number, 1);
      expect(f(a, a)).toBeCloseTo(nums[2] as number, 9);
    }
  });
  it("guidé N5 : domaine x^p ≤ y ≤ x — intérieure en 1/2 et intégrale totale", () => {
    for (let t = 0; t < 60; t++) {
      const { q, nums } = steps(4, 5);
      const p = Number(grab(/x\^\{(\d)\}\\le y/, q.q)[1]);
      const f = texFn(grab(/iint_D\((.*?)\)\\,dx/, q.q)[1] as string, ["x", "y"]);
      const inner = (x: number): number => {
        const lo = x ** p, M = 4000;
        let s = 0;
        for (let j = 0; j < M; j++) s += f(x, lo + ((j + 0.5) * (x - lo)) / M) * ((x - lo) / M);
        return s;
      };
      expect(inner(0.5)).toBeCloseTo(nums[0] as number, 4);
      let tot = 0;
      for (let i = 0; i < 400; i++) tot += inner((i + 0.5) / 400) / 400;
      expect(tot).toBeCloseTo(nums[1] as number, 4);
    }
  });
});
