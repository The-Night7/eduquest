/** Matrices à coefficients rationnels exacts : déterminant, inverse, rang, puissance, LaTeX. */
import { Fr, fadd, fdiv, fmul, fsub, ftex, type Fraction } from "./fraction";
import { pick, ri } from "./rng";

export type Mat = Fraction[][];

export const mat = (rows: number[][]): Mat => rows.map((r) => r.map((x) => Fr(x)));
export const identity = (n: number): Mat => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Fr(i === j ? 1 : 0)));
export const transpose = (A: Mat): Mat => (A[0] as Fraction[]).map((_, j) => A.map((r) => r[j] as Fraction));

export function mmul(A: Mat, B: Mat): Mat {
  const n = A.length, m = (B[0] as Fraction[]).length, p = B.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => {
      let s = Fr(0);
      for (let k = 0; k < p; k++) s = fadd(s, fmul((A[i] as Fraction[])[k] as Fraction, (B[k] as Fraction[])[j] as Fraction));
      return s;
    }),
  );
}
export const madd = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((x, j) => fadd(x, (B[i] as Fraction[])[j] as Fraction)));
export const msub = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((x, j) => fsub(x, (B[i] as Fraction[])[j] as Fraction)));
export const mscale = (A: Mat, c: Fraction | number): Mat => {
  const f = typeof c === "number" ? Fr(c) : c;
  return A.map((r) => r.map((x) => fmul(x, f)));
};
export function mpow(A: Mat, k: number): Mat {
  let r = identity(A.length);
  for (let i = 0; i < k; i++) r = mmul(r, A);
  return r;
}
export const trace = (A: Mat): Fraction => A.reduce((s, r, i) => fadd(s, r[i] as Fraction), Fr(0));

/** Réduction de Gauss : renvoie [matrice échelonnée, signe des échanges de lignes, rang]. */
function gauss(A: Mat): { R: Mat; sign: number; rank: number } {
  const R = A.map((r) => r.slice());
  const n = R.length, m = (R[0] as Fraction[]).length;
  let sign = 1, rank = 0;
  for (let c = 0; c < m && rank < n; c++) {
    let p = -1;
    for (let r = rank; r < n; r++) if ((R[r] as Fraction[])[c]!.n !== 0) { p = r; break; }
    if (p < 0) continue;
    if (p !== rank) { [R[p], R[rank]] = [R[rank] as Fraction[], R[p] as Fraction[]]; sign = -sign; }
    const piv = (R[rank] as Fraction[])[c] as Fraction;
    for (let r = rank + 1; r < n; r++) {
      const f = fdiv((R[r] as Fraction[])[c] as Fraction, piv);
      if (f.n === 0) continue;
      R[r] = (R[r] as Fraction[]).map((x, j) => fsub(x, fmul(f, (R[rank] as Fraction[])[j] as Fraction)));
    }
    rank++;
  }
  return { R, sign, rank };
}
export const rank = (A: Mat): number => gauss(A).rank;
export function det(A: Mat): Fraction {
  const { R, sign } = gauss(A);
  let d = Fr(sign);
  R.forEach((r, i) => (d = fmul(d, r[i] as Fraction)));
  return d;
}
export function inverse(A: Mat): Mat {
  const n = A.length;
  const M: Mat = A.map((r, i) => [...r, ...identity(n)[i] as Fraction[]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && (M[p] as Fraction[])[c]!.n === 0) p++;
    if (p === n) throw new Error("matrice non inversible");
    [M[c], M[p]] = [M[p] as Fraction[], M[c] as Fraction[]];
    const piv = (M[c] as Fraction[])[c] as Fraction;
    M[c] = (M[c] as Fraction[]).map((x) => fdiv(x, piv));
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = (M[r] as Fraction[])[c] as Fraction;
      if (f.n === 0) continue;
      M[r] = (M[r] as Fraction[]).map((x, j) => fsub(x, fmul(f, (M[c] as Fraction[])[j] as Fraction)));
    }
  }
  return M.map((r) => r.slice(n));
}
/** Somme des mineurs principaux d'ordre 2 (3×3) : coefficient central du polynôme caractéristique. */
export function minorsSum(A: Mat): Fraction {
  const n = A.length;
  let s = Fr(0);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      s = fadd(s, fsub(fmul(A[i]![i] as Fraction, A[j]![j] as Fraction), fmul(A[i]![j] as Fraction, A[j]![i] as Fraction)));
  return s;
}

/** χ_A(λ) = det(A − λI) évalué en un rationnel (pour vérifier les valeurs propres). */
export const charAt = (A: Mat, lam: Fraction): Fraction => det(msub(A, mscale(identity(A.length), lam)));

/** pmatrix LaTeX. */
export const mtex = (A: Mat): string =>
  String.raw`\begin{pmatrix}${A.map((r) => r.map(ftex).join("&")).join(String.raw`\\`)}\end{pmatrix}`;
export const vtex = (v: Fraction[]): string => mtex(v.map((x) => [x]));

/** Matrice entière unimodulaire (det = 1) obtenue par transvections aléatoires : P⁻¹ reste entière. */
export function randUnimodular(n: number, steps = 3): Mat {
  let P = identity(n);
  for (let s = 0; s < steps; s++) {
    const i = ri(0, n - 1);
    let j = ri(0, n - 1);
    while (j === i) j = ri(0, n - 1);
    const E = identity(n);
    (E[i] as Fraction[])[j] = Fr(pick([-2, -1, 1, 2]));
    P = mmul(P, E);
  }
  return P;
}
/** A = P D P⁻¹ : matrice entière diagonalisable de valeurs propres connues. */
export function fromDiag(D: number[], steps = 3): { A: Mat; P: Mat } {
  const P = randUnimodular(D.length, steps);
  const Dm = D.map((d, i) => D.map((_, j) => Fr(i === j ? d : 0)));
  return { A: mmul(mmul(P, Dm), inverse(P)), P };
}

export const dot = (u: Fraction[], v: Fraction[]): Fraction => u.reduce((s, x, i) => fadd(s, fmul(x, v[i] as Fraction)), Fr(0));
