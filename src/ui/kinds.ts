/** Interfaces des questions « qui font réfléchir » : trouve l'erreur, reconstitue la preuve, problème guidé. */
import { ftex } from "../core/fraction";
import { m } from "../core/tex";
import { isRightStep, parseNum } from "../game/answer";
import type { BugRaw, GuidedAnswer, GuidedRaw, OrderRaw } from "../types";
import { qs, qsa, safe, typeset } from "./dom";
import { sfx } from "./fx";

export interface Mounted {
  /** après correction : montre où était la bonne réponse */
  reveal(): void;
}

/** Trouve l'erreur : on touche la ligne fausse, puis on choisit sa bonne version. */
export function mountBug(el: HTMLElement, q: BugRaw, submit: (val: string) => void): Mounted {
  let chosen = -1;
  const lines = (): string =>
    q.lines.map((l, i) => `<button class="line ${i === chosen ? "sel" : ""}" data-i="${i}"><b>${i + 1}</b><span>${safe(l)}</span></button>`).join("");
  const phase1 = (): void => {
    el.innerHTML = `<p class="small">Une seule ligne est fausse. Touche-la.</p><div class="lines">${lines()}</div>`;
    typeset(el);
    qsa<HTMLButtonElement>(".line", el).forEach((b) => {
      b.onclick = () => {
        chosen = Number(b.dataset.i);
        if (chosen !== q.bad) return submit(`${chosen}:-1`);
        phase2();
      };
    });
  };
  const phase2 = (): void => {
    el.innerHTML = `<p class="small">Bien vu : la ligne <b>${chosen + 1}</b> est fausse. Quelle serait la bonne version ?</p>
      <div class="lines">${lines()}</div>
      ${q.fixes.map((f, i) => `<button class="choice" data-f="${i}">${safe(f)}</button>`).join("")}`;
    typeset(el);
    qsa<HTMLButtonElement>(".line", el).forEach((b) => (b.disabled = true));
    qsa<HTMLButtonElement>(".choice", el).forEach((b) => (b.onclick = () => submit(`${chosen}:${b.dataset.f}`)));
  };
  phase1();
  return {
    reveal() {
      qsa<HTMLButtonElement>(".line", el).forEach((b, i) => {
        b.disabled = true;
        b.classList.toggle("bad", i === q.bad);
        b.classList.toggle("sel", i === chosen && i !== q.bad);
      });
      qsa<HTMLButtonElement>(".choice", el).forEach((b, i) => {
        b.disabled = true;
        if (i === q.fix) b.classList.add("ok");
      });
    },
  };
}

/** Reconstitue la preuve : on touche les étapes dans l'ordre ; des leurres traînent dans la banque. */
export function mountOrder(el: HTMLElement, q: OrderRaw, submit: (val: string) => void): Mounted {
  const picked: number[] = [];
  let done = false;
  const draw = (): void => {
    const bank = q.pool.map((t, i) => ({ t, i })).filter(({ i }) => !picked.includes(i));
    el.innerHTML = `<p class="small">Choisis les <b>${q.sol.length}</b> bonnes étapes, dans l'ordre. ${q.pool.length - q.sol.length} intrus se cachent.</p>
      <div class="slots">${picked.length ? picked.map((p, k) => `<button class="chip placed" data-p="${p}"><b>${k + 1}</b><span>${safe(q.pool[p] as string)}</span></button>`).join("") : `<span class="small">Ta preuve apparaîtra ici…</span>`}</div>
      <div class="bank">${bank.map(({ t, i }) => `<button class="chip" data-b="${i}"><span>${safe(t)}</span></button>`).join("")}</div>
      <button class="btn" id="ordok" ${picked.length === q.sol.length ? "" : "disabled"}>VALIDER</button>`;
    typeset(el);
    if (done) return;
    qsa<HTMLButtonElement>(".placed", el).forEach((b) => (b.onclick = () => { picked.splice(picked.indexOf(Number(b.dataset.p)), 1); draw(); }));
    qsa<HTMLButtonElement>("[data-b]", el).forEach((b) => (b.onclick = () => { picked.push(Number(b.dataset.b)); draw(); }));
    qs<HTMLButtonElement>("#ordok", el).onclick = () => { done = true; submit(picked.join(",")); };
  };
  draw();
  return {
    reveal() {
      done = true;
      const ok = picked.join(",") === q.sol.join(",");
      el.innerHTML = `<div class="slots">${q.sol.map((p, k) => {
        const mine = picked[k] === p;
        return `<div class="chip placed ${mine ? "right" : "wrong"}"><b>${k + 1}</b><span>${safe(q.pool[p] as string)}</span></div>`;
      }).join("")}</div>${ok ? "" : `<p class="small">Voici la preuve dans le bon ordre.${picked.length ? " En rouge : les étapes que tu n'avais pas placées au bon endroit." : ""}</p>`}`;
      typeset(el);
    },
  };
}

/**
 * Problème guidé : étapes successives, indices progressifs payants.
 * `done` reçoit le nombre d'étapes ratées et d'indices utilisés.
 */
export function mountGuided(el: HTMLElement, q: GuidedRaw, done: (missed: number, hints: number) => void): Mounted {
  let k = 0;
  let missed = 0;
  let hints = 0;
  const results: boolean[] = [];
  const step = (): void => {
    const st = q.steps[k];
    if (!st) {
      el.innerHTML = `<div class="recap-steps">${results.map((ok, i) => `<div class="rs ${ok ? "ok" : "ko"}"><b>${i + 1}</b> ${ok ? "✓" : "✗"} ${safe(q.steps[i]?.q ?? "")}</div>`).join("")}</div>`;
      typeset(el);
      return done(missed, hints);
    }
    let shown = 0;
    let answered = false;
    el.innerHTML = `<div class="gstep"><div class="px" style="font-size:9px;color:var(--muted)">ÉTAPE ${k + 1} / ${q.steps.length}</div>
      <div class="q-text">${safe(st.q)}</div>
      <div id="gh"></div>
      <div id="ga">${answerHtml(st.ans)}</div>
      <div id="gf"></div>
      <div style="margin-top:8px"><button class="btn ghost" id="hint" ${st.hints.length ? "" : "disabled"}>💡 INDICE (−20 % XP)</button></div></div>`;
    typeset(el);

    const finish = (ok: boolean, val: number | string | null): void => {
      if (answered) return;
      answered = true;
      if (!ok) missed++;
      results.push(ok);
      ok ? sfx.ok() : sfx.ko();
      if (st.ans.k === "qcm") {
        qsa<HTMLButtonElement>(".choice", el).forEach((c, i) => {
          c.disabled = true;
          if (i === (st.ans as { a: number }).a) c.classList.add("ok");
          else if (i === val) c.classList.add("ko");
        });
      } else {
        qs<HTMLInputElement>("#inp", el).disabled = true;
        qs("#ok", el).style.display = "none";
      }
      const right = !ok && st.ans.k === "num" ? `<br><b>Réponse :</b> ${m(ftex(st.ans.ans))}` : "";
      qs("#gf", el).innerHTML = `<div class="fb ${ok ? "ok" : "ko"}"><b>${ok ? "Juste." : "Raté."}</b>${right}<br>${safe(st.exp)}</div>
        <div style="margin-top:10px"><button class="btn alt" id="gnext">${k + 1 === q.steps.length ? "VOIR LE BILAN →" : "ÉTAPE SUIVANTE →"}</button></div>`;
      qs<HTMLButtonElement>("#hint", el).style.display = "none";
      typeset(qs("#gf", el));
      const nx = qs<HTMLButtonElement>("#gnext", el);
      nx.focus();
      nx.onclick = () => { k++; step(); };
    };

    if (st.ans.k === "qcm") {
      qsa<HTMLButtonElement>(".choice", el).forEach((b) => (b.onclick = () => finish(isRightStep(st.ans, Number(b.dataset.i)), Number(b.dataset.i))));
    } else {
      const inp = qs<HTMLInputElement>("#inp", el);
      const go = (): void => { if (!Number.isNaN(parseNum(inp.value))) finish(isRightStep(st.ans, inp.value), inp.value); };
      qs("#ok", el).onclick = go;
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
      inp.focus();
    }
    qs<HTMLButtonElement>("#hint", el).onclick = () => {
      if (answered || shown >= st.hints.length) return;
      shown++;
      hints++;
      qs("#gh", el).innerHTML = st.hints.slice(0, shown).map((h, i) => `<div class="hintbox">💡 <b>Indice ${i + 1}</b> — ${safe(h)}</div>`).join("");
      typeset(qs("#gh", el));
      if (shown >= st.hints.length) qs<HTMLButtonElement>("#hint", el).disabled = true;
    };
  };
  step();
  return { reveal() { /* rien : chaque étape a déjà montré sa correction */ } };
}

function answerHtml(a: GuidedAnswer): string {
  return a.k === "qcm"
    ? a.o.map((o, i) => `<button class="choice" data-i="${i}">${safe(o)}</button>`).join("")
    : `<input class="ans" id="inp" inputmode="decimal" placeholder="nombre, fraction a/b ou décimal" autocomplete="off"><button class="btn" id="ok">VALIDER</button>`;
}
