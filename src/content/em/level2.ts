// Électromagnétisme · niveau 2 : symétries et théorème de Gauss
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolQcm, poolVF } from "../factories";

function insideExponent(): RawQuestion {
  const p = pick([0, 1, 2, 3]);
  return Num(
    `Une boule de rayon ${m("R")} a la densité ${m(L`\rho(r)=\rho_0(r/R)^{${p}}`)}. À l'intérieur, le champ varie en ${m("E(r)\\propto r^{s}")}. Que vaut ${m("s")} ?`,
    Fr(p + 1),
    `Gauss : E·4πr² = Q_int/ε₀ avec Q_int ∝ r^${p + 3}, donc E ∝ r^${p + 3}/r² = r^${p + 1}.`,
  );
}

function fieldRatio(): RawQuestion {
  const geo = pick(["sphère", "fil", "plan"] as const);
  const k = ri(2, 5);
  if (geo === "sphère")
    return Num(
      `Pour une sphère chargée de rayon ${m("R")}, quel est le rapport ${m(`E(${2 * k}R)/E(2R)`)} (points extérieurs) ?`,
      Fr(1, k * k),
      `À l'extérieur E = Q/(4πε₀r²) ∝ 1/r² : r × ${k} ⇒ E divisé par ${k * k}.`,
    );
  if (geo === "fil")
    return Num(
      `Pour un fil rectiligne infini uniformément chargé, on multiplie par ${k} la distance au fil. Par quel facteur le champ est-il multiplié ?`,
      Fr(1, k),
      `Gauss sur un cylindre : E·2πrℓ = λℓ/ε₀ ⇒ E = λ/(2πε₀r) ∝ 1/r : facteur 1/${k}.`,
    );
  return Num(
    `Pour un plan infini uniformément chargé, on multiplie par ${k} la distance au plan. Par quel facteur le champ est-il multiplié ?`,
    Fr(1),
    "E = σ/(2ε₀) ne dépend pas de la distance au plan : facteur 1.",
  );
}

const surface = poolQcm([
  { q: "Pour un fil rectiligne infini, quelle surface de Gauss choisir ?", r: "Un cylindre coaxial", w: ["Une sphère centrée sur un point du fil", "Un cube", "N'importe laquelle"], e: "La surface doit épouser la symétrie (E radial, de module constant sur le cylindre)." },
  { q: "Pour une boule chargée à symétrie sphérique, quelle surface de Gauss choisir ?", r: "Une sphère de même centre", w: ["Un cylindre", "Un cube", "Un disque"], e: "E = E(r)e_r est constant en module sur la sphère de rayon r." },
  { q: "Pour un plan infini chargé, la surface de Gauss adaptée est…", r: "Un cylindre (ou parallélépipède) à bases parallèles au plan", w: ["Une sphère", "Un cylindre d'axe parallèle au plan", "Un tore"], e: "E est normal au plan et uniforme : le flux passe par les deux bases." },
]);

const gauss = poolVF([
  { q: "Le théorème de Gauss n'est valable que pour les distributions à symétrie sphérique.", t: false, e: "Il est TOUJOURS vrai ; il n'est UTILE pour trouver E que si la symétrie permet de sortir E de l'intégrale." },
  { q: "Le flux de E à travers une surface fermée ne dépend que de la charge intérieure.", t: true, e: "Φ = Q_int/ε₀." },
  { q: "Les charges situées à l'extérieur de la surface de Gauss n'influencent pas le champ en un point de la surface.", t: false, e: "Elles influencent E, mais leur flux net à travers la surface fermée est nul." },
  { q: "À l'intérieur d'une cavité vide dans un conducteur en équilibre, le champ est nul.", t: true, e: "Écran électrostatique (cage de Faraday), s'il n'y a pas de charge dans la cavité." },
  { q: "Le champ à l'intérieur d'une coquille sphérique uniformément chargée est nul.", t: true, e: "Gauss : Q_int = 0 et symétrie sphérique ⇒ E = 0." },
]);

function cubeBug(): RawQuestion {
  return Bug(
    "On veut le champ créé par une charge ponctuelle " + m("Q") + " au centre d'un cube d'arête " + m("a") + ", sur le milieu d'une face. Une ligne est fausse.",
    [
      "Le flux total à travers le cube est $\\Phi=Q/\\varepsilon_0$ (Gauss).",
      "Par symétrie, chaque face reçoit le même flux $\\Phi/6$.",
      "Le champ est donc uniforme sur chaque face : $\\Phi/6=E\\,a^2$.",
      "D'où $E=Q/(6\\varepsilon_0a^2)$ au milieu d'une face.",
    ],
    2,
    [
      "Le champ n'est pas uniforme sur la face (il varie avec la distance à la charge) : on ne peut pas sortir $E$ de l'intégrale.",
      "Le champ est uniforme sur chaque face car le cube est symétrique.",
      "Le flux à travers chaque face est $\\Phi/8$.",
    ],
    "Gauss est vrai, mais il ne donne E que si E est constant sur la surface. Un cube autour d'une charge ponctuelle n'a pas cette propriété : il faudrait la sphère.",
  );
}

function wireProof(): RawQuestion {
  return Order(
    "Reconstitue le calcul du champ d'un fil infini de charge linéique " + m("\\lambda") + ".",
    [
      "Symétries : invariance par rotation et translation ⇒ $\\vec E=E(r)\\,\\vec e_r$ (coordonnées cylindriques).",
      "On choisit comme surface de Gauss un cylindre coaxial de rayon $r$ et de hauteur $h$.",
      "Le flux traverse la surface latérale seule : $\\Phi=E(r)\\,2\\pi rh$ (bases : $\\vec E\\perp d\\vec S$).",
      "Gauss : $E(r)\\,2\\pi rh=\\dfrac{\\lambda h}{\\varepsilon_0}$, donc $E=\\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$.",
    ],
    ["Le flux traverse aussi les bases, qui contribuent autant que la surface latérale.", "On applique Gauss avec une sphère centrée sur le fil."],
  );
}

function gaussGuided(): RawQuestion {
  const p = pick([0, 1, 2]);
  return Guided(
    `Une boule de rayon ${m("R")} porte la densité ${m(L`\rho(r)=\rho_0(r/R)^{${p}}`)}. On cherche l'évolution de ${m("E(r)")} à l'intérieur.`,
    [
      gq(
        "Quelle est la forme de E ?",
        ["E = E(r) e_r", "E = E(θ) e_θ", "E = E(r) e_θ", "E = constante"],
        ["Symétrie sphérique : invariance par toute rotation autour du centre."],
        "Symétrie sphérique ⇒ E radial et fonction de r seule.",
      ),
      gn(
        "Q_int(r) ∝ r^α : quel est α ?",
        Fr(p + 3),
        ["Q_int = ∫ρ 4πr'² dr'."],
        `ρ ∝ r'^${p}, r'² dr' ⇒ r^${p + 3}.`,
      ),
      gn(
        "Gauss donne E(r)·4πr² = Q_int/ε₀. E ∝ r^s : quel est s ?",
        Fr(p + 1),
        ["On divise Q_int ∝ r^α par r²."],
        `s = ${p + 3} − 2 = ${p + 1}.`,
      ),
      gn(
        "Par quel facteur E est-il multiplié quand on passe de r = R à r = R/2 ?",
        Fr(1, 2 ** (p + 1)),
        ["(1/2)^s"],
        `(1/2)^${p + 1} = 1/${2 ** (p + 1)}.`,
      ),
    ],
    "Méthode Gauss en 3 temps : symétries, surface, charge intérieure.",
  );
}

export const level: Level = {
  id: "EM2",
  name: "Symétries & Gauss",
  fiche: "CC1",
  icon: "🎯",
  color: "#b5179e",
  gens: [
    ["s", insideExponent], ["ratio", fieldRatio], ["surf", surface], ["gauss", gauss],
    ["cube-bug", cubeBug], ["wire-proof", wireProof], ["gauss-guided", gaussGuided],
  ],
  piege: "Gauss est toujours vrai mais ne donne E que si E est constant sur la surface choisie (sphère, cylindre, plan). Pas un cube pour une charge ponctuelle.",
  rappel: [
    "Φ = ∮E·dS = Q_int/ε₀.",
    "Sphère : E = Q_int/(4πε₀r²). Fil infini : E = λ/(2πε₀r). Plan infini : E = σ/(2ε₀).",
    "Méthode : symétries → surface de Gauss → Q_int → E.",
  ],
};
