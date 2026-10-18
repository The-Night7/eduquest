import type { Session, Summary } from "../game/session";

/** Navigation entre écrans : chaque écran reçoit ça au lieu d'importer les autres. */
export interface Nav {
  home(): void;
  /** carte des niveaux d'un chapitre */
  chapter(ci: number): void;
  play(session: Session): void;
  finish(session: Session, pass: boolean): void;
  mission(ci: number, li: number): void;
  quest(): void;
  /** `ci` = −1 : tous les chapitres */
  endless(ci: number): void;
  /** réaffiche l'écran de résultat (déjà calculé) */
  result(session: Session, summary: Summary): void;
}
