'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { allCards, Card, BENEFIT_LABELS, Benefits } from '@/data/cards';
import { IssuerAvatar } from '@/components/IssuerAvatar';
import { Search, X, CreditCard, Check, Minus, Trophy, Plus } from 'lucide-react';

export default function ComparePage() {
  const [selected, setSelected] = useState<Card[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const results = useMemo(() => {
    if (!search) return [];
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return allCards.filter(c => {
      if (selected.find(s => s.slug === c.slug)) return false;
      const searchText = `${c.name} ${c.issuer}`.toLowerCase();
      return words.every(w => searchText.includes(w));
    }).slice(0, 10);
  }, [search, selected]);

  const addCard = (card: Card) => {
    if (selected.length < 4) {
      setSelected([...selected, card]);
      setSearch('');
      setShowSearch(false);
    }
  };

  const removeCard = (slug: string) => setSelected(selected.filter(c => c.slug !== slug));

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSearch) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearch]);

  const benefitKeys = Object.keys(BENEFIT_LABELS) as (keyof Benefits)[];

  const bestFee = selected.length > 1 ? Math.min(...selected.map(c => c.annual_fee)) : null;
  const bestBonus = selected.length > 1 ? Math.max(...selected.map(c => c.welcome_bonus_value)) : null;
  const bestValue = selected.length > 1 ? Math.max(...selected.map(c => c.first_year_value)) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Compare Cards</h1>
      <p className="text-muted-foreground mb-8">Select up to 4 cards to compare side by side.</p>

      {/* Card selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {selected.map(card => (
          <div key={card.slug} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <IssuerAvatar issuer={card.issuer} size="sm" />
            <div className="min-w-0">
              <span className="text-sm font-medium block truncate max-w-[150px]">{card.name}</span>
              <span className="text-xs text-muted-foreground">{card.issuer}</span>
            </div>
            <button onClick={() => removeCard(card.slug)} className="text-muted-foreground hover:text-red-500 transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, (selected.length > 0 ? 4 : 1) - selected.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="relative" ref={i === 0 ? searchRef : undefined}>
            {i === 0 ? (
              <>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-4 text-sm text-muted-foreground hover:border-primary hover:text-accent transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add a card
                </button>
                {showSearch && (
                  <div className="absolute top-full mt-2 left-0 w-80 rounded-xl border border-border bg-card shadow-xl z-10">
                    <div className="p-3 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search cards..." value={search} onChange={e => setSearch(e.target.value)} autoFocus
                          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {results.map(card => (
                        <button key={card.slug} onClick={() => addCard(card)}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0 flex items-center gap-3">
                          <IssuerAvatar issuer={card.issuer} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{card.name}</p>
                            <p className="text-xs text-muted-foreground">{card.issuer} · {card.country === 'CA' ? '🇨🇦' : '🇺🇸'}</p>
                          </div>
                        </button>
                      ))}
                      {search && results.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No cards found</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/50 px-6 py-4 text-sm text-muted-foreground/50 min-w-[140px]">
                <Plus className="w-4 h-4 mr-1" /> Add card
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {selected.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground w-40" />
                {selected.map(card => (
                  <th key={card.slug} className="p-4 text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <IssuerAvatar issuer={card.issuer} size="md" />
                      <div>
                        <p className="font-semibold text-sm">{card.name}</p>
                        <p className="text-xs text-muted-foreground">{card.issuer}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Country" values={selected.map(c => c.country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 US')} odd />
              <CompareRow label="Network" values={selected.map(c => c.network)} />
              <CompareRow label="Annual Fee" values={selected.map(c => c.annual_fee === 0 ? 'Free' : `$${c.annual_fee}`)} winners={selected.map(c => c.annual_fee === bestFee)} odd />
              <CompareRow label="Welcome Bonus" values={selected.map(c => c.welcome_bonus || '—')} />
              <CompareRow label="Bonus Value" values={selected.map(c => c.welcome_bonus_value > 0 ? `$${c.welcome_bonus_value}` : '—')} winners={selected.map(c => c.welcome_bonus_value === bestBonus && bestBonus! > 0)} odd />
              <CompareRow label="First Year Value" values={selected.map(c => c.first_year_value > 0 ? `$${c.first_year_value}` : '—')} winners={selected.map(c => c.first_year_value === bestValue && bestValue! > 0)} />
              <CompareRow label="Earn Rates" values={selected.map(c => c.earn_rates_summary || '—')} odd />
              <CompareRow label="Rewards Program" values={selected.map(c => c.rewards_program || '—')} />
              {benefitKeys.map((key, i) => (
                <CompareRow key={key} label={BENEFIT_LABELS[key]} values={selected.map(c => c.benefits[key] ? '✓' : '—')} isBenefit odd={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 opacity-40" />
          </div>
          <p className="text-lg font-semibold text-foreground/70">Add cards to start comparing</p>
          <p className="text-sm mt-1">Search and select up to 4 cards above</p>
        </div>
      )}
    </div>
  );
}

function CompareRow({ label, values, winners, isBenefit, odd }: { label: string; values: string[]; winners?: boolean[]; isBenefit?: boolean; odd?: boolean }) {
  return (
    <tr className={`border-t border-border/50 ${odd ? 'bg-muted/30' : ''}`}>
      <td className="p-3 text-sm font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[120px]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`p-3 text-center text-sm ${winners?.[i] ? 'bg-gold/10' : ''}`}>
          <span className={`${winners?.[i] ? 'text-gold-dark font-bold' : ''} ${isBenefit && v === '✓' ? 'text-green-600 dark:text-green-400 font-bold text-base' : ''} ${isBenefit && v === '—' ? 'text-muted-foreground/30' : ''}`}>
            {winners?.[i] && <Trophy className="w-3.5 h-3.5 inline mr-1 text-gold" />}
            {v}
          </span>
        </td>
      ))}
    </tr>
  );
}
