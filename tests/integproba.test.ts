import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab } from "./texeval";

const CI = 3;
const N = 200;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
/** Intégrale de Simpson sur [a,b]. */
function simpson(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}
const frac = (s: string): number => (s.includes("/") ? Number(s.split("/")[0]) / Number(s.split("/")[1]) : Number(s));

describe("Intégration & probabilités — recoupements", () => {
  it("L1 Riemann : convergence lue sur les intégrales partielles", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 0, 0);
      if (q.k !== "qcm") throw new Error();
      const inf = q.q.includes("+\\infty");
      const m = /x\^\{\\frac\{(\d)\}\{(\d)\}\}/.exec(q.q);
      const al = m ? Number(m[1]) / Number(m[2]) : q.q.includes("x^{") ? Number(grab(/x\^\{(\d)\}/, q.q)[1]) : 1;
      const I = (A: number): number => (al === 1 ? Math.log(A) : (A ** (1 - al) - 1) / (1 - al));
      const J = (eps: number): number => (al === 1 ? -Math.log(eps) : (1 - eps ** (1 - al)) / (1 - al));
      const growth = inf ? I(1e12) - I(1e6) : J(1e-12) - J(1e-6);
      const conv = Math.abs(growth) < 0.05;
      expect(q.a).toBe(conv ? 0 : 1);
    }
  });
  it("L1 valeurs (Simpson avec changement de variable)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 1);
      const txt = q.q;
      let v: number;
      if (/int_1\^\{\+\\infty\}\\frac\{dx\}\{x\^\{(\d)\}\}/.test(txt)) {
        const k = Number(grab(/x\^\{(\d)\}/, txt)[1]);
        v = simpson((u) => u ** (k - 2), 0, 1);
      } else if (txt.includes("int_0^{1}")) {
        const mm = grab(/\\frac\{(\d)\}\{(\d)\}\}/, txt);
        const al = Number(mm[1]) / Number(mm[2]);
        const qq = Number(mm[2]);
        // x = u^q : dx = q u^(q-1) du
        v = simpson((u) => qq * u ** (qq - 1 - al * qq), 0, 1, 20000);
      } else {
        const a = txt.includes("e^{-x}") ? 1 : Number(/e\^\{-(\d?)x\}/.exec(txt)?.[1] || 1);
        const n = /x\^\{(\d)\}e/.exec(txt) ? Number(/x\^\{(\d)\}e/.exec(txt)![1]) : txt.includes("x\\,e") ? 1 : 0;
        v = simpson((x) => x ** n * Math.exp(-a * x), 0, 60 / a, 20000);
      }
      expect(v).toBeCloseTo(fval(q.ans), 2);
    }
  });
  it("L2 Laplace, Gauss, dérivée sous le signe", () => {
    for (let t = 0; t < N; t++) {
      let q = num(1, 0);
      const n = Number(grab(/t\^\{(\d)\}/, q.q)[1]), a = Number(/e\^\{-(\d?)t\}/.exec(q.q)?.[1] || 1);
      expect(simpson((x) => x ** n * Math.exp(-a * x), 0, 60 / a, 20000)).toBeCloseTo(fval(q.ans), 3);
      q = num(1, 1);
      const a2 = Number(/e\^\{-(\d?)x\^2\}/.exec(q.q)?.[1] || 1);
      const I = simpson((x) => Math.exp(-a2 * x * x), -10, 10, 20000);
      expect((I * I) / Math.PI).toBeCloseTo(fval(q.ans), 6);
      q = num(1, 2);
      const a3 = Number(grab(/F'\((\d)\)/, q.q)[1]);
      let F: (x: number) => number;
      if (q.q.includes("t^{x}")) F = (x) => simpson((s) => (s === 0 ? 0 : s ** x), 0, 1, 20000);
      else { const c = Number(grab(/\(t\+(\d)x\)/, q.q)[1]); F = (x) => simpson((s) => (s + c * x) ** 2, 0, 1); }
      const e = 1e-4;
      expect((F(a3 + e) - F(a3 - e)) / (2 * e)).toBeCloseTo(fval(q.ans), 3);
    }
  });
  it("L3 aires et intégrales de moment", () => {
    for (let t = 0; t < 60; t++) {
      let q = num(2, 0);
      const [A2, B2] = [Number(grab(/frac\{x\^2\}\{(\d+)\}/, q.q)[1]), Number(grab(/frac\{y\^2\}\{(\d+)\}/, q.q)[1])];
      const a = Math.sqrt(A2), b = Math.sqrt(B2);
      const M = 600;
      let cnt = 0;
      for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
        const x = -a + ((i + 0.5) * 2 * a) / M, y = -b + ((j + 0.5) * 2 * b) / M;
        if ((x * x) / A2 + (y * y) / B2 <= 1) cnt++;
      }
      expect((cnt * 4 * a * b) / (M * M) / Math.PI).toBeCloseTo(fval(q.ans), 1);
      q = num(2, 1);
      const [pa, pb] = [Number(grab(/x\+y\\le (\d+)/, q.q)[1]), Number(grab(/x-y\\le (\d+)/, q.q)[1])];
      let c2 = 0;
      const S = 800, hx = (pa + pb) / S;
      for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) {
        const x = -pb + ((i + 0.5) * (pa + pb + pb)) / S, y = -pb + ((j + 0.5) * (pa + 2 * pb)) / S;
        if (x + y >= 0 && x + y <= pa && x - y >= 0 && x - y <= pb) c2++;
      }
      void hx;
      expect((c2 * ((pa + 2 * pb) * (pa + 2 * pb))) / (S * S)).toBeCloseTo(fval(q.ans), 0);
      q = num(2, 2);
      const R2 = Number(grab(/x\^2\+y\^2\\le (\d+)/, q.q)[1]);
      const e = q.q.includes("^3") ? 3 : q.q.includes("^2)^2") ? 2 : 1;
      const R = Math.sqrt(R2);
      expect(2 * simpson((r) => r ** (2 * e) * r, 0, R)).toBeCloseTo(fval(q.ans), 6);
    }
  });
  it("L4 dénombrement par force brute", () => {
    for (let t = 0; t < 60; t++) {
      let q = num(3, 0);
      const word = grab(/« ([A-Z]+) »/, q.q)[1] as string;
      const counts = Object.values([...word].reduce<Record<string, number>>((m, c) => ({ ...m, [c]: (m[c] ?? 0) + 1 }), {}));
      let rest = word.length, ways = 1;
      for (const c of counts) {
        let b = 1;
        for (let i = 1; i <= c; i++) b = (b * (rest - c + i)) / i;
        ways *= b;
        rest -= c;
      }
      expect(Math.round(ways)).toBe(fval(q.ans));
      if (word.length <= 7) {
        const seen = new Set<string>();
        const perm = (pre: string, left: string): void => {
          if (!left) { seen.add(pre); return; }
          for (let i = 0; i < left.length; i++) perm(pre + left[i], left.slice(0, i) + left.slice(i + 1));
        };
        perm("", word);
        expect(seen.size).toBe(fval(q.ans));
      }
      q = num(3, 1);
      const [men, women, k] = [Number(grab(/parmi (\d+) hommes/, q.q)[1]), Number(grab(/et (\d+) femmes/, q.q)[1]), Number(grab(/comité de (\d+)/, q.q)[1])];
      let good = 0;
      const rec = (start: number, chosen: number[]): void => {
        if (chosen.length === k) { if (chosen.some((i) => i >= men)) good++; return; }
        for (let i = start; i < men + women; i++) rec(i + 1, [...chosen, i]);
      };
      rec(0, []);
      expect(good).toBe(fval(q.ans));
      q = num(3, 2);
      const [n, kk] = [Number(grab(/parmi (\d+) symboles/, q.q)[1]), Number(grab(/a (\d) chiffres/, q.q)[1])];
      const rep = q.q.includes("autorisées");
      let c = 0;
      const gen = (len: number, used: number[]): void => {
        if (len === kk) { c++; return; }
        for (let i = 0; i < n; i++) if (rep || !used.includes(i)) gen(len + 1, [...used, i]);
      };
      gen(0, []);
      expect(c).toBe(fval(q.ans));
      q = num(3, 3);
      const sides = Number(grab(/à (\d+) côtés/, q.q)[1]);
      let d = 0;
      for (let i = 0; i < sides; i++) for (let j = i + 2; j < sides; j++) if (!(i === 0 && j === sides - 1)) d++;
      expect(d).toBe(fval(q.ans));
    }
  });
  it("L4 mots avec au moins un A", () => {
    for (let t = 0; t < 40; t++) {
      const q = build(CI, 3, 8);
      if (q.k !== "guided") throw new Error();
      const l = Number(grab(/mots de (\d) lettres/, q.q)[1]), s = Number(grab(/alphabet de (\d) lettres/, q.q)[1]);
      let c = 0;
      for (let w = 0; w < s ** l; w++) { let x = w, hasA = false; for (let i = 0; i < l; i++) { if (x % s === 0) hasA = true; x = Math.floor(x / s); } if (hasA) c++; }
      const last = q.steps[2]!.ans as { ans: { n: number } };
      expect(last.ans.n).toBe(c);
    }
  });
  it("L5 Bayes, binomiale, moments, tableau", () => {
    for (let t = 0; t < N; t++) {
      let q = num(4, 0);
      const f3 = [...q.q.matchAll(/(\d+)\/(\d+)/g)].map((x) => Number(x[1]) / Number(x[2]));
      const [p, s, f] = f3 as [number, number, number];
      expect(fval(q.ans)).toBeCloseTo((p * s) / (p * s + (1 - p) * f), 12);
      q = num(4, 1);
      const [n, pr, k] = [Number(grab(/\\left\((\d+),/, q.q)[1]), frac((grab(/,(?:\\frac\{(\d+)\}\{(\d+)\}|(\d+))\\right\)/, q.q)[0].replace(/.*,|\\right\)/g, "")).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")), Number(grab(/P\(X=(\d+)\)/, q.q)[1])];
      let c = 1;
      for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
      expect(fval(q.ans)).toBeCloseTo(c * pr ** k * (1 - pr) ** (n - k), 10);
      q = num(4, 3);
      const items = [...q.q.matchAll(/P\(X=(-?\d+)\) = (\d+)\/(\d+)/g)];
      const E = items.reduce((s2, it) => s2 + (Number(it[1]) * Number(it[2])) / Number(it[3]), 0);
      expect(fval(q.ans)).toBeCloseTo(E, 12);
    }
  });
  it("L5 urne sans remise (énumération)", () => {
    for (let t = 0; t < 60; t++) {
      const q = build(CI, 4, 5);
      if (q.k !== "guided") throw new Error();
      const r = Number(grab(/contient (\d+) boules rouges/, q.q)[1]), b = Number(grab(/et (\d+) boules bleues/, q.q)[1]);
      const balls = [...Array(r).fill("R"), ...Array(b).fill("B")] as string[];
      let tot = 0, r1 = 0, rr = 0, r2 = 0;
      balls.forEach((x, i) => balls.forEach((y, j) => { if (i === j) return; tot++; if (x === "R") r1++; if (x === "R" && y === "R") rr++; if (y === "R") r2++; }));
      const ans = q.steps.map((s) => fval((s.ans as { ans: { n: number; d: number } }).ans));
      expect(ans[0]).toBeCloseTo(r1 / tot, 12);
      expect(ans[1]).toBeCloseTo(rr / tot, 12);
      expect(ans[2]).toBeCloseTo(r2 / tot, 12);
      expect(ans[3]).toBeCloseTo(rr / r2, 12);
    }
  });
});
