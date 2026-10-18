// Ondes · niveau 3 : ondes progressives, stationnaires, Doppler, décibels
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolVF } from "../factories";

function velocity(): RawQuestion {
  const w = ri(2, 9) * 20, k = ri(2, 8) * 2;
  return Num(
    `Une onde ${m(`y(x,t)=A\\cos(${w}t-${k}x)`)} (SI) se propage. Quelle est sa célérité ${m("v")} (m/s) ?`,
    Fr(w, k),
    `cos(ωt − kx) se propage vers +x à v = ω/k = ${w}/${k} m/s.`,
  );
}

function stringMode(): RawQuestion {
  const L = pick([1, 2, 3]), n = ri(1, 5), v = pick([100, 120, 150, 200, 240]);
  return Num(
    `Une corde fixée aux deux extrémités, de longueur ${L} m, porte des ondes de célérité ${v} m/s. Quelle est la fréquence (Hz) du mode ${n} ?`,
    Fr(n * v, 2 * L),
    `Nœuds aux extrémités : L = nλ/2, donc f_n = nv/(2L) = ${n}×${v}/${2 * L}.`,
  );
}

function doppler(): RawQuestion {
  const v = 340, vs = pick([34, 68, 85, 170]), f = pick([400, 500, 680, 850, 1000]);
  const approach = ri(0, 1) === 0;
  const ans = approach ? Fr(f * v, v - vs) : Fr(f * v, v + vs);
  return Num(
    `Une source sonore de fréquence ${f} Hz ${approach ? "s'approche" : "s'éloigne"} d'un observateur immobile à ${vs} m/s (célérité du son ${v} m/s). Quelle fréquence (Hz) l'observateur perçoit-il ?`,
    ans,
    `f' = f·v/(v ${approach ? "−" : "+"} v_s) = ${f}×${v}/${approach ? v - vs : v + vs}.`,
  );
}

function decibels(): RawQuestion {
  const j = ri(1, 5);
  const dir = ri(0, 1) === 0;
  return Num(
    `L'intensité sonore est ${dir ? "multipliée" : "divisée"} par ${10 ** j}. De combien de dB le niveau sonore varie-t-il (en valeur absolue) ?`,
    Fr(10 * j),
    `Δ(dB) = 10·log₁₀(I₂/I₁) = 10 × ${j} = ${10 * j} dB.`,
  );
}

function wavelength(): RawQuestion {
  const f = pick([50, 100, 200, 340, 500]), v = pick([340, 1500, 3000]);
  return Num(
    `Une onde de fréquence ${f} Hz se propage à ${v} m/s. Quelle est sa longueur d'onde (m) ?`,
    Fr(v, f),
    `λ = v/f = ${v}/${f} m.`,
  );
}

const concepts = poolVF([
  { q: "Une onde stationnaire transporte de l'énergie d'un bout à l'autre du milieu.", t: false, e: "Pas de propagation nette : moyenne nulle du flux d'énergie." },
  { q: "Dans une onde stationnaire, tous les points oscillent en phase ou en opposition de phase.", t: true, e: "y = A cos(kx)cos(ωt) : variables séparées." },
  { q: "Deux nœuds consécutifs d'une onde stationnaire sont séparés de λ.", t: false, e: "Ils sont séparés de λ/2." },
  { q: "Une onde progressive cos(ωt − kx) se propage dans le sens des x croissants.", t: true, e: "La phase constante ωt − kx = cte ⇒ x = (ω/k)t + cte." },
  { q: "Quand la source s'approche de l'observateur, la fréquence perçue est plus grande.", t: true, e: "f' = f v/(v − v_s) > f." },
  { q: "Multiplier l'intensité sonore par 2 augmente le niveau de 2 dB.", t: false, e: "10·log₁₀(2) ≈ 3 dB." },
  { q: "La célérité d'une onde ne dépend que des propriétés du milieu.", t: true, e: "Pas de la source : v = λf avec f imposée par la source." },
]);

function stationaryBug(): RawQuestion {
  return Bug(
    "Une corde de longueur " + m("L") + " est fixée à ses deux extrémités. On cherche les fréquences propres. Une ligne est fausse.",
    [
      "Les extrémités sont fixes : ce sont des nœuds de déplacement.",
      "La distance entre deux nœuds consécutifs est $\\lambda/2$.",
      "Donc $L=n\\lambda$, avec $n$ entier $\\geq1$.",
      "Alors $f_n=\\dfrac{v}{\\lambda_n}=\\dfrac{nv}{2L}$.",
    ],
    2,
    [
      "Donc $L=n\\lambda/2$, avec $n$ entier $\\geq1$.",
      "Donc $L=(2n+1)\\lambda/4$, avec $n$ entier.",
      "Donc $L=n\\lambda/4$, avec $n$ entier $\\geq1$.",
    ],
    "Deux nœuds consécutifs sont à λ/2 : L contient un nombre entier de demi-longueurs d'onde, L = nλ/2. (Avec L = nλ, la ligne suivante ne donnerait pas f = nv/2L.)",
  );
}

function modeProof(): RawQuestion {
  return Order(
    "Reconstitue l'obtention des fréquences propres d'une corde fixée aux deux bouts.",
    [
      "On cherche des solutions stationnaires $y=f(x)\\cos(\\omega t+\\varphi)$.",
      "L'équation de d'Alembert donne $f''+k^2f=0$ avec $k=\\omega/v$ : $f=A\\sin(kx)+B\\cos(kx)$.",
      "$y(0,t)=0$ impose $B=0$ ; $y(L,t)=0$ impose $\\sin(kL)=0$, donc $k=n\\pi/L$.",
      "Donc $\\omega_n=n\\pi v/L$ et $f_n=\\dfrac{nv}{2L}$ : modes discrets, harmoniques de $f_1$.",
    ],
    ["La condition en $x=L$ est vérifiée pour tout $k$.", "Donc $f_n=nv/L$."],
  );
}

function stringGuided(): RawQuestion {
  const L = pick([1, 2]), v = pick([100, 200, 300]), n = pick([2, 3, 4]);
  return Guided(
    `Une corde de longueur ${L} m, fixée aux deux extrémités, porte des ondes à ${v} m/s. On étudie son mode ${n}.`,
    [
      gq(
        "Quelle condition fixe les longueurs d'onde permises ?",
        ["L = nλ/2", "L = nλ", "L = (2n+1)λ/4", "L = nλ/4"],
        ["Nœud à chaque extrémité : ça donne un nombre entier de fuseaux."],
        "Chaque fuseau mesure λ/2, donc L = nλ/2.",
      ),
      gn(`Quelle est la longueur d'onde du mode ${n} (m) ?`, Fr(2 * L, n), ["λ = 2L/n."], `λ_${n} = ${2 * L}/${n}.`),
      gn("Quelle est la fréquence (Hz) ?", Fr(n * v, 2 * L), ["f = v/λ."], `f = ${v}/(${2 * L}/${n}).`),
      gn(`Combien de nœuds intérieurs (extrémités exclues) ?`, Fr(n - 1), ["Compte les fuseaux, puis retire 1."], `${n} fuseaux ⇒ ${n - 1} nœuds intérieurs.`),
    ],
    "Fixée-fixée : n fuseaux, n − 1 nœuds intérieurs, f_n = n f₁.",
  );
}

export const level: Level = {
  id: "WAV3",
  name: "Propagation & modes",
  fiche: "Ondes",
  icon: "〰️",
  color: "#48cae4",
  gens: [
    ["v", velocity], ["mode", stringMode], ["doppler", doppler], ["dB", decibels], ["lambda", wavelength],
    ["concepts", concepts], ["mode-bug", stationaryBug], ["mode-proof", modeProof], ["mode-guided", stringGuided],
  ],
  piege: "Entre deux nœuds : λ/2 (pas λ). Multiplier l'intensité par 10 ajoute 10 dB (pas ×10).",
  rappel: [
    "cos(ωt − kx) : v = ω/k = λf, vers +x. Stationnaire : y = A cos(kx)cos(ωt).",
    "Corde fixée-fixée : L = nλ/2, f_n = nv/2L, n − 1 nœuds intérieurs.",
    "Doppler (source mobile) : f' = f v/(v ∓ v_s). Niveau sonore L = 10 log₁₀(I/I₀).",
  ],
};
