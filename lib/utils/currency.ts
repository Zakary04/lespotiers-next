const EUR_TO_XOF = 655.957

/** Convert EUR to XOF, rounded to nearest 100 */
export function toXOF(eur: number): number {
  return Math.round((eur * EUR_TO_XOF) / 100) * 100
}

/** Format an EUR price as a display FCFA string: "121 400 FCFA" */
export function fmtXOF(eur: number): string {
  return toXOF(eur).toLocaleString('fr-FR') + ' FCFA'
}
