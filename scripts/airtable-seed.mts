// Generates seed CSVs (Deals.csv, News.csv) from the current committed data,
// so the Airtable base can be imported without losing existing content.
// Run: npx --yes tsx scripts/airtable-seed.mts
import { DEALS } from "../src/data/deals";
import { NEWS } from "../src/data/news";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "monetization/airtable-seed";
mkdirSync(OUT, { recursive: true });

const MON: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

// "Jun 24, 2026" -> "2026-06-24"
function postedToISO(s: string): string {
  const m = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/.exec(s.trim());
  if (!m) return "";
  return `${m[3]}-${MON[m[1]] ?? "01"}-${m[2].padStart(2, "0")}`;
}
// "Jun 2026" + "HH:MM" -> "2026-06-24THH:MM" (day defaults to 24 for our seed batch)
function newsPostedAt(date: string, time: string): string {
  const m = /^([A-Za-z]{3})\s+(\d{4})/.exec(date.trim());
  if (!m) return "";
  const day = "24";
  const t = /^\d{2}:\d{2}$/.test(time) ? time : "09:00";
  return `${m[2]}-${MON[m[1]] ?? "01"}-${day}T${t}`;
}

function csv(rows: string[][]): string {
  return rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
}

const dealRows: string[][] = [
  ["Title", "Merchant", "URL", "Price", "Was", "Blurb", "Category", "Posted At", "Expiry"],
  ...DEALS.map((d) => [
    d.title, d.merchant, d.url, d.price ?? "", d.was ?? "", d.blurb, d.category,
    postedToISO(d.posted), d.expiresAt ?? "",
  ]),
];

const newsRows: string[][] = [
  ["Headline", "Dek", "Body", "Category", "Region", "Source Label", "Source URL", "Section Link", "Section Label", "Posted At"],
  ...NEWS.map((n) => [
    n.headline, n.dek, n.body, n.category, n.region,
    n.sourceLabel ?? "", n.sourceUrl ?? "", n.href ?? "", n.hrefLabel ?? "",
    newsPostedAt(n.date, n.time),
  ]),
];

writeFileSync(`${OUT}/Deals.csv`, csv(dealRows), "utf8");
writeFileSync(`${OUT}/News.csv`, csv(newsRows), "utf8");
console.log(`Wrote ${OUT}/Deals.csv (${DEALS.length} deals) and ${OUT}/News.csv (${NEWS.length} stories)`);
