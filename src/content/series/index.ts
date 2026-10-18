import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";
import { level as l4 } from "./level4";
import { level as l5 } from "./level5";
import { level as l6 } from "./level6";
import { level as l7 } from "./level7";

export const chapter: Chapter = {
  id: "SER",
  name: "Séries",
  subject: "Séries numériques · S1",
  icon: "∑",
  color: "#7c5cff",
  blurb: "Convergence, critères, télescopage, séries alternées.",
  levels: [l1, l2, l3, l4, l5, l6, l7],
};
