import { Fr } from "../../core/fraction";
import { fromDiag, mtex, type Mat } from "../../core/matrix";
import { shuffle } from "../../core/rng";
import { L, m } from "../../core/tex";

/** `A = (…)` en LaTeX inline. */
export const mathMat = (name: string, A: Mat): string => m(L`${name}=${mtex(A)}`);

/** n entiers distincts dans [lo, hi]. */
export function distinctInts(n: number, lo = -3, hi = 4): number[] {
  return shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n);
}

/** Matrice entière diagonalisable n×n (petits coefficients), sa matrice de passage et son spectre. */
export function diagMat(n: number, steps = 2, lo = -3, hi = 4): { A: Mat; P: Mat; D: number[] } {
  let D = distinctInts(n, lo, hi);
  let r = fromDiag(D, steps);
  for (let t = 0; t < 12 && r.A.some((row) => row.some((x) => Math.abs(x.n) > 15)); t++) {
    D = distinctInts(n, lo, hi);
    r = fromDiag(D, steps);
  }
  return { A: r.A, P: r.P, D };
}
export { Fr };
