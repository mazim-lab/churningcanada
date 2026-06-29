import { Metadata } from "next";
import Link from "next/link";
import { SWEET_SPOTS } from "@/data/sweet-spots";

// All sweet-spot posts are known at build time from the committed list.
export function generateStaticParams() {
  return SWEET_SPOTS.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

function findSpot(slug: string) {
  return SWEET_SPOTS.find((s) => s.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spot = findSpot(slug);
  if (!spot) return { title: "Sweet Spot Not Found — FinTerminal" };
  return { title: `${spot.title} — FinTerminal`, description: spot.dek };
}

export default async function SweetSpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spot = findSpot(slug);

  if (!spot) {
    return (
      <div className="app norail">
        <main>
          <div className="head"><h1>404 · No Such Post</h1></div>
          <p className="cd-empty">
            That sweet spot isn&apos;t here.{" "}
            <Link href="/travel" style={{ color: "var(--emerald)", fontWeight: 700 }}>← back to Travel &amp; Points</Link>
          </p>
        </main>
      </div>
    );
  }

  const paragraphs = spot.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/travel">travel</Link><span className="sep">/</span>
            <span className="cur">{spot.slug}</span>
          </nav>

          <div className="head"><h1>{spot.title}</h1></div>
          <p className="lede">{spot.dek}</p>
          <div className="docmeta">
            <span className="gd">SWEET SPOT</span><span className="sep">·</span>
            <span>{spot.program}</span><span className="sep">·</span>
            <span>{spot.read}</span><span className="sep">·</span>
            <span>{spot.date}</span>
          </div>

          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}

          <div className="cd-sec">Where to next</div>
          <p>Dig into the full strategy, or go back for more examples.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            {spot.href ? (
              <Link href={spot.href} className="cd-apply">
                {spot.hrefLabel ?? "Read more"} →
              </Link>
            ) : null}
            <Link href="/travel" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>
              ← Back to Travel &amp; Points
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
