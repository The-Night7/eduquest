import { pick, rand, ri, shuffle } from "../core/rng";
import type { Chapter, Level, Question } from "../types";
import { chapter as algebre } from "./algebre";
import { chapter as analyse } from "./analyse";
import { chapter as integproba } from "./integproba";
import { chapter as physmod } from "./physmod";
import { chapter as series } from "./series";

/** Les chapitres du jeu, dans l'ordre d'affichage. */
export const CHAPTERS: readonly Chapter[] = [series, analyse, algebre, integproba, physmod];

export const levelsOf = (ci: number): readonly Level[] => CHAPTERS[ci]?.levels ?? [];
export const levelAt = (ci: number, li: number): Level => {
  const lv = levelsOf(ci)[li];
  if (!lv) throw new Error(`niveau inconnu ${ci}/${li}`);
  return lv;
};

/** Part des questions (hors boss et problèmes guidés) proposées en mode « pari ». */
export const BET_RATE = 0.3;

/** Fabrique une question du générateur `gi` du niveau `li` du chapitre `ci`. */
export function build(ci: number, li: number, gi: number, boss = false): Question {
  const lv = levelAt(ci, li);
  const [id, make] = lv.gens[gi] as Level["gens"][number];
  const raw = make();
  // tirage via le rng seedé : la quête du jour reste identique toute la journée
  const bet = raw.k !== "guided" && (boss || rand() < BET_RATE);
  return { ...raw, ci, li, gi, tag: `${lv.id}:${id}`, boss, bet };
}

/** Comme `build`, en évitant (quelques essais) un énoncé déjà vu. */
export function buildFresh(ci: number, li: number, gi: number, boss: boolean, avoid?: ReadonlySet<string>): Question {
  let q = build(ci, li, gi, boss);
  for (let t = 0; t < 8 && avoid?.has(q.q); t++) q = build(ci, li, gi, boss);
  return q;
}

/** Ordre équilibré des générateurs : chacun passe avant qu'un deuxième repasse. */
export function genOrder(ci: number, li: number, n: number): number[] {
  const ids = levelAt(ci, li).gens.map((_, i) => i);
  let out: number[] = [];
  while (out.length < n) out = out.concat(shuffle(ids));
  return out.slice(0, n);
}

/** 6 questions du niveau puis un boss (×2 d'XP) tiré parmi les niveaux déjà ouverts du chapitre. */
export function makeMission(ci: number, li: number): Question[] {
  const seen = new Set<string>();
  const qs: Question[] = genOrder(ci, li, 6).map((gi) => {
    const q = buildFresh(ci, li, gi, false, seen);
    seen.add(q.q);
    return q;
  });
  const pool: number[] = [];
  for (let l = 0; l <= li; l++) for (let k = 0; k < (l === li ? 3 : 1); k++) pool.push(l);
  const bl = pick(pool);
  const bossGen = ri(0, levelAt(ci, bl).gens.length - 1);
  qs.push(buildFresh(ci, bl, bossGen, true, seen));
  return qs;
}
