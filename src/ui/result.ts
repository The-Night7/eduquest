import type { Session, Summary } from "../game/session";
import { qs, safe } from "./dom";
import { confetti, sfx } from "./fx";
import type { Nav } from "./nav";

const fmtMult = (x: number): string => x.toFixed(2).replace(/\.?0+$/, "");

export function renderResult(root: HTMLElement, s: Session, sum: Summary, nav: Nav): void {
  let head = "";
  let sub = "";
  let extra = "";
  if (sum.mode === "mission") {
    if (sum.pass) {
      head = "★".repeat(sum.stars) + "☆".repeat(3 - sum.stars);
      sub = "Mission réussie !";
      if (sum.unlockedNext) extra = `<p>🔓 Niveau ${sum.li + 2} débloqué : <b>${safe(sum.unlockedNext)}</b></p>`;
      sfx.win();
      confetti();
    } else {
      head = "💀";
      sub = "Plus de cœurs… relis le rappel 📖 et réessaie.";
      sfx.lose();
    }
  } else if (sum.mode === "quest") {
    head = "📅 ✅";
    sub = "Quête du jour terminée ! +50 XP";
    sfx.win();
    confetti();
  } else {
    head = `♾️ ${sum.ok}`;
    sub = "Bonnes réponses d'affilée (3 cœurs)";
    if (sum.record) {
      extra = "<p>🏆 Nouveau record !</p>";
      confetti();
      sfx.win();
    } else sfx.lose();
  }

  root.innerHTML = `<div class="card res"><div class="px" style="font-size:11px;color:var(--muted)">${sub}</div>
    <div class="big px">${head}</div>
    <div class="stats"><div class="stat"><b>+${sum.gain}</b><span>XP</span></div>
      <div class="stat"><b>${sum.ok}</b><span>bonnes réponses</span></div>
      <div class="stat"><b>×${fmtMult(sum.bestMultiplier)}</b><span>meilleur combo</span></div></div>
    ${sum.lvlUp ? `<p class="px" style="font-size:11px;color:#b58900">⬆️ NIVEAU ${sum.playerLevel} !</p>` : ""}${extra}
    <div class="actions"><button class="btn ghost" id="h">ACCUEIL</button>
      ${sum.mode === "quest" ? "" : `<button class="btn" id="again">REJOUER</button>`}</div></div>`;

  qs("#h", root).onclick = () => nav.home();
  const again = root.querySelector<HTMLButtonElement>("#again");
  if (again) again.onclick = () => (s.mode === "mission" ? nav.mission(s.li) : nav.endless());
}
