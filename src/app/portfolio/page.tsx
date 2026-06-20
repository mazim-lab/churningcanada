import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { POSITIONS, LAST_UPDATED, SNAPSHOT_PENDING, TOTAL_RETURN_PCT } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Current Portfolio — FinTerminal",
  description: "My real positions and the thesis behind each. Personal positions, not advice.",
};

const pct = (n: number) => (n < 0 ? "−" : "+") + Math.abs(n).toFixed(1) + "%";

export default function PortfolioPage() {
  const withNums = POSITIONS.filter((p) => typeof p.returnPct === "number");
  const ranked = [...withNums].sort((a, b) => (b.weightPct ?? 0) - (a.weightPct ?? 0));
  const best = withNums.length ? withNums.reduce((a, b) => ((b.returnPct ?? 0) > (a.returnPct ?? 0) ? b : a)) : null;
  const worst = withNums.length ? withNums.reduce((a, b) => ((b.returnPct ?? 0) < (a.returnPct ?? 0) ? b : a)) : null;
  const maxWeight = Math.max(1, ...withNums.map((p) => p.weightPct ?? 0));

  // Until the first snapshot, show positions in a stable, readable order.
  const rows = SNAPSHOT_PENDING ? POSITIONS : (ranked.length ? ranked : POSITIONS);

  const updated = LAST_UPDATED ? `updated ${LAST_UPDATED}` : "awaiting first snapshot";

  return (
    <div className="app norail">
      <main>
        <div className="head"><h1>Current Portfolio</h1><span className="meta">{updated} · refreshed twice weekly</span></div>
        <div className="subhead">My real positions and the thesis behind each. <b>Personal positions, not advice.</b></div>

        <div className="stats">
          <div className="stat">
            <div className="l">Highest profit</div>
            <div className="v em">{best ? pct(best.returnPct as number) : "—"}</div>
            <div className="d">{best ? best.ticker : "pending snapshot"}</div>
          </div>
          <div className="stat">
            <div className="l">Highest loss</div>
            <div className="v" style={{ color: "var(--red)" }}>{worst ? pct(worst.returnPct as number) : "—"}</div>
            <div className="d">{worst ? worst.ticker : "pending snapshot"}</div>
          </div>
          <div className="stat">
            <div className="l">Total return</div>
            <div className="v gd">{typeof TOTAL_RETURN_PCT === "number" ? pct(TOTAL_RETURN_PCT) : "—"}</div>
            <div className="d">unrealized, vs book</div>
          </div>
          <div className="stat">
            <div className="l">Holdings</div>
            <div className="v">{POSITIONS.length}</div>
            <div className="d">each with a thesis</div>
          </div>
        </div>

        {SNAPSHOT_PENDING && (
          <div className="cd-note" style={{ marginBottom: 18 }}>
            <div className="cap">Returns load with the next snapshot</div>
            Positions are mostly long-dated options, which public price feeds don&apos;t quote, so values come
            straight from my brokerage twice a week. The convictions and theses below are live now.
          </div>
        )}

        <div className="tablewrap">
          <div className="tablescroll">
            <table>
              <thead><tr>
                <th>Position</th><th>Theme</th><th>Type</th>
                <th className="r">Return</th><th className="r">Weight</th>
              </tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.ticker}>
                    <td>
                      <div className="cn">{p.ticker} · {p.name}</div>
                      <div className="ci" style={{ textTransform: "none", whiteSpace: "normal", maxWidth: 520 }}>{p.thesis}</div>
                    </td>
                    <td>
                      <span className="tag em">{p.theme}</span>
                      {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                    </td>
                    <td className="mono" style={{ color: "var(--ink-soft)", fontSize: 12, whiteSpace: "nowrap" }}>{p.position}</td>
                    <td className={`r mono ${typeof p.returnPct === "number" ? (p.returnPct < 0 ? "negv" : "pos") : ""}`}>
                      {typeof p.returnPct === "number" ? pct(p.returnPct) : "—"}
                    </td>
                    <td className="r">
                      {typeof p.weightPct === "number"
                        ? <span className="vbar" style={{ "--w": `${((p.weightPct ?? 0) / maxWeight) * 100}%` } as CSSProperties} />
                        : <span className="mono" style={{ color: "var(--ink-dim)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="foot">
            <span>combined registered accounts · percentages only, no dollar figures shown</span>
            <span>thesis articles coming soon</span>
          </div>
        </div>
      </main>
    </div>
  );
}
