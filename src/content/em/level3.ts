// Électromagnétisme · niveau 3 : potentiel, conducteurs, condensateurs
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolVF } from "../factories";

const term = (c: number, s: string, first: boolean): string => {
  const a = Math.abs(c);
  const body = (a === 1 ? "" : String(a)) + s;
  return first ? (c < 0 ? "-" : "") + body : (c < 0 ? " - " : " + ") + body;
};

/** V = a·x²y + b·yz + c·xz² ; E = −∇V au point donné. */
function gradient(): RawQuestion {
  const a = pick([-2, -1, 1, 2, 3]), b = pick([-3, -2, 1, 2, 3]), c = pick([-2, -1, 1, 2]);
  const [x, y, z] = [ri(-2, 2), ri(-2, 2), ri(-2, 2)];
  const comp = pick(["x", "y", "z"] as const);
  const V = term(a, "x^2y", true) + term(b, "yz", false) + term(c, "xz^2", false);
  const d = {
    x: 2 * a * x * y + c * z * z,
    y: a * x * x + b * z,
    z: b * y + 2 * c * x * z,
  }[comp];
  return Num(
    `Le potentiel est ${m("V(x,y,z)=" + V)} (en V, coordonnées en m). Quelle est la composante ${m("E_" + comp)} (en V/m) du champ en ${m(`(${x},${y},${z})`)} ?`,
    Fr(-d),
    `E = −∇V, donc E_${comp} = −∂V/∂${comp} = ${-d} V/m.`,
  );
}

function capScale(): RawQuestion {
  const kind = pick(["d", "S", "series", "parallel"] as const);
  if (kind === "d") {
    const k = ri(2, 5);
    return Num(
      `Pour un condensateur plan, on multiplie par ${k} la distance entre armatures (S et ε fixes). Par quel facteur C est-elle multipliée ?`,
      Fr(1, k),
      `C = εS/d ∝ 1/d : facteur 1/${k}.`,
    );
  }
  if (kind === "S") {
    const k = ri(2, 5);
    return Num(
      `Pour un condensateur plan, on multiplie par ${k} la surface des armatures (d fixe). Par quel facteur C est-elle multipliée ?`,
      Fr(k),
      `C = εS/d ∝ S : facteur ${k}.`,
    );
  }
  const [c1, c2] = [ri(1, 6), ri(1, 6)];
  return kind === "series"
    ? Num(
        `Deux condensateurs de ${c1} µF et ${c2} µF sont montés en série. Quelle est la capacité équivalente (µF) ?`,
        Fr(c1 * c2, c1 + c2),
        `1/C = 1/${c1} + 1/${c2} ⇒ C = ${c1}·${c2}/(${c1}+${c2}) = ${c1 * c2}/${c1 + c2} µF.`,
      )
    : Num(
        `Deux condensateurs de ${c1} µF et ${c2} µF sont montés en parallèle. Quelle est la capacité équivalente (µF) ?`,
        Fr(c1 + c2),
        `En parallèle les capacités s'ajoutent : ${c1} + ${c2} = ${c1 + c2} µF.`,
      );
}

function energyFixedQ(): RawQuestion {
  const k = ri(2, 5);
  return Num(
    `Un condensateur plan chargé (charge ${m("Q")} fixée, isolé) voit sa distance entre armatures multipliée par ${k}. Par quel facteur l'énergie ${m("U=Q^2/2C")} est-elle multipliée ?`,
    Fr(k),
    `C ∝ 1/d diminue d'un facteur ${k} ; à Q fixée U = Q²/2C est multipliée par ${k} (le travail extérieur fourni éloigne les plaques).`,
  );
}

const conductors = poolVF([
  { q: "À l'équilibre, le champ à l'intérieur d'un conducteur est nul.", t: true, e: "Sinon les charges libres se déplaceraient." },
  { q: "À l'équilibre, le potentiel est constant dans tout le conducteur.", t: true, e: "E = −∇V = 0 dans le conducteur." },
  { q: "À l'équilibre, la charge d'un conducteur est répartie dans son volume.", t: false, e: "Elle est localisée sur la surface." },
  { q: "Juste à l'extérieur d'un conducteur, le champ est tangent à sa surface.", t: false, e: "Il est normal à la surface : E = σ/ε₀ n (théorème de Coulomb)." },
  { q: "Le potentiel est continu à la traversée d'une surface chargée.", t: true, e: "Seul le champ (sa composante normale) présente une discontinuité." },
  { q: "Le champ est le gradient du potentiel : E = +∇V.", t: false, e: "E = −∇V : le champ pointe vers les potentiels décroissants." },
  { q: "Le potentiel d'une charge ponctuelle à l'infini est pris nul : V = q/(4πε₀r).", t: true, e: "Convention de référence à l'infini." },
]);

function capBug(): RawQuestion {
  return Bug(
    "Un condensateur plan chargé puis isolé (charge " + m("Q") + " fixée) voit sa distance " + m("d") + " doublée. Une ligne est fausse.",
    [
      "Isolé, la charge $Q$ est conservée.",
      "La capacité $C=\\varepsilon S/d$ est divisée par deux.",
      "L'énergie vaut $U=\\dfrac{Q^2}{2C}$ : elle est donc multipliée par deux.",
      "La tension $V=Q/C$ est donc divisée par deux.",
    ],
    3,
    [
      "La tension $V=Q/C$ est donc multipliée par deux.",
      "La tension $V=Q/C$ reste constante.",
      "La tension devient $V=2Q/C$.",
    ],
    "À Q fixée, C ↓ ⇒ V = Q/C ↑. Et U = QV/2 double bien : cohérent.",
  );
}

function potentialProof(): RawQuestion {
  return Order(
    "Reconstitue l'obtention de la capacité d'un condensateur plan.",
    [
      "Entre les armatures, le champ est uniforme et vaut $E=\\sigma/\\varepsilon_0=Q/(\\varepsilon_0S)$.",
      "La différence de potentiel est $V=\\int_0^d E\\,dx=Ed$.",
      "Donc $V=\\dfrac{Qd}{\\varepsilon_0S}$.",
      "Par définition $C=Q/V=\\dfrac{\\varepsilon_0S}{d}$.",
    ],
    ["Le champ entre les armatures vaut $2\\sigma/\\varepsilon_0$ (somme des deux plans, fausse ici).", "Donc $C=Qd/(\\varepsilon_0S)$."],
  );
}

function capGuided(): RawQuestion {
  const k = pick([2, 3, 4]);
  return Guided(
    `Un condensateur plan isolé porte la charge ${m("Q")}. On multiplie la distance entre ses armatures par ${k}.`,
    [
      gq("Qu'est-ce qui reste constant ?", ["La charge Q", "La tension V", "La capacité C", "L'énergie U"], ["Le condensateur est isolé : aucune charge ne peut entrer ni sortir."], "Isolé ⇒ Q = cte."),
      gn(`Par quel facteur C est-elle multipliée ?`, Fr(1, k), ["C = εS/d."], `C ∝ 1/d : 1/${k}.`),
      gn(`Par quel facteur la tension V = Q/C est-elle multipliée ?`, Fr(k), ["Q fixée, C divisée par k."], `V est multipliée par ${k}.`),
      gn(`Par quel facteur l'énergie U = QV/2 est-elle multipliée ?`, Fr(k), ["Q fixée, V multipliée par k."], `U est multipliée par ${k}.`),
    ],
    "À charge constante, éloigner les armatures coûte de l'énergie (on lutte contre l'attraction). À tension constante, ce serait l'inverse.",
  );
}

export const level: Level = {
  id: "EM3",
  name: "Potentiel & condensateurs",
  fiche: "CC1",
  icon: "🔋",
  color: "#7209b7",
  gens: [
    ["grad", gradient], ["cap", capScale], ["U", energyFixedQ], ["cond", conductors],
    ["cap-bug", capBug], ["C-proof", potentialProof], ["cap-guided", capGuided],
  ],
  piege: "E = −∇V (le signe !). À Q fixée, éloigner les armatures augmente V et U ; à V fixée, c'est Q qui diminue.",
  rappel: [
    "E = −∇V ; V = q/(4πε₀r) ; conducteur à l'équilibre : E = 0 dedans, V = cte, charges en surface, E = σ/ε₀ n.",
    "Condensateur plan : C = ε₀S/d ; U = Q²/2C = ½CV² = ½QV ; série 1/C = Σ1/Cᵢ ; parallèle C = ΣCᵢ.",
  ],
};
