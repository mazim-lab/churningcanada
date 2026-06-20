"use client";

import { useEffect, useRef } from "react";
import { NEWS } from "@/data/news";

export default function NewsPage() {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.innerHTML = "";
    const timers: number[] = [];
    let i = 0;
    const typeLine = () => {
      if (i >= NEWS.length) return;
      const it = NEWS[i];
      const line = document.createElement("div"); line.className = "nline";
      const ts = document.createElement("span"); ts.className = "nts"; ts.textContent = it.time;
      const tx = document.createElement("span"); tx.className = "ntext";
      const cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "_";
      line.append(ts, tx, cur);
      feed.appendChild(line);
      const s = it.headline; let j = 0;
      const iv = window.setInterval(() => {
        if (j >= s.length) {
          window.clearInterval(iv);
          i++;
          if (i < NEWS.length) { line.removeChild(cur); timers.push(window.setTimeout(typeLine, 240)); }
          return;
        }
        tx.textContent += s.charAt(j++);
      }, 20);
      timers.push(iv);
    };
    typeLine();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Newswire</h1><span className="meta">cards · points · markets · Canada first</span></div>
          <div className="subhead">Headlines as they break, with the context that actually matters to you.</div>
          <div className="newsfeed" ref={feedRef} style={{ minHeight: "auto", marginBottom: 8 }} />

          <div className="cd-sec">The stories</div>
          {NEWS.map((n, i) => {
            const Card = n.href ? "a" : "div";
            return (
              <Card key={i} {...(n.href ? { href: n.href } : {})} className="arow-card">
                <div className="at">{n.headline}</div>
                <div className="ab">{n.dek}</div>
                <div className="ab" style={{ color: "var(--ink-dim)" }}>{n.body}</div>
                <div className="am">
                  <span className="tg">{n.category}</span><span className="sep">·</span>
                  <span>{n.region === "CA" ? "Canada" : "US"}</span><span className="sep">·</span>
                  <span>{n.date}</span>
                  {n.exclusive
                    ? <span className="sep">·</span>
                    : null}
                  {n.exclusive
                    ? <span>According to {n.exclusive.join(" and ")}</span>
                    : n.sourceLabel
                      ? <><span className="sep">·</span><span>source: {n.sourceLabel}</span></>
                      : null}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
