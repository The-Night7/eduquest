import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../src/content";
import { Session } from "../src/game/session";
import { isUnlocked, starsOf, today } from "../src/game/progress";
import { fresh, getState, reset } from "../src/game/store";
import type { Question } from "../src/types";

const good = (q: Question): number | string => (q.k === "qcm" ? q.a : `${q.ans.n}/${q.ans.d}`);
const bad = (q: Question): number | string => (q.k === "qcm" ? (q.a + 1) % q.o.length : "123456.789");

beforeEach(() => reset());

describe("Session — mission", () => {
  it("une mission parfaite donne 3 étoiles et ouvre le niveau suivant", () => {
    expect(isUnlocked(1)).toBe(false);
    const s = Session.mission(0);
    let last = false;
    while (!last) {
      last = s.submit(good(s.current)).last;
      if (!last) s.advance();
    }
    const sum = s.finish(true);
    expect(sum.pass).toBe(true);
    expect(sum.stars).toBe(3);
    expect(sum.unlockedNext).toBe(LEVELS[1]?.name);
    expect(starsOf(0)).toBe(3);
    expect(isUnlocked(1)).toBe(true);
    expect(getState().xp).toBe(s.gain);
  });

  it("le combo fait monter le multiplicateur jusqu'à ×3", () => {
    const s = Session.mission(0);
    expect(s.multiplier).toBe(1);
    s.submit(good(s.current));
    expect(s.multiplier).toBe(1.25);
    s.advance();
    s.submit(bad(s.current));
    expect(s.multiplier).toBe(1);
    expect(s.combo).toBe(0);
  });

  it("3 erreurs : plus de cœurs, la partie s'arrête", () => {
    const s = Session.mission(0);
    let out = s.submit(bad(s.current));
    expect(out.over).toBe(false);
    s.advance();
    out = s.submit(bad(s.current));
    s.advance();
    out = s.submit(bad(s.current));
    expect(out.over).toBe(true);
    expect(out.last).toBe(true);
    expect(s.hearts).toBe(0);
  });

  it("une erreur repose une question du même niveau (2 fois max)", () => {
    const s = Session.mission(2);
    const n0 = s.qs.length;
    s.submit(bad(s.current));
    expect(s.qs.length).toBe(n0 + 1);
    expect(s.qs[s.qs.length - 1]?.boss).toBe(true); // le boss reste en dernier
  });

  it("un boss rapporte le double", () => {
    const s = Session.mission(0);
    s.i = s.qs.length - 1; // boss
    const q = s.current;
    const out = s.submit(good(q));
    expect(out.gain).toBe(10 * (q.li + 1) * 2);
  });

  it("le temps écoulé compte comme une erreur", () => {
    const s = Session.mission(0);
    const out = s.submit(null, true);
    expect(out.ok).toBe(false);
    expect(out.timeout).toBe(true);
    expect(s.hearts).toBe(2);
  });
});

describe("Session — quête du jour", () => {
  it("mêmes questions toute la journée", () => {
    const a = Session.quest().qs.map((q) => q.q);
    const b = Session.quest().qs.map((q) => q.q);
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
  });
  it("+50 XP une seule fois, sans perte de cœurs", () => {
    const s = Session.quest();
    s.submit(bad(s.current));
    expect(s.hearts).toBe(99);
    s.finish(true);
    expect(getState().xp).toBe(50);
    expect(getState().quest).toEqual({ day: today(), done: true });
    Session.quest().finish(true);
    expect(getState().xp).toBe(50);
  });
});

describe("Session — mode infini", () => {
  it("compte les bonnes réponses d'affilée et enregistre le record", () => {
    const s = Session.endless();
    for (let i = 0; i < 4; i++) {
      s.submit(good(s.current));
      s.advance();
    }
    for (let h = 0; h < 3; h++) {
      const out = s.submit(bad(s.current));
      if (out.last) break;
      s.advance();
    }
    const sum = s.finish(false);
    expect(sum.ok).toBe(4);
    expect(sum.record).toBe(true);
    expect(getState().best).toBe(4);
  });
  it("seuls les niveaux ouverts sont tirés", () => {
    for (let i = 0; i < 200; i++) expect(Session.endless().current.li).toBe(0);
  });
});

describe("streak", () => {
  it("démarre à 1 le premier jour de jeu", () => {
    const s = Session.mission(0);
    s.submit(good(s.current));
    expect(getState().streak).toBe(1);
    expect(getState().lastDay).toBe(today());
  });
});

describe("sauvegarde", () => {
  it("fresh() est complet", () => {
    expect(Object.keys(fresh()).sort()).toEqual(
      ["best", "lastDay", "quest", "sound", "stars", "stats", "streak", "timed", "xp"],
    );
  });
});
