import { LEVELS } from "../content";
import { ftex } from "../core/fraction";
import { m } from "../core/tex";
import type { Outcome, Session } from "../game/session";
import { getState } from "../game/store";
import { qs, qsa, safe, typeset } from "./dom";
import { floatText, sfx } from "./fx";
import type { Nav } from "./nav";

let timer: ReturnType<typeof setTimeout> | undefined;
export function stopTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}

const fmtMult = (x: number): string => x.toFixed(2).replace(/\.?0+$/, "");

export function renderPlay(root: HTMLElement, s: Session, nav: Nav): void {
  stopTimer();
  let locked = false;
  const q = s.current;
  const lv = LEVELS[q.li];
  if (!lv) throw new Error("niveau inconnu");
  const timed = getState().timed;
  const dots =
    s.mode === "endless"
      ? ""
      : `<div class="dots">${s.qs.map((_, k) => `<i class="${k < s.i ? "d" : k === s.i ? "c" : ""}"></i>`).join("")}</div>`;
  const hearts = s.mode === "quest" ? "∞" : "❤️".repeat(s.hearts) + "🖤".repeat(Math.max(0, 3 - s.hearts));

  root.innerHTML = `
   <div class="hud"><button class="btn ghost" id="quit" style="padding:8px">✕</button>
     <span class="hearts">${hearts}</span>
     <span class="combo ${s.combo >= 2 ? "" : "off"}">🔥×${fmtMult(s.multiplier)}</span>
     <span class="px" style="font-size:10px">+${s.gain} XP</span></div>
   ${dots}
   ${timed ? `<div class="tbar"><i id="tb"></i></div>` : ""}
   <div class="card qcard" style="--c:${lv.color}">
     ${q.boss ? `<span class="boss">👹 BOSS ×2</span>` : ""}
     <div class="px" style="font-size:9px;color:var(--muted)">${lv.icon} ${safe(lv.name).toUpperCase()}${s.mode === "endless" ? ` · série ${s.ok}` : ""}</div>
     <div class="q-text">${safe(q.q)}</div>
     <div id="ans">${
       q.k === "qcm"
         ? q.o.map((o, i) => `<button class="choice" data-i="${i}">${safe(o)}</button>`).join("")
         : `<input class="ans" id="inp" inputmode="decimal" placeholder="nombre, fraction a/b ou décimal" autocomplete="off"><button class="btn" id="ok">VALIDER</button>`
     }</div>
     <div id="fb"></div></div>`;
  typeset(root);

  qs("#quit", root).onclick = () => {
    if (confirm("Quitter la partie ?")) nav.home();
  };

  const submit = (val: number | string | null, timeout = false): void => {
    if (locked) return;
    locked = true;
    stopTimer();
    const out = s.submit(val, timeout);
    showFeedback(root, s, out, val, nav);
  };

  if (q.k === "qcm") {
    qsa<HTMLButtonElement>(".choice", root).forEach((b) => (b.onclick = () => submit(Number(b.dataset.i))));
  } else {
    const inp = qs<HTMLInputElement>("#inp", root);
    qs("#ok", root).onclick = () => submit(inp.value);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit(inp.value);
    });
    inp.focus();
  }

  if (timed) {
    const sec = q.k === "num" ? 45 : 25;
    const bar = qs("#tb", root);
    bar.style.transition = `transform ${sec}s linear`;
    requestAnimationFrame(() => requestAnimationFrame(() => (bar.style.transform = "scaleX(0)")));
    timer = setTimeout(() => submit(null, true), sec * 1000);
  }
}

function showFeedback(root: HTMLElement, s: Session, out: Outcome, val: number | string | null, nav: Nav): void {
  const q = s.current;
  const lv = LEVELS[q.li];
  if (out.ok) {
    sfx.ok();
    floatText("+" + out.gain);
  } else {
    sfx.ko();
    qs(".qcard", root).classList.add("shake");
  }
  if (q.k === "qcm") {
    qsa<HTMLButtonElement>(".choice", root).forEach((c, i) => {
      c.disabled = true;
      if (i === q.a) c.classList.add("ok");
      else if (i === val) c.classList.add("ko");
    });
  } else {
    qs<HTMLInputElement>("#inp", root).disabled = true;
    qs("#ok", root).style.display = "none";
  }
  const right = out.right ? `<br><b>Réponse :</b> ${m(ftex(out.right))}` : "";
  const verdict = out.ok ? "Bravo !" : out.timeout ? "Temps écoulé !" : "Raté.";
  qs("#fb", root).innerHTML = `
    <div class="fb ${out.ok ? "ok" : "ko"}"><b>${verdict}</b>${right}<br>${safe(q.exp)}
      ${out.ok || !lv ? "" : `<div class="trap">⚠️ <b>Piège :</b> ${safe(lv.piege)}</div>`}</div>
    <div style="margin-top:12px"><button class="btn alt" id="next">${out.last ? "TERMINER" : "SUIVANT →"}</button></div>`;
  typeset(qs("#fb", root));
  const next = qs<HTMLButtonElement>("#next", root);
  next.focus();
  next.onclick = () => {
    if (out.last) nav.finish(s, !out.over);
    else {
      s.advance();
      nav.play(s);
    }
  };
}
