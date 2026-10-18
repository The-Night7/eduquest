import { LEVELS } from "../content";
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

export const starsOf = (li: number): number => getState().stars[LEVELS[li]?.id ?? ""] ?? 0;
/** Un niveau s'ouvre dès qu'on a au moins 1 étoile au précédent. */
export const isUnlocked = (li: number): boolean => li === 0 || starsOf(li - 1) >= 1;
export const unlockedLevels = (): number[] => LEVELS.map((_, i) => i).filter(isUnlocked);

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

export const questDoneToday = (): boolean => {
  const q = getState().quest;
  return !!q && q.day === today() && q.done;
};
