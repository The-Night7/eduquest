import { build, buildFresh, LEVELS, makeMission } from "../content";
import { type Fraction } from "../core/fraction";
import { pick, rand, ri, withSeed } from "../core/rng";
import type { Question } from "../types";
import { isRight } from "./answer";
import {
  isUnlocked, noteResult, playerLevel, questDoneToday, starsOf, today, touchStreak, unlockedLevels, XP_PER_LEVEL,
} from "./progress";
import { getState, save } from "./store";

export type Mode = "mission" | "quest" | "endless";

export interface Outcome {
  ok: boolean;
  timeout: boolean;
  /** XP gagnés sur cette réponse */
  gain: number;
  /** plus de cœurs */
  over: boolean;
  /** dernière question de la partie */
  last: boolean;
  /** bonne réponse (pour les questions à saisir) */
  right: Fraction | null;
}

export interface Summary {
  mode: Mode;
  li: number;
  pass: boolean;
  gain: number;
  ok: number;
  /** multiplicateur maximal atteint */
  bestMultiplier: number;
  lvlUp: boolean;
  /** nouveau niveau du joueur, si lvlUp */
  playerLevel: number;
  stars: number;
  /** nom du niveau de parcours tout juste débloqué */
  unlockedNext: string | null;
  record: boolean;
}

export const QUEST_BONUS = 50;
const QUEST_SIZE = 3;
const MAX_REQUEUE = 2;

/** Une partie : 3 modes (mission, quête du jour, infini). Ne touche pas au DOM. */
export class Session {
  i = 0;
  hearts: number;
  combo = 0;
  maxCombo = 0;
  ok = 0;
  gain = 0;
  private requeued = 0;
  private readonly xp0: number;

  private constructor(
    readonly mode: Mode,
    public qs: Question[],
    readonly li = -1,
  ) {
    this.hearts = mode === "quest" ? 99 : 3;
    this.xp0 = getState().xp;
  }

  /** 6 questions du niveau + un boss. */
  static mission(li: number): Session {
    return new Session("mission", makeMission(li), li);
  }

  /** 3 questions tirées avec une graine = la date : identiques toute la journée. */
  static quest(): Session {
    const qs = withSeed("quest-" + today(), () => {
      const open = unlockedLevels();
      const out: Question[] = [];
      for (let k = 0; k < QUEST_SIZE; k++) {
        const li = pick(open);
        out.push(build(li, ri(0, (LEVELS[li]?.gens.length ?? 1) - 1)));
      }
      return out;
    });
    return new Session("quest", qs);
  }

  /** Questions sans fin ; les types où tu te trompes le plus reviennent plus souvent. */
  static endless(): Session {
    const s = new Session("endless", []);
    s.qs = [Session.nextEndless()];
    return s;
  }

  private static nextEndless(): Question {
    const stats = getState().stats;
    const pairs: { li: number; gi: number; w: number }[] = [];
    for (const li of unlockedLevels())
      (LEVELS[li]?.gens ?? []).forEach(([id], gi) => {
        const s = stats[`${LEVELS[li]?.id}:${id}`] ?? { ok: 0, ko: 0 };
        pairs.push({ li, gi, w: 1 + (4 * (s.ko + 1)) / (s.ok + s.ko + 2) });
      });
    let r = rand() * pairs.reduce((a, p) => a + p.w, 0);
    let chosen = pairs[0];
    for (const p of pairs) {
      r -= p.w;
      if (r <= 0) {
        chosen = p;
        break;
      }
    }
    return build((chosen as { li: number }).li, (chosen as { gi: number }).gi);
  }

  get current(): Question {
    return this.qs[this.i] as Question;
  }

  /** Multiplicateur d'XP de la prochaine bonne réponse : ×1 puis +0,25 par combo, plafonné à ×3. */
  get multiplier(): number {
    return Math.min(3, 1 + 0.25 * this.combo);
  }

  /** Valide une réponse (`timeout` : le chrono est écoulé). */
  submit(val: number | string | null, timeout = false): Outcome {
    const q = this.current;
    const st = getState();
    const ok = !timeout && isRight(q, val);
    noteResult(q.tag, ok);
    let gain = 0;
    if (ok) {
      const mult = this.multiplier;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.ok++;
      gain = Math.round(10 * (q.li + 1) * mult * (q.boss ? 2 : 1) * (st.timed ? 1.5 : 1));
      st.xp += gain;
      this.gain += gain;
      touchStreak();
    } else {
      this.combo = 0;
      if (this.mode !== "quest") this.hearts--;
      if (this.mode === "mission" && !q.boss && this.requeued < MAX_REQUEUE) {
        // une question du même niveau est reposée un peu plus tard
        const seen = new Set(this.qs.map((x) => x.q));
        const nq = buildFresh(q.li, ri(0, (LEVELS[q.li]?.gens.length ?? 1) - 1), false, seen);
        this.qs.splice(Math.min(this.i + 3, this.qs.length - 1), 0, nq);
        this.requeued++;
      }
    }
    save();
    const over = this.hearts <= 0 && this.mode !== "quest";
    const last = this.mode === "endless" ? over : this.i >= this.qs.length - 1 || over;
    return { ok, timeout, gain, over, last, right: !ok && q.k === "num" ? q.ans : null };
  }

  /** Passe à la question suivante. */
  advance(): void {
    if (this.mode === "endless") {
      this.qs = [Session.nextEndless()];
      this.i = 0;
    } else this.i++;
  }

  /** À appeler une fois à la fin : attribue étoiles / bonus / record et résume la partie. */
  finish(pass: boolean): Summary {
    const st = getState();
    const sum: Summary = {
      mode: this.mode, li: this.li, pass, gain: 0, ok: this.ok,
      bestMultiplier: Math.min(3, 1 + 0.25 * Math.max(0, this.maxCombo - 1)),
      lvlUp: false, playerLevel: 1, stars: 0, unlockedNext: null, record: false,
    };
    if (this.mode === "mission" && pass) {
      const lv = LEVELS[this.li];
      const next = LEVELS[this.li + 1];
      const nextWasOpen = this.li + 1 < LEVELS.length && isUnlocked(this.li + 1);
      sum.stars = Math.max(1, this.hearts);
      if (lv && sum.stars > starsOf(this.li)) st.stars[lv.id] = sum.stars;
      if (next && !nextWasOpen) sum.unlockedNext = next.name;
    } else if (this.mode === "quest") {
      if (!questDoneToday()) {
        st.quest = { day: today(), done: true };
        st.xp += QUEST_BONUS;
        this.gain += QUEST_BONUS;
      }
    } else if (this.mode === "endless" && this.ok > st.best) {
      st.best = this.ok;
      sum.record = true;
    }
    sum.gain = this.gain;
    sum.lvlUp = Math.floor(st.xp / XP_PER_LEVEL) > Math.floor(this.xp0 / XP_PER_LEVEL);
    sum.playerLevel = playerLevel(st.xp);
    save();
    return sum;
  }
}
