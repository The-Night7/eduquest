/** Sauvegarde locale (localStorage, avec repli silencieux s'il est indisponible). */
export interface Stat {
  ok: number;
  ko: number;
}
export interface Save {
  xp: number;
  /** étoiles (0 à 3) par id de niveau */
  stars: Record<string, number>;
  /** réussite par type de question ("L3:nat") : sert au mode infini */
  stats: Record<string, Stat>;
  /** résultats des paris selon la confiance annoncée ("1" | "2" | "3") */
  calib: Record<string, Stat>;
  streak: number;
  lastDay: string | null;
  quest: { day: string; done: boolean } | null;
  best: number;
  sound: boolean;
  timed: boolean;
}

const KEY = "eduquest:v2";
const OLD_KEY = "eduquest:series:v1";

export const fresh = (): Save => ({
  xp: 0, stars: {}, stats: {}, calib: {}, streak: 0, lastDay: null, quest: null, best: 0, sound: true, timed: false,
});

let state: Save = fresh();

export const getState = (): Save => state;

export function load(): void {
  try {
    const ls = typeof localStorage === "undefined" ? null : localStorage;
    // l'ancienne sauvegarde (Séries seul) a le même format : on la reprend telle quelle
    const raw = ls ? (ls.getItem(KEY) ?? ls.getItem(OLD_KEY)) : null;
    state = { ...fresh(), ...(raw ? (JSON.parse(raw) as Partial<Save>) : {}) };
  } catch {
    state = fresh();
  }
}

export function save(): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible : on joue quand même */
  }
}

export function reset(): void {
  state = fresh();
  save();
}
