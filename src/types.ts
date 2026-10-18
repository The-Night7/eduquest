import type { Fraction } from "./core/fraction";

/** QCM : `o` = options affichées, `a` = index de la bonne. */
export interface QcmRaw {
  k: "qcm";
  q: string;
  o: string[];
  a: number;
  exp: string;
}
/** Réponse à saisir : nombre, fraction a/b ou décimal. */
export interface NumRaw {
  k: "num";
  q: string;
  ans: Fraction;
  exp: string;
}
export type RawQuestion = QcmRaw | NumRaw;

export interface QuestionMeta {
  /** index du niveau */
  li: number;
  /** index du générateur dans le niveau */
  gi: number;
  /** "L3:nat" : sert aux statistiques de réussite */
  tag: string;
  boss: boolean;
}
export type Question = RawQuestion & QuestionMeta;

/** [identifiant, fonction qui fabrique une question au hasard] */
export type GenEntry = readonly [id: string, make: () => RawQuestion];

export interface Level {
  id: string;
  name: string;
  fiche: string;
  icon: string;
  color: string;
  gens: readonly GenEntry[];
  /** le piège classique de la fiche, affiché après une erreur */
  piege: string;
  /** rappel de cours (bouton 📖) */
  rappel: string[];
}
