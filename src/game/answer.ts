import { fval } from "../core/fraction";
import type { GuidedAnswer, Question } from "../types";

/** Lit « 3 », « -1,5 », « 2/7 » ou « −4 » ; NaN si illisible. */
export function parseNum(raw: string): number {
  const s = raw.trim().replace("−", "-").replace(",", ".").replace(/\s/g, "");
  if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)) {
    const [a, b] = s.split("/").map(Number) as [number, number];
    return b ? a / b : NaN;
  }
  const v = Number(s);
  return s !== "" && Number.isFinite(v) ? v : NaN;
}

/** Une réponse d'étape guidée (QCM : index ; saisie : texte). */
export function isRightStep(a: GuidedAnswer, val: number | string | null): boolean {
  if (val === null) return false;
  if (a.k === "qcm") return val === a.a;
  const v = parseNum(String(val));
  if (Number.isNaN(v)) return false;
  return Math.abs(v - fval(a.ans)) < (a.ans.d === 1 ? 1e-9 : 0.006);
}

/**
 * Valide une réponse selon le type de question.
 * - qcm : `val` = index choisi ; num : texte tapé
 * - bug : « ligne:correction » (ex. « 2:1 »)
 * - order : indices de `pool` dans l'ordre choisi, « 3,0,2 »
 * Les problèmes guidés se corrigent étape par étape (`isRightStep`).
 */
export function isRight(q: Question, val: number | string | null): boolean {
  if (val === null) return false;
  switch (q.k) {
    case "qcm":
      return val === q.a;
    case "num":
      return isRightStep({ k: "num", ans: q.ans }, val);
    case "bug":
      return String(val) === `${q.bad}:${q.fix}`;
    case "order":
      return String(val) === q.sol.join(",");
    case "guided":
      return false;
  }
}
