import { Session } from "../game/session";
import { load } from "../game/store";
import type { Nav } from "./nav";
import { renderHome } from "./home";
import { renderPlay } from "./play";
import { renderResult } from "./result";

export function startApp(root: HTMLElement): Nav {
  load();
  const nav: Nav = {
    home: () => renderHome(root, nav),
    play: (s) => renderPlay(root, s, nav),
    finish: (s, pass) => renderResult(root, s, s.finish(pass), nav),
    result: (s, sum) => renderResult(root, s, sum, nav),
    mission: (li) => nav.play(Session.mission(li)),
    quest: () => nav.play(Session.quest()),
    endless: () => nav.play(Session.endless()),
  };
  nav.home();
  return nav;
}
