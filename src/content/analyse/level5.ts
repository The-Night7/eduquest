// Analyse ℝⁿ · niveau 5 : intégrales doubles
import { Fr, ftex, fmul } from "../../core/fraction";
import { pconst, pconstValue, pintegrate, pmono, px, pscale, padd, peval, ptex, type Poly } from "../../core/poly";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Qcm } from "../factories";
import { randPoly } from "./helpers";

/** Les domaines « triangulaires » : bornes de y en fonction de x, x ∈ [0, n]. */
interface Dom {
  tex: (n: number) => string;
  lo: (n: number) => Poly;
  hi: (n: number) => Poly;
  /** intégrale après permutation, tex */
  swapped: (n: number) => string;
  swapIdx: number;
}
const DOMS: Dom[] = [
  { tex: (n) => L`0\le x\le ${n},\ 0\le y\le x`, lo: () => pconst(0), hi: () => px(), swapped: (n) => L`\int_0^{${n}}\!\!\int_y^{${n}}f\,dx\,dy`, swapIdx: 0 },
  { tex: (n) => L`0\le x\le ${n},\ x\le y\le ${n}`, lo: () => px(), hi: (n) => pconst(n), swapped: (n) => L`\int_0^{${n}}\!\!\int_0^{y}f\,dx\,dy`, swapIdx: 1 },
  { tex: (n) => L`0\le x\le ${n},\ 0\le y\le ${n}-x`, lo: () => pconst(0), hi: (n) => padd(pconst(n), pscale(px(), -1)), swapped: (n) => L`\int_0^{${n}}\!\!\int_0^{${n}-y}f\,dx\,dy`, swapIdx: 2 },
];

const integrate = (f: Poly, lo: Poly, hi: Poly, n: number): ReturnType<typeof pconstValue> =>
  pconstValue(pintegrate(pintegrate(f, "y", lo, hi), "x", pconst(0), pconst(n)));

function rect(): RawQuestion {
  const f = randPoly(3, 3, 3);
  const a = ri(-1, 1), b = a + ri(1, 3), c = ri(0, 1), d = c + ri(1, 3);
  const v = pconstValue(pintegrate(pintegrate(f, "y", pconst(c), pconst(d)), "x", pconst(a), pconst(b)));
  return Num(
    "Calcule " + m(L`\iint_{[${a},${b}]\times[${c},${d}]}\left(${ptex(f)}\right)dx\,dy`) + ".",
    v,
    "Fubini sur un pavé : on intègre en y puis en x (ou l'inverse), le résultat est le même. Valeur : " + ftex(v) + ".",
  );
}

function triangle(): RawQuestion {
  const dom = pick(DOMS);
  const n = ri(1, 3);
  const f = randPoly(2, 3, 3);
  const v = integrate(f, dom.lo(n), dom.hi(n), n);
  return Num(
    "Soit " + m(L`D=\{(x,y):\ ${dom.tex(n)}\}`) + ". Calcule " + m(L`\iint_D\left(${ptex(f)}\right)dx\,dy`) + ".",
    v,
    "Les bornes de y dépendent de x : on intègre d'abord en y (bornes variables), puis en x (bornes constantes). Valeur : " + ftex(v) + ".",
  );
}

function polar(): RawQuestion {
  const R = ri(1, 3), k = ri(0, 2);
  const part = pick([
    { name: "du disque", phi: Fr(1), d: L`x^2+y^2\le ${R * R}` },
    { name: "du demi-disque", phi: Fr(1, 2), d: L`x^2+y^2\le ${R * R},\ y\ge0` },
    { name: "du quart de disque", phi: Fr(1, 4), d: L`x^2+y^2\le ${R * R},\ x\ge0,\ y\ge0` },
  ]);
  const integrand = k === 0 ? "1" : k === 1 ? L`x^2+y^2` : L`(x^2+y^2)^2`;
  const ans = fmul(part.phi, Fr(R ** (2 * k + 2), k + 1));
  return Num(
    "On a " + m(L`\iint_{${part.d}}${integrand}\,dx\,dy=c\,\pi`) + ". Calcule " + m("c") + ".",
    ans,
    `En polaires dx dy = r dr dθ : ∬ = (angle) ∫₀^${R} r^${2 * k + 1} dr = ${ftex(Fr(R ** (2 * k + 2), 2 * k + 2))}·(angle), avec angle = ${ftex(fmul(part.phi, Fr(2)))}π.`,
  );
}

function swap(): RawQuestion {
  const dom = pick(DOMS);
  const n = ri(1, 4);
  const cands = DOMS.map((d) => d.swapped(n)).concat([L`\int_0^{${n}}\!\!\int_0^{${n}}f\,dx\,dy`]);
  return Qcm(
    "On a " + m(L`I=\iint_D f\,dx\,dy`) + " avec " + m(L`D=\{${dom.tex(n)}\}`) + ". Quelle écriture correspond à l'intégrale en inversant l'ordre (dx d'abord) ?",
    cands.map(m),
    dom.swapIdx,
    "Dessine D : pour y fixé, x décrit le segment horizontal de D. Les bornes de y deviennent constantes.",
    true,
  );
}

function fubiniBug(): RawQuestion {
  const a = pick([1, 2, 3]);
  return Bug(
    "On calcule " + m(L`I=\iint_T xy\,dx\,dy`) + " avec " + m(L`T=\{0\le y\le x\le ${a}\}`) + ". Une ligne est fausse.",
    [
      `$T=\\{(x,y):0\\le x\\le ${a},\\ 0\\le y\\le x\\}$.`,
      `$I=\\int_0^{${a}}x\\,dx\\cdot\\int_0^{${a}}y\\,dy$.`,
      `$\\int_0^{x}y\\,dy=\\dfrac{x^2}{2}$ quand les bornes sont celles de T.`,
      `$I=\\int_0^{${a}}\\dfrac{x^3}{2}\\,dx=\\dfrac{${a ** 4}}{8}$.`,
    ],
    1,
    [
      `$I=\\int_0^{${a}}x\\left(\\int_0^{x}y\\,dy\\right)dx$.`,
      `$I=\\int_0^{${a}}x\\left(\\int_0^{${a}}y\\,dy\\right)dx$.`,
      `$I=\\int_0^{${a}}\\int_0^{x}(x+y)\\,dy\\,dx$.`,
    ],
    "Le produit de deux intégrales n'est valable que sur un PAVÉ. Sur un triangle, les bornes de y dépendent de x : I = ∫ x (∫₀ˣ y dy) dx.",
  );
}

function domainGuided(): RawQuestion {
  const p = pick([2, 3]);
  const F = pick([
    { f: padd(px(), pmono(1, 0, 1)), t: "x+y" },
    { f: pmono(1, 1, 1), t: "xy" },
    { f: padd(pscale(px(), 2), pmono(3, 0, 1)), t: "2x+3y" },
  ]);
  const lo = pmono(1, p, 0), hi = px();
  const inner = pintegrate(F.f, "y", lo, hi);
  const half = peval(inner, Fr(1, 2), Fr(0));
  const total = pconstValue(pintegrate(inner, "x", pconst(0), pconst(1)));
  return Guided(
    "Calcule " + m(L`\iint_D(${F.t})\,dx\,dy`) + " où " + m(L`D=\{(x,y):\ 0\le x\le1,\ x^{${p}}\le y\le x\}`) + ".",
    [
      gq(
        "Quelles bornes pour l'intégrale itérée (y d'abord) ?",
        [`y de x^${p} à x, puis x de 0 à 1`, `y de x à x^${p}, puis x de 0 à 1`, `y de 0 à 1, puis x de x^${p} à x`, `y de 0 à x, puis x de 0 à 1`],
        ["Sur [0,1], laquelle des courbes x et x^" + p + " est au-dessus ?", "x ≥ x^" + p + " pour x ∈ [0,1]."],
        `Pour x fixé, y va de la courbe basse x^${p} à la courbe haute x.`,
      ),
      gn(
        "Calcule l'intégrale intérieure G(x) = ∫ (…) dy, puis donne G(1/2).",
        half,
        ["Primitive en y, puis bornes x^" + p + " et x.", `G(x) = ${ptex(inner)}.`],
        `G(x) = ${ptex(inner)} ; en x = 1/2 : ${ftex(half)}.`,
      ),
      gn(
        "Calcule enfin ∫₀¹ G(x) dx.",
        total,
        ["Intègre le polynôme G terme à terme sur [0,1]."],
        `∫₀¹ (${ptex(inner)}) dx = ${ftex(total)}.`,
      ),
    ],
    "Domaine entre deux courbes : bornes de y variables (basse → haute), bornes de x constantes.",
  );
}

export const level: Level = {
  id: "ANR5",
  name: "Intégrales doubles",
  fiche: "Cours ch. 6 · TD",
  icon: "∬",
  color: "#f4a261",
  gens: [["rect", rect], ["triangle", triangle], ["polar", polar], ["swap", swap], ["fubini-bug", fubiniBug], ["domain-guided", domainGuided]],
  piege: "Sur un domaine non rectangulaire les bornes intérieures dépendent de la variable extérieure : on ne peut pas séparer en deux intégrales indépendantes.",
  rappel: [
    "Fubini : sur un pavé, ∬ f = ∫(∫ f dy) dx = ∫(∫ f dx) dy (f continue).",
    "Domaine {a ≤ x ≤ b, φ(x) ≤ y ≤ ψ(x)} : ∬ f = ∫ₐᵇ (∫_{φ(x)}^{ψ(x)} f dy) dx.",
    "Polaires : dx dy = r dr dθ ; disque de rayon R : r ∈ [0,R], θ ∈ [0,2π].",
    "Inverser l'ordre : dessiner le domaine et relire les bornes dans l'autre sens.",
  ],
};
