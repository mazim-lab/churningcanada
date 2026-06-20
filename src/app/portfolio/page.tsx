import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HOLDINGS, getQuotes } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Current Portfolio — FinTerminal",
  description: "My live holdings and the thesis behind each. Personal positions, not advice.",
};

const cad0 = (n: number) => n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
const cad2 = (n: number) => n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (n: number) => (n < 0 ? "−" : "+") + "$" + cad0(Math.abs(n));
const pct = (n: number) => (n < 0 ? "−" : "+") + Math.abs(n).toFixed(1) + "%";
const tsx = (ex: string) => (ex === "TSX" ? "TO" : ex);

export default async function PortfolioPage() {
  const quotes = await getQuotes(HOLDINGS.map((h) => h.ticker));
  const rows = HOLDINGS.map((h) => {
    const q = quotes[h.ticker];
    const value = h.shares * q.last;
    const cost = h.shares * h.avgCost;
    const gain = value - cost;
    return { ...h, q, value, cost, gain, gainPct: (gain / cost) * 100 };
  });

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalReturn = ((totalValue - totalCost) / totalCost) * 100;
  const maxValue = Math.max(...rows.map((r) => r.value));
  const best = rows.reduce((a, b) => (b.gain > a.gain ? b : a));
  const worst = rows.reduce((a, b) => (b.gain < a.gain ? b : a));
  rows.sort((a, b) => b.value - a.value);

  return (
    <div className="app norail">
      <main>
        <div className="head"><h1>Current Portfolio</h1><span className="meta">updated 2026-06-19 · prices delayed</span></div>
        <div className="subhead">My live holdings and the thesis behind each. <b>Personal positions, not advice.</b></div>

        <div className="stats">
          <div className="stat"><div className="l">Highest profit</div><div className="v em">{signed(best.gain)}</div><div className="d">{best.ticker}.{tsx(best.exchange)} · {pct(best.gainPct)}</div></div>
          <div className="stat"><div className="l">Highest loss</div><div className="v" style={{ color: "var(--red)" }}>{signed(worst.gain)}</div><div className="d">{worst.ticker}.{tsx(worst.exchange)} · {pct(worst.gainPct)}</div></div>
          <div className="stat"><div className="l">Total return</div><div className="v gd">{pct(totalReturn)}</div><div className="d">since inception</div></div>
          <div className="stat"><div className="l">Holdings</div><div className="v">{rows.length}</div><div className="d">each with a thesis</div></div>
        </div>

        <div className="tablewrap">
          <div className="tablescroll">
            <table>
              <thead><tr>
                <th>Holding</th><th>Tags</th><th className="r">Shares</th><th className="r">Avg cost</th>
                <th className="r">Last</th><th className="r">Day</th><th className="r">Mkt value</th><th className="r">Weight</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.ticker}>
                    <td>
                      <div className="cn">{r.ticker}<span style={{ color: "var(--ink-dim)" }}>.{tsx(r.exchange)}</span> · {r.name}</div>
                      <div className="ci"><a className="thesis" href={r.thesisSlug ? `/portfolio/${r.thesisSlug}` : "#"}>read thesis →</a></div>
                    </td>
                    <td>
                      {r.tags.map((t, i) => (
                        <span key={t} className={i === 0 ? "tag em" : "tag"}>{t}</span>
                      ))}
                    </td>
                    <td className="r mono">{r.shares}</td>
                    <td className="r mono">${cad2(r.avgCost)}</td>
                    <td className="r mono">${cad2(r.q.last)}</td>
                    <td className={`r mono ${r.q.dayPct < 0 ? "negv" : "pos"}`}>{pct(r.q.dayPct)}</td>
                    <td className="r mono big pos">${cad0(r.value)}</td>
                    <td className="r"><span className="vbar" style={{ "--w": `${(r.value / maxValue) * 100}%` } as CSSProperties} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="foot"><span>positions marked to last close · CAD · total value ${cad0(totalValue)}</span><span>each holding links to its thesis →</span></div>
        </div>
      </main>
    </div>
  );
}
