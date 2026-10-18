// Analyse ℝⁿ · niveau 1 : normes et topologie
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Num, Order, Qcm } from "../factories";

/** p·x + q·y en LaTeX (coefficients 0, ±1 traités). */
export const lc = (p: number, q: number): string => {
  const t = (c: number, v: string): string => (c === 0 ? "" : c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`);
  const px = t(p, "x"), qy = t(q, "y");
  if (!px) return qy || "0";
  if (!qy) return px;
  return px + (q > 0 ? "+" : "") + qy;
};

/** N(x,y) = |ax+by| + |cx+dy| : norme ssi le déterminant est non nul. */
function isNorm(): RawQuestion {
  const degenerate = ri(0, 2) === 0;
  let a = ri(1, 3), b = ri(-3, 3), c: number, d: number;
  if (degenerate) {
    const k = pick([1, 2, -1, -2]);
    c = k * a;
    d = k * b;
  } else {
    do {
      a = ri(1, 3);
      b = ri(-3, 3);
      c = ri(-3, 3);
      d = ri(-3, 3);
    } while (a * d - b * c === 0);
  }
  const det = a * d - b * c;
  return Qcm(
    "Soit " + m(L`N(x,y)=|${lc(a, b)}|+|${lc(c, d)}|`) + " sur " + m(L`\mathbb{R}^2`) + ". Est-ce une norme ?",
    ["Oui : la séparation tient", "Non : elle s'annule sur un vecteur non nul", "Non : l'inégalité triangulaire échoue"],
    det !== 0 ? 0 : 1,
    det !== 0
      ? `Le système des deux formes nulles n'a que la solution nulle car ${m(L`ad-bc=${det}\neq0`)} ; l'homogénéité et la triangulaire viennent des valeurs absolues.`
      : `Ici ${m(L`ad-bc=0`)} : les deux formes sont proportionnelles, donc N s'annule sur toute une droite. La séparation (${m(L`N(v)=0\Rightarrow v=0`)}) échoue : seulement une semi-norme.`,
  );
}

/** Aire de la boule unité de |x|/a+|y|/b (losange) ou max(|x|/a,|y|/b) (rectangle). */
function ballArea(): RawQuestion {
  const a = ri(1, 5), b = ri(1, 5);
  const diamond = ri(0, 1) === 0;
  return Num(
    "Aire de la boule unité fermée de " +
      m(diamond ? L`N(x,y)=\frac{|x|}{${a}}+\frac{|y|}{${b}}` : L`N(x,y)=\max\left(\frac{|x|}{${a}},\frac{|y|}{${b}}\right)`) + " ?",
    Fr(diamond ? 2 * a * b : 4 * a * b),
    diamond
      ? `Boule = losange de sommets (±${a},0), (0,±${b}) : aire = ½·${2 * a}·${2 * b} = ${2 * a * b}.`
      : `Boule = rectangle [−${a},${a}]×[−${b},${b}] : aire = ${2 * a}·${2 * b} = ${4 * a * b}.`,
  );
}

const topo = (): RawQuestion => {
  const a = ri(-4, 2), b = a + ri(2, 5);
  const T = [
    { q: `Intérieur de ${m(L`]${a},${b}]`)} ?`, r: m(L`]${a},${b}[`), w: [m(L`[${a},${b}]`), m(L`]${a},${b}]`), m(L`\emptyset`)], e: "L'intérieur retire les bords qui n'ont aucune boule incluse : la borne b est exclue." },
    { q: `Adhérence de ${m(L`]${a},${b}]`)} ?`, r: m(L`[${a},${b}]`), w: [m(L`]${a},${b}[`), m(L`]${a},${b}]`), m(L`\mathbb{R}`)], e: "L'adhérence ajoute les points limites : la borne a est atteinte comme limite." },
    { q: `L'ensemble ${m(L`]${a},${b}]`)} est…`, r: "ni ouvert ni fermé", w: ["ouvert", "fermé", "ouvert et fermé"], e: `Pas ouvert (aucune boule autour de ${b} dans l'ensemble), pas fermé (${a} est limite sans y être).` },
    { q: `Adhérence de ${m(L`\mathbb{Q}`)} dans ${m(L`\mathbb{R}`)} ?`, r: m(L`\mathbb{R}`), w: [m(L`\mathbb{Q}`), m(L`\emptyset`), m(L`\mathbb{R}\setminus\mathbb{Q}`)], e: "Tout intervalle contient un rationnel : ℚ est dense." },
    { q: `Intérieur de ${m(L`\mathbb{Q}`)} dans ${m(L`\mathbb{R}`)} ?`, r: m(L`\emptyset`), w: [m(L`\mathbb{Q}`), m(L`\mathbb{R}`), m(L`\mathbb{R}\setminus\mathbb{Q}`)], e: "Tout intervalle contient aussi un irrationnel : aucune boule n'est incluse dans ℚ." },
    { q: `Une intersection INFINIE d'ouverts est-elle toujours ouverte ?`, r: `Non : ${m(L`\bigcap_n ]-\frac1n,\frac1n[=\{0\}`)}`, w: ["Oui, toujours", "Oui si les ouverts sont emboîtés", "Non, elle est toujours fermée"], e: "Seules les intersections FINIES d'ouverts sont ouvertes ; ici on obtient un singleton, fermé et non ouvert." },
    { q: `Un singleton ${m(L`\{a\}`)} dans ${m(L`\mathbb{R}^n`)} est…`, r: "fermé, pas ouvert", w: ["ouvert, pas fermé", "ouvert et fermé", "ni ouvert ni fermé"], e: "Son complémentaire est ouvert (on s'éloigne de a), mais aucune boule autour de a n'est incluse dans {a}." },
  ];
  const it = pick(T);
  return Qcm(it.q, [it.r, ...it.w], 0, it.e, true);
};

function equivBug(): RawQuestion {
  const d = pick([2, 3]);
  const s = d === 2 ? L`|x_1|+|x_2|` : L`|x_1|+|x_2|+|x_3|`;
  return Bug(
    "Ce raisonnement veut prouver que " + m(L`\|\cdot\|_\infty`) + " et " + m(L`\|\cdot\|_1`) + " sont équivalentes sur " + m(L`\mathbb{R}^${d}`) + ". Une ligne est fausse.",
    [
      `Chaque $|x_i|$ vérifie $|x_i|\\le\\|x\\|_\\infty$.`,
      `Donc $\\|x\\|_1=${s}\\le ${d}\\|x\\|_\\infty$.`,
      `Et $\\|x\\|_\\infty=\\max_i|x_i|\\ge ${s}$.`,
      `Ainsi $\\|x\\|_\\infty\\le\\|x\\|_1\\le ${d}\\|x\\|_\\infty$ : normes équivalentes.`,
    ],
    2,
    [
      `Et $\\|x\\|_\\infty=\\max_i|x_i|\\le ${s}$ (le max est l'un des termes).`,
      `Et $\\|x\\|_\\infty=\\frac1${d}(${s})$ (le max est la moyenne).`,
      `Et $\\|x\\|_\\infty^2=\\sum x_i^2$.`,
    ],
    "Le maximum est UN des termes positifs de la somme : il est donc ≤ la somme, jamais ≥. D'où ‖x‖∞ ≤ ‖x‖₁ ≤ d‖x‖∞.",
  );
}

function openProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve que " + m(L`]0,1[`) + " est ouvert dans " + m(L`\mathbb{R}`) + ".",
    [
      "Soit $x\\in]0,1[$.",
      "Posons $r=\\min(x,\\,1-x)>0$.",
      "Alors $x-r\\ge0$ et $x+r\\le1$, donc $]x-r,x+r[\\subset]0,1[$.",
      "Tout point de $]0,1[$ est centre d'une boule incluse dans $]0,1[$ : l'ensemble est ouvert.",
    ],
    ["Posons $r=\\max(x,\\,1-x)$.", "Comme 0 et 1 sont exclus, $]0,1[$ est fermé."],
  );
}

export const level: Level = {
  id: "ANR1",
  name: "Normes et topologie",
  fiche: "Cours ch. 1–2",
  icon: "📐",
  color: "#2a9d8f",
  gens: [
    ["isNorm", isNorm], ["ball", ballArea], ["topo", topo], ["equiv-bug", equivBug], ["open-proof", openProof],
  ],
  piege: "Une norme doit être DÉFINIE (N(v)=0 ⇒ v=0) ; et « pas ouvert » ne veut pas dire « fermé » : ]a,b] n'est ni l'un ni l'autre.",
  rappel: [
    "Norme : N(x)=0 ⇔ x=0, N(λx)=|λ|N(x), N(x+y) ≤ N(x)+N(y).",
    "En dimension finie, toutes les normes sont équivalentes (mêmes ouverts, mêmes limites).",
    "Ouvert : chaque point est centre d'une boule incluse. Fermé : complémentaire d'un ouvert.",
    "Intérieur ⊂ A ⊂ adhérence. Union quelconque d'ouverts = ouvert ; intersection FINIE d'ouverts = ouvert.",
  ],
};
