import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";
import { level as l5 } from "./level5";

export const chapter: Chapter = {
  id: "ANR",
  name: "Analyse dans ℝⁿ",
  subject: "Analyse ℝⁿ · S1",
  icon: "∂",
  color: "#2a9d8f",
  blurb: "Normes, topologie, limites, différentielle, extrema, intégrales doubles.",
  levels: [l1, l2, l3, l4, l5],
};
