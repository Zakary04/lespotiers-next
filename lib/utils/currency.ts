/** Return the price as-is (prices are stored in FCFA) */
export function toXOF(fcfa: number): number {
  return fcfa
}

/** Format a FCFA price with space thousands separator: "150 000 FCFA" */
export function fmtXOF(fcfa: number): string {
  return fcfa.toLocaleString('fr-FR') + ' FCFA'
}
