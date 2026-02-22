'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Lightbulb, AlertTriangle, Clock, MapPin, Building2, CreditCard,
  FileText, TrendingUp, ShieldCheck, Rocket, ChevronDown, ChevronUp,
  DollarSign, Globe, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';

// ── Reading Progress Bar ─────────────────────────────────

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      setProgress(docHeight > 0 ? Math.min((window.scrollY / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-border/30">
      <div
        className="h-full bg-gradient-to-r from-primary to-gold transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Tip Box ──────────────────────────────────────────────

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-3 rounded-xl border border-gold/30 bg-gold/[0.06] dark:bg-gold/[0.08] p-5">
      <Lightbulb className="w-5 h-5 text-gold-dark dark:text-gold mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

// ── Warning Box ──────────────────────────────────────────

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-3 rounded-xl border border-red-300/40 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/[0.08] p-5">
      <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

// ── Step Card ────────────────────────────────────────────

function StepCard({
  number, icon: Icon, title, timeEstimate, children, id,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  timeEstimate: string;
  children: React.ReactNode;
  id: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div id={id} className="relative pl-12 md:pl-16 pb-12 last:pb-0 scroll-mt-24">
      {/* Timeline line */}
      <div className="absolute left-[18px] md:left-[26px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-gold/30 to-border/20" />
      {/* Timeline dot */}
      <div className="absolute left-[7px] md:left-[15px] top-1 w-[23px] h-[23px] rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center ring-4 ring-background z-10">
        {number}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/[0.07] dark:bg-primary/[0.15] p-2 mt-0.5">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold font-[family-name:var(--font-display)] group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {timeEstimate}
            </div>
          </div>
          <div className="mt-2 text-muted-foreground">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="mt-4 prose-guide">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Card Recommendation Inline ───────────────────────────

function CardRec({ name, slug, note }: { name: string; slug?: string; note?: string }) {
  return (
    <a
      href={slug ? `/cards/${slug}` : '/cards?country=US'}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary/40 hover:shadow-sm transition-all no-underline"
    >
      <CreditCard className="w-3.5 h-3.5 text-primary" />
      <span>{name}</span>
      {note && <span className="text-muted-foreground font-normal">— {note}</span>}
    </a>
  );
}

// ── Roadmap Month ────────────────────────────────────────

function RoadmapItem({ month, label, description, accent }: { month: string; label: string; description: string; accent?: boolean }) {
  return (
    <div className={`flex gap-4 items-start p-4 rounded-xl border ${accent ? 'border-gold/40 bg-gold/[0.04]' : 'border-border bg-card'}`}>
      <div className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${accent ? 'bg-gold/20 text-gold-dark dark:text-gold' : 'bg-primary/10 text-primary'}`}>
        {month}
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ── Mistake Item ─────────────────────────────────────────

function Mistake({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function USCardsGuidePage() {
  const tocSections = [
    { id: 'why', label: 'Why US Cards?' },
    { id: 'step-1', label: '1. US Address' },
    { id: 'step-2', label: '2. Bank Account' },
    { id: 'step-3', label: '3. First Card' },
    { id: 'step-4', label: '4. Get ITIN' },
    { id: 'step-5', label: '5. Build Credit' },
    { id: 'step-6', label: '6. Chase Cards' },
    { id: 'step-7', label: '7. Expand' },
    { id: 'managing', label: 'Managing Cards' },
    { id: 'mistakes', label: 'Mistakes to Avoid' },
    { id: 'roadmap', label: 'First-Year Roadmap' },
  ];

  return (
    <>
      <ReadingProgress />

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,168,83,0.12)_0%,_transparent_60%)]" />
          <div className="absolute top-20 right-[12%] w-36 h-22 rounded-xl border border-white/[0.06] animate-float" />
          <div className="absolute bottom-16 left-[8%] w-28 h-18 rounded-xl border border-white/[0.05] animate-float-delayed" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-sm mb-8 backdrop-blur-sm">
            <span>🇨🇦</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>🇺🇸</span>
            <span className="ml-1 text-white/70">Step-by-step guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 font-[family-name:var(--font-display)]">
            The Complete Guide to{' '}
            <span className="text-gold">US Credit Cards</span>{' '}
            for Canadians
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
            Everything you need to know about getting an ITIN, building US credit, and accessing the world&apos;s best rewards cards
          </p>
          <div className="flex items-center justify-center gap-5 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 25 min read</span>
            <span>•</span>
            <span>Last updated February 2026</span>
          </div>
        </div>
      </section>

      {/* Interactive Guide CTA */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-10">
        <a
          href="/guides/us-cards-for-canadians/interactive"
          className="group block rounded-2xl border-2 border-gold/30 bg-gradient-to-r from-gold/[0.08] to-primary/[0.06] dark:from-gold/[0.12] dark:to-primary/[0.10] p-6 sm:p-8 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 transition-all"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🧭</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-display)] mb-1">
                  Try the Interactive Step-by-Step Guide
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Follow along one step at a time with checklists, progress tracking, and your place saved automatically.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-primary text-white px-6 py-3 font-semibold text-sm group-hover:bg-primary-dark transition-colors flex items-center gap-2">
              Start Guide
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </a>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        {/* Table of Contents */}
        <nav className="mb-16 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">In this guide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tocSections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-1">
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Why US Cards? */}
        <section id="why" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-6">
            Why Should Canadians Get US Credit Cards?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            If you&apos;re into travel rewards, the US credit card market is an entirely different league. We&apos;re talking bigger sign-up bonuses, more transfer partners, and perks that Canadian issuers can only dream of offering. Here&apos;s the quick pitch:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Bigger Welcome Bonuses', desc: 'US Amex Platinum offers 150k+ MR points. Canadian Platinum? Usually 70-80k.' },
              { title: 'More Transfer Partners', desc: 'Amex US has 21 airline transfer partners vs just 11 in Canada. That\'s nearly double the options for finding sweet-spot redemptions.' },
              { title: 'Elite Status from Cards', desc: 'Hold the Hilton Aspire and you get Diamond status. Marriott Bonvoy Brilliant gives you Platinum. No stays required.' },
              { title: 'No FX Fees', desc: 'Most premium US cards waive foreign transaction fees, so you can use them for Canadian spending without the 2.5% surcharge.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            The catch? It takes some upfront work — getting a US address, building credit history from scratch, and navigating the ITIN process. But thousands of Canadians have done it, and the payoff is absolutely worth it. Let&apos;s walk through it step by step.
          </p>
        </section>

        {/* Steps */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-10">
            The Step-by-Step Process
          </h2>

          {/* Step 1 */}
          <StepCard number={1} icon={MapPin} title="Get a US Mailing Address" timeEstimate="~$70-90 USD/year" id="step-1">
            <p>
              Before anything else, you need a US residential address. This is where your cards, bank statements, and IRS correspondence will be mailed. You have two options:
            </p>
            <p>
              <strong>Option A: Mail forwarding service.</strong> Companies like <strong>24/7 Parcel</strong>, <strong>US Global Mail</strong>, and <strong>Traveling Mailbox</strong> give you a real street address (not a PO box) and scan or forward your mail. Expect to pay $70–90 USD per year.
            </p>
            <p>
              <strong>Option B: Friend or family in the US.</strong> If you have someone willing to receive mail for you, this is the cheapest option. Just make sure they&apos;re okay with occasional IRS letters and credit card mail.
            </p>

            <WarningBox>
              <strong>Critical check:</strong> Go to the USPS address lookup tool and verify your address. Look for &quot;Commercial Mail Receiving Agency&quot; — it must show <strong>&quot;N&quot;</strong>. If it shows &quot;Y&quot;, card issuers like Chase may flag and reject your applications. Some mail forwarding services are flagged as commercial; always verify before signing up.
            </WarningBox>

            <TipBox>
              <strong>Pro tip:</strong> Check your address at <strong>USPS.com</strong> before committing to any service. Search your address in their zip code lookup tool — if the result includes &quot;Commercial Mail Receiving Agency: Y&quot;, find a different provider.
            </TipBox>
          </StepCard>

          {/* Step 2 */}
          <StepCard number={2} icon={Building2} title="Open a US Bank Account" timeEstimate="1-2 weeks" id="step-2">
            <p>
              You need a US bank account for two things: paying your credit card bills in USD, and having a bank statement with a US address for card issuer verification.
            </p>
            <p>
              The easiest path is through <strong>Canadian banks with US subsidiaries</strong>:
            </p>
            <ul>
              <li><strong>CIBC US (formerly Simplii Financial US)</strong> — The most popular choice. No monthly fee on the Smart Account, and you can open it online from Canada.</li>
              <li><strong>TD Bank</strong> — Great if you&apos;re already a TD Canada customer. TD has branches across the US East Coast.</li>
              <li><strong>BMO Harris</strong> — BMO&apos;s US banking arm. Easy cross-border setup.</li>
              <li><strong>RBC Bank</strong> — RBC&apos;s US presence, primarily in the Southeast.</li>
            </ul>

            <TipBox>
              Make sure to set your <strong>US mailing address as the primary address</strong> on this account. You&apos;ll use bank statements from this account as proof of address when applying for credit cards.
            </TipBox>
          </StepCard>

          {/* Step 3 */}
          <StepCard number={3} icon={CreditCard} title="Get Your First US Card via Amex Global Transfer" timeEstimate="2-4 weeks" id="step-3">
            <p>
              This is where the magic happens. <strong>Amex Global Transfer</strong> lets you leverage your existing Canadian Amex relationship to get approved for a US Amex card — no US credit history or ITIN required.
            </p>
            <p><strong>Requirements:</strong></p>
            <ul>
              <li>An existing Canadian Amex card, open for at least 3 months</li>
              <li>Your US mailing address</li>
              <li>Your US bank account</li>
            </ul>
            <p><strong>How to apply:</strong></p>
            <ul>
              <li><strong>Online:</strong> Apply on the US Amex website. During the application, check the box that says you have an existing Amex card from another country. Enter your Canadian Amex card details.</li>
              <li><strong>Phone:</strong> Call the Amex Global Transfer line and they&apos;ll walk you through it.</li>
            </ul>
            <p>
              You may need to upload your passport and a bank statement showing your US address for verification. This is normal — just have them ready.
            </p>

            <WarningBox>
              <strong>Start with a personal card, not a business card.</strong> Business cards do <em>not</em> build personal credit history in the US. Your first card needs to be a personal card so it starts building your credit file with the bureaus.
            </WarningBox>

            <p>
              <strong>Best starter cards:</strong>
            </p>
            <div className="flex flex-wrap gap-2 my-3">
              <CardRec name="Amex Hilton Honors" note="no annual fee — great keeper" />
              <CardRec name="Amex Gold Card" note="strong earning" />
            </div>

            <TipBox>
              <strong>Choose wisely:</strong> Your first US card will be your oldest account on your US credit report forever. Pick something you&apos;ll want to keep long-term. A no-annual-fee card like the Hilton Honors is a popular choice for exactly this reason.
            </TipBox>
          </StepCard>

          {/* Step 4 */}
          <StepCard number={4} icon={FileText} title="Apply for an ITIN" timeEstimate="6-12 weeks processing" id="step-4">
            <p>
              An <strong>Individual Taxpayer Identification Number (ITIN)</strong> is essentially a tax ID number issued by the IRS for people who aren&apos;t eligible for a Social Security Number. You need this to apply for cards from Chase, Citi, Capital One, Bank of America, and most non-Amex issuers.
            </p>

            <h4 className="font-semibold mt-4 mb-2">Method 1: Use a Tax Service (Recommended)</h4>
            <p>
              Services like <strong>US Tax Resources</strong> and <strong>FrugalFlyer&apos;s ITIN service</strong> handle the entire process for $150–300. They prepare your W-7 form and file a 1040-NR tax return on your behalf. This is the easiest and safest option for most people.
            </p>

            <h4 className="font-semibold mt-4 mb-2">Method 2: DIY (Cheaper but Riskier)</h4>
            <p>
              You can do it yourself: fill out Form W-7, prepare a 1040-NR with a small amount of US-source income declared, and mail everything to the IRS. You&apos;ll also need to include identity documentation.
            </p>

            <WarningBox>
              <strong>Important 2025 update:</strong> The IRS no longer accepts certified passport copies. You must either send your <strong>original passport</strong> to the IRS or visit an <strong>IRS Taxpayer Assistance Center</strong> in person. If mailing your passport, use tracked priority mail — there have been cases of passports being lost in the process.
            </WarningBox>

            <p>
              Processing currently takes about <strong>8 weeks</strong>, though it can stretch longer during peak tax season. You&apos;ll receive your ITIN in a letter mailed to your US address.
            </p>

            <TipBox>
              You don&apos;t need to wait for your ITIN to start building credit — that&apos;s why we get the Amex card first via Global Transfer. Apply for your ITIN in parallel while your Amex card is building your credit history.
            </TipBox>
          </StepCard>

          {/* Step 5 */}
          <StepCard number={5} icon={TrendingUp} title="Build Your US Credit History" timeEstimate="3-12 months" id="step-5">
            <p>
              Now you play the waiting game. Your first Amex card is reporting to the US credit bureaus, and you need to build up enough history before other issuers will approve you.
            </p>
            <ul>
              <li><strong>Get 1-2 more Amex personal cards</strong> in your first 3-6 months. Each new personal card adds another account to your credit file.</li>
              <li><strong>Amex business cards don&apos;t count for Chase&apos;s 5/24 rule</strong> — feel free to grab Amex Business Platinum, Business Gold, etc. during this period. They won&apos;t hurt your future Chase applications.</li>
              <li><strong>Keep utilization at 5-10%</strong> on all your cards. Low utilization signals responsible credit use.</li>
              <li><strong>Open a Chase checking account</strong> at a US branch if you can visit. Having a banking relationship with Chase significantly helps approval odds later.</li>
            </ul>

            <WarningBox>
              <strong>Critical:</strong> Once you receive your ITIN, call Amex immediately and have them link it to all your existing US accounts. This ensures your credit history is properly tied to your ITIN in the bureau files. Without this step, Chase and other issuers may not be able to pull your credit.
            </WarningBox>
          </StepCard>

          {/* Step 6 */}
          <StepCard number={6} icon={ShieldCheck} title="Apply for Chase Cards" timeEstimate="12-18 months after first card" id="step-6">
            <p>
              Chase is the holy grail for most churners — their Ultimate Rewards points are incredibly flexible, and their co-branded hotel cards are best-in-class. But Chase is also the pickiest issuer.
            </p>
            <p>
              <strong>What Chase wants:</strong>
            </p>
            <ul>
              <li>At least <strong>12-18 months</strong> of US credit history</li>
              <li>A credit score above ~700 (check on Credit Karma US)</li>
              <li>Ideally, a Chase banking relationship</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">The 5/24 Rule</h4>
            <p>
              Chase will automatically deny you if you&apos;ve opened <strong>5 or more personal credit cards</strong> (across all issuers) in the past 24 months. This is why we&apos;re strategic about getting Amex business cards first — they don&apos;t count toward 5/24.
            </p>

            <p>
              <strong>Recommended first Chase cards:</strong>
            </p>
            <div className="flex flex-wrap gap-2 my-3">
              <CardRec name="Chase Sapphire Preferred" note="great starter" />
              <CardRec name="Ink Business Preferred" note="doesn't count for 5/24" />
              <CardRec name="Chase Aeroplan Card" note="useful for Canadians" />
            </div>

            <TipBox>
              If you can visit a US Chase branch, apply in-person. Chase sometimes requires document verification (passport, bank statements) for applicants without a Social Security Number. Being in-branch makes this much smoother.
            </TipBox>
          </StepCard>

          {/* Step 7 */}
          <StepCard number={7} icon={Rocket} title="Expand to Other Issuers" timeEstimate="18+ months" id="step-7">
            <p>
              Once you&apos;ve got Chase cards and solid credit history, the world opens up:
            </p>
            <ul>
              <li><strong>Capital One:</strong> Typically wants ~3 years of credit history. They have a strict maximum of 1 application per 6 months. Worth it for the Venture X.</li>
              <li><strong>Citi:</strong> The Strata Premier (formerly Premier) is excellent. Citi ThankYou points transfer to a great set of airlines including Air Canada Aeroplan.</li>
              <li><strong>Bank of America:</strong> The Alaska Airlines card is a fan favourite. Apply in-branch or by phone if using an ITIN — their online system doesn&apos;t always handle ITINs well.</li>
            </ul>
            <p>
              Keep building and maintaining your credit. Pay all balances in full every month, keep accounts open, and space out applications. A mature US credit profile unlocks better approval odds and higher credit limits over time.
            </p>
          </StepCard>
        </section>

        {/* Managing Your US Cards */}
        <section id="managing" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-6">
            Managing Your US Cards from Canada
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Paying Your Bills
              </h3>
              <p>
                Don&apos;t use your bank&apos;s exchange rate — you&apos;ll lose 2-2.5% on every transfer. Instead, use dedicated FX services like <strong>Wise</strong>, <strong>VBCE</strong>, or <strong>Knightsbridge FX</strong>. They typically charge ~1% above the spot rate, saving you significant money over time.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Using US Cards in Canada
              </h3>
              <p>
                Here&apos;s a nice perk: most US premium cards have <strong>no foreign transaction fees</strong>. That means you can use them for everyday Canadian spending and earn US points without the 2.5% FX surcharge you&apos;d pay on Canadian cards abroad. Just be mindful of the CAD→USD→CAD conversion.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Two-Player Mode
              </h3>
              <p>
                If you have a spouse or partner, set them up simultaneously. Two people means double the welcome bonuses, double the points, and the ability to share points between accounts. It&apos;s the single biggest force multiplier in the churning game.
              </p>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section id="mistakes" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-6">
            Common Mistakes to Avoid
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <Mistake>
              <strong>Getting too many cards too fast.</strong> If you rack up 5+ personal cards in 24 months before applying to Chase, you&apos;re locked out. Plan your sequence.
            </Mistake>
            <Mistake>
              <strong>Not linking your ITIN to existing Amex accounts.</strong> Without this, your credit history may not be visible to other issuers. Call Amex as soon as you receive your ITIN.
            </Mistake>
            <Mistake>
              <strong>Using bank FX rates to pay bills.</strong> The 2-2.5% spread adds up fast. Use Wise, VBCE, or Knightsbridge FX instead.
            </Mistake>
            <Mistake>
              <strong>Cancelling your oldest US card.</strong> Your first US card is the anchor of your credit history. Downgrade it to a no-fee version if needed, but never close it.
            </Mistake>
            <Mistake>
              <strong>Not checking if your mail address is flagged as commercial.</strong> Chase and other issuers can and will reject applications if your address shows up as a &quot;Commercial Mail Receiving Agency&quot; on USPS.
            </Mistake>
            <Mistake>
              <strong>Starting with a business card.</strong> Business cards don&apos;t report to personal credit bureaus. Your first card must be a personal card to start building your credit file.
            </Mistake>
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-6">
            Recommended First-Year Card Sequence
          </h2>
          <p className="text-muted-foreground mb-8">
            Here&apos;s a realistic timeline for your first 18+ months of US credit cards. Every situation is different, but this is a solid starting framework:
          </p>
          <div className="space-y-3">
            <RoadmapItem month="Month 0" label="Amex Hilton Honors (No-Fee Keeper)" description="Your anchor card. No annual fee, so you'll keep it forever as your oldest account." accent />
            <RoadmapItem month="Month 1-2" label="Apply for ITIN" description="Submit your W-7 via a tax service or DIY. Processing takes ~8 weeks." />
            <RoadmapItem month="Month 3" label="Amex Hilton Aspire or Amex Gold" description="Second personal card. Builds credit file depth. Choose based on current offers." accent />
            <RoadmapItem month="Month 3-6" label="Amex Business Platinum + Business Gold" description="Business cards don't count toward 5/24. Grab these freely for the bonuses." />
            <RoadmapItem month="Month 4" label="Receive ITIN → Link to All Accounts" description="Call Amex immediately to link your ITIN to every US account you have." accent />
            <RoadmapItem month="Month 12-18" label="Chase Sapphire Preferred + Ink Business Preferred" description="You now have enough credit history for Chase. Start with their best cards." accent />
            <RoadmapItem month="Month 18+" label="Chase United, IHG, Hyatt → Capital One, Citi" description="Continue expanding your portfolio. Space applications 3+ months apart." />
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-4">
            Ready to Start?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Browse our US cards database to find the best current welcome bonuses and start planning your sequence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/cards?country=US&sort=value" className="rounded-full bg-gold px-8 py-3 font-semibold text-primary-dark hover:bg-gold-light transition-colors">
              Browse US Cards
            </a>
            <a href="/cards?country=CA" className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-semibold hover:bg-white/20 transition-colors">
              Canadian Cards
            </a>
          </div>
        </section>
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'The Complete Guide to US Credit Cards for Canadians',
            description: 'Step-by-step guide to getting an ITIN, building US credit, and accessing the best US rewards cards as a Canadian.',
            datePublished: '2026-02-22',
            dateModified: '2026-02-22',
            author: { '@type': 'Organization', name: 'ChurningCanada' },
            publisher: { '@type': 'Organization', name: 'ChurningCanada' },
          }),
        }}
      />
    </>
  );
}
