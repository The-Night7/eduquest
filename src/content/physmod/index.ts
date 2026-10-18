import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";

export const chapter: Chapter = {
  id: "PHM",
  name: "Physique moderne",
  subject: "Physique moderne · S2",
  icon: "⚛",
  color: "#f4a261",
  blurb: "Quanta de lumière, ondes de matière, Schrödinger et puits infini.",
  levels: [l1, l2, l3],
};
