import { allCards, Card, BENEFIT_LABELS, Benefits, getMaxFirstYearValue } from '@/data/cards';
import { IssuerAvatar } from '@/components/IssuerAvatar';
import { NetworkBadge } from '@/components/NetworkBadge';
import { Check, X, ExternalLink, ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export function generateStaticParams() {
  return allCards.map(card => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = allCards.find(c => c.slug === slug);
  if (!card) return { title: 'Card Not Found' };
  return {
    title: `${card.name} — ChurningCanada`,
    description: `${card.name} by ${card.issuer}. Annual fee: $${card.annual_fee}. ${card.welcome_bonus || 'Compare and learn more.'}`,
  };
}

export default async function CardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = allCards.find(c => c.slug === slug);

  if (!card) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Card Not Found</h1>
        <Link href="/cards" className="text-accent hover:underline">← Back to Card Explorer</Link>
      </div>
    );
  }

  const activeBenefits = Object.entries(card.benefits).filter(([, v]) => v) as [keyof Benefits, boolean][];
  const inactiveBenefits = Object.entries(card.benefits).filter(([, v]) => !v) as [keyof Benefits, boolean][];

  const similar = allCards
    .filter(c => c.slug !== card.slug && c.card_type === card.card_type && c.country === card.country)
    .sort((a, b) => a.annual_fee - b.annual_fee)
    .slice(0, 3);

  return (
    <div>
      {/* Gradient banner */}
      <div className="bg-gradient-to-b from-muted to-background pt-4 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cards" className="hover:text-foreground transition-colors">Cards</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{card.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <IssuerAvatar issuer={card.issuer} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.country === 'CA' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
              {card.country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'}
            </span>
            <NetworkBadge network={card.network} />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">{card.card_type}</span>
            {card.is_business && <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Business</span>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{card.name}</h1>
          <p className="text-muted-foreground">{card.issuer} · {card.rewards_program || 'N/A'}</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Annual Fee" value={card.annual_fee === 0 ? 'Free' : `$${card.annual_fee}`} />
        {card.first_year_fee !== null && <StatCard label="First Year Fee" value={card.first_year_fee === 0 ? 'Free' : `$${card.first_year_fee}`} />}
        <StatCard label="Welcome Bonus" value={card.welcome_bonus || '—'} highlight />
        {card.first_year_value > 0 && <StatCard label="1st Year Value" value={`$${Math.round(card.first_year_value).toLocaleString()}`} />}
      </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Welcome bonus */}
      {card.welcome_bonus && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 mb-8">
          <h3 className="text-base font-semibold text-foreground mb-3">Welcome Bonus</h3>
          <p className="text-sm text-foreground">{card.welcome_bonus}</p>
          {card.welcome_bonus_conditions && (
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t border-gold/20 pt-3">{card.welcome_bonus_conditions}</p>
          )}
        </div>
      )}

      {/* Notes for Canadians */}
      {card.notes_for_canadians && (
        <div className="rounded-xl border-2 border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50/80 via-orange-50/30 to-white dark:from-red-900/15 dark:via-orange-900/5 dark:to-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🍁</span>
            <p className="text-sm font-bold tracking-wide text-red-800 dark:text-red-300">Notes for Canadians</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">{card.notes_for_canadians}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Earn Rates */}
        <div>
          <h2 className="text-lg font-bold mb-4">Earn Rates</h2>
          {card.earn_rates.length > 0 ? (
            <div className="space-y-2">
              {[...card.earn_rates]
                .sort((a, b) => {
                  const numA = parseFloat(a.rate) || 0;
                  const numB = parseFloat(b.rate) || 0;
                  return numB - numA;
                })
                .map((er, i) => {
                  const multiplier = er.rate.match(/^[\d.]+x?/)?.[0] || er.rate;
                  const isTop = i === 0;
                  return (
                    <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${isTop ? 'bg-gold/10 border border-gold/20' : 'bg-muted/70'}`}>
                      <span className={`inline-flex items-center justify-center rounded-full min-w-[3rem] h-9 px-2 text-base font-bold ${isTop ? 'bg-gradient-to-br from-gold to-gold-dark text-primary-dark' : 'bg-accent/10 text-accent'}`}>
                        {multiplier}
                      </span>
                      <span className="text-sm font-medium">{er.category}</span>
                    </div>
                  );
                })}
            </div>
          ) : card.earn_rates_summary ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{card.earn_rates_summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No earn rate data available.</p>
          )}
        </div>

        {/* Benefits */}
        <div>
          <h2 className="text-lg font-bold mb-4">Benefits & Insurance</h2>
          {card.benefits_incomplete ? (
            <div className="rounded-lg border border-border/50 bg-muted/50 px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">Benefits data coming soon</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeBenefits.map(([key]) => (
                <div key={key} className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-900/15 px-4 py-2.5 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span>{BENEFIT_LABELS[key]}</span>
                </div>
              ))}
              {inactiveBenefits.map(([key]) => (
                <div key={key} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted-foreground/60">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <X className="w-3 h-3 text-muted-foreground/40" />
                  </span>
                  <span>{BENEFIT_LABELS[key]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key Perks */}
      {card.key_perks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Key Perks</h2>
          <ul className="space-y-2">
            {card.key_perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insurance details */}
      {Object.keys(card.insurance).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Insurance Details</h2>
          <div className="space-y-3">
            {Object.entries(card.insurance).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-border/50 p-4">
                <p className="text-sm font-medium capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pros/Cons */}
      {(card.pros.length > 0 || card.cons.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {card.pros.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Pros</h2>
              <ul className="space-y-2">
                {card.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span className="leading-relaxed">{p}</span></li>
                ))}
              </ul>
            </div>
          )}
          {card.cons.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Cons</h2>
              <ul className="space-y-2">
                {card.cons.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><span className="leading-relaxed">{p}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Apply link */}
      {card.apply_url && (
        <a href={card.apply_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light transition-colors mb-8">
          Learn More <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Similar Cards - horizontal scroll */}
      {similar.length > 0 && (
        <div className="border-t border-border/50 pt-8">
          <h2 className="text-lg font-bold mb-4">Similar Cards</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {similar.map(c => (
              <Link key={c.slug} href={`/cards/${c.slug}`}
                className="card-hover flex-none w-[260px] snap-start rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <IssuerAvatar issuer={c.issuer} size="sm" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.issuer}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">{c.annual_fee === 0 ? 'Free' : `$${c.annual_fee}/yr`}</span>
                  {c.welcome_bonus && <span className="text-gold-dark font-bold truncate max-w-[150px]">{c.welcome_bonus}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: card.name,
            description: `${card.name} by ${card.issuer}. ${card.card_type} credit card.`,
            brand: { '@type': 'Brand', name: card.issuer },
            offers: { '@type': 'Offer', price: card.annual_fee, priceCurrency: card.country === 'CA' ? 'CAD' : 'USD' },
          }),
        }}
      />
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-gold/30 bg-gold/[0.04]' : 'border-border/50 bg-card'}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</p>
      <p className={`font-bold ${highlight ? 'text-2xl text-gold-text dark:text-gold' : 'text-xl'}`}>{value}</p>
    </div>
  );
}

function ValueMeter({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Card Value Score</span>
        <span className="text-sm font-bold text-gold-text dark:text-gold">${value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold value-meter-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Relative to best card (${max})</p>
    </div>
  );
}
