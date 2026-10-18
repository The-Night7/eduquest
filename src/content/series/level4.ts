// Niveau 4 : Règles de d'Alembert et de Cauchy (fiche 4)
import { feq, Fr, ftex, fval } from "../../core/fraction";
import { pick, rand, ri } from "../../core/rng";
import { L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { DOUTE3, Num, poolVF, Qcm } from "../factories";

function ratio(): RawQuestion {
  const t = ri(0, 2);
  if (t === 0) {
    const a = pick([Fr(1, 2), Fr(2), Fr(3), Fr(4), Fr(5), Fr(10)]);
    const k = ri(1, 5);
    const tex = a.d === 2 ? L`n^{${k}}\,2^n` : L`\frac{n^{${k}}}{${a.n}^n}`;
    const l = Fr(a.d, a.n);
    const e = m(L`\frac{u_{n+1}}{u_n}=\left(\frac{n+1}{n}\right)^{${k}}\times${ftex(l)}\to${ftex(l)}`);
    if (rand() < 0.5)
      return Num("Pour " + m(L`u_n=${tex}`) + ", calcule " + m(L`\ell=\lim\frac{u_{n+1}}{u_n}`) + " (fraction ou décimal).", l, e);
    return Qcm("D'Alembert pour " + m(L`\sum${tex}`) + " : que conclut-on ?", DOUTE3, fval(l) < 1 ? 0 : 1, e + (fval(l) < 1 ? " < 1 : converge." : " > 1 : diverge."));
  }
  if (t === 1) {
    const a = ri(2, 6);
    const tex = L`\frac{${a}^n}{n!}`;
    const e = m(L`\frac{u_{n+1}}{u_n}=\frac{${a}}{n+1}\to0`);
    if (rand() < 0.5)
      return Num("Pour " + m(L`u_n=${tex}`) + ", calcule " + m(L`\ell=\lim\frac{u_{n+1}}{u_n}`) + ".", Fr(0), e);
    return Qcm("D'Alembert pour " + m(L`\sum${tex}`) + " : que conclut-on ?", DOUTE3, 0, e + " < 1 : converge.");
  }
  const a = pick([2, 3, 5, 10]);
  return Qcm(
    "D'Alembert pour " + m(L`\sum\frac{n!}{${a}^n}`) + " : que conclut-on ?",
    DOUTE3,
    1,
    m(L`\frac{u_{n+1}}{u_n}=\frac{n+1}{${a}}\to+\infty>1`) + " : diverge grossièrement.",
  );
}

function cauchy(): RawQuestion {
  if (rand() < 0.5) {
    const x = pick([-2, -1, 1, 2]);
    const base = x < 0 ? L`1-\frac{${-x}}{n}` : L`1+\frac{${x}}{n}`;
    const conv = x < 0;
    return Qcm(
      "Règle de Cauchy pour " + m(L`u_n=\left(${base}\right)^{n^2}`) + " : que vaut " + m(L`\ell=\lim\sqrt[n]{u_n}`) + " ?",
      [m(L`e^{${x}}`), m(L`e^{${-x}}`), m("1"), m("0")],
      0,
      m(L`\sqrt[n]{u_n}=\left(${base}\right)^{n}\to e^{${x}}`) + (conv ? " < 1 : converge." : " > 1 : diverge."),
      true,
    );
  }
  const a = pick([Fr(1, 2), Fr(1), Fr(2), Fr(3)]);
  const inner = a.d === 2 ? L`\frac{n}{2(n+1)}` : feq(a, Fr(1)) ? L`\frac{n}{n+1}` : L`\frac{${a.n}n}{n+1}`;
  const r = fval(a) < 1 ? 0 : fval(a) > 1 ? 1 : 2;
  return Qcm(
    "Règle de Cauchy pour " + m(L`u_n=\left(${inner}\right)^{n}`) + " : que dit-elle ?",
    DOUTE3,
    r,
    m(L`\sqrt[n]{u_n}\to${ftex(a)}`) +
      (r === 0
        ? " < 1 : converge."
        : r === 1
          ? " > 1 : diverge."
          : " : cas douteux. Ici " + m(L`u_n\to\frac1e\neq0`) + " : divergence grossière, mais c'est un autre outil qui conclut."),
  );
}

function which(): RawQuestion {
  const it = pick([
    { tex: L`\frac{n^3}{2^n}`, r: 0, e: "Rapport simple avec " + m("a^n") + " : d'Alembert." },
    { tex: L`\frac{3^n}{n!}`, r: 0, e: "Factorielle : d'Alembert." },
    { tex: L`\frac{n!}{3^n}`, r: 0, e: "Factorielle : d'Alembert." },
    { tex: L`\left(\frac{n}{n+1}\right)^{n^2}`, r: 1, e: "Puissance " + m("n^2") + " : Cauchy, " + m(L`\sqrt[n]{u_n}\to\frac1e`) + "." },
    { tex: L`\frac{1}{(\ln n)^n}`, r: 1, e: "Puissance " + m("n") + "-ième : Cauchy, " + m(L`\sqrt[n]{u_n}=\frac{1}{\ln n}\to0`) + "." },
    { tex: L`\frac{1}{n^2}`, r: 2, e: "Riemann : les deux règles donnent " + m(L`\ell=1`) + "." },
    { tex: L`\frac{n}{n^3+1}`, r: 2, e: "Fraction rationnelle : " + m(L`\ell=1`) + ", utilise un équivalent." },
  ]);
  return Qcm("Quelle règle est adaptée à " + m(L`\sum${it.tex}`) + " ?", ["D'Alembert", "Cauchy", "Aucune des deux (ℓ = 1)"], it.r, it.e);
}

const vf = poolVF([
  { q: "Si d'Alembert donne " + m(L`\ell=1`) + ", la série converge.", t: false, e: "Cas douteux : on ne conclut pas." },
  { q: "Si " + m(L`\ell<1`) + " (d'Alembert), la série converge absolument.", t: true, e: "Domination par une série géométrique." },
  { q: "Si d'Alembert donne " + m(L`\ell=1`) + ", la règle de Cauchy peut conclure.", t: false, e: "Elle donnera aussi 1 : change d'outil." },
  { q: "Si " + m(L`\ell>1`) + ", la série diverge grossièrement.", t: true, e: "Le terme général ne tend pas vers 0." },
  { q: m(L`\left(1+\frac{x}{n}\right)^n\to e^{x}`) + ".", t: true, e: "Limite usuelle." },
]);

export const level: Level = {
  id: "L4",
  name: "d'Alembert & Cauchy",
  fiche: "Fiche 4",
  icon: "⚔️",
  color: "#ff8a3d",
  gens: [["ratio", ratio], ["cauchy", cauchy], ["which", which], ["vf", vf]],
  piege: "Le cas " + m(L`\ell=1`) + " ne se conclut pas : repasse par un équivalent ou une comparaison.",
  rappel: [
    "D'Alembert " + m(L`\left|\frac{u_{n+1}}{u_n}\right|\to\ell`) + " : factorielles, " + m("a^n") + ", produits.",
    "Cauchy " + m(L`\sqrt[n]{|u_n|}\to\ell`) + " : puissances " + m("n") + "-ièmes.",
    m(L`\ell<1`) + " converge absolument ; " + m(L`\ell>1`) + " diverge grossièrement ; " + m(L`\ell=1`) + " douteux.",
  ],
};
