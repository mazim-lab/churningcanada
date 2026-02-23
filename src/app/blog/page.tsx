'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

const CATEGORIES = ['All', 'Reviews', 'Churning Strategy', 'Personal Finance', 'Points & Miles', 'US Cards', 'Deal Alerts'];

const PLACEHOLDER_POSTS = [
  { title: 'Getting Started with Credit Card Churning in Canada', category: 'Churning Strategy', date: '2025-02-20', excerpt: 'Everything you need to know to start maximizing credit card rewards in Canada.', gradient: 'blog-gradient-1' },
  { title: 'Top 10 US Credit Cards for Canadians in 2025', category: 'US Cards', date: '2025-02-18', excerpt: 'The best American credit cards you can get as a Canadian, and how to apply.', gradient: 'blog-gradient-2' },
  { title: 'Aeroplan vs Scene+ — Which Program Wins?', category: 'Points & Miles', date: '2025-02-15', excerpt: 'A detailed comparison of Canada\'s two biggest loyalty programs.', gradient: 'blog-gradient-3' },
  { title: 'CIBC Aeroplan Visa Infinite Review', category: 'Reviews', date: '2025-02-12', excerpt: 'Is this card worth the $139 annual fee? We break it down.', gradient: 'blog-gradient-4' },
  { title: 'How to Get an ITIN as a Canadian', category: 'US Cards', date: '2025-02-10', excerpt: 'Step-by-step guide to getting your Individual Taxpayer Identification Number.', gradient: 'blog-gradient-5' },
  { title: 'Best No-Fee Cards in Canada for 2025', category: 'Deal Alerts', date: '2025-02-08', excerpt: 'You don\'t need to pay an annual fee to earn great rewards.', gradient: 'blog-gradient-6' },
];

export default function BlogPage() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? PLACEHOLDER_POSTS : PLACEHOLDER_POSTS.filter(p => p.category === active);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-8">Guides, reviews, and strategies for Canadian credit card enthusiasts.</p>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${active === cat
              ? 'bg-primary text-white dark:text-background shadow-md shadow-primary/20'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-6 animate-fade-in">
        {filtered.map(post => (
          <article key={post.title} className="group card-hover rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md">
            <div className={`h-32 ${post.gradient} flex items-center justify-center transition-all duration-300 group-hover:brightness-110`}>
              <span className="text-white/20 text-sm font-medium tracking-wider uppercase">Coming Soon</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded-full bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-emerald-300 px-3 py-0.5 text-xs font-medium">{post.category}</span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h2 className="text-lg font-semibold mb-2 leading-snug hover:text-primary transition-colors cursor-pointer">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Subscribe section */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-8 text-center text-white">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-gold" />
        </div>
        <h3 className="text-xl font-bold mb-2">Stay in the loop</h3>
        <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Get notified about new card deals, churning strategies, and blog posts. No spam, unsubscribe anytime.</p>
        <form onSubmit={e => e.preventDefault()} className="flex max-w-sm mx-auto gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 backdrop-blur-sm"
          />
          <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-dark hover:bg-gold-light transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
