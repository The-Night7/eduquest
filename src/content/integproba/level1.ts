// Intégration & probabilités · niveau 1 : intégrales généralisées
import { Fr, fgt1, ftex, type Fraction } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Nat, Num, Order } from "../factories";

const ALPHAS = [Fr(1, 3), Fr(1, 2), Fr(2, 3), Fr(1), Fr(4, 3), Fr(3, 2), Fr(2), Fr(3)];
const xa = (a: Fraction): string => (a.n === 1 && a.d === 1 ? "x" : `x^{${ftex(a)}}`);

function riemann(): RawQuestion {
  const a = pick(ALPHAS);
  const atInf = ri(0, 1) === 0;
  const conv = atInf ? fgt1(a) : a.n < a.d;
  return Nat(
    "Nature de " + m(atInf ? L`\int_1^{+\infty}\frac{dx}{${xa(a)}}` : L`\int_0^{1}\frac{dx}{${xa(a)}}`) + " ?",
    conv,
    atInf
      ? `Riemann en +∞ : ∫₁^{+∞} dx/xᵅ converge ⇔ α > 1. Ici α = ${ftex(a).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}.`
      : `Riemann en 0 : ∫₀¹ dx/xᵅ converge ⇔ α < 1. Ici α = ${ftex(a).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}.`,
  );
}

function value(): RawQuestion {
  const kind = ri(0, 4);
  if (kind === 0) {
    const k = ri(2, 6);
    return Num("Calcule " + m(L`\int_1^{+\infty}\frac{dx}{x^{${k}}}`) + ".", Fr(1, k - 1), `[−x^{${1 - k}}/${k - 1}] de 1 à +∞ : 1/${k - 1}.`);
  }
  if (kind === 1) {
    const q = ri(2, 4), p = ri(1, q - 1);
    return Num("Calcule " + m(L`\int_0^{1}\frac{dx}{x^{${ftex(Fr(p, q))}}}`) + ".", Fr(q, q - p), `Primitive x^{1−α}/(1−α) avec 1−α = ${q - p}/${q} : valeur ${q}/${q - p}.`);
  }
  if (kind === 2) {
    const a = ri(1, 5);
    return Num("Calcule " + m(L`\int_0^{+\infty}e^{-${a === 1 ? "" : a}x}dx`) + ".", Fr(1, a), `[−e^{−${a}x}/${a}] de 0 à +∞ = 1/${a}.`);
  }
  if (kind === 3) {
    const a = ri(1, 4);
    return Num("Calcule " + m(L`\int_0^{+\infty}x\,e^{-${a === 1 ? "" : a}x}dx`) + ".", Fr(1, a * a), `Intégration par parties : ∫ x e^{−ax} dx = 1/a² (c'est Γ(2)/a²).`);
  }
  const n = ri(2, 5);
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return Num("Calcule " + m(L`\int_0^{+\infty}x^{${n}}e^{-x}dx`) + ".", Fr(f), `Γ(${n + 1}) = ${n}! = ${f} (n intégrations par parties).`);
}

const ITEMS: { q: string; conv: boolean; e: string }[] = [
  { q: L`\int_0^1\ln x\,dx`, conv: true, e: "ln x = o(1/√x) en 0 : intégrable ; valeur −1." },
  { q: L`\int_0^1\frac{\sin x}{x^2}dx`, conv: false, e: "sin x / x² ~ 1/x en 0 : Riemann avec α = 1, divergente." },
  { q: L`\int_0^1\frac{1-\cos x}{x^2}dx`, conv: true, e: "1 − cos x ~ x²/2 : la fonction se prolonge par 1/2 en 0." },
  { q: L`\int_1^{+\infty}\frac{dx}{x(x+1)}`, conv: true, e: "~ 1/x² en +∞ (et non 1/x !), converge ; valeur ln 2." },
  { q: L`\int_1^{+\infty}\frac{\ln x}{x}dx`, conv: false, e: "Primitive (ln x)²/2 → +∞." },
  { q: L`\int_0^{+\infty}\frac{e^{-x}}{\sqrt{x}}dx`, conv: true, e: "~ 1/√x en 0 (α = 1/2 < 1) et exponentiellement petite en +∞ ; valeur √π." },
  { q: L`\int_1^{+\infty}\frac{\cos x}{x^2}dx`, conv: true, e: "|cos x / x²| ≤ 1/x² : absolument convergente." },
  { q: L`\int_0^{+\infty}\frac{dx}{1+x^2}`, conv: true, e: "Primitive arctan x : valeur π/2." },
  { q: L`\int_2^{+\infty}\frac{dx}{x\ln x}`, conv: false, e: "Primitive ln(ln x) → +∞." },
  { q: L`\int_2^{+\infty}\frac{dx}{x\ln^2 x}`, conv: true, e: "Primitive −1/ln x → 0 : valeur 1/ln 2." },
];
function equiv(): RawQuestion {
  const it = pick(ITEMS);
  return Nat("Nature de " + m(it.q) + " ?", it.conv, it.e);
}

function equivBug(): RawQuestion {
  const k = pick([2, 3]);
  return Bug(
    "Étude de " + m(L`\int_1^{+\infty}\frac{dx}{x(x+${k - 1})}`) + ". Une ligne est fausse.",
    [
      `La fonction $f(x)=\\dfrac{1}{x(x+${k - 1})}$ est positive sur $[1,+\\infty[$.`,
      `En $+\\infty$ : $x(x+${k - 1})\\sim x^2$, donc $f(x)\\sim\\dfrac1{x^2}$.`,
      `Or $\\displaystyle\\int_1^{+\\infty}\\dfrac{dx}{x^2}$ diverge car $\\alpha=2\\le1$.`,
      `Par équivalence de fonctions positives, l'intégrale de $f$ diverge aussi.`,
    ],
    2,
    [
      `Or $\\displaystyle\\int_1^{+\\infty}\\dfrac{dx}{x^2}$ converge car $\\alpha=2>1$ (Riemann en $+\\infty$).`,
      `Or $\\displaystyle\\int_1^{+\\infty}\\dfrac{dx}{x^2}$ converge car $\\alpha=2<1$.`,
      `Or $\\displaystyle\\int_1^{+\\infty}\\dfrac{dx}{x^2}$ diverge comme la série harmonique.`,
    ],
    "En +∞, Riemann converge si α > 1 (c'est l'inverse en 0). Avec α = 2 l'intégrale converge, donc celle de f aussi.",
  );
}

function compareProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve que " + m(L`\int_1^{+\infty}e^{-x^2}dx`) + " converge.",
    [
      "Pour $x\\ge1$, $x^2\\ge x$ donc $0<e^{-x^2}\\le e^{-x}$.",
      "$\\int_1^Ae^{-x}dx=e^{-1}-e^{-A}\\to e^{-1}$ quand $A\\to+\\infty$ : cette intégrale converge.",
      "Par comparaison de fonctions positives, $\\int_1^{+\\infty}e^{-x^2}dx$ converge.",
    ],
    ["Pour $x\\ge1$, $x^2\\le x$ donc $e^{-x^2}\\ge e^{-x}$.", "Comme $e^{-x^2}\\to0$, l'intégrale converge."],
  );
}

export const level: Level = {
  id: "ITP1",
  name: "Intégrales généralisées",
  fiche: "CM ch. 1 · TD1",
  icon: "∞",
  color: "#2a9d8f",
  gens: [["riemann", riemann], ["value", value], ["equiv", equiv], ["equiv-bug", equivBug], ["compare-proof", compareProof]],
  piege: "Riemann s'inverse : ∫ dx/xᵅ converge en +∞ si α > 1, en 0 si α < 1. Et 1/(x(x+1)) ~ 1/x² en +∞, pas 1/x.",
  rappel: [
    "∫₁^{+∞} dx/xᵅ converge ⇔ α > 1 ; ∫₀¹ dx/xᵅ converge ⇔ α < 1.",
    "Fonctions positives : comparaison, équivalence (même nature). Signe quelconque : absolue convergence ⇒ convergence.",
    "∫₀^{+∞} xⁿ e^{−x} dx = n! (= Γ(n+1)). ∫₀^{+∞} e^{−ax} dx = 1/a.",
    "Intégrale généralisée = limite des intégrales sur [a, A] quand A → bord.",
  ],
};
