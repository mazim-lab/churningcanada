'use client';

import { Card, Benefits, BENEFIT_LABELS } from '@/data/cards';
import { getCategoryColor } from '@/data/card-images';
import { IssuerAvatar } from '@/components/IssuerAvatar';
import { NetworkBadge } from '@/components/NetworkBadge';
import { CreditCard, Plane, Shield, Wifi, Car, Heart, Clock, Smartphone, ShoppingBag, Wrench, Luggage } from 'lucide-react';

const benefitIcons: Record<keyof Benefits, React.ElementType> = {
  lounge_access: Plane,
  no_fx_fee: Wifi,
  car_rental_insurance: Car,
  travel_medical: Heart,
  trip_cancellation: Shield,
  flight_delay: Clock,
  mobile_insurance: Smartphone,
  purchase_protection: ShoppingBag,
  extended_warranty: Wrench,
  free_checked_bags: Luggage,
};

export function CardGrid({ cards, listView = false }: { cards: Card[]; listView?: boolean }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 opacity-40" />
        </div>
        <p className="text-lg font-semibold text-foreground/70">No cards match your filters</p>
        <p className="text-sm mt-1">Try adjusting your search criteria</p>
      </div>
    );
  }

  if (listView) {
    return (
      <div className="space-y-3 animate-fade-in">
        {cards.map(card => (
          <CardListItem key={`${card.country}-${card.slug}`} card={card} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {cards.map(card => (
        <CardGridItem key={`${card.country}-${card.slug}`} card={card} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton w-10 h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-14 rounded-lg" />
            <div className="skeleton h-14 rounded-lg" />
          </div>
          <div className="skeleton h-3 w-full" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="skeleton w-7 h-7 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardGridItem({ card }: { card: Card }) {
  const activeBenefits = Object.entries(card.benefits).filter(([, v]) => v) as [keyof Benefits, boolean][];
  const categoryBorder = getCategoryColor(card.card_type);

  return (
    <a
      href={`/cards/${card.slug}`}
      className={`card-hover group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 border-l-[3px] ${categoryBorder}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${card.country === 'CA' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
              {card.country === 'CA' ? '🇨🇦' : '🇺🇸'} {card.country}
            </span>
            <NetworkBadge network={card.network} />
            {card.is_business && (
              <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                Biz
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[15px] text-card-foreground group-hover:text-accent transition-colors leading-tight">
            {card.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{card.issuer}</p>
        </div>
        <IssuerAvatar issuer={card.issuer} size="md" />
      </div>

      {/* Fee & Bonus */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg bg-muted/70 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Annual Fee</p>
          <p className="font-bold text-sm mt-0.5">{card.annual_fee === 0 ? 'Free' : `$${card.annual_fee}`}</p>
        </div>
        <div className="rounded-lg bg-muted/70 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Welcome Bonus</p>
          <p className="font-bold text-sm mt-0.5 text-gold-text dark:text-gold line-clamp-1">{card.welcome_bonus || '—'}</p>
        </div>
      </div>

      {/* Earn rates summary */}
      {card.earn_rates_summary && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{card.earn_rates_summary}</p>
      )}

      {/* Benefit icons */}
      {activeBenefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeBenefits.slice(0, 5).map(([key]) => {
            const Icon = benefitIcons[key];
            return (
              <span key={key} title={BENEFIT_LABELS[key]} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </span>
            );
          })}
          {activeBenefits.length > 5 && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted text-xs text-muted-foreground">
              +{activeBenefits.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Welcome bonus text */}
      {card.welcome_bonus && !card.earn_rates_summary && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{card.welcome_bonus}</p>
      )}

      {/* Card page link */}
      {card.apply_url && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <a
            href={card.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1"
          >
            View on {card.issuer} →
          </a>
        </div>
      )}
    </a>
  );
}

function CardListItem({ card }: { card: Card }) {
  const activeBenefits = Object.entries(card.benefits).filter(([, v]) => v) as [keyof Benefits, boolean][];
  const categoryBorder = getCategoryColor(card.card_type);

  return (
    <a
      href={`/cards/${card.slug}`}
      className={`card-hover group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 border-l-[3px] ${categoryBorder}`}
    >
      <IssuerAvatar issuer={card.issuer} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm group-hover:text-accent transition-colors truncate">{card.name}</h3>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold ${card.country === 'CA' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
            {card.country === 'CA' ? '🇨🇦' : '🇺🇸'}
          </span>
          <NetworkBadge network={card.network} />
        </div>
        <p className="text-xs text-muted-foreground">{card.issuer}</p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5">
        {activeBenefits.slice(0, 4).map(([key]) => {
          const Icon = benefitIcons[key];
          return <span key={key} title={BENEFIT_LABELS[key]} className="w-6 h-6 rounded bg-muted flex items-center justify-center"><Icon className="w-3 h-3 text-muted-foreground" /></span>;
        })}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">{card.annual_fee === 0 ? 'Free' : `$${card.annual_fee}/yr`}</p>
        {card.welcome_bonus && <p className="text-xs text-gold-dark font-bold truncate max-w-[120px]">{card.welcome_bonus}</p>}
      </div>
    </a>
  );
}
