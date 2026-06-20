"use client";

import { useEffect, useRef } from "react";

const NUM = "0123456789.";
const FEEDS = [
  { label: "AERO", vals: ["2.05", "2.10", "2.00"] },
  { label: "MR", vals: ["1.95", "1.90", "2.00"] },
];

/** Live-feel point-value ticker that re-flaps periodically like a board (mock parity). */
export function Ticker() {
  const aeroRef = useRef<HTMLSpanElement>(null);
  const mrRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cells = [aeroRef.current, mrRef.current];
    if (!cells[0] || !cells[1]) return;

    const flip = (el: HTMLSpanElement) => { el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); };
    const intervals: number[] = [];
    const render = (el: HTMLSpanElement, text: string) => {
      while (el.children.length < text.length) { const c = document.createElement("span"); c.className = "mc"; el.appendChild(c); }
      while (el.children.length > text.length) el.removeChild(el.lastChild!);
      for (let i = 0; i < text.length; i++) {
        ((cell: HTMLSpanElement, finalCh: string, idx: number) => {
          const ticks = 4 + idx * 2; let n = 0;
          const iv = window.setInterval(() => {
            if (n >= ticks) { cell.textContent = finalCh; flip(cell); window.clearInterval(iv); return; }
            cell.textContent = NUM[Math.floor(Math.random() * NUM.length)]; flip(cell); n++;
          }, 80);
          intervals.push(iv);
        })(el.children[i] as HTMLSpanElement, text.charAt(i), i);
      }
    };

    const state = [0, 0];
    cells.forEach((el, i) => render(el!, FEEDS[i].vals[0] + "¢"));
    const cycle = window.setInterval(() => {
      cells.forEach((el, i) => { state[i] = (state[i] + 1) % FEEDS[i].vals.length; render(el!, FEEDS[i].vals[state[i]] + "¢"); });
    }, 6500);
    intervals.push(cycle);
    return () => intervals.forEach((iv) => window.clearInterval(iv));
  }, []);

  return (
    <span className="ticker">
      <span className="tk">AERO</span>
      <span className="miniflap" ref={aeroRef} />
      <span className="up">▲</span>
      <span className="sep">·</span>
      <span className="tk">MR</span>
      <span className="miniflap" ref={mrRef} />
      <span className="up">▲</span>
    </span>
  );
}
