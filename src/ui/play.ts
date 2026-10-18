import { levelAt } from "../content";
import { ftex } from "../core/fraction";
import { m } from "../core/tex";
import type { Outcome, Session } from "../game/session";
import { getState } from "../game/store";
import type { Conf, Question } from "../types";
import { qs, qsa, safe, typeset } from "./dom";
import { floatText, sfx } from "./fx";
import { mountBug, mountGuided, mountOrder, type Mounted } from "./kinds";
import type { Nav } from "./nav";

let timer: ReturnType<typeof setTimeout> | undefined;
export function stopTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}

const fmtMult = (x: number): string => x.toFixed(2).replace(/\.?0+$/, "");
const CONF_LABEL: Record<Conf, string> = { 1: "🎲 Au hasard", 2: "🤔 Plutôt sûr·e", 3: "😎 Certain·e" };
const KIND_LABEL: Record<Question["k"], string> = {
  qcm: "", num: "", bug: "🐞 TROUVE L'ERREUR", order: "🧩 RECONSTITUE LA PREUVE", guided: "🧠 PROBLÈME GUIDÉ",
};

export function renderPlay(root: HTMLElement, s: Session, nav: Nav): void {
  stopTimer();
  let locked = false;
  let conf: Conf | null = null;
  let mounted: Mounted | null = null;
  const q = s.current;
  const lv = levelAt(q.ci, q.li);
  const timed = getState().timed && (q.k === "qcm" || q.k === "num");
  const dots =
    s.mode === "endless"
      ? ""
      : `<div class="dots">${s.qs.map((_, k) => `<i class="${k < s.i ? "d" : k === s.i ? "c" : ""}"></i>`).join("")}</div>`;
  const hearts = s.mode === "quest" ? "∞" : "❤️".repeat(Math.max(0, s.hearts)) + "🖤".repeat(Math.max(0, 3 - s.hearts));

  root.innerHTML = `
   <div class="hud"><button class="btn ghost" id="quit" style="padding:8px">✕</button>
     <span class="hearts">${hearts}</span>
     <span class="combo ${s.combo >= 2 ? "" : "off"}">🔥×${fmtMult(s.multiplier)}</span>
     <span class="px" style="font-size:10px">+${s.gain} XP</span></div>
   ${dots}
   ${timed ? `<div class="tbar"><i id="tb"></i></div>` : ""}
   <div class="card qcard" style="--c:${lv.color}">
     ${q.boss ? `<span class="boss">👹 BOSS ×2</span>` : ""}
     ${KIND_LABEL[q.k] ? `<span class="kind">${KIND_LABEL[q.k]}</span>` : ""}
     <div class="px" style="font-size:9px;color:var(--muted)">${lv.icon} ${safe(lv.name).toUpperCase()}${s.mode === "endless" ? ` · série ${s.ok}` : ""}</div>
     <div class="q-text">${safe(q.q)}</div>
     <div id="ans"></div>
     <div id="fb"></div></div>`;
  typeset(root);

  qs("#quit", root).onclick = () => {
    if (confirm("Quitter la partie ?")) nav.home();
  };

  const finish = (out: Outcome, val: number | string | null): void => {
    mounted?.reveal();
    showFeedback(root, s, out, val, nav);
  };
  const submit = (val: number | string | null, timeout = false): void => {
    if (locked) return;
    locked = true;
    stopTimer();
    finish(s.submit(val, timeout, conf), val);
  };

  const mountBody = (): void => {
    const ans = qs("#ans", root);
    if (q.k === "qcm") {
      ans.innerHTML = q.o.map((o, i) => `<button class="choice" data-i="${i}">${safe(o)}</button>`).join("");
      typeset(ans);
      qsa<HTMLButtonElement>(".choice", root).forEach((b) => (b.onclick = () => submit(Number(b.dataset.i))));
    } else if (q.k === "num") {
      ans.innerHTML = `<input class="ans" id="inp" inputmode="decimal" placeholder="nombre, fraction a/b ou décimal" autocomplete="off"><button class="btn" id="ok">VALIDER</button>`;
      const inp = qs<HTMLInputElement>("#inp", root);
      qs("#ok", root).onclick = () => submit(inp.value);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit(inp.value);
      });
      inp.focus();
    } else if (q.k === "bug") {
      mounted = mountBug(ans, q, (v) => submit(v));
    } else if (q.k === "order") {
      mounted = mountOrder(ans, q, (v) => submit(v));
    } else {
      mounted = mountGuided(ans, q, (missed, hints) => {
        if (locked) return;
        locked = true;
        finish(s.submitGuided(missed, hints), null);
      });
    }
    if (timed) {
      const sec = q.k === "num" ? 45 : 25;
      const bar = qs("#tb", root);
      bar.style.transition = `transform ${sec}s linear`;
      requestAnimationFrame(() => requestAnimationFrame(() => (bar.style.transform = "scaleX(0)")));
      timer = setTimeout(() => submit(null, true), sec * 1000);
    }
  };

  if (q.bet) {
    // pari : on annonce sa confiance AVANT de voir les réponses
    qs("#ans", root).innerHTML = `<p class="small"><b>🎰 Pari.</b> Avant de voir les réponses : à quel point es-tu sûr·e de toi ?
      Sûr·e et juste = XP ×2 ; sûr·e et faux = −XP et un cœur de plus.</p>
      ${([1, 2, 3] as const).map((c) => `<button class="choice conf" data-c="${c}">${CONF_LABEL[c]} <small>(×${[1, 1.5, 2][c - 1]})</small></button>`).join("")}`;
    qsa<HTMLButtonElement>(".conf", root).forEach((b) => {
      b.onclick = () => {
        conf = Number(b.dataset.c) as Conf;
        mountBody();
      };
    });
  } else mountBody();
}

function showFeedback(root: HTMLElement, s: Session, out: Outcome, val: number | string | null, nav: Nav): void {
  const q = s.current;
  const lv = levelAt(q.ci, q.li);
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
  } else if (q.k === "num") {
    qs<HTMLInputElement>("#inp", root).disabled = true;
    qs("#ok", root).style.display = "none";
  }
  const right = out.right ? `<br><b>Réponse :</b> ${m(ftex(out.right))}` : "";
  const verdict = out.ok ? "Bravo !" : out.timeout ? "Temps écoulé !" : "Raté.";
  const bet = out.conf
    ? out.ok
      ? `<br>🎰 Pari gagné : <b>×${[1, 1.5, 2][out.conf - 1]}</b> d'XP.`
      : `<br>🎰 Pari perdu${out.penalty ? ` : <b>−${out.penalty} XP</b>` : ""}${out.extraHeart ? " et un cœur de plus" : ""}.`
    : "";
  const gainTxt = q.k === "guided" ? `<br>${out.ok ? `+${out.gain} XP` : "Il fallait toutes les étapes justes pour valider le problème."}` : "";
  qs("#fb", root).innerHTML = `
    <div class="fb ${out.ok ? "ok" : "ko"}"><b>${verdict}</b>${right}${bet}${gainTxt}<br>${safe(q.exp)}
      ${out.ok ? "" : `<div class="trap">⚠️ <b>Piège :</b> ${safe(lv.piege)}</div>`}</div>
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
