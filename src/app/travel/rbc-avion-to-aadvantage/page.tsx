import Link from "next/link";

export const metadata = {
  title: "How to transfer RBC Avion points to American Airlines AAdvantage — FinTerminal",
  description:
    "A plain-English walkthrough for Canadians: which RBC Avion cards can transfer to American Airlines, the real 1 to 0.7 ratio and 5,000 point minimum, how to do it in Avion Rewards, timing, and why to wait for a transfer bonus.",
};

const TOC = [
  { id: "cards", label: "Which cards qualify" },
  { id: "ratio", label: "The ratio and minimum" },
  { id: "how", label: "How to transfer" },
  { id: "timing", label: "How long it takes" },
  { id: "bonus", label: "Wait for a bonus" },
  { id: "example", label: "A worked example" },
  { id: "caveats", label: "Honest caveats" },
];

export default function AvionToAmericanAirlinesPage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/travel">travel</Link><span className="sep">/</span>
            <span className="cur">rbc-avion-to-aadvantage</span>
          </nav>

          <div className="head"><h1>RBC Avion to American Airlines AAdvantage</h1></div>
          <p className="lede">
            Moving RBC Avion points into American Airlines AAdvantage miles is one of the more interesting plays a
            Canadian can make, because AAdvantage miles unlock awards you simply cannot touch with most domestic
            programs. There is a real catch, though, and it is the conversion rate. Avion to AAdvantage is not one
            for one, so the headline question is always whether the redemption on the other side is good enough to
            justify the haircut. This guide covers which cards can do it, the exact numbers, the actual steps, and
            the one timing trick that makes the math a lot kinder.
          </p>
          <div className="docmeta">
            <span className="gd">TRAVEL &amp; POINTS</span><span className="sep">·</span>
            <span>about 8 min read</span><span className="sep">·</span>
            <span>ratios and bonuses change, confirm before you transfer</span>
          </div>

          <div className="toc">
            <div className="tt">In this guide</div>
            <div className="toc-grid">
              {TOC.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
            </div>
          </div>

          {/* CARDS */}
          <div id="cards" className="cd-sec" style={{ scrollMarginTop: 70 }}>Which Avion cards can transfer to airlines</div>
          <p>
            This is the part that trips people up, so let us start here. Not every card in the Avion Rewards
            ecosystem can send points to airline partners. The ability to convert to American Airlines, British
            Airways, and Cathay Pacific is tied to the Avion Elite tier, which you reach by holding one of the
            premium Avion-branded credit cards. The points those cards earn are the ones that travel.
          </p>
          <p>
            The cards that earn Avion Elite points, and can therefore transfer to American Airlines AAdvantage, are
            the RBC Avion Visa Infinite, the RBC Avion Visa Platinum, the RBC Avion Visa Infinite Privilege, and the
            RBC Avion Visa Infinite Business. If your card has Avion in the name and an annual fee, you are almost
            certainly in this group.
          </p>
          <p>
            The no-fee and lower-tier products are a different story. The RBC ION and ION+ Visa cards, and the other
            everyday RBC Rewards cards, earn points that cannot be sent to American Airlines or the other airline
            partners. Those points are still useful for things like WestJet and retail redemptions, but the airline
            transfer feature is a perk you are effectively paying the annual fee on an Avion Elite card to get.
          </p>
          <div className="cd-note">
            <div className="cap">Check your tier before you plan</div>
            <p style={{ margin: 0 }} className="sub">
              If you are counting on an AAdvantage transfer, make sure the points you hold are Avion Elite points
              from a qualifying Avion credit card. Points earned on an ION, ION+, or no-fee RBC card will not make
              the trip, and finding that out after you have planned an itinerary is no fun.
            </p>
          </div>

          {/* RATIO */}
          <div id="ratio" className="cd-sec" style={{ scrollMarginTop: 70 }}>The ratio and the minimum</div>
          <p>
            Here is the number that matters most. The base conversion rate is 10 Avion points for 7 AAdvantage
            miles, which works out to 1,000 Avion points becoming 700 miles, or a 1 to 0.7 ratio. There is no way to
            sugar-coat it: you lose 30 percent of your points count in the move. Compare that to British Airways
            Avios and Cathay Pacific Asia Miles, which both transfer from Avion at a clean 1 to 1, and you can see
            why the AAdvantage rate gives people pause.
          </p>
          <p>
            The minimum transfer is 5,000 Avion points, so this is not a feature for nibbling away at a tiny
            balance. You commit a real chunk of points each time. RBC states the rate and minimum directly in the
            Avion Rewards portal, and it can change, so treat the figures here as the current published numbers
            rather than a permanent promise and confirm them on screen before you pull the trigger.
          </p>
          <p>
            The reason the 1 to 0.7 rate can still be worth it comes down to what AAdvantage miles buy. American
            prices a number of partner awards attractively, and like Aeroplan it does not pass along the big
            carrier-imposed fuel surcharges that make some other programs painful. So a mile that costs you more
            Avion to obtain can still come out ahead if the award on the far end is priced well and cheap in cash
            fees. That math is the whole game, and it is covered in the companion guide linked at the bottom.
          </p>

          {/* HOW */}
          <div id="how" className="cd-sec" style={{ scrollMarginTop: 70 }}>How to actually do the transfer</div>
          <p>
            The mechanics are straightforward once you know where to look. You do not need to pre-link your American
            Airlines account or jump through verification hoops ahead of time. You do, however, want your AAdvantage
            account number handy and your name on both programs matching, since the miles have to land in a real
            AAdvantage account.
          </p>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <div className="st">Confirm the award seat first</div>
              <p>Before you move a single point, make sure the AAdvantage award you want is actually bookable on your dates. Transfers are one-way and slow to post, so you never want to be holding miles and hoping a seat appears.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <div className="st">Sign in to Avion Rewards</div>
              <p>Log in to your Avion Rewards account, the same one tied to your Avion Elite credit card, either on the web or through the app.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <div className="st">Find the transfer option</div>
              <p>Go to the redeem area and look for the option to convert points to a partner program, then choose American Airlines AAdvantage from the list of airline partners.</p>
            </div>
            <div className="step">
              <div className="num">4</div>
              <div className="st">Enter your AAdvantage details and amount</div>
              <p>Provide your AAdvantage membership number, then enter the number of Avion points to convert. Remember the 5,000 point minimum, and double-check the resulting mile total the portal shows you before confirming.</p>
            </div>
            <div className="step">
              <div className="num">5</div>
              <div className="st">Confirm, then wait</div>
              <p>Submit the transfer. If you would rather not do it online, RBC also lets you convert by phone at 1-800-769-2512. Either way, the points leave your Avion balance and head to American.</p>
            </div>
          </div>

          {/* TIMING */}
          <div id="timing" className="cd-sec" style={{ scrollMarginTop: 70 }}>How long it takes to post</div>
          <p>
            RBC officially asks you to allow up to four weeks for the miles to appear in your AAdvantage account.
            That is the number you should plan around. In practice many people report the miles landing far faster,
            often within a few days, but plenty of things in the points world run slower than the anecdotes suggest,
            and you do not want to be the exception while a seat you wanted slips away.
          </p>
          <p>
            This is exactly why the very first step is to confirm the award seat before transferring. American does
            not let you hold an award seat for free while you wait on points to arrive, so the safe play is to only
            transfer when you are confident the redemption will still be there, ideally on a route and date with
            healthy availability rather than the last seat on a popular flight.
          </p>

          {/* BONUS */}
          <div id="bonus" className="cd-sec" style={{ scrollMarginTop: 70 }}>Wait for a transfer bonus if you can</div>
          <p>
            Here is the single best way to soften that 1 to 0.7 rate. RBC periodically runs transfer bonuses to
            American Airlines, and when one is live it changes the math meaningfully. The most recent one I can point
            to was a 15 percent bonus that ran through August 2025, which pushed the rate to 10 Avion points for
            8.05 AAdvantage miles for the duration of the promo. That is the difference between losing 30 percent of
            your count and losing closer to 20 percent.
          </p>
          <p>
            I am not aware of an AAdvantage transfer bonus being live as I write this, so do not take the 15 percent
            figure as a current offer. The point is the pattern. If your AAdvantage trip is not time-sensitive, it
            is genuinely worth holding your Avion points and watching for the next bonus window before you transfer,
            because the same pile of points simply buys more miles during a promo. Sign up for the Avion Rewards
            emails and keep an eye on the Canadian points blogs, which flag these the moment they appear.
          </p>
          <div className="cd-note">
            <div className="cap">A bonus only helps if the seat is still there</div>
            <p style={{ margin: 0 }} className="sub">
              Waiting for a bonus is smart when your travel is flexible. It is the wrong move when you have already
              found a great award seat that may not last. Booking the trip you want beats squeezing out a few extra
              miles you might never get to use.
            </p>
          </div>

          {/* EXAMPLE */}
          <div id="example" className="cd-sec" style={{ scrollMarginTop: 70 }}>A worked example</div>
          <p>
            Let us make the numbers concrete. This is purely illustrative, so treat it as a way to see the mechanics
            rather than a quote on any specific flight.
          </p>
          <p>
            Say you want to end up with 35,000 AAdvantage miles, a balance that puts a useful short-haul or partner
            economy award within reach. At the base 1 to 0.7 rate, you would need to transfer 50,000 Avion points,
            because 50,000 multiplied by 0.7 lands you at exactly 35,000 miles. That is the cost of the haircut laid
            bare: 50,000 of your points become 35,000 of theirs.
          </p>
          <p>
            Now run the same transfer during a 15 percent bonus like the one from 2025. Those identical 50,000 Avion
            points would instead convert at roughly 0.805 per point, giving you about 40,250 AAdvantage miles. Same
            points out of your account, but 5,250 more miles in your AAdvantage balance, just for having timed the
            transfer to a promo. On a redemption that needs a bit more than 35,000 miles, that bonus can be the
            difference between booking now and topping up later.
          </p>

          {/* CAVEATS */}
          <div id="caveats" className="cd-sec" style={{ scrollMarginTop: 70 }}>The honest caveats</div>
          <ul>
            <li><strong>The 1 to 0.7 rate is a real loss.</strong> You are giving up 30 percent of your points count off the top. That is only worth it if the AAdvantage award is priced well enough to win the trade. For a mediocre redemption, you are better off keeping your Avion in a program that transfers at 1 to 1.</li>
            <li><strong>It is one-way and final.</strong> Once Avion points become AAdvantage miles, they cannot be reversed or converted back. Only transfer what you have a concrete plan to use.</li>
            <li><strong>American devalues and changes prices.</strong> AAdvantage uses dynamic pricing on a lot of its own flights and adjusts partner award costs without much warning. The miles you build up today may buy a little less tomorrow, which is an argument for transferring close to when you intend to book.</li>
            <li><strong>The minimum is steep.</strong> At 5,000 Avion points per transfer, this is not for clearing out a small leftover balance. Make sure you have enough Avion Elite points to make a transfer that actually gets you to a redemption.</li>
            <li><strong>Posting can be slow.</strong> Plan for up to four weeks even if it usually comes faster, and never transfer against a seat you are not confident will still be available.</li>
          </ul>

          <div className="cd-sec">The short version</div>
          <p>
            Transferring RBC Avion to American Airlines AAdvantage is a useful tool with a clear cost. Only Avion
            Elite cards can do it, the rate is a real 1 to 0.7, the minimum is 5,000 points, and the miles can take
            up to four weeks to show up. The move pays off when the AAdvantage award on the other side is genuinely
            good, and it pays off more when you wait for one of RBC&apos;s periodic transfer bonuses. Confirm the seat
            first, transfer second, and you will rarely regret it.
          </p>

          <div className="cd-sec">Keep going</div>
          <p>Getting the miles is only half the job. The next step is knowing where AAdvantage miles actually shine, so you transfer toward a redemption that earns its keep.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link href="/travel/aadvantage-sweet-spots" className="cd-apply">AAdvantage sweet spots →</Link>
            <Link href="/cards?q=avion" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>RBC Avion cards →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
