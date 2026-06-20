/**
 * Current Portfolio — a public, privacy-safe view of real positions.
 *
 * PRIVACY: this committed file holds ONLY percentages (return vs book, and weight)
 * and editorial theses. No share/contract counts, strike prices, or dollar amounts
 * ever go here. Those live in the gitignored private/ folder.
 *
 * UPDATE CADENCE (twice a week): the owner drops a current-value snapshot into
 * private/ (market value per position). Book cost is already derived from the full
 * Wealthsimple transaction history. We compute returnPct = (market − book) / book and
 * weightPct = market / total, then fill the numbers below and bump LAST_UPDATED.
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
export const LAST_UPDATED: string | null = null;
/** True until the first market-value snapshot is applied. */
export const SNAPSHOT_PENDING = true;
/** Whole-portfolio unrealized return %, computed privately from dollars (no $ exposed). */
export const TOTAL_RETURN_PCT: number | null = null;

// Combined TFSA + RRSP. Mostly long-dated LEAPS calls plus two share positions.
export const POSITIONS: Position[] = [
  { ticker: "AMD", name: "Advanced Micro Devices", theme: "AI & semis", tags: ["compute"], position: "2027 LEAPS calls", thesis: "The credible second source in AI accelerators and data-center CPUs, with room to take share." },
  { ticker: "MSFT", name: "Microsoft", theme: "AI & software", tags: ["cloud"], position: "2028 LEAPS calls", thesis: "A compounding cloud franchise with a distribution edge in enterprise AI." },
  { ticker: "NOW", name: "ServiceNow", theme: "AI & software", tags: ["enterprise"], position: "2028 LEAPS calls", thesis: "A sticky workflow platform with durable growth and a clear AI upsell." },
  { ticker: "ANET", name: "Arista Networks", theme: "AI & semis", tags: ["networking"], position: "2027 LEAPS calls", thesis: "Core networking plumbing for the AI data-center build-out." },
  { ticker: "GOOG", name: "Alphabet", theme: "Internet", tags: ["AI"], position: "2028 LEAPS calls", thesis: "A search and cloud cash machine with underappreciated AI and infrastructure assets." },
  { ticker: "RDDT", name: "Reddit", theme: "Internet", tags: ["platform"], position: "2027 LEAPS calls", thesis: "A one-of-a-kind community and data asset early in its monetization, including AI licensing." },
  { ticker: "ABNB", name: "Airbnb", theme: "Internet", tags: ["travel"], position: "2027 LEAPS calls", thesis: "An asset-light travel marketplace with strong free cash flow and expansion optionality." },
  { ticker: "BABA", name: "Alibaba", theme: "China", tags: ["cloud"], position: "2027–2028 LEAPS calls", thesis: "Cheap valuation with cloud and AI optionality as China sentiment turns." },
  { ticker: "FXI", name: "China Large-Cap ETF", theme: "China", tags: ["beta"], position: "2027 LEAPS calls", thesis: "Broad large-cap China exposure on a low valuation and supportive policy." },
  { ticker: "INDA", name: "MSCI India ETF", theme: "Equity beta", tags: ["India"], position: "2027 LEAPS calls", thesis: "Structural, long-runway growth exposure to India." },
  { ticker: "EWC", name: "MSCI Canada ETF", theme: "Equity beta", tags: ["Canada"], position: "2027 LEAPS calls", thesis: "Broad Canadian equity beta in a leveraged wrapper." },
  { ticker: "GLD", name: "Gold (SPDR)", theme: "Metals", tags: ["gold"], position: "2028 LEAPS calls", thesis: "A hedge against monetary debasement and falling real rates." },
  { ticker: "SLV", name: "Silver (iShares)", theme: "Metals", tags: ["silver"], position: "2027 LEAPS calls", thesis: "A higher-beta complement to gold with real industrial demand." },
  { ticker: "FCX", name: "Freeport-McMoRan", theme: "Metals", tags: ["copper"], position: "2028 LEAPS calls", thesis: "A leveraged play on the long-run structural deficit in copper." },
  { ticker: "ETHA", name: "Ethereum Trust", theme: "Crypto", tags: ["ETH"], position: "2027 LEAPS calls", thesis: "Convex exposure to Ethereum through a spot ETF wrapper." },
  { ticker: "IONQ", name: "IonQ", theme: "Frontier tech", tags: ["quantum"], position: "2027 LEAPS calls", thesis: "A small, speculative bet on trapped-ion quantum computing." },
  { ticker: "RBRK", name: "Rubrik", theme: "Cybersecurity", tags: ["data"], position: "2027 LEAPS calls", thesis: "Data security and cyber-resilience riding a strong enterprise upgrade cycle." },
  { ticker: "RIVN", name: "Rivian", theme: "EV", tags: ["autos"], position: "2027 LEAPS calls", thesis: "A surviving EV maker scaling production toward profitability." },
  { ticker: "IVVD", name: "Invivyd", theme: "Biotech", tags: ["antibodies"], position: "2026 LEAPS calls", thesis: "A small, high-variance bet on the antibody platform." },
  { ticker: "MDA", name: "MDA Space", theme: "Space", tags: ["Canada"], position: "Shares", thesis: "A Canadian leader in satellite systems and space robotics." },
  { ticker: "QCLS", name: "Q/C Technologies", theme: "Small cap", tags: ["speculative"], position: "Shares", thesis: "A small speculative position." },
];
