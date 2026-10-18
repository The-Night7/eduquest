import { CHAPTERS, levelsOf } from "../content";
import type { Conf } from "../types";
import { getState } from "./store";

/** XP nécessaires pour passer au niveau suivant. */
export const XP_PER_LEVEL = 500;

export const today = (): string => new Date().toLocaleDateString("fr-CA");
export const yesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("fr-CA");
};

export const playerLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;

export const starsOf = (ci: number, li: number): number => getState().stars[levelsOf(ci)[li]?.id ?? ""] ?? 0;
/** Un niveau s'ouvre dès qu'on a au moins 1 étoile au précédent (le 1er est toujours ouvert). */
export const isUnlocked = (ci: number, li: number): boolean => li === 0 || starsOf(ci, li - 1) >= 1;
export const unlockedLevels = (ci: number): number[] => levelsOf(ci).map((_, i) => i).filter((i) => isUnlocked(ci, i));
/** Tous les niveaux ouverts, tous chapitres confondus (quête du jour). */
export const unlockedAll = (): { ci: number; li: number }[] =>
  CHAPTERS.flatMap((_, ci) => unlockedLevels(ci).map((li) => ({ ci, li })));

export const chapterStars = (ci: number): { got: number; total: number } => ({
  got: levelsOf(ci).reduce((s, _, li) => s + starsOf(ci, li), 0),
  total: levelsOf(ci).length * 3,
});

/** Streak : +1 si on a joué hier, sinon on repart à 1. */
export function touchStreak(): void {
  const st = getState();
  const d = today();
  if (st.lastDay === d) return;
  st.streak = st.lastDay === yesterday() ? st.streak + 1 : 1;
  st.lastDay = d;
}
/** Streak affiché : 0 s'il est déjà cassé. */
export const currentStreak = (): number => {
  const st = getState();
  return st.lastDay === today() || st.lastDay === yesterday() ? st.streak : 0;
};

export function noteResult(tag: string, ok: boolean): void {
  const stats = getState().stats;
  const s = (stats[tag] ??= { ok: 0, ko: 0 });
  if (ok) s.ok++;
  else s.ko++;
}
export function noteConf(conf: Conf, ok: boolean): void {
  const c = getState().calib;
  const s = (c[String(conf)] ??= { ok: 0, ko: 0 });
  if (ok) s.ok++;
  else s.ko++;
}

/**
 * Calibration : taux de réussite quand tu étais « certain·e » (3) vs « au hasard » (1).
 * `null` tant qu'il y a moins de 5 paris dans la catégorie.
 */
export function calibration(conf: Conf): number | null {
  const s = getState().calib[String(conf)];
  if (!s || s.ok + s.ko < 5) return null;
  return s.ok / (s.ok + s.ko);
}

export const questDoneToday = (): boolean => {
  const q = getState().quest;
  return !!q && q.day === today() && q.done;
};
