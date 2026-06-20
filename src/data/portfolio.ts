/**
 * Current Portfolio — holdings you maintain by hand, priced from a market-data API.
 *
 * To update: edit HOLDINGS below (ticker, shares, avg cost, thesis). Prices come from
 * getQuotes(), which currently returns MOCK data. To go live, replace the body of
 * getQuotes() with a server-side fetch to Twelve Data or Finnhub (free tiers cover the
 * TSX) and cache it — e.g. Next.js `fetch(url, { next: { revalidate: 900 } })` so the
 * key stays server-side and you don't hit rate limits. Never call the API from the client.
 */

export interface Holding {
  ticker: string; // e.g. "CSU"
  exchange: string; // e.g. "TSX"
  name: string;
  shares: number;
  avgCost: number; // CAD
  tags: string[];
  thesisSlug?: string; // links to /portfolio/<slug> (article on why you hold it)
}

export const HOLDINGS: Holding[] = [
  { ticker: "CSU", exchange: "TSX", name: "Constellation Software", shares: 4, avgCost: 3150, tags: ["compounder", "software"], thesisSlug: "csu" },
  { ticker: "RY", exchange: "TSX", name: "Royal Bank of Canada", shares: 80, avgCost: 118.0, tags: ["dividend", "bank"], thesisSlug: "ry" },
  { ticker: "ATD", exchange: "TSX", name: "Alimentation Couche-Tard", shares: 160, avgCost: 54.2, tags: ["compounder", "retail"], thesisSlug: "atd" },
  { ticker: "BN", exchange: "TSX", name: "Brookfield Corporation", shares: 170, avgCost: 52.1, tags: ["holdco", "alts"], thesisSlug: "bn" },
  { ticker: "TRI", exchange: "TSX", name: "Thomson Reuters", shares: 40, avgCost: 182.0, tags: ["data", "media"], thesisSlug: "tri" },
  { ticker: "SHOP", exchange: "TSX", name: "Shopify", shares: 90, avgCost: 120.0, tags: ["growth", "ecommerce"], thesisSlug: "shop" },
  { ticker: "BNS", exchange: "TSX", name: "Bank of Nova Scotia", shares: 100, avgCost: 64.5, tags: ["dividend", "bank"], thesisSlug: "bns" },
];

export interface Quote {
  last: number; // CAD
  dayPct: number; // % change today
}

const MOCK_QUOTES: Record<string, Quote> = {
  CSU: { last: 4980, dayPct: 0.6 },
  RY: { last: 176.3, dayPct: 0.3 },
  ATD: { last: 78.1, dayPct: -0.4 },
  BN: { last: 61.4, dayPct: 1.2 },
  TRI: { last: 258.7, dayPct: 0.5 },
  SHOP: { last: 96.2, dayPct: -0.8 },
  BNS: { last: 74.6, dayPct: 0.2 },
};

/** Returns a quote per ticker. MOCK for now — swap for a real cached API fetch. */
export async function getQuotes(tickers: string[]): Promise<Record<string, Quote>> {
  return Object.fromEntries(
    tickers.map((t) => [t, MOCK_QUOTES[t] ?? { last: 0, dayPct: 0 }])
  );
}
