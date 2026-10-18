import { LEVELS } from "../content";
import { currentStreak, isUnlocked, playerLevel, questDoneToday, starsOf, XP_PER_LEVEL } from "../game/progress";
import { getState, reset, save } from "../game/store";
import { qs, qsa, safe, typeset } from "./dom";
import { sfx } from "./fx";
import type { Nav } from "./nav";
import { stopTimer } from "./play";

export function renderHome(root: HTMLElement, nav: Nav): void {
  stopTimer();
  const st = getState();
  const into = st.xp % XP_PER_LEVEL;
  const done = questDoneToday();
  const total = LEVELS.length * 3;
  const got = LEVELS.reduce((s, _, i) => s + starsOf(i), 0);
  let heroAt = 0;
  LEVELS.forEach((_, i) => {
    if (isUnlocked(i)) heroAt = i;
  });

  root.innerHTML = `
   <div class="top"><h1>QUEST<br>SÉRIES</h1>
     <div><button class="tog ${st.timed ? "on" : ""}" id="tTimed">⚡ ÉCLAIR</button>
          <button class="tog ${st.sound ? "on" : ""}" id="tSound">${st.sound ? "🔊" : "🔇"}</button></div></div>
   <div class="card"><h2>TA PROGRESSION</h2>
     <div class="lvl px"><span>Niveau ${playerLevel(st.xp)}</span><span>${into} / ${XP_PER_LEVEL} XP</span></div>
     <div class="bar"><i style="width:${(into / XP_PER_LEVEL) * 100}%"></i></div>
     <div class="stats">
       <div class="stat"><b>🔥 ${currentStreak()}</b><span>jours de suite</span></div>
       <div class="stat"><b>${st.xp}</b><span>XP total</span></div>
       <div class="stat"><b>${got}/${total}</b><span>étoiles</span></div></div></div>
   <div class="modes">
     <button class="btn gold" id="bQuest" ${done ? "disabled" : ""}>${done ? "✅ QUÊTE FAITE" : "📅 QUÊTE DU JOUR<br>+50 XP"}</button>
     <button class="btn alt" id="bEndless">♾️ MODE INFINI<br>record : ${st.best}</button></div>
   <div class="map">${LEVELS.map((lv, i) => {
     const ok = isUnlocked(i);
     const s = starsOf(i);
     return `<div class="node ${i % 2 ? "r" : ""} ${ok ? "" : "locked"}" style="--c:${lv.color}">
       <button class="lvlbtn" data-li="${i}" ${ok ? "" : "disabled"}>
         ${i === heroAt ? `<span class="hero">🧙‍♀️</span>` : ""}
         <span class="ic">${ok ? lv.icon : "🔒"}</span>
         <span class="nm">${i + 1}. ${safe(lv.name)}<small>${lv.fiche}</small></span>
         <span class="st">${"★".repeat(s)}${"☆".repeat(3 - s)}</span></button>
       <button class="recap" data-r="${i}" title="Rappel de cours">📖</button></div>`;
   }).join("")}</div>
   <p style="text-align:center"><a class="reset" id="reset">Réinitialiser ma progression</a></p>`;

  qsa<HTMLButtonElement>(".lvlbtn:not([disabled])", root).forEach((b) => (b.onclick = () => nav.mission(Number(b.dataset.li))));
  qsa<HTMLButtonElement>(".recap", root).forEach((b) => (b.onclick = () => showRecap(Number(b.dataset.r))));
  qs("#bQuest", root).onclick = () => nav.quest();
  qs("#bEndless", root).onclick = () => nav.endless();
  qs("#tSound", root).onclick = () => {
    st.sound = !st.sound;
    save();
    nav.home();
    sfx.ok();
  };
  qs("#tTimed", root).onclick = () => {
    st.timed = !st.timed;
    save();
    nav.home();
  };
  qs("#reset", root).onclick = () => {
    if (confirm("Tout effacer ?")) {
      reset();
      nav.home();
    }
  };
}

/** Fenêtre « rappel de cours » d'un niveau. */
export function showRecap(i: number): void {
  const lv = LEVELS[i];
  if (!lv) return;
  const o = document.createElement("div");
  o.className = "overlay";
  o.innerHTML = `<div class="card"><h2>${lv.icon} ${lv.fiche.toUpperCase()} · ${safe(lv.name).toUpperCase()}</h2>
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
