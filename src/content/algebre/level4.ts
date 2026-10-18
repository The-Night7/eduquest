// Algèbre linéaire · niveau 4 : formes bilinéaires et quadratiques
import { Fr } from "../../core/fraction";
import { dot, mmul, mtex, transpose, randUnimodular, type Mat } from "../../core/matrix";
import { pick, ri, shuffle } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, poolVF, Qcm } from "../factories";

const VARS = ["x", "y", "z"];

/** q(x) = xᵀSx développé, ex. « 2x^2-3xy+y^2 ». */
export function quadTex(S: Mat): string {
  const n = S.length;
  const parts: string[] = [];
  const add = (c: number, mono: string): void => {
    if (c === 0) return;
    const a = Math.abs(c) === 1 ? "" : String(Math.abs(c));
    parts.push((c < 0 ? "-" : parts.length ? "+" : "") + a + mono);
  };
  for (let i = 0; i < n; i++) add(S[i]![i]!.n, `${VARS[i]}^2`);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) add(2 * S[i]![j]!.n, `${VARS[i]}${VARS[j]}`);
  return parts.join("") || "0";
}

/** S = Pᵀ D P : congruente à diag(D) donc de signature donnée par les signes de D. */
export function congruent(D: number[]): Mat {
  const P = randUnimodular(D.length, 2);
  const Dm: Mat = D.map((d, i) => D.map((_, j) => Fr(i === j ? d : 0)));
  return mmul(mmul(transpose(P), Dm), P);
}

function qMatrixEntry(): RawQuestion {
  const n = 3;
  const S: Mat = Array.from({ length: n }, () => Array.from({ length: n }, () => Fr(0)));
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    const c = Fr(ri(-3, 3));
    S[i]![j] = c;
    S[j]![i] = c;
  }
  const i = pick([0, 1]), j = ri(i + 1, 2);
  return Num(
    "Soit " + m(L`q(x,y,z)=${quadTex(S)}`) + ". Quel est le coefficient " + m(`s_{${i + 1}${j + 1}}`) + " de sa matrice symétrique ?",
    S[i]![j]!,
    `Le terme croisé ${VARS[i]}${VARS[j]} apparaît sous la forme 2·s_${i + 1}${j + 1}·${VARS[i]}${VARS[j]} : il faut donc DIVISER son coefficient (${2 * S[i]![j]!.n}) par 2.`,
  );
}

function qEval(): RawQuestion {
  const S: Mat = [[Fr(ri(-2, 3)), Fr(ri(-2, 2))], [Fr(0), Fr(ri(-2, 3))]];
  S[1]![0] = S[0]![1]!;
  const v = [Fr(ri(-3, 3)), Fr(ri(-3, 3))];
  const Sv = [dot(S[0]!, v), dot(S[1]!, v)];
  return Num(
    "Soit " + m(L`B=${mtex(S)}`) + " et " + m(L`q(X)=X^TBX`) + ". Calcule " + m(L`q\begin{pmatrix}${v[0]!.n}\\${v[1]!.n}\end{pmatrix}`) + ".",
    dot(v, Sv),
    `q(X) = ${m(L`${quadTex(S).replace(/z/g, "y")}`)} évalué en (${v[0]!.n}, ${v[1]!.n}).`,
  );
}

const allSig: [number, number][] = [[3, 0], [2, 1], [1, 2], [0, 3], [2, 0], [1, 1], [0, 2], [1, 0], [0, 1]];
function signature(): RawQuestion {
  const D = shuffle([pick([1, 2, 3]) * pick([1, -1]), pick([1, 2]) * pick([1, -1]), pick([0, 1, -1, 2])]);
  const S = congruent(D);
  const p = D.filter((d) => d > 0).length, q = D.filter((d) => d < 0).length;
  const others = shuffle(allSig.filter(([a, b]) => !(a === p && b === q))).slice(0, 3);
  const opts = [[p, q], ...others] as [number, number][];
  return Qcm(
    "Quelle est la signature (nombre de carrés positifs, négatifs) de " + m(L`q(x,y,z)=${quadTex(S)}`) + " ?",
    opts.map(([a, b]) => `(${a}, ${b})`),
    0,
    `q est congruente à une forme diagonale de coefficients ${D.join(", ")} : par Sylvester, signature (${p}, ${q}) et rang ${p + q}. On l'obtient par la réduction de Gauss.`,
    true,
  );
}

function definite2(): RawQuestion {
  const a = ri(-3, 3), b = ri(-3, 3), c = ri(-3, 3);
  const dt = a * c - b * b;
  const kind = dt > 0 ? (a > 0 ? 0 : 1) : dt < 0 ? 2 : 3;
  const S: Mat = [[Fr(a), Fr(b)], [Fr(b), Fr(c)]];
  return Qcm(
    "La forme " + m(L`q(x,y)=${quadTex(S)}`) + " est…",
    ["définie positive", "définie négative", "indéfinie (ni positive ni négative)", "dégénérée (déterminant nul)"],
    kind,
    `Matrice ${m(L`${mtex(S)}`)} : ${m(L`\det=${a}\cdot${c}-${b}^2=${dt}`)}` +
      (dt > 0 ? `, et s₁₁ = ${a} ${a > 0 ? "> 0 : définie positive" : "< 0 : définie négative"}.` : dt < 0 ? " < 0 : une valeur propre de chaque signe, indéfinie." : " : la matrice est singulière, la forme est dégénérée."),
  );
}

const bilin = poolVF([
  { q: "Si φ est bilinéaire, alors φ(2x, y) = 2φ(x, y).", t: true, e: "Linéarité en la première variable." },
  { q: "Si φ est bilinéaire, alors φ(x+y, x+y) = φ(x,x) + φ(y,y).", t: false, e: "Il manque les termes croisés : φ(x,y) + φ(y,x)." },
  { q: "φ(x,y) = x₁y₂ − x₂y₁ est symétrique.", t: false, e: "φ(y,x) = −φ(x,y) : elle est antisymétrique." },
  { q: "φ(x,y) = x₁ + y₁ est bilinéaire.", t: false, e: "Elle n'est linéaire en aucune variable (φ(0,0) = 0 mais φ(2x,y) ≠ 2φ(x,y))." },
  { q: "La matrice d'une forme bilinéaire symétrique dans une base est symétrique.", t: true, e: "A = Aᵀ ⇔ φ symétrique." },
  { q: "La matrice d'une forme bilinéaire ne dépend pas de la base choisie.", t: false, e: "Elle dépend de la base : elle change en PᵀAP." },
  { q: "Si q est définie positive, alors q(x) > 0 pour tout x ≠ 0.", t: true, e: "C'est la définition." },
  { q: "Une forme quadratique positive est automatiquement définie.", t: false, e: "x² sur ℝ² est positive mais s'annule sur (0,1) : elle n'est pas définie." },
]);

function posBug(): RawQuestion {
  const k = pick([2, 3]);
  return Bug(
    "Un élève affirme que " + m(L`q(x,y)=x^2+${2 * k}xy+y^2`) + " est définie positive. Une ligne est fausse.",
    [
      "$q(x,y)=(x+" + k + "y)^2+(1-" + k * k + ")y^2$ par complétion du carré.",
      "Les coefficients de $x^2$ et de $y^2$ sont tous deux positifs, donc $q$ est définie positive.",
      "Vérifions : $q(1,-1)=1-" + 2 * k + "+1=" + (2 - 2 * k) + "$.",
    ],
    1,
    [
      "Le coefficient de $y^2$ dans la forme réduite est $1-" + k * k + "<0$ : $q$ prend des valeurs négatives, elle est de signature $(1,1)$.",
      "Le terme croisé $xy$ est positif, donc $q$ est positive.",
      "Les coefficients diagonaux sont positifs, il suffit que le déterminant soit non nul.",
    ],
    "Les coefficients diagonaux ne décident pas : le terme croisé compte. Ici det = 1 − " + k * k + " < 0, d'où q(1,−1) < 0.",
  );
}

function gaussGuided(): RawQuestion {
  const k = ri(1, 3), mm = ri(-2, 12);
  const c = mm - k * k;
  const tex = L`x^2+${2 * k}xy${mm >= 0 ? "+" : ""}${mm}y^2`;
  return Guided(
    "Réduis la forme " + m(L`q(x,y)=${tex}`) + " par la méthode de Gauss.",
    [
      gn("Complète le carré : q = (x + ky)² + c·y². Quelle est la valeur de c ?", Fr(c), [`(x + ${k}y)² = x² + ${2 * k}xy + ${k * k}y².`], `q − (x+${k}y)² = (${mm} − ${k * k})y², donc c = ${c}.`),
      gq(
        "Quelle est la signature de q ?",
        c > 0 ? ["(2, 0)", "(1, 1)", "(1, 0)", "(0, 2)"] : c < 0 ? ["(1, 1)", "(2, 0)", "(0, 2)", "(1, 0)"] : ["(1, 0)", "(2, 0)", "(1, 1)", "(0, 1)"],
        ["Les signes des coefficients des carrés (x+ky)² et c·y²."],
        c > 0 ? "Deux carrés positifs : (2,0), définie positive." : c < 0 ? "Un carré positif, un négatif : (1,1)." : "Un seul carré (positif), l'autre est nul : (1,0), forme dégénérée.",
      ),
      gn("Pour quel vecteur annule-t-on le premier carré ? Calcule q(−k, 1).", Fr(c), ["x + ky = 0 pour (x,y) = (−k, 1)."], `q(−${k},1) = 0 + c·1 = ${c}.`),
      gq(
        "q est-elle un produit scalaire sur ℝ² ?",
        c > 0 ? ["Oui", "Non : pas symétrique", "Non : pas bilinéaire"] : ["Non : pas définie positive", "Oui", "Non : pas symétrique"],
        ["Il faut q(v) > 0 pour tout v ≠ 0."],
        c > 0 ? "Définie positive : la forme polaire est un produit scalaire." : "Il existe v ≠ 0 avec q(v) ≤ 0 : pas définie positive.",
      ),
    ],
    "Gauss : on complète les carrés ; la signature se lit sur les signes des coefficients (loi d'inertie de Sylvester).",
  );
}

export const level: Level = {
  id: "ALG4",
  name: "Formes bilinéaires",
  fiche: "CM Forme bilinéaire · TD3",
  icon: "🔷",
  color: "#8338ec",
  gens: [["qmatrix", qMatrixEntry], ["qeval", qEval], ["signature", signature], ["definite2", definite2], ["bilin", bilin], ["pos-bug", posBug], ["gauss-guided", gaussGuided]],
  piege: "Le coefficient croisé d'une forme quadratique vaut 2×sᵢⱼ ; et des coefficients diagonaux positifs ne suffisent pas pour être définie positive.",
  rappel: [
    "Forme bilinéaire φ(x,y) = XᵀAY ; symétrique ⇔ A = Aᵀ ; q(x) = φ(x,x) = XᵀAX.",
    "Changement de base : A' = PᵀAP (congruence).",
    "Gauss : on complète les carrés. Sylvester : (p,q) = nombre de carrés positifs / négatifs, indépendant de la réduction.",
    "Définie positive en dim 2 : s₁₁ > 0 et det > 0.",
  ],
};
