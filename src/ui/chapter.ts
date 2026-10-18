import { CHAPTERS, levelAt } from "../content";
import { isUnlocked, starsOf } from "../game/progress";
import { qs, qsa, safe, typeset } from "./dom";
import type { Nav } from "./nav";

export function renderChapter(root: HTMLElement, ci: number, nav: Nav): void {
  const ch = CHAPTERS[ci];
  if (!ch) throw new Error("chapitre inconnu");
  let heroAt = 0;
  ch.levels.forEach((_, i) => {
    if (isUnlocked(ci, i)) heroAt = i;
  });

  root.innerHTML = `
   <div class="top"><button class="btn ghost" id="back" style="padding:8px">←</button>
     <h1 style="font-size:13px;flex:1">${ch.icon} ${safe(ch.name).toUpperCase()}</h1></div>
   <p class="small" style="margin:0 0 14px;color:#b9b0d6">${safe(ch.subject)} — ${safe(ch.blurb)}</p>
   <div class="modes"><button class="btn alt" id="bEndless" style="grid-column:1/3">♾️ MODE INFINI — ${safe(ch.name).toUpperCase()}</button></div>
   <div class="map">${ch.levels.map((lv, i) => {
     const ok = isUnlocked(ci, i);
     const s = starsOf(ci, i);
     return `<div class="node ${i % 2 ? "r" : ""} ${ok ? "" : "locked"}" style="--c:${lv.color}">
       <button class="lvlbtn" data-li="${i}" ${ok ? "" : "disabled"}>
         ${i === heroAt ? `<span class="hero">🧙‍♀️</span>` : ""}
         <span class="ic">${ok ? lv.icon : "🔒"}</span>
         <span class="nm">${i + 1}. ${safe(lv.name)}<small>${safe(lv.fiche)}</small></span>
         <span class="st">${"★".repeat(s)}${"☆".repeat(3 - s)}</span></button>
       <button class="recap" data-r="${i}" title="Rappel de cours">📖</button></div>`;
   }).join("")}</div>`;

  qs("#back", root).onclick = () => nav.home();
  qs("#bEndless", root).onclick = () => nav.endless(ci);
  qsa<HTMLButtonElement>(".lvlbtn:not([disabled])", root).forEach((b) => (b.onclick = () => nav.mission(ci, Number(b.dataset.li))));
  qsa<HTMLButtonElement>(".recap", root).forEach((b) => (b.onclick = () => showRecap(ci, Number(b.dataset.r))));
}

/** Fenêtre « rappel de cours » d'un niveau. */
export function showRecap(ci: number, li: number): void {
  const lv = levelAt(ci, li);
  const o = document.createElement("div");
  o.className = "overlay";
  o.innerHTML = `<div class="card"><h2>${lv.icon} ${safe(lv.fiche).toUpperCase()} · ${safe(lv.name).toUpperCase()}</h2>
    <ul>${lv.rappel.map((r) => `<li>${safe(r)}</li>`).join("")}</ul>
    <div class="trap">⚠️ <b>Piège :</b> ${safe(lv.piege)}</div>
    <p style="text-align:right;margin-bottom:0"><button class="btn" id="cl">OK</button></p></div>`;
  document.body.appendChild(o);
  typeset(o);
  o.onclick = (e) => {
    const t = e.target as HTMLElement;
    if (t === o || t.id === "cl") o.remove();
  };
}
