// Ondes · niveau 2 : oscillateur forcé, résonance
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { RESO } from "./helpers";

const EQ = m("\\ddot x+2\\gamma\\dot x+\\omega_0^2x=f_0\\cos\\omega t");

function resFreq(): RawQuestion {
  const [g, r, w0] = pick(RESO);
  return Num(
    `Pour ${EQ} avec ${m("\\omega_0=" + w0)} rad/s et ${m("\\gamma=" + g)} s⁻¹, l'amplitude de ${m("x")} est maximale pour une pulsation ${m("\\omega_r")} (rad/s). Que vaut-elle ?`,
    Fr(r),
    `ω_r = √(ω₀² − 2γ²) = √(${w0 * w0} − ${2 * g * g}) = √${r * r} = ${r} rad/s (légèrement inférieure à ω₀).`,
  );
}

function ampliResonance(): RawQuestion {
  const w0 = ri(2, 9), g = ri(1, 3), f0 = ri(2, 12);
  return Num(
    `Pour ${EQ} avec ${m("f_0=" + f0)} (SI), ${m("\\omega_0=" + w0)} rad/s et ${m("\\gamma=" + g)} s⁻¹, quelle est l'amplitude de ${m("x")} à ${m("\\omega=\\omega_0")} ?`,
    Fr(f0, 2 * g * w0),
    `|X| = f₀/√((ω₀²−ω²)² + 4γ²ω²) ; à ω = ω₀ le premier terme s'annule : |X| = f₀/(2γω₀) = ${f0}/${2 * g * w0}.`,
  );
}

function ampliStatic(): RawQuestion {
  const w0 = ri(2, 9), f0 = ri(2, 12);
  return Num(
    `Pour ${EQ} avec ${m("f_0=" + f0)} (SI) et ${m("\\omega_0=" + w0)} rad/s, quelle est l'amplitude pour ${m("\\omega\\to0")} (excitation quasi statique) ?`,
    Fr(f0, w0 * w0),
    `ω → 0 : |X| → f₀/ω₀² = ${f0}/${w0 * w0} (la réponse suit l'excitation, sans déphasage).`,
  );
}

function phase(): RawQuestion {
  const where = pick([0, 1, 2]);
  const cond = [m("\\omega\\ll\\omega_0"), m("\\omega=\\omega_0"), m("\\omega\\gg\\omega_0")][where] as string;
  return Qcm(
    `Oscillateur forcé amorti : quel est le retard de phase de ${m("x")} sur l'excitation pour ${cond} ?`,
    ["≈ 0 (en phase)", "≈ π/2 (retard d'un quart de période)", "≈ π (opposition de phase)"],
    where,
    "φ = arctan(2γω/(ω₀²−ω²)) : 0 à basse fréquence, π/2 à ω = ω₀, π à haute fréquence.",
  );
}

const concepts = poolVF([
  { q: "En régime forcé permanent, x(t) oscille à la pulsation de l'excitation ω, pas à ω₀.", t: true, e: "Le transitoire (à ω₀ et amorti) disparaît ; il reste ω." },
  { q: "L'amplitude de résonance est toujours atteinte pour ω = ω₀ exactement.", t: false, e: "ω_r = √(ω₀² − 2γ²) < ω₀ ; c'est la VITESSE qui résonne à ω₀ exactement." },
  { q: "Plus l'amortissement est faible, plus le pic de résonance est aigu.", t: true, e: "Q = ω₀/2γ grand ⇒ pic étroit et haut." },
  { q: "Si γ > ω₀/√2, il n'y a pas de résonance en amplitude de x.", t: true, e: "ω₀² − 2γ² < 0 : l'amplitude décroît de façon monotone." },
  { q: "La puissance moyenne absorbée est maximale à ω = ω₀.", t: true, e: "La résonance de vitesse (donc de puissance) a lieu à ω₀ exactement." },
  { q: "Le régime transitoire ne disparaît jamais.", t: false, e: "Il décroît en e^(−γt) : il s'éteint, il reste le régime permanent." },
]);

function resBug(): RawQuestion {
  return Bug(
    "On étudie la résonance d'amplitude de " + EQ + ". Une ligne est fausse.",
    [
      "En notation complexe, $\\underline{X}=\\dfrac{f_0}{\\omega_0^2-\\omega^2+2i\\gamma\\omega}$.",
      "L'amplitude est $|X|=\\dfrac{f_0}{\\sqrt{(\\omega_0^2-\\omega^2)^2+4\\gamma^2\\omega^2}}$.",
      "Elle est maximale quand le dénominateur est minimal, soit pour $\\omega=\\omega_0$.",
      "Pour $\\gamma\\ll\\omega_0$ le pic est très aigu et la résonance très marquée.",
    ],
    2,
    [
      "Elle est maximale en minimisant $(\\omega_0^2-\\omega^2)^2+4\\gamma^2\\omega^2$ : on dérive, on trouve $\\omega_r=\\sqrt{\\omega_0^2-2\\gamma^2}$.",
      "Elle est maximale quand $\\omega=\\omega_0/\\sqrt2$.",
      "Elle est maximale quand $\\omega=\\sqrt{\\omega_0^2+2\\gamma^2}$.",
    ],
    "À ω = ω₀ le premier terme s'annule mais le deuxième (4γ²ω²) croît encore avec ω : le minimum du dénominateur est décalé en ω_r = √(ω₀² − 2γ²).",
  );
}

function resProof(): RawQuestion {
  return Order(
    "Reconstitue le calcul de la pulsation de résonance d'amplitude.",
    [
      "On passe en complexe : $\\underline X=f_0/(\\omega_0^2-\\omega^2+2i\\gamma\\omega)$ et $|X|=f_0/\\sqrt{D(\\omega)}$.",
      "$|X|$ est maximal quand $D(\\omega)=(\\omega_0^2-\\omega^2)^2+4\\gamma^2\\omega^2$ est minimal.",
      "On pose $u=\\omega^2$ : $D=(\\omega_0^2-u)^2+4\\gamma^2u$, et $dD/du=0$ donne $u=\\omega_0^2-2\\gamma^2$.",
      "Donc $\\omega_r=\\sqrt{\\omega_0^2-2\\gamma^2}$, qui n'existe que si $\\gamma<\\omega_0/\\sqrt2$.",
    ],
    ["On dérive $D$ par rapport à $\\omega$ et on trouve directement $\\omega=\\omega_0$.", "Le maximum de $|X|$ est atteint quand $D=0$."],
  );
}

function resGuided(): RawQuestion {
  const [g, , w0] = pick(RESO);
  return Guided(
    `Un oscillateur forcé a ${m("\\omega_0=" + w0)} rad/s et ${m("\\gamma=" + g)} s⁻¹. On étudie sa résonance d'amplitude.`,
    [
      gq(
        "Existe-t-il une résonance d'amplitude ?",
        ["Oui, car ω₀² − 2γ² > 0", "Non, car γ ≠ 0", "Oui, mais seulement à ω = ω₀", "Non, elle n'existe jamais en régime amorti"],
        ["La condition est γ < ω₀/√2, soit ω₀² − 2γ² > 0."],
        "ω₀² − 2γ² > 0 : une résonance existe.",
      ),
      gn("Que vaut ω₀² − 2γ² ?", Fr(w0 * w0 - 2 * g * g), ["Calcule ω₀² puis 2γ²."], `${w0 * w0} − ${2 * g * g}.`),
      gn("Quelle est ω_r (rad/s) ?", Fr(Math.round(Math.sqrt(w0 * w0 - 2 * g * g))), ["Racine du résultat précédent."], "ω_r = √(ω₀² − 2γ²)."),
      gn("Quel est le rapport |X(ω₀)|/|X(0)| ?", Fr(w0, 2 * g), ["|X(ω₀)| = f₀/(2γω₀) et |X(0)| = f₀/ω₀²."], "Rapport = ω₀/(2γ) = Q."),
    ],
    "Le rapport |X(ω₀)|/|X(0)| vaut Q : c'est la définition opérationnelle du facteur de qualité.",
  );
}

export const level: Level = {
  id: "WAV2",
  name: "Forcé & résonance",
  fiche: "Oscillations",
  icon: "📈",
  color: "#0077b6",
  gens: [
    ["wr", resFreq], ["Xres", ampliResonance], ["X0", ampliStatic], ["phase", phase],
    ["concepts", concepts], ["res-bug", resBug], ["res-proof", resProof], ["res-guided", resGuided],
  ],
  piege: "Résonance d'amplitude en ω_r = √(ω₀² − 2γ²) ≠ ω₀. Seule la vitesse résonne exactement à ω₀.",
  rappel: [
    "ẍ + 2γẋ + ω₀²x = f₀cos ωt : X = f₀/(ω₀² − ω² + 2iγω).",
    "|X| = f₀/√((ω₀²−ω²)² + 4γ²ω²) ; ω_r = √(ω₀² − 2γ²) (si γ < ω₀/√2) ; |X(ω₀)|/|X(0)| = Q.",
    "Déphasage : 0 (ω ≪ ω₀), π/2 (ω = ω₀), π (ω ≫ ω₀).",
  ],
};
