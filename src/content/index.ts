import { pick, ri, shuffle } from "../core/rng";
import type { Level, Question } from "../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";
import { level as l5 } from "./level5";
import { level as l6 } from "./level6";
import { level as l7 } from "./level7";

/** Les niveaux du chapitre « Séries », dans l'ordre du parcours. */
export const LEVELS: readonly Level[] = [l1, l2, l3, l4, l5, l6, l7];

/** Fabrique une question du générateur `gi` du niveau `li`. */
export function build(li: number, gi: number, boss = false): Question {
  const lv = LEVELS[li] as Level;
  const [id, make] = lv.gens[gi] as Level["gens"][number];
  return { ...make(), li, gi, tag: `${lv.id}:${id}`, boss };
}

/** Comme `build`, en évitant (quelques essais) un énoncé déjà vu. */
export function buildFresh(li: number, gi: number, boss: boolean, avoid?: ReadonlySet<string>): Question {
  let q = build(li, gi, boss);
  for (let t = 0; t < 8 && avoid?.has(q.q); t++) q = build(li, gi, boss);
  return q;
}

/** Ordre équilibré des générateurs : chacun passe avant qu'un deuxième repasse. */
export function genOrder(li: number, n: number): number[] {
  const ids = (LEVELS[li] as Level).gens.map((_, i) => i);
  let out: number[] = [];
  while (out.length < n) out = out.concat(shuffle(ids));
  return out.slice(0, n);
}

/** 6 questions du niveau puis un boss (×2 d'XP) tiré parmi les niveaux déjà ouverts. */
export function makeMission(li: number): Question[] {
  const seen = new Set<string>();
  const qs: Question[] = genOrder(li, 6).map((gi) => {
    const q = buildFresh(li, gi, false, seen);
    seen.add(q.q);
    return q;
  });
  const pool: number[] = [];
  for (let l = 0; l <= li; l++) for (let k = 0; k < (l === li ? 3 : 1); k++) pool.push(l);
  const bl = pick(pool);
  const bossGen = ri(0, (LEVELS[bl] as Level).gens.length - 1);
  qs.push(buildFresh(bl, bossGen, true, seen));
  return qs;
}
