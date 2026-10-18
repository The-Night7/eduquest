import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { specificity } from "../src/content/web/level1";
import { JS_EXPRS } from "../src/content/web/level2";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab } from "./texeval";

const CI = 8;
const N = 200;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
const run = (expr: string): unknown => Function(`return (${expr});`)();
const show = (v: unknown): string => (typeof v === "string" ? (v === "" ? "" : v) : String(v));

describe("Informatique 4 — recoupements", () => {
  it("chaque expression JavaScript du pool vaut bien le résultat annoncé (exécution réelle)", () => {
    for (const it of JS_EXPRS) expect(show(run(it.expr)), it.expr).toBe(it.r);
    for (const it of JS_EXPRS) expect(new Set([it.r, ...it.w]).size).toBe(it.w.length + 1);
  });
  it("spécificité : cas connus puis recoupement sur les questions générées", () => {
    expect(specificity("#a .b p")).toBe(111);
    expect(specificity("ul li")).toBe(2);
    expect(specificity("a:hover")).toBe(11);
    expect(specificity("div#top p.intro")).toBe(112);
    for (let t = 0; t < N; t++) {
      const q = num(0, 0);
      const s = grab(/`(.*?)`/, q.q)[1] as string;
      let tot = 0;
      for (const comp of s.split(/[\s>+~]+/)) {
        tot += 100 * (comp.split("#").length - 1) + 10 * (comp.split(".").length - 1 + comp.split(":").length - 1) + (/^[a-z]/i.test(comp) ? 1 : 0);
      }
      expect(fval(q.ans)).toBe(tot);
    }
  });
  it("modèle de boîte", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 2);
      const g = (re: RegExp) => Number(grab(re, q.q)[1]);
      const [w, p, b, m] = [g(/width: (\d+)px/), g(/padding: (\d+)px/), g(/border: (\d+)px/), g(/margin: (\d+)px/)];
      const cb = q.q.includes("content-box");
      const withM = q.q.includes("marges comprises");
      expect(fval(q.ans)).toBe((cb ? w + 2 * p + 2 * b : w) + (withM ? 2 * m : 0));
    }
  });
  it("les snippets JavaScript affichés, exécutés, donnent la réponse attendue", () => {
    for (let t = 0; t < N; t++) {
      for (const gi of [1, 2, 3]) {
        const q = num(1, gi);
        const expr = grab(/`(.*?)`/, q.q)[1] as string;
        if (gi === 3) {
          const n = Number(grab(/f\((\d+)\)/, q.q)[1]);
          const body = grab(/avec `(function.*?)` \?/, q.q)[1] as string;
          expect(fval(q.ans)).toBe(Function(`${body}; return f(${n});`)());
        } else {
          const v = run(expr);
          expect(fval(q.ans)).toBe(typeof v === "string" ? v.length : v);
        }
      }
    }
  });
  it("PHP : count, array_sum, indexation (équivalents JS)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 0);
      const arr = JSON.parse(grab(/(\[[\d, ]+\])/, q.q)[1] as string) as number[];
      if (q.q.includes("count(")) expect(fval(q.ans)).toBe(arr.length);
      else if (q.q.includes("array_sum")) expect(fval(q.ans)).toBe(arr.reduce((a, b) => a + b, 0));
      else expect(fval(q.ans)).toBe(arr[Number(grab(/\]\[(\d+)\]/, q.q)[1])]);
    }
  });
});
