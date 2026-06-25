"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { NewsItem } from "@/data/news";

export function NewsFeed({ items }: { items: NewsItem[] }) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.innerHTML = "";
    const timers: number[] = [];
    let i = 0;
    const typeLine = () => {
      if (i >= items.length) return;
      const it = items[i];
      const line = document.createElement("div"); line.className = "nline";
      const ts = document.createElement("span"); ts.className = "nts"; ts.textContent = it.time;
      // Headline is a link to the story's own page.
      const tx = document.createElement("a"); tx.className = "ntext nlink"; tx.href = `/news/${it.slug}`;
      const cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "_";
      line.append(ts, tx, cur);
      feed.appendChild(line);
      const s = it.headline; let j = 0;
      const iv = window.setInterval(() => {
        if (j >= s.length) {
          window.clearInterval(iv);
          i++;
          if (i < items.length) { line.removeChild(cur); timers.push(window.setTimeout(typeLine, 240)); }
          return;
        }
        tx.textContent += s.charAt(j++);
      }, 20);
      timers.push(iv);
    };
    typeLine();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [items]);

  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Newswire</h1><span className="meta">cards · points · markets · Canada first</span></div>
          <div className="newsfeed" ref={feedRef} style={{ minHeight: "auto", marginBottom: 8 }} />

          <div className="cd-sec">The stories</div>
          {items.map((n) => (
            <div key={n.slug} className="arow-card">
              <Link href={`/news/${n.slug}`} className="at nlink">{n.headline}</Link>
              <div className="ab">{n.dek}</div>
              <div className="am">
                <span className="tg">{n.category}</span><span className="sep">·</span>
                <span>{n.region === "CA" ? "Canada" : "US"}</span><span className="sep">·</span>
                <span>{n.date}</span>
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
        </div>
      </main>
    </div>
  );
}
