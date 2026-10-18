// Niveau 2 : Séries de référence (fiche 2)
import { feq, fgt1, Fr, fdiv, fpow, fsub, ftex } from "../core/fraction";
import { pick, rand, ri } from "../core/rng";
import { invPow, L, m, powN } from "../core/tex";
import type { Level, RawQuestion } from "../types";
import { ABS3, Nat, Num, poolQcm, Qcm } from "./factories";

function riemann(): RawQuestion {
  const a = pick([Fr(1, 2), Fr(2, 3), Fr(1), Fr(5, 4), Fr(3, 2), Fr(2), Fr(3), Fr(7, 2), Fr(1, 3), Fr(11, 10)]);
  const conv = fgt1(a);
  return Nat(
    "Nature de " + m(L`\sum_{n\ge1}${invPow(a)}`) + " ?",
    conv,
    "Riemann : converge si et seulement si " + m(L`\alpha>1`) + ". Ici " + m(L`\alpha=${ftex(a)}`) + (conv ? " > 1." : " ≤ 1."),
  );
}

function alt(): RawQuestion {
  const a = pick([Fr(-1, 2), Fr(1, 3), Fr(1, 2), Fr(1), Fr(3, 2), Fr(2)]);
  const tex = a.n < 0 ? L`(-1)^n\sqrt{n}` : L`\frac{(-1)^n}{${powN(a)}}`;
  const r = a.n <= 0 ? 2 : fgt1(a) ? 0 : 1;
  return Qcm(
    "Nature de " + m(L`\sum_{n\ge1}${tex}`) + " ?",
    ABS3,
    r,
    r === 2
      ? "Le terme ne tend pas vers 0 : divergence grossière."
      : r === 0
        ? m(L`\alpha=${ftex(a)}>1`) + " : la série des valeurs absolues converge (Riemann)."
        : m(L`0<\alpha=${ftex(a)}\le1`) + " : converge (alternée) mais pas absolument : semi-convergente.",
  );
}

function geoSum(): RawQuestion {
  const q = ri(2, 7), p = ri(1, q - 1), neg = rand() < 0.35;
  const z = Fr(neg ? -p : p, q);
  if (rand() < 0.65) {
    const s = fdiv(Fr(1), fsub(Fr(1), z));
    return Num(
      "Calcule " + m(L`\sum_{n=0}^{+\infty}\left(${ftex(z)}\right)^n`) + ".",
      s,
      m(L`\frac{1}{1-z}=\frac{1}{1-${neg ? "(" : ""}${ftex(z)}${neg ? ")" : ""}}=${ftex(s)}`),
    );
  }
  const zz = Fr(1, q), N = ri(1, 3);
  const s = fdiv(fpow(zz, N), fsub(Fr(1), zz));
  return Num(
    "Calcule " + m(L`\sum_{n=${N}}^{+\infty}\left(${ftex(zz)}\right)^n`) + ".",
    s,
    m(L`\sum_{n\ge N}z^n=\frac{z^N}{1-z}=${ftex(s)}`),
  );
}

function geoNat(): RawQuestion {
  const q = ri(1, 6), p = ri(1, 7) * (rand() < 0.5 ? -1 : 1);
  const z = Fr(p, q), conv = Math.abs(p) < q;
  return Nat(
    "Nature de " + m(L`\sum_{n\ge0}\left(${ftex(z)}\right)^n`) + " ?",
    conv,
    "Géométrique : converge si et seulement si " + m(L`|z|<1`) + ". Ici " + m(L`|z|=${ftex(Fr(Math.abs(p), q))}`) + (conv ? " < 1." : " ≥ 1."),
  );
}

function bertrand(): RawQuestion {
  const b = pick([Fr(1, 2), Fr(1), Fr(3, 2), Fr(2), Fr(3)]);
  const conv = fgt1(b);
  const one = feq(b, Fr(1));
  const tex = one ? L`\frac{1}{n\ln n}` : L`\frac{1}{n(\ln n)^{${ftex(b)}}}`;
  const e = ftex(fsub(Fr(1), b));
  return Nat(
    "Nature de " + m(L`\sum_{n\ge2}${tex}`) + " ?",
    conv,
    "Comparaison série-intégrale avec " +
      (one
        ? m(L`\int\frac{dt}{t\ln t}=\ln(\ln t)\to+\infty`)
        : m(L`\int\frac{dt}{t(\ln t)^{${ftex(b)}}}=\frac{(\ln t)^{${e}}}{${e}}`) +
          (conv ? " qui a une limite finie." : " qui tend vers +∞.")) +
      " Bertrand : converge si et seulement si " + m(L`\beta>1`) + ".",
  );
}

const ref = poolQcm([
  { q: m(L`\sum_{k=1}^{n}\frac1k`) + " est équivalent à :", r: m(L`\ln n`), w: [m(L`n`), m(L`\ln(\ln n)`), m(L`\gamma`)], e: m(L`\sum_{k=1}^n\frac1k=\ln n+\gamma+o(1)`) + "." },
  { q: m(L`\sum_{n\ge1}\frac{1}{n^2}`) + " vaut :", r: m(L`\frac{\pi^2}{6}`), w: [m(L`\frac{\pi^2}{4}`), m(L`e`), m(L`2`)], e: "Valeur à connaître." },
  { q: m(L`\sum_{n\ge0}\frac{z^n}{n!}`) + " vaut :", r: m(L`e^{z}`), w: [m(L`\frac{1}{1-z}`), m(L`\ln(1+z)`), m(L`e^{-z}`)], e: "Série exponentielle, convergente pour tout " + m("z") + "." },
  { q: "Pour la comparaison série-intégrale, " + m("f") + " doit être :", r: "positive et décroissante", w: ["positive et croissante", "continue seulement", "de classe C²"], e: "On utilise " + m(L`f(k+1)\le\int_k^{k+1}f\le f(k)`) + ", qui demande la décroissance." },
]);

export const level: Level = {
  id: "L2",
  name: "Séries de référence",
  fiche: "Fiche 2",
  icon: "⛰️",
  color: "#2f8fff",
  gens: [["riemann", riemann], ["alt", alt], ["geoSum", geoSum], ["geoNat", geoNat], ["bertrand", bertrand], ["ref", ref]],
  piege: "Bertrand n'est pas un résultat à citer : il se redémontre par comparaison série-intégrale.",
  rappel: [
    "Géométrique " + m(L`\sum z^n`) + " : converge si et seulement si " + m(L`|z|<1`) + ", somme " + m(L`\frac{1}{1-z}`) + ", et " + m(L`\sum_{n\ge N}z^n=\frac{z^N}{1-z}`) + ".",
    "Riemann " + m(L`\sum\frac1{n^\alpha}`) + " : converge si et seulement si " + m(L`\alpha>1`) + " ; alternée : " + m(L`\alpha>0`) + ".",
    "Bertrand " + m(L`\sum\frac1{n(\ln n)^\beta}`) + " : converge si et seulement si " + m(L`\beta>1`) + ".",
  ],
};
