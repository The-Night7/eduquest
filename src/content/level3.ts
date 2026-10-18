// Niveau 3 : Séries à termes positifs (fiche 3)
import { fadd, fdiv, fgt1, Fr, fmul, ftex, type Fraction } from "../core/fraction";
import { pick, ri } from "../core/rng";
import { invPow, L, m, powN, pwn } from "../core/tex";
import type { Level, RawQuestion } from "../types";
import { Nat, poolVF } from "./factories";

function nat(): RawQuestion {
  const kind = ri(0, 5);
  let tex: string;
  let conv: boolean;
  let exp: string;
  const riem = (eq: string, e: Fraction) =>
    m(L`u_n\sim${eq}`) + ", Riemann avec " + m(L`\alpha=${ftex(e)}`) + (fgt1(e) ? " > 1 : converge." : " ≤ 1 : diverge.");

  if (kind <= 2) {
    const a = pick([Fr(1, 2), Fr(1), Fr(3, 2), Fr(2)]);
    const u = invPow(a);
    tex = [L`\ln\left(1+${u}\right)`, L`e^{${u}}-1`, L`\sin\left(${u}\right)`][kind] as string;
    conv = fgt1(a);
    exp = riem(u, a);
  } else if (kind === 3) {
    const a = pick([Fr(1, 4), Fr(1, 2), Fr(1), Fr(2)]);
    const e = fmul(a, Fr(2));
    tex = L`1-\cos\left(${invPow(a)}\right)`;
    conv = fgt1(e);
    exp = m(L`1-\cos u\sim\frac{u^2}{2}`) + " donc " + riem(L`\frac{1}{2${powN(e)}}`, e);
  } else if (kind === 4) {
    const p = ri(1, 4), q = ri(2, 6), d = q - p;
    tex = L`\frac{${pwn(p)}+1}{${pwn(q)}+n}`;
    conv = d > 1;
    exp =
      d <= 0
        ? m(L`u_n\to${d === 0 ? "1" : "+\\infty"}`) + " : divergence grossière."
        : m(L`u_n\sim\frac{1}{${pwn(d)}}`) + ", Riemann avec " + m(L`\alpha=${d}`) + (conv ? " > 1 : converge." : " ≤ 1 : diverge.");
  } else {
    const a = pick([Fr(1, 2), Fr(1), Fr(5, 4), Fr(3, 2), Fr(2)]);
    tex = L`\frac{\ln n}{${powN(a)}}`;
    conv = fgt1(a);
    exp = conv
      ? "Règle " + m(L`n^{\alpha}u_n\to0`) + " avec " + m(L`\alpha=${ftex(fdiv(fadd(a, Fr(1)), Fr(2)))}>1`) + " : converge."
      : m(L`u_n\ge\frac{1}{${powN(a)}}`) + " dès " + m(L`n\ge3`) + ", et Riemann diverge (" + m(L`\alpha=${ftex(a)}\le1`) + ").";
  }
  return Nat("Nature de " + m(L`\sum_{n\ge2}${tex}`) + " ?", conv, exp);
}

function ineq(): RawQuestion {
  const k = pick([Fr(1, 2), Fr(1), Fr(2), Fr(3)]);
  const conv = fgt1(k);
  return Nat(
    "Nature de " + m(L`\sum_{n\ge1}\frac{1}{${powN(k)}\left(2+\sin n\right)}`) + " ?",
    conv,
    "Comme " + m(L`1\le2+\sin n\le3`) + " : " + m(L`\frac{1}{3${powN(k)}}\le u_n\le\frac{1}{${powN(k)}}`) +
      ". Par comparaison avec Riemann (" + m(L`\alpha=${ftex(k)}`) + (conv ? " > 1) : converge." : " ≤ 1) : diverge."),
  );
}

const vf = poolVF([
  { q: "On peut sommer des équivalents : " + m(L`u_n\sim a_n`) + " et " + m(L`v_n\sim b_n`) + " donnent " + m(L`u_n+v_n\sim a_n+b_n`) + ".", t: false, e: m(L`n+1\sim n`) + " et " + m(L`-n\sim-n`) + ", mais " + m(L`(n+1)+(-n)=1`) + " n'est pas équivalent à 0." },
  { q: "Si " + m(L`0\le u_n\le v_n`) + " et " + m(L`\sum u_n`) + " diverge, alors " + m(L`\sum v_n`) + " diverge.", t: true, e: "Contraposée de la comparaison par inégalité." },
  { q: "Si " + m(L`u_n\le v_n`) + " et " + m(L`\sum v_n`) + " converge, alors " + m(L`\sum u_n`) + " converge.", t: false, e: "Il faut " + m(L`0\le u_n`) + " : " + m(L`u_n=-1`) + " et " + m(L`v_n=\frac1{n^2}`) + "." },
  { q: "Si " + m(L`u_n\sim v_n`) + " (signes quelconques), alors " + m(L`\sum u_n`) + " et " + m(L`\sum v_n`) + " ont même nature.", t: false, e: "Faux si le signe change : " + m(L`\frac{(-1)^n}{\sqrt n+(-1)^n}\sim\frac{(-1)^n}{\sqrt n}`) + " mais la première série diverge et la seconde converge." },
  { q: "À termes positifs, " + m(L`\sum u_n`) + " converge si et seulement si la suite des sommes partielles est majorée.", t: true, e: "Croissante et majorée implique convergente." },
  { q: "Soit " + m("f") + " positive et décroissante : " + m(L`\sum f(n)`) + " et " + m(L`\int^{+\infty}f`) + " ont même nature.", t: true, e: "Comparaison série-intégrale." },
  { q: "On peut remplacer un terme par son équivalent à l'intérieur d'un logarithme.", t: false, e: m(L`1+\frac1n\sim1`) + " mais " + m(L`\ln(1+\frac1n)\sim\frac1n`) + " et non " + m(L`\ln 1=0`) + " : passe par un développement limité." },
  { q: "Si " + m(L`n^\alpha u_n\to0`) + " avec " + m(L`\alpha>1`) + ", alors " + m(L`\sum u_n`) + " converge.", t: true, e: "Domination par " + m(L`\frac{1}{n^\alpha}`) + "." },
]);

export const level: Level = {
  id: "L3",
  name: "Termes positifs",
  fiche: "Fiche 3",
  icon: "🏔️",
  color: "#9b59ff",
  gens: [["nat", nat], ["nat2", nat], ["ineq", ineq], ["vf", vf]],
  piege: "On ne somme pas des équivalents et on ne les compose pas à gauche (pas dans un ln ou un exp). Faux si le signe change.",
  rappel: [
    "Sommes partielles majorées ; inégalité ; équivalent ; domination ; règle " + m(L`n^\alpha`) + " ; série-intégrale.",
    "Écris toujours « série à termes positifs » avant d'utiliser ces outils.",
    "L'équivalent est l'outil le plus rentable.",
  ],
};
