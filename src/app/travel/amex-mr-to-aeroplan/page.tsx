import Link from "next/link";

export const metadata = {
  title: "How to convert Amex Membership Rewards to Aeroplan — FinTerminal",
  description:
    "Step-by-step guide for transferring Amex Membership Rewards points to Air Canada Aeroplan at 1 to 1, including timing, transfer bonuses, and the mistakes to avoid.",
};

const TOC = [
  { id: "basics", label: "The basics" },
  { id: "cards", label: "Which cards qualify" },
  { id: "steps", label: "How to transfer" },
  { id: "timing", label: "When to transfer" },
  { id: "mistakes", label: "Mistakes to avoid" },
];

export default function MrToAeroplanPage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/travel">travel</Link><span className="sep">/</span>
            <span className="cur">amex-mr-to-aeroplan</span>
          </nav>

          <div className="head"><h1>Amex MR to Aeroplan</h1></div>
          <p className="lede">
            Amex Membership Rewards points are flexible, and one of their best uses for Canadians is moving them
            to Air Canada Aeroplan, where they can buy flights worth far more than a cash-back equivalent. The
            transfer itself takes about two minutes once you know where to click. The skill is in the timing,
            which is what most of this guide is about.
          </p>
          <div className="docmeta">
            <span className="gd">TRAVEL &amp; POINTS</span><span className="sep">·</span>
            <span>about 7 min read</span>
          </div>

          <div className="toc">
            <div className="tt">In this guide</div>
            <div className="toc-grid">
              {TOC.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
            </div>
          </div>

          {/* BASICS */}
          <div id="basics" className="cd-sec" style={{ scrollMarginTop: 70 }}>The basics</div>
          <p>
            Membership Rewards points transfer to Aeroplan at a 1 to 1 ratio, so 30,000 Amex points become
            30,000 Aeroplan points. Transfers are usually quick, often instant and occasionally up to a day, and
            they move in set increments such as 100 or 1,000 points depending on the card.
          </p>
          <p>
            The single most important thing to understand is that the transfer only goes one way. Once your
            points land in Aeroplan they cannot come back to Amex. That is not a problem at all, it just means
            you transfer with a plan, not on a whim.
          </p>

          {/* CARDS */}
          <div id="cards" className="cd-sec" style={{ scrollMarginTop: 70 }}>Which cards qualify</div>
          <p>
            You need an Amex card that earns full Membership Rewards points and includes airline transfer
            partners. In Canada the common ones are below.
          </p>
          <ul>
            <li><strong>American Express Cobalt Card</strong>, a favourite for its strong earn on dining and groceries.</li>
            <li><strong>American Express Gold Rewards Card</strong>.</li>
            <li><strong>The Platinum Card</strong> and <strong>Business Platinum Card</strong>.</li>
            <li><strong>Business Gold Rewards Card</strong>.</li>
          </ul>
          <div className="cd-note">
            <div className="cap">Worth checking</div>
            Not every Amex points program transfers to airline partners, and a few entry-level cards earn a
            different flavour of points with fewer options. Before you count on a transfer, confirm your specific
            card lists Aeroplan as a partner in your online account. You can compare the earning cards in our
            <Link href="/cards?q=membership%20rewards" className="lnk"> card explorer</Link>.
          </div>

          {/* STEPS */}
          <div id="steps" className="cd-sec" style={{ scrollMarginTop: 70 }}>How to transfer, step by step</div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <div className="st">Find your award first</div>
              <p>Before you move a single point, search Aeroplan for the exact flight you want and confirm the award seats are actually available. You always want to know the points are needed before they leave Amex.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <div className="st">Log in to your Amex account</div>
              <p>Sign in at the American Express Canada website or app and open the Membership Rewards or Use Points section.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <div className="st">Choose to transfer to a travel partner</div>
              <p>Look for the option to transfer points to frequent flyer and hotel partners, then select Air Canada Aeroplan from the list.</p>
            </div>
            <div className="step">
              <div className="num">4</div>
              <div className="st">Link your Aeroplan number</div>
              <p>The first time, you link your Aeroplan membership number to your Amex account. Double check the name on both accounts matches, since mismatches are the usual cause of a held transfer.</p>
            </div>
            <div className="step">
              <div className="num">5</div>
              <div className="st">Enter the amount and confirm</div>
              <p>Transfer only what your booking needs, plus a small buffer if you like. Confirm, and the points typically appear in Aeroplan within minutes, though it can occasionally take up to 24 hours.</p>
            </div>
            <div className="step">
              <div className="num">6</div>
              <div className="st">Book promptly</div>
              <p>Award space can disappear, so book your flight as soon as the points arrive. Then enjoy the satisfying part of watching a year of grocery runs turn into a trip.</p>
            </div>
          </div>

          {/* TIMING */}
          <div id="timing" className="cd-sec" style={{ scrollMarginTop: 70 }}>When to transfer</div>
          <p>
            The best transfer is one that happens right before you book, against a confirmed award seat. The
            second-best moment is during a transfer bonus.
          </p>
          <p>
            Every so often Amex runs a limited-time promotion that adds a bonus when you move points to Aeroplan,
            often somewhere in the range of 25 to 35 percent extra. If you already know you will need Aeroplan
            points for a trip in the near future, a transfer bonus is a genuinely good reason to move them a
            little early. Just be honest with yourself that you will use them, because once they are in Aeroplan
            they are committed.
          </p>
          <div className="cd-note">
            <div className="cap">Tip</div>
            Keep your points in Membership Rewards until you have a use for them. MR points can go to several
            partners, so holding them keeps your options open. Aeroplan points can only be Aeroplan points.
          </div>

          {/* MISTAKES */}
          <div id="mistakes" className="cd-sec" style={{ scrollMarginTop: 70 }}>Mistakes to avoid</div>
          <ul>
            <li><strong>Transferring before confirming award space.</strong> Always find the seat first. Moving points and then discovering the flight is gone is the classic regret.</li>
            <li><strong>Over-transferring.</strong> Send what you need. Stranded points sitting in Aeroplan with no plan are points you can no longer use elsewhere.</li>
            <li><strong>Name mismatches.</strong> Your name on Amex and Aeroplan should match. A typo can hold up the transfer.</li>
            <li><strong>Chasing a bonus with no plan.</strong> A transfer bonus is only a deal if you were going to use the points. Otherwise it is just locking points into one program early.</li>
          </ul>

          <div className="cd-sec">Next</div>
          <p>Now that your points are in Aeroplan, here is how to spend them well.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link href="/travel/aeroplan-sweet-spots" className="cd-apply">Aeroplan sweet spots →</Link>
            <Link href="/cards?q=membership%20rewards" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>Cards that earn MR →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
