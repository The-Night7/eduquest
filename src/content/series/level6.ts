// Niveau 6 : Calculer une somme (fiche 6)
import { fdiv, Fr, ftex, Hk } from "../../core/fraction";
import { ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Num, poolQcm, poolVF } from "../factories";

function pf(): RawQuestion {
  const k = ri(1, 4);
  const s = fdiv(Hk(k), Fr(k));
  return Num(
    "Calcule " + m(L`\sum_{n=1}^{+\infty}\frac{1}{n(n+${k})}`) + " (fraction ou décimal).",
    s,
    m(L`\frac{1}{n(n+${k})}=\frac1${k}\left(\frac1n-\frac1{n+${k}}\right)`) + " : télescopage, somme " + m(L`\frac{H_${k}}{${k}}=${ftex(s)}`) + ".",
  );
}

function tele(): RawQuestion {
  const k = ri(2, 5);
  const s = Hk(k);
  return Num(
    "Calcule " + m(L`\sum_{n=1}^{+\infty}\left(\frac1n-\frac1{n+${k}}\right)`) + " (fraction ou décimal).",
    s,
    m(L`S_N=\sum_{i=1}^{${k}}\frac1i-\sum_{i=N+1}^{N+${k}}\frac1i\to${ftex(s)}`) + ".",
  );
}

function fromN(): RawQuestion {
  const N = ri(1, 9);
  return Num(
    "Calcule " + m(L`\sum_{n=${N}}^{+\infty}\frac{1}{n(n+1)}`) + " (fraction ou décimal).",
    Fr(1, N),
    m(L`\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}`) + ", donc " + m(L`S=\frac1${N}`) + ".",
  );
}

function geo(): RawQuestion {
  const p = ri(1, 4), q = ri(p + 1, p + 3), s = ri(1, 3);
  const ans = Fr(Math.pow(q, s + 1), q - p);
  return Num(
    "Calcule " + m(L`\sum_{n=0}^{+\infty}\frac{${p}^n}{${q}^{n${s === 0 ? "" : "-" + s}}}`) + " (fraction ou décimal).",
    ans,
    "On sort la constante : " + m(L`${q}^{${s}}\sum\left(\frac{${p}}{${q}}\right)^n=${q}^{${s}}\times\frac{${q}}{${q - p}}=${ftex(ans)}`) + ".",
  );
}

function fact(): RawQuestion {
  const b = ri(-2, 3), c = ri(-3, 3);
  const lam = 2 + b + c;
  const poly =
    "n^2" +
    (b === 0 ? "" : (b > 0 ? "+" : "") + (b === 1 ? "" : b === -1 ? "-" : b) + "n") +
    (c === 0 ? "" : (c > 0 ? "+" : "") + c);
  return Num(
    "On a " + m(L`\sum_{n=0}^{+\infty}\frac{${poly}}{n!}=\lambda\,e`) + ". Donne " + m(L`\lambda`) + ". (entier)",
    Fr(lam),
    m(L`n^2=n(n-1)+n`) + " : " + m(L`\sum\frac{n^2}{n!}=e+e=2e`) + ", " + m(L`\sum\frac{n}{n!}=e`) + ", " + m(L`\sum\frac1{n!}=e`) +
      ". Donc " + m(L`\lambda=2+(${b})+(${c})=${lam}`) + ".",
  );
}

const ref = poolQcm([
  { q: m(L`\sum_{n\ge0}\frac{(-1)^n}{n+1}`) + " vaut :", r: m(L`\ln2`), w: [m("1"), m(L`e-1`), m(L`\frac\pi4`)], e: "Valeur à connaître (TD1, exercice 11)." },
  { q: m(L`\sum_{n\ge1}\left(\ln n-2\ln(n+1)+\ln(n+2)\right)`) + " vaut :", r: m(L`-\ln2`), w: [m("0"), m(L`\ln2`), "La série diverge"], e: m(L`S_N=-\ln2+\ln\frac{N+2}{N+1}\to-\ln2`) + "." },
  { q: m(L`\sum_{n\ge1}\frac{1}{n(n+1)(n+2)}`) + " vaut :", r: m(L`\frac14`), w: [m(L`\frac12`), m("1"), m(L`\frac16`)], e: "Éléments simples puis télescopage." },
]);

const vf = poolVF([
  { q: "On peut toujours couper une somme infinie en deux séries.", t: false, e: "Seulement si chaque morceau converge." },
  { q: "Pour un télescopage, on travaille sur la somme partielle " + m("S_N") + " puis on passe à la limite.", t: true, e: "C'est la méthode propre." },
  { q: m(L`\frac{n(n-1)}{n!}=\frac{1}{(n-2)!}`) + " pour " + m(L`n\ge2`) + ".", t: true, e: "Simplification de la factorielle." },
]);

export const level: Level = {
  id: "L6",
  name: "Calculer une somme",
  fiche: "Fiche 6",
  icon: "🧮",
  color: "#14b8a6",
  gens: [["pf", pf], ["tele", tele], ["N", fromN], ["geo", geo], ["fact", fact], ["ref", ref], ["vf", vf]],
  piege: "On ne coupe une somme infinie en deux que si chaque morceau converge. Télescopage : travaille sur " + m("S_N") + " puis passe à la limite.",
  rappel: [
    "Télescopage : " + m(L`u_n=a_n-a_{n+1}\Rightarrow\sum_{1}^{N}u_n=a_1-a_{N+1}`) + ".",
    "Fraction rationnelle : éléments simples, puis différences.",
    "Polynôme sur " + m("n!") + " : base " + m(L`1,\ n,\ n(n-1)`) + ", chaque morceau vaut " + m("e") + ".",
  ],
};
