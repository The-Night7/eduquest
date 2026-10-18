import type { Session, Summary } from "../game/session";

/** Navigation entre écrans : chaque écran reçoit ça au lieu d'importer les autres. */
export interface Nav {
  home(): void;
  play(session: Session): void;
  finish(session: Session, pass: boolean): void;
  mission(li: number): void;
  quest(): void;
  endless(): void;
  /** réaffiche l'écran de résultat (déjà calculé) */
  result(session: Session, summary: Summary): void;
}
