// Algèbre linéaire · niveau 1 : éléments propres
import { Fr, ftex } from "../../core/fraction";
import { det, mmul, mtex, trace } from "../../core/matrix";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Num, Order, poolQcm, Qcm } from "../factories";
import { diagMat, mathMat } from "./helpers";

function trDet(): RawQuestion {
  const { A, D } = diagMat(2);
  const askTr = ri(0, 1) === 0;
  const ans = askTr ? D[0]! + D[1]! : D[0]! * D[1]!;
  return Num(
    mathMat("A", A) + ". " + (askTr ? "Quelle est la somme" : "Quel est le produit") + " des valeurs propres de A (comptées avec multiplicité) ?",
    Fr(ans),
    askTr ? `Somme des valeurs propres = trace = ${ftex(trace(A))}.` : `Produit des valeurs propres = déterminant = ${ftex(det(A))}.`,
  );
}

function biggest(): RawQuestion {
  const { A, D } = diagMat(2);
  const big = pick([true, false]);
  const [a, b] = D as [number, number];
  return Num(
    mathMat("A", A) + ". Quelle est la " + (big ? "plus grande" : "plus petite") + " valeur propre de A ?",
    Fr(big ? Math.max(a, b) : Math.min(a, b)),
    `${m(L`\chi_A(\lambda)=\lambda^2-${ftex(trace(A))}\lambda+${ftex(det(A))}`)} (au signe près pour les termes négatifs) ; ses racines sont ${a} et ${b}.`.replace("+-", "-"),
  );
}

function thirdEigenvalue(): RawQuestion {
  const { A, D } = diagMat(3);
  const [a, b, c] = D as [number, number, number];
  return Num(
    mathMat("A", A) + " admet " + m(String(a)) + " et " + m(String(b)) + " comme valeurs propres. Quelle est la troisième ?",
    Fr(c),
    `La trace vaut la somme des valeurs propres : ${ftex(trace(A))} = ${a} + ${b} + λ, donc λ = ${c}.`,
  );
}

function isEigenvector(): RawQuestion {
  const { A, P } = diagMat(2);
  const j = ri(0, 1);
  const good = ri(0, 1) === 0;
  const v = [P[0]![j]!, P[1]![j]!];
  let delta = pick([-1, 1]);
  if (v[0]!.n === 0 && v[1]!.n + delta === 0) delta = -delta; // évite w = 0
  const w = good ? v : [v[0]!, Fr(v[1]!.n + delta, v[1]!.d)];
  const Aw = mmul(A, [[w[0]!], [w[1]!]]);
  const colinear = Aw[0]![0]!.n * w[1]!.n * Aw[1]![0]!.d * w[0]!.d === Aw[1]![0]!.n * w[0]!.n * Aw[0]![0]!.d * w[1]!.d;
  const lamNum = w[0]!.n !== 0 ? Fr(Aw[0]![0]!.n * w[0]!.d, Aw[0]![0]!.d * w[0]!.n) : Fr(Aw[1]![0]!.n * w[1]!.d, Aw[1]![0]!.d * w[1]!.n);
  return Qcm(
    mathMat("A", A) + " et " + m(L`v=${mtex([[w[0]!], [w[1]!]])}`) + ". Le vecteur v est-il un vecteur propre de A ?",
    [`Oui, de valeur propre ${ftex(lamNum)}`, "Non : Av n'est pas colinéaire à v", "Non : v est nul"],
    colinear ? 0 : 1,
    m(L`Av=${mtex(Aw)}`) + (colinear ? ` = ${ftex(lamNum)}·v : colinéaire à v, donc v est propre.` : " n'est pas colinéaire à v (les deux coordonnées ne sont pas dans le même rapport)."),
  );
}

const criteria = poolQcm([
  { q: "A ∈ Mₙ(ℝ) admet n valeurs propres distinctes. Alors…", r: "A est diagonalisable", w: ["A est inversible", "A est symétrique", "A est nilpotente"], e: "n valeurs propres distinctes ⇒ n sous-espaces propres de dimension 1 en somme directe : base de vecteurs propres." },
  { q: "Pour qu'une matrice soit diagonalisable sur ℝ, il faut que χ_A soit…", r: "scindé sur ℝ, et dim E_λ = multiplicité de λ pour chaque λ", w: ["de degré pair", "à racines simples uniquement", "à coefficients positifs"], e: "Scindé ne suffit pas : il faut aussi dim E_λ = m_λ." },
  { q: "0 est valeur propre de A si et seulement si…", r: "det(A) = 0 (A non inversible)", w: ["tr(A) = 0", "A est symétrique", "A est diagonale"], e: "Av = 0 avec v ≠ 0 ⇔ ker A ≠ {0} ⇔ A non inversible." },
  { q: "Un vecteur propre est toujours…", r: "non nul", w: ["de norme 1", "unique à un signe près", "dans l'image de A"], e: "Par définition v ≠ 0 ; sinon tout λ serait valeur propre." },
  { q: "Si λ est valeur propre de A, alors λ² est valeur propre de…", r: "A²", w: ["Aᵀ seulement", "A + I", "A⁻¹ toujours"], e: "A²v = A(λv) = λ²v." },
  { q: "A et Aᵀ ont…", r: "le même polynôme caractéristique", w: ["les mêmes vecteurs propres", "les mêmes sous-espaces propres", "des valeurs propres opposées"], e: "det(A − λI) = det((A − λI)ᵀ) = det(Aᵀ − λI), mais les vecteurs propres changent." },
  { q: "Si A est triangulaire, ses valeurs propres sont…", r: "ses coefficients diagonaux", w: ["ses coefficients hors-diagonale", "toujours nulles", "les racines de sa trace"], e: "χ_A = ∏(a_ii − λ) pour une matrice triangulaire." },
]);

function notDiagBug(): RawQuestion {
  return Bug(
    "Soit " + m(L`A=\begin{pmatrix}1&1&0\\0&1&0\\0&0&2\end{pmatrix}`) + ". Un élève prétend que A est diagonalisable. Une ligne est fausse.",
    [
      "$\\chi_A(\\lambda)=(1-\\lambda)^2(2-\\lambda)$ : scindé sur $\\mathbb{R}$, $m_1=2$, $m_2=1$.",
      "$A-I=\\begin{pmatrix}0&1&0\\\\0&0&0\\\\0&0&1\\end{pmatrix}$ est de rang 2, donc $\\dim E_1=1$.",
      "Comme $\\chi_A$ est scindé, $A$ est diagonalisable.",
      "On remarque que $\\dim E_2=1=m_2$.",
    ],
    2,
    [
      "Or $\\dim E_1=1<2=m_1$ : $A$ n'est pas diagonalisable (seulement trigonalisable).",
      "Or $\\dim E_1=1$ et $\\dim E_2=1$, la somme vaut 2, ce qui suffit.",
      "Comme $\\operatorname{tr}A=4\\ne0$, $A$ est diagonalisable.",
    ],
    "Scindé ne suffit pas : il faut dim E_λ = m_λ pour CHAQUE valeur propre. Ici dim E₁ = 1 < 2, la somme des dimensions (2) est inférieure à 3.",
  );
}

function independenceProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve : deux vecteurs propres de valeurs propres distinctes " + m(L`\lambda_1\ne\lambda_2`) + " sont linéairement indépendants.",
    [
      "Soit $av_1+bv_2=0$ avec $Av_1=\\lambda_1v_1$, $Av_2=\\lambda_2v_2$.",
      "Appliquons $A$ : $a\\lambda_1v_1+b\\lambda_2v_2=0$.",
      "Multiplions la première relation par $\\lambda_1$ et soustrayons : $b(\\lambda_2-\\lambda_1)v_2=0$.",
      "Comme $\\lambda_2\\ne\\lambda_1$ et $v_2\\ne0$, on a $b=0$, puis $a=0$ : la famille est libre.",
    ],
    ["Comme $v_1\\ne v_2$, la famille $(v_1,v_2)$ est libre.", "Appliquons $A^{-1}$ aux deux membres."],
  );
}

export const level: Level = {
  id: "ALG1",
  name: "Éléments propres",
  fiche: "CM Réduction · TD1",
  icon: "🎛️",
  color: "#3a86ff",
  gens: [["trdet", trDet], ["extreme", biggest], ["third", thirdEigenvalue], ["iseig", isEigenvector], ["criteria", criteria], ["notdiag-bug", notDiagBug], ["indep-proof", independenceProof]],
  piege: "Un polynôme caractéristique scindé ne suffit PAS : il faut dim E_λ = multiplicité pour chaque λ. Et un vecteur propre n'est jamais nul.",
  rappel: [
    "λ valeur propre ⇔ ker(A − λI) ≠ {0} ⇔ det(A − λI) = 0. χ_A(λ) = det(A − λI).",
    "tr A = somme des valeurs propres, det A = produit (avec multiplicités).",
    "E_λ = ker(A − λI) ; 1 ≤ dim E_λ ≤ m_λ.",
    "A diagonalisable ⇔ χ_A scindé et dim E_λ = m_λ pour tout λ (ou : n valeurs propres distinctes ⇒ oui).",
  ],
};
