'use client';

import { Search, Plane, DollarSign, CreditCard, Flag } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopCardsByValue, allCards, getUniqueIssuers } from '@/data/cards';
import { CardGrid } from '@/components/CardGrid';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const stats = {
  cards: allCards.length,
  issuers: getUniqueIssuers().length,
};

const quickFilters = [
  { label: 'Best Travel', icon: Plane, href: '/cards?type=travel&sort=value' },
  { label: 'Best Cashback', icon: DollarSign, href: '/cards?type=cashback&sort=value' },
  { label: 'No Annual Fee', icon: CreditCard, href: '/cards?maxFee=0' },
  { label: 'US Cards Guide 🇺🇸', icon: Flag, href: '/guides/us-cards-for-canadians' },
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
      <section className="relative overflow-hidden hero-gradient text-white">
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Card silhouettes */}
          <div className="absolute top-16 left-[10%] w-32 h-20 rounded-xl border border-white/[0.06] animate-float" />
          <div className="absolute top-32 right-[15%] w-40 h-24 rounded-xl border border-white/[0.08] animate-float-delayed" />
          <div className="absolute bottom-20 left-[20%] w-28 h-18 rounded-xl border border-white/[0.05] animate-float-slow" />
          <div className="absolute bottom-12 right-[25%] w-36 h-22 rounded-xl border border-white/[0.04] animate-float" />
          {/* Geometric shapes */}
          <div className="absolute top-24 right-[8%] w-8 h-8 border border-gold/[0.12] animate-float-diamond" />
          <div className="absolute bottom-32 left-[8%] w-6 h-6 rounded-full border border-white/[0.08] animate-float-delayed" />
          <div className="absolute top-1/2 left-[5%] w-12 h-12 border border-white/[0.04] animate-float-diamond" style={{ rotate: '15deg' }} />
          <div className="absolute top-20 left-[45%] w-4 h-4 rounded-full bg-gold/[0.06] animate-float-slow" />
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,168,83,0.1)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(42,79,127,0.3)_0%,_transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 md:py-36 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
            The <span className="text-gold">smartest</span> way to earn<br />
            <span className="text-gold">rewards</span> in Canada
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compare <span className="text-white/90 font-semibold">{stats.cards}+</span> credit cards across <span className="text-white/90 font-semibold">{stats.issuers}</span> issuers. Find the perfect card for your spending.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto shadow-2xl shadow-black/20 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cards, issuers, or rewards programs..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full rounded-l-2xl border-0 bg-white dark:bg-card py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold focus:shadow-[0_0_15px_rgba(212,168,83,0.3)]"
              />
            </div>
            <button type="submit" className="rounded-r-2xl bg-gold px-8 font-semibold text-primary-dark hover:bg-gold-light transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {quickFilters.map(f => (
              <a
                key={f.label}
                href={f.href}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium hover:bg-white/[0.14] transition-all backdrop-blur-sm"
              >
                <f.icon className="w-4 h-4 text-gold/80" />
                {f.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar with animated counters */}
      <section className="border-b border-border/50 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex justify-center gap-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-gold-text dark:text-gold"><AnimatedCounter end={stats.cards} suffix="+" /></p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Cards tracked</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gold-text dark:text-gold"><AnimatedCounter end={stats.issuers} /></p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Issuers</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gold-text dark:text-gold"><AnimatedCounter end={2} /></p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Countries</p>
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Top Cards by First-Year Value</h2>
            <p className="text-muted-foreground mt-1.5">Highest welcome bonus minus annual fee</p>
          </div>
          <a href="/cards?sort=value" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
            View all →
          </a>
        </div>
        <CardGrid cards={featured} />
      </section>

      {/* Blog placeholder */}
      <section className="bg-muted/50 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <h2 className="text-2xl font-bold tracking-tight mb-10">Latest from the Blog</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with Churning in Canada', gradient: 'blog-gradient-1' },
              { title: 'Top US Cards for Canadians in 2025', gradient: 'blog-gradient-2' },
              { title: 'Aeroplan vs Scene+: Which is Better?', gradient: 'blog-gradient-3' },
            ].map((post, i) => (
              <div key={post.title} className="card-hover rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md">
                <div className={`h-36 ${post.gradient} flex items-center justify-center`}>
                  <CreditCard className="w-8 h-8 text-white/20" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
