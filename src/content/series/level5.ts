// Niveau 5 : Séries à termes quelconques (fiche 5)
import { fgt1, Fr, fmul, ftex, fval } from "../../core/fraction";
import { pick } from "../../core/rng";
import { L, m, powN, pwn } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { ABS3, Nat, Num, poolVF, Qcm } from "../factories";

/** CSSA : plus petit n tel que a_{n+1} ≤ 10^-k. */
function rem(): RawQuestion {
  const [p, k] = pick<[number, number]>([[1, 2], [1, 3], [2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [3, 4]]);
  let n = 1;
  while (Math.pow(n + 1, p) < Math.pow(10, k)) n++;
  return Num(
    "CSSA pour " + m(L`\sum_{n\ge1}\frac{(-1)^n}{${pwn(p)}}`) + " : plus petit entier " + m("n") + " tel que " +
      m(L`|R_n|\le a_{n+1}\le10^{-${k}}`) + " ? (entier)",
    Fr(n),
    m(L`\frac{1}{(n+1)^{${p}}}\le10^{-${k}}\iff n+1\ge10^{${ftex(Fr(k, p))}}`) + ", donc " + m(L`n=${n}`) + ".",
  );
}

function abs(): RawQuestion {
  const k = pick([Fr(2), Fr(3), Fr(4), Fr(5, 2)]);
  return Qcm(
    "Nature de " + m(L`\sum\frac{\cos n}{${powN(k)}+1}`) + " ?",
    ABS3,
    0,
    "Réflexe 1, convergence absolue d'abord : " + m(L`|u_n|\le\frac{1}{${powN(k)}}`) + " avec " + m(L`\alpha=${ftex(k)}>1`) + ".",
  );
}

function perturb(): RawQuestion {
  const a = pick([Fr(1, 2), Fr(3, 4), Fr(1), Fr(2)]);
  const conv = fval(a) > 0.5;
  return Nat(
    "Nature de " + m(L`\sum\frac{(-1)^n}{${powN(a)}+(-1)^n}`) + " ?",
    conv,
    "Développement : " +
      m(L`\frac{(-1)^n}{${powN(a)}}-\frac{1}{${powN(fmul(a, Fr(2)))}}+O\left(\frac{1}{${powN(fmul(a, Fr(3)))}}\right)`) +
      ". Le 1er terme converge (alternée) et le 3e converge absolument ; le 2e converge si et seulement si " + m(L`2\alpha>1`) +
      " (ici " + m(L`2\alpha=${ftex(fmul(a, Fr(2)))}`) + (fgt1(fmul(a, Fr(2))) ? " : converge)." : " : diverge)."),
  );
}

const vf = poolVF([
  { q: "Pour le CSSA, il suffit que " + m("(a_n)") + " soit positive de limite nulle.", t: false, e: "Il faut aussi que " + m("(a_n)") + " soit décroissante." },
  { q: "CSSA : le reste vérifie " + m(L`|R_n|\le a_{n+1}`) + ".", t: true, e: "Encadrement par les sommes partielles paires et impaires." },
  { q: "Si " + m(L`\sum a_n`) + " et " + m(L`\sum b_n`) + " convergent absolument, leur produit de Cauchy converge vers le produit des sommes.", t: true, e: "Exemple : " + m(L`e^ae^b=e^{a+b}`) + "." },
  { q: "Si " + m(L`\sum a_n`) + " et " + m(L`\sum b_n`) + " convergent seulement, le produit de Cauchy converge toujours.", t: false, e: "Contre-exemple : " + m(L`a_i=b_i=\frac{(-1)^i}{\sqrt{1+i}}`) + "." },
  { q: m(L`\sum\frac{\cos n}{n^3+n}`) + " converge absolument.", t: true, e: m(L`\left|\frac{\cos n}{n^3+n}\right|\le\frac1{n^3}`) + "." },
  { q: m(L`\sum\frac{(-1)^n}{\sqrt n+(-1)^n}`) + " converge.", t: false, e: "Développement : " + m(L`\frac{(-1)^n}{\sqrt n}-\frac1n+O\left(\frac{1}{n^{3/2}}\right)`) + " : le terme en " + m(L`\frac1n`) + " fait diverger." },
  { q: m(L`\sum\frac{(-1)^n}{n+(-1)^n}`) + " converge (semi-convergente).", t: true, e: m(L`\frac{(-1)^n}{n}-\frac1{n^2}+O\left(\frac1{n^3}\right)`) + " : trois séries convergentes." },
]);

const abel = (): RawQuestion =>
  Qcm(
    "Quel outil pour " + m(L`\sum\frac{\sin(n\theta)}{\sqrt{n+1}}`) + " ?",
    ["CSSA", "Sommation d'Abel", "D'Alembert", "Série-intégrale"],
    1,
    "Les sommes partielles de " + m(L`\sin(n\theta)`) + " sont bornées et " + m(L`\frac{1}{\sqrt{n+1}}`) + " décroît vers 0.",
  );

export const level: Level = {
  id: "L5",
  name: "Termes quelconques",
  fiche: "Fiche 5",
  icon: "🎭",
  color: "#e5484d",
  gens: [["rem", rem], ["abs", abs], ["perturb", perturb], ["vf", vf], ["abel", abel]],
  piege: "Le critère d'équivalence est faux quand le terme change de signe : pousse le DL jusqu'à un reste en " + m("O") + " d'une série absolument convergente.",
  rappel: [
    "Dans l'ordre : convergence absolue, CSSA, développement limité.",
    "CSSA : " + m("(a_n)") + " positive décroissante de limite nulle ; alors " + m(L`|R_n|\le a_{n+1}`) + ".",
    "Produit de Cauchy : il faut la convergence absolue des deux séries.",
  ],
};
