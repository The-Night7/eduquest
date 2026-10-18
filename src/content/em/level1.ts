// Électromagnétisme · niveau 1 : Coulomb, superposition, distributions
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolQcm, poolVF } from "../factories";

function coulombScale(): RawQuestion {
  const k = ri(2, 5);
  const field = ri(0, 1) === 0;
  return Num(
    `On multiplie par ${k} la distance à une charge ponctuelle. Par quel facteur le ${field ? "champ électrique" : "module de la force de Coulomb sur une charge test"} est-il multiplié ? (fraction ou entier)`,
    Fr(1, k * k),
    `E = q/(4πε₀r²) ∝ 1/r² (et F = qE) : distance × ${k} ⇒ facteur 1/${k * k}.`,
  );
}

function nullPoint(): RawQuestion {
  const k = ri(2, 5);
  const d = pick([6, 10, 12, 15, 20]);
  const x = Fr(d, 1 + k);
  return Num(
    `Deux charges positives ${m("q")} en O et ${m(String(k * k) + "q")} en ${m("x=" + d)} (cm) sont fixes sur un axe. En quel point ${m("x")} (cm, entre les deux) le champ total est-il nul ?`,
    x,
    `q/x² = ${k * k}q/(${d}−x)² ⇒ (${d}−x) = ${k}x ⇒ x = ${d}/${1 + k}.`,
  );
}

function sphereCharge(): RawQuestion {
  const p = pick([0, 1, 2, 3]);
  return Num(
    `Une boule de rayon ${m("R")} porte la densité volumique ${m(L`\rho(r)=\rho_0\left(\frac{r}{R}\right)^{${p}}`)}. Sa charge totale s'écrit ${m(L`Q=c\,\pi\rho_0R^3`)}. Que vaut ${m("c")} ?`,
    Fr(4, p + 3),
    `Q = ∫₀^R ρ₀ (r/R)^${p} 4πr² dr = 4πρ₀ R^(−${p}) R^(${p + 3})/(${p + 3}) = (4/${p + 3}) πρ₀R³.`,
  );
}

const volElem = poolQcm([
  { q: "Quel est l'élément de volume en coordonnées sphériques ?", r: "r² sinθ dr dθ dφ", w: ["r sinθ dr dθ dφ", "r² dr dθ dφ", "sinθ dr dθ dφ"], e: "Jacobien r² sinθ : un piège classique de CC." },
  { q: "Quel est l'élément de volume en coordonnées cylindriques ?", r: "r dr dθ dz", w: ["r² dr dθ dz", "dr dθ dz", "r sinθ dr dθ dz"], e: "Jacobien r." },
  { q: "Quel est l'élément de surface d'une sphère de rayon R ?", r: "R² sinθ dθ dφ", w: ["R sinθ dθ dφ", "R² dθ dφ", "4πR² dθ dφ"], e: "On fixe r = R dans r² sinθ." },
]);

const field = poolVF([
  { q: "Le champ électrostatique en un point appartient à tout plan de symétrie de la distribution passant par ce point.", t: true, e: "Principe de Curie : E est contenu dans les plans de symétrie." },
  { q: "Le champ est perpendiculaire à un plan d'antisymétrie de la distribution.", t: true, e: "Les plans d'antisymétrie (charges opposées) : E est ⟂ au plan." },
  { q: "Le principe de superposition est valable pour les champs mais pas pour les potentiels.", t: false, e: "Les deux sont linéaires en les charges." },
  { q: "La force entre deux charges de même signe est attractive.", t: false, e: "Même signe : répulsive." },
  { q: "Une distribution plane infinie chargée uniformément crée un champ de module indépendant de la distance au plan.", t: true, e: "E = σ/(2ε₀), uniforme de chaque côté." },
  { q: "Dans la loi de Coulomb, ε₀ a la dimension d'une charge au carré par force et par longueur au carré.", t: true, e: "F = q²/(4πε₀r²) ⇒ [ε₀] = C²·N⁻¹·m⁻²." },
]);

function superBug(): RawQuestion {
  return Bug(
    "Deux charges " + m("+q") + " en " + m("(-a,0)") + " et " + m("(a,0)") + ". On cherche le champ en un point " + m("M(0,y)") + " de la médiatrice. Une ligne est fausse.",
    [
      "Les deux charges sont symétriques par rapport à l'axe $Oy$ : le plan $Oyz$ est un plan de symétrie.",
      "Donc $\\vec E(M)$ est contenu dans ce plan, il est dirigé selon $\\vec e_y$.",
      "Chaque charge crée en $M$ un champ de module $\\dfrac{q}{4\\pi\\varepsilon_0 y^2}$.",
      "Les composantes selon $Oy$ s'ajoutent : $E_y=2\\dfrac{q}{4\\pi\\varepsilon_0(a^2+y^2)}\\cdot\\dfrac{y}{\\sqrt{a^2+y^2}}$.",
    ],
    2,
    [
      "Chaque charge crée en $M$ un champ de module $\\dfrac{q}{4\\pi\\varepsilon_0 (a^2+y^2)}$ (la distance à chaque charge est $\\sqrt{a^2+y^2}$).",
      "Chaque charge crée en $M$ un champ de module $\\dfrac{q}{4\\pi\\varepsilon_0\\sqrt{a^2+y^2}}$.",
      "Chaque charge crée en $M$ un champ de module $\\dfrac{q}{4\\pi\\varepsilon_0 a^2}$.",
    ],
    "La distance de M à chaque charge est √(a²+y²), pas y : le module est q/(4πε₀(a²+y²)), puis on projette sur Oy avec le facteur y/√(a²+y²).",
  );
}

function chargeProof(): RawQuestion {
  return Order(
    "Reconstitue le calcul de la charge totale d'une boule de densité " + m("\\rho(r)") + ".",
    [
      "La charge d'une coquille entre $r$ et $r+dr$ est $dq=\\rho(r)\\,4\\pi r^2\\,dr$.",
      "On somme les coquilles : $Q=\\int_0^R\\rho(r)\\,4\\pi r^2\\,dr$.",
      "On remplace $\\rho(r)$ par son expression et on intègre en $r$.",
      "On obtient $Q$ en fonction de $\\rho_0$ et $R$.",
    ],
    ["La charge est $\\rho(R)\\times\\frac{4}{3}\\pi R^3$ quelle que soit $\\rho(r)$.", "On intègre $\\rho(r)\\,dr$ sans le facteur $4\\pi r^2$."],
  );
}

function nullGuided(): RawQuestion {
  const k = pick([2, 3]);
  const d = pick([12, 20]);
  return Guided(
    `Deux charges positives ${m("q")} (en ${m("x=0")}) et ${m(String(k * k) + "q")} (en ${m("x=" + d)} cm) sont fixes. On cherche le point d'équilibre du champ entre elles.`,
    [
      gq(
        "Entre deux charges de même signe, que peut-on dire des champs ?",
        ["Ils sont opposés : une annulation est possible", "Ils s'ajoutent : pas d'annulation", "Ils sont perpendiculaires", "Ils sont nuls"],
        ["Dessine les flèches : une charge positive repousse."],
        "Entre deux charges de même signe, les champs se font face : l'annulation est possible.",
      ),
      gq(
        "Quelle équation traduit E_total(x) = 0 ?",
        [`q/x² = ${k * k}q/(${d}−x)²`, `q/x = ${k * k}q/(${d}−x)`, `q/x² + ${k * k}q/(${d}−x)² = 0`, `q·x = ${k * k}q·(${d}−x)`],
        ["Les modules sont égaux (les sens sont déjà opposés)."],
        "Égalité des modules en 1/r².",
      ),
      gn(
        "Quelle est la racine carrée du rapport des charges ?",
        Fr(k),
        [`√(${k * k})`],
        `√${k * k} = ${k}.`,
      ),
      gn(
        "Quelle est la position x du point d'annulation (en cm) ?",
        Fr(d, 1 + k),
        [`(${d} − x) = ${k}x`],
        `x = ${d}/${1 + k} cm : plus proche de la petite charge.`,
      ),
    ],
    "Le point neutre est plus proche de la plus petite charge : le champ de la grosse charge décroît en 1/r².",
  );
}

export const level: Level = {
  id: "EM1",
  name: "Coulomb & distributions",
  fiche: "CC1",
  icon: "⚡",
  color: "#f72585",
  gens: [
    ["scale", coulombScale], ["zero", nullPoint], ["Q", sphereCharge], ["vol", volElem],
    ["sym", field], ["super-bug", superBug], ["Q-proof", chargeProof], ["zero-guided", nullGuided],
  ],
  piege: "Élément de volume sphérique : r² sinθ (pas r sinθ). Le champ appartient aux plans de symétrie.",
  rappel: [
    "Coulomb : E = q/(4πε₀r²) ∝ 1/r² ; superposition vectorielle.",
    "Symétries : E ∈ plans de symétrie ; E ⟂ plans d'antisymétrie.",
    "dV sphérique = r² sinθ dr dθ dφ ; cylindrique = r dr dθ dz ; dq = ρ dV.",
  ],
};
