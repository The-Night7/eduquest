import { wrapFracs } from "../core/tex";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

/** Rend les $…$ présents dans `el` avec KaTeX. */
export function typeset(el: HTMLElement): void {
  renderMathInElement(el, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
  });
}

/** Sélecteur typé qui échoue bruyamment si l'élément manque. */
export function qs<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Élément introuvable : ${sel}`);
  return el;
}
export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

/** Les énoncés contiennent du LaTeX avec des « < » : on les échappe avant innerHTML. */
export const safe = (s: string): string =>
  wrapFracs(s)
    .replace(/</g, "&lt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
