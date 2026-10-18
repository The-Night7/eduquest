// Physique moderne · niveau 2 : ondes de matière
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolVF } from "../factories";

function sameEnergy(): RawQuestion {
  const k = ri(2, 6);
  return Num(
    `Deux particules ont la même énergie cinétique. La seconde est ${k * k} fois plus massive que la première. Combien vaut le rapport ${m("\\lambda_1/\\lambda_2")} des longueurs d'onde de de Broglie ?`,
    Fr(k),
    `λ = h/p et p = √(2mEc) : à Ec fixée, λ ∝ 1/√m. Rapport de masses ${k * k}, donc λ₁/λ₂ = √${k * k} = ${k}.`,
  );
}

function sameMomentum(): RawQuestion {
  const k = ri(2, 9);
  return Num(
    `Un électron voit sa quantité de mouvement multipliée par ${k}. Par quel facteur λ_dB est-elle multipliée ? (réponse sous forme de fraction ou d'entier)`,
    Fr(1, k),
    `λ = h/p : p × ${k} ⇒ λ divisée par ${k}.`,
  );
}

function dimPsi(): RawQuestion {
  const d = pick([1, 2, 3]);
  return Num(
    `La condition de normalisation est ${m("\\int|\\psi|^2\\,d^{" + d + "}r=1")} dans un espace de dimension ${d}. Si ${m("\\psi")} a pour dimension ${m("L^{p}")}, que vaut ${m("p")} ?`,
    Fr(-d, 2),
    `|ψ|² d^${d}r est sans dimension, d^${d}r ~ L^${d}, donc |ψ|² ~ L^(−${d}) et ψ ~ L^(−${d}/2).`,
  );
}

function confinement(): RawQuestion {
  const k = ri(2, 6);
  return Num(
    `Un électron est confiné dans une région de taille ${m("L")}. On réduit ${m("L")} d'un facteur ${k}. Par quel facteur l'énergie cinétique minimale ${m("E_{\\min}\\sim\\hbar^2/(mL^2)")} est-elle multipliée ?`,
    Fr(k * k),
    `Δx ~ L ⇒ Δp ≳ ℏ/(2L) ⇒ E ~ Δp²/2m ∝ 1/L². L/${k} multiplie E par ${k * k}.`,
  );
}

const concepts = poolVF([
  { q: "L'inégalité de Heisenberg vient de l'imperfection de nos instruments de mesure.", t: false, e: "C'est une propriété fondamentale de l'état quantique (indétermination), pas une limite technique." },
  { q: "Δx·Δp ≥ ℏ/2 : plus on localise une particule, plus sa quantité de mouvement est dispersée.", t: true, e: "Fourier : un paquet étroit en x est large en p." },
  { q: "Une particule confinée peut avoir une énergie cinétique nulle.", t: false, e: "Δx fini ⇒ Δp ≥ ℏ/2Δx > 0 ⇒ énergie minimale non nulle (énergie de point zéro)." },
  { q: "|ψ(x,t)|² est une densité de probabilité de présence.", t: true, e: "|ψ|²dx est la probabilité de trouver la particule entre x et x+dx." },
  { q: "ψ(x,t) est directement mesurable.", t: false, e: "Seule |ψ|² a une interprétation physique." },
  { q: "Un objet macroscopique a une longueur d'onde de de Broglie mesurable à l'échelle humaine.", t: false, e: "λ = h/mv ~ 10⁻³⁴/(masse·vitesse) : ridiculement petite." },
  { q: "Les électrons peuvent produire des figures de diffraction.", t: true, e: "Davisson–Germer : preuve du caractère ondulatoire de la matière." },
  { q: "Le principe d'indétermination s'applique de la même façon à x et à y.", t: false, e: "Il lie des grandeurs conjuguées : x et p_x (pas x et p_y)." },
]);

function dimBug(): RawQuestion {
  return Bug(
    "On cherche la dimension de la fonction d'onde " + m("\\psi") + " d'une particule dans l'espace usuel (3D). Une ligne est fausse.",
    [
      "La probabilité totale vaut 1 : $\\int |\\psi|^2\\,d^3r=1$.",
      "Le volume $d^3r$ a la dimension $L^3$.",
      "Donc $|\\psi|^2$ est de dimension $L^{-3}$.",
      "Donc $\\psi$ est de dimension $L^{-3}$.",
    ],
    3,
    [
      "Donc $\\psi$ est de dimension $L^{-3/2}$ (racine de $L^{-3}$).",
      "Donc $\\psi$ est de dimension $L^{3/2}$.",
      "Donc $\\psi$ est sans dimension.",
    ],
    "|ψ|² ~ L⁻³ donc ψ ~ L^(−3/2) : on prend la racine, jamais le même exposant.",
  );
}

function heisenbergProof(): RawQuestion {
  return Order(
    "Reconstitue l'argument qui montre qu'une particule confinée a une énergie minimale non nulle.",
    [
      "La particule est confinée dans une région de taille $L$ : $\\Delta x\\sim L$.",
      "Heisenberg impose $\\Delta p\\gtrsim \\hbar/(2L)$.",
      "Donc $\\langle p^2\\rangle\\gtrsim(\\Delta p)^2$ ne peut pas être nul.",
      "Alors $E_c\\gtrsim \\dfrac{\\hbar^2}{8mL^2}>0$ : plus $L$ est petit, plus $E$ est grande.",
    ],
    ["Donc on peut choisir $\\Delta p=0$ en prenant $L$ très petit.", "Alors $E_c\\gtrsim \\hbar L/m$."],
  );
}

function confinedGuided(): RawQuestion {
  const k = pick([2, 3, 4]);
  return Guided(
    `Un électron est piégé dans une boîte de taille ${m("L")}. On veut estimer comment son énergie minimale évolue quand on comprime la boîte.`,
    [
      gq(
        "Quelle relation relie l'incertitude sur la position à celle sur la quantité de mouvement ?",
        ["Δx·Δp ≥ ℏ/2", "Δx·Δp ≤ ℏ/2", "Δx + Δp ≥ ℏ/2", "Δx/Δp ≥ ℏ/2"],
        ["C'est le principe d'indétermination.", "Plus on localise (Δx petit), plus Δp doit être grand : le produit a une borne INFÉRIEURE."],
        "Heisenberg : le produit est minoré.",
      ),
      gq(
        "Si Δx ~ L, comment varie Δp minimal avec L ?",
        ["Δp ∝ 1/L", "Δp ∝ L", "Δp ∝ L²", "Δp indépendant de L"],
        ["Δp ≥ ℏ/(2Δx)."],
        "Δp_min = ℏ/2L ∝ 1/L.",
      ),
      gq(
        "Quelle est la dépendance de l'énergie cinétique minimale ?",
        ["E ∝ 1/L²", "E ∝ 1/L", "E ∝ L²", "E ∝ L"],
        ["Ec = p²/2m."],
        "E ~ (Δp)²/2m ∝ 1/L².",
      ),
      gn(
        `On divise L par ${k}. Par quel facteur l'énergie minimale est-elle multipliée ?`,
        Fr(k * k),
        ["E ∝ 1/L² : élever le facteur au carré."],
        `(1/(L/${k})²) = ${k}²/L² : facteur ${k * k}.`,
      ),
    ],
    "Plus on confine, plus l'énergie minimale monte : c'est l'énergie de point zéro, et la raison pour laquelle l'atome ne s'effondre pas.",
  );
}

export const level: Level = {
  id: "PHM2",
  name: "Ondes de matière",
  fiche: "Chapitre 2",
  icon: "🌊",
  color: "#2a9d8f",
  gens: [
    ["sameE", sameEnergy], ["sameP", sameMomentum], ["dim", dimPsi], ["conf", confinement],
    ["concepts", concepts], ["dim-bug", dimBug], ["heis-proof", heisenbergProof], ["conf-guided", confinedGuided],
  ],
  piege: "ψ de dimension L^(−d/2), pas L^(−d). Heisenberg est une propriété de l'état, pas de l'instrument.",
  rappel: [
    "de Broglie : λ = h/p = h/(mv), p = ℏk, E = ℏω.",
    "|ψ|² = densité de probabilité de présence ; normalisation ∫|ψ|² = 1 ⇒ ψ ~ L^(−d/2).",
    "Heisenberg : Δx·Δp ≥ ℏ/2 ⇒ une particule confinée a E_min ∝ 1/L².",
  ],
};
