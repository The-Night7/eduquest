// Intégration & probabilités · niveau 3 : intégrales doubles, changement de variables
import { Fr, fmul, ftex } from "../../core/fraction";
import { ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Order, poolQcm } from "../factories";

function ellipse(): RawQuestion {
  const a = ri(1, 6), b = ri(1, 6);
  return Num(
    "L'aire de l'ellipse " + m(L`\frac{x^2}{${a * a}}+\frac{y^2}{${b * b}}\le1`) + " vaut " + m(L`c\,\pi`) + ". Calcule " + m("c") + ".",
    Fr(a * b),
    `Changement x = ${a}r cosθ, y = ${b}r sinθ : jacobien ${a}·${b}·r. Aire = ${a * b}·∫₀^{2π}∫₀¹ r dr dθ = ${a * b}π.`,
  );
}

function parallelogram(): RawQuestion {
  const a = ri(1, 6), b = ri(1, 6);
  return Num(
    "Aire de " + m(L`D=\{(x,y):\ 0\le x+y\le ${a},\ 0\le x-y\le ${b}\}`) + " ?",
    Fr(a * b, 2),
    `Posons u = x+y, v = x−y : le jacobien de (x,y) ↦ (u,v) vaut −2, donc dx dy = ½ du dv. Aire = ½·${a}·${b}.`,
  );
}

function polarMoment(): RawQuestion {
  const R = ri(1, 3), n = ri(0, 2);
  const f = n === 0 ? L`x^2+y^2` : n === 1 ? L`(x^2+y^2)^2` : L`(x^2+y^2)^3`;
  return Num(
    m(L`\iint_{x^2+y^2\le ${R * R}}${f}\,dx\,dy=c\,\pi`) + ". Calcule " + m("c") + ".",
    Fr(2 * R ** (2 * n + 4), 2 * n + 4),
    `Polaires : 2π ∫₀^${R} r^${2 * n + 3} dr = 2π·${R}^${2 * n + 4}/${2 * n + 4}, donc c = ${ftex(Fr(2 * R ** (2 * n + 4), 2 * n + 4))}.`,
  );
}

const jac = poolQcm([
  { q: "En coordonnées polaires, dx dy =", r: "r dr dθ", w: ["dr dθ", "r² dr dθ", "dr dθ / r"], e: "Le jacobien de (r,θ) ↦ (r cosθ, r sinθ) vaut r." },
  { q: "Pour (u,v) = (x+y, x−y), le jacobien |∂(x,y)/∂(u,v)| vaut…", r: "1/2", w: ["2", "1", "−2"], e: "∂(u,v)/∂(x,y) = −2, donc l'inverse vaut 1/2 en valeur absolue." },
  { q: "Théorème de Fubini (cas positif, Tonelli) : on peut intervertir l'ordre d'intégration si…", r: "f est positive (mesurable) ; le résultat peut valoir +∞", w: ["f est continue uniquement", "le domaine est un disque", "jamais"], e: "Pour f ≥ 0, ∬ = ∫∫ dans n'importe quel ordre, éventuellement +∞." },
  { q: "Pour une f de signe quelconque, Fubini exige…", r: "f intégrable sur le domaine (∬|f| < +∞)", w: ["f bornée uniquement", "f continue uniquement", "rien du tout"], e: "Sinon les intégrales itérées peuvent différer." },
  { q: "Aire d'un domaine D du plan =", r: "∬_D 1 dx dy", w: ["∬_D (x+y) dx dy", "∫_D dx", "∬_D r dr dθ sans domaine"], e: "On intègre la fonction constante 1." },
]);

function polarBug(): RawQuestion {
  const R = ri(1, 4);
  return Bug(
    "Aire du disque de rayon " + m(String(R)) + " en polaires. Une ligne est fausse.",
    [
      `On pose $x=r\\cos\\theta$, $y=r\\sin\\theta$, avec $r\\in[0,${R}]$ et $\\theta\\in[0,2\\pi]$.`,
      `Alors $dx\\,dy=dr\\,d\\theta$.`,
      `L'aire vaut $\\displaystyle\\int_0^{2\\pi}\\int_0^{${R}}dr\\,d\\theta=2\\pi\\times${R}$.`,
      `Cette aire vaut ${2 * R}π.`,
    ],
    1,
    [
      `Alors $dx\\,dy=r\\,dr\\,d\\theta$ : le jacobien vaut $r$.`,
      `Alors $dx\\,dy=r^2\\,dr\\,d\\theta$.`,
      `Alors $dx\\,dy=\\dfrac{dr\\,d\\theta}{r}$.`,
    ],
    `Le jacobien de passage aux polaires est r. On obtient ∫₀^{2π}∫₀^${R} r dr dθ = π·${R}² = ${R * R}π, et non ${2 * R}π (qui n'a pas la bonne dimension).`,
  );
}

function wedgeGuided(): RawQuestion {
  const R = ri(1, 3);
  return Guided(
    "Calcule " + m(L`I=\iint_D (x^2+y^2)\,dx\,dy`) + " où " + m(L`D`) + " est le quart de disque " + m(L`\{x\ge0,\ y\ge0,\ x^2+y^2\le ${R * R}\}`) + ".",
    [
      gq(
        "Quel changement de variables est adapté ?",
        ["Coordonnées polaires", "u = x+y, v = x−y", "u = x², v = y²", "Aucun, Fubini direct suffit"],
        ["Le domaine est un quart de disque ; l'intégrande ne dépend que de x²+y²."],
        "Disque et x²+y² : polaires, avec r ∈ [0,R] et θ ∈ [0,π/2].",
      ),
      gq(
        "Quelle est l'intégrale en polaires ?",
        [`∫₀^{π/2}∫₀^${R} r²·r dr dθ`, `∫₀^{π/2}∫₀^${R} r² dr dθ`, `∫₀^{2π}∫₀^${R} r²·r dr dθ`, `∫₀^{π/2}∫₀^${R * R} r·r dr dθ`],
        ["x²+y² = r², et dx dy = r dr dθ.", "Quart de disque : θ ∈ [0, π/2]."],
        "On remplace x²+y² par r², dx dy par r dr dθ, et on borne θ par [0, π/2].",
      ),
      gn("Calcule ∫₀^R r³ dr.", Fr(R ** 4, 4), ["Primitive : r⁴/4."], `${R}⁴/4 = ${ftex(Fr(R ** 4, 4))}.`),
      gn("Écris I = c·π et donne c.", fmul(Fr(1, 2), Fr(R ** 4, 4)), ["I = (π/2)·∫₀^R r³ dr."], `I = (π/2)·${ftex(Fr(R ** 4, 4))} = ${ftex(fmul(Fr(1, 2), Fr(R ** 4, 4)))}π.`),
    ],
    "Polaires : dx dy = r dr dθ. Quart de disque → θ ∈ [0,π/2] ; l'angle contribue π/2 au lieu de 2π.",
  );
}

function fubiniOrder(): RawQuestion {
  return Order(
    "Reconstitue le calcul de " + m(L`\int_0^{+\infty}\frac{1-e^{-t}}{t}\,e^{-t}\,dt`) + " par Fubini (écris " + m(L`\frac{1-e^{-t}}{t}=\int_0^1e^{-ut}du`) + ").",
    [
      "On écrit $\\dfrac{1-e^{-t}}{t}=\\displaystyle\\int_0^1e^{-ut}\\,du$, donc l'intégrale est $\\displaystyle\\int_0^{+\\infty}\\!\\!\\int_0^1e^{-(u+1)t}\\,du\\,dt$.",
      "L'intégrande est positive : Tonelli autorise d'échanger les intégrales.",
      "$\\displaystyle\\int_0^{+\\infty}e^{-(u+1)t}\\,dt=\\dfrac1{u+1}$.",
      "Il reste $\\displaystyle\\int_0^1\\dfrac{du}{u+1}=\\ln2$.",
    ],
    ["L'intégrande change de signe : on ne peut pas échanger.", "$\\displaystyle\\int_0^{+\\infty}e^{-(u+1)t}\\,dt=u+1$."],
  );
}

export const level: Level = {
  id: "ITP3",
  name: "Intégrales doubles",
  fiche: "CM ch. 1 · TD3",
  icon: "∬",
  color: "#f4a261",
  gens: [["ellipse", ellipse], ["parallelogram", parallelogram], ["polar-moment", polarMoment], ["jac", jac], ["polar-bug", polarBug], ["wedge-guided", wedgeGuided], ["fubini-order", fubiniOrder]],
  piege: "N'oublie jamais le jacobien : dx dy = r dr dθ. Et Fubini sans positivité exige l'intégrabilité.",
  rappel: [
    "Changement de variables : ∬_D f(x,y) dx dy = ∬_Δ f(φ(u,v)) |det Jφ| du dv.",
    "Polaires : jacobien r. Ellipse x = ar cosθ, y = br sinθ : jacobien abr.",
    "Fubini–Tonelli : f ≥ 0 ⇒ on échange librement ; f quelconque ⇒ il faut ∬|f| < ∞.",
    "Aire(D) = ∬_D 1 dx dy.",
  ],
};
