// Analyse ℝⁿ · niveau 3 : dérivées partielles, différentielle, composition
import { Fr, ftex } from "../../core/fraction";
import { padd, pdiff, peval, pmono, psubst, ptex, type Poly } from "../../core/poly";
import { pick, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Num, poolVF } from "../factories";
import { pt, randPoly } from "./helpers";

const F = (p: Poly): string => m(L`f(x,y)=${ptex(p)}`);

function partial(): RawQuestion {
  const f = randPoly(4, 4, 4, 1);
  const a = pt(), b = pt();
  const kinds = [
    { tex: L`\frac{\partial f}{\partial x}`, d: pdiff(f, "x") },
    { tex: L`\frac{\partial f}{\partial y}`, d: pdiff(f, "y") },
    { tex: L`\frac{\partial^2 f}{\partial x\,\partial y}`, d: pdiff(pdiff(f, "x"), "y") },
    { tex: L`\frac{\partial^2 f}{\partial x^2}`, d: pdiff(pdiff(f, "x"), "x") },
    { tex: L`\frac{\partial^2 f}{\partial y^2}`, d: pdiff(pdiff(f, "y"), "y") },
  ];
  const k = pick(kinds);
  return Num(
    F(f) + ". Calcule " + m(L`${k.tex}(${a},${b})`) + ".",
    peval(k.d, Fr(a), Fr(b)),
    "On dérive en traitant l'autre variable comme une constante : " + m(L`${k.tex}=${ptex(k.d)}`) + ".",
  );
}

function directional(): RawQuestion {
  const f = randPoly(3, 4, 4, 1);
  const a = pt(), b = pt();
  const [u, v, n] = pick([[3, 4, 5], [4, -3, 5], [5, 12, 13], [-12, 5, 13], [0, 1, 1], [-1, 0, 1]] as const);
  const fx = peval(pdiff(f, "x"), Fr(a), Fr(b)), fy = peval(pdiff(f, "y"), Fr(a), Fr(b));
  const ans = Fr(fx.n * fy.d * u + fy.n * fx.d * v, fx.d * fy.d * n);
  return Num(
    F(f) + ". Dérivée de f au point " + m(L`(${a},${b})`) + " dans la direction du vecteur unitaire " + m(L`\vec u=\frac{1}{${n}}(${u},${v})`) + " ?",
    ans,
    "Comme f est C¹ : " + m(L`D_{\vec u}f(a)=\langle\nabla f(a),\vec u\rangle`) + " avec " + m(L`\nabla f(${a},${b})=(${ftex(fx)},${ftex(fy)})`) + ".",
  );
}

/** g(t)=f(X(t),Y(t)), on demande g'(t0). */
function chain(): RawQuestion {
  const f = randPoly(3, 4, 3, 1);
  const X: Poly = padd(pmono(ri(1, 3), 1, 0), pmono(ri(-2, 2), 0, 0));
  const e = pick([2, 3]);
  const Y: Poly = padd(pmono(ri(1, 2), e, 0), pmono(ri(-2, 2), 1, 0));
  const g = psubst(psubst(f, "x", X), "y", Y); // polynôme en x (= t)
  const t0 = ri(-1, 2);
  const gp = peval(pdiff(g, "x"), Fr(t0), Fr(0));
  const tt = (p: Poly): string => ptex(p).replace(/x/g, "t");
  return Num(
    F(f) + ", " + m(L`g(t)=f\big(x(t),y(t)\big)`) + " avec " + m(L`x(t)=${tt(X)}`) + ", " + m(L`y(t)=${tt(Y)}`) + ". Calcule " + m(L`g'(${t0})`) + ".",
    gp,
    "Règle de la chaîne : " + m(L`g'(t)=\partial_xf\cdot x'(t)+\partial_yf\cdot y'(t)`) + " (ou on remplace puis on dérive : même résultat).",
  );
}

const theory = poolVF([
  { q: "Si f admet des dérivées partielles en a, alors f est continue en a.", t: false, e: "Faux : xy/(x²+y²) (prolongée par 0) a ses dérivées partielles nulles en 0 mais n'est pas continue." },
  { q: "Si f est différentiable en a, alors f est continue en a.", t: true, e: "Vrai : f(a+h) = f(a) + L(h) + o(‖h‖) → f(a)." },
  { q: "Si f est de classe C¹ sur un ouvert, alors f est différentiable.", t: true, e: "Vrai : c'est le théorème « C¹ ⇒ différentiable »." },
  { q: "Si f est différentiable en a, alors ses dérivées partielles sont continues en a.", t: false, e: "Faux : c'est la définition de C¹, strictement plus forte (contre-exemple x²sin(1/x) en dimension 1)." },
  { q: "Si f est différentiable en a, elle admet des dérivées partielles en a.", t: true, e: "Vrai : ∂f/∂xᵢ(a) = df(a)(eᵢ)." },
  { q: "Si f admet une dérivée dans toute direction en a, alors f est différentiable en a.", t: false, e: "Faux : on peut avoir toutes les dérivées directionnelles et même pas la continuité." },
  { q: "Schwarz : si f est C² alors ∂²f/∂x∂y = ∂²f/∂y∂x.", t: true, e: "Vrai : la symétrie de la hessienne demande la classe C²." },
  { q: "Le gradient pointe dans la direction de plus forte décroissance de f.", t: false, e: "Faux : il pointe vers la plus forte CROISSANCE ; −∇f vers la décroissance." },
]);

function chainBug(): RawQuestion {
  const a = pick([2, 3]), b = pick([3, 4]);
  return Bug(
    "Soit " + m(L`g(t)=f(t^${a},t^${b})`) + " avec f de classe " + m(L`C^1`) + ". On veut " + m(L`g'(t)`) + ". Une ligne est fausse.",
    [
      `On pose $x(t)=t^{${a}}$ et $y(t)=t^{${b}}$.`,
      `Alors $x'(t)=${a}t^{${a - 1}}$ et $y'(t)=${b}t^{${b - 1}}$.`,
      `Donc $g'(t)=\\partial_xf(t^{${a}},t^{${b}})+\\partial_yf(t^{${a}},t^{${b}})$.`,
      `Cette formule donne $g'(1)=\\partial_xf(1,1)+\\partial_yf(1,1)$.`,
    ],
    2,
    [
      `Donc $g'(t)=\\partial_xf(t^{${a}},t^{${b}})\\cdot${a}t^{${a - 1}}+\\partial_yf(t^{${a}},t^{${b}})\\cdot${b}t^{${b - 1}}$.`,
      `Donc $g'(t)=\\partial_xf\\cdot${b}t^{${b - 1}}+\\partial_yf\\cdot${a}t^{${a - 1}}$.`,
      `Donc $g'(t)=\\dfrac{\\partial^2f}{\\partial x\\partial y}\\cdot${a}t^{${a - 1}}\\cdot${b}t^{${b - 1}}$.`,
    ],
    "Règle de la chaîne : chaque dérivée partielle est multipliée par la dérivée de SA coordonnée. Oublier x′(t), y′(t) revient à supposer x′=y′=1.",
  );
}

export const level: Level = {
  id: "ANR3",
  name: "Calcul différentiel",
  fiche: "Cours ch. 4 · TD",
  icon: "∂",
  color: "#457b9d",
  gens: [["partial", partial], ["directional", directional], ["chain", chain], ["theory", theory], ["chain-bug", chainBug]],
  piege: "C¹ ⇒ différentiable ⇒ continue et dérivées partielles, mais AUCUNE réciproque n'est vraie.",
  rappel: [
    "∂f/∂x : on dérive en x, y est une constante. Schwarz : fₓᵧ = fᵧₓ si f est C².",
    "f C¹ en a ⇒ D_u f(a) = ⟨∇f(a), u⟩ pour u unitaire.",
    "Composition : (f∘γ)′(t) = ∂ₓf·x′(t) + ∂ᵧf·y′(t).",
    "Différentiable ⇒ continue + dérivées partielles ; la réciproque est fausse.",
  ],
};
