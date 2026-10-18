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
/**
 * « Trouve l'erreur » : un raisonnement dont UNE ligne est fausse.
 * Phase 1 : toucher la ligne fausse. Phase 2 : choisir la bonne version de cette ligne.
 */
export interface BugRaw {
  k: "bug";
  q: string;
  lines: string[];
  bad: number;
  /** corrections proposées pour la ligne `bad` */
  fixes: string[];
  fix: number;
  exp: string;
}
/**
 * « Reconstitue la preuve » : `pool` mélange les étapes et des leurres ;
 * `sol` = indices de `pool` dans l'ordre correct (les leurres n'y figurent pas).
 */
export interface OrderRaw {
  k: "order";
  q: string;
  pool: string[];
  sol: number[];
  exp: string;
}
export type GuidedAnswer =
  | { k: "qcm"; o: string[]; a: number }
  | { k: "num"; ans: Fraction };
export interface GuidedStep {
  q: string;
  ans: GuidedAnswer;
  /** indices progressifs : chacun coûte une part de l'XP */
  hints: string[];
  exp: string;
}
/** « Problème guidé » façon DS : un énoncé, plusieurs étapes, des indices payants. */
export interface GuidedRaw {
  k: "guided";
  q: string;
  steps: GuidedStep[];
  exp: string;
}
export type RawQuestion = QcmRaw | NumRaw | BugRaw | OrderRaw | GuidedRaw;

export interface QuestionMeta {
  /** index du chapitre */
  ci: number;
  /** index du niveau dans le chapitre */
  li: number;
  /** index du générateur dans le niveau */
  gi: number;
  /** "L3:nat" : sert aux statistiques de réussite */
  tag: string;
  boss: boolean;
  /** question à « parier » : on indique sa confiance avant de voir les réponses */
  bet: boolean;
}
export type Question = RawQuestion & QuestionMeta;

/** [identifiant, fonction qui fabrique une question au hasard] */
export type GenEntry = readonly [id: string, make: () => RawQuestion];

export interface Level {
  /** unique dans tout le jeu (les étoiles sont rangées par id) */
  id: string;
  name: string;
  fiche: string;
  icon: string;
  color: string;
  gens: readonly GenEntry[];
  /** le piège classique du cours, affiché après une erreur */
  piege: string;
  /** rappel de cours (bouton 📖) */
  rappel: string[];
}

export interface Chapter {
  id: string;
  name: string;
  /** matière + semestre, ex. « Analyse ℝⁿ · S1 » */
  subject: string;
  icon: string;
  color: string;
  blurb: string;
  levels: readonly Level[];
}

/** Confiance annoncée avant de répondre : 1 = au hasard, 2 = plutôt sûr·e, 3 = certain·e. */
export type Conf = 1 | 2 | 3;
