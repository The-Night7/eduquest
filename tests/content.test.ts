import { describe, expect, it } from "vitest";
import { build, CHAPTERS, makeMission } from "../src/content";
import { fval } from "../src/core/fraction";
import { isRight, isRightStep, parseNum } from "../src/game/answer";
import type { NumRaw, Question } from "../src/types";

const gens = CHAPTERS.flatMap((ch, ci) => ch.levels.flatMap((lv, li) => lv.gens.map(([id], gi) => ({ ci, lv, li, gi, id }))));

const textOf = (q: Question): string => JSON.stringify(q, (_k, v) => (typeof v === "object" && v && "n" in v && "d" in v ? `${v.n}/${v.d}` : v));

/** Vérifie la cohérence interne d'une question, quel que soit son type. */
export function checkStructure(q: Question): void {
  expect(q.q.length).toBeGreaterThan(5);
  expect(textOf(q)).not.toMatch(/undefined|NaN|\[object|[:,\\[]null/);
  switch (q.k) {
    case "qcm":
      expect(q.a).toBeGreaterThanOrEqual(0);
      expect(q.a).toBeLessThan(q.o.length);
      expect(new Set(q.o).size).toBe(q.o.length); // pas de doublons dans les options
      expect(isRight(q, q.a)).toBe(true);
      break;
    case "num":
      expect(Number.isFinite(fval(q.ans))).toBe(true);
      expect(isRight(q, `${q.ans.n}/${q.ans.d}`)).toBe(true);
      break;
    case "bug":
      expect(q.lines.length).toBeGreaterThanOrEqual(3);
      expect(new Set(q.lines).size).toBe(q.lines.length);
      expect(q.bad).toBeGreaterThanOrEqual(0);
      expect(q.bad).toBeLessThan(q.lines.length);
      expect(q.fixes.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.fixes).size).toBe(q.fixes.length);
      expect(q.fixes[q.fix]).toBeDefined();
      // la ligne fausse n'est pas listée parmi les corrections (sinon la question est triviale)
      expect(q.fixes).not.toContain(q.lines[q.bad]);
      expect(isRight(q, `${q.bad}:${q.fix}`)).toBe(true);
      expect(isRight(q, `${q.bad}:${(q.fix + 1) % q.fixes.length}`)).toBe(false);
      expect(q.exp.length).toBeGreaterThan(10);
      break;
    case "order":
      expect(q.sol.length).toBeGreaterThanOrEqual(3);
      expect(new Set(q.sol).size).toBe(q.sol.length);
      for (const i of q.sol) expect(q.pool[i]).toBeDefined();
      expect(new Set(q.pool).size).toBe(q.pool.length);
      expect(q.pool.length).toBeGreaterThan(q.sol.length); // au moins un intrus
      expect(isRight(q, q.sol.join(","))).toBe(true);
      expect(isRight(q, [...q.sol].reverse().join(","))).toBe(false);
      break;
    case "guided":
      expect(q.steps.length).toBeGreaterThanOrEqual(2);
      for (const st of q.steps) {
        expect(st.hints.length).toBeGreaterThanOrEqual(1);
        expect(st.exp.length).toBeGreaterThan(5);
        if (st.ans.k === "qcm") {
          expect(st.ans.a).toBeLessThan(st.ans.o.length);
          expect(new Set(st.ans.o).size).toBe(st.ans.o.length);
          expect(isRightStep(st.ans, st.ans.a)).toBe(true);
        } else expect(isRightStep(st.ans, `${st.ans.ans.n}/${st.ans.ans.d}`)).toBe(true);
      }
      break;
  }
}

describe("structure de toutes les questions générées", () => {
  for (const { ci, lv, li, gi, id } of gens) {
    it(`${lv.id}:${id}`, () => {
      for (let t = 0; t < 1500; t++) checkStructure(build(ci, li, gi));
    });
  }
});

describe("identifiants uniques", () => {
  it("niveaux et générateurs", () => {
    const ids = CHAPTERS.flatMap((c) => c.levels.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CHAPTERS) for (const l of c.levels) {
      const g = l.gens.map(([id]) => id);
      expect(new Set(g).size).toBe(g.length);
      expect(l.rappel.length).toBeGreaterThan(0);
    }
  });
});

describe("réponses numériques recoupées par un calcul indépendant", () => {
  const num = (li: number, gi: number): Question & NumRaw => {
    const q = build(0, li, gi);
    if (q.k !== "num") throw new Error("num attendu");
    return q;
  };
  const N = 400;

  it("Σ 1/(n(n+k))", () => {
    for (let t = 0; t < N; t++) {
      const q = num(5, 0);
      const k = Number(/n\+(\d)\)/.exec(q.q)?.[1]);
      let s = 0;
      for (let i = 1; i <= 3e5; i++) s += 1 / (i * (i + k));
      expect(fval(q.ans)).toBeCloseTo(s, 4);
    }
  });
  it("télescopage Σ (1/n − 1/(n+k))", () => {
    for (let t = 0; t < N; t++) {
      const q = num(5, 1);
      const k = Number(/n\+(\d)\}/.exec(q.q)?.[1]);
      let s = 0;
      for (let i = 1; i <= 3e5; i++) s += 1 / i - 1 / (i + k);
      expect(fval(q.ans)).toBeCloseTo(s, 4);
    }
  });
  it("Σ_{n≥N} 1/(n(n+1))", () => {
    for (let t = 0; t < N; t++) {
      const q = num(5, 2);
      const n0 = Number(/n=(\d)\}/.exec(q.q)?.[1]);
      let s = 0;
      for (let i = n0; i <= 3e5; i++) s += 1 / (i * (i + 1));
      expect(fval(q.ans)).toBeCloseTo(s, 4);
    }
  });
  it("Σ p^n / q^(n−s)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(5, 3);
      const mm = /\{(\d)\^n\}\{(\d)\^\{n-(\d)\}\}/.exec(q.q) as RegExpExecArray;
      const [P, Q, S] = [Number(mm[1]), Number(mm[2]), Number(mm[3])];
      let s = 0;
      for (let i = 0; i < 400; i++) s += Math.pow(P, i) / Math.pow(Q, i - S);
      expect(Math.abs(fval(q.ans) - s)).toBeLessThan(1e-6 * Math.abs(s) + 1e-9);
    }
  });
  it("Σ (n² + bn + c)/n! = λ e", () => {
    for (let t = 0; t < N; t++) {
      const q = num(5, 4);
      const poly = (/frac\{([^}]*)\}\{n!\}/.exec(q.q) as RegExpExecArray)[1] as string;
      const f = poly.replace(/n\^2/g, "(n*n)").replace(/(\d)n/g, "$1*n").replace(/-n/g, "-1*n").replace(/\+n/g, "+1*n");
      let fact = 1;
      let s = 0;
      for (let i = 0; i < 30; i++) {
        if (i > 0) fact *= i;
        s += (Function("n", `return ${f}`) as (n: number) => number)(i) / fact;
      }
      expect(fval(q.ans)).toBeCloseTo(s / Math.E, 6);
    }
  });
  it("Σ z^n et Σ_{n≥N} z^n", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 2);
      const z = /\\left\((-?)(?:\\frac\{(\d+)\}\{(\d+)\}|(\d+))\\right\)\^n/.exec(q.q) as RegExpExecArray;
      const zv = (z[1] ? -1 : 1) * (z[4] ? Number(z[4]) : Number(z[2]) / Number(z[3]));
      const start = Number(/n=(\d)\}\^\{\+\\infty\}/.exec(q.q)?.[1]);
      let s = 0;
      for (let i = start; i < 2000; i++) s += Math.pow(zv, i);
      expect(fval(q.ans)).toBeCloseTo(s, 6);
    }
  });
  it("d'Alembert : limite du rapport", () => {
    let seen = 0;
    for (let t = 0; t < N * 3; t++) {
      const q = build(0, 3, 0);
      if (q.k !== "num") continue;
      seen++;
      const n = 1e5;
      const m1 = /n\^\{(\d)\}\\,2\^n/.exec(q.q), m2 = /frac\{n\^\{(\d)\}\}\{(\d+)\^n\}/.exec(q.q), m3 = /frac\{(\d+)\^n\}\{n!\}/.exec(q.q);
      const r = m1 ? Math.pow((n + 1) / n, Number(m1[1])) * 2
        : m2 ? Math.pow((n + 1) / n, Number(m2[1])) / Number(m2[2])
        : Number(m3?.[1]) / (n + 1);
      expect(Math.abs(fval(q.ans) - r)).toBeLessThan(1e-3);
    }
    expect(seen).toBeGreaterThan(50);
  });
  it("CSSA : plus petit n avec a_{n+1} ≤ 10^-k", () => {
    for (let t = 0; t < N; t++) {
      const q = num(4, 0);
      const p = Number(/\{\(-1\)\^n\}\{(?:n\^\{(\d)\}|(n))\}/.exec(q.q)?.slice(1).find(Boolean)?.replace("n", "1"));
      const k = Number(/10\^\{-(\d)\}/.exec(q.q)?.[1]);
      let n = 1;
      while (Math.pow(n + 1, p) < Math.pow(10, k)) n++;
      expect(fval(q.ans)).toBe(n);
    }
  });
});

describe("saisie", () => {
  it("accepte fractions, virgules et signe moins unicode", () => {
    expect(parseNum("1/4")).toBe(0.25);
    expect(parseNum("0,25")).toBe(0.25);
    expect(parseNum("−3")).toBe(-3);
    expect(parseNum("abc")).toBeNaN();
    expect(parseNum("")).toBeNaN();
  });
});

describe("missions", () => {
  it("6 questions + 1 boss, pour chaque niveau", () => {
    for (let i = 0; i < 100; i++)
      CHAPTERS.forEach((ch, ci) => ch.levels.forEach((_, li) => {
        const qs = makeMission(ci, li);
        expect(qs).toHaveLength(7);
        expect(qs.filter((q) => q.boss)).toHaveLength(1);
        expect(qs[6]?.boss).toBe(true);
        expect(qs[6]?.li).toBeLessThanOrEqual(li);
        expect(qs.every((q) => q.ci === ci)).toBe(true);
      }));
  });
});
