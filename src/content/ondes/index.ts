import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";

export const chapter: Chapter = {
  id: "WAV",
  name: "Ondes",
  subject: "Ondes · S2",
  icon: "🌊",
  color: "#00b4d8",
  blurb: "Oscillateurs libres et amortis, résonance, propagation, ondes stationnaires.",
  levels: [l1, l2, l3, l4],
};
