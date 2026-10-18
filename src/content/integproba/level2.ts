// Intégration & probabilités · niveau 2 : intégrales à paramètre
import { Fr } from "../../core/fraction";
import { ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Order, poolQcm } from "../factories";

function laplace(): RawQuestion {
  const n = ri(1, 4), a = ri(1, 4);
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return Num(
    "Calcule " + m(L`\int_0^{+\infty}t^{${n}}e^{-${a === 1 ? "" : a}t}\,dt`) + ".",
    Fr(f, a ** (n + 1)),
    `Changement de variable u = ${a}t : l'intégrale vaut Γ(${n + 1})/${a}^${n + 1} = ${n}!/${a ** (n + 1)}.`,
  );
}

function gaussSquare(): RawQuestion {
  const a = ri(1, 5);
  return Num(
    "On a " + m(L`\left(\int_{-\infty}^{+\infty}e^{-${a === 1 ? "" : a}x^2}dx\right)^{2}=c\,\pi`) + ". Calcule " + m("c") + ".",
    Fr(1, a),
    `Fubini : I² = ∬ e^{−${a}(x²+y²)} dx dy ; en polaires = 2π ∫₀^{∞} r e^{−${a}r²} dr = 2π·(1/${2 * a}) = π/${a}.`,
  );
}

function derivParam(): RawQuestion {
  const a = ri(0, 3);
  if (ri(0, 1) === 0) {
    return Num(
      "Soit " + m(L`F(x)=\int_0^1t^{x}\,dt`) + " pour " + m("x>-1") + ". Calcule " + m(`F'(${a})`) + ".",
      Fr(-1, (a + 1) ** 2),
      `F(x) = 1/(x+1), donc F′(x) = −1/(x+1)². (Dériver sous l'intégrale donne ∫ t^x ln t dt : même valeur.)`,
    );
  }
  const c = ri(1, 3);
  return Num(
    "Soit " + m(L`F(x)=\int_0^1(t+${c}x)^2\,dt`) + ". Calcule " + m(`F'(${a})`) + ".",
    Fr(c + 2 * c * c * a),
    `F(x) = 1/3 + ${c}x + ${c * c}x², donc F′(x) = ${c} + ${2 * c * c}x ; en x = ${a} : ${c + 2 * c * c * a}.`,
  );
}

const thm = poolQcm([
  { q: "Pour dériver F(x)=∫f(x,t)dt sous le signe ∫, on demande notamment…", r: "une domination de ∂f/∂x par une fonction intégrable de t, indépendante de x", w: ["que f soit positive", "que f soit un polynôme en x", "que l'intégrale soit sur un segment"], e: "Théorème de dérivation : ∂ₓf continue en x, f(x,·) intégrable, |∂ₓf(x,t)| ≤ g(t) intégrable." },
  { q: "La domination doit être valable…", r: "pour tout x dans un voisinage (ou tout segment) du point étudié, avec g indépendante de x", w: ["seulement au point x₀", "avec g dépendant de x", "seulement pour t = 0"], e: "Si g dépendait de x, elle ne servirait à rien : on la veut uniforme." },
  { q: "Pour passer à la limite sous l'intégrale (convergence dominée), il faut…", r: "|fₙ| ≤ g avec g intégrable, indépendante de n", w: ["fₙ croissante uniquement", "∫ fₙ bornée", "fₙ continue uniquement"], e: "Théorème de convergence dominée de Lebesgue." },
  { q: "∫₀^{+∞} xⁿ e^{−x} dx pour n ∈ ℕ vaut…", r: "n!", w: ["(n+1)!", "1/n!", "n"], e: "Γ(n+1) = n!." },
  { q: "Intervertir ∑ et ∫ est légitime (cas positif) si…", r: "tous les termes sont positifs (Tonelli) ou si ∑∫|fₙ| converge", w: ["la série converge simplement", "les fₙ sont continues", "jamais"], e: "Fubini–Tonelli pour séries/intégrales." },
]);

function paramGuided(): RawQuestion {
  return Guided(
    "Soit " + m(L`F(x)=\int_0^1t^{x}\,dt`) + " pour " + m("x\\ge0") + ". On veut calculer " + m(L`\int_0^1t\ln t\,dt`) + ".",
    [
      gn("Calcule F(x) en fonction de x puis donne F(2).", Fr(1, 3), ["Primitive de t^x : t^{x+1}/(x+1)."], "F(x) = 1/(x+1), donc F(2) = 1/3."),
      gq(
        "Quelle domination justifie la dérivation sous l'intégrale pour x ≥ 0 ?",
        ["|∂ₓ(t^x)| = t^x |ln t| ≤ |ln t|, intégrable sur ]0,1]", "|t^x| ≤ 1, intégrable sur [0,1]", "|ln t| ≤ t^x pour tout x", "Aucune domination n'est nécessaire"],
        ["Dérive t^x = e^{x ln t} par rapport à x.", "Pour t ∈ ]0,1] et x ≥ 0 : t^x ≤ 1."],
        "∂ₓ t^x = t^x ln t, et sur ]0,1] avec x ≥ 0 : |t^x ln t| ≤ |ln t|, qui est intégrable (ln t = o(1/√t) en 0).",
      ),
      gn("Alors F′(x) = −1/(x+1)². Donne F′(1).", Fr(-1, 4), ["Remplace x par 1."], "F′(1) = −1/4."),
      gn("Or F′(1) = ∫₀¹ t ln t dt (dérivation sous ∫). Quelle est la valeur de cette intégrale ?", Fr(-1, 4), ["C'est exactement F′(1)."], "∫₀¹ t ln t dt = −1/4 (on le retrouve aussi par parties)."),
    ],
    "Dériver sous l'intégrale transforme une intégrale difficile en dérivée d'une fonction explicite — à condition de justifier la domination.",
  );
}

function dominationBug(): RawQuestion {
  return Bug(
    "On étudie " + m(L`F(x)=\int_0^{+\infty}\frac{e^{-xt}}{1+t^2}dt`) + ". Une ligne est fausse.",
    [
      "$F(x)$ est définie pour $x\\ge0$ (en $x<0$, $e^{-xt}$ explose et l'intégrale diverge).",
      "Pour tout $x\\in\\mathbb{R}$ et $t\\ge0$, on a $e^{-xt}\\le1$, donc $\\dfrac{e^{-xt}}{1+t^2}\\le\\dfrac1{1+t^2}$.",
      "La fonction $t\\mapsto\\dfrac1{1+t^2}$ est intégrable sur $[0,+\\infty[$ et ne dépend pas de $x$.",
      "Donc $F$ est continue sur $[0,+\\infty[$.",
    ],
    1,
    [
      "Pour tout $x\\ge0$ et $t\\ge0$, on a $e^{-xt}\\le1$ : la majoration n'est vraie que pour $x\\ge0$.",
      "Pour tout $x\\in\\mathbb{R}$, $e^{-xt}\\ge1$.",
      "Pour tout $x$, $e^{-xt}\\le e^{-t}$.",
    ],
    "e^{−xt} ≤ 1 exige x ≥ 0 (t ≥ 0). La domination doit être démontrée sur le domaine réel de définition de F.",
  );
}

function gammaProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve de " + m(L`\Gamma(x+1)=x\,\Gamma(x)`) + " pour " + m("x>0") + ".",
    [
      "$\\Gamma(x+1)=\\displaystyle\\int_0^{+\\infty}t^{x}e^{-t}dt$.",
      "Intégrons par parties avec $u=t^x$ et $v'=e^{-t}$ : on obtient $\\big[-t^xe^{-t}\\big]_0^{+\\infty}+x\\displaystyle\\int_0^{+\\infty}t^{x-1}e^{-t}dt$.",
      "Le crochet est nul (croissances comparées en $+\\infty$, et $t^x\\to0$ en $0$ car $x>0$).",
      "Donc $\\Gamma(x+1)=x\\,\\Gamma(x)$, et avec $\\Gamma(1)=1$ on obtient $\\Gamma(n+1)=n!$.",
    ],
    ["Le crochet vaut 1.", "Intégrons par parties avec $u=e^{-t}$ et $v'=t^x$."],
  );
}

export const level: Level = {
  id: "ITP2",
  name: "Intégrales à paramètre",
  fiche: "CM ch. 1 · TD2",
  icon: "🎚️",
  color: "#e9c46a",
  gens: [["laplace", laplace], ["gauss", gaussSquare], ["deriv", derivParam], ["thm", thm], ["param-guided", paramGuided], ["domination-bug", dominationBug], ["gamma-proof", gammaProof]],
  piege: "La fonction dominante g doit ne PAS dépendre du paramètre, et la majoration doit être vraie sur tout le domaine considéré (e^{−xt} ≤ 1 seulement si x ≥ 0).",
  rappel: [
    "Continuité : f(·,t) continue, |f(x,t)| ≤ g(t) intégrable (g indépendante de x) ⇒ F continue.",
    "Dérivation : idem pour ∂ₓf ⇒ F′(x) = ∫ ∂ₓf(x,t) dt.",
    "Γ(x) = ∫₀^{+∞} t^{x−1}e^{−t}dt ; Γ(x+1) = xΓ(x) ; Γ(n+1) = n!.",
    "Gauss : ∫_ℝ e^{−x²}dx = √π (carré calculé en polaires).",
  ],
};
