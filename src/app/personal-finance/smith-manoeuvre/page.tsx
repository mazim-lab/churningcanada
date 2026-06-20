import Link from "next/link";

export const metadata = {
  title: "The Smith Manoeuvre, explained properly — FinTerminal",
  description:
    "A clear, honest, step-by-step guide to the Smith Manoeuvre for Canadian homeowners: how it works, every variation, the CRA rules that keep it valid, and the risks worth respecting.",
};

const TOC = [
  { id: "what", label: "What it is" },
  { id: "why", label: "Why it works" },
  { id: "need", label: "What you need" },
  { id: "loop", label: "The core loop" },
  { id: "variations", label: "The variations" },
  { id: "clean", label: "Keeping CRA happy" },
  { id: "risks", label: "The risks" },
  { id: "who", label: "Is it for you" },
];

export default function SmithManoeuvrePage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <nav className="crumb">
            <Link href="/">home</Link><span className="sep">/</span>
            <Link href="/personal-finance">personal-finance</Link><span className="sep">/</span>
            <span className="cur">smith-manoeuvre</span>
          </nav>

          <div className="head"><h1>The Smith Manoeuvre</h1></div>
          <p className="lede">
            If you own a home in Canada, the Smith Manoeuvre is one of the most powerful, and most
            misunderstood, financial strategies available to you. Done patiently and properly, it turns the
            interest on your mortgage into a tax deduction and quietly builds an investment portfolio while you
            pay your house off. Done carelessly, it adds leverage and paperwork you do not want. This guide
            walks through all of it, the upside and the cautions, so you can decide with clear eyes.
          </p>
          <div className="docmeta">
            <span className="gd">PERSONAL FINANCE</span><span className="sep">·</span>
            <span>about 18 min read</span><span className="sep">·</span>
            <span>educational, not advice</span>
          </div>

          <div className="toc">
            <div className="tt">In this guide</div>
            <div className="toc-grid">
              {TOC.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
            </div>
          </div>

          {/* WHAT */}
          <div id="what" className="cd-sec" style={{ scrollMarginTop: 70 }}>What the Smith Manoeuvre actually is</div>
          <p>
            In Canada, the interest you pay on your home mortgage is not tax-deductible. The interest you pay
            on money you borrow to earn investment income is. The Smith Manoeuvre, named after Canadian
            financial planner Fraser Smith, is simply a disciplined way to convert the first kind of debt into
            the second kind over time, without borrowing any new money from your own pocket.
          </p>
          <p>
            The mechanics rest on a special kind of mortgage called a readvanceable mortgage. It pairs a normal
            amortizing mortgage with a line of credit, and every dollar of principal you pay down frees up an
            equal dollar of room on that line of credit. You then borrow that freed-up room and invest it. Because
            the borrowed money is being used to earn income, its interest becomes deductible. You claim the
            deduction, receive a tax refund, and use that refund to pay down your mortgage a little faster, which
            frees up a little more room, and around it goes.
          </p>
          <p>
            Over the years, your non-deductible mortgage shrinks while your deductible investment loan grows to
            replace it. By the time the mortgage is gone, you are left with an investment portfolio and a loan
            whose interest the government helps you carry. That is the whole idea in one breath.
          </p>

          {/* WHY */}
          <div id="why" className="cd-sec" style={{ scrollMarginTop: 70 }}>Why it works</div>
          <p>
            The strategy leans on one long-standing rule in the Income Tax Act. Interest is deductible when the
            borrowed money is used for the purpose of earning income from a business or property. A regular
            mortgage on the home you live in fails that test, because the purpose is shelter, not income. A line
            of credit you draw on to buy income-producing investments passes it.
          </p>
          <p>
            So the Smith Manoeuvre does not invent a loophole. It re-routes money you were already going to pay
            toward your mortgage so that, dollar for dollar, your debt slowly moves from the non-deductible side
            of the ledger to the deductible side. The two extra engines that make it more than a tax trick are
            the investment growth on the money you put to work, and the compounding effect of reinvesting your
            tax refunds back into the mortgage.
          </p>

          {/* NEED */}
          <div id="need" className="cd-sec" style={{ scrollMarginTop: 70 }}>What you need before you start</div>
          <ul>
            <li><strong>A readvanceable mortgage.</strong> This is the non-negotiable tool. Common ones in Canada include the Scotia STEP, the National Bank All-in-One, Manulife One, the RBC Homeline Plan, and MCAP Fusion. They combine a mortgage with a line of credit that grows automatically as you pay principal.</li>
            <li><strong>Home equity.</strong> You generally need at least 20 percent equity, because a readvanceable line of credit cannot push your total borrowing above 80 percent of the home&apos;s value.</li>
            <li><strong>Stable cash flow.</strong> You will be carrying line-of-credit interest every month. Comfortable, reliable income makes this far less stressful.</li>
            <li><strong>A long time horizon and a steady temperament.</strong> This is a strategy measured in years, sometimes the full length of your amortization. You also need to be able to watch a leveraged portfolio dip without panicking.</li>
            <li><strong>A plan for the investments.</strong> Broad, low-cost, income-producing investments are the usual fit. Decide your approach before the first dollar goes in.</li>
          </ul>
          <div className="cd-note">
            <div className="cap">A sensible order of operations</div>
            For most families, it is worth filling your TFSA and RRSP room first, since those give you tax
            advantages without leverage. The Smith Manoeuvre tends to make the most sense once the easy,
            unleveraged tax shelters are already working for you.
          </div>

          {/* LOOP */}
          <div id="loop" className="cd-sec" style={{ scrollMarginTop: 70 }}>The core loop, step by step</div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <div className="st">Set up the readvanceable mortgage</div>
              <p>Arrange a readvanceable mortgage and ask the lender to create a separate line-of-credit sub-account dedicated only to investing. Keeping it separate from day one is what makes the tax trail clean later.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <div className="st">Make your regular mortgage payment</div>
              <p>Each payment pays down some principal. On a readvanceable mortgage, that exact amount of principal becomes new available room on your line of credit.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <div className="st">Borrow the freed-up room and invest it</div>
              <p>Withdraw the newly available room from your investment line of credit and put it straight into eligible income-producing investments. Move the money directly, so the paper trail shows the borrowed funds going to the investment and nowhere else.</p>
            </div>
            <div className="step">
              <div className="num">4</div>
              <div className="st">Deduct the interest</div>
              <p>The interest on that investment line of credit is tax-deductible. You report it as a carrying charge on your return, which lowers your taxable income.</p>
            </div>
            <div className="step">
              <div className="num">5</div>
              <div className="st">Put the tax refund back on the mortgage</div>
              <p>When your refund arrives, apply it as a prepayment against the non-deductible mortgage. That prepayment frees up still more line-of-credit room, which you then invest, which creates more deductible interest. This is the flywheel.</p>
            </div>
            <div className="step">
              <div className="num">6</div>
              <div className="st">Repeat until the mortgage is converted</div>
              <p>Keep going month after month. Slowly, your non-deductible mortgage balance falls to zero while your deductible investment loan and your portfolio grow to take its place.</p>
            </div>
          </div>

          {/* VARIATIONS */}
          <div id="variations" className="cd-sec" style={{ scrollMarginTop: 70 }}>The variations, and when each one fits</div>
          <p>The core loop is the foundation. Most people then choose one or more of these accelerators depending on their cash flow and goals.</p>

          <details className="acc" open>
            <summary>1. The classic (re-borrow and invest)</summary>
            <div className="accbody">
              <div className="arow">This is the loop above, run plainly. Each month you re-borrow the freed room, invest it, deduct the interest, and reinvest your tax refund into the mortgage. It is the simplest version and a perfectly good place to begin while you build comfort with the moving parts.</div>
            </div>
          </details>

          <details className="acc">
            <summary>2. The Cash Flow Dam</summary>
            <div className="accbody">
              <div className="arow">The Cash Flow Dam redirects money you are already spending. Instead of paying certain deductible-eligible costs out of your chequing account, you pay them from the line of credit, and you send the cash you freed up straight to the mortgage. It is especially useful for people with a rental property or a small business, because it can make otherwise ordinary borrowing serve an income-earning purpose. It is also the tool for converting other non-deductible debt over time.</div>
            </div>
          </details>

          <details className="acc">
            <summary>3. Dividends to the mortgage (the Snyder variation)</summary>
            <div className="accbody">
              <div className="arow">As your portfolio grows, it produces dividends and distributions. In this variation you take that investment income and apply it to the mortgage as a prepayment, then immediately re-borrow that same amount and invest it again. The income still ends up invested, but it makes a stop at the mortgage first, which converts your debt faster without costing you any growth.</div>
            </div>
          </details>

          <details className="acc">
            <summary>4. The accelerator (refund + dividends + prepayments)</summary>
            <div className="accbody">
              <div className="arow">This combines everything. You funnel your tax refund, your investment income, and any extra prepayment room you can spare into the mortgage, then re-borrow and invest each time. It is the fastest route to a fully converted mortgage and a larger portfolio, and it asks the most of your discipline and your cash flow. Many people grow into this version after a year or two of running the classic loop.</div>
            </div>
          </details>

          {/* CLEAN */}
          <div id="clean" className="cd-sec" style={{ scrollMarginTop: 70 }}>Keeping the CRA happy</div>
          <p>
            The deduction is the engine, so protecting it matters more than any clever optimization. The CRA
            cares about traceability, meaning a clean, unbroken line from borrowed dollars to income-producing
            investments. A few habits keep you on solid ground.
          </p>
          <ul>
            <li><strong>Keep the investment line of credit completely separate.</strong> Never pay for groceries, vacations, or anything personal from it. One dedicated sub-account, used only for investing, keeps the trail spotless.</li>
            <li><strong>Send borrowed money straight to investments.</strong> Avoid parking it in a personal chequing account along the way, which can muddy the purpose.</li>
            <li><strong>Mind return-of-capital distributions.</strong> Some funds pay distributions that are partly a return of your own capital rather than income. If you receive return of capital, the cleanest move is to put it back against the investment loan, otherwise you can slowly erode how much of the interest stays deductible.</li>
            <li><strong>Do not break the chain.</strong> If you sell an investment, the proceeds should generally go back toward the investment loan or into new eligible investments, not toward personal spending.</li>
            <li><strong>Keep good records and consider a professional.</strong> A tidy spreadsheet of every draw and every investment, plus an accountant who understands the strategy, is cheap insurance for a deduction you will rely on for years.</li>
          </ul>

          {/* RISKS */}
          <div id="risks" className="cd-sec" style={{ scrollMarginTop: 70 }}>The risks, honestly</div>
          <p>
            This part deserves your full attention, because the Smith Manoeuvre is leverage, and leverage is a
            tool that works in both directions. None of the following should scare you off if the strategy fits
            your life, but you should walk in knowing them.
          </p>
          <ul>
            <li><strong>Leverage magnifies losses, not just gains.</strong> You are investing borrowed money. A market downturn, especially early on, can leave you owing on a portfolio worth less than the loan. You need the staying power to ride that out.</li>
            <li><strong>Your borrowing cost can rise.</strong> The line of credit is usually a variable, prime-linked rate. When rates climb, your interest cost climbs, and your investments have to clear a higher bar to come out ahead.</li>
            <li><strong>It demands real cash flow.</strong> The interest is due every month regardless of how your investments are doing. A job loss or a rate spike at the wrong time can turn a smart strategy into a stressful one.</li>
            <li><strong>It rewards discipline and punishes sloppiness.</strong> The tax benefit depends on clean records. Commingling funds or breaking the trail can cost you the deduction that makes the whole thing worthwhile.</li>
            <li><strong>It is a long commitment.</strong> The math works over many years. If you might need to unwind it soon, or sell the house, the picture changes and the costs can outweigh the benefits.</li>
            <li><strong>It tests your nerves.</strong> Watching a leveraged portfolio fall is harder than watching an ordinary one fall. Be honest with yourself about how you handle volatility.</li>
          </ul>

          {/* WHO */}
          <div id="who" className="cd-sec" style={{ scrollMarginTop: 70 }}>Is it for you?</div>
          <p>
            The Smith Manoeuvre tends to suit homeowners with stable income, a long time horizon, a healthy
            emergency fund, a genuine tolerance for risk, and the patience to keep clean records year after
            year. If that sounds like you, and your TFSA and RRSP are already working hard, it can be a
            remarkable way to make your largest debt do double duty.
          </p>
          <p>
            It is probably not the right move if your cash flow is tight, if you are close to retirement or a
            short time horizon, if market swings keep you up at night, or if you do not yet have a cushion for
            life&apos;s surprises. There is no shame in deciding the simpler path is the better one for your
            family. The best strategy is always the one you can actually stick with.
          </p>
          <div className="cd-note">
            <div className="cap">A friendly reminder</div>
            This guide is educational and is written to help you understand the strategy, not to recommend it for
            your specific situation. Before you set anything up, talk it through with a fee-for-service planner or
            an accountant who knows the Smith Manoeuvre well. An hour of good advice here pays for itself many
            times over.
          </div>

          <div className="cd-sec">Keep going</div>
          <p>If you are thinking about the investment side, our card and points guides can help you put any rewards you earn to work too.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link href="/personal-finance" className="cd-apply" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>More personal finance →</Link>
            <Link href="/travel" className="cd-apply">Travel &amp; points →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
