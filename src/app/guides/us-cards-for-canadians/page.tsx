import Link from 'next/link';

const TOC = [
  { id: 'why', label: 'Why US cards' },
  { id: 'step-1', label: '1. US address' },
  { id: 'step-2', label: '2. Bank account' },
  { id: 'step-3', label: '3. First card' },
  { id: 'step-4', label: '4. Get your ITIN' },
  { id: 'step-5', label: '5. Build credit' },
  { id: 'step-6', label: '6. Chase cards' },
  { id: 'step-7', label: '7. Expand' },
  { id: 'managing', label: 'Managing from Canada' },
  { id: 'mistakes', label: 'Mistakes to avoid' },
  { id: 'roadmap', label: 'First-year sequence' },
];

export default function USCardsGuidePage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/cards">cards</Link><span className="sep">/</span>
            <span className="cur">itin-guide</span>
          </nav>

          <div className="head"><h1>US Cards for Canadians</h1></div>
          <p className="lede">
            A complete, plain-language walkthrough for getting a US mailing address, an ITIN, and a real
            US credit history, so you can reach the best rewards cards in the world. It takes some patience,
            but thousands of Canadians have done exactly this, and you can too. Take it one step at a time.
          </p>
          <div className="docmeta">
            <span className="gd">GUIDE</span><span className="sep">·</span>
            <span>about 25 min read</span><span className="sep">·</span>
            <span>covers ITIN, US credit, Chase 5/24</span>
          </div>

          <div className="toc">
            <div className="tt">In this guide</div>
            <div className="toc-grid">
              {TOC.map(s => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
            </div>
          </div>

          {/* WHY */}
          <div id="why" className="cd-sec" style={{ scrollMarginTop: 70 }}>Why Canadians get US cards</div>
          <p>
            If you care about travel rewards, the US credit card market is a different league. The welcome
            bonuses are bigger, there are far more transfer partners, and some cards hand you hotel elite
            status just for being a cardholder. Here is the short version of why it is worth the effort.
          </p>
          <ul>
            <li><strong>Bigger welcome bonuses.</strong> A US Amex Platinum routinely offers 150k or more Membership Rewards points. The Canadian version usually sits around 70k to 80k.</li>
            <li><strong>More transfer partners.</strong> Amex US has roughly twice the airline partners that Amex Canada does, which means many more sweet spots to find.</li>
            <li><strong>Status from a card.</strong> The Hilton Aspire gives you Hilton Diamond and the Marriott Bonvoy Brilliant gives you Platinum, with no nights required.</li>
            <li><strong>No foreign transaction fees.</strong> Most premium US cards waive FX fees, so you can even use them for Canadian spending without the usual 2.5 percent surcharge.</li>
          </ul>
          <p className="sub">
            The catch is the upfront work. You need a US address, you build credit from zero, and you go
            through the ITIN process with the IRS. None of it is hard on its own. We will take the steps in
            an order that lets you start earning early while the slower pieces process in the background.
          </p>

          {/* STEPS */}
          <div className="cd-sec">The step-by-step process</div>
          <div className="steps">

            {/* Step 1 */}
            <div id="step-1" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">1</div>
              <div className="st">Get a US mailing address</div>
              <div className="stm">cost: about $70 to $90 USD per year</div>
              <p>
                Before anything else you need a US residential address. This is where your cards, statements,
                and IRS letters will arrive. You have two good options.
              </p>
              <p><strong>Option A, a mail forwarding service.</strong> Providers like 24/7 Parcel, US Global Mail, and Traveling Mailbox give you a real street address (not a PO box) and scan or forward your mail. Budget $70 to $90 USD per year.</p>
              <p><strong>Option B, a friend or family member in the US.</strong> If someone is willing to receive your mail, this is the cheapest route. Just make sure they are comfortable with the occasional IRS letter and card envelope.</p>
              <div className="cd-note red">
                <div className="cap">Important check</div>
                Look your address up in the USPS tool and check the Commercial Mail Receiving Agency flag. It must read <span className="fld">N</span>. If it shows <span className="fld">Y</span>, issuers like Chase may flag and reject your applications. Some forwarding addresses are flagged as commercial, so always verify before you sign up.
              </div>
            </div>

            {/* Step 2 */}
            <div id="step-2" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">2</div>
              <div className="st">Open a US bank account</div>
              <div className="stm">timeline: 1 to 2 weeks</div>
              <p>
                A US bank account does two jobs for you. It lets you pay your card bills in US dollars, and it
                gives you a statement with a US address that issuers accept as proof. The easiest path is a
                Canadian bank with a US arm.
              </p>
              <ul>
                <li><strong>CIBC US.</strong> The most popular choice. No monthly fee on the Smart Account, and you can open it online from Canada.</li>
                <li><strong>TD Bank.</strong> Convenient if you already bank with TD in Canada, with branches across the US east coast.</li>
                <li><strong>BMO.</strong> BMO&apos;s US arm, with an easy cross-border setup.</li>
                <li><strong>RBC Bank.</strong> RBC&apos;s US presence, mainly in the southeast.</li>
              </ul>
              <div className="cd-note">
                <div className="cap">Tip</div>
                Set your US mailing address as the primary address on this account. You will use these statements as proof of address when you apply for cards.
              </div>
            </div>

            {/* Step 3 */}
            <div id="step-3" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">3</div>
              <div className="st">Get your first card via Amex Global Transfer</div>
              <div className="stm">timeline: 2 to 4 weeks</div>
              <p>
                This is the clever part. Amex Global Transfer lets you use your existing Canadian Amex
                relationship to get approved for a US Amex card, with no US credit history and no ITIN
                required yet. It is the single best on-ramp Canadians have.
              </p>
              <h4>What you need</h4>
              <ul>
                <li>An existing Canadian Amex card, open for at least 3 months</li>
                <li>Your US mailing address</li>
                <li>Your US bank account</li>
              </ul>
              <h4>How to apply</h4>
              <ul>
                <li><strong>Online.</strong> Apply on the US Amex site and check the box that says you hold an Amex card from another country, then enter your Canadian card details.</li>
                <li><strong>By phone.</strong> Call the Amex Global Transfer line and they will walk you through it.</li>
              </ul>
              <p>You may be asked to upload your passport and a bank statement showing your US address. That is normal, so just have them ready.</p>
              <div className="cd-note red">
                <div className="cap">Start personal, not business</div>
                Your first card must be a personal card. Business cards do not build personal credit history in the US, and the whole point of this first card is to open your credit file with the bureaus.
              </div>
              <p>Popular starter cards are the <Link href="/cards?country=US" className="lnk">Amex Hilton Honors</Link> (no annual fee, a great long-term keeper) and the <Link href="/cards?country=US" className="lnk">Amex Gold</Link> (strong everyday earning).</p>
              <div className="cd-note">
                <div className="cap">Choose for the long run</div>
                Your first US card becomes the oldest account on your US credit report, and account age helps your score for years. A no-fee card like the Hilton Honors is a common pick for exactly this reason.
              </div>
            </div>

            {/* Step 4 — ITIN */}
            <div id="step-4" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">4</div>
              <div className="st">Apply for an ITIN</div>
              <div className="stm">timeline: 6 to 12 weeks to process</div>
              <p>
                An Individual Taxpayer Identification Number (ITIN) is a tax ID the IRS issues to people who
                are not eligible for a Social Security Number. You need one to apply for cards from Chase,
                Citi, Capital One, Bank of America, and most issuers other than Amex.
              </p>
              <h4>Method 1: use a tax service (easiest)</h4>
              <p>
                Services that specialize in this handle the whole thing for roughly $150 to $300. They
                prepare your W-7 and file a 1040-NR return for you. This is the hands-off option if you would
                rather not touch IRS forms.
              </p>
              <h4>Method 2: do it yourself (about $10)</h4>
              <div className="cd-note">
                <div className="cap">The DIY path</div>
                The DIY route is more approachable than it looks and costs under $10. You file a 1040-NR
                return declaring a small amount of US-source gambling income, around $75 to $100, which you
                self-declare with no proof required. That creates a valid reason to need an ITIN, and you end
                up owing about $9 in tax.
              </div>
              <p>
                You will fill out Form W-7 (the ITIN application), Form 1040-NR (the non-resident return),
                Schedule 1, and Schedule OI. Have your Canadian SIN handy along with a list of any dates you
                were physically in the US during the tax year.
              </p>

              <h4>How to submit</h4>
              <div className="acc-pair">
                <div className="cd-note">
                  <div className="cap">Path A, in person (recommended)</div>
                  <ul style={{ margin: '4px 0 0' }}>
                    <li>Book an appointment at an IRS Taxpayer Assistance Center. Bring your passport, nothing gets mailed, and they stamp your application as received.</li>
                    <li>Call <span className="fld">844-545-5640</span> to book, up to two months ahead. Backup line: <span className="fld">267-941-1000</span> (not toll free, works from Canadian numbers).</li>
                    <li>Bring the completed W-7, 1040-NR, Schedule 1, Schedule OI, your passport, and duplicate copies of everything.</li>
                    <li>The visit takes 20 minutes to an hour. The clerk checks completeness only and does not approve or deny, so just remind them you are filing a 1040-NR.</li>
                  </ul>
                </div>
                <div className="cd-note red">
                  <div className="cap">Path B, mail in</div>
                  <ul style={{ margin: '4px 0 0' }}>
                    <li>Mail to: Internal Revenue Service, ITIN Operation, P.O. Box 149342, Austin, TX 78714-9342, USA.</li>
                    <li>Use Canada Post registered mail (about $15) so you have tracking and proof.</li>
                    <li>You must include your original passport, since the IRS no longer accepts certified copies. It can take around five months to come back, and passports have occasionally been lost in transit. If you have travel coming up, choose Path A.</li>
                  </ul>
                </div>
              </div>

              <h4>Line-by-line form instructions</h4>
              <p className="sub">
                Do not let the forms intimidate you. Most fields are left blank, and the real entries are your
                name, address, SIN, passport details, and one small income number. Line numbers can shift year
                to year, so always check against the current forms at <a href="https://www.irs.gov/forms-instructions" target="_blank" rel="noopener noreferrer" className="lnk">irs.gov</a>.
              </p>

              <details className="acc" open>
                <summary>Form W-7, ITIN application</summary>
                <div className="accbody">
                  <div className="arow"><strong>Top right checkbox:</strong> check <span className="fld">Apply for a new ITIN</span>.</div>
                  <div className="arow"><strong>Reason for applying:</strong> check box <span className="fld">(b) filing a tax return</span>.</div>
                  <div className="arow"><strong>Name:</strong> must match your passport exactly.</div>
                  <div className="arow"><strong>Mailing address:</strong> your Canadian address is fine. The IRS returns your documents here.</div>
                  <div className="arow"><strong>Foreign address:</strong> write it again even if it is the same as your mailing address.</div>
                  <div className="arow"><strong>Birth information:</strong> complete as shown on your passport.</div>
                  <div className="arow"><strong>6a, countries of citizenship:</strong> list every country you hold citizenship in.</div>
                  <div className="arow"><strong>6b, foreign tax ID:</strong> enter your Canadian <span className="fld">SIN</span>. This is required.</div>
                  <div className="arow"><strong>Type of US visa:</strong> leave blank, unless you hold a work visa, in which case get professional help.</div>
                  <div className="arow"><strong>Identification document:</strong> check <span className="fld">Passport</span>, enter Canada, your passport number, and the expiry date. Leave date of entry blank.</div>
                  <div className="arow"><strong>6e:</strong> No. <strong>6f, 6g:</strong> leave blank.</div>
                  <div className="arow"><strong>Sign here:</strong> sign in ink (not digital), with the date and a phone number. A Canadian number is fine.</div>
                  <div className="arow"><strong>Acceptance Agent section:</strong> do not complete.</div>
                </div>
              </details>

              <details className="acc">
                <summary>Form 1040-NR, non-resident return</summary>
                <div className="accbody">
                  <div className="arow"><strong>Filing status:</strong> Single (or Married Filing Separately if that fits).</div>
                  <div className="arow"><strong>Name:</strong> must match your W-7 exactly.</div>
                  <div className="arow"><strong>Identifying number:</strong> leave blank, since you are applying for one.</div>
                  <div className="arow"><strong>Address:</strong> your Canadian mailing address.</div>
                  <div className="arow"><strong>Virtual currency question:</strong> answer Yes or No. You are not reporting crypto income here.</div>
                  <div className="arow"><strong>Dependents:</strong> leave blank.</div>
                  <div className="arow" style={{ paddingBottom: 0 }}>
                    <strong>Income and tax lines</strong> (using $85 of gambling income as the example):
                    <table className="dtable">
                      <thead><tr><th>Line</th><th>Amount</th><th>Line</th><th>Amount</th></tr></thead>
                      <tbody>
                        <tr><td>8</td><td className="r">$85</td><td>22</td><td className="r">$9</td></tr>
                        <tr><td>9</td><td className="r">$85</td><td>24</td><td className="r">$9</td></tr>
                        <tr><td>11</td><td className="r">$85</td><td>26</td><td className="r">$0</td></tr>
                        <tr><td>15</td><td className="r">$85</td><td>32</td><td className="r">$0</td></tr>
                        <tr><td>16</td><td className="r">$9</td><td>33</td><td className="r">$0</td></tr>
                        <tr><td>18</td><td className="r">$9</td><td>37</td><td className="r">$9</td></tr>
                      </tbody>
                    </table>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-dim)', fontFamily: 'var(--mono)' }}>Line 16 ($9) comes from the IRS tax table for income between $75 and $99. Pick any amount in that range.</span>
                  </div>
                  <div className="arow"><strong>Line 38:</strong> leave blank. Income under $1,000 means no penalty.</div>
                  <div className="arow"><strong>Third party designee:</strong> No.</div>
                  <div className="arow"><strong>Sign here:</strong> sign in ink, with the date and your occupation. Phone and email are optional, and you can leave the PIN blank.</div>
                  <div className="arow"><strong>Paid preparer:</strong> leave blank unless you used a paid service, in which case they must include their PTIN.</div>
                </div>
              </details>

              <details className="acc">
                <summary>Schedule OI, other information</summary>
                <div className="accbody">
                  <div className="arow"><strong>Name:</strong> at the top of the page.</div>
                  <div className="arow"><strong>A:</strong> your country of citizenship during the tax year.</div>
                  <div className="arow"><strong>B:</strong> <span className="fld">Canada</span>, if you live and work in Canada.</div>
                  <div className="arow"><strong>C, D:</strong> usually No.</div>
                  <div className="arow"><strong>E:</strong> write <span className="fld">Not present in U.S. — no U.S. immigration status</span>, unless you were in the US on December 31.</div>
                  <div className="arow"><strong>F:</strong> No.</div>
                  <div className="arow"><strong>G:</strong> list the dates you entered and left the US that year, including layovers. You can check your history at <a href="https://i94.cbp.dhs.gov" target="_blank" rel="noopener noreferrer" className="lnk">i94.cbp.dhs.gov</a>. Leave it blank if you were not in the US.</div>
                  <div className="arow"><strong>H:</strong> the number of days present in the US for each of the past 3 tax years.</div>
                  <div className="arow"><strong>I, J, K:</strong> usually No. <strong>L, M:</strong> leave blank.</div>
                </div>
              </details>

              <details className="acc">
                <summary>Schedule 1, additional income</summary>
                <div className="accbody">
                  <div className="arow"><strong>Line 8b:</strong> enter your gambling income, the same figure as 1040-NR line 8, for example <span className="fld">$85</span>.</div>
                  <div className="arow"><strong>Everything else:</strong> leave blank or zero.</div>
                </div>
              </details>

              <div className="cd-note red">
                <div className="cap">Substantial presence test</div>
                If (this year&apos;s days &times; 1) plus (last year &times; one third) plus (two years ago &times; one sixth) comes to 183 or more, you may be treated as a US tax resident. If that is your situation, get professional help before filing.
              </div>

              <h4>Payment and what happens next</h4>
              <ul>
                <li>Pay the roughly $9 by cheque to the United States Treasury with your mailing, or online at <a href="https://www.irs.gov/payments" target="_blank" rel="noopener noreferrer" className="lnk">irs.gov/payments</a>.</li>
                <li>Any late penalty caps at 100 percent of the tax owed, so about $9 at most plus a little interest. There is no need to stress about timing.</li>
                <li>Processing takes 6 to 8 weeks, after which you receive a letter with your nine-digit ITIN.</li>
                <li>As soon as it arrives, link it to your Amex US account.</li>
                <li>An ITIN expires if it is not used on a return for three years, so file periodically to keep it active. Lost the letter? Call <span className="fld">267-941-1000</span> with your name, address, and birthdate.</li>
              </ul>
              <div className="cd-note">
                <div className="cap">You do not have to wait</div>
                This is exactly why we got the Amex card first. Your credit is already building through Global Transfer while your ITIN works its way through the IRS in parallel.
              </div>
              <p className="sub" style={{ fontSize: 12 }}>
                This guide is educational and is not tax advice. For your specific situation, talk to a tax professional.
              </p>
            </div>

            {/* Step 5 */}
            <div id="step-5" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">5</div>
              <div className="st">Build your US credit history</div>
              <div className="stm">timeline: 3 to 12 months</div>
              <p>
                Now comes the patient part. Your first Amex is reporting to the US bureaus, and you want enough
                history before other issuers will say yes. A few habits make a real difference here.
              </p>
              <ul>
                <li>Add one or two more Amex personal cards in the first 3 to 6 months. Each one adds depth to your file.</li>
                <li>Amex business cards do not count toward Chase&apos;s 5/24 rule, so you can pick up a Business Platinum or Business Gold for the bonuses without hurting later Chase applications.</li>
                <li>Keep utilization around 5 to 10 percent across your cards. Low utilization signals that you handle credit well.</li>
                <li>If you can visit a US branch, open a Chase checking account. A banking relationship meaningfully helps your approval odds down the road.</li>
              </ul>
              <div className="cd-note red">
                <div className="cap">Do this the day your ITIN arrives</div>
                Call Amex and have them link your ITIN to every US account you hold. This ties your credit history to your ITIN in the bureau files. Skip it, and Chase and others may not be able to pull your credit.
              </div>
            </div>

            {/* Step 6 */}
            <div id="step-6" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">6</div>
              <div className="st">Apply for Chase cards</div>
              <div className="stm">timeline: 12 to 18 months after your first card</div>
              <p>
                Chase is the goal for most people. Ultimate Rewards points are wonderfully flexible and the
                co-branded hotel cards are best in class. Chase is also the pickiest issuer, so it pays to be
                ready before you apply.
              </p>
              <h4>What Chase looks for</h4>
              <ul>
                <li>At least 12 to 18 months of US credit history</li>
                <li>A score above roughly 700, which you can track on Credit Karma US</li>
                <li>Ideally a Chase banking relationship</li>
              </ul>
              <h4>The 5/24 rule</h4>
              <p>
                Chase will decline you automatically if you have opened five or more personal cards across all
                issuers in the past 24 months. That is the whole reason we leaned on Amex business cards
                earlier, since those do not count toward 5/24.
              </p>
              <p>
                Good first Chase cards are the <Link href="/cards?country=US" className="lnk">Sapphire Preferred</Link> (a great starter), the <Link href="/cards?country=US" className="lnk">Ink Business Preferred</Link> (does not count toward 5/24), and the <Link href="/cards?country=US" className="lnk">Chase Aeroplan card</Link> (handy for Canadians).
              </p>
              <div className="cd-note">
                <div className="cap">Tip</div>
                If you can get to a US Chase branch, apply in person. Chase sometimes needs document verification for applicants without an SSN, and being in branch makes that much smoother.
              </div>
            </div>

            {/* Step 7 */}
            <div id="step-7" className="step" style={{ scrollMarginTop: 70 }}>
              <div className="num">7</div>
              <div className="st">Expand to other issuers</div>
              <div className="stm">timeline: 18 months and beyond</div>
              <p>Once Chase is on board and your history is solid, the rest of the market opens up.</p>
              <ul>
                <li><strong>Capital One.</strong> Usually wants around three years of history, with a strict limit of one application every six months. The Venture X makes it worthwhile.</li>
                <li><strong>Citi.</strong> The Strata Premier is excellent, and ThankYou points transfer to a strong set of airlines including Air Canada Aeroplan.</li>
                <li><strong>Bank of America.</strong> The Alaska Airlines card is a long-time favourite. Apply in branch or by phone if you are using an ITIN, since their online system does not always handle ITINs well.</li>
              </ul>
              <p>
                From here it is about steady habits. Pay in full every month, keep your accounts open, and
                space out applications. A mature profile earns you better approvals and higher limits over time.
              </p>
            </div>
          </div>

          {/* MANAGING */}
          <div id="managing" className="cd-sec" style={{ scrollMarginTop: 70 }}>Managing your US cards from Canada</div>
          <h4>Paying your bills</h4>
          <p>Skip your bank&apos;s exchange rate, since you will lose 2 to 2.5 percent on every transfer. Use a dedicated FX service like Wise, VBCE, or Knightsbridge FX instead. They typically run about 1 percent above the spot rate, which adds up to real savings over a year.</p>
          <h4>Using US cards in Canada</h4>
          <p>Here is a nice perk. Most US premium cards have no foreign transaction fee, so you can use them for everyday Canadian spending and earn US points without the 2.5 percent surcharge you would pay abroad on a Canadian card. Just keep the double conversion in mind.</p>
          <h4>Two-player mode</h4>
          <p>If you have a spouse or partner, set them up alongside you. Two players means double the welcome bonuses, double the points, and the ability to pool points between accounts. It is the single biggest force multiplier in this hobby.</p>

          {/* MISTAKES */}
          <div id="mistakes" className="cd-sec" style={{ scrollMarginTop: 70 }}>Mistakes to avoid</div>
          <ul>
            <li><strong>Getting too many cards too fast.</strong> Five or more personal cards in 24 months locks you out of Chase. Plan your sequence.</li>
            <li><strong>Forgetting to link your ITIN to existing Amex accounts.</strong> Without it, your history may be invisible to other issuers. Call Amex the day your ITIN arrives.</li>
            <li><strong>Paying bills at bank FX rates.</strong> That 2 to 2.5 percent spread is pure waste. Use Wise, VBCE, or Knightsbridge FX.</li>
            <li><strong>Cancelling your oldest US card.</strong> It anchors your credit history. Downgrade it to a no-fee version if you must, but keep it open.</li>
            <li><strong>Not checking the commercial-address flag.</strong> Issuers can reject you if your address shows as a Commercial Mail Receiving Agency on USPS.</li>
            <li><strong>Starting with a business card.</strong> Business cards do not report to personal bureaus, so your first card has to be personal.</li>
          </ul>

          {/* ROADMAP */}
          <div id="roadmap" className="cd-sec" style={{ scrollMarginTop: 70 }}>A realistic first-year sequence</div>
          <p className="sub">Every situation is different, but this is a solid framework for your first 18 months and beyond.</p>
          <div className="acc-pair">
            <div className="cd-note"><div className="cap">Month 0</div><strong>Amex Hilton Honors (no-fee keeper).</strong> Your anchor card, kept forever as your oldest account.</div>
            <div className="cd-note"><div className="cap">Month 1 to 2</div><strong>Apply for your ITIN.</strong> Submit the W-7 through a service or DIY. Roughly 8 weeks to process.</div>
            <div className="cd-note"><div className="cap">Month 3</div><strong>Amex Hilton Aspire or Amex Gold.</strong> A second personal card to deepen your file, chosen on current offers.</div>
            <div className="cd-note"><div className="cap">Month 3 to 6</div><strong>Amex Business Platinum and Business Gold.</strong> Business cards do not count toward 5/24, so grab them for the bonuses.</div>
            <div className="cd-note"><div className="cap">Month 4</div><strong>ITIN arrives, link it everywhere.</strong> Call Amex to link your ITIN to every US account.</div>
            <div className="cd-note"><div className="cap">Month 12 to 18</div><strong>Chase Sapphire Preferred and Ink Business Preferred.</strong> You now have the history Chase wants.</div>
            <div className="cd-note"><div className="cap">Month 18+</div><strong>Chase United, IHG, Hyatt, then Capital One and Citi.</strong> Keep expanding, spacing applications a few months apart.</div>
          </div>

          {/* CTA */}
          <div className="cd-sec">Ready to start</div>
          <p>Browse the US cards in our explorer to see current welcome bonuses and plan your sequence.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <Link href="/cards?country=US" className="cd-apply">Browse US cards →</Link>
            <Link href="/cards?country=CA" className="cd-apply" style={{ borderColor: 'var(--line-strong)', color: 'var(--ink)' }}>Canadian cards →</Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'US Credit Cards for Canadians: the ITIN guide',
              description: 'Step-by-step guide to getting an ITIN, building US credit, and accessing the best US rewards cards as a Canadian.',
              datePublished: '2026-02-22',
              dateModified: '2026-06-20',
              author: { '@type': 'Organization', name: 'FinTerminal' },
              publisher: { '@type': 'Organization', name: 'FinTerminal' },
            }),
          }}
        />
      </main>
    </div>
  );
}
