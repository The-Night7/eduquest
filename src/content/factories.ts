import { pick, shuffle } from "../core/rng";
import type { Fraction } from "../core/fraction";
import type { NumRaw, QcmRaw } from "../types";

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
