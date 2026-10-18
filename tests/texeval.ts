/** Mini-évaluateur pour les expressions LaTeX polynomiales produites par les générateurs (tests uniquement). */
export function texFn(expr: string, vars: string[]): (...a: number[]) => number {
  let s = expr
    .replace(/\\left|\\right/g, "")
    .replace(/\\cdot/g, "*")
    .replace(/\^\{(\d+)\}/g, "**$1")
    .replace(/\^(\d)/g, "**$1")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))")
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))");
  const set = vars.join("");
  s = s.replace(new RegExp(`([0-9${set}\\)])(?=[${set}\\(])`, "g"), "$1*");
  s = s.replace(/\)\(/g, ")*(").replace(/([xyt])\*\*(\d+)/g, "($1**$2)");
  return Function(...vars, `return (${s});`) as (...a: number[]) => number;
}
export const grab = (re: RegExp, s: string): RegExpExecArray => {
  const r = re.exec(s);
  if (!r) throw new Error(`motif introuvable : ${re} dans ${s}`);
  return r;
};
