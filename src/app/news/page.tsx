"use client";

import { useEffect, useRef } from "react";

const NEWS = [
  { t: "09:41", h: "Amex Cobalt holds 5x on dining and groceries as rivals trim earn rates" },
  { t: "09:18", h: "Aeroplan publishes fall award-chart updates for transatlantic business class" },
  { t: "08:55", h: "TD lifts Aeroplan Visa Infinite welcome bonus to 40,000 points" },
  { t: "08:30", h: "Bank of Canada holds policy rate at 2.75% — variable-rate borrowers exhale" },
  { t: "08:02", h: "Scotiabank adds a new grocery multiplier for Scene+ Gold cardholders" },
  { t: "07:46", h: "Three no-FX cards that skip the 2.5% foreign-transaction fee this summer" },
  { t: "07:21", h: "Marriott Bonvoy adjusts two Canadian resorts ahead of peak season" },
];

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
      const ts = document.createElement("span"); ts.className = "nts"; ts.textContent = it.t;
      const tx = document.createElement("span"); tx.className = "ntext";
      const cur = document.createElement("span"); cur.className = "cursor"; cur.textContent = "_";
      line.append(ts, tx, cur);
      feed.appendChild(line);
      const s = it.h; let j = 0;
      const iv = window.setInterval(() => {
        if (j >= s.length) {
          window.clearInterval(iv);
          i++;
          if (i < NEWS.length) { line.removeChild(cur); timers.push(window.setTimeout(typeLine, 300)); }
          return;
        }
        tx.textContent += s.charAt(j++);
      }, 26);
      timers.push(iv);
    };
    typeLine();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="app norail">
      <main>
        <div className="head"><h1>Newswire</h1><span className="meta">live feed · cards · points · markets</span></div>
        <div className="subhead">Headlines as they break.</div>
        <div className="newsfeed" ref={feedRef} />
      </main>
    </div>
  );
}
