import { DEALS } from "@/data/deals";

export const metadata = {
  title: "Deals — FinTerminal",
  description: "A short, hand-picked list of genuinely good deals for Canadians, refreshed through the day. Links go straight to the merchant.",
};

export default function DealsPage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Deals</h1><span className="meta">hand-picked · updated daily</span></div>
          <p className="lede">
            We sift through the noise and post only a handful of deals a day, the ones we would actually tell a
            friend about. Some are great value outright, others fit the cards and points world we live in. Every
            link goes straight to the merchant, with no hoops in between.
          </p>

          <div className="cd-sec">Today&apos;s picks</div>
          {DEALS.map((d, i) => (
            <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="arow-card">
              <div className="at">{d.title}</div>
              <div className="ab">{d.blurb}</div>
              <div className="am">
                <span className="tg">{d.category}</span><span className="sep">·</span>
                <span>{d.merchant}</span><span className="sep">·</span>
                <span>{d.posted}</span>
                {d.expires && <><span className="sep">·</span><span>{d.expires}</span></>}
                <span className="ext">open →</span>
              </div>
            </a>
          ))}

          <p className="lede" style={{ marginTop: 18, fontSize: 12.5 }}>
            Deals change fast and can sell out or expire without notice. Prices and terms are set by the
            merchant, so always confirm the details on their page before you buy.
          </p>
        </div>
      </main>
    </div>
  );
}
