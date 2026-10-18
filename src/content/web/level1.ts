// Informatique 4 · niveau 1 : HTML et CSS
import { Fr } from "../../core/fraction";
import { pick, ri } from "../../core/rng";
import type { Level, RawQuestion } from "../../types";
import { Bug, Guided, Num, Order, Qcm, gn, gq, poolQcm, poolVF } from "../factories";
import { code } from "../algo/util";

const SEL_PARTS = [
  ["p"], ["div p"], [".menu"], ["#top"], ["ul li"], ["ul.menu li"], ["#top .menu"], ["#top .menu li"],
  ["div#top p.intro"], ["body div .a .b"], ["a:hover"], ["li.on a"], ["#x #y"], ["h1"], [".a.b"],
] as const;

/** Spécificité (id, classes/pseudo-classes, balises) → 100·i + 10·c + t. */
export const specificity = (sel: string): number => {
  const ids = (sel.match(/#[\w-]+/g) ?? []).length;
  const cls = (sel.match(/\.[\w-]+|:[\w-]+/g) ?? []).length;
  const tags = (sel.replace(/#[\w-]+|\.[\w-]+|:[\w-]+/g, " ").match(/[a-z][a-z0-9]*/gi) ?? []).length;
  return 100 * ids + 10 * cls + tags;
};

function specQ(): RawQuestion {
  const s = pick(SEL_PARTS)[0];
  const v = specificity(s);
  return Num(
    `Spécificité du sélecteur ${code(s)} écrite ${code("ids·100 + (classes + pseudo-classes)·10 + balises")} ?`,
    Fr(v),
    `Compte les # (×100), les .classe et :pseudo (×10), les balises (×1) : ${v}. En cas d'égalité, la règle écrite en dernier gagne.`,
  );
}

function winner(): RawQuestion {
  const pairs: Array<[string, string]> = [["#top p", ".menu p"], ["div p.intro", "p"], ["ul li", ".a"], ["#x", "div div div div"], [".a.b", "#id"]];
  const [a, b] = pick(pairs);
  const win = specificity(a) > specificity(b) ? a : b;
  const lose = win === a ? b : a;
  return poolQcmOne(
    `Deux règles ciblent le même élément : ${code(a)} et ${code(b)}, avec des couleurs différentes. Quelle règle l'emporte (la moins spécifique est écrite en dernier) ?`,
    [code(win), code(lose), "Les deux s'appliquent à parts égales", "Celle écrite en dernier, toujours"],
    `${code(a)} → ${specificity(a)}, ${code(b)} → ${specificity(b)} : ${code(win)} l'emporte, l'ordre ne sert qu'en cas d'égalité.`,
  );
}
function poolQcmOne(q: string, opts: string[], exp: string): RawQuestion {
  return Qcm(q, opts, 0, exp, true);
}

function boxModel(): RawQuestion {
  const w = ri(10, 30) * 10, p = ri(1, 4) * 5, b = ri(1, 3) * 2, mg = ri(1, 4) * 5;
  const border = pick(["content-box", "border-box"] as const);
  const withMargin = ri(0, 1) === 1;
  const box = border === "content-box" ? w + 2 * p + 2 * b : w;
  const total = box + (withMargin ? 2 * mg : 0);
  return Num(
    `Un bloc a ${code(`width: ${w}px; padding: ${p}px; border: ${b}px solid; margin: ${mg}px; box-sizing: ${border};`)} Quelle est la largeur occupée (px) ${withMargin ? "marges comprises" : "bordures comprises, marges exclues"} ?`,
    Fr(total),
    border === "content-box"
      ? `content-box : width ne compte que le contenu. ${w} + 2×${p} (padding) + 2×${b} (bordure)${withMargin ? ` + 2×${mg} (marge)` : ""} = ${total}.`
      : `border-box : width inclut padding et bordure : ${w}${withMargin ? ` + 2×${mg} (marge)` : ""} = ${total}.`,
  );
}

const html = poolQcm([
  { q: "Quelle balise crée un lien hypertexte ?", r: "<a href=\"…\">", w: ["<link href=\"…\">", "<href>", "<url src=\"…\">"], e: "<a> avec l'attribut href." },
  { q: "Dans un tableau HTML, quelle balise définit une ligne ?", r: "<tr>", w: ["<td>", "<th>", "<row>"], e: "<tr> = ligne ; <td> = cellule ; <th> = cellule d'en-tête." },
  { q: "Comment fusionner deux colonnes pour une cellule ?", r: "colspan=\"2\"", w: ["rowspan=\"2\"", "merge=\"2\"", "span=\"2\""], e: "colspan = colonnes, rowspan = lignes." },
  { q: "Quelle balise sert à une liste à puces ?", r: "<ul> avec des <li>", w: ["<ol> avec des <li>", "<list> avec des <item>", "<ul> avec des <td>"], e: "<ul> non ordonnée, <ol> ordonnée (numérotée)." },
  { q: "Quel attribut fournit un texte alternatif pour une image ?", r: "alt", w: ["title", "src", "caption"], e: "alt : lu si l'image ne charge pas et par les lecteurs d'écran." },
  { q: "Quelle méthode d'un formulaire place les données dans l'URL ?", r: "GET", w: ["POST", "PUT", "FORM"], e: "GET : paramètres visibles dans l'URL ; POST : dans le corps de la requête." },
  { q: "Quelle déclaration indique du HTML5 ?", r: "<!DOCTYPE html>", w: ["<html5>", "<?html version=\"5\"?>", "<meta html=\"5\">"], e: "Première ligne d'un document HTML5." },
]);

const css = poolVF([
  { q: "En CSS, un sélecteur d'identifiant s'écrit avec « # » et un sélecteur de classe avec « . ».", t: true, e: "#id, .classe." },
  { q: "Le sélecteur « div > p » cible tous les paragraphes descendants d'un div, quelle que soit la profondeur.", t: false, e: "« > » = enfants directs seulement ; « div p » = tous les descendants." },
  { q: "Un id peut apparaître plusieurs fois dans une même page HTML.", t: false, e: "Un id est unique ; une classe peut être partagée." },
  { q: "« margin » est l'espace à l'extérieur de la bordure et « padding » l'espace à l'intérieur.", t: true, e: "De l'intérieur vers l'extérieur : contenu, padding, bordure, marge." },
  { q: "« visibility: hidden » retire l'élément du flux : il ne prend plus de place.", t: false, e: "Il reste invisible mais garde sa place ; « display: none » le retire du flux." },
  { q: "Une propriété déclarée avec « !important » l'emporte sur la spécificité ordinaire.", t: true, e: "À utiliser avec parcimonie." },
]);

function tableBug(): RawQuestion {
  return Bug(
    "Un tableau HTML à deux lignes et deux colonnes. Une ligne est fausse.",
    [
      "<table>",
      "  <tr><th>Nom</th><th>Âge</th></tr>",
      "  <td><tr>Léa</tr><tr>20</tr></td>",
      "</table>",
    ],
    2,
    [
      "  <tr><td>Léa</td><td>20</td></tr>",
      "  <tr><tr>Léa</tr><tr>20</tr></tr>",
      "  <td>Léa</td><td>20</td>",
    ],
    "Les rangées sont des <tr> qui CONTIENNENT des <td> : tr > td, jamais l'inverse.",
  );
}

function cssBug(): RawQuestion {
  return Bug(
    "On veut mettre en rouge le texte de tous les éléments de classe `alerte`. Une ligne est fausse.",
    [
      "<style>",
      "  #alerte { color: red; }",
      "</style>",
      "<p class=\"alerte\">Attention</p>",
    ],
    1,
    [
      "  .alerte { color: red; }",
      "  alerte { color: red; }",
      "  #alerte { color: #ff0000; }",
    ],
    "Une classe se sélectionne avec « . », pas « # » (qui cible un id).",
  );
}

function pageOrder(): RawQuestion {
  return Order(
    "Remets dans l'ordre la structure minimale d'une page HTML5.",
    [
      "<!DOCTYPE html>",
      "<html lang=\"fr\"> ouvre le document.",
      "<head> contient <meta charset> et <title>.",
      "<body> contient le contenu visible.",
    ],
    ["<body> avant <head> pour charger vite.", "<title> dans <body>."],
    "doctype → html → head → body.",
  );
}

function boxGuided(): RawQuestion {
  const w = ri(10, 30) * 10, p = ri(1, 4) * 5, b = ri(1, 3) * 2;
  return Guided(
    `Un bloc a ${code(`width: ${w}px; padding: ${p}px; border: ${b}px solid;`)} en ${code("box-sizing: content-box")}. On cherche sa largeur totale visible.`,
    [
      gq("À quoi correspond width en content-box ?", ["Au contenu seul", "Contenu + padding", "Contenu + padding + bordure", "Contenu + marges"], ["box-sizing change ce que width mesure."], "content-box : width = largeur du contenu."),
      gn("Largeur du padding (gauche + droite) ?", Fr(2 * p), ["Deux côtés."], `Deux côtés : 2 × ${p}.`),
      gn("Largeur des bordures (gauche + droite) ?", Fr(2 * b), ["Deux côtés."], `Deux côtés : 2 × ${b}.`),
      gn("Largeur totale visible (px) ?", Fr(w + 2 * p + 2 * b), ["Additionne contenu, padding et bordures."], `${w} + ${2 * p} + ${2 * b}.`),
    ],
    "Avec border-box (souvent activé globalement), width inclut déjà padding et bordure.",
  );
}

export const level: Level = {
  id: "WEB1",
  name: "HTML & CSS",
  fiche: "TD1-TD3",
  icon: "🧱",
  color: "#ff9f1c",
  gens: [
    ["spec", specQ], ["winner", winner], ["box", boxModel], ["html", html], ["css", css],
    ["table-bug", tableBug], ["css-bug", cssBug], ["page-order", pageOrder], ["box-guided", boxGuided],
  ],
  piege: "tr contient des td (pas l'inverse). Classe = « . », id = « # ». « > » = enfants directs.",
  rappel: [
    "Document : doctype, html, head (meta, title), body. Tableau : table > tr > td/th ; colspan/rowspan.",
    "CSS : #id, .classe, balise ; spécificité id > classe > balise ; modèle de boîte contenu/padding/bordure/marge.",
    "Formulaire : action, method (GET dans l'URL, POST dans le corps).",
  ],
};
