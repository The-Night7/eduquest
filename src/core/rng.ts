/** Aléatoire : Math.random par défaut, générateur à graine pour la quête du jour. */
export type Rng = () => number;

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number): Rng {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let current: Rng = Math.random;

export const seeded = (seed: string): Rng => mulberry32(xmur3(seed)());

/** Exécute `fn` avec un générateur déterministe, puis restaure l'ancien. */
export function withSeed<T>(seed: string, fn: () => T): T {
  const old = current;
  current = seeded(seed);
  try {
    return fn();
  } finally {
    current = old;
  }
}

export const rand = (): number => current();
/** Entier uniforme dans [a, b] (bornes incluses). */
export const ri = (a: number, b: number): number => a + Math.floor(current() * (b - a + 1));
export const pick = <T>(a: readonly T[]): T => a[Math.floor(current() * a.length)] as T;

export function shuffle<T>(a: readonly T[]): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(current() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
