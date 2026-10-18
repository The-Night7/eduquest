import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";

export const chapter: Chapter = {
  id: "INF3",
  name: "Informatique 3",
  subject: "Informatique 3 · S1",
  icon: "🌳",
  color: "#06d6a0",
  blurb: "Listes, piles, files, arbres binaires de recherche, AVL.",
  levels: [l1, l2, l3],
};
