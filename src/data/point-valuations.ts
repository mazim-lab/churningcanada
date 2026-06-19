/**
 * Point & mile valuations (cents per point, CAD) — CHARTED'S OWN ESTIMATES.
 *
 * These are our own directional estimates, informed by the per-program cpp already in our
 * card data and by widely-known Canadian redemption norms. They are NOT taken from a single
 * external source, and the `max` figures in particular are rough ceilings, not cited values.
 *
 * METHODOLOGY:
 *  - `baseline` is a realistic everyday redemption value. We use it for the headline
 *    "estimated first-year value" so we never over-promise.
 *  - `max` is an UPPER-END estimate reachable on premium transfer-partner sweet spots
 *    (e.g. Aeroplan / Membership Rewards business-class redemptions can reach ~5¢). Shown
 *    only as upside ("up to X¢"), never as the headline. A rough ceiling, not a guarantee.
 *    `null` max = the currency isn't transferable / has a fixed value.
 *  - For cash-back currencies, 1 point = 1 cent by definition.
 *
 * Review quarterly. TODO: if we want hard-sourced numbers, validate against a published
 * valuations table and record the source + date here.
 */

export interface Valuation {
  baseline: number; // cents per point (CAD)
  max: number | null; // upside via transfer partners, or null if fixed-value
  transferable: boolean;
}

export const POINT_VALUATIONS: Record<string, Valuation> = {
  // Transferable / flexible currencies
  'membership rewards': { baseline: 1.95, max: 5.0, transferable: true },
  'aeroplan': { baseline: 2.05, max: 5.0, transferable: true },
  'rbc avion': { baseline: 1.8, max: 3.0, transferable: true },
  'rbc rewards': { baseline: 1.8, max: 3.0, transferable: true },
  'cibc aventura': { baseline: 1.1, max: 2.3, transferable: true },
  'marriott bonvoy': { baseline: 0.8, max: 1.0, transferable: true },
  // Fixed / quasi-fixed value currencies
  'scene+': { baseline: 1.0, max: null, transferable: false },
  'td rewards': { baseline: 0.5, max: null, transferable: false },
  'bmo rewards': { baseline: 0.67, max: 0.7, transferable: false },
  'national bank': { baseline: 0.95, max: null, transferable: false },
  'mbna rewards': { baseline: 1.0, max: null, transferable: false },
  'desjardins bonusdollars': { baseline: 1.0, max: null, transferable: false },
  'pc optimum': { baseline: 0.7, max: null, transferable: false },
  'triangle rewards': { baseline: 0.5, max: null, transferable: false },
  'westjet rewards': { baseline: 1.0, max: null, transferable: false },
  'cash back': { baseline: 1.0, max: null, transferable: false },
};

export const VALUATION_SOURCE = {
  name: 'Charted estimates',
  url: null,
  asOf: '2026-06',
};

/** Look up a valuation by rewards-program string (case-insensitive, loose match). */
export function valuationFor(program: string | null | undefined): Valuation {
  const p = (program || '').toLowerCase().trim();
  if (POINT_VALUATIONS[p]) return POINT_VALUATIONS[p];
  for (const key of Object.keys(POINT_VALUATIONS)) {
    if (p.includes(key) || key.includes(p)) return POINT_VALUATIONS[key];
  }
  return { baseline: 1.0, max: null, transferable: false }; // safe default
}
