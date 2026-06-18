'use client';

import { Search, Plane, DollarSign, CreditCard, Flag, ArrowRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopCardsByValue, allCards, getUniqueIssuers } from '@/data/cards';
import { CardGrid } from '@/components/CardGrid';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { FadeIn } from '@/components/FadeIn';

const stats = {
  cards: allCards.length,
  issuers: getUniqueIssuers().length,
};

const quickFilters = [
  { label: 'Best Travel', icon: Plane, href: '/cards?type=travel&sort=value' },
  { label: 'Best Cashback', icon: DollarSign, href: '/cards?type=cashback&sort=value' },
  { label: 'No Annual Fee', icon: CreditCard, href: '/cards?maxFee=0' },
  { label: 'US Cards for Canadians 🇺🇸', icon: Flag, href: '/guides/us-cards-for-canadians' },
];

const pillars = [
  {
    emoji: '💳',
    title: 'Cards',
    desc: `Compare ${stats.cards}+ Canadian & US credit cards by welcome bonus, fees, and earn rates.`,
    href: '/cards',
    cta: 'Explore cards',
  },
  {
    emoji: '✈️',
    title: 'Travel & Points',
    desc: 'Find the biggest welcome bonuses and learn how to turn points into trips.',
    href: '/cards?type=travel&sort=value',
    cta: 'Maximize points',
  },
  {
    emoji: '📈',
    title: 'Money',
    desc: 'Plain-language guides to credit, spending, and getting more from your money.',
    href: '/blog',
    cta: 'Read guides',
  },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const featured = getTopCardsByValue(6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/cards?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="atlas-contours relative overflow-hidden border-b border-border/60">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 md:py-32 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-text dark:text-gold font-semibold mb-5">
            Your guide to money in Canada
          </p>
          <h1 className="font-[family-name:var(--font-display)] font-semibold text-foreground mb-6">
            Navigate your <span className="italic text-gold-text dark:text-gold">money</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Canada&apos;s guide to the best credit cards, travel points, and personal finance — clear, current, and built for Canadians.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto shadow-xl shadow-foreground/5 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cards, issuers, or rewards programs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full rounded-l-2xl border border-r-0 border-border bg-card py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/60"
              />
            </div>
            <button type="submit" className="rounded-r-2xl bg-gold px-8 font-semibold text-primary-dark hover:bg-gold-light transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {quickFilters.map(f => (
              <a
                key={f.label}
                href={f.href}
                className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground/80 hover:border-gold hover:text-foreground transition-all"
              >
                <f.icon className="w-4 h-4 text-gold-text dark:text-gold" />
                {f.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <FadeIn>
        <section className="border-b border-border/60 bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-wrap justify-center gap-6 sm:gap-12">
            {[
              { end: stats.cards, suffix: '+', label: 'Cards tracked' },
              { end: stats.issuers, suffix: '', label: 'Issuers' },
              { end: 2, suffix: '', label: 'Countries' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-gold-text dark:text-gold font-[family-name:var(--font-display)]">
                  <AnimatedCounter end={s.end} suffix={s.suffix} />
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Three pillars */}
      <FadeIn delay={100}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(p => (
              <a
                key={p.title}
                href={p.href}
                className="card-hover group rounded-2xl border border-border bg-card p-7 flex flex-col"
              >
                <span className="text-3xl mb-4" aria-hidden>{p.emoji}</span>
                <h2 className="text-xl font-semibold tracking-tight mb-2 font-[family-name:var(--font-display)]">{p.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-text dark:text-gold group-hover:gap-2.5 transition-all">
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Featured cards */}
      <FadeIn delay={150}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gold-text dark:text-gold font-semibold mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Editor&apos;s picks
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight font-[family-name:var(--font-display)]">Top cards by first-year value</h2>
              <p className="text-muted-foreground mt-1.5">Highest welcome bonus, minus the annual fee.</p>
            </div>
            <a href="/cards?sort=value" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gold-text dark:text-gold hover:gap-2.5 transition-all whitespace-nowrap">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <CardGrid cards={featured} />
        </section>
      </FadeIn>

      {/* Money / guides teaser */}
      <FadeIn delay={200}>
        <section className="border-t border-border/60 bg-muted/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-text dark:text-gold font-semibold mb-3">From the Atlas</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 font-[family-name:var(--font-display)]">Money, decoded for Canadians</h2>
            <p className="text-muted-foreground mb-7 leading-relaxed">
              Guides on getting US cards as a Canadian, turning points into travel, and making everyday spending work harder.
            </p>
            <a href="/guides/us-cards-for-canadians" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-dark hover:bg-gold-light transition-all">
              Read the guides <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
