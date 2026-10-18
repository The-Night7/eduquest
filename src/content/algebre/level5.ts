// Algèbre linéaire · niveau 5 : Cayley–Hamilton, trigonalisation, matrices symétriques
import { Fr } from "../../core/fraction";
import { fromDiag, inverse, mtex } from "../../core/matrix";
import { pick, ri, shuffle } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Order, poolQcm, poolVF } from "../factories";
import { mathMat } from "./helpers";

function cayleyInverse(): RawQuestion {
  const [a, b] = shuffle([-3, -2, -1, 1, 2, 3, 4]).slice(0, 2) as [number, number];
  const { A } = fromDiag([a, b], 2);
  const Ai = inverse(A);
  const i = ri(0, 1), j = ri(0, 1);
  const t = a + b, d = a * b;
  return Num(
    mathMat("A", A) + ". Par Cayley–Hamilton " + m(L`A^2-(\operatorname{tr}A)A+(\det A)I=0`) + ". En déduire le coefficient (" + (i + 1) + "," + (j + 1) + ") de " + m("A^{-1}") + ".",
    Ai[i]![j]!,
    `tr A = ${t}, det A = ${d} ≠ 0 : A⁻¹ = (${t}·I − A) / ${d} = ${m(mtex(Ai))}.`,
  );
}

const trigo = poolQcm([
  { q: "Toute matrice de Mₙ(ℂ) est…", r: "trigonalisable", w: ["diagonalisable", "inversible", "symétrique"], e: "χ_A est toujours scindé sur ℂ (d'Alembert–Gauss)." },
  { q: "A ∈ Mₙ(ℝ) est trigonalisable sur ℝ si et seulement si…", r: "χ_A est scindé sur ℝ", w: ["χ_A est à racines simples", "A est symétrique", "det A ≠ 0"], e: "Il faut toutes les valeurs propres réelles." },
  { q: "La rotation d'angle π/2 de ℝ², matrice [[0,−1],[1,0]], est…", r: "non trigonalisable sur ℝ", w: ["diagonalisable sur ℝ", "trigonalisable mais pas diagonalisable sur ℝ", "nilpotente"], e: "χ = λ² + 1 n'a pas de racine réelle." },
  { q: "Une matrice nilpotente non nulle est…", r: "trigonalisable mais pas diagonalisable", w: ["diagonalisable", "inversible", "orthogonale"], e: "Sa seule valeur propre est 0 ; si elle était diagonalisable elle serait nulle." },
  { q: "Pour une matrice triangulaire supérieure, les valeurs propres sont…", r: "les coefficients diagonaux", w: ["les coefficients au-dessus de la diagonale", "toujours distinctes", "égales à la trace"], e: "χ_A = ∏(aᵢᵢ − λ)." },
]);

const spectral = poolVF([
  { q: "Une matrice réelle symétrique a toutes ses valeurs propres réelles.", t: true, e: "Théorème spectral." },
  { q: "Une matrice réelle symétrique est diagonalisable dans une base orthonormée.", t: true, e: "A = PDPᵀ avec P orthogonale." },
  { q: "Deux vecteurs propres de valeurs propres distinctes d'une matrice quelconque sont orthogonaux.", t: false, e: "Seulement pour une matrice SYMÉTRIQUE (et produit scalaire usuel)." },
  { q: "Si A est symétrique définie positive, ses valeurs propres sont strictement positives.", t: true, e: "Av = λv ⇒ λ‖v‖² = vᵀAv > 0." },
  { q: "Toute matrice diagonalisable est symétrique.", t: false, e: "[[1,1],[0,2]] est diagonalisable (valeurs propres 1, 2) et non symétrique." },
  { q: "Si P est orthogonale, alors P⁻¹ = Pᵀ.", t: true, e: "PᵀP = I." },
]);

function symGuided(): RawQuestion {
  const a = ri(1, 4), b = pick([-3, -2, -1, 1, 2, 3]);
  return Guided(
    "Soit " + mathMat("S", [[Fr(a), Fr(b)], [Fr(b), Fr(a)]]) + " et " + m(L`q(x,y)=(x\ y)\,S\,(x\ y)^T`) + ". On cherche le maximum de q sur le cercle unité.",
    [
      gn("Calcule S·(1,1)ᵀ puis la valeur propre associée au vecteur (1,1).", Fr(a + b), ["S(1,1)ᵀ = (a+b, b+a)ᵀ."], `S(1,1)ᵀ = (${a + b}, ${a + b})ᵀ = ${a + b}·(1,1)ᵀ.`),
      gn("Valeur propre associée à (1,−1) ?", Fr(a - b), ["S(1,−1)ᵀ = (a−b, b−a)ᵀ."], `S(1,−1)ᵀ = (${a - b}, ${b - a})ᵀ = ${a - b}·(1,−1)ᵀ.`),
      gq("Les vecteurs propres (1,1) et (1,−1) sont-ils orthogonaux ?", ["Oui : ⟨(1,1),(1,−1)⟩ = 0, comme toujours pour une matrice symétrique", "Non : ils sont colinéaires", "Non : seulement si a = b"], ["Calcule leur produit scalaire."], "1·1 + 1·(−1) = 0 : base orthogonale de vecteurs propres, théorème spectral."),
      gn("Dans la base orthonormée (e₁,e₂), q = λ₁u² + λ₂v² avec u² + v² = 1. Quel est le maximum de q sur le cercle ?", Fr(Math.max(a + b, a - b)), ["Le maximum est la plus grande valeur propre."], `max(${a + b}, ${a - b}) = ${Math.max(a + b, a - b)}, atteint en direction du vecteur propre associé.`),
    ],
    "Sur la sphère unité, une forme quadratique est comprise entre sa plus petite et sa plus grande valeur propre.",
  );
}

function cayleyBug(): RawQuestion {
  return Bug(
    "On prétend démontrer le théorème de Cayley–Hamilton. Une ligne est fausse.",
    [
      "Soit $\\chi_A(\\lambda)=\\det(A-\\lambda I)$ le polynôme caractéristique de $A$.",
      "Le théorème affirme que $\\chi_A(A)=0$ (matrice nulle).",
      "Preuve : $\\chi_A(A)=\\det(A-A\\cdot I)=\\det(0)=0$.",
      "Conséquence en taille 2 : $A^2=(\\operatorname{tr}A)A-(\\det A)I$.",
    ],
    2,
    [
      "Cette « preuve » est invalide : $\\det(A-\\lambda I)$ est un scalaire, alors que $\\chi_A(A)$ est une matrice obtenue en substituant $A$ dans le polynôme développé.",
      "La preuve est correcte car $\\det(0)=0$ pour toute matrice.",
      "Il suffit de remplacer $\\lambda$ par les valeurs propres de $A$.",
    ],
    "Le piège classique : on ne remplace pas λ par A DANS le déterminant. det(A − A) est un nombre (0), alors que χ_A(A) est une matrice ; Cayley–Hamilton demande une vraie démonstration.",
  );
}

function orthoProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve : si " + m("A") + " est symétrique, ses vecteurs propres de valeurs propres distinctes sont orthogonaux.",
    [
      "Soient $Av=\\lambda v$ et $Aw=\\mu w$ avec $\\lambda\\neq\\mu$.",
      "$\\langle Av,w\\rangle=\\lambda\\langle v,w\\rangle$ et $\\langle v,Aw\\rangle=\\mu\\langle v,w\\rangle$.",
      "Comme $A^T=A$, on a $\\langle Av,w\\rangle=\\langle v,Aw\\rangle$.",
      "Donc $(\\lambda-\\mu)\\langle v,w\\rangle=0$, et $\\lambda\\neq\\mu$ donne $\\langle v,w\\rangle=0$.",
    ],
    ["Comme $A^T=-A$, on a $\\langle Av,w\\rangle=-\\langle v,Aw\\rangle$.", "Donc $\\lambda=\\mu$."],
  );
}

export const level: Level = {
  id: "ALG5",
  name: "Symétriques et Cayley–Hamilton",
  fiche: "Synthèse · trigonalisation",
  icon: "🪞",
  color: "#d62828",
  gens: [["cayley", cayleyInverse], ["trigo", trigo], ["spectral", spectral], ["sym-guided", symGuided], ["ch-bug", cayleyBug], ["ortho-proof", orthoProof]],
  piege: "χ_A(A) n'est PAS det(A − A·I) : Cayley–Hamilton se démontre autrement. Et seules les matrices SYMÉTRIQUES ont des espaces propres orthogonaux.",
  rappel: [
    "Cayley–Hamilton : χ_A(A) = 0. En taille 2 : A² − tr(A)A + det(A)I = 0, donc A⁻¹ = (tr(A)I − A)/det(A).",
    "Trigonalisable ⇔ χ_A scindé (toujours vrai sur ℂ).",
    "Théorème spectral : A symétrique réelle ⇒ valeurs propres réelles, A = PDPᵀ avec P orthogonale.",
    "Sur la sphère unité, λ_min ≤ q(x) ≤ λ_max.",
  ],
};
