import Link from "next/link";
import { SWEET_SPOTS } from "@/data/sweet-spots";

export const metadata = {
  title: "Travel & Points — FinTerminal",
  description: "Guides for turning Canadian credit card points into real trips, with a focus on Aeroplan and Amex Membership Rewards.",
};

const ARTICLES = [
  {
    slug: "rbc-avion-to-aadvantage",
    title: "How to transfer RBC Avion points to American Airlines AAdvantage",
    dek: "Avion is one of the few Canadian programs that feeds American Airlines, though the rate is a real 1 to 0.7. Here is which cards qualify, the exact steps, and the timing trick that softens the haircut.",
    tag: "How-to",
    read: "8 min read",
    date: "Jun 2026",
  },
  {
    slug: "aadvantage-sweet-spots",
    title: "AAdvantage sweet spots: redeeming American Airlines miles",
    dek: "AAdvantage miles shine on partner airlines, not on American's own dynamic pricing. Here are the genuine sweet spots, from business class to Europe to Qatar Qsuite, and how to dodge the surcharge traps.",
    tag: "Strategy",
    read: "10 min read",
    date: "Jun 2026",
  },
  {
    slug: "avios-sweet-spots-rbc-avion-transfer",
    title: "Avios sweet spots, and converting RBC Avion to Avios",
    dek: "Avios are best on short flights and on partner airlines that skip the big surcharges. Here is where they shine, plus how to move RBC Avion points into Avios without nasty surprises.",
    tag: "Strategy",
    read: "8 min read",
    date: "Jun 2026",
  },
  {
    slug: "amex-mr-to-aeroplan",
    title: "How to convert Amex Membership Rewards to Aeroplan",
    dek: "A simple walkthrough for moving your Amex points to Air Canada Aeroplan at 1 to 1, including when to do it, how to avoid the common mistakes, and how to catch a transfer bonus.",
    tag: "How-to",
    read: "7 min read",
    date: "Jun 2026",
  },
  {
    slug: "aeroplan-sweet-spots",
    title: "Using Aeroplan points to get the most value",
    dek: "Where Aeroplan quietly pays off, from cheap short hops to business class across the Atlantic, plus the stopover trick and how to do the cents-per-point math before you book.",
    tag: "Strategy",
    read: "11 min read",
    date: "Jun 2026",
  },
];

export default function TravelPage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Travel &amp; Points</h1></div>

          <div className="cd-sec">Guides</div>
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/travel/${a.slug}`} className="arow-card">
              <div className="at">{a.title}</div>
              <div className="ab">{a.dek}</div>
              <div className="am">
                <span className="tg">{a.tag}</span><span className="sep">·</span>
                <span>{a.read}</span><span className="sep">·</span>
                <span>{a.date}</span>
              </div>
            </Link>
          ))}

          {SWEET_SPOTS.length > 0 && (
            <>
              <div className="cd-sec" style={{ marginTop: 22 }}>Sweet spots</div>
              {SWEET_SPOTS.map((s) => (
                <Link key={s.slug} href={`/travel/sweet-spots/${s.slug}`} className="arow-card">
                  <div className="at">{s.title}</div>
                  <div className="ab">{s.dek}</div>
                  <div className="am">
                    <span className="tg">Sweet spot</span><span className="sep">·</span>
                    <span>{s.program}</span><span className="sep">·</span>
                    <span>{s.read}</span><span className="sep">·</span>
                    <span>{s.date}</span>
                  </div>
                </Link>
              ))}
            </>
          )}

          <p className="lede" style={{ marginTop: 20 }}>
            New worked examples land here a couple of times a week, walking through a real redemption on a
            different program each time.
          </p>
        </div>
      </main>
    </div>
  );
}
