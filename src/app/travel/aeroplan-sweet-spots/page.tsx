import Link from "next/link";

export const metadata = {
  title: "Using Aeroplan points to get the most value — FinTerminal",
  description:
    "Where Aeroplan points deliver the best value for Canadians, from cheap short-haul hops to business class to Europe, plus the stopover trick and the cents-per-point math.",
};

const TOC = [
  { id: "how", label: "How Aeroplan prices" },
  { id: "cpp", label: "The cpp math" },
  { id: "spots", label: "The sweet spots" },
  { id: "stopover", label: "The stopover trick" },
  { id: "fees", label: "Low fees advantage" },
  { id: "tips", label: "Booking tips" },
];

export default function AeroplanSweetSpotsPage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/travel">travel</Link><span className="sep">/</span>
            <span className="cur">aeroplan-sweet-spots</span>
          </nav>

          <div className="head"><h1>Aeroplan Sweet Spots</h1></div>
          <p className="lede">
            Aeroplan is one of the most rewarding loyalty programs a Canadian can hold, but only if you know
            where to point it. The same number of points can buy a forgettable economy seat or a lie-flat
            business cabin across the Atlantic, and the difference comes down to a handful of patterns worth
            learning. Here is where Aeroplan quietly pays off, and how to check the value before you book.
          </p>
          <div className="docmeta">
            <span className="gd">TRAVEL &amp; POINTS</span><span className="sep">·</span>
            <span>about 11 min read</span><span className="sep">·</span>
            <span>chart figures are approximate</span>
          </div>

          <div className="toc">
            <div className="tt">In this guide</div>
            <div className="toc-grid">
              {TOC.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
            </div>
          </div>

          {/* HOW */}
          <div id="how" className="cd-sec" style={{ scrollMarginTop: 70 }}>How Aeroplan prices flights</div>
          <p>
            Aeroplan uses two different pricing approaches, and knowing which one you are looking at is half the
            game. Flights operated by Air Canada are priced dynamically, so the points cost rises and falls a bit
            like the cash fare. Flights operated by Star Alliance and other partners are priced from a more
            predictable chart based on the regions you are travelling between, the distance flown, and the cabin
            you choose.
          </p>
          <p>
            That partner chart is where most of the best value hides, because the price holds steady even when
            cash fares are sky high. The figures in this guide are approximate and Aeroplan does adjust its chart
            over time, so always confirm the live price when you search.
          </p>

          {/* CPP */}
          <div id="cpp" className="cd-sec" style={{ scrollMarginTop: 70 }}>The cents-per-point math</div>
          <p>
            Before any redemption, it helps to know what your points are worth on that specific booking. The
            formula is simple.
          </p>
          <div className="cd-note">
            <div className="cap">The formula</div>
            <span className="fld">cpp = (cash price − taxes and fees on the award) ÷ points × 100</span>
            <p style={{ margin: "8px 0 0" }} className="sub">
              For example, a flight that would cost $1,800 in cash, booked for 60,000 points plus $120 in fees,
              gives you (1800 − 120) ÷ 60000 × 100, which is 2.8 cents per point. Anything around 2 cents or more
              is generally a solid use of Aeroplan points, and premium cabins can climb well past 5 cents.
            </p>
          </div>

          {/* SPOTS */}
          <div id="spots" className="cd-sec" style={{ scrollMarginTop: 70 }}>The sweet spots</div>

          <h4>Short hops within North America</h4>
          <p>
            For partner flights wholly within North America, Aeroplan prices economy by distance band, starting
            around 6,000 points one-way for the shortest routes and stepping up from there. On a short, expensive
            route this can be excellent value, often beating the cash fare comfortably, and it is a great way to
            spend a smaller points balance.
          </p>

          <h4>Business class to Europe</h4>
          <p>
            This is the redemption Aeroplan is famous for. A one-way business class seat from Canada to Europe on
            a Star Alliance partner tends to land somewhere around 60,000 points off-peak, for a cabin that can
            cost several thousand dollars in cash. That is the kind of booking where your points quietly do four
            or five cents of work each, which is hard to beat anywhere else.
          </p>

          <h4>Premium cabins to Asia and beyond</h4>
          <p>
            Long-haul business and first class to Asia, the South Pacific, and other distant regions follow the
            same logic on a bigger scale. The point totals are higher, but so is the cash value you are avoiding,
            so the value per point stays strong. These are the trips worth saving toward.
          </p>

          <h4>Air Canada flights for cardholders</h4>
          <p>
            If you hold an Aeroplan co-branded credit card, you unlock preferred pricing on Air Canada operated
            flights, which shaves points off many bookings and is a nice everyday perk on top of the partner
            sweet spots above.
          </p>

          {/* STOPOVER */}
          <div id="stopover" className="cd-sec" style={{ scrollMarginTop: 70 }}>The stopover trick</div>
          <p>
            One of Aeroplan&apos;s most loved features is the stopover. On a one-way award you can add a stopover,
            meaning a stay of more than 24 hours in a connecting city, for a flat 5,000 points. In practice that
            turns one trip into two destinations for a small, fixed cost. Picture flying to Europe with a few days
            in a connecting hub on the way, all on a single award. Used well, it is one of the best values in the
            program.
          </p>

          {/* FEES */}
          <div id="fees" className="cd-sec" style={{ scrollMarginTop: 70 }}>The low-fees advantage</div>
          <p>
            Aeroplan does not pass along carrier-imposed fuel surcharges on its award tickets, which is a real
            and underrated benefit. On some other programs those surcharges can add hundreds of dollars to an
            international award. With Aeroplan you generally pay only the genuine taxes and airport fees, which
            keeps more of the value in your pocket and makes the cents-per-point math look even better.
          </p>

          {/* TIPS */}
          <div id="tips" className="cd-sec" style={{ scrollMarginTop: 70 }}>Booking tips</div>
          <ul>
            <li><strong>Search partner award space directly.</strong> The predictable chart applies to partner-operated flights, so that is where to hunt for the strong values.</li>
            <li><strong>Be flexible with dates.</strong> Off-peak pricing and better award availability often sit a day or two on either side of the date you first had in mind.</li>
            <li><strong>Book the moment you find it.</strong> Premium award seats are limited and get snapped up. If the math works and the seat is there, take it.</li>
            <li><strong>Use the stopover when it fits.</strong> For 5,000 points it can add a whole second destination, so always ask whether your route allows one.</li>
            <li><strong>Some partners need a phone call.</strong> Most awards book online, but a few partner airlines are easier to reserve over the phone if you cannot find them on the site.</li>
          </ul>

          <div className="cd-sec">Get the points first</div>
          <p>If you are still building your balance, the fastest route for most Canadians is earning Membership Rewards and transferring them over.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link href="/travel/amex-mr-to-aeroplan" className="cd-apply">Transfer MR to Aeroplan →</Link>
            <Link href="/cards?q=aeroplan" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>Aeroplan cards →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
