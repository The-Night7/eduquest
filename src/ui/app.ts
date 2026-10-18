import { Session } from "../game/session";
import { load } from "../game/store";
import { renderChapter } from "./chapter";
import { renderHome } from "./home";
import type { Nav } from "./nav";
import { renderPlay } from "./play";
import { renderResult } from "./result";

export function startApp(root: HTMLElement): Nav {
  load();
  const nav: Nav = {
    home: () => renderHome(root, nav),
    chapter: (ci) => renderChapter(root, ci, nav),
    play: (s) => renderPlay(root, s, nav),
    finish: (s, pass) => renderResult(root, s, s.finish(pass), nav),
    result: (s, sum) => renderResult(root, s, sum, nav),
    mission: (ci, li) => nav.play(Session.mission(ci, li)),
    quest: () => nav.play(Session.quest()),
    endless: (ci) => nav.play(Session.endless(ci)),
  };
  nav.home();
  return nav;
}
