'use client';

import { Card, Benefits, BENEFIT_LABELS, formatCurrency } from '@/data/cards';
import { getCategoryColor } from '@/data/card-images';
import { IssuerAvatar } from '@/components/IssuerAvatar';
import { NetworkBadge } from '@/components/NetworkBadge';
import { Plane, Wifi, Car, Heart, Shield, Clock, Smartphone, ShoppingBag, Wrench, Luggage, ArrowRight } from 'lucide-react';

const benefitIcons: Record<keyof Benefits, React.ElementType> = {
  lounge_access: Plane, no_fx_fee: Wifi, car_rental_insurance: Car, travel_medical: Heart,
  trip_cancellation: Shield, flight_delay: Clock, mobile_insurance: Smartphone,
  purchase_protection: ShoppingBag, extended_warranty: Wrench, free_checked_bags: Luggage,
};

function fee(card: Card) { return card.annual_fee === 0 ? 'No annual fee' : `$${card.annual_fee}/yr`; }
function activeBenefits(card: Card) {
  return (Object.entries(card.benefits).filter(([, v]) => v) as [keyof Benefits, boolean][]);
}

/* ── Option A: cleaner, more visual tile ───────────────────────────── */
export function CardTileV2({ card }: { card: Card }) {
  const benefits = activeBenefits(card);
  const border = getCategoryColor(card.card_type);
  return (
    <a href={`/cards/${card.slug}`} className={`card-hover group flex flex-col rounded-2xl border border-border bg-card p-6 border-l-[3px] ${border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <IssuerAvatar issuer={card.issuer} size="md" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{card.issuer}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              {card.country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 US'}
            </span>
          </div>
        </div>
        <NetworkBadge network={card.network} />
      </div>

      <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg leading-snug text-card-foreground group-hover:text-gold-text dark:group-hover:text-gold transition-colors">
        {card.name}
      </h3>

      <div className="mt-4 mb-3">
        {card.first_year_value > 0 ? (
          <>
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-gold-text dark:text-gold leading-none">
              {formatCurrency(Math.round(card.first_year_value), card.country as 'CA' | 'US')}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
              Est. first-year value{card.first_year_value_formula ? ` · ${card.first_year_value_formula}` : ''}
            </p>
          </>
        ) : (
          <p className="font-semibold text-card-foreground">{card.welcome_bonus || '—'}</p>
        )}
      </div>

      {card.welcome_bonus && card.first_year_value > 0 && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{card.welcome_bonus}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80">{fee(card)}</span>
        {benefits.slice(0, 2).map(([k]) => (
          <span key={k} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80">
            {(() => { const I = benefitIcons[k]; return <I className="w-3 h-3" />; })()} {BENEFIT_LABELS[k]}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 text-sm font-semibold text-gold-text dark:text-gold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
        View card <ArrowRight className="w-4 h-4" />
      </div>
    </a>
  );
}

/* ── Option B: comparison table rows ───────────────────────────────── */
export function CardCompareHeader() {
  return (
    <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
      <div className="col-span-4">Card</div>
      <div className="col-span-2">Annual fee</div>
      <div className="col-span-3">Welcome bonus</div>
      <div className="col-span-2">1st-yr value</div>
      <div className="col-span-1"></div>
    </div>
  );
}

export function CardCompareRow({ card }: { card: Card }) {
  const border = getCategoryColor(card.card_type);
  return (
    <a href={`/cards/${card.slug}`} className={`group grid grid-cols-2 md:grid-cols-12 gap-x-3 gap-y-1 items-center px-4 py-3.5 border-b border-border/70 hover:bg-muted/50 transition-colors border-l-[3px] ${border}`}>
      <div className="col-span-2 md:col-span-4 flex items-center gap-3 min-w-0">
        <IssuerAvatar issuer={card.issuer} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-card-foreground truncate group-hover:text-gold-text dark:group-hover:text-gold transition-colors">{card.name}</p>
          <p className="text-xs text-muted-foreground truncate">{card.issuer} · {card.country}</p>
        </div>
      </div>
      <div className="md:col-span-2 text-sm">
        <span className="md:hidden text-muted-foreground text-xs mr-1">Fee:</span>{card.annual_fee === 0 ? 'Free' : `$${card.annual_fee}`}
      </div>
      <div className="md:col-span-3 text-sm text-muted-foreground line-clamp-1" title={card.welcome_bonus || ''}>{card.welcome_bonus || '—'}</div>
      <div className="md:col-span-2 text-sm font-bold text-gold-text dark:text-gold">
        {card.first_year_value > 0 ? formatCurrency(Math.round(card.first_year_value), card.country as 'CA' | 'US') : '—'}
      </div>
      <div className="md:col-span-1 text-gold-text dark:text-gold justify-self-end">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}
