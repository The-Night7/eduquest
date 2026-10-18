import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";
import { level as l5 } from "./level5";

export const chapter: Chapter = {
  id: "ALG",
  name: "Algèbre linéaire",
  subject: "Algèbre linéaire et bilinéaire · S2",
  icon: "🧮",
  color: "#3a86ff",
  blurb: "Réduction, applications, préhilbertien, formes bilinéaires, théorème spectral.",
  levels: [l1, l2, l3, l4, l5],
};
