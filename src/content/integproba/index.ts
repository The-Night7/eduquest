import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";
import { level as l5 } from "./level5";

export const chapter: Chapter = {
  id: "ITP",
  name: "Intégration & probabilités",
  subject: "Intégration et probabilités · S2",
  icon: "∫",
  color: "#e9c46a",
  blurb: "Intégrales généralisées, paramètres, changement de variables, dénombrement, variables aléatoires.",
  levels: [l1, l2, l3, l4, l5],
};
