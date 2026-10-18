// Ondes · niveau 4 : oscillations couplées et modes normaux
import { Fr } from "../../core/fraction";
import { pick } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolVF } from "../factories";
import { COUP } from "./helpers";

const setup = (mass: number, k: number, kap: number): string =>
  `Deux masses identiques ${m("m=" + mass)} kg sont reliées chacune à un mur par un ressort de raideur ${m("k=" + k)} N/m et entre elles par un ressort de raideur ${m("\\kappa=" + kap)} N/m.`;

function params(): { mass: number; k: number; kap: number; p: number; q: number } {
  const [p, q] = pick(COUP);
  const mass = pick([1, 2, 3]);
  return { mass, k: mass * p * p, kap: (mass * (q * q - p * p)) / 2, p, q };
}

function inPhase(): RawQuestion {
  const { mass, k, kap, p } = params();
  return Num(
    `${setup(mass, k, kap)} Quelle est la pulsation (rad/s) du mode où les deux masses oscillent EN PHASE ?`,
    Fr(p),
    `En phase, le ressort central ne travaille pas : ω₁ = √(k/m) = √(${k}/${mass}) = ${p} rad/s.`,
  );
}

function antiPhase(): RawQuestion {
  const { mass, k, kap, q } = params();
  return Num(
    `${setup(mass, k, kap)} Quelle est la pulsation (rad/s) du mode où les deux masses oscillent EN OPPOSITION de phase ?`,
    Fr(q),
    `En opposition, le ressort central est allongé de 2x : ω₂ = √((k + 2κ)/m) = √((${k} + ${2 * kap})/${mass}) = ${q} rad/s.`,
  );
}

function slowFast(): RawQuestion {
  const { mass, k, kap } = params();
  return Qcm(
    `${setup(mass, k, kap)} Quel mode a la pulsation la plus élevée ?`,
    ["Opposition de phase", "En phase", "Les deux ont la même pulsation"],
    0,
    "Le ressort de couplage ajoute de la raideur seulement quand les masses bougent en opposition : ω₂² = (k + 2κ)/m > ω₁² = k/m.",
  );
}

function beat(): RawQuestion {
  const { p, q } = params();
  return Num(
    `Un système couplé a pour modes normaux ${m("\\omega_1=" + p)} et ${m("\\omega_2=" + q)} rad/s. Quelle est la pulsation de BATTEMENT ${m("\\omega_2-\\omega_1")} (rad/s) ?`,
    Fr(q - p),
    `En lâchant une seule masse, l'énergie passe de l'une à l'autre à la pulsation d'enveloppe (ω₂ − ω₁)/2 ; l'écart ω₂ − ω₁ = ${q - p} rad/s.`,
  );
}

const concepts = poolVF([
  { q: "Un mode normal est un mouvement où toutes les masses oscillent à la même pulsation.", t: true, e: "Définition d'un mode propre." },
  { q: "Un mouvement quelconque du système couplé est une superposition des modes normaux.", t: true, e: "Linéarité : x(t) = somme des modes pondérés par les conditions initiales." },
  { q: "Le nombre de modes normaux est égal au nombre de degrés de liberté.", t: true, e: "N masses ⇒ N modes (ici 2)." },
  { q: "Dans chaque mode, les deux masses ont toujours la même amplitude et la même phase.", t: false, e: "En phase ou en opposition de phase (mode antisymétrique), selon le mode." },
  { q: "Lâcher une seule masse excite un seul mode normal.", t: false, e: "Il excite les deux modes simultanément, d'où le phénomène de battements." },
  { q: "Les modes normaux se déterminent en cherchant des solutions de la forme x_i = A_i cos(ωt + φ) avec la même ω pour tous les i.", t: true, e: "Système linéaire en A_i : déterminant nul donne les ω." },
]);

function modeBug(): RawQuestion {
  return Bug(
    "Deux masses identiques, couplées par un ressort " + m("\\kappa") + ", chacune reliée à un mur par " + m("k") + ". Une ligne est fausse.",
    [
      "Équations : $m\\ddot x_1=-kx_1-\\kappa(x_1-x_2)$ et $m\\ddot x_2=-kx_2-\\kappa(x_2-x_1)$.",
      "Somme : $m\\ddot s=-ks$ avec $s=x_1+x_2$ : pulsation $\\omega_1=\\sqrt{k/m}$ (mode en phase).",
      "Différence : $m\\ddot d=-(k+\\kappa)d$ avec $d=x_1-x_2$ : pulsation $\\omega_2=\\sqrt{(k+\\kappa)/m}$.",
      "Tout mouvement est une combinaison de ces deux modes normaux.",
    ],
    2,
    [
      "Différence : $m\\ddot d=-(k+2\\kappa)d$ avec $d=x_1-x_2$ : pulsation $\\omega_2=\\sqrt{(k+2\\kappa)/m}$.",
      "Différence : $m\\ddot d=-(k-2\\kappa)d$ : pulsation $\\sqrt{(k-2\\kappa)/m}$.",
      "Différence : $m\\ddot d=-kd$ : même pulsation que la somme.",
    ],
    "En soustrayant : m(ẍ₁−ẍ₂) = −k(x₁−x₂) − 2κ(x₁−x₂). Le couplage compte DEUX fois (chaque masse tire sur l'autre) : k + 2κ.",
  );
}

function modeOrder(): RawQuestion {
  return Order(
    "Reconstitue la recherche des modes normaux de deux masses couplées.",
    [
      "Écrire la relation fondamentale de la dynamique pour chaque masse.",
      "Additionner puis soustraire les équations pour découpler : variables $s=x_1+x_2$ et $d=x_1-x_2$.",
      "Chaque variable obéit à une équation d'oscillateur harmonique, de pulsation $\\omega_1$ pour $s$ et $\\omega_2$ pour $d$.",
      "La solution générale superpose les deux modes ; les conditions initiales fixent les amplitudes.",
    ],
    ["Chercher directement $x_1(t)=A\\cos\\omega_0t$ comme si le ressort central n'existait pas.", "Supposer que chaque masse oscille à sa propre pulsation, indépendamment de l'autre."],
  );
}

function coupledGuided(): RawQuestion {
  const { mass, k, kap, p, q } = params();
  return Guided(
    `${setup(mass, k, kap)} On cherche les deux pulsations propres.`,
    [
      gq(
        "Quelle combinaison de x₁ et x₂ découple le mouvement 'en phase' ?",
        ["x₁ + x₂", "x₁ − x₂", "x₁ · x₂", "x₁²+ x₂²"],
        ["Additionne les deux équations : le terme de couplage disparaît."],
        "Dans la somme, κ(x₁−x₂) + κ(x₂−x₁) = 0.",
      ),
      gn("Quelle est la pulsation du mode en phase (rad/s) ?", Fr(p), ["ω² = k/m."], `√(${k}/${mass}) = ${p}.`),
      gn("Que vaut (k + 2κ)/m ?", Fr(q * q), ["Calcule k + 2κ puis divise par m."], `(${k} + ${2 * kap})/${mass} = ${q * q}.`),
      gn("Quelle est la pulsation du mode en opposition (rad/s) ?", Fr(q), ["Racine du résultat précédent."], `ω₂ = ${q} rad/s.`),
    ],
    "Retenir : en phase, le ressort de couplage est au repos ; en opposition, il est tiré deux fois plus : k → k + 2κ.",
  );
}

export const level: Level = {
  id: "WAV4",
  name: "Oscillations couplées",
  fiche: "Chapitre 3",
  icon: "🔗",
  color: "#90e0ef",
  gens: [
    ["inphase", inPhase], ["antiphase", antiPhase], ["slowfast", slowFast], ["beat", beat],
    ["concepts", concepts], ["mode-bug", modeBug], ["mode-order", modeOrder], ["coupled-guided", coupledGuided],
  ],
  piege: "Le ressort de couplage compte deux fois en opposition de phase : ω₂² = (k + 2κ)/m. Il ne travaille pas en phase.",
  rappel: [
    "Modes normaux : tous les corps oscillent à la même ω. N degrés de liberté ⇒ N modes.",
    "Deux masses identiques : s = x₁ + x₂ (ω₁² = k/m), d = x₁ − x₂ (ω₂² = (k + 2κ)/m).",
    "Mouvement quelconque = superposition des modes ; lâcher une seule masse ⇒ battements.",
  ],
};
