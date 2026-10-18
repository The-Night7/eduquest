// Intégration & probabilités · niveau 5 : probabilités et variables aléatoires
import { Fr, fadd, fdiv, fmul, fpow, fsub, ftex } from "../../core/fraction";
import { binom } from "../../core/combi";
import { pick, ri, shuffle } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, gn, Guided, Num, Order, poolVF } from "../factories";

function bayes(): RawQuestion {
  const p = pick([Fr(1, 100), Fr(1, 50), Fr(1, 20), Fr(1, 10)]);
  const s = pick([Fr(9, 10), Fr(19, 20), Fr(4, 5)]);
  const f = pick([Fr(1, 10), Fr(1, 20), Fr(1, 50)]);
  const joint = fmul(p, s);
  const tot = fadd(joint, fmul(fsub(Fr(1), p), f));
  const ans = fdiv(joint, tot);
  return Num(
    `Une maladie touche une proportion ${ftex(p).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")} de la population. Un test est positif pour un malade avec probabilité ${ftex(s).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")} et pour un non-malade avec probabilité ${ftex(f).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}. Quelle est la probabilité d'être malade sachant que le test est positif ?`,
    ans,
    `Bayes : P(M|+) = P(+|M)P(M) / [P(+|M)P(M) + P(+|M̄)P(M̄)] = ${ftex(joint)} / ${ftex(tot)} = ${ftex(ans)}.`,
  );
}

function binomial(): RawQuestion {
  const n = ri(4, 8), k = ri(0, n);
  const p = pick([Fr(1, 2), Fr(1, 3), Fr(1, 4), Fr(2, 3)]);
  const ans = fmul(Fr(binom(n, k)), fmul(fpow(p, k), fpow(fsub(Fr(1), p), n - k)));
  return Num(
    "Soit " + m(L`X\sim\mathcal{B}\left(${n},${ftex(p)}\right)`) + ". Calcule " + m(`P(X=${k})`) + ".",
    ans,
    `P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ = ${binom(n, k)} · (${ftex(p)})^${k} · (${ftex(fsub(Fr(1), p))})^${n - k} = ${ftex(ans)}.`,
  );
}

function moments(): RawQuestion {
  const kind = ri(0, 4);
  const wantVar = ri(0, 1) === 0;
  if (kind === 0) {
    const n = ri(4, 20), p = pick([Fr(1, 2), Fr(1, 4), Fr(1, 5), Fr(2, 5), Fr(1, 10)]);
    const e = fmul(Fr(n), p);
    return Num("Soit " + m(L`X\sim\mathcal{B}(${n},${ftex(p)})`) + ". Calcule " + m(wantVar ? "V(X)" : "E(X)") + ".", wantVar ? fmul(e, fsub(Fr(1), p)) : e, wantVar ? "V(X) = np(1−p)." : "E(X) = np.");
  }
  if (kind === 1) {
    const p = pick([Fr(1, 2), Fr(1, 3), Fr(1, 4), Fr(1, 5), Fr(2, 5)]);
    return Num("Soit " + m(L`X\sim\mathcal{G}(${ftex(p)})`) + " (rang du premier succès). Calcule " + m(wantVar ? "V(X)" : "E(X)") + ".", wantVar ? fdiv(fsub(Fr(1), p), fmul(p, p)) : fdiv(Fr(1), p), wantVar ? "V(X) = (1−p)/p²." : "E(X) = 1/p.");
  }
  if (kind === 2) {
    const l = ri(1, 9);
    return Num("Soit " + m(L`X\sim\mathcal{P}(${l})`) + ". Calcule " + m(wantVar ? "V(X)" : "E(X)") + ".", Fr(l), "Pour une loi de Poisson, E(X) = V(X) = λ.");
  }
  if (kind === 3) {
    const n = ri(2, 12);
    return Num("Soit " + m(L`X\sim\mathcal{U}\{1,\dots,${n}\}`) + ". Calcule " + m(wantVar ? "V(X)" : "E(X)") + ".", wantVar ? Fr(n * n - 1, 12) : Fr(n + 1, 2), wantVar ? "V(X) = (n²−1)/12." : "E(X) = (n+1)/2.");
  }
  const a = ri(-3, 2), b = a + ri(1, 6);
  return Num("Soit " + m(L`X\sim\mathcal{U}([${a},${b}])`) + " (loi continue). Calcule " + m(wantVar ? "V(X)" : "E(X)") + ".", wantVar ? Fr((b - a) ** 2, 12) : Fr(a + b, 2), wantVar ? "V(X) = (b−a)²/12." : "E(X) = (a+b)/2.");
}

function tableMean(): RawQuestion {
  const vals = shuffle([-2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 4).sort((a, b) => a - b);
  const w = vals.map(() => ri(1, 5));
  const S = w.reduce((a, b) => a + b, 0);
  const E = Fr(vals.reduce((s, v, i) => s + v * w[i]!, 0), S);
  return Num(
    "La loi de X est donnée par " + vals.map((v, i) => `P(X=${v}) = ${w[i]}/${S}`).join(" ; ") + ". Calcule " + m("E(X)") + ".",
    E,
    "E(X) = Σ xᵢ P(X=xᵢ) = " + ftex(E) + ".",
  );
}

const indep = poolVF([
  { q: "Si X et Y sont indépendantes, alors Cov(X,Y) = 0.", t: true, e: "E(XY) = E(X)E(Y)." },
  { q: "Si Cov(X,Y) = 0, alors X et Y sont indépendantes.", t: false, e: "Contre-exemple : X uniforme sur {−1,0,1} et Y = X² (Cov = 0 mais Y dépend de X)." },
  { q: "V(X+Y) = V(X) + V(Y) pour toutes variables X, Y.", t: false, e: "Il faut Cov(X,Y) = 0 : V(X+Y) = V(X) + V(Y) + 2Cov(X,Y)." },
  { q: "E(X+Y) = E(X) + E(Y) pour toutes variables X, Y.", t: true, e: "Linéarité de l'espérance, sans aucune hypothèse d'indépendance." },
  { q: "V(aX) = a V(X).", t: false, e: "V(aX) = a² V(X)." },
  { q: "Si A et B sont indépendants, P(A ∩ B) = P(A) P(B).", t: true, e: "C'est la définition." },
  { q: "Deux événements incompatibles de probabilités non nulles sont indépendants.", t: false, e: "P(A∩B) = 0 ≠ P(A)P(B) : ils sont au contraire très dépendants." },
  { q: "La loi binomiale est la loi d'une somme de n variables de Bernoulli indépendantes de même paramètre.", t: true, e: "Compte les succès en n épreuves indépendantes." },
]);

function urnGuided(): RawQuestion {
  const r = ri(3, 6), b = ri(2, 5), N = r + b;
  return Guided(
    `Une urne contient ${r} boules rouges et ${b} boules bleues. On tire deux boules successivement SANS remise.`,
    [
      gn("Probabilité que la 1re soit rouge ?", Fr(r, N), ["Cas favorables / cas possibles."], `Il y a ${r} boules rouges sur ${N} : ${r}/${N}.`),
      gn("Probabilité que les DEUX soient rouges ?", Fr(r * (r - 1), N * (N - 1)), ["P(R1) × P(R2 | R1)."], `${r}/${N} · ${r - 1}/${N - 1} = ${ftex(Fr(r * (r - 1), N * (N - 1)))}.`),
      gn(
        "Probabilité que la 2e soit rouge (probabilités totales) ?",
        Fr(r, N),
        ["P(R2) = P(R1)P(R2|R1) + P(B1)P(R2|B1).", `P(R2|B1) = ${r}/${N - 1}.`],
        `${r}/${N} · ${r - 1}/${N - 1} + ${b}/${N} · ${r}/${N - 1} = ${r}/${N}. (Par symétrie, la 2e boule suit la même loi que la 1re.)`,
      ),
      gn("Sachant que la 2e est rouge, probabilité que la 1re le soit aussi (Bayes) ?", Fr(r - 1, N - 1), ["P(R1|R2) = P(R1∩R2)/P(R2)."], `[${r}(${r - 1})/(${N}·${N - 1})] / (${r}/${N}) = ${r - 1}/${N - 1}.`),
    ],
    "Sans remise : les tirages ne sont pas indépendants ; on enchaîne les probabilités conditionnelles.",
  );
}

function varianceBug(): RawQuestion {
  return Bug(
    "Soit " + m(L`X\sim\mathcal{B}\left(1,\frac12\right)`) + " et " + m("Y=X") + ". On veut " + m("V(X+Y)") + ". Une ligne est fausse.",
    [
      "$V(X)=p(1-p)=\\dfrac14$ et $V(Y)=\\dfrac14$.",
      "Donc $V(X+Y)=V(X)+V(Y)=\\dfrac12$.",
      "Or $X+Y=2X$.",
      "Vérifions : $V(2X)=4V(X)=1$.",
    ],
    1,
    [
      "Comme $Y=X$ n'est pas indépendante de $X$, $V(X+Y)=V(X)+V(Y)+2\\mathrm{Cov}(X,Y)=\\frac14+\\frac14+\\frac12=1$.",
      "Donc $V(X+Y)=V(X)\\cdot V(Y)=\\dfrac1{16}$.",
      "Donc $V(X+Y)=V(X)-V(Y)=0$.",
    ],
    "L'additivité des variances exige Cov(X,Y) = 0 (par exemple l'indépendance). Ici Y = X : V(X+Y) = V(2X) = 4V(X) = 1.",
  );
}

function varProof(): RawQuestion {
  return Order(
    "Reconstitue la preuve de la formule de König-Huygens " + m(L`V(X)=E(X^2)-E(X)^2`) + ".",
    [
      "Par définition, $V(X)=E\\big((X-E(X))^2\\big)$.",
      "On développe : $V(X)=E\\big(X^2-2E(X)X+E(X)^2\\big)$.",
      "Par linéarité : $V(X)=E(X^2)-2E(X)^2+E(X)^2$.",
      "Donc $V(X)=E(X^2)-E(X)^2$.",
    ],
    ["Par définition, $V(X)=E\\big(|X-E(X)|\\big)$.", "Par linéarité : $V(X)=E(X^2)-E(X)^2+E(X)^2$."],
  );
}

export const level: Level = {
  id: "ITP5",
  name: "Probabilités",
  fiche: "CM ch. 2 · TD5",
  icon: "🎰",
  color: "#d62828",
  gens: [["bayes", bayes], ["binomial", binomial], ["moments", moments], ["table", tableMean], ["indep", indep], ["urn-guided", urnGuided], ["variance-bug", varianceBug], ["var-proof", varProof]],
  piege: "Covariance nulle ≠ indépendance ; V(aX) = a²V(X) ; E est linéaire sans hypothèse mais V ne l'est qu'avec Cov = 0.",
  rappel: [
    "Probabilités totales : P(B) = ΣP(B|Aᵢ)P(Aᵢ). Bayes : P(A|B) = P(B|A)P(A)/P(B).",
    "B(n,p) : E = np, V = np(1−p). G(p) : E = 1/p. P(λ) : E = V = λ. U{1..n} : E = (n+1)/2, V = (n²−1)/12.",
    "V(X) = E(X²) − E(X)². V(X+Y) = V(X) + V(Y) + 2Cov(X,Y).",
    "Indépendantes ⇒ Cov = 0, mais la réciproque est fausse.",
  ],
};
