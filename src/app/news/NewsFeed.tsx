"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/data/news";

// The typewriter ticker shows only the newest few; the full archive lives in
// "The stories" below, revealed a page at a time.
const TICKER_MAX = 5;
const PAGE = 12;

export function NewsFeed({ items }: { items: NewsItem[] }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const ticker = items.slice(0, TICKER_MAX);
    feed.innerHTML = "";
    const timers: number[] = [];
    let i = 0;
    const typeLine = () => {
      if (i >= ticker.length) return;
      const it = ticker[i];
      const line = document.createElement("div"); line.className = "nline";
      // Month + day on the left, then the time, then the headline.
      const de = document.createElement("span"); de.className = "ndate"; de.textContent = it.date.split(",")[0];
      const ts = document.createElement("span"); ts.className = "nts"; ts.textContent = it.time;
      const tx = document.createElement("a"); tx.className = "ntext nlink"; tx.href = `/news/${it.slug}`;
      const cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "_";
      line.append(de, ts, tx, cur);
      feed.appendChild(line);
      const s = it.headline; let j = 0;
      const iv = window.setInterval(() => {
        if (j >= s.length) {
          window.clearInterval(iv);
          i++;
          if (i < ticker.length) { line.removeChild(cur); timers.push(window.setTimeout(typeLine, 240)); }
          return;
        }
        tx.textContent += s.charAt(j++);
      }, 20);
      timers.push(iv);
    };
    typeLine();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [items]);

  const shown = items.slice(0, visible);
  const remaining = items.length - visible;

  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Newswire</h1><span className="meta">cards · points · markets · Canada first</span></div>
          <div className="newsfeed" ref={feedRef} style={{ minHeight: "auto", marginBottom: 8 }} />

          <div className="cd-sec">The stories</div>
          {shown.map((n) => (
            <div key={n.slug} className="arow-card">
              <Link href={`/news/${n.slug}`} className="at nlink">{n.headline}</Link>
              <div className="ab">{n.dek}</div>
              <div className="am">
                <span>{n.date}</span><span className="sep">·</span>
                <span className="tg">{n.category}</span><span className="sep">·</span>
                <span>{n.region === "CA" ? "Canada" : "US"}</span>
                {n.exclusive
                  ? <><span className="sep">·</span><span>According to {n.exclusive.join(" and ")}</span></>
                  : n.sourceLabel
                    ? <><span className="sep">·</span><span>source: {n.sourceLabel}</span></>
                    : null}
              </div>
              <div className="nactions">
                <Link href={`/news/${n.slug}`} className="nact">Read the full story →</Link>
                {n.href ? <Link href={n.href} className="nact nact-alt">{n.hrefLabel ?? "Open related section"} →</Link> : null}
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <button type="button" className="loadmore" onClick={() => setVisible((v) => v + PAGE)}>
              Load more ({remaining} more)
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
