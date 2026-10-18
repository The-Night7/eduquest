import { beforeEach, describe, expect, it } from "vitest";
import { CHAPTERS } from "../src/content";
import { Session } from "../src/game/session";
import { isUnlocked, starsOf, today } from "../src/game/progress";
import { fresh, getState, reset } from "../src/game/store";
import type { Question } from "../src/types";

const good = (q: Question): number | string => {
  if (q.k === "qcm") return q.a;
  if (q.k === "num") return `${q.ans.n}/${q.ans.d}`;
  if (q.k === "bug") return `${q.bad}:${q.fix}`;
  if (q.k === "order") return q.sol.join(",");
  throw new Error("guidé : utiliser submitGuided");
};
const bad = (q: Question): number | string => {
  if (q.k === "qcm") return (q.a + 1) % q.o.length;
  if (q.k === "bug") return `${(q.bad + 1) % q.lines.length}:-1`;
  if (q.k === "order") return [...q.sol].reverse().join(",");
  return "123456.789";
};

beforeEach(() => reset());

describe("Session — mission", () => {
  it("une mission parfaite donne 3 étoiles et ouvre le niveau suivant", () => {
    expect(isUnlocked(0, 1)).toBe(false);
    const s = Session.mission(0, 0);
    let last = false;
    while (!last) {
      last = s.submit(good(s.current)).last;
      if (!last) s.advance();
    }
    const sum = s.finish(true);
    expect(sum.pass).toBe(true);
    expect(sum.stars).toBe(3);
    expect(sum.unlockedNext).toBe(CHAPTERS[0]?.levels[1]?.name);
    expect(starsOf(0, 0)).toBe(3);
    expect(isUnlocked(0, 1)).toBe(true);
    expect(getState().xp).toBe(s.gain);
  });

  it("le combo fait monter le multiplicateur jusqu'à ×3", () => {
    const s = Session.mission(0, 0);
    expect(s.multiplier).toBe(1);
    s.submit(good(s.current));
    expect(s.multiplier).toBe(1.25);
    s.advance();
    s.submit(bad(s.current));
    expect(s.multiplier).toBe(1);
    expect(s.combo).toBe(0);
  });

  it("3 erreurs : plus de cœurs, la partie s'arrête", () => {
    const s = Session.mission(0, 0);
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
    const s = Session.mission(0, 2);
    const n0 = s.qs.length;
    s.submit(bad(s.current));
    expect(s.qs.length).toBe(n0 + 1);
    expect(s.qs[s.qs.length - 1]?.boss).toBe(true); // le boss reste en dernier
  });

  it("un boss rapporte le double", () => {
    const s = Session.mission(0, 0);
    s.i = s.qs.length - 1; // boss
    const q = s.current;
    const out = s.submit(good(q));
    expect(out.gain).toBe(10 * (q.li + 1) * 2);
  });

  it("le temps écoulé compte comme une erreur", () => {
    const s = Session.mission(0, 0);
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
    const s = Session.endless(0);
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
    for (let i = 0; i < 200; i++) expect(Session.endless(0).current.li).toBe(0);
  });
});

describe("streak", () => {
  it("démarre à 1 le premier jour de jeu", () => {
    const s = Session.mission(0, 0);
    s.submit(good(s.current));
    expect(getState().streak).toBe(1);
    expect(getState().lastDay).toBe(today());
  });
});

describe("sauvegarde", () => {
  it("fresh() est complet", () => {
    expect(Object.keys(fresh()).sort()).toEqual(
      ["best", "calib", "lastDay", "quest", "sound", "stars", "stats", "streak", "timed", "xp"],
    );
  });
});

const meta = { ci: 0, li: 1, gi: 0, tag: "T:x", boss: false, bet: false } as const;
const bugQ: Question = {
  ...meta, k: "bug", q: "?", lines: ["a", "b", "c"], bad: 1, fixes: ["x", "y"], fix: 0, exp: "",
};
const orderQ: Question = { ...meta, k: "order", q: "?", pool: ["p", "q", "r", "s"], sol: [2, 0, 3], exp: "" };
const guidedQ: Question = {
  ...meta, k: "guided", q: "?", exp: "",
  steps: [
    { q: "1", ans: { k: "qcm", o: ["a", "b"], a: 0 }, hints: ["h1", "h2"], exp: "" },
    { q: "2", ans: { k: "qcm", o: ["a", "b"], a: 1 }, hints: ["h1"], exp: "" },
  ],
};
const withQ = (q: Question): Session => {
  const s = Session.mission(0, 1);
  s.qs[0] = q;
  return s;
};

describe("questions qui font réfléchir", () => {
  it("trouve l'erreur : il faut la bonne ligne ET la bonne correction", () => {
    expect(withQ(bugQ).submit("1:0").ok).toBe(true);
    expect(withQ(bugQ).submit("1:1").ok).toBe(false);
    expect(withQ(bugQ).submit("0:-1").ok).toBe(false);
  });
  it("reconstitue la preuve : ordre exact, intrus exclus", () => {
    expect(withQ(orderQ).submit("2,0,3").ok).toBe(true);
    expect(withQ(orderQ).submit("0,2,3").ok).toBe(false);
    expect(withQ(orderQ).submit("2,0,1").ok).toBe(false);
  });
  it("problème guidé : XP = 10·(niveau)·0,6·étapes, −20 % par indice (min 40 %)", () => {
    expect(withQ(guidedQ).submitGuided(0, 0).gain).toBe(Math.round(10 * 2 * 1.2));
    expect(withQ(guidedQ).submitGuided(0, 2).gain).toBe(Math.round(10 * 2 * 1.2 * 0.6));
    expect(withQ(guidedQ).submitGuided(0, 9).gain).toBe(Math.round(10 * 2 * 1.2 * 0.4));
  });
  it("problème guidé raté : un cœur de moins, pas d'XP", () => {
    const s = withQ(guidedQ);
    const out = s.submitGuided(1, 0);
    expect(out.ok).toBe(false);
    expect(out.gain).toBe(0);
    expect(s.hearts).toBe(2);
  });
  it("pari gagné : XP multiplié selon la confiance", () => {
    const base = withQ(orderQ).submit("2,0,3", false, 1).gain;
    expect(withQ(orderQ).submit("2,0,3", false, 2).gain).toBe(Math.round(base * 1.5));
    expect(withQ(orderQ).submit("2,0,3", false, 3).gain).toBe(base * 2);
  });
  it("pari raté : malus d'XP, cœur en plus à confiance 3, XP jamais négatif", () => {
    getState().xp = 100;
    let s = withQ(orderQ);
    let out = s.submit("0,2,3", false, 3);
    expect(out.penalty).toBe(10 * 2);
    expect(out.extraHeart).toBe(true);
    expect(s.hearts).toBe(1);
    expect(getState().xp).toBe(80);
    s = withQ(orderQ);
    out = s.submit("0,2,3", false, 1);
    expect(out.penalty).toBe(0);
    expect(s.hearts).toBe(2);
    getState().xp = 3;
    out = withQ(orderQ).submit("0,2,3", false, 2);
    expect(getState().xp).toBe(0);
  });
  it("la calibration est enregistrée", () => {
    withQ(orderQ).submit("2,0,3", false, 3);
    withQ(orderQ).submit("0,2,3", false, 3);
    expect(getState().calib["3"]).toEqual({ ok: 1, ko: 1 });
  });
});
