import { build, buildFresh, CHAPTERS, levelAt, levelsOf, makeMission } from "../content";
import { type Fraction } from "../core/fraction";
import { pick, rand, ri, withSeed } from "../core/rng";
import type { Conf, Question } from "../types";
import { isRight } from "./answer";
import {
  isUnlocked, noteConf, noteResult, playerLevel, questDoneToday, starsOf, today, touchStreak, unlockedAll, unlockedLevels,
  XP_PER_LEVEL,
} from "./progress";
import { getState, save } from "./store";

export type Mode = "mission" | "quest" | "endless";

export interface Outcome {
  ok: boolean;
  timeout: boolean;
  /** XP gagnés sur cette réponse */
  gain: number;
  /** XP perdus (pari raté avec confiance élevée) */
  penalty: number;
  /** cœur supplémentaire perdu (pari « certain » raté) */
  extraHeart: boolean;
  conf: Conf | null;
  /** plus de cœurs */
  over: boolean;
  /** dernière question de la partie */
  last: boolean;
  /** bonne réponse (pour les questions à saisir) */
  right: Fraction | null;
}

export interface Summary {
  mode: Mode;
  ci: number;
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
/** bonus d'XP d'une bonne réponse selon la confiance annoncée */
export const BET_MULT: Record<Conf, number> = { 1: 1, 2: 1.5, 3: 2 };
/** malus d'XP (× n° du niveau) d'un pari raté selon la confiance */
export const BET_PENALTY: Record<Conf, number> = { 1: 0, 2: 5, 3: 10 };
/** Chaque indice utilisé retire 20 % de l'XP d'un problème guidé, jusqu'à 40 % au minimum. */
export const hintFactor = (hints: number): number => Math.max(0.4, 1 - 0.2 * hints);
/** Un problème guidé pèse 0,6 question par étape. */
export const guidedWeight = (steps: number): number => 0.6 * steps;

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
    /** chapitre joué (−1 : tous, pour la quête et l'infini global) */
    readonly ci = -1,
    readonly li = -1,
  ) {
    this.hearts = mode === "quest" ? 99 : 3;
    this.xp0 = getState().xp;
  }

  /** 6 questions du niveau + un boss. */
  static mission(ci: number, li: number): Session {
    return new Session("mission", makeMission(ci, li), ci, li);
  }

  /** 3 questions tirées avec une graine = la date : identiques toute la journée. */
  static quest(): Session {
    const qs = withSeed("quest-" + today(), () => {
      const open = unlockedAll();
      const out: Question[] = [];
      for (let k = 0; k < QUEST_SIZE; k++) {
        const { ci, li } = pick(open);
        out.push(build(ci, li, ri(0, levelAt(ci, li).gens.length - 1)));
      }
      return out;
    });
    return new Session("quest", qs);
  }

  /** Questions sans fin (dans un chapitre, ou partout si ci = −1) ; les types ratés reviennent plus souvent. */
  static endless(ci = -1): Session {
    const s = new Session("endless", [], ci);
    s.qs = [Session.nextEndless(ci)];
    return s;
  }

  private static nextEndless(ci: number): Question {
    const stats = getState().stats;
    const pairs: { ci: number; li: number; gi: number; w: number }[] = [];
    const chapters = ci >= 0 ? [ci] : CHAPTERS.map((_, i) => i);
    for (const c of chapters)
      for (const li of unlockedLevels(c))
        levelAt(c, li).gens.forEach(([id], gi) => {
          const s = stats[`${levelAt(c, li).id}:${id}`] ?? { ok: 0, ko: 0 };
          pairs.push({ ci: c, li, gi, w: 1 + (4 * (s.ko + 1)) / (s.ok + s.ko + 2) });
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
    const c = chosen as { ci: number; li: number; gi: number };
    return build(c.ci, c.li, c.gi);
  }

  get current(): Question {
    return this.qs[this.i] as Question;
  }

  /** Multiplicateur d'XP de la prochaine bonne réponse : ×1 puis +0,25 par combo, plafonné à ×3. */
  get multiplier(): number {
    return Math.min(3, 1 + 0.25 * this.combo);
  }

  /** Valide une réponse (`timeout` : le chrono est écoulé ; `conf` : confiance annoncée si pari). */
  submit(val: number | string | null, timeout = false, conf: Conf | null = null): Outcome {
    const q = this.current;
    return this.settle(!timeout && isRight(q, val), { timeout, conf, weight: 1, hints: 0 });
  }

  /** Problème guidé terminé : `missed` étapes ratées, `hints` indices utilisés. Réussi = aucune étape ratée. */
  submitGuided(missed: number, hints: number): Outcome {
    const q = this.current;
    if (q.k !== "guided") throw new Error("pas un problème guidé");
    return this.settle(missed === 0, { timeout: false, conf: null, weight: guidedWeight(q.steps.length), hints });
  }

  private settle(ok: boolean, o: { timeout: boolean; conf: Conf | null; weight: number; hints: number }): Outcome {
    const q = this.current;
    const st = getState();
    noteResult(q.tag, ok);
    if (o.conf) noteConf(o.conf, ok);
    let gain = 0;
    let penalty = 0;
    let extraHeart = false;
    if (ok) {
      const mult = this.multiplier;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.ok++;
      gain = Math.round(
        10 * (q.li + 1) * mult * (q.boss ? 2 : 1) * (st.timed ? 1.5 : 1) * (o.conf ? BET_MULT[o.conf] : 1) *
          o.weight * hintFactor(o.hints),
      );
      st.xp += gain;
      this.gain += gain;
      touchStreak();
    } else {
      this.combo = 0;
      if (o.conf) penalty = Math.min(st.xp, BET_PENALTY[o.conf] * (q.li + 1));
      st.xp -= penalty;
      this.gain -= penalty;
      if (this.mode !== "quest") {
        this.hearts--;
        if (o.conf === 3) {
          this.hearts--;
          extraHeart = true;
        }
      }
      if (this.mode === "mission" && !q.boss && this.requeued < MAX_REQUEUE) {
        // une question du même niveau est reposée un peu plus tard
        const seen = new Set(this.qs.map((x) => x.q));
        const nq = buildFresh(q.ci, q.li, ri(0, levelAt(q.ci, q.li).gens.length - 1), false, seen);
        this.qs.splice(Math.min(this.i + 3, this.qs.length - 1), 0, nq);
        this.requeued++;
      }
    }
    save();
    const over = this.hearts <= 0 && this.mode !== "quest";
    const last = this.mode === "endless" ? over : this.i >= this.qs.length - 1 || over;
    return {
      ok, timeout: o.timeout, gain, penalty, extraHeart, conf: o.conf, over, last,
      right: !ok && q.k === "num" ? q.ans : null,
    };
  }

  /** Passe à la question suivante. */
  advance(): void {
    if (this.mode === "endless") {
      this.qs = [Session.nextEndless(this.ci)];
      this.i = 0;
    } else this.i++;
  }

  /** À appeler une fois à la fin : attribue étoiles / bonus / record et résume la partie. */
  finish(pass: boolean): Summary {
    const st = getState();
    const sum: Summary = {
      mode: this.mode, ci: this.ci, li: this.li, pass, gain: 0, ok: this.ok,
      bestMultiplier: Math.min(3, 1 + 0.25 * Math.max(0, this.maxCombo - 1)),
      lvlUp: false, playerLevel: 1, stars: 0, unlockedNext: null, record: false,
    };
    if (this.mode === "mission" && pass) {
      const lv = levelsOf(this.ci)[this.li];
      const next = levelsOf(this.ci)[this.li + 1];
      const nextWasOpen = !!next && isUnlocked(this.ci, this.li + 1);
      sum.stars = Math.max(1, this.hearts);
      if (lv && sum.stars > starsOf(this.ci, this.li)) st.stars[lv.id] = sum.stars;
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
