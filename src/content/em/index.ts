import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";
import { level as l3 } from "./level3";

export const chapter: Chapter = {
  id: "EM",
  name: "Électromagnétisme",
  subject: "Électromagnétisme · S1",
  icon: "🧲",
  color: "#f72585",
  blurb: "Coulomb, symétries et Gauss, potentiel, conducteurs et condensateurs.",
  levels: [l1, l2, l3],
};
