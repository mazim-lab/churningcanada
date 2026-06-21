/**
 * Current Portfolio — a public, privacy-safe view of real positions.
 *
 * PRIVACY: this committed file holds ONLY percentages (return vs book, and weight)
 * and editorial theses. No share/contract counts, strike prices, or dollar amounts
 * ever go here. Those live in the gitignored private/ folder.
 *
 * UPDATE CADENCE (twice a week): the owner drops a current-value snapshot
 * (private/holdings-report-YYYY-MM-DD.csv) into private/. Run private/compute_holdings.py
 * to get returnPct + weightPct per underlying and TOTAL_RETURN_PCT, paste them below,
 * append a PORTFOLIO_HISTORY point, and bump LAST_UPDATED.
 *
 * THESES below are first drafts for the owner to edit into his own words.
 */

export interface Position {
  ticker: string;
  name: string;
  theme: string;        // primary grouping
  tags: string[];       // extra descriptors
  position: string;     // e.g. "2027 LEAPS calls", "Shares" (no strikes/counts)
  thesis: string;       // short, owner's view
  thesisSlug?: string;  // optional long-form article at /portfolio/<slug>
  returnPct?: number;   // unrealized % vs book cost (from snapshot)
  weightPct?: number;   // % of portfolio market value (from snapshot)
}

/** Set to the snapshot date once numbers are filled in. */
export const LAST_UPDATED: string | null = "2026-06-20";
/** True until the first market-value snapshot is applied. */
export const SNAPSHOT_PENDING = false;
/** Whole-portfolio unrealized return % on current holdings, computed privately from dollars. */
export const TOTAL_RETURN_PCT: number | null = -24.0;

/** One point per snapshot (or month-end statement). y-axis is portfolio return %. */
export interface HistoryPoint {
  date: string;       // "2026-06-20" or "2026-06"
  returnPct: number;  // total portfolio return % at that date
}
// Each twice-weekly snapshot appends a point here; backfill from month-end statements.
export const PORTFOLIO_HISTORY: HistoryPoint[] = [
  { date: "2026-06-20", returnPct: -24.0 },
];

// Combined TFSA + RRSP. Mostly long-dated LEAPS calls plus two share positions.
// returnPct = unrealized vs book; weightPct = share of current market value.
export const POSITIONS: Position[] = [
  { ticker: "AMD", name: "Advanced Micro Devices", theme: "AI & semis", tags: ["compute"], position: "2027 LEAPS calls", thesis: "The credible second source in AI accelerators and data-center CPUs, with room to take share.", returnPct: 10.4, weightPct: 14.4 },
  { ticker: "MSFT", name: "Microsoft", theme: "AI & software", tags: ["cloud"], position: "2028 LEAPS calls", thesis: "A compounding cloud franchise with a distribution edge in enterprise AI.", returnPct: -27.6, weightPct: 5.6 },
  { ticker: "NOW", name: "ServiceNow", theme: "AI & software", tags: ["enterprise"], position: "2028 LEAPS calls", thesis: "A sticky workflow platform with durable growth and a clear AI upsell.", returnPct: -47.0, weightPct: 6.9 },
  { ticker: "ANET", name: "Arista Networks", theme: "AI & semis", tags: ["networking"], position: "2027 LEAPS calls", thesis: "Core networking plumbing for the AI data-center build-out.", returnPct: 38.1, weightPct: 3.2 },
  { ticker: "GOOG", name: "Alphabet", theme: "Internet", tags: ["AI"], position: "2028 LEAPS calls", thesis: "A search and cloud cash machine with underappreciated AI and infrastructure assets.", returnPct: -7.8, weightPct: 15.8 },
  { ticker: "RDDT", name: "Reddit", theme: "Internet", tags: ["platform"], position: "2027 LEAPS calls", thesis: "A one-of-a-kind community and data asset early in its monetization, including AI licensing.", returnPct: -73.7, weightPct: 3.2 },
  { ticker: "ABNB", name: "Airbnb", theme: "Internet", tags: ["travel"], position: "2027 LEAPS calls", thesis: "An asset-light travel marketplace with strong free cash flow and expansion optionality.", returnPct: -1.1, weightPct: 1.5 },
  { ticker: "BABA", name: "Alibaba", theme: "China", tags: ["cloud"], position: "2027–2028 LEAPS calls", thesis: "Cheap valuation with cloud and AI optionality as China sentiment turns.", returnPct: -76.9, weightPct: 3.6 },
  { ticker: "FXI", name: "China Large-Cap ETF", theme: "China", tags: ["beta"], position: "2027 LEAPS calls", thesis: "Broad large-cap China exposure on a low valuation and supportive policy.", returnPct: -57.8, weightPct: 7.1 },
  { ticker: "INDA", name: "MSCI India ETF", theme: "Equity beta", tags: ["India"], position: "2027 LEAPS calls", thesis: "Structural, long-runway growth exposure to India.", returnPct: -77.0, weightPct: 0.5 },
  { ticker: "EWC", name: "MSCI Canada ETF", theme: "Equity beta", tags: ["Canada"], position: "2027 LEAPS calls", thesis: "Broad Canadian equity beta in a leveraged wrapper.", returnPct: 470.1, weightPct: 22.3 },
  { ticker: "GLD", name: "Gold (SPDR)", theme: "Metals", tags: ["gold"], position: "2028 LEAPS calls", thesis: "A hedge against monetary debasement and falling real rates.", returnPct: -71.5, weightPct: 2.2 },
  { ticker: "SLV", name: "Silver (iShares)", theme: "Metals", tags: ["silver"], position: "2027 LEAPS calls", thesis: "A higher-beta complement to gold with real industrial demand.", returnPct: -93.7, weightPct: 0.2 },
  { ticker: "FCX", name: "Freeport-McMoRan", theme: "Metals", tags: ["copper"], position: "2028 LEAPS calls", thesis: "A leveraged play on the long-run structural deficit in copper.", returnPct: 67.6, weightPct: 2.5 },
  { ticker: "ETHA", name: "Ethereum Trust", theme: "Crypto", tags: ["ETH"], position: "2027 LEAPS calls", thesis: "Convex exposure to Ethereum through a spot ETF wrapper.", returnPct: -98.2, weightPct: 0.0 },
  { ticker: "IONQ", name: "IonQ", theme: "Frontier tech", tags: ["quantum"], position: "2027 LEAPS calls", thesis: "A small, speculative bet on trapped-ion quantum computing.", returnPct: -56.2, weightPct: 0.9 },
  { ticker: "RBRK", name: "Rubrik", theme: "Cybersecurity", tags: ["data"], position: "2027 LEAPS calls", thesis: "Data security and cyber-resilience riding a strong enterprise upgrade cycle.", returnPct: -70.9, weightPct: 0.5 },
  { ticker: "RIVN", name: "Rivian", theme: "EV", tags: ["autos"], position: "2027 LEAPS calls", thesis: "A surviving EV maker scaling production toward profitability.", returnPct: 7.4, weightPct: 5.2 },
  { ticker: "IVVD", name: "Invivyd", theme: "Biotech", tags: ["antibodies"], position: "2026 LEAPS calls", thesis: "A small, high-variance bet on the antibody platform.", returnPct: -55.9, weightPct: 0.7 },
  { ticker: "MDA", name: "MDA Space", theme: "Space", tags: ["Canada"], position: "Shares", thesis: "A Canadian leader in satellite systems and space robotics.", returnPct: 108.8, weightPct: 2.4 },
  { ticker: "QCLS", name: "Q/C Technologies", theme: "Small cap", tags: ["speculative"], position: "Shares", thesis: "A small speculative position.", returnPct: -7.3, weightPct: 1.5 },
];
