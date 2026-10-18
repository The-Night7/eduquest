import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";

export const chapter: Chapter = {
  id: "INF4",
  name: "Informatique 4",
  subject: "Informatique 4 · S2",
  icon: "🌐",
  color: "#ff9f1c",
  blurb: "HTML, CSS, JavaScript, DOM, PHP, AJAX et jQuery.",
  levels: [l1, l2, l3],
};
