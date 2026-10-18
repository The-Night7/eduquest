// Niveau 7 : Équivalents et développements limités (fiche 7)
import { fgt1, Fr, fmul, ftex, type Fraction } from "../core/fraction";
import { pick, rand, ri, shuffle } from "../core/rng";
import { invPow, L, m, powN } from "../core/tex";
import type { Level, RawQuestion } from "../types";
import { Nat, poolQcm, poolVF, Qcm } from "./factories";

interface EqForm {
  t: (u: string) => string; // LaTeX de f(u)
  c: Fraction; // f(u) ~ c·u^p
  p: number;
}
const EQF: EqForm[] = [
  { t: (u) => L`\ln\left(1+${u}\right)`, c: Fr(1), p: 1 },
  { t: (u) => L`e^{${u}}-1`, c: Fr(1), p: 1 },
  { t: (u) => L`\sin\left(${u}\right)`, c: Fr(1), p: 1 },
  { t: (u) => L`\tan\left(${u}\right)`, c: Fr(1), p: 1 },
  { t: (u) => L`1-\cos\left(${u}\right)`, c: Fr(1, 2), p: 2 },
];

function eqTex(c: Fraction, e: Fraction): string {
  const den = c.d === 1 ? powN(e) : `${c.d}${powN(e)}`;
  return (c.n < 0 ? "-" : "") + L`\frac{${Math.abs(c.n)}}{${den}}`;
}

function eq(): RawQuestion {
  let f: EqForm;
  if (rand() < 0.2) {
    const al = pick([Fr(1, 2), Fr(2), Fr(3), Fr(-1)]);
    f = { t: (u) => L`\left(1+${u}\right)^{${ftex(al)}}-1`, c: al, p: 1 };
  } else f = pick(EQF);
  const a = pick([Fr(1), Fr(1, 2)]);
  const u = invPow(a);
  const e = fmul(a, Fr(f.p));
  const c = f.c;
  if (rand() < 0.5) {
    const right = eqTex(c, e);
    const cand: [Fraction, Fraction][] = [
      [c, fmul(e, Fr(2))], [c, fmul(e, Fr(1, 2))], [Fr(1), e],
      [fmul(c, Fr(2)), e], [fmul(c, Fr(1, 2)), e], [fmul(c, Fr(-1)), e],
    ];
    const wrong = [...new Set(cand.map(([x, y]) => eqTex(x, y)).filter((s) => s !== right))];
    return Qcm(
      "Équivalent de " + m(f.t(u)) + " quand " + m(L`n\to+\infty`) + " :",
      [m(right), ...shuffle(wrong).slice(0, 3).map(m)],
      0,
      "On pose " + m(L`u=${u}\to0`) + " et on applique l'équivalent usuel : " + m(right) + ".",
      true,
    );
  }
  const conv = fgt1(e);
  return Nat(
    "Nature de " + m(L`\sum_{n\ge1}${f.t(u)}`) + " ?",
    conv,
    m(L`u_n\sim${eqTex(c, e)}`) + ", Riemann avec " + m(L`\alpha=${ftex(e)}`) + (conv ? " > 1 : converge." : " ≤ 1 : diverge."),
  );
}

/** (cos 1/n)^{n^k} ou (n sin 1/n)^{n^k} : on passe par exp(b ln a). */
function pow(): RawQuestion {
  const k = ri(1, 4), conv = k > 2, useCos = rand() < 0.5;
  const base = useCos ? L`\cos\frac1n` : L`n\sin\frac1n`;
  const ex = k - 2 < 0 ? "-" + (2 - k) : String(k - 2);
  const why = useCos
    ? m(L`\ln u_n=n^{${k}}\ln\cos\frac1n\sim-\frac{n^{${ex}}}{2}`)
    : m(L`n\sin\frac1n=1-\frac{1}{6n^2}+o\left(\frac1{n^2}\right)`) + ", donc " + m(L`\ln u_n\sim-\frac{n^{${ex}}}{6}`);
  return Nat(
    "Nature de " + m(L`\sum\left(${base}\right)^{n^{${k}}}`) + " ?",
    conv,
    why + " : " +
      (k < 2
        ? m(L`u_n\to1\neq0`) + ", divergence grossière."
        : k === 2
          ? m(L`u_n\to e^{-${useCos ? "1/2" : "1/6"}}\neq0`) + ", divergence grossière."
          : m(L`n^2u_n\to0`) + ", la série converge."),
  );
}

function grow(): RawQuestion {
  const cls = [[L`(\ln n)^2`, L`(\ln n)^3`], [L`n^2`, L`n^5`], [L`2^n`, L`3^n`], [L`n!`], [L`n^n`]];
  const i = ri(0, 4);
  let j = ri(0, 4);
  while (j === i) j = ri(0, 4);
  const A = pick(cls[i] as string[]), B = pick(cls[j] as string[]);
  return Qcm(
    "Que vaut " + m(L`\lim_{n\to\infty}\frac{${A}}{${B}}`) + " ?",
    [m("0"), m(L`+\infty`), "Un réel non nul"],
    i < j ? 0 : 1,
    "Croissances comparées : " + m(L`(\ln n)^\beta\ll n^\alpha\ll a^n\ll n!\ll n^n`) + ".",
  );
}

const ref = poolQcm([
  { q: "Développement de " + m(L`\ln(1+u)`) + " à l'ordre 3 :", r: m(L`u-\frac{u^2}{2}+\frac{u^3}{3}`), w: [m(L`u+\frac{u^2}{2}+\frac{u^3}{3}`), m(L`u-\frac{u^2}{2}-\frac{u^3}{3}`), m(L`u-\frac{u^3}{6}`)], e: "Formule à connaître." },
  { q: "Développement de " + m(L`e^u-1`) + " à l'ordre 2 :", r: m(L`u+\frac{u^2}{2}`), w: [m(L`u-\frac{u^2}{2}`), m(L`1+u+\frac{u^2}{2}`), m(L`u+u^2`)], e: "La différence avec " + m(L`e^u`) + " est le " + m("1") + "." },
  { q: "Développement de " + m(L`\frac{1}{1+u}`) + " à l'ordre 2 :", r: m(L`1-u+u^2`), w: [m(L`1+u+u^2`), m(L`1-u-u^2`), m(L`1-u+\frac{u^2}{2}`)], e: "Série géométrique de raison " + m("-u") + "." },
  { q: m(L`\frac{1}{\sqrt{n^2-1}}-\frac{1}{\sqrt{n^2+1}}`) + " est équivalent à :", r: m(L`\frac{1}{n^3}`), w: [m(L`\frac1n`), m(L`\frac{2}{n^3}`), m("0")], e: "On met " + m(L`\frac1n`) + " en facteur : " + m(L`\left(1-\frac1{n^2}\right)^{-1/2}-\left(1+\frac1{n^2}\right)^{-1/2}\sim\frac{1}{n^2}`) + "." },
  { q: m(L`\frac{1-\cos(1/n)}{e^{1/n}-1}`) + " est équivalent à :", r: m(L`\frac{1}{2n}`), w: [m(L`\frac1n`), m(L`\frac{1}{2n^2}`), m(L`\frac{1}{n^2}`)], e: m(L`1-\cos\frac1n\sim\frac{1}{2n^2}`) + " et " + m(L`e^{1/n}-1\sim\frac1n`) + "." },
]);

const vf = poolVF([
  { q: "On peut remplacer par un équivalent dans une exponentielle : " + m(L`n+1\sim n`) + " donne " + m(L`e^{n+1}\sim e^n`) + ".", t: false, e: m(L`\frac{e^{n+1}}{e^n}=e\neq1`) + " : écris un développement limité." },
  { q: "Les équivalents sont compatibles avec le produit, le quotient et les puissances fixes.", t: true, e: "Autorisé : produit, quotient, puissance fixe, composition à droite." },
  { q: "Pour " + m(L`a_n^{\,b_n}`) + ", on passe par " + m(L`\exp(b_n\ln a_n)`) + ".", t: true, e: "C'est la méthode de la fiche." },
]);

export const level: Level = {
  id: "L7",
  name: "Équivalents & DL",
  fiche: "Fiche 7",
  icon: "👑",
  color: "#f5b400",
  gens: [["eq", eq], ["eq2", eq], ["pow", pow], ["grow", grow], ["ref", ref], ["vf", vf]],
  piege: "Dans un ln ou une exponentielle, jamais d'équivalent : écris un développement limité avec son reste.",
  rappel: [
    m(L`\ln(1+u)\sim u`) + ", " + m(L`e^u-1\sim u`) + ", " + m(L`\sin u\sim u`) + ", " + m(L`1-\cos u\sim\frac{u^2}{2}`) + ".",
    "Croissances comparées : " + m(L`(\ln n)^\beta\ll n^\alpha\ll a^n\ll n!\ll n^n`) + ".",
    "Forme " + m(L`a_n^{b_n}`) + " : passe par " + m(L`\exp(b_n\ln a_n)`) + ".",
  ],
};
