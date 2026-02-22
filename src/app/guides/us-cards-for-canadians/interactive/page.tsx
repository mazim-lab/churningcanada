'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, AlertTriangle, Clock, MapPin, Building2, CreditCard,
  FileText, TrendingUp, ShieldCheck, Rocket, ArrowRight, ArrowLeft,
  DollarSign, Globe, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

// ── Types ────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
}

interface StepData {
  icon: React.ElementType;
  title: string;
  time?: string;
  cost?: string;
  content: React.ReactNode;
  checklist: ChecklistItem[];
}

// ── Tip / Warning Boxes ──────────────────────────────────

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-3 rounded-xl border border-gold/30 bg-gold/[0.06] dark:bg-gold/[0.08] p-4">
      <Lightbulb className="w-5 h-5 text-gold-dark dark:text-gold mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-3 rounded-xl border border-red-300/40 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/[0.08] p-4">
      <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

function CardRec({ name, note }: { name: string; note?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium">
      <CreditCard className="w-3.5 h-3.5 text-primary" />
      <span>{name}</span>
      {note && <span className="text-muted-foreground font-normal">— {note}</span>}
    </span>
  );
}

// ── Step Data ────────────────────────────────────────────

const STEPS: StepData[] = [
  {
    icon: MapPin,
    title: 'Get a US Mailing Address',
    time: '1-2 days',
    cost: '~$70-90 USD/year',
    content: (
      <>
        <p>Before anything else, you need a US residential address. This is where your cards, bank statements, and IRS correspondence will be mailed.</p>
        <p><strong>Option A: Mail forwarding service.</strong> Companies like <strong>24/7 Parcel</strong>, <strong>US Global Mail</strong>, and <strong>Traveling Mailbox</strong> give you a real street address (not a PO box) and scan or forward your mail. Expect to pay $70–90 USD per year.</p>
        <p><strong>Option B: Friend or family in the US.</strong> If you have someone willing to receive mail for you, this is the cheapest option.</p>
        <WarningBox>
          <strong>Critical check:</strong> Go to the USPS address lookup tool and verify your address. Look for &quot;Commercial Mail Receiving Agency&quot; — it must show <strong>&quot;N&quot;</strong>. If it shows &quot;Y&quot;, card issuers like Chase may flag and reject your applications.
        </WarningBox>
        <TipBox>
          <strong>Pro tip:</strong> Check your address at <strong>USPS.com</strong> before committing to any service. If the result includes &quot;Commercial Mail Receiving Agency: Y&quot;, find a different provider.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's1-chose', label: 'Chose a mail forwarding service (or have a US contact)' },
      { id: 's1-verified', label: 'Verified address is NOT flagged as commercial on USPS' },
      { id: 's1-address', label: 'Have your US street address ready' },
    ],
  },
  {
    icon: Building2,
    title: 'Open a US Bank Account',
    time: '1-2 weeks',
    cost: 'Free',
    content: (
      <>
        <p>You need a US bank account for paying credit card bills in USD and for address verification with card issuers.</p>
        <p>The easiest path is through <strong>Canadian banks with US subsidiaries</strong>:</p>
        <ul>
          <li><strong>CIBC US</strong> — Most popular. No monthly fee on Smart Account. Open online from Canada.</li>
          <li><strong>TD Bank</strong> — Great if you&apos;re already a TD Canada customer. Branches across US East Coast.</li>
          <li><strong>BMO Harris</strong> — BMO&apos;s US banking arm. Easy cross-border setup.</li>
          <li><strong>RBC Bank</strong> — RBC&apos;s US presence, primarily in the Southeast.</li>
        </ul>
        <TipBox>
          Set your <strong>US mailing address as the primary address</strong> on this account. You&apos;ll use bank statements as proof of address when applying for credit cards.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's2-opened', label: 'Opened a US bank account' },
      { id: 's2-address', label: 'Set US address as primary on the account' },
      { id: 's2-online', label: 'Can access online banking' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Get Your First US Credit Card',
    time: '2-4 weeks',
    cost: 'Varies',
    content: (
      <>
        <p><strong>Amex Global Transfer</strong> lets you leverage your existing Canadian Amex relationship to get approved for a US Amex card — no US credit history or ITIN required.</p>
        <p><strong>Requirements:</strong></p>
        <ul>
          <li>An existing Canadian Amex card, open for at least 3 months</li>
          <li>Your US mailing address</li>
          <li>Your US bank account</li>
        </ul>
        <p><strong>How to apply:</strong> Apply on the US Amex website and check the box saying you have an existing Amex card from another country. Or call the Amex Global Transfer line.</p>
        <WarningBox>
          <strong>Start with a personal card, not a business card.</strong> Business cards do <em>not</em> build personal credit history in the US. Your first card must be personal.
        </WarningBox>
        <p><strong>Best starter cards:</strong></p>
        <div className="flex flex-wrap gap-2 my-3">
          <CardRec name="Amex Hilton Honors" note="no annual fee — great keeper" />
          <CardRec name="Amex Gold Card" note="strong earning" />
        </div>
        <TipBox>
          Your first US card will be your oldest account on your US credit report forever. Pick something you&apos;ll want to keep long-term — a no-annual-fee card like Hilton Honors is ideal.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's3-applied', label: 'Applied via Global Transfer (or Nova Credit)' },
      { id: 's3-verified', label: 'Verified identity and address with Amex' },
      { id: 's3-received', label: 'Received card at US address' },
    ],
  },
  {
    icon: FileText,
    title: 'Apply for an ITIN',
    time: '8-12 weeks',
    cost: '$0-300',
    content: (
      <>
        <p>An <strong>Individual Taxpayer Identification Number (ITIN)</strong> is a tax ID from the IRS for people who aren&apos;t eligible for an SSN. You need this for Chase, Citi, Capital One, and most non-Amex issuers.</p>
        <h4 className="font-semibold mt-4 mb-2">Method 1: Use a Tax Service (Recommended)</h4>
        <p>Services like <strong>US Tax Resources</strong> handle the entire process for $150–300. They prepare your W-7 form and file a 1040-NR tax return on your behalf.</p>
        <h4 className="font-semibold mt-4 mb-2">Method 2: DIY (Cheaper but Riskier)</h4>
        <p>Fill out Form W-7, prepare a 1040-NR with US-source income, and mail everything to the IRS with identity documentation.</p>
        <WarningBox>
          <strong>Important 2025 update:</strong> The IRS no longer accepts certified passport copies. You must either send your <strong>original passport</strong> or visit an <strong>IRS Taxpayer Assistance Center</strong> in person.
        </WarningBox>
        <TipBox>
          You don&apos;t need to wait for your ITIN to start building credit — that&apos;s why we get the Amex card first. Apply for your ITIN in parallel while your card builds history.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's4-method', label: 'Chose application method (service vs DIY)' },
      { id: 's4-submitted', label: 'Submitted W-7 + tax return' },
      { id: 's4-received', label: 'Received ITIN letter' },
    ],
  },
  {
    icon: TrendingUp,
    title: 'Build Your Credit History',
    time: '3-12 months',
    cost: 'Varies',
    content: (
      <>
        <p>Now you play the waiting game. Your first Amex card is reporting to the US credit bureaus, and you need history before other issuers will approve you.</p>
        <ul>
          <li><strong>Get 1-2 more Amex personal cards</strong> in your first 3-6 months to build credit file depth.</li>
          <li><strong>Amex business cards don&apos;t count for Chase&apos;s 5/24 rule</strong> — grab Business Platinum, Business Gold, etc. freely during this period.</li>
          <li><strong>Keep utilization at 5-10%</strong> on all cards. Low utilization signals responsible credit use.</li>
          <li><strong>Open a Chase checking account</strong> if you can visit a US branch — having a banking relationship helps approval odds later.</li>
        </ul>
        <WarningBox>
          <strong>Critical:</strong> Once you receive your ITIN, call Amex immediately and link it to all your US accounts. Without this, Chase and other issuers may not be able to pull your credit.
        </WarningBox>
      </>
    ),
    checklist: [
      { id: 's5-itin', label: 'Linked ITIN to all Amex accounts' },
      { id: 's5-cards', label: 'Got 1-2 more Amex personal cards' },
      { id: 's5-util', label: 'Keeping utilization at 5-10%' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Apply for Chase Cards',
    time: 'Month 12-18',
    cost: 'Varies',
    content: (
      <>
        <p>Chase is the holy grail for churners — Ultimate Rewards points are incredibly flexible, and their hotel cards are best-in-class. But Chase is the pickiest issuer.</p>
        <p><strong>What Chase wants:</strong></p>
        <ul>
          <li>At least <strong>12-18 months</strong> of US credit history</li>
          <li>A credit score above ~700</li>
          <li>Ideally, a Chase banking relationship</li>
        </ul>
        <h4 className="font-semibold mt-4 mb-2">The 5/24 Rule</h4>
        <p>Chase will deny you if you&apos;ve opened <strong>5 or more personal credit cards</strong> across all issuers in the past 24 months. That&apos;s why we get Amex business cards first — they don&apos;t count.</p>
        <p><strong>Recommended first Chase cards:</strong></p>
        <div className="flex flex-wrap gap-2 my-3">
          <CardRec name="Chase Sapphire Preferred" note="great starter" />
          <CardRec name="Ink Business Preferred" note="doesn't count for 5/24" />
          <CardRec name="Chase Aeroplan Card" note="useful for Canadians" />
        </div>
        <TipBox>
          If you can visit a US Chase branch, apply in-person. Chase sometimes requires document verification for applicants without an SSN. Being in-branch makes this much smoother.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's6-history', label: '12+ months of US credit history' },
      { id: 's6-524', label: 'Under 5/24 (fewer than 5 personal cards in 24 months)' },
      { id: 's6-applied', label: 'Applied for first Chase card' },
    ],
  },
  {
    icon: Rocket,
    title: 'Expand to Other Issuers',
    time: '18+ months',
    cost: 'Varies',
    content: (
      <>
        <p>Once you have Chase cards and solid credit history, the world opens up:</p>
        <ul>
          <li><strong>Capital One:</strong> Typically wants ~3 years of history. Max 1 application per 6 months. Worth it for the Venture X.</li>
          <li><strong>Citi:</strong> The Strata Premier is excellent. Citi ThankYou points transfer to Air Canada Aeroplan and more.</li>
          <li><strong>Bank of America:</strong> Alaska Airlines card is a fan favourite. Apply in-branch with ITIN — online system doesn&apos;t always handle ITINs well.</li>
        </ul>
        <TipBox>
          Keep building and maintaining your credit. Pay all balances in full, keep accounts open, and space out applications. A mature profile unlocks better approval odds and higher limits.
        </TipBox>
      </>
    ),
    checklist: [
      { id: 's7-cap1', label: 'Building toward Capital One eligibility' },
      { id: 's7-citi', label: 'Exploring Citi / Bank of America options' },
      { id: 's7-fx', label: 'Managing FX payments efficiently (Wise, VBCE, etc.)' },
    ],
  },
];

const TOTAL_STEPS = STEPS.length;

// ── Checklist Hook (localStorage) ────────────────────────

function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('us-cards-guide-checklist');
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem('us-cards-guide-checklist', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { checked, toggle };
}

// ── Step Indicator Dots ──────────────────────────────────

function StepIndicator({ current, onNavigate }: { current: number; onNavigate: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {STEPS.map((_, i) => {
        const stepNum = i + 1;
        const isCurrent = current === stepNum;
        const isCompleted = current > stepNum;
        return (
          <button
            key={i}
            onClick={() => onNavigate(stepNum)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
              isCurrent
                ? 'bg-gold text-primary-dark scale-110 ring-2 ring-gold/40'
                : isCompleted
                ? 'bg-primary text-white'
                : 'bg-border/40 text-muted-foreground hover:bg-border/60'
            }`}
            aria-label={`Go to step ${stepNum}`}
          >
            {stepNum}
          </button>
        );
      })}
    </div>
  );
}

// ── Checklist Component ──────────────────────────────────

function Checklist({ items, checked, toggle }: { items: ChecklistItem[]; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Checklist</h4>
      {items.map(item => (
        <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
          <div
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
              checked[item.id]
                ? 'bg-gold border-gold text-primary-dark'
                : 'border-border group-hover:border-primary/40'
            }`}
            onClick={() => toggle(item.id)}
          >
            {checked[item.id] && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
          <span className={`text-sm leading-relaxed transition-all ${checked[item.id] ? 'text-muted-foreground line-through' : 'text-foreground/80'}`}>
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// ── Intro Screen ─────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.05] px-4 py-1.5 text-sm mb-8">
        <span>🇨🇦</span>
        <ArrowRight className="w-3.5 h-3.5 text-primary" />
        <span>🇺🇸</span>
        <span className="ml-1 text-muted-foreground">Step-by-step guide</span>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 font-[family-name:var(--font-display)]">
        The Complete Guide to{' '}
        <span className="text-primary">US Credit Cards</span>{' '}
        for Canadians
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
        Everything you need to know about getting an ITIN, building US credit, and accessing the world&apos;s best rewards cards — in 7 simple steps.
      </p>
      <p className="text-sm text-muted-foreground mb-10">Last updated February 2026</p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-lg w-full mb-10 text-left">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="rounded-full bg-primary text-white px-10 py-4 font-semibold text-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
      >
        Start Guide
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Summary Screen ───────────────────────────────────────

function SummaryScreen({ checked, toggle, onBack }: { checked: Record<string, boolean>; toggle: (id: string) => void; onBack: () => void }) {
  const allItems = STEPS.flatMap((step, i) =>
    step.checklist.map(item => ({ ...item, stepNum: i + 1, stepTitle: step.title }))
  );
  const completedCount = allItems.filter(item => checked[item.id]).length;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
          Your Master Checklist
        </h2>
        <p className="text-muted-foreground">
          {completedCount} of {allItems.length} tasks completed
        </p>
        <div className="mt-3 h-2 rounded-full bg-border/30 max-w-xs mx-auto overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500 rounded-full"
            style={{ width: `${allItems.length > 0 ? (completedCount / allItems.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 mb-10">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{step.title}</h3>
              </div>
              <div className="space-y-2 pl-11">
                {step.checklist.map(item => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        checked[item.id] ? 'bg-gold border-gold text-primary-dark' : 'border-border group-hover:border-primary/40'
                      }`}
                      onClick={() => toggle(item.id)}
                    >
                      {checked[item.id] && (
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${checked[item.id] ? 'text-muted-foreground line-through' : 'text-foreground/80'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Timeline */}
      <div className="rounded-xl border border-border bg-card p-6 mb-10">
        <h3 className="font-bold font-[family-name:var(--font-display)] mb-4">Recommended First-Year Timeline</h3>
        <div className="space-y-3 text-sm">
          {[
            { month: 'Month 0', text: 'Get US address + bank account → Apply for first Amex via Global Transfer' },
            { month: 'Month 1-2', text: 'Submit ITIN application (process in parallel)' },
            { month: 'Month 3-6', text: 'Get 1-2 more Amex personal cards + business cards freely' },
            { month: 'Month 4', text: 'Receive ITIN → Link to all Amex accounts immediately' },
            { month: 'Month 12-18', text: 'Apply for Chase Sapphire Preferred + Ink Business Preferred' },
            { month: 'Month 18+', text: 'Expand to Capital One, Citi, Bank of America' },
          ].map(item => (
            <div key={item.month} className="flex gap-3">
              <span className="shrink-0 rounded-md bg-primary/10 text-primary px-2 py-0.5 font-bold text-xs w-24 text-center">{item.month}</span>
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 text-center mb-8">
        <h3 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">Ready to Start?</h3>
        <p className="text-white/70 max-w-md mx-auto mb-6 text-sm">
          Browse our US cards database to find the best current welcome bonuses.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/cards?country=US&sort=value" className="rounded-full bg-gold px-6 py-2.5 font-semibold text-primary-dark hover:bg-gold-light transition-colors text-sm">
            Browse US Cards
          </a>
          <a href="/cards?country=CA" className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 font-semibold hover:bg-white/20 transition-colors text-sm">
            Canadian Cards
          </a>
        </div>
      </div>

      <div className="flex justify-start mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Step 7
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function USCardsGuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading guide...</div></div>}>
      <USCardsGuideWizard />
    </Suspense>
  );
}

function USCardsGuideWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checked, toggle } = useChecklist();

  // step: 0 = intro, 1-7 = steps, 8 = summary
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [animating, setAnimating] = useState(false);

  // Sync from URL on mount
  useEffect(() => {
    const param = searchParams.get('step');
    if (param === 'summary') {
      setCurrentStep(TOTAL_STEPS + 1);
    } else if (param) {
      const n = parseInt(param, 10);
      if (n >= 1 && n <= TOTAL_STEPS) setCurrentStep(n);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateTo = useCallback((step: number) => {
    if (animating) return;
    setDirection(step > currentStep ? 'right' : 'left');
    setAnimating(true);

    // Update URL
    if (step === 0) router.replace('/guides/us-cards-for-canadians/interactive', { scroll: false });
    else if (step > TOTAL_STEPS) router.replace('/guides/us-cards-for-canadians/interactive?step=summary', { scroll: false });
    else router.replace(`/guides/us-cards-for-canadians/interactive?step=${step}`, { scroll: false });

    setTimeout(() => {
      setCurrentStep(step);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }, [currentStep, animating, router]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS + 1) navigateTo(currentStep + 1);
      if (e.key === 'ArrowLeft' && currentStep > 0) navigateTo(currentStep - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, navigateTo]);

  // Determine what to render
  const isIntro = currentStep === 0;
  const isSummary = currentStep > TOTAL_STEPS;
  const stepData = !isIntro && !isSummary ? STEPS[currentStep - 1] : null;

  return (
    <>
      {/* Article toggle banner */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <a
          href="/guides/us-cards-for-canadians"
          className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-gold/[0.04] dark:bg-gold/[0.08] px-5 py-3.5 group hover:border-gold/40 transition-colors"
        >
          <span className="text-sm text-foreground/80">
            <strong className="text-gold-dark dark:text-gold">Prefer to read everything at once?</strong>{' '}View the full article →
          </span>
          <ArrowRight className="w-4 h-4 text-gold-dark dark:text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      <div className="min-h-screen">
        {/* Progress bar (hidden on intro) */}
        {!isIntro && (
          <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">
                  {isSummary ? 'Summary' : `Step ${currentStep} of ${TOTAL_STEPS}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isSummary ? '✓ Complete' : stepData?.title}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-border/30 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500 rounded-full"
                  style={{ width: `${isSummary ? 100 : (currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
              <StepIndicator current={currentStep} onNavigate={navigateTo} />
            </div>
          </div>
        )}

        {/* Content with slide animation */}
        <div className={`transition-all duration-200 ease-out ${animating ? (direction === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8') : 'opacity-100 translate-x-0'}`}>
          {isIntro && (
            <div className="py-16">
              <IntroScreen onStart={() => navigateTo(1)} />
            </div>
          )}

          {stepData && (
            <div className="max-w-2xl mx-auto px-4 py-10">
              {/* Step header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <stepData.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Step {currentStep}</p>
                <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
                  {stepData.title}
                </h2>
                {(stepData.time || stepData.cost) && (
                  <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
                    {stepData.time && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {stepData.time}
                      </span>
                    )}
                    {stepData.cost && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {stepData.cost}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="prose-guide">
                {stepData.content}
              </div>

              {/* Checklist */}
              <Checklist items={stepData.checklist} checked={checked} toggle={toggle} />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
                <button
                  onClick={() => navigateTo(currentStep - 1)}
                  className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {currentStep === 1 ? 'Overview' : 'Previous'}
                </button>
                <button
                  onClick={() => navigateTo(currentStep + 1)}
                  className="flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  {currentStep === TOTAL_STEPS ? 'View Summary' : 'Next Step'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {isSummary && (
            <div className="py-10">
              <SummaryScreen checked={checked} toggle={toggle} onBack={() => navigateTo(TOTAL_STEPS)} />
            </div>
          )}
        </div>
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
