// Analyse ℝⁿ · niveau 4 : extrema
import { Fr, ftex } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, gq, Guided, Num, Qcm } from "../factories";

const coefTex = (c: number, v: string, first = false): string => {
  if (c === 0) return "";
  const a = Math.abs(c) === 1 ? "" : String(Math.abs(c));
  return (c < 0 ? "-" : first ? "" : "+") + a + v;
};

/** f = x² + a y² + b x + c y : minimum global exact. */
function bowlMin(): RawQuestion {
  const a = ri(1, 4), b = 2 * ri(-3, 3), c = 2 * a * ri(-3, 3);
  const f = L`x^2${coefTex(a, "y^2")}${coefTex(b, "x")}${coefTex(c, "y")}`;
  const x0 = Fr(-b, 2), y0 = Fr(-c, 2 * a);
  const val = Fr(-b * b * a - c * c, 4 * a); // −b²/4 − c²/(4a)
  return Num(
    "Soit " + m(L`f(x,y)=${f}`) + ". Quelle est la valeur minimale de f sur " + m(L`\mathbb{R}^2`) + " ?",
    val,
    `∇f = 0 donne x = ${ftex(x0)}, y = ${ftex(y0)}. La hessienne est diagonale (2, ${2 * a}) définie positive : c'est un minimum global, de valeur ${ftex(val)}.`,
  );
}

/** Nature du point critique (0,0) de a x² + b xy + c y² (b² ≠ 4ac). */
function quadNature(): RawQuestion {
  let a = 0, b = 0, c = 0;
  do {
    a = ri(-3, 3);
    b = ri(-4, 4);
    c = ri(-3, 3);
  } while (4 * a * c - b * b === 0 || a === 0);
  const det = 4 * a * c - b * b;
  const kind = det < 0 ? 2 : a > 0 ? 0 : 1;
  const f = L`${coefTex(a, "x^2", true)}${coefTex(b, "xy")}${coefTex(c, "y^2")}`;
  return Qcm(
    "Nature du point critique " + m(L`(0,0)`) + " de " + m(L`f(x,y)=${f}`) + " ?",
    ["Minimum local", "Maximum local", "Point selle"],
    kind,
    `Hessienne ${m(L`\begin{pmatrix}${2 * a}&${b}\\${b}&${2 * c}\end{pmatrix}`)}, déterminant ${m(L`4ac-b^2=${det}`)}. ` +
      (det < 0 ? "Déterminant < 0 : valeurs propres de signes opposés, c'est un point selle." : a > 0 ? "Déterminant > 0 et fₓₓ > 0 : minimum." : "Déterminant > 0 et fₓₓ < 0 : maximum."),
  );
}

/** Problème guidé : f = x³ + y³ − 3axy. */
function cubicGuided(): RawQuestion {
  const a = pick([1, 2, 3]);
  const tex = L`x^3+y^3-${3 * a}xy`;
  return Guided(
    "Étudie les extrema de " + m(L`f(x,y)=${tex}`) + " sur " + m(L`\mathbb{R}^2`) + ".",
    [
      gq(
        "Quels sont les points critiques ?",
        [`(0,0) et (${a},${a})`, "(0,0) seulement", `(${a},${a}) seulement`, `(0,0), (${a},${a}) et (−${a},−${a})`],
        [`∂ₓf = 3x² − ${3 * a}y et ∂ᵧf = 3y² − ${3 * a}x.`, `On en tire x² = ${a}y et y² = ${a}x : substitue l'une dans l'autre.`],
        `x² = ${a}y et y² = ${a}x donnent x⁴ = ${a * a}y² = ${a * a * a}x, donc x = 0 ou x³ = ${a ** 3} : (0,0) et (${a},${a}).`,
      ),
      gn(
        "Hessienne en (0,0) : calcule det H(0,0) = fₓₓ·fᵧᵧ − fₓᵧ².",
        Fr(-9 * a * a),
        ["fₓₓ = 6x, fᵧᵧ = 6y, fₓᵧ = −" + 3 * a + "."],
        `H(0,0) = [[0, −${3 * a}], [−${3 * a}, 0]] : det = −${9 * a * a}.`,
      ),
      gq(
        "Nature de (0,0) ?",
        ["Point selle", "Minimum local", "Maximum local", "On ne peut pas conclure"],
        ["Le signe du déterminant décide."],
        "Déterminant < 0 : point selle.",
      ),
      gn(
        `Hessienne en (${a},${a}) : calcule det H.`,
        Fr(27 * a * a),
        [`fₓₓ = fᵧᵧ = ${6 * a}, fₓᵧ = −${3 * a}.`],
        `det = ${6 * a}² − ${3 * a}² = ${36 * a * a} − ${9 * a * a} = ${27 * a * a}.`,
      ),
      gq(
        `Nature de (${a},${a}) ?`,
        ["Minimum local", "Point selle", "Maximum local"],
        [`Déterminant > 0 : regarde le signe de fₓₓ = ${6 * a}.`],
        `Déterminant > 0 et fₓₓ = ${6 * a} > 0 : minimum local.`,
      ),
      gn(
        `Valeur de f en (${a},${a}) ?`,
        Fr(-(a ** 3)),
        [`f(${a},${a}) = 2·${a}³ − ${3 * a}·${a}².`],
        `2a³ − 3a³ = −${a ** 3}.`,
      ),
    ],
    "On résout ∇f = 0, puis on lit la hessienne : det < 0 selle ; det > 0 avec fₓₓ > 0 min, fₓₓ < 0 max.",
  );
}

function hessianBug(): RawQuestion {
  return Bug(
    "On étudie " + m(L`f(x,y)=x^4+y^4`) + " en son point critique " + m(L`(0,0)`) + ". Une ligne est fausse.",
    [
      "$\\nabla f=(4x^3,4y^3)$ s'annule en $(0,0)$ : c'est un point critique.",
      "$H(0,0)=\\begin{pmatrix}0&0\\\\0&0\\end{pmatrix}$, de déterminant nul.",
      "Donc $(0,0)$ est un point selle.",
      "On étudiera plutôt directement le signe de $f(x,y)-f(0,0)$.",
    ],
    2,
    [
      "Le test de la hessienne ne conclut pas ; or $f(x,y)\\ge0=f(0,0)$, donc c'est un minimum global.",
      "Donc $(0,0)$ est un maximum local car $H$ est nulle.",
      "Donc $(0,0)$ n'est pas un extremum puisque $\\det H=0$.",
    ],
    "det H = 0 ne dit RIEN (x⁴ et −x⁴ ont la même hessienne nulle). Ici f ≥ 0 = f(0,0) : minimum global strict.",
  );
}

export const level: Level = {
  id: "ANR4",
  name: "Extrema",
  fiche: "Cours ch. 5 · DS3",
  icon: "⛰️",
  color: "#8338ec",
  gens: [["bowl", bowlMin], ["quad", quadNature], ["cubic-guided", cubicGuided], ["hessian-bug", hessianBug]],
  piege: "Hessienne de déterminant nul : le test ne conclut pas. Et un point critique n'est pas toujours un extremum (selle).",
  rappel: [
    "Extremum local en un point intérieur ⇒ ∇f = 0 (condition nécessaire seulement).",
    "En dimension 2 avec r = fₓₓ, s = fₓᵧ, t = fᵧᵧ : rt − s² > 0 et r > 0 ⇒ min ; rt − s² > 0 et r < 0 ⇒ max ; rt − s² < 0 ⇒ selle.",
    "rt − s² = 0 : on étudie le signe de f(x,y) − f(a,b) directement.",
  ],
};
