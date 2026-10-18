// Ondes · niveau 1 : oscillateur harmonique, libre et amorti
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { PYTH } from "./helpers";

function omega0(): RawQuestion {
  const w = ri(2, 9), mass = pick([1, 2, 4, 5]);
  return Num(
    `Un oscillateur masse-ressort a pour masse ${mass} kg et raideur ${mass * w * w} N/m. Quelle est sa pulsation propre ${m("\\omega_0")} (rad/s) ?`,
    Fr(w),
    `ω₀ = √(k/m) = √(${mass * w * w}/${mass}) = √${w * w} = ${w} rad/s.`,
  );
}

function energy(): RawQuestion {
  const k = ri(2, 9) * 10, A = ri(1, 6);
  const A10 = A / 10;
  return Num(
    `Un oscillateur harmonique de raideur ${m("k")} = ${k} N/m oscille avec une amplitude de ${A * 10} cm. Quelle est son énergie mécanique (en J) ?`,
    Fr(k * A * A, 200),
    `E = ½kA² = ½ × ${k} × ${String(A10).replace(".", ",")}² = ${k * A * A}/200 J (constante au cours du mouvement).`,
  );
}

function regime(): RawQuestion {
  const w0 = ri(2, 9);
  const g = pick([Math.max(1, w0 - 1), w0, w0 + 1, w0 + 2, Math.max(1, Math.floor(w0 / 2))]);
  const idx = g < w0 ? 0 : g === w0 ? 1 : 2;
  return Qcm(
    `Dans ${m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0")} avec ${m("\\gamma=" + g)} s⁻¹ et ${m("\\omega_0=" + w0)} rad/s, quel est le régime ?`,
    ["Pseudo-périodique (γ < ω₀)", "Critique (γ = ω₀)", "Apériodique (γ > ω₀)"],
    idx,
    `Équation caractéristique r² + 2γr + ω₀² = 0, discriminant réduit γ² − ω₀². γ ${idx === 0 ? "<" : idx === 1 ? "=" : ">"} ω₀ : ${["pseudo-périodique", "critique", "apériodique"][idx]}.`,
  );
}

function pseudo(): RawQuestion {
  const [g, w, w0] = pick(PYTH);
  return Num(
    `Un oscillateur amorti a pour pulsation propre ${m("\\omega_0=" + w0)} rad/s et pour coefficient d'amortissement ${m("\\gamma=" + g)} s⁻¹ (équation ${m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0")}). Quelle est la pseudo-pulsation ${m("\\omega")} (rad/s) ?`,
    Fr(w),
    `ω = √(ω₀² − γ²) = √(${w0 * w0} − ${g * g}) = √${w * w} = ${w} rad/s.`,
  );
}

function qFactor(): RawQuestion {
  const w0 = ri(2, 9) * 5, g = pick([1, 2, 5]);
  return Num(
    `Pour ${m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0")} avec ${m("\\omega_0=" + w0)} rad/s et ${m("\\gamma=" + g)} s⁻¹, quel est le facteur de qualité ${m("Q=\\omega_0/(2\\gamma)")} ?`,
    Fr(w0, 2 * g),
    `Q = ω₀/(2γ) = ${w0}/${2 * g}. Q grand : peu d'amortissement, beaucoup d'oscillations visibles.`,
  );
}

function morse(): RawQuestion {
  const D = ri(1, 6), a = ri(1, 5);
  return Num(
    `Une molécule diatomique a pour énergie potentielle ${m("E_p(r)=D\\,[1-e^{-a(r-R)}]^2")} avec ${m("D=" + D)} eV et ${m("a=" + a)} nm⁻¹. Autour de l'équilibre ${m("r=R")}, on approxime ${m("E_p")} par un ressort de raideur ${m("k")}. Que vaut ${m("k")} (en eV·nm⁻²) ?`,
    Fr(2 * D * a * a),
    `k = E_p''(R). Développons : 1 − e^{−a(r−R)} ≈ a(r−R), donc E_p ≈ D a²(r−R)² = ½k(r−R)² ⇒ k = 2Da² = ${2 * D * a * a}. (Attention : k = +E_p'', pas −E_p''.)`,
  );
}

const concepts = poolVF([
  { q: "Autour d'une position d'équilibre stable, tout potentiel se comporte comme celui d'un ressort de raideur k = E_p''(r_eq) > 0.", t: true, e: "Taylor à l'ordre 2 : E_p ≈ E_p(r_eq) + ½E_p''(r_eq)(r − r_eq)² car E_p'(r_eq) = 0." },
  { q: "La raideur effective est k = −E_p''(r_eq).", t: false, e: "k = +E_p''(r_eq). Le signe moins est celui de la force F = −dE_p/dr, pas de k." },
  { q: "Dans le régime pseudo-périodique, la pseudo-période est plus grande que la période propre.", t: true, e: "ω = √(ω₀² − γ²) < ω₀ ⇒ T = 2π/ω > T₀." },
  { q: "En régime critique, l'amplitude revient à zéro le plus vite possible sans osciller.", t: true, e: "Régime critique : retour à l'équilibre le plus rapide sans dépassement." },
  { q: "Dans un oscillateur amorti, l'énergie mécanique est conservée.", t: false, e: "Le frottement dissipe : E décroît (∝ e^(−2γt) pour l'enveloppe)." },
  { q: "La période de l'oscillateur harmonique dépend de l'amplitude.", t: false, e: "Isochronisme : T = 2π√(m/k), indépendante de A." },
  { q: "En régime apériodique, x(t) s'annule une infinité de fois.", t: false, e: "Pas d'oscillation : au plus un passage par zéro." },
  { q: "Pour γ ≪ ω₀, la pseudo-pulsation est très proche de ω₀.", t: true, e: "ω = ω₀√(1 − γ²/ω₀²) ≈ ω₀." },
]);

function pseudoBug(): RawQuestion {
  return Bug(
    "Régime libre de " + m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0") + " avec " + m("\\gamma<\\omega_0") + ". Une ligne est fausse.",
    [
      "On cherche $x=e^{rt}$ : $r^2+2\\gamma r+\\omega_0^2=0$.",
      "Le discriminant réduit est $\\gamma^2-\\omega_0^2<0$ : racines complexes.",
      "Les racines sont $r=-\\gamma\\pm i\\sqrt{\\omega_0^2+\\gamma^2}$.",
      "Donc $x(t)=e^{-\\gamma t}\\,(A\\cos\\omega t+B\\sin\\omega t)$ avec $\\omega=\\sqrt{\\omega_0^2-\\gamma^2}$.",
    ],
    2,
    [
      "Les racines sont $r=-\\gamma\\pm i\\sqrt{\\omega_0^2-\\gamma^2}$.",
      "Les racines sont $r=\\gamma\\pm i\\sqrt{\\omega_0^2-\\gamma^2}$.",
      "Les racines sont $r=-\\gamma\\pm\\sqrt{\\gamma^2-\\omega_0^2}$ (réelles).",
    ],
    "√(γ² − ω₀²) = i√(ω₀² − γ²) : la partie imaginaire est √(ω₀² − γ²), toujours plus petite que ω₀.",
  );
}

function regimeProof(): RawQuestion {
  return Order(
    "Reconstitue la résolution de l'oscillateur amorti en régime pseudo-périodique.",
    [
      "On écrit l'équation différentielle $\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0$ et on pose $x=e^{rt}$.",
      "L'équation caractéristique est $r^2+2\\gamma r+\\omega_0^2=0$, de discriminant réduit $\\gamma^2-\\omega_0^2<0$.",
      "Les racines sont complexes conjuguées : $r=-\\gamma\\pm i\\omega$, avec $\\omega=\\sqrt{\\omega_0^2-\\gamma^2}$.",
      "Solution : $x(t)=e^{-\\gamma t}(A\\cos\\omega t+B\\sin\\omega t)$, où $A,B$ viennent des conditions initiales.",
    ],
    ["On cherche $x=A\\cos\\omega_0t$ comme dans le cas non amorti.", "Les conditions initiales donnent $\\omega$."],
  );
}

function dampedGuided(): RawQuestion {
  const [g, w, w0] = pick(PYTH);
  return Guided(
    `Un oscillateur obéit à ${m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=0")} avec ${m("\\gamma=" + g)} s⁻¹ et ${m("\\omega_0=" + w0)} rad/s. On veut décrire son mouvement.`,
    [
      gq(
        "Quel est le régime ?",
        ["Pseudo-périodique", "Critique", "Apériodique", "Harmonique pur"],
        ["Compare γ et ω₀ : γ < ω₀ ?"],
        `γ = ${g} < ω₀ = ${w0} : pseudo-périodique.`,
      ),
      gn("Que vaut ω₀² − γ² ?", Fr(w * w), ["Calcule les deux carrés."], `${w0 * w0} − ${g * g} = ${w * w}.`),
      gn("Quelle est la pseudo-pulsation ω (rad/s) ?", Fr(w), ["Racine du résultat précédent."], `ω = √${w * w} = ${w}.`),
      gn("Quel est le facteur de qualité Q = ω₀/(2γ) ?", Fr(w0, 2 * g), ["Q = ω₀/(2γ)."], `Q = ${w0}/${2 * g}.`),
    ],
    "Méthode : équation caractéristique → discriminant → régime → solution.",
  );
}

export const level: Level = {
  id: "WAV1",
  name: "Oscillateurs libres",
  fiche: "Oscillations",
  icon: "🔔",
  color: "#00b4d8",
  gens: [
    ["w0", omega0], ["E", energy], ["regime", regime], ["pseudo", pseudo], ["Q", qFactor], ["morse", morse],
    ["concepts", concepts], ["pseudo-bug", pseudoBug], ["regime-proof", regimeProof], ["damped-guided", dampedGuided],
  ],
  piege: "Pseudo-pulsation : ω = √(ω₀² − γ²) (moins, jamais plus). Régimes : γ <, =, > ω₀.",
  rappel: [
    "Harmonique : ω₀ = √(k/m), T = 2π/ω₀, E = ½kA² = cte.",
    "Amorti : ẍ + 2γẋ + ω₀²x = 0 ; γ < ω₀ pseudo-périodique, ω = √(ω₀² − γ²) ; γ = ω₀ critique ; γ > ω₀ apériodique.",
    "Q = ω₀/(2γ).",
  ],
};
