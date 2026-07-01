import type { MetadataRoute } from "next";
import { allCards } from "@/data/cards";
import { NEWS } from "@/data/news";
import { SWEET_SPOTS } from "@/data/sweet-spots";

const BASE = "https://www.finterminal.ca";

// Refresh the sitemap on the same short cycle as the content.
export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/news",
  "/deals",
  "/personal-finance",
  "/travel",
  "/cards",
  "/compare",
  "/portfolio",
  "/how-we-value-points",
  "/disclosure",
  "/guides/us-cards-for-canadians",
  "/guides/us-cards-for-canadians/interactive",
  "/personal-finance/smith-manoeuvre",
  "/personal-finance/costco-membership-worth-it-canada",
  "/personal-finance/pay-bills-with-credit-card-canada",
  "/travel/aeroplan-sweet-spots",
  "/travel/amex-mr-to-aeroplan",
  "/travel/avios-sweet-spots-rbc-avion-transfer",
  "/travel/rbc-avion-to-aadvantage",
  "/travel/aadvantage-sweet-spots",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const news = NEWS;

  return [
    ...STATIC_PATHS.map((p) => ({ url: `${BASE}${p}`, lastModified: now })),
    ...allCards.map((c) => ({ url: `${BASE}/cards/${c.slug}`, lastModified: now })),
    ...news.map((n) => ({ url: `${BASE}/news/${n.slug}`, lastModified: now })),
    ...SWEET_SPOTS.map((s) => ({ url: `${BASE}/travel/sweet-spots/${s.slug}`, lastModified: now })),
  ];
}
