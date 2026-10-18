import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { PYTH, RESO } from "../src/content/ondes/helpers";
import { fval } from "../src/core/fraction";
import type { Question } from "../src/types";
import { grab } from "./texeval";

const CI = 6;
const N = 200;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
const amp = (w: number, w0: number, g: number) => 1 / Math.sqrt((w0 * w0 - w * w) ** 2 + 4 * g * g * w * w);

describe("Ondes — recoupements", () => {
  it("les listes de paramètres vérifient bien leurs identités", () => {
    expect(PYTH.length).toBeGreaterThan(5);
    for (const [g, w, c] of PYTH) expect(g * g + w * w).toBe(c * c);
    expect(RESO.length).toBeGreaterThan(5);
    for (const [g, r, w0] of RESO) expect(w0 * w0 - 2 * g * g).toBe(r * r);
  });
  it("pseudo-pulsation : e^(−γt)cos(ωt) vérifie l'équation (différences finies)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 3);
      const w0 = Number(grab(/omega_0=(\d+)/, q.q)[1]);
      const g = Number(grab(/gamma=(\d+)/, q.q)[1]);
      const w = fval(q.ans);
      const x = (u: number) => Math.exp(-g * u) * Math.cos(w * u);
      const h = 1e-4, u0 = 0.37;
      const x1 = (x(u0 + h) - x(u0 - h)) / (2 * h);
      const x2 = (x(u0 + h) - 2 * x(u0) + x(u0 - h)) / (h * h);
      expect(x2 + 2 * g * x1 + w0 * w0 * x(u0)).toBeCloseTo(0, 4);
    }
  });
  it("régime : le signe du discriminant concorde", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 0, 2);
      if (q.k !== "qcm") throw new Error();
      const w0 = Number(grab(/omega_0=(\d+)/, q.q)[1]);
      const g = Number(grab(/gamma=(\d+)/, q.q)[1]);
      expect(q.a).toBe(g < w0 ? 0 : g === w0 ? 1 : 2);
    }
  });
  it("ω_r maximise réellement l'amplitude (balayage)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 0);
      const w0 = Number(grab(/omega_0=(\d+)/, q.q)[1]);
      const g = Number(grab(/gamma=(\d+)/, q.q)[1]);
      let best = 0, bw = 0;
      for (let w = 0.001; w < 2 * w0; w += 0.001) if (amp(w, w0, g) > best) { best = amp(w, w0, g); bw = w; }
      expect(fval(q.ans)).toBeCloseTo(bw, 2);
    }
  });
  it("amplitude à ω₀ et à 0", () => {
    for (let t = 0; t < N; t++) {
      const a = num(1, 1);
      const w0 = Number(grab(/omega_0=(\d+)/, a.q)[1]);
      const g = Number(grab(/gamma=(\d+)/, a.q)[1]);
      const f0 = Number(grab(/f_0=(\d+)/, a.q)[1]);
      expect(fval(a.ans)).toBeCloseTo(f0 * amp(w0, w0, g), 9);
      const b = num(1, 2);
      const w0b = Number(grab(/omega_0=(\d+)/, b.q)[1]);
      const f0b = Number(grab(/f_0=(\d+)/, b.q)[1]);
      expect(fval(b.ans)).toBeCloseTo(f0b * amp(1e-9, w0b, 1), 6);
    }
  });
  it("corde : f_n = nv/2L ; Doppler ; décibels", () => {
    for (let t = 0; t < N; t++) {
      const c = num(2, 1);
      const L = Number(grab(/longueur (\d) m/, c.q)[1]);
      const v = Number(grab(/célérité (\d+) m/, c.q)[1]);
      const n = Number(grab(/mode (\d)/, c.q)[1]);
      expect(fval(c.ans)).toBeCloseTo((n * v) / (2 * L), 9);
      const d = num(2, 2);
      const f = Number(grab(/fréquence (\d+) Hz/, d.q)[1]);
      const vs = Number(grab(/à (\d+) m\/s \(/, d.q)[1]);
      const fp = d.q.includes("s'approche") ? f / (1 - vs / 340) : f / (1 + vs / 340);
      expect(fval(d.ans)).toBeCloseTo(fp, 9);
      const b = num(2, 3);
      const fac = Number(grab(/par (\d+)\./, b.q)[1]);
      expect(fval(b.ans)).toBeCloseTo(10 * Math.log10(fac), 9);
    }
  });
});
