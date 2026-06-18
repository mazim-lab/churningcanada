'use client';

import { Card } from '@/data/cards';
import { CreditCard } from 'lucide-react';
import { CardTileV2, CardCompareRow, CardCompareHeader } from '@/components/CardPrototypes';

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
      <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
        <CardCompareHeader />
        {cards.map(card => <CardCompareRow key={`${card.country}-${card.slug}`} card={card} />)}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {cards.map(card => <CardTileV2 key={`${card.country}-${card.slug}`} card={card} />)}
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
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-3 w-full" />
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, j) => <div key={j} className="skeleton w-16 h-6 rounded-full" />)}
          </div>
        </div>
      ))}
    </div>
  );
}
