// Analyse ℝⁿ · niveau 2 : limites, continuité, différentiabilité en (0,0)
import { Fr, ftex } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Order, Qcm } from "../factories";

/** x^p y^q / (x²+y²)^r en LaTeX. */
export const ratio = (p: number, q: number, r: number): string => {
  const mono = (v: string, e: number): string => (e === 0 ? "" : e === 1 ? v : `${v}^{${e}}`);
  const num = mono("x", p) + mono("y", q);
  return L`\frac{${num || "1"}}{(x^2+y^2)${r === 1 ? "" : `^{${r}}`}}`;
};

function polarLimit(): RawQuestion {
  let p: number, q: number, r: number;
  do {
    p = ri(0, 4);
    q = ri(0, 4);
    r = ri(1, 2);
  } while (p + q === 0 || p + q > 2 * r + 2);
  const lim0 = p + q > 2 * r;
  return Qcm(
    "Soit " + m(L`f(x,y)=${ratio(p, q, r)}`) + " sur " + m(L`\mathbb{R}^2\setminus\{(0,0)\}`) + ". Que dire de " + m(L`\lim_{(x,y)\to(0,0)}f`) + " ?",
    ["La limite existe et vaut 0", "Il n'y a pas de limite finie"],
    lim0 ? 0 : 1,
    "En polaires : " + m(L`f=r^{${p + q - 2 * r}}\cos^{${p}}\theta\,\sin^{${q}}\theta`) +
      (lim0
        ? ` ; l'exposant ${p + q - 2 * r} est > 0 et le facteur trigo est borné par 1, donc f → 0 uniformément en θ.`
        : p + q === 2 * r
          ? " ; l'exposant de r est nul : f dépend de θ (par exemple 0 sur un axe, une valeur non nulle sur la diagonale), donc pas de limite."
          : " ; l'exposant de r est négatif : f est non bornée sur la diagonale."),
  );
}

function lineValue(): RawQuestion {
  const r = ri(1, 2);
  const q = ri(0, 2 * r);
  const p = 2 * r - q;
  const mm = pick([1, 2, 3, -1, -2]);
  return Num(
    "Soit " + m(L`f(x,y)=${ratio(p, q, r)}`) + ". Quelle est la limite de " + m(L`f(x,\,${mm === 1 ? "" : mm}x)`) + " quand " + m(L`x\to0`) + " (le long de la droite " + m(L`y=${mm === 1 ? "" : mm}x`) + ") ?",
    Fr(mm ** q, (1 + mm * mm) ** r),
    `f(x, mx) = m^${q}/(1+m²)^${r} = ${ftex(Fr(mm ** q, (1 + mm * mm) ** r))} : une valeur qui dépend de m, donc f n'a pas de limite en (0,0).`,
  );
}

/** Problème type DS : (x²y + k y³)/(x²+y²) en 0. */
function diffGuided(): RawQuestion {
  const k = pick([-2, -1, 0, 2, 3, 4, 5]);
  const kk = k < 0 ? `(${k})` : `${k}`;
  const f = k === 0 ? L`\frac{x^2y}{x^2+y^2}` : L`\frac{x^2y${k > 0 ? "+" : "-"}${Math.abs(k) === 1 ? "" : Math.abs(k)}y^3}{x^2+y^2}`;
  return Guided(
    "Soit " + m(L`f(x,y)=${f}`) + " si " + m(L`(x,y)\neq(0,0)`) + " et " + m(L`f(0,0)=0`) + ". Étudie la différentiabilité de f en l'origine.",
    [
      gq(
        "Pourquoi f est-elle continue en (0,0) ?",
        ["En polaires, |f| ≤ C·r avec C indépendant de θ", "Parce que f(0,0)=0", "Parce que f est continue sur chaque droite", "Parce que f est un quotient de polynômes"],
        ["Écris x = r cosθ, y = r sinθ.", "Le numérateur est en r³, le dénominateur en r²."],
        "En polaires f = r(cos²θ sinθ + k sin³θ) : |f| ≤ (1+|k|) r → 0 quand r → 0, uniformément en θ.",
      ),
      gn(
        "Calcule ∂f/∂x(0,0) = lim f(t,0)/t.",
        Fr(0),
        ["Calcule d'abord f(t,0) pour t ≠ 0."],
        "f(t,0) = 0 pour tout t ≠ 0 : le taux d'accroissement est nul, donc ∂f/∂x(0,0) = 0.",
      ),
      gn(
        "Calcule ∂f/∂y(0,0) = lim f(0,t)/t.",
        Fr(k),
        ["f(0,t) = k t³ / t².", "Divise par t."],
        `f(0,t) = ${k}t, donc f(0,t)/t = ${k} : ∂f/∂y(0,0) = ${k}.`,
      ),
      gn(
        "Si f était différentiable, df(0,0)(h) = ∂ₓf·h₁ + ∂ᵧf·h₂. Pour h = (t,t), calcule la limite de [f(t,t) − df(0,0)(t,t)] / t.",
        Fr(1 - k, 2),
        ["Calcule f(t,t) : numérateur t³(1+k), dénominateur 2t².", "df(0,0)(t,t) = k·t."],
        `f(t,t) = (1+${kk})t/2, df(0,0)(t,t) = ${kk}t, donc le quotient vaut (1+${kk})/2 − ${kk} = ${ftex(Fr(1 - k, 2))}.`,
      ),
      gq(
        "Conclusion ?",
        ["f n'est pas différentiable en (0,0)", "f est différentiable en (0,0)", "On ne peut pas conclure"],
        ["Pour être différentiable, [f(h) − df(h)] / ‖h‖ doit tendre vers 0 dans TOUTES les directions."],
        "Le reste divisé par ‖h‖ = √2|t| tend vers (1−k)/(2√2) ≠ 0 : f est continue, a des dérivées partielles, mais n'est pas différentiable.",
      ),
    ],
    "Continue + dérivées partielles ne suffisent pas : il faut tester le reste dans une direction oblique.",
  );
}

function parabolaBug(): RawQuestion {
  return Bug(
    "On veut la limite en (0,0) de " + m(L`f(x,y)=\frac{x^2y}{x^4+y^2}`) + ". Une ligne est fausse.",
    [
      "Sur la droite $y=mx$ : $f(x,mx)=\\dfrac{mx}{x^2+m^2}\\to0$ (et $f(x,0)=0$).",
      "Donc $f$ tend vers 0 le long de toute droite passant par l'origine.",
      "Donc $\\lim_{(x,y)\\to(0,0)}f(x,y)=0$.",
    ],
    2,
    [
      "Cela ne prouve rien : sur la parabole $y=x^2$, $f(x,x^2)=\\frac12$, donc $f$ n'a pas de limite.",
      "C'est exact, mais il faut aussi le vérifier le long des axes.",
      "C'est exact car les droites donnent toutes la même limite.",
    ],
    "Tester des droites ne suffit jamais à prouver une limite. Sur y = x² : x²·x²/(x⁴+x⁴) = 1/2 ≠ 0.",
  );
}

function noLimitProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve que " + m(L`f(x,y)=\frac{xy}{x^2+y^2}`) + " n'a pas de limite en l'origine.",
    [
      "On cherche deux chemins vers $(0,0)$ qui donnent des limites différentes.",
      "Sur l'axe $y=0$ : $f(x,0)=0\\to0$.",
      "Sur la diagonale $y=x$ : $f(x,x)=\\frac12\\to\\frac12$.",
      "Les deux limites diffèrent : $f$ n'a pas de limite en $(0,0)$.",
    ],
    ["En polaires $f=r\\sin\\theta\\cos\\theta\\to0$, donc la limite est 0.", "Comme $f(x,0)\\to0$, la limite vaut 0."],
  );
}

export const level: Level = {
  id: "ANR2",
  name: "Limites et continuité",
  fiche: "DS1–DS2 · limites",
  icon: "🎯",
  color: "#e76f51",
  gens: [["polar", polarLimit], ["line", lineValue], ["diff-guided", diffGuided], ["parabola-bug", parabolaBug], ["nolimit", noLimitProof]],
  piege: "Des limites égales sur toutes les droites ne prouvent PAS l'existence de la limite (essaie une parabole). Des limites différentes, elles, prouvent qu'elle n'existe pas.",
  rappel: [
    "Polaires : x = r cosθ, y = r sinθ. Si |f| ≤ g(r) avec g(r) → 0 (indépendant de θ), alors f → 0.",
    "x^p y^q /(x²+y²)^r → 0 si p+q > 2r ; si p+q = 2r la valeur dépend de la direction : pas de limite.",
    "Pour NIER une limite : deux chemins, deux limites différentes.",
    "f différentiable en a ⇔ f(a+h) = f(a) + L(h) + o(‖h‖). Les dérivées partielles seules ne suffisent pas.",
  ],
};
