import Link from "next/link";

export const metadata = {
  title: "Travel & Points — FinTerminal",
  description: "Guides for turning Canadian credit card points into real trips, with a focus on Aeroplan and Amex Membership Rewards.",
};

const ARTICLES = [
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
          <p className="lede">
            Points are only worth something when they become a trip. These guides are about the fun part,
            turning the rewards you earn on everyday spending into flights you would be glad to take, without
            overpaying or overthinking it. We lead with Aeroplan and Amex Membership Rewards, because for most
            Canadians that is where the best value lives.
          </p>

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

          <p className="lede" style={{ marginTop: 20 }}>
            More guides coming, including a plain-English tour of Star Alliance partners worth knowing and how
            to find award space without losing an afternoon to it.
          </p>
        </div>
      </main>
    </div>
  );
}
