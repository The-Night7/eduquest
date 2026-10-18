/** Dénombrement exact (BigInt en interne, converti en nombre quand il est sûr). */
export const fact = (n: number): bigint => {
  let r = 1n;
  for (let i = 2; i <= n; i++) r *= BigInt(i);
  return r;
};
export const binomBig = (n: number, k: number): bigint => (k < 0 || k > n ? 0n : fact(n) / (fact(k) * fact(n - k)));
const toNum = (b: bigint): number => {
  if (b > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("nombre trop grand");
  return Number(b);
};
export const binom = (n: number, k: number): number => toNum(binomBig(n, k));
/** Arrangements A(n,k) = n!/(n−k)! */
export const arr = (n: number, k: number): number => (k > n ? 0 : toNum(fact(n) / fact(n - k)));
export const factNum = (n: number): number => toNum(fact(n));
/** Permutations d'un mot dont les lettres ont les multiplicités données : n!/(m1!·m2!·…) */
export const multinomial = (counts: number[]): number => {
  const n = counts.reduce((a, b) => a + b, 0);
  return toNum(counts.reduce((d, c) => d / fact(c), fact(n)));
};
