/**
 * Polynômes à deux variables (x, y) à coefficients rationnels exacts.
 * Sert aux dérivées partielles, intégrales doubles, extrema, champs…
 */
import { Fr, fadd, fmul, fval, ftex, type Fraction } from "./fraction";

export type Poly = Map<string, Fraction>;
export type Var = "x" | "y";

const key = (i: number, j: number): string => `${i},${j}`;
const parse = (k: string): [number, number] => k.split(",").map(Number) as [number, number];
const isZeroF = (a: Fraction): boolean => a.n === 0;

function clean(p: Poly): Poly {
  for (const [k, c] of p) if (isZeroF(c)) p.delete(k);
  return p;
}

export const pzero = (): Poly => new Map();
export const pconst = (c: Fraction | number): Poly =>
  clean(new Map([[key(0, 0), typeof c === "number" ? Fr(c) : c]]));
export const px = (): Poly => new Map([[key(1, 0), Fr(1)]]);
export const py = (): Poly => new Map([[key(0, 1), Fr(1)]]);
/** Monôme c·x^i·y^j */
export const pmono = (c: Fraction | number, i: number, j: number): Poly =>
  clean(new Map([[key(i, j), typeof c === "number" ? Fr(c) : c]]));

export function padd(a: Poly, b: Poly): Poly {
  const out: Poly = new Map(a);
  for (const [k, c] of b) out.set(k, fadd(out.get(k) ?? Fr(0), c));
  return clean(out);
}
export const pscale = (a: Poly, c: Fraction | number): Poly => {
  const f = typeof c === "number" ? Fr(c) : c;
  const out: Poly = new Map();
  for (const [k, v] of a) out.set(k, fmul(v, f));
  return clean(out);
};
export const psub = (a: Poly, b: Poly): Poly => padd(a, pscale(b, -1));
export function pmul(a: Poly, b: Poly): Poly {
  const out: Poly = new Map();
  for (const [ka, ca] of a)
    for (const [kb, cb] of b) {
      const [i1, j1] = parse(ka);
      const [i2, j2] = parse(kb);
      const k = key(i1 + i2, j1 + j2);
      out.set(k, fadd(out.get(k) ?? Fr(0), fmul(ca, cb)));
    }
  return clean(out);
}
export function ppow(a: Poly, n: number): Poly {
  let r = pconst(1);
  for (let i = 0; i < n; i++) r = pmul(r, a);
  return r;
}

/** Dérivée partielle. */
export function pdiff(a: Poly, v: Var): Poly {
  const out: Poly = new Map();
  for (const [k, c] of a) {
    const [i, j] = parse(k);
    if (v === "x" && i > 0) out.set(key(i - 1, j), fmul(c, Fr(i)));
    if (v === "y" && j > 0) out.set(key(i, j - 1), fmul(c, Fr(j)));
  }
  return clean(out);
}

/** Évalue en (x, y) rationnels. */
export function peval(a: Poly, x: Fraction, y: Fraction): Fraction {
  let s = Fr(0);
  for (const [k, c] of a) {
    const [i, j] = parse(k);
    let t = c;
    for (let a1 = 0; a1 < i; a1++) t = fmul(t, x);
    for (let b1 = 0; b1 < j; b1++) t = fmul(t, y);
    s = fadd(s, t);
  }
  return s;
}

/** Remplace la variable `v` par le polynôme `q` (composition). */
export function psubst(a: Poly, v: Var, q: Poly): Poly {
  let out = pzero();
  for (const [k, c] of a) {
    const [i, j] = parse(k);
    const [ev, eo] = v === "x" ? [i, j] : [j, i];
    const other = v === "x" ? pmono(1, 0, eo) : pmono(1, eo, 0);
    out = padd(out, pscale(pmul(ppow(q, ev), other), c));
  }
  return out;
}

/** ∫ de lo à hi par rapport à `v` (bornes polynomiales en l'autre variable). */
export function pintegrate(a: Poly, v: Var, lo: Poly, hi: Poly): Poly {
  const prim: Poly = new Map();
  for (const [k, c] of a) {
    const [i, j] = parse(k);
    if (v === "x") prim.set(key(i + 1, j), fmul(c, Fr(1, i + 1)));
    else prim.set(key(i, j + 1), fmul(c, Fr(1, j + 1)));
  }
  return psub(psubst(prim, v, hi), psubst(prim, v, lo));
}

export const pisZero = (a: Poly): boolean => a.size === 0;
export const pdegree = (a: Poly): number => Math.max(-1, ...[...a.keys()].map((k) => parse(k)[0] + parse(k)[1]));

/** Coefficient de x^i y^j. */
export const pcoef = (a: Poly, i: number, j: number): Fraction => a.get(key(i, j)) ?? Fr(0);

/** Valeur numérique du polynôme constant (après intégration complète). */
export function pconstValue(a: Poly): Fraction {
  if (a.size === 0) return Fr(0);
  if (a.size !== 1 || !a.has(key(0, 0))) throw new Error("polynôme non constant");
  return a.get(key(0, 0)) as Fraction;
}

/** LaTeX : termes triés par degré total décroissant puis puissance de x décroissante. */
export function ptex(a: Poly): string {
  if (a.size === 0) return "0";
  const terms = [...a.entries()]
    .map(([k, c]) => ({ i: parse(k)[0], j: parse(k)[1], c }))
    .sort((p, q) => q.i + q.j - (p.i + p.j) || q.i - p.i);
  let out = "";
  terms.forEach(({ i, j, c }, idx) => {
    const neg = c.n < 0;
    const abs = Fr(Math.abs(c.n), c.d);
    const mon = (i ? (i === 1 ? "x" : `x^{${i}}`) : "") + (j ? (j === 1 ? "y" : `y^{${j}}`) : "");
    const coef = mon && abs.n === 1 && abs.d === 1 ? "" : ftex(abs);
    out += (neg ? "-" : idx === 0 ? "" : "+") + (coef + mon || "1");
  });
  return out;
}

export const pvalNum = (a: Poly, x: number, y: number): number => {
  let s = 0;
  for (const [k, c] of a) {
    const [i, j] = parse(k);
    s += fval(c) * Math.pow(x, i) * Math.pow(y, j);
  }
  return s;
};
