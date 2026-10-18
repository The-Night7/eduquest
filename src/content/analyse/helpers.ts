import { Fr } from "../../core/fraction";
import { padd, pmono, type Poly } from "../../core/poly";
import { pick, ri, shuffle } from "../../core/rng";

/** Polynôme aléatoire en x, y : `terms` monômes distincts de degré total ≤ `deg`, coefficients dans ±`cmax`. */
export function randPoly(deg: number, terms: number, cmax = 4, minDeg = 0): Poly {
  const slots: [number, number][] = [];
  for (let i = 0; i <= deg; i++) for (let j = 0; i + j <= deg; j++) if (i + j >= minDeg) slots.push([i, j]);
  let p: Poly = new Map();
  for (const [i, j] of shuffle(slots).slice(0, terms)) {
    let c = 0;
    while (c === 0) c = ri(-cmax, cmax);
    p = padd(p, pmono(Fr(c), i, j));
  }
  return p;
}
export const pt = (): number => pick([-2, -1, 0, 1, 2]);
