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

/** Décimal « à la française » pour du texte brut (2,5 plutôt que \frac{5}{2}). */
export const dec = (a: Fraction): string => String(Math.round((a.n / a.d) * 1e6) / 1e6).replace(".", ",");

/**
 * Entoure de $…$ les fractions LaTeX restées dans du texte brut
 * (les explications fabriquées avec `ftex` hors `m(…)` s'afficheraient sinon en \frac{1}{2}).
 */
export function wrapFracs(s: string): string {
  const parts = s.split("$");
  if (parts.length % 2 === 0) return s; // $ non appariés : on ne touche à rien
  return parts
    .map((p, i) => (i % 2 === 1 ? p : p.replace(/(-?)\\frac\{(\d+)\}\{(\d+)\}/g, (_x, sg: string, a: string, b: string) => `$${sg}\\frac{${a}}{${b}}$`)))
    .join("$");
}
