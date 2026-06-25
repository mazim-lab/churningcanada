// Optional Airtable content source for Deals and News.
//
// If AIRTABLE_TOKEN + AIRTABLE_BASE_ID are set (in Vercel env vars), the Deals
// and News pages read from Airtable so they can be posted from a phone/grid.
// If the env vars are missing, the fetch fails, or a table is empty, these
// return null and the pages fall back to the committed src/data files — so the
// site never breaks before or after setup.
//
// This module is server-only (the token is never sent to the browser): it is
// imported by server components, which pass plain data down to client islands.

import type { Deal } from "./deals";
import type { NewsItem } from "./news";

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Fields = Record<string, unknown>;

async function fetchTable(table: string): Promise<Fields[] | null> {
  if (!TOKEN || !BASE) return null;
  try {
    const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?pageSize=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { records?: { fields?: Fields }[] };
    return (data.records ?? []).map((r) => r.fields ?? {});
  } catch {
    return null;
  }
}

function str(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v == null) return "";
  return String(v).trim();
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const v = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

const fmtPosted = (d: Date | null) => (d ? `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "");
const fmtMonthYear = (d: Date | null) => (d ? `${MON[d.getMonth()]} ${d.getFullYear()}` : "");
const fmtTime = (d: Date | null) =>
  d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "";

function slugify(s: string): string {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "story"
  );
}

export async function getDealsRemote(): Promise<Deal[] | null> {
  const rows = await fetchTable("Deals");
  if (!rows || !rows.length) return null;

  const out: { d: Deal; t: number }[] = [];
  for (const f of rows) {
    const title = str(f["Title"]);
    const url = str(f["URL"]);
    const blurb = str(f["Blurb"]);
    if (!title || !url || !blurb) continue; // skip half-filled rows
    const posted = parseDate(str(f["Posted At"]));
    const expRaw = str(f["Expiry"]);
    const exp = parseDate(expRaw);
    const expiresAt = /^\d{4}-\d{2}-\d{2}/.test(expRaw) ? expRaw.slice(0, 10) : undefined;
    out.push({
      t: posted?.getTime() ?? 0,
      d: {
        title,
        merchant: str(f["Merchant"]),
        url,
        price: str(f["Price"]) || undefined,
        was: str(f["Was"]) || undefined,
        blurb,
        category: str(f["Category"]) || "Deal",
        posted: fmtPosted(posted),
        expires: exp ? `ends ${MON[exp.getMonth()]} ${exp.getDate()}` : undefined,
        expiresAt,
      },
    });
  }
  if (!out.length) return null;
  out.sort((a, b) => b.t - a.t); // newest first
  return out.map((x) => x.d);
}

export async function getNewsRemote(): Promise<NewsItem[] | null> {
  const rows = await fetchTable("News");
  if (!rows || !rows.length) return null;

  const out: { n: NewsItem; t: number }[] = [];
  for (const f of rows) {
    const headline = str(f["Headline"]);
    const body = str(f["Body"]);
    if (!headline || !body) continue;
    const posted = parseDate(str(f["Posted At"]));
    const region: "CA" | "US" = str(f["Region"]).toUpperCase() === "US" ? "US" : "CA";
    out.push({
      t: posted?.getTime() ?? 0,
      n: {
        time: fmtTime(posted),
        slug: slugify(str(f["Slug"]) || headline),
        headline,
        dek: str(f["Dek"]),
        body,
        category: str(f["Category"]) || "News",
        region,
        date: fmtMonthYear(posted) || str(f["Date"]),
        sourceLabel: str(f["Source Label"]) || undefined,
        sourceUrl: str(f["Source URL"]) || undefined,
        href: str(f["Section Link"]) || undefined,
        hrefLabel: str(f["Section Label"]) || undefined,
      },
    });
  }
  if (!out.length) return null;
  out.sort((a, b) => b.t - a.t); // newest first
  return out.map((x) => x.n);
}
