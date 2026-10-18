import { CHAPTERS } from "../content";
import {
  calibration, chapterStars, currentStreak, playerLevel, questDoneToday, XP_PER_LEVEL,
} from "../game/progress";
import { getState, reset, save } from "../game/store";
import { qs, qsa, safe } from "./dom";
import { sfx } from "./fx";
import type { Nav } from "./nav";
import { stopTimer } from "./play";

const pct = (x: number | null): string => (x === null ? "—" : `${Math.round(x * 100)} %`);

export function renderHome(root: HTMLElement, nav: Nav): void {
  stopTimer();
  const st = getState();
  const into = st.xp % XP_PER_LEVEL;
  const done = questDoneToday();
  const c3 = calibration(3);
  const c1 = calibration(1);
  const tot = CHAPTERS.reduce((a, _, ci) => ({ got: a.got + chapterStars(ci).got, total: a.total + chapterStars(ci).total }), { got: 0, total: 0 });

  root.innerHTML = `
   <div class="top"><h1>EDU<br>QUEST</h1>
     <div><button class="tog ${st.timed ? "on" : ""}" id="tTimed">⚡ ÉCLAIR</button>
          <button class="tog ${st.sound ? "on" : ""}" id="tSound">${st.sound ? "🔊" : "🔇"}</button></div></div>
   <div class="card"><h2>TA PROGRESSION</h2>
     <div class="lvl px"><span>Niveau ${playerLevel(st.xp)}</span><span>${into} / ${XP_PER_LEVEL} XP</span></div>
     <div class="bar"><i style="width:${(into / XP_PER_LEVEL) * 100}%"></i></div>
     <div class="stats">
       <div class="stat"><b>🔥 ${currentStreak()}</b><span>jours de suite</span></div>
       <div class="stat"><b>${st.xp}</b><span>XP total</span></div>
       <div class="stat"><b>${tot.got}/${tot.total}</b><span>étoiles</span></div></div>
     ${c3 !== null || c1 !== null ? `<p class="small" style="margin:10px 0 0">🎯 Calibration — réussite quand tu étais certain·e : <b>${pct(c3)}</b> · quand tu devinais : <b>${pct(c1)}</b></p>` : ""}</div>
   <div class="modes">
     <button class="btn gold" id="bQuest" ${done ? "disabled" : ""}>${done ? "✅ QUÊTE FAITE" : "📅 QUÊTE DU JOUR<br>+50 XP"}</button>
     <button class="btn alt" id="bEndless">♾️ MODE INFINI<br>record : ${st.best}</button></div>
   <h2 class="px sec">MATIÈRES</h2>
   <div class="chapters">${CHAPTERS.map((ch, ci) => {
     const s = chapterStars(ci);
     return `<button class="chap" data-ci="${ci}" style="--c:${ch.color}">
       <span class="ic">${ch.icon}</span>
       <span class="nm">${safe(ch.name)}<small>${safe(ch.subject)}</small><small>${safe(ch.blurb)}</small></span>
       <span class="st">${s.got}/${s.total} ★</span></button>`;
   }).join("")}</div>
   <p style="text-align:center"><a class="reset" id="reset">Réinitialiser ma progression</a></p>`;

  qsa<HTMLButtonElement>(".chap", root).forEach((b) => (b.onclick = () => nav.chapter(Number(b.dataset.ci))));
  qs("#bQuest", root).onclick = () => nav.quest();
  qs("#bEndless", root).onclick = () => nav.endless(-1);
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
