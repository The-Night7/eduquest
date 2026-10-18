// Ondes · paramètres entiers calculés par recherche exhaustive (réponses exactes, sans racines)
/** (γ, ω, ω0) avec γ² + ω² = ω0² (pseudo-pulsation entière). */
export const PYTH: ReadonlyArray<readonly [number, number, number]> = (() => {
  const out: Array<readonly [number, number, number]> = [];
  for (let g = 1; g <= 20; g++)
    for (let w = 1; w <= 24; w++) {
      const c = Math.round(Math.sqrt(g * g + w * w));
      if (c * c === g * g + w * w && c <= 25) out.push([g, w, c] as const);
    }
  return out;
})();

/** (γ, ωr, ω0) avec ω0² − 2γ² = ωr² (pulsation de résonance entière), ωr ≥ 1. */
export const RESO: ReadonlyArray<readonly [number, number, number]> = (() => {
  const out: Array<readonly [number, number, number]> = [];
  for (let w0 = 2; w0 <= 30; w0++)
    for (let g = 1; g <= 20; g++) {
      const r2 = w0 * w0 - 2 * g * g;
      if (r2 < 1) continue;
      const r = Math.round(Math.sqrt(r2));
      if (r * r === r2) out.push([g, r, w0] as const);
    }
  return out;
})();
