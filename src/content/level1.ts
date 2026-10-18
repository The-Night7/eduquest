// Niveau 1 : Vocabulaire et questions de cours (fiche 1)
import { Fr, ftex } from "../core/fraction";
import { pick, rand, ri } from "../core/rng";
import { invPow, L, lin, m } from "../core/tex";
import type { Level, RawQuestion } from "../types";
import { CONC3, poolVF, Qcm } from "./factories";

function zero(): RawQuestion {
  const k = ri(1, 5);
  let tex: string;
  let lim0: boolean;
  let why = "";
  if (k <= 2) {
    const a = ri(1, 5), b = ri(-3, 3), c = ri(1, 5), d = ri(1, 6);
    tex = L`\frac{${lin(a, b)}}{${lin(c, d)}}`;
    lim0 = false;
    why = m(L`u_n\to${ftex(Fr(a, c))}\neq0`);
  } else if (k === 3) {
    const x = ri(1, 3);
    tex = L`\left(1+\frac{${x}}{n}\right)^{n}`;
    lim0 = false;
    why = m(L`u_n\to e^{${x}}\neq0`);
  } else if (k === 4) {
    tex = invPow(pick([Fr(1, 2), Fr(1), Fr(2), Fr(3, 2)]));
    lim0 = true;
  } else {
    tex = pick([L`\frac{n}{2^n}`, L`e^{-n}`, L`\frac{\ln n}{n}`]);
    lim0 = true;
  }
  return Qcm(
    "Pour " + m(L`u_n=${tex}`) + ", que conclut-on avec la condition nécessaire " + m(L`u_n\to0`) + " ?",
    CONC3,
    lim0 ? 2 : 0,
    lim0
      ? m(L`u_n\to0`) + " : la condition est vérifiée, mais elle ne suffit pas à prouver la convergence."
      : why + ", donc " + m(L`u_n\not\to0`) + " : divergence grossière.",
  );
}

function ops(): RawQuestion {
  const c = pick([
    { a: "converge", b: "converge", r: 1, e: "Somme de deux convergentes : elle converge." },
    { a: "converge", b: "diverge", r: 0, e: "Sinon la divergente serait la différence de deux convergentes." },
    {
      a: "diverge",
      b: "diverge",
      r: 2,
      e: "Aucune conclusion : " + m(L`\frac1n+\frac1n`) + " diverge mais " + m(L`\frac1n-\frac1n`) + " converge.",
    },
  ]);
  let A = c.a, B = c.b;
  if (c.r === 0 && rand() < 0.5) [A, B] = [B, A];
  return Qcm(
    m(L`\sum u_n`) + " " + A + " et " + m(L`\sum v_n`) + " " + B + ". Que dire de " + m(L`\sum(u_n+v_n)`) + " ?",
    ["Elle diverge", "Elle converge", "On ne peut pas conclure"],
    c.r,
    c.e,
  );
}

const vf = poolVF([
  { q: m(L`u_n\to0`) + " suffit pour que " + m(L`\sum u_n`) + " converge.", t: false, e: m(L`\frac1n\to0`) + " et pourtant la série harmonique diverge." },
  { q: "Si " + m(L`\sum u_n`) + " converge, alors " + m(L`u_n\to0`) + ".", t: true, e: "On a " + m(L`u_n=S_n-S_{n-1}\to S-S=0`) + "." },
  { q: "Une série absolument convergente est convergente.", t: true, e: "Critère de Cauchy avec " + m(L`\left|\sum u_k\right|\le\sum|u_k|`) + "." },
  { q: "Une série convergente est toujours absolument convergente.", t: false, e: m(L`\sum\frac{(-1)^n}{n}`) + " converge sans converger absolument : semi-convergente." },
  { q: "La somme de deux séries divergentes diverge toujours.", t: false, e: m(L`\frac1n-\frac1n=0`) + " : la série somme converge." },
  { q: "Le reste " + m("R_n") + " est défini pour toute série.", t: false, e: "Il n'existe que si la série converge, et alors " + m(L`R_n\to0`) + "." },
  { q: "Si " + m(L`\lambda\neq0`) + ", " + m(L`\sum\lambda u_n`) + " et " + m(L`\sum u_n`) + " ont même nature.", t: true, e: "On factorise la constante non nulle." },
  { q: "Dans " + m(L`\mathbb{C}`) + ", " + m(L`\sum u_n`) + " converge si et seulement si " + m(L`\sum\mathrm{Re}(u_n)`) + " et " + m(L`\sum\mathrm{Im}(u_n)`) + " convergent.", t: true, e: "Parties réelle et imaginaire se traitent séparément." },
  { q: "La série harmonique vérifie le critère de Cauchy.", t: false, e: m(L`\sum_{k=n+1}^{2n}\frac1k\ge n\cdot\frac1{2n}=\frac12`) + " : le critère échoue, donc divergence." },
  { q: "Une série semi-convergente converge, mais la série des valeurs absolues diverge.", t: true, e: "C'est la définition." },
  { q: "Si " + m(L`\sum u_n`) + " converge, alors " + m(L`\sum u_n^2`) + " converge aussi.", t: false, e: m(L`u_n=\frac{(-1)^n}{\sqrt n}`) + " : " + m(L`\sum u_n`) + " converge, " + m(L`\sum u_n^2=\sum\frac1n`) + " diverge." },
]);

export const level: Level = {
  id: "L1",
  name: "Vocabulaire",
  fiche: "Fiche 1",
  icon: "🌱",
  color: "#4caf50",
  gens: [["zero", zero], ["ops", ops], ["vf", vf], ["vf2", vf]],
  piege: m(L`u_n\to0`) + " ne prouve rien : " + m(L`\frac1n\to0`) + " et pourtant " + m(L`\sum\frac1n`) + " diverge.",
  rappel: [
    "Converge si " + m("(S_n)") + " a une limite finie ; le reste " + m(L`R_n=S-S_n`) + " n'existe que si elle converge.",
    m(L`\sum u_n`) + " converge " + m(L`\Rightarrow u_n\to0`) + " (réciproque fausse).",
    "Absolument convergente " + m(L`\Rightarrow`) + " convergente ; semi-convergente : converge sans converger absolument.",
    "Convergente + divergente = divergente ; divergente + divergente : on ne peut rien dire.",
  ],
};
