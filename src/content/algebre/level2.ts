// Algèbre linéaire · niveau 2 : applications de la diagonalisation
import { Fr, fdiv, fsub, fmul, ftex } from "../../core/fraction";
import { det, mpow, trace } from "../../core/matrix";
import { ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Order } from "../factories";
import { diagMat, distinctInts, mathMat } from "./helpers";

function power(): RawQuestion {
  const { A } = diagMat(2, 2, -2, 3);
  const k = ri(2, 5);
  const i = ri(0, 1), j = ri(0, 1);
  const Ak = mpow(A, k);
  return Num(
    mathMat("A", A) + ". Calcule le coefficient de la ligne " + (i + 1) + ", colonne " + (j + 1) + " de " + m(L`A^{${k}}`) + ".",
    Ak[i]![j]!,
    "On diagonalise A = PDP⁻¹, donc Aᵏ = PDᵏP⁻¹ ; il suffit d'élever les valeurs propres à la puissance " + k + ".",
  );
}

/** u_{n+2} = s·u_{n+1} − p·u_n : u_n = α r1ⁿ + β r2ⁿ. */
function recurrence(): RawQuestion {
  const [a, b] = distinctInts(3, -3, 4).filter((x) => x !== 0).slice(0, 2) as [number, number]; // racines non nulles
  const r1 = Math.min(a, b), r2 = Math.max(a, b);
  const u0 = ri(-3, 4), u1 = ri(-3, 4);
  const s = r1 + r2, p = r1 * r2;
  const alpha = fdiv(Fr(u1 - r2 * u0), Fr(r1 - r2));
  const t1 = s === 0 ? "" : s === 1 ? "u_{n+1}" : s === -1 ? "-u_{n+1}" : `${s}u_{n+1}`;
  const c = -p;
  const t2 = c === 0 ? "" : (c > 0 && t1 ? "+" : c < 0 ? "-" : "") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + "u_n";
  const rec = `u_{n+2}=${t1}${t2}`;
  return Num(
    "Soit " + m(rec) + ", " + m(L`u_0=${u0},\ u_1=${u1}`) + ". On écrit " + m(L`u_n=\alpha\,(${r1})^n+\beta\,(${r2})^n`) + ". Calcule " + m(L`\alpha`) + ".",
    alpha,
    `L'équation caractéristique r² − (${s})r + (${p}) = 0 a pour racines ${r1} et ${r2}. Les conditions α+β=${u0} et ${r1}α+${r2}β=${u1} donnent α = ${ftex(alpha)}.`.replace("+-", "-"),
  );
}

/** X' = AX, X(0) = (x0, y0) : coefficient de e^{d1 t} dans x(t). */
function system(): RawQuestion {
  const { A, P, D } = diagMat(2, 2, -2, 3);
  const order = D[0]! < D[1]! ? [0, 1] : [1, 0];
  const [i1, i2] = order as [number, number];
  const x0 = ri(-3, 3), y0 = ri(-3, 3);
  // coordonnées de X0 dans la base propre : c = P⁻¹ X0 (P est unimodulaire : inverse entière)
  const dP = fsub(fmul(P[0]![0]!, P[1]![1]!), fmul(P[0]![1]!, P[1]![0]!));
  const c1 = fdiv(fsub(fmul(P[1]![1]!, Fr(x0)), fmul(P[0]![1]!, Fr(y0))), dP);
  const c2 = fdiv(fsub(fmul(P[0]![0]!, Fr(y0)), fmul(P[1]![0]!, Fr(x0))), dP);
  const c = [c1, c2];
  const a = fmul(P[0]![i1]!, c[i1]!);
  void i2;
  return Num(
    "Soit " + m(L`X'(t)=AX(t)`) + " avec " + mathMat("A", A) + " et " + m(L`X(0)=\begin{pmatrix}${x0}\\${y0}\end{pmatrix}`) +
      ". Les valeurs propres de A sont " + m(`${D[i1]}`) + " et " + m(`${D[i2]}`) + ". On écrit " + m(L`x(t)=a\,e^{${D[i1]}t}+b\,e^{${D[i2]}t}`) + ". Calcule " + m("a") + ".",
    a,
    "X(t) = Σ c_i e^{λ_i t} v_i où les c_i sont les coordonnées de X(0) dans la base de vecteurs propres : a = c₁·(1re coordonnée de v₁).",
  );
}

function diagGuided(): RawQuestion {
  const { A, D } = diagMat(2, 2, -2, 4);
  const [lo, hi] = [Math.min(D[0]!, D[1]!), Math.max(D[0]!, D[1]!)];
  return Guided(
    "Pour " + mathMat("A", A) + ", on veut calculer " + m(L`\operatorname{tr}(A^3)`) + " sans calculer " + m("A^3") + ".",
    [
      gn("Calcule tr(A).", trace(A), ["Somme des coefficients diagonaux."], `tr(A) = ${ftex(trace(A))}.`),
      gn("Calcule det(A).", det(A), ["ad − bc."], `det(A) = ${ftex(det(A))}.`),
      gn(
        "χ_A(λ) = λ² − tr(A)λ + det(A). Quelle est sa plus petite racine ?",
        Fr(lo),
        ["Cherche deux entiers de somme tr(A) et de produit det(A)."],
        `Les racines sont ${lo} et ${hi} (somme ${lo + hi}, produit ${lo * hi}).`,
      ),
      gq(
        "A est-elle diagonalisable ?",
        ["Oui : deux valeurs propres distinctes", "Non : il faudrait une valeur propre double", "On ne peut pas savoir sans calculer les vecteurs propres"],
        ["Combien de valeurs propres distinctes pour une matrice 2×2 ?"],
        "n valeurs propres distinctes ⇒ diagonalisable.",
      ),
      gn(
        "Si A = PDP⁻¹, alors tr(A³) = tr(D³) (trace invariante par similitude). Calcule-la.",
        Fr(lo ** 3 + hi ** 3),
        ["D³ = diag(λ₁³, λ₂³)."],
        `${lo}³ + ${hi}³ = ${lo ** 3 + hi ** 3}.`,
      ),
    ],
    "Diagonaliser (ou seulement connaître le spectre) permet de calculer tr(Aᵏ) = Σ λᵢᵏ sans multiplier de matrices.",
  );
}

function powerBug(): RawQuestion {
  return Bug(
    "On veut " + m("A^n") + " pour " + m(L`A=PDP^{-1}`) + ". Une ligne est fausse.",
    [
      "$A^2=(PDP^{-1})(PDP^{-1})$.",
      "$A^2=PD(P^{-1}P)DP^{-1}=PD^2P^{-1}$.",
      "Par récurrence, $A^n=P\\,D^n\\,P^{-1}$ avec $D^n=\\operatorname{diag}(\\lambda_i^n)$.",
      "Donc $A^n=P^nD^nP^{-n}$.",
    ],
    3,
    [
      "Donc $A^n=PD^nP^{-1}$ : le $P$ et le $P^{-1}$ ne sont pas élevés à la puissance $n$.",
      "Donc $A^n=P^{-1}D^nP$.",
      "Donc $A^n=D^n$.",
    ],
    "Les P et P⁻¹ intermédiaires se simplifient (P⁻¹P = I) : il n'en reste qu'un de chaque côté.",
  );
}

function diagProof(): RawQuestion {
  return Order(
    "Reconstitue la résolution de " + m(L`X'=AX`) + " quand " + m(L`A=PDP^{-1}`) + ".",
    [
      "Posons $Y(t)=P^{-1}X(t)$.",
      "Alors $Y'=P^{-1}X'=P^{-1}AX=DY$ : le système est découplé.",
      "Chaque ligne $y_i'=\\lambda_iy_i$ donne $y_i(t)=c_ie^{\\lambda_it}$.",
      "On revient à $X(t)=PY(t)$, combinaison des vecteurs propres pondérés par $e^{\\lambda_it}$.",
    ],
    ["Posons $Y(t)=PX(t)$.", "Chaque ligne donne $y_i(t)=c_i\\lambda_it$."],
  );
}

export const level: Level = {
  id: "ALG2",
  name: "Diagonalisation en action",
  fiche: "TD2 · Applications",
  icon: "🚀",
  color: "#ff7b00",
  gens: [["power", power], ["recurrence", recurrence], ["system", system], ["diag-guided", diagGuided], ["power-bug", powerBug], ["diag-proof", diagProof]],
  piege: "Aⁿ = P Dⁿ P⁻¹ : les matrices de passage ne sont PAS élevées à la puissance n. Et dans X' = AX, la solution est une combinaison de e^{λt}·(vecteur propre).",
  rappel: [
    "A = PDP⁻¹ ⇒ Aⁿ = PDⁿP⁻¹, avec Dⁿ = diag(λᵢⁿ). P = vecteurs propres en colonnes.",
    "Suite uₙ₊₂ = s uₙ₊₁ − p uₙ : uₙ = α r₁ⁿ + β r₂ⁿ où r₁, r₂ racines de r² − sr + p = 0.",
    "X' = AX : X(t) = P·diag(e^{λᵢt})·P⁻¹X(0).",
    "tr(Aᵏ) = Σ λᵢᵏ (trace invariante par similitude).",
  ],
};
