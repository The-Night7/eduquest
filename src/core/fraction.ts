/** Fractions exactes : les réponses sont calculées sans erreur d'arrondi. */
export interface Fraction {
  readonly n: number;
  readonly d: number;
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export const Fr = (n: number, d = 1): Fraction => {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};

export const fadd = (a: Fraction, b: Fraction): Fraction => Fr(a.n * b.d + b.n * a.d, a.d * b.d);
export const fsub = (a: Fraction, b: Fraction): Fraction => fadd(a, Fr(-b.n, b.d));
export const fmul = (a: Fraction, b: Fraction): Fraction => Fr(a.n * b.n, a.d * b.d);
export const fdiv = (a: Fraction, b: Fraction): Fraction => Fr(a.n * b.d, a.d * b.n);
export const fpow = (a: Fraction, k: number): Fraction => {
  let r = Fr(1);
  for (let i = 0; i < k; i++) r = fmul(r, a);
  return r;
};
export const fval = (a: Fraction): number => a.n / a.d;
export const feq = (a: Fraction, b: Fraction): boolean => a.n === b.n && a.d === b.d;
export const fgt1 = (a: Fraction): boolean => a.n > a.d;

/** LaTeX d'une fraction (sans les $). */
export const ftex = (a: Fraction): string =>
  a.d === 1 ? String(a.n) : (a.n < 0 ? "-" : "") + String.raw`\frac{${Math.abs(a.n)}}{${a.d}}`;

/** Nombre harmonique H_k = 1 + 1/2 + … + 1/k. */
export const Hk = (k: number): Fraction => {
  let s = Fr(0);
  for (let i = 1; i <= k; i++) s = fadd(s, Fr(1, i));
  return s;
};
