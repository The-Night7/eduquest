import { describe, expect, it } from "vitest";
import { build } from "../src/content";
import { Fr, fval } from "../src/core/fraction";
import { charAt, det, fromDiag, inverse, mmul, mpow, identity, mat } from "../src/core/matrix";
import { binom, arr, multinomial, factNum } from "../src/core/combi";
import type { Question } from "../src/types";
import { grab, texFn } from "./texeval";

const CI = 2;
const N = 250;
const num = (li: number, gi: number): Question & { k: "num" } => {
  const q = build(CI, li, gi);
  if (q.k !== "num") throw new Error("num attendu");
  return q;
};
/** Première matrice pmatrix du texte → tableau de nombres. */
const pm = (s: string, nth = 0): number[][] => {
  const all = [...s.matchAll(/\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/g)];
  const body = all[nth]?.[1];
  if (body === undefined) throw new Error("pmatrix introuvable");
  return body.split("\\\\").map((r) => r.split("&").map((x) => Number(x.trim())));
};
const mulN = (A: number[][], B: number[][]): number[][] => A.map((r) => B[0]!.map((_, j) => r.reduce((s, x, k) => s + x * B[k]![j]!, 0)));
const eig2 = (A: number[][]): [number, number] => {
  const t = A[0]![0]! + A[1]![1]!, d = A[0]![0]! * A[1]![1]! - A[0]![1]! * A[1]![0]!;
  const disc = Math.sqrt(t * t - 4 * d);
  return [(t - disc) / 2, (t + disc) / 2];
};
function jacobi(S: number[][]): number[] {
  const n = S.length, a = S.map((r) => r.slice());
  for (let it = 0; it < 200; it++) {
    let p = 0, q = 1, mx = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(a[i]![j]!) > mx) { mx = Math.abs(a[i]![j]!); p = i; q = j; }
    if (mx < 1e-13) break;
    const phi = 0.5 * Math.atan2(2 * a[p]![q]!, a[p]![p]! - a[q]![q]!), c = Math.cos(phi), s = Math.sin(phi);
    for (let k = 0; k < n; k++) { const x = a[k]![p]!, y = a[k]![q]!; a[k]![p] = c * x + s * y; a[k]![q] = -s * x + c * y; }
    for (let k = 0; k < n; k++) { const x = a[p]![k]!, y = a[q]![k]!; a[p]![k] = c * x + s * y; a[q]![k] = -s * x + c * y; }
  }
  return a.map((r, i) => r[i]!);
}

describe("bibliothèques matrix / combi", () => {
  it("jacobi (test) retrouve les valeurs propres connues", () => {
    expect(jacobi([[2, 1], [1, 2]]).sort()).toEqual([expect.closeTo(1, 9), expect.closeTo(3, 9)]);
  });
  it("det, inverse, puissance, valeurs propres de fromDiag", () => {
    for (let t = 0; t < 200; t++) {
      const n = 2 + (t % 2);
      const D = Array.from({ length: n }, (_, i) => i + 1 + (t % 5));
      const { A, P } = fromDiag(D, 3);
      expect(fval(det(A))).toBeCloseTo(D.reduce((a, b) => a * b, 1), 9);
      const I = mmul(A, inverse(A));
      I.forEach((r, i) => r.forEach((x, j) => expect(Math.abs(fval(x) - (i === j ? 1 : 0))).toBe(0)));
      D.forEach((lam) => expect(Math.abs(fval(charAt(A, Fr(lam))))).toBe(0));
      expect(fval(det(P))).toBe(1);
      const A3 = mpow(A, 3), alt = mmul(A, mmul(A, A));
      A3.forEach((r, i) => r.forEach((x, j) => expect(fval(x) - fval(alt[i]![j]!)).toBe(0)));
    }
    expect(mpow(mat([[1, 1], [0, 1]]), 5)[0]![1]).toEqual(Fr(5));
    expect(mpow(identity(3), 4)).toEqual(identity(3));
  });
  it("combinatoire (valeurs connues)", () => {
    expect(binom(10, 3)).toBe(120);
    expect(arr(5, 2)).toBe(20);
    expect(factNum(6)).toBe(720);
    expect(multinomial([2, 1, 1])).toBe(12);
    expect(binom(20, 10)).toBe(184756);
  });
});

describe("Algèbre linéaire — recoupements numériques", () => {
  it("L1 trace / déterminant et valeurs extrêmes", () => {
    for (let t = 0; t < N; t++) {
      let q = num(0, 0);
      let A = pm(q.q);
      const [l1, l2] = eig2(A);
      expect(fval(q.ans)).toBeCloseTo(q.q.includes("somme") ? l1 + l2 : l1 * l2, 9);
      q = num(0, 1);
      A = pm(q.q);
      const [a, b] = eig2(A);
      expect(fval(q.ans)).toBeCloseTo(q.q.includes("plus grande") ? b : a, 9);
    }
  });
  it("L1 troisième valeur propre", () => {
    for (let t = 0; t < N; t++) {
      const q = num(0, 2);
      const A = pm(q.q);
      const r = grab(/admet \$(-?\d+)\$ et \$(-?\d+)\$/, q.q);
      const [a, b] = [Number(r[1]), Number(r[2])];
      const c = fval(q.ans);
      for (const lam of [a, b, c]) {
        const M = A.map((row, i) => row.map((x, j) => (i === j ? x - lam : x)));
        const d = M[0]![0]! * (M[1]![1]! * M[2]![2]! - M[1]![2]! * M[2]![1]!) - M[0]![1]! * (M[1]![0]! * M[2]![2]! - M[1]![2]! * M[2]![0]!) + M[0]![2]! * (M[1]![0]! * M[2]![1]! - M[1]![1]! * M[2]![0]!);
        expect(d).toBeCloseTo(0, 6);
      }
    }
  });
  it("L1 vecteur propre ou non", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 0, 3);
      if (q.k !== "qcm") throw new Error();
      const A = pm(q.q, 0), v = pm(q.q, 1).map((r) => r[0]!);
      const Av = A.map((r) => r[0]! * v[0]! + r[1]! * v[1]!);
      const zero = v[0] === 0 && v[1] === 0;
      const colinear = Av[0]! * v[1]! === Av[1]! * v[0]!;
      expect(q.a).toBe(zero ? 2 : colinear ? 0 : 1);
    }
  });
  it("L2 puissance de matrice", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 0);
      const A = pm(q.q);
      const k = Number(grab(/A\^\{(\d)\}/, q.q)[1]);
      const [i, j] = [Number(grab(/ligne (\d)/, q.q)[1]) - 1, Number(grab(/colonne (\d)/, q.q)[1]) - 1];
      let R = [[1, 0], [0, 1]];
      for (let s = 0; s < k; s++) R = mulN(R, A);
      expect(fval(q.ans)).toBe(R[i]![j]);
    }
  });
  it("L2 suite récurrente : α retrouvé par résolution des moindres carrés", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 1);
      const txt = grab(/\$u_\{n\+2\}=([^$]*)\$/, q.q)[1] as string;
      const c1 = /^(-?\d*)u_\{n\+1\}/.exec(txt);
      const s = c1 ? (c1[1] === "" ? 1 : c1[1] === "-" ? -1 : Number(c1[1])) : 0;
      const c0 = /([+-]?\d*)u_n$/.exec(txt);
      const cc = c0 ? (c0[1] === "" || c0[1] === "+" ? 1 : c0[1] === "-" ? -1 : Number(c0[1])) : 0;
      const u0 = Number(grab(/u_0=(-?\d+)/, q.q)[1]), u1 = Number(grab(/u_1=(-?\d+)/, q.q)[1]);
      const roots = grab(/\\alpha\\,\((-?\d+)\)\^n\+\\beta\\,\((-?\d+)\)\^n/, q.q);
      const [r1, r2] = [Number(roots[1]), Number(roots[2])];
      const u = [u0, u1];
      for (let n = 2; n < 8; n++) u.push(s * u[n - 1]! + cc * u[n - 2]!);
      const alpha = fval(q.ans);
      const beta = u0 - alpha;
      for (let n = 0; n < 8; n++) expect(alpha * r1 ** n + beta * r2 ** n).toBeCloseTo(u[n]!, 6);
    }
  });
  it("L2 système différentiel : x(0) et x'(0)", () => {
    for (let t = 0; t < N; t++) {
      const q = num(1, 2);
      const A = pm(q.q, 0), X0 = pm(q.q, 1).map((r) => r[0]!);
      const ev = grab(/valeurs propres de A sont \$(-?\d+)\$ et \$(-?\d+)\$/, q.q);
      const [d1, d2] = [Number(ev[1]), Number(ev[2])];
      const a = fval(q.ans), b = X0[0]! - a;
      expect(a * d1 + b * d2).toBeCloseTo(A[0]![0]! * X0[0]! + A[0]![1]! * X0[1]!, 9);
    }
  });
  it("L3 orthogonalité, projection, distance, Gram–Schmidt", () => {
    for (let t = 0; t < N; t++) {
      let q = num(2, 0);
      const u = pm(q.q, 0).map((r) => r[0] ?? NaN), v = pm(q.q, 1).map((r) => r[0]!);
      const uu = [u[0]!, u[1]!, fval(q.ans)];
      expect(uu[0]! * v[0]! + uu[1]! * v[1]! + uu[2]! * v[2]!).toBeCloseTo(0, 9);
      q = num(2, 1);
      const [a, b] = [pm(q.q, 0).map((r) => r[0]!), pm(q.q, 1).map((r) => r[0]!)];
      const dp = (x: number[], y: number[]): number => x.reduce((s, xi, i) => s + xi * y[i]!, 0);
      const k = fval(q.ans);
      expect(dp(a, b.map((x, i) => x - k * a[i]!))).toBeCloseTo(0, 9); // v − k·u ⟂ u
      q = num(2, 2);
      const [a2, b2] = [pm(q.q, 0).map((r) => r[0]!), pm(q.q, 1).map((r) => r[0]!)];
      const k2 = dp(a2, b2) / dp(a2, a2);
      const w = b2.map((x, i) => x - k2 * a2[i]!);
      expect(Math.sqrt(dp(w, w)) ** 2).toBeCloseTo(fval(q.ans) - 0 || dp(w, w), 6);
    }
  });
  it("L3 distance² = ‖v − proj‖²", () => {
    for (let t = 0; t < N; t++) {
      const q = num(2, 2);
      const [a, b] = [pm(q.q, 0).map((r) => r[0]!), pm(q.q, 1).map((r) => r[0]!)];
      const dp = (x: number[], y: number[]): number => x.reduce((s, xi, i) => s + xi * y[i]!, 0);
      const k = dp(a, b) / dp(a, a);
      const w = b.map((x, i) => x - k * a[i]!);
      expect(dp(w, w)).toBeCloseTo(fval(q.ans), 9);
    }
  });
  it("L3 produit scalaire de type DS3 : positivité par échantillonnage", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 2, 4);
      if (q.k !== "qcm") throw new Error();
      const M = pm(q.q.length ? q.exp : "", 0);
      let pos = true;
      for (let k = 0; k < 720; k++) {
        const x = Math.cos((k * Math.PI) / 360), y = Math.sin((k * Math.PI) / 360);
        if (M[0]![0]! * x * x + 2 * x * y + M[1]![1]! * y * y <= 1e-9) pos = false;
      }
      expect(q.a).toBe(pos ? 0 : 1);
    }
  });
  it("L3 Gram polynomial : ∫ x^(w+i+j)", () => {
    for (let t = 0; t < 100; t++) {
      const q = num(2, 5);
      const w = q.q.includes("x^{2}P") ? 2 : q.q.includes("x^{") ? 0 : q.q.includes("int_0^1 x") ? 1 : 0;
      const [i, j] = [Number(grab(/X\^\{(\d)\},X\^\{(\d)\}/, q.q)[1]), Number(grab(/X\^\{(\d)\},X\^\{(\d)\}/, q.q)[2])];
      void w;
      let s = 0;
      const M = 20000, e = q.q.includes("\\int_0^1 x^{2}") ? 2 : q.q.includes("\\int_0^1 xP") ? 1 : 0;
      for (let m = 0; m < M; m++) { const x = (m + 0.5) / M; s += (x ** e) * x ** i * x ** j / M; }
      expect(s).toBeCloseTo(fval(q.ans), 5);
    }
  });
  it("L4 coefficient de la matrice d'une forme quadratique", () => {
    for (let t = 0; t < N; t++) {
      const q = num(3, 0);
      const f = texFn(grab(/q\(x,y,z\)=([^$]*)\$/, q.q)[1] as string, ["x", "y", "z"]);
      const [i, j] = [Number(grab(/s_\{(\d)(\d)\}/, q.q)[1]) - 1, Number(grab(/s_\{(\d)(\d)\}/, q.q)[2]) - 1];
      const e = (k: number): number[] => [0, 0, 0].map((_, idx) => (idx === k ? 1 : 0));
      const add = (a: number[], b: number[]): number[] => a.map((x, k) => x + b[k]!);
      const cross = (f(...add(e(i), e(j)) as [number, number, number]) - f(...(e(i) as [number, number, number])) - f(...(e(j) as [number, number, number]))) / 2;
      expect(cross).toBeCloseTo(fval(q.ans), 9);
    }
  });
  it("L4 évaluation q(X) = XᵀBX", () => {
    for (let t = 0; t < N; t++) {
      const q = num(3, 1);
      const B = pm(q.q, 0), v = pm(q.q, 1).map((r) => r[0]!);
      expect(v[0]! * (B[0]![0]! * v[0]! + B[0]![1]! * v[1]!) + v[1]! * (B[1]![0]! * v[0]! + B[1]![1]! * v[1]!)).toBeCloseTo(fval(q.ans), 9);
    }
  });
  it("L4 signature = signes des valeurs propres de la matrice symétrique", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 3, 2);
      if (q.k !== "qcm") throw new Error();
      const f = texFn(grab(/q\(x,y,z\)=([^$]*)\$/, q.q)[1] as string, ["x", "y", "z"]);
      const S = [0, 1, 2].map((i) => [0, 1, 2].map((j) => {
        const e = (k: number): [number, number, number] => [k === 0 ? 1 : 0, k === 1 ? 1 : 0, k === 2 ? 1 : 0] as [number, number, number];
        if (i === j) return f(...e(i));
        const s = e(i).map((x, k) => x + e(j)[k]!) as [number, number, number];
        return (f(...s) - f(...e(i)) - f(...e(j))) / 2;
      }));
      const ev = jacobi(S);
      const p = ev.filter((x) => x > 1e-7).length, n = ev.filter((x) => x < -1e-7).length;
      expect(q.o[q.a]).toBe(`(${p}, ${n})`);
    }
  });
  it("L4 définie / indéfinie / dégénérée", () => {
    for (let t = 0; t < N; t++) {
      const q = build(CI, 3, 3);
      if (q.k !== "qcm") throw new Error();
      const S = pm(q.exp);
      const ev = jacobi(S);
      const kind = ev.every((x) => x > 1e-9) ? 0 : ev.every((x) => x < -1e-9) ? 1 : ev.some((x) => Math.abs(x) < 1e-9) ? 3 : 2;
      expect(q.a).toBe(kind);
    }
  });
  it("L4 Gauss guidé : q(−k,1) = c", () => {
    for (let t = 0; t < 100; t++) {
      const q = build(CI, 3, 6);
      if (q.k !== "guided") throw new Error();
      const f = texFn(grab(/q\(x,y\)=([^$]*)\$/, q.q)[1] as string, ["x", "y"]);
      const k = Number(grab(/\+(\d+)xy/, q.q)[1]) / 2;
      const c = fval((q.steps[0]!.ans as { ans: { n: number; d: number } }).ans);
      expect(f(-k, 1)).toBe(c);
      expect(f(1, 0) + 0).toBe(1);
    }
  });
  it("L5 inverse via Cayley–Hamilton", () => {
    for (let t = 0; t < N; t++) {
      const q = num(4, 0);
      const A = pm(q.q);
      const d = A[0]![0]! * A[1]![1]! - A[0]![1]! * A[1]![0]!;
      const inv = [[A[1]![1]! / d, -A[0]![1]! / d], [-A[1]![0]! / d, A[0]![0]! / d]];
      const [i, j] = [Number(grab(/\((\d),(\d)\)/, q.q)[1]) - 1, Number(grab(/\((\d),(\d)\)/, q.q)[2]) - 1];
      expect(fval(q.ans)).toBeCloseTo(inv[i]![j]!, 9);
    }
  });
  it("L5 matrice symétrique guidée : valeurs propres a±b", () => {
    for (let t = 0; t < 60; t++) {
      const q = build(CI, 4, 3);
      if (q.k !== "guided") throw new Error();
      const S = pm(q.q);
      const ev = jacobi(S).sort((x, y) => x - y);
      const nums = q.steps.filter((s) => s.ans.k === "num").map((s) => fval((s.ans as { ans: { n: number; d: number } }).ans));
      expect([nums[0]!, nums[1]!].sort((x, y) => x - y)[0]).toBeCloseTo(ev[0]!, 9);
      expect(nums[2]).toBeCloseTo(ev[1]!, 9);
    }
  });
});
