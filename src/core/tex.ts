import { feq, ftex, Fr, type Fraction } from "./fraction";

/** `L` : template brut pour écrire du LaTeX sans doubler les antislashs. */
export const L = String.raw;
/** Entoure de $…$ pour que KaTeX le rende dans le texte. */
export const m = (s: string): string => "$" + s + "$";

/** n^e en LaTeX (n, √n, n^k, n^{p/q}). */
export const powN = (e: Fraction): string => {
  if (feq(e, Fr(1))) return "n";
  if (feq(e, Fr(1, 2))) return L`\sqrt{n}`;
  if (e.d === 1) return `n^{${e.n}}`;
  return L`n^{\frac{${e.n}}{${e.d}}}`;
};
export const invPow = (e: Fraction): string => L`\frac{1}{${powN(e)}}`;
export const lin = (a: number, b: number): string =>
  `${a === 1 ? "" : a}n${b > 0 ? "+" + b : b < 0 ? String(b) : ""}`;
export const pwn = (k: number): string => (k === 1 ? "n" : `n^{${k}}`);

export { ftex };
