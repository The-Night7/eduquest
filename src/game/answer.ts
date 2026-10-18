import { fval } from "../core/fraction";
import type { Question } from "../types";

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

/** QCM : `val` = index choisi. Saisie : `val` = texte tapé. */
export function isRight(q: Question, val: number | string | null): boolean {
  if (val === null) return false;
  if (q.k === "qcm") return val === q.a;
  const v = parseNum(String(val));
  if (Number.isNaN(v)) return false;
  const target = fval(q.ans);
  // entier exigé exactement ; sinon une décimale approchée est acceptée
  return Math.abs(v - target) < (q.ans.d === 1 ? 1e-9 : 0.006);
}
