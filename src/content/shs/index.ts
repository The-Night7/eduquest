import type { Chapter } from "../../types";
import { level as l1 } from "./level1";
import { level as l2 } from "./level2";

export const chapter: Chapter = {
  id: "SHS",
  name: "SHS",
  subject: "Introduction aux SHS · S1",
  icon: "🧠",
  color: "#9d4edd",
  blurb: "Démarche de recherche, état de l'art, méthodes quantitatives et qualitatives.",
  levels: [l1, l2],
};
