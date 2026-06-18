import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How we value points — Charted',
  description: 'How Charted estimates the first-year value of a credit card welcome bonus.',
};

const sections = [
  {
    h: 'First-year value, in plain terms',
    p: `For each card we estimate a first-year value: the welcome bonus valued at our baseline point valuations, minus the annual fee. If a card waives or rebates the fee in the first year, we deduct $0; if it charges a different first-year fee, we use that.`,
  },
  {
    h: 'We use conservative "baseline" valuations',
    p: `A point isn't worth a fixed amount — it depends how you redeem it. We value each rewards currency at a realistic, everyday "baseline" rate rather than a best-case one, so the numbers don't over-promise. Cash back is valued at face value (a dollar is a dollar).`,
  },
  {
    h: 'Transferable points can be worth more',
    p: `Some currencies — like Membership Rewards, Aeroplan, and Avion — can be transferred to airline and hotel partners, where savvy redemptions (e.g. business-class flights) are worth well above our baseline. Where it's relevant we note that upside, but the headline first-year value always uses the conservative baseline.`,
  },
  {
    h: 'Canadian and US cards stay in their own currency',
    p: `We don't convert between currencies. Canadian cards are valued in CAD and US cards in USD, each clearly labelled, so you're never comparing against a guessed exchange rate. Tip: filter the card explorer by country to compare like-for-like.`,
  },
  {
    h: 'We keep valuations current',
    p: `Welcome offers and point values change often. We refresh card offers regularly and review our valuations on an ongoing basis. Figures are estimates to help you compare cards — not guarantees, and not financial advice.`,
  },
];

export default function HowWeValuePoints() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-text dark:text-gold font-semibold mb-3">Methodology</p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold mb-4">How we value points</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        So you can trust the numbers, here&apos;s exactly how we estimate what a card is worth.
      </p>
      <div className="space-y-10">
        {sections.map(s => (
          <section key={s.h}>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">{s.h}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
      <div className="atlas-rule my-12" />
      <p className="text-sm text-muted-foreground">
        Questions about a specific card&apos;s valuation? <a href="/cards" className="text-gold-text dark:text-gold font-medium hover:underline">Browse the card explorer →</a>
      </p>
    </div>
  );
}
