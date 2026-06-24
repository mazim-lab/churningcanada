import { Metadata } from "next";
import Link from "next/link";
import { NEWS } from "@/data/news";

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = NEWS.find((n) => n.slug === slug);
  if (!item) return { title: "Story Not Found — FinTerminal" };
  return {
    title: `${item.headline} — FinTerminal`,
    description: item.dek,
  };
}

export default async function NewsStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = NEWS.find((n) => n.slug === slug);

  if (!item) {
    return (
      <div className="app norail">
        <main>
          <div className="head"><h1>404 · No Such Story</h1></div>
          <p className="cd-empty">
            That story isn&apos;t on the wire.{" "}
            <Link href="/news" style={{ color: "var(--emerald)", fontWeight: 700 }}>← back to the newswire</Link>
          </p>
        </main>
      </div>
    );
  }

  const paragraphs = item.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/news">news</Link><span className="sep">/</span>
            <span className="cur">{item.slug}</span>
          </nav>

          <div className="head"><h1>{item.headline}</h1></div>
          <p className="lede">{item.dek}</p>
          <div className="docmeta">
            <span className="gd">{item.category.toUpperCase()}</span><span className="sep">·</span>
            <span>{item.region === "CA" ? "Canada" : "US"}</span><span className="sep">·</span>
            <span>{item.date}</span>
            {item.exclusive
              ? <><span className="sep">·</span><span>According to {item.exclusive.join(" and ")}</span></>
              : item.sourceLabel
                ? <><span className="sep">·</span><span>source: {item.sourceLabel}</span></>
                : null}
          </div>

          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}

          <div className="cd-sec">Where to next</div>
          <p>Read the full story, or jump straight to what it affects.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            {item.href ? (
              <Link href={item.href} className="cd-apply">{item.hrefLabel ?? "Open related section"} →</Link>
            ) : null}
            <Link href="/news" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>
              ← Back to the newswire
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
