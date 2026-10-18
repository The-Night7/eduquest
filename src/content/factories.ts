import { pick, shuffle } from "../core/rng";
import type { Fraction } from "../core/fraction";
import type { BugRaw, GuidedRaw, GuidedStep, NumRaw, OrderRaw, QcmRaw } from "../types";

export const NAT2 = ["Converge", "Diverge"];
export const ABS3 = ["Absolument convergente", "Semi-convergente", "Divergente"];
export const CONC3 = [
  "La série diverge grossièrement",
  "La série converge",
  "On ne peut pas conclure avec ce test",
];
export const DOUTE3 = ["Converge", "Diverge", "Cas douteux (ℓ = 1)"];

/** QCM. `ai` = index de la bonne réponse dans `opts` ; `shuf` mélange les options. */
export function Qcm(q: string, opts: string[], ai: number, exp = "", shuf = false): QcmRaw {
  let o = opts.map((t, i) => ({ t, ok: i === ai }));
  if (shuf) o = shuffle(o);
  return { k: "qcm", q, o: o.map((x) => x.t), a: o.findIndex((x) => x.ok), exp };
}
export function Num(q: string, ans: Fraction, exp = ""): NumRaw {
  return { k: "num", q, ans, exp };
}
/** « Converge / Diverge ». */
export const Nat = (q: string, conv: boolean, exp = ""): QcmRaw => Qcm(q, NAT2, conv ? 0 : 1, exp);
export const VF = (q: string, truth: boolean, exp = ""): QcmRaw =>
  Qcm(q, ["Vrai", "Faux"], truth ? 0 : 1, exp);

export interface VFItem {
  q: string;
  t: boolean;
  e: string;
}
export interface QcmItem {
  q: string;
  r: string; // bonne réponse
  w: string[]; // mauvaises réponses
  e: string;
}
export const poolVF = (items: readonly VFItem[]) => (): QcmRaw => {
  const it = pick(items);
  return VF(it.q, it.t, it.e);
};
export const poolQcm = (items: readonly QcmItem[]) => (): QcmRaw => {
  const it = pick(items);
  return Qcm(it.q, [it.r, ...it.w], 0, it.e, true);
};

/**
 * « Trouve l'erreur ». `fixes[0]` est la bonne version de la ligne fausse `bad` ;
 * les autres sont des corrections plausibles mais fausses. Les propositions sont mélangées.
 */
export function Bug(q: string, lines: string[], bad: number, fixes: string[], exp: string): BugRaw {
  const sh = shuffle(fixes.map((t, i) => ({ t, ok: i === 0 })));
  return { k: "bug", q, lines, bad, fixes: sh.map((x) => x.t), fix: sh.findIndex((x) => x.ok), exp };
}
/** « Reconstitue la preuve ». `steps` dans le bon ordre ; `decoys` = intrus. La banque est mélangée. */
export function Order(q: string, steps: string[], decoys: string[], exp = ""): OrderRaw {
  const pool = shuffle([...steps, ...decoys]);
  return { k: "order", q, pool, sol: steps.map((s) => pool.indexOf(s)), exp };
}
/** Étape guidée à choix : `o[0]` est la bonne réponse (mélangée). */
export function gq(q: string, o: string[], hints: string[], exp: string): GuidedStep {
  const sh = shuffle(o.map((t, i) => ({ t, ok: i === 0 })));
  return { q, ans: { k: "qcm", o: sh.map((x) => x.t), a: sh.findIndex((x) => x.ok) }, hints, exp };
}
/** Étape guidée à saisie numérique. */
export function gn(q: string, ans: Fraction, hints: string[], exp: string): GuidedStep {
  return { q, ans: { k: "num", ans }, hints, exp };
}
export const Guided = (q: string, steps: GuidedStep[], exp: string): GuidedRaw => ({ k: "guided", q, steps, exp });
