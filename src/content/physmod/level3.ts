// Physique moderne · niveau 3 : équation de Schrödinger, puits infini
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import { dec, L, m } from "../../core/tex";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, gn, gq, poolVF } from "../factories";

function energyLevel(): RawQuestion {
  const n = ri(2, 6);
  const E1 = pick([Fr(1), Fr(2), Fr(3, 2), Fr(5, 4)]);
  return Num(
    `Dans un puits infini, l'énergie du niveau fondamental est ${m("E_1")} = ${dec(E1)} eV. Quelle est l'énergie (en eV) du niveau n = ${n} ?`,
    Fr(E1.n * n * n, E1.d),
    `E_n = n²E₁ = ${n * n} × ${dec(E1)} = ${dec(Fr(E1.n * n * n, E1.d))} eV.`,
  );
}

function transition(): RawQuestion {
  let n = ri(1, 4), mm = ri(2, 6);
  if (mm <= n) [n, mm] = [mm, n];
  if (mm === n) mm = n + 1;
  const E1 = pick([Fr(1), Fr(2), Fr(5, 4)]);
  const d = Fr(E1.n * (mm * mm - n * n), E1.d);
  return Num(
    `Dans un puits infini avec ${m("E_1")} = ${dec(E1)} eV, un électron passe du niveau n = ${mm} au niveau n = ${n}. Quelle énergie (en eV) est émise ?`,
    d,
    `ΔE = (${mm}² − ${n}²)E₁ = ${mm * mm - n * n} × ${dec(E1)} = ${dec(d)} eV.`,
  );
}

function normConst(): RawQuestion {
  const a = ri(2, 8);
  const sin = ri(0, 1) === 1;
  return Num(
    `Une particule a pour fonction d'onde ${sin ? m(L`\psi(x)=A\sin\left(\frac{n\pi x}{a}\right)`) : m("\\psi(x)=A")} sur ${m("[0,a]")} (nulle ailleurs) avec a = ${a} m. Que vaut ${m("A^2")} (en m⁻¹) ?`,
    sin ? Fr(2, a) : Fr(1, a),
    sin
      ? `∫₀^a sin²(nπx/a)dx = a/2, donc A²·a/2 = 1 et A² = 2/a = 2/${a}.`
      : `∫₀^a A²dx = A²a = 1 ⇒ A² = 1/a = 1/${a}.`,
  );
}

function probability(): RawQuestion {
  const n = ri(2, 6);
  const j = ri(1, n);
  return Num(
    `Une particule est dans l'état n = ${n} d'un puits infini de largeur ${m("a")}. Quelle est la probabilité de la trouver dans ${m(L`\left[0,\frac{${j}a}{${2 * n}}\right]`)} ?`,
    Fr(j, 2 * n),
    `P = x₀/a − sin(2nπx₀/a)/(2nπ) avec x₀ = ${j}a/${2 * n} : le sinus vaut sin(${j}π) = 0, donc P = ${j}/${2 * n}.`,
  );
}

function nodes(): RawQuestion {
  const n = ri(2, 9);
  return Num(
    `Combien de nœuds (zéros intérieurs, extrémités exclues) a la fonction d'onde du niveau n = ${n} du puits infini ?`,
    Fr(n - 1),
    `ψ_n ∝ sin(nπx/a) s'annule en x = ka/n pour k = 1,…,n−1 : ${n - 1} nœuds.`,
  );
}

const tunnelEtc = poolVF([
  { q: "Dans un puits infini, E_n est proportionnelle à n.", t: false, e: "E_n ∝ n² : les niveaux s'écartent de plus en plus." },
  { q: "L'énergie du fondamental du puits infini est nulle.", t: false, e: "n = 0 donnerait ψ ≡ 0 : le plus bas niveau est n = 1, d'énergie E₁ > 0." },
  { q: "Une particule d'énergie inférieure à la hauteur d'une barrière finie a une probabilité non nulle de la traverser.", t: true, e: "Effet tunnel : ψ décroît exponentiellement dans la barrière mais ne s'annule pas." },
  { q: "L'équation de Schrödinger stationnaire est Ĥψ = Eψ.", t: true, e: "Problème aux valeurs propres : E est valeur propre de l'hamiltonien." },
  { q: "Dans le puits infini, ψ doit être continue aux parois mais sa dérivée peut être discontinue.", t: true, e: "À cause du potentiel infini : ψ(0)=ψ(a)=0, mais ψ' saute." },
  { q: "Plus le puits est large, plus l'écart entre niveaux est grand.", t: false, e: "E_n = n²π²ℏ²/(2ma²) ∝ 1/a² : un puits large a des niveaux serrés (limite classique)." },
  { q: "La probabilité de présence dans le puits infini est uniforme.", t: false, e: "|ψ_n|² = (2/a) sin²(nπx/a) oscille ; l'uniforme n'apparaît qu'à n grand (moyenne)." },
]);

function squareBug(): RawQuestion {
  return Bug(
    "On cherche les énergies permises d'une particule dans un puits infini de largeur " + m("a") + ". Une ligne est fausse.",
    [
      "Dans le puits : $-\\dfrac{\\hbar^2}{2m}\\psi''=E\\psi$, soit $\\psi=A\\sin(kx)+B\\cos(kx)$ avec $k^2=2mE/\\hbar^2$.",
      "$\\psi(0)=0$ impose $B=0$.",
      "$\\psi(a)=0$ impose $\\sin(ka)=0$, donc $k=n\\pi/a$.",
      "Alors $E_n=\\dfrac{n\\hbar^2\\pi}{2ma}$ pour $n\\geq1$.",
    ],
    3,
    [
      "Alors $E_n=\\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}$ pour $n\\geq1$.",
      "Alors $E_n=\\dfrac{n\\pi^2\\hbar^2}{2ma^2}$ pour $n\\geq0$.",
      "Alors $E_n=\\dfrac{n^2\\pi\\hbar}{2ma}$ pour $n\\geq1$.",
    ],
    "E = ℏ²k²/2m avec k = nπ/a : on élève k au carré, d'où n² et a². La quantification vient des conditions aux limites.",
  );
}

function quantProof(): RawQuestion {
  return Order(
    "Reconstitue la démonstration de la quantification de l'énergie dans le puits infini.",
    [
      "Dans le puits, $\\psi''=-k^2\\psi$ avec $k^2=2mE/\\hbar^2$ : $\\psi=A\\sin(kx)+B\\cos(kx)$.",
      "La condition $\\psi(0)=0$ élimine le cosinus : $B=0$.",
      "La condition $\\psi(a)=0$ avec $A\\neq0$ donne $\\sin(ka)=0$.",
      "Donc $k=n\\pi/a$ et $E_n=\\dfrac{\\hbar^2k^2}{2m}=\\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}$ : l'énergie est quantifiée.",
    ],
    ["La condition $\\psi(a)=0$ est vérifiée pour toute valeur de $k$.", "Donc l'énergie peut prendre toutes les valeurs positives."],
  );
}

function wellGuided(): RawQuestion {
  const E1 = pick([Fr(1), Fr(2), Fr(5)]);
  const lam = Fr(1240 * E1.d, 8 * E1.n);
  return Guided(
    `Un électron dans un puits infini a pour énergie fondamentale ${m("E_1")} = ${dec(E1)} eV. Il passe du niveau 3 au niveau 1 en émettant un photon (hc ≈ 1240 eV·nm). Quelle est la longueur d'onde du photon ?`,
    [
      gq(
        "Comment l'énergie du niveau n s'exprime-t-elle ?",
        ["E_n = n²E₁", "E_n = nE₁", "E_n = E₁/n²", "E_n = (n+1)E₁"],
        ["Les conditions aux limites donnent k = nπ/a et E = ℏ²k²/2m."],
        "E_n ∝ n².",
      ),
      gn(
        "Quelle est l'énergie du niveau 3 (en eV) ?",
        Fr(9 * E1.n, E1.d),
        ["3² = 9."],
        `E₃ = 9E₁ = ${dec(Fr(9 * E1.n, E1.d))} eV.`,
      ),
      gn(
        "Quelle énergie (en eV) le photon emporte-t-il ?",
        Fr(8 * E1.n, E1.d),
        ["ΔE = E₃ − E₁."],
        `ΔE = 8E₁ = ${dec(Fr(8 * E1.n, E1.d))} eV.`,
      ),
      gn(
        "Quelle est la longueur d'onde du photon (en nm) ?",
        lam,
        ["λ = hc/ΔE."],
        `λ = 1240/${dec(Fr(8 * E1.n, E1.d))} = ${dec(lam)} nm.`,
      ),
    ],
    "Chaîne complète : quantification → transition → photon. Typique d'un DS de physique moderne.",
  );
}

export const level: Level = {
  id: "PHM3",
  name: "Schrödinger & puits infini",
  fiche: "Chapitre 3",
  icon: "🧱",
  color: "#6a4c93",
  gens: [
    ["En", energyLevel], ["dE", transition], ["norm", normConst], ["proba", probability], ["nodes", nodes],
    ["concepts", tunnelEtc], ["En-bug", squareBug], ["quant-proof", quantProof], ["well-guided", wellGuided],
  ],
  piege: "E_n ∝ n² (et pas n). Normalisation : A² (et pas A) ; ψ(0)=ψ(a)=0 quantifie.",
  rappel: [
    "Hψ = Eψ ; puits infini : ψ_n = √(2/a) sin(nπx/a), E_n = n²π²ℏ²/(2ma²) = n²E₁, n ≥ 1.",
    "n − 1 nœuds intérieurs ; ΔE(n→m) = (m²−n²)E₁.",
    "Barrière finie : effet tunnel, ψ décroît exponentiellement mais n'est pas nulle.",
  ],
};
