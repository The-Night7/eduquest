// Algèbre linéaire · niveau 3 : espaces préhilbertiens
import { Fr, fadd, fdiv, fmul, fsub, ftex, type Fraction } from "../../core/fraction";
import { dot, vtex } from "../../core/matrix";
import { ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Num, Order, Qcm, poolQcm } from "../factories";

const vec = (n: number, lo = -3, hi = 4): Fraction[] => Array.from({ length: n }, () => Fr(ri(lo, hi)));
const nonzero = (n: number): Fraction[] => {
  let v = vec(n);
  while (v.every((x) => x.n === 0)) v = vec(n);
  return v;
};

function orthoParam(): RawQuestion {
  const a = vec(3), b = [Fr(ri(1, 3)), Fr(ri(-2, 3)), Fr(ri(1, 3))];
  // ⟨(a0,a1,t),(b0,b1,b2)⟩ = 0 → t = −(a0b0 + a1b1)/b2
  const s = fadd(fmul(a[0]!, b[0]!), fmul(a[1]!, b[1]!));
  const t = fdiv(Fr(-s.n, s.d), b[2]!);
  return Num(
    "Dans " + m(L`\mathbb{R}^3`) + " muni du produit scalaire usuel, pour quelle valeur de " + m("t") + " les vecteurs " +
      m(L`u=\begin{pmatrix}${a[0]!.n}\\${a[1]!.n}\\t\end{pmatrix}`) + " et " + m(L`v=${vtex(b)}`) + " sont-ils orthogonaux ?",
    t,
    `⟨u,v⟩ = ${ftex(s)} + ${b[2]!.n}t = 0, donc t = ${ftex(t)}.`,
  );
}

function projection(): RawQuestion {
  const u = nonzero(3), v = vec(3);
  const k = fdiv(dot(u, v), dot(u, u));
  return Num(
    "Dans " + m(L`\mathbb{R}^3`) + ", " + m(L`u=${vtex(u)}`) + " et " + m(L`v=${vtex(v)}`) + ". Le projeté orthogonal de v sur " + m(L`\operatorname{Vect}(u)`) + " vaut " + m("k\\,u") + ". Calcule " + m("k") + ".",
    k,
    `k = ⟨u,v⟩ / ‖u‖² = ${ftex(dot(u, v))} / ${ftex(dot(u, u))} = ${ftex(k)}.`,
  );
}

function distanceSq(): RawQuestion {
  const u = nonzero(3), v = vec(3);
  const d2 = fsub(dot(v, v), fdiv(fmul(dot(u, v), dot(u, v)), dot(u, u)));
  return Num(
    m(L`u=${vtex(u)}`) + ", " + m(L`v=${vtex(v)}`) + " dans " + m(L`\mathbb{R}^3`) + ". Calcule le carré de la distance de v à la droite " + m(L`\operatorname{Vect}(u)`) + ".",
    d2,
    `d² = ‖v‖² − ⟨u,v⟩²/‖u‖² = ${ftex(dot(v, v))} − ${ftex(fdiv(fmul(dot(u, v), dot(u, v)), dot(u, u)))} = ${ftex(d2)} (Pythagore).`,
  );
}

function gramSchmidt(): RawQuestion {
  let u1 = nonzero(3), u2 = vec(3);
  // évite u2 colinéaire à u1
  while (u1[0]!.n * u2[1]!.n === u1[1]!.n * u2[0]!.n && u1[1]!.n * u2[2]!.n === u1[2]!.n * u2[1]!.n) {
    u1 = nonzero(3);
    u2 = vec(3);
  }
  const c = fdiv(dot(u1, u2), dot(u1, u1));
  const w = u2.map((x, i) => fsub(x, fmul(c, u1[i]!)));
  const comp = ri(0, 2);
  return Num(
    "Gram–Schmidt sur " + m(L`u_1=${vtex(u1)}`) + ", " + m(L`u_2=${vtex(u2)}`) + " (produit scalaire usuel) : on pose " + m(L`w_2=u_2-\frac{\langle u_2,u_1\rangle}{\|u_1\|^2}u_1`) + ". Quelle est la coordonnée n° " + (comp + 1) + " de " + m("w_2") + " ?",
    w[comp]!,
    `Coefficient ⟨u₂,u₁⟩/‖u₁‖² = ${ftex(c)} ; w₂ = ${m(L`${vtex(w)}`)} est orthogonal à u₁.`,
  );
}

/** Le produit scalaire de l'exercice 2 du DS3 : (x1+x2)(y1+y2) + a x1y1 + b x2y2. */
function isScalarProduct(): RawQuestion {
  const a = ri(-2, 3), b = ri(-2, 3);
  const A = (1 + a), B = (1 + b);
  const positive = A > 0 && A * B - 1 > 0;
  return Qcm(
    "Sur " + m(L`\mathbb{R}^2`) + ", " + m(L`\varphi(x,y)=(x_1+x_2)(y_1+y_2)${a === 0 ? "" : (a > 0 ? "+" : "-") + (Math.abs(a) === 1 ? "" : Math.abs(a))}x_1y_1${b === 0 ? "" : (b > 0 ? "+" : "-") + (Math.abs(b) === 1 ? "" : Math.abs(b))}x_2y_2`) + " est-elle un produit scalaire ?",
    ["Oui : bilinéaire, symétrique, définie positive", "Non : elle n'est pas définie positive", "Non : elle n'est pas symétrique"],
    positive ? 0 : 1,
    `Matrice ${m(L`\begin{pmatrix}${A}&1\\1&${B}\end{pmatrix}`)}, symétrique. Définie positive ⇔ ${m(L`${A}>0`)} et ${m(L`${A}\cdot${B}-1=${A * B - 1}>0`)} : ${positive ? "c'est le cas." : "ce n'est pas le cas."}`,
  );
}

function polyGram(): RawQuestion {
  const w = ri(0, 2), i = ri(0, 2), j = ri(0, 2);
  return Num(
    "Sur " + m(L`\mathbb{R}_2[X]`) + " on pose " + m(L`\langle P,Q\rangle=\int_0^1 ${w === 0 ? "" : w === 1 ? "x" : `x^{${w}}`}P(x)Q(x)\,dx`) + ". Calcule " + m(L`\langle X^{${i}},X^{${j}}\rangle`) + ".",
    Fr(1, i + j + w + 1),
    `∫₀¹ x^${w + i + j} dx = 1/${i + j + w + 1}.`,
  );
}

const cs = poolQcm([
  { q: "Cauchy–Schwarz : |⟨x,y⟩| = ‖x‖‖y‖ si et seulement si…", r: "x et y sont colinéaires", w: ["x et y sont orthogonaux", "x = y", "‖x‖ = ‖y‖"], e: "Cas d'égalité : famille liée." },
  { q: "Si ⟨x,y⟩ = 0, que vaut ‖x+y‖² ?", r: "‖x‖² + ‖y‖² (Pythagore)", w: ["(‖x‖ + ‖y‖)²", "‖x‖² − ‖y‖²", "0"], e: "‖x+y‖² = ‖x‖² + 2⟨x,y⟩ + ‖y‖²." },
  { q: "Pour F sous-espace d'un espace euclidien E, F ⊕ F⊥ = E. Donc dim F⊥ vaut…", r: "dim E − dim F", w: ["dim F", "dim E", "dim E + dim F"], e: "Supplémentaires : les dimensions s'additionnent." },
  { q: "(F⊥)⊥ vaut…", r: "F (en dimension finie)", w: ["{0}", "E", "F⊥"], e: "Valable en dimension finie." },
  { q: "Une famille orthogonale de vecteurs NON NULS est…", r: "libre", w: ["toujours une base", "de norme 1", "liée"], e: "Si Σaᵢeᵢ = 0, on prend le produit scalaire avec eⱼ : aⱼ‖eⱼ‖² = 0." },
  { q: "Le projeté orthogonal p_F(x) est…", r: "le point de F le plus proche de x", w: ["le point de F le plus éloigné de x", "x lui-même", "toujours 0"], e: "‖x − p_F(x)‖ = d(x,F) minimal." },
]);

function gsBug(): RawQuestion {
  return Bug(
    "Gram–Schmidt sur " + m(L`(u_1,u_2)`) + ". Une ligne est fausse.",
    [
      "$e_1=\\dfrac{u_1}{\\|u_1\\|}$.",
      "$w_2=u_2-\\langle u_2,u_1\\rangle\\,u_2$.",
      "$e_2=\\dfrac{w_2}{\\|w_2\\|}$.",
      "Alors $(e_1,e_2)$ est orthonormée et $\\operatorname{Vect}(e_1,e_2)=\\operatorname{Vect}(u_1,u_2)$.",
    ],
    1,
    [
      "$w_2=u_2-\\langle u_2,e_1\\rangle\\,e_1$ : on retire la composante sur $e_1$.",
      "$w_2=u_2-\\langle u_2,u_1\\rangle\\,u_1$ sans diviser par $\\|u_1\\|^2$.",
      "$w_2=u_2+\\langle u_2,e_1\\rangle\\,e_1$.",
    ],
    "On retire à u₂ sa projection sur e₁ : ⟨u₂,e₁⟩e₁. Écrire ⟨u₂,u₁⟩u₂ n'a aucun sens géométrique (et ne rend pas w₂ orthogonal à u₁).",
  );
}

function csProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve de Cauchy–Schwarz (cas " + m(L`y\ne0`) + ").",
    [
      "Pour tout $t\\in\\mathbb{R}$, $\\|x+ty\\|^2\\ge0$.",
      "On développe : $\\|x\\|^2+2t\\langle x,y\\rangle+t^2\\|y\\|^2\\ge0$ pour tout $t$.",
      "Un trinôme de signe constant a un discriminant $\\le0$ : $4\\langle x,y\\rangle^2-4\\|x\\|^2\\|y\\|^2\\le0$.",
      "D'où $|\\langle x,y\\rangle|\\le\\|x\\|\\,\\|y\\|$.",
    ],
    ["Le discriminant est $\\ge0$ car le trinôme a deux racines.", "Posons $t=\\langle x,y\\rangle$."],
  );
}

export const level: Level = {
  id: "ALG3",
  name: "Espaces préhilbertiens",
  fiche: "CM Préhilbertien · DS3",
  icon: "📏",
  color: "#06a77d",
  gens: [
    ["ortho", orthoParam], ["proj", projection], ["dist", distanceSq], ["gs", gramSchmidt], ["scalar", isScalarProduct],
    ["poly", polyGram], ["cs", cs], ["gs-bug", gsBug], ["cs-proof", csProof],
  ],
  piege: "Pour retirer la composante, on utilise ⟨u₂,e₁⟩e₁ (ou ⟨u₂,u₁⟩/‖u₁‖² u₁), jamais ⟨u₂,u₁⟩ u₂. Et « symétrique + positive » ne suffit pas sans « définie ».",
  rappel: [
    "Produit scalaire : bilinéaire, symétrique, positif, DÉFINI (⟨x,x⟩ = 0 ⇒ x = 0).",
    "Cauchy–Schwarz : |⟨x,y⟩| ≤ ‖x‖‖y‖, égalité ⇔ colinéaires. Pythagore si ⟨x,y⟩ = 0.",
    "Projeté sur Vect(u) : (⟨u,v⟩/‖u‖²)·u. Distance² = ‖v‖² − ⟨u,v⟩²/‖u‖².",
    "Gram–Schmidt : wₖ = uₖ − Σ⟨uₖ,eᵢ⟩eᵢ, eₖ = wₖ/‖wₖ‖.",
  ],
};
