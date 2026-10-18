// Physique moderne · niveau 1 : quanta de lumière
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { dec, L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Num, Order, poolVF, Qcm } from "../factories";

/** hc ≈ 1240 eV·nm : λ en nm → E en eV. */
const WAVES = [200, 248, 310, 400, 496, 620, 775, 1240];

function photonEnergy(): RawQuestion {
  const l = pick(WAVES);
  return Num(
    `On donne hc ≈ 1240 eV·nm. Quelle est l'énergie (en eV) d'un photon de longueur d'onde ${l} nm ?`,
    Fr(1240, l),
    "E = hc/λ = 1240/" + l + " = " + dec(Fr(1240, l)) + " eV.",
  );
}

function photoElectric(): RawQuestion {
  const l = pick([200, 248, 310, 400]);
  const e = Fr(1240, l);
  const W = pick([Fr(2), Fr(5, 2), Fr(23, 10), Fr(41, 10), Fr(9, 2)]);
  const ek = Fr(1240 * W.d - W.n * l, l * W.d);
  const ask = pick(["Ec", "Vs"] as const);
  if (ek.n <= 0) return photoElectric();
  return Num(
    `Un métal de travail d'extraction W = ${dec(W)} eV est éclairé par une lumière de longueur d'onde ${l} nm (hc ≈ 1240 eV·nm). ${ask === "Ec" ? "Quelle est l'énergie cinétique maximale (en eV) des électrons émis ?" : "Quel est le potentiel d'arrêt (en V) ?"}`,
    ek,
    `hν = ${dec(e)} eV, donc Ec,max = hν − W = ${dec(ek)} eV${ask === "Vs" ? ", et eV_stop = Ec,max donne V_stop = " + dec(ek) + " V" : ""}.`,
  );
}

function thresholdWavelength(): RawQuestion {
  const W = pick([Fr(2), Fr(5, 2), Fr(31, 10), Fr(4), Fr(31, 20)]);
  const ls = Fr(1240 * W.d, W.n);
  return Num(
    `Le travail d'extraction d'un métal vaut W = ${dec(W)} eV. Quelle est la longueur d'onde seuil λ_s (en nm), avec hc ≈ 1240 eV·nm ?`,
    ls,
    `λ_s = hc/W = 1240/${dec(W)} = ${dec(ls)} nm. Au-delà (λ > λ_s), aucun électron n'est émis, même à forte intensité.`,
  );
}

const traps = poolVF([
  { q: "Si l'on double l'intensité lumineuse (à fréquence fixe, au-dessus du seuil), l'énergie cinétique maximale des électrons double.", t: false, e: "Ec = hν − W ne dépend que de ν. L'intensité double le NOMBRE de photons, donc le courant." },
  { q: "Si l'on double l'intensité lumineuse (à fréquence fixe, au-dessus du seuil), le courant photoélectrique double.", t: true, e: "Deux fois plus de photons ⇒ deux fois plus d'électrons arrachés." },
  { q: "En dessous de la fréquence seuil, une lumière assez intense finit par arracher des électrons.", t: false, e: "Un photon seul doit apporter hν ≥ W ; l'accumulation n'existe pas." },
  { q: "Le potentiel d'arrêt est une fonction affine de la fréquence, de pente h/e.", t: true, e: "V_stop = (h/e)(ν − ν_s)." },
  { q: "Le travail d'extraction W dépend de la lumière utilisée.", t: false, e: "W est une propriété du métal seul." },
  { q: "L'effet photoélectrique est expliqué par le modèle ondulatoire classique de la lumière.", t: false, e: "Il impose une fréquence seuil, une énergie indépendante de l'intensité et un effet instantané : c'est l'argument d'Einstein pour les photons." },
  { q: "Un photon de longueur d'onde plus petite est plus énergétique.", t: true, e: "E = hc/λ." },
]);

function classicOrQuantum(): RawQuestion {
  const quantum = ri(0, 1) === 0;
  const total = quantum ? pick([-35, -34, -33]) : pick([-6, 0, 3, 7, 12]);
  const a = ri(-2, 2) + (total > -10 ? 1 : 0);
  const b = ri(-3, 3), c = total - a - b;
  return Qcm(
    `Un système a une masse ${m(L`10^{${a}}`)} kg, une vitesse ${m(L`10^{${b}}`)} m/s et une taille ${m(L`10^{${c}}`)} m. On compare son action typique ${m("S\\sim mvL")} à ${m(L`h\approx 6{,}6\times10^{-34}`)} J·s. Quel traitement ?`,
    ["Classique (S ≫ h)", "Quantique (S ~ h)"],
    quantum ? 1 : 0,
    `S ~ 10^(${a}+${b}+${c}) = 10^${total} J·s. ${quantum ? "C'est de l'ordre de h (10⁻³⁴) : la physique quantique est nécessaire." : "C'est très supérieur à h (10⁻³⁴) : un traitement classique suffit."}`,
  );
}

function intensityBug(): RawQuestion {
  return Bug(
    "On éclaire un métal avec une lumière de fréquence " + m(L`\nu>\nu_s`) + ". Une ligne est fausse.",
    [
      "Chaque photon transporte l'énergie $h\\nu$ et en cède $W$ pour extraire un électron.",
      "L'énergie cinétique maximale vaut donc $E_c=h\\nu-W$.",
      "Si l'on double l'intensité, l'énergie de chaque photon double, donc $E_c$ double.",
      "Le courant, lui, est proportionnel au nombre de photons reçus.",
    ],
    2,
    [
      "Si l'on double l'intensité, le nombre de photons double, mais l'énergie $h\\nu$ de chacun est inchangée : $E_c$ ne change pas, le courant double.",
      "Si l'on double l'intensité, $E_c$ double et le courant reste constant.",
      "Si l'on double l'intensité, le seuil $\\nu_s$ est divisé par deux.",
    ],
    "L'énergie d'un photon vaut hν : elle dépend de la fréquence, pas de l'intensité. L'intensité fixe le nombre de photons (donc le courant). Piège tombé à plusieurs CC.",
  );
}

function stopProof(): RawQuestion {
  return Order(
    "Reconstitue la démonstration que le potentiel d'arrêt est affine en " + m(L`\nu`) + ".",
    [
      "Un photon cède l'énergie $h\\nu$ ; une partie $W$ sert à extraire l'électron.",
      "L'énergie cinétique maximale est donc $E_{c,\\max}=h\\nu-W$.",
      "Le potentiel d'arrêt annule les électrons les plus rapides : $eV_{stop}=E_{c,\\max}$.",
      "Donc $V_{stop}=\\dfrac{h}{e}(\\nu-\\nu_s)$ : droite de pente $h/e$ (méthode de Millikan).",
    ],
    ["Le potentiel d'arrêt annule les électrons les plus lents.", "Donc $V_{stop}=\\dfrac{e}{h}\\,\\nu$ : proportionnel à $\\nu$."],
  );
}

export const level: Level = {
  id: "PHM1",
  name: "Quanta de lumière",
  fiche: "Chapitre 1",
  icon: "💡",
  color: "#f4a261",
  gens: [["photon", photonEnergy], ["photo", photoElectric], ["threshold", thresholdWavelength], ["traps", traps], ["action", classicOrQuantum], ["intensity-bug", intensityBug], ["stop-proof", stopProof]],
  piege: "Doubler l'intensité double le courant, PAS l'énergie cinétique. En dessous du seuil, rien, quelle que soit l'intensité.",
  rappel: [
    "Planck–Einstein : E = hν = hc/λ = ℏω. Pratique : hc ≈ 1240 eV·nm.",
    "Effet photoélectrique : hν = W + Ec,max ; seuil ν_s = W/h, λ_s = hc/W ; eV_stop = Ec,max.",
    "Ec ne dépend que de ν ; le courant est proportionnel à l'intensité (nombre de photons).",
    "Action typique S ~ mvL : S ≫ h classique, S ~ h quantique.",
  ],
};
