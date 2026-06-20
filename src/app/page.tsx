import { allCards } from "@/data/cards";
import { POINT_VALUATIONS } from "@/data/point-valuations";
import { POSITIONS } from "@/data/portfolio";

const BOARD = [
  { label: "News", href: "/news", sub: "cards · points · markets", what: "Headlines as they break", status: "LIVE", brd: false },
  { label: "Personal Finance", href: "/personal-finance", sub: "credit · rates · fees", what: "Plain-English guides", status: "BOARDING", brd: true },
  { label: "Deals", href: "/deals", sub: "limited-time offers", what: "Assorted promos", status: "BOARDING", brd: true },
  { label: "Credit Cards", href: "/cards", sub: `${allCards.length} cards · explorer`, what: "Compare by real value", status: "ON TIME", brd: false },
  { label: "Travel & Points", href: "/travel", sub: "transfers · sweet spots", what: "Putting those points to use", status: "BOARDING", brd: true },
  { label: "Current Portfolio", href: "/portfolio", sub: "my holdings · theses", what: "What I own & why", status: "ON TIME", brd: false },
];

export default function Home() {
  return (
    <div className="app norail">
      <main>
        <div className="head"><h1>Departures</h1><span className="meta">FinTerminal · Canada</span></div>
        <div className="subhead">Select your flight.</div>

        <div className="stats">
          <div className="stat"><div className="l">Cards tracked</div><div className="v">{allCards.length}</div><div className="d">comprehensive data</div></div>
          <div className="stat"><div className="l">Point programs</div><div className="v em">{Object.keys(POINT_VALUATIONS).length}</div><div className="d">valued &amp; updated</div></div>
          <div className="stat"><div className="l">Portfolio holdings</div><div className="v gd">{POSITIONS.length}</div><div className="d">live, with theses</div></div>
          <div className="stat"><div className="l">Sponsored posts</div><div className="v">0</div><div className="d">independent</div></div>
        </div>

        <div className="tablewrap">
          <div className="tablescroll">
            <table>
              <thead><tr><th>Board</th><th>What&apos;s on it</th><th className="r">Status</th></tr></thead>
              <tbody>
                {BOARD.map((b) => (
                  <tr key={b.href} className="gorow">
                    <td>
                      <a href={b.href} style={{ display: "block" }}>
                        <div className="cn">{b.label}</div>
                        <div className="ci">{b.sub}</div>
                      </a>
                    </td>
                    <td><a href={b.href} style={{ display: "block" }}>{b.what}</a></td>
                    <td className="r"><a href={b.href} className={`status${b.brd ? " brd" : ""}`}>{b.brd ? "◐" : "●"} {b.status}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="foot"><span>click any row to open its board</span><span>independent · verified data · no sponsored noise</span></div>
        </div>
      </main>
    </div>
  );
}
