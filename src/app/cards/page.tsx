'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { allCards, Card, Benefits, BENEFIT_LABELS, getUniqueIssuers, getUniqueNetworks } from '@/data/cards';
import { CardGrid, CardSkeleton } from '@/components/CardGrid';
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronDown } from 'lucide-react';

type SortOption = 'value' | 'bonus' | 'fee' | 'earn';
type FeeRange = 'all' | '0' | 'under100' | '100-299' | '300+';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'value', label: 'Best Value' },
  { value: 'bonus', label: 'Highest Bonus' },
  { value: 'fee', label: 'Lowest Fee' },
  { value: 'earn', label: 'Name A-Z' },
];

const CARD_TYPES = ['travel', 'cashback', 'rewards', 'hotel', 'airline', 'business', 'student', 'secured'];
const FEE_RANGES: { value: FeeRange; label: string }[] = [
  { value: 'all', label: 'Any' },
  { value: '0', label: '$0' },
  { value: 'under100', label: 'Under $100' },
  { value: '100-299', label: '$100–$299' },
  { value: '300+', label: '$300+' },
];

export default function CardsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16"><CardSkeleton /></div>}><CardsContent /></Suspense>;
}

function CardsContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState<'CA' | 'US' | 'all'>(
    (searchParams.get('country') as 'CA' | 'US') || 'all'
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('type') ? searchParams.get('type')!.split(',') : []
  );
  const [businessOnly, setBusinessOnly] = useState(false);
  const [personalOnly, setPersonalOnly] = useState(false);
  const [selectedIssuers, setSelectedIssuers] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [feeRange, setFeeRange] = useState<FeeRange>(
    searchParams.get('maxFee') === '0' ? '0' : (searchParams.get('fee') as FeeRange) || 'all'
  );
  const [minBonus, setMinBonus] = useState(0);
  const [selectedBenefits, setSelectedBenefits] = useState<(keyof Benefits)[]>([]);
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'value');
  const [listView, setListView] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [issuerSearch, setIssuerSearch] = useState('');

  const allIssuers = useMemo(() => getUniqueIssuers(), []);
  const allNetworks = useMemo(() => getUniqueNetworks(), []);

  const filteredIssuers = useMemo(
    () => issuerSearch ? allIssuers.filter(i => i.toLowerCase().includes(issuerSearch.toLowerCase())) : allIssuers,
    [allIssuers, issuerSearch]
  );

  const filtered = useMemo(() => {
    let cards = allCards;
    if (query) {
      const q = query.toLowerCase();
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q) ||
        c.rewards_program.toLowerCase().includes(q) || c.card_type.toLowerCase().includes(q)
      );
    }
    if (country !== 'all') cards = cards.filter(c => c.country === country);
    if (selectedTypes.length > 0) cards = cards.filter(c => selectedTypes.includes(c.card_type));
    if (businessOnly) cards = cards.filter(c => c.is_business);
    if (personalOnly) cards = cards.filter(c => !c.is_business);
    if (selectedIssuers.length > 0) cards = cards.filter(c => selectedIssuers.includes(c.issuer));
    if (selectedNetworks.length > 0) cards = cards.filter(c => selectedNetworks.includes(c.network));
    if (feeRange === '0') cards = cards.filter(c => c.annual_fee === 0);
    else if (feeRange === 'under100') cards = cards.filter(c => c.annual_fee < 100);
    else if (feeRange === '100-299') cards = cards.filter(c => c.annual_fee >= 100 && c.annual_fee < 300);
    else if (feeRange === '300+') cards = cards.filter(c => c.annual_fee >= 300);
    if (minBonus > 0) cards = cards.filter(c => c.welcome_bonus_value >= minBonus);
    if (selectedBenefits.length > 0) cards = cards.filter(c => selectedBenefits.every(b => c.benefits[b]));

    switch (sort) {
      case 'value': cards = [...cards].sort((a, b) => b.first_year_value - a.first_year_value); break;
      case 'bonus': cards = [...cards].sort((a, b) => b.welcome_bonus_value - a.welcome_bonus_value); break;
      case 'fee': cards = [...cards].sort((a, b) => a.annual_fee - b.annual_fee); break;
      case 'earn': cards = [...cards].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return cards;
  }, [query, country, selectedTypes, businessOnly, personalOnly, selectedIssuers, selectedNetworks, feeRange, minBonus, selectedBenefits, sort]);

  const toggleType = (t: string) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleIssuer = (i: string) => setSelectedIssuers(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleNetwork = (n: string) => setSelectedNetworks(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const toggleBenefit = (b: keyof Benefits) => setSelectedBenefits(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const clearAll = () => {
    setQuery(''); setCountry('all'); setSelectedTypes([]); setBusinessOnly(false); setPersonalOnly(false);
    setSelectedIssuers([]); setSelectedNetworks([]); setFeeRange('all'); setMinBonus(0); setSelectedBenefits([]);
  };

  const hasFilters = query || country !== 'all' || selectedTypes.length > 0 || businessOnly || personalOnly || selectedIssuers.length > 0 || selectedNetworks.length > 0 || feeRange !== 'all' || minBonus > 0 || selectedBenefits.length > 0;

  // Build active filter pills
  const activeFilterPills: { label: string; onRemove: () => void }[] = [];
  if (country !== 'all') activeFilterPills.push({ label: country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 US', onRemove: () => setCountry('all') });
  selectedTypes.forEach(t => activeFilterPills.push({ label: t, onRemove: () => toggleType(t) }));
  if (businessOnly) activeFilterPills.push({ label: 'Business', onRemove: () => setBusinessOnly(false) });
  if (personalOnly) activeFilterPills.push({ label: 'Personal', onRemove: () => setPersonalOnly(false) });
  selectedIssuers.forEach(i => activeFilterPills.push({ label: i, onRemove: () => toggleIssuer(i) }));
  selectedNetworks.forEach(n => activeFilterPills.push({ label: n, onRemove: () => toggleNetwork(n) }));
  if (feeRange !== 'all') activeFilterPills.push({ label: `Fee: ${FEE_RANGES.find(r => r.value === feeRange)?.label}`, onRemove: () => setFeeRange('all') });
  if (minBonus > 0) activeFilterPills.push({ label: `Bonus ≥ $${minBonus}`, onRemove: () => setMinBonus(0) });
  selectedBenefits.forEach(b => activeFilterPills.push({ label: BENEFIT_LABELS[b], onRemove: () => toggleBenefit(b) }));

  const filterSidebar = (
    <div className="space-y-1">
      <CollapsibleSection title="Country" defaultOpen>
        <div className="flex gap-1">
          {(['all', 'CA', 'US'] as const).map(c => (
            <button key={c} onClick={() => setCountry(c)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${country === c ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
              {c === 'all' ? 'All' : c === 'CA' ? '🇨🇦 Canada' : '🇺🇸 US'}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Card Type" defaultOpen>
        <div className="flex flex-wrap gap-2">
          {CARD_TYPES.map(t => (
            <button key={t} onClick={() => toggleType(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${selectedTypes.includes(t) ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
              {t}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Personal / Business" defaultOpen>
        <div className="flex gap-1">
          <button onClick={() => { setPersonalOnly(false); setBusinessOnly(false); }} className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${!personalOnly && !businessOnly ? 'bg-primary text-white' : 'bg-muted'}`}>All</button>
          <button onClick={() => { setPersonalOnly(true); setBusinessOnly(false); }} className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${personalOnly ? 'bg-primary text-white' : 'bg-muted'}`}>Personal</button>
          <button onClick={() => { setBusinessOnly(true); setPersonalOnly(false); }} className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${businessOnly ? 'bg-primary text-white' : 'bg-muted'}`}>Business</button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Issuer">
        <input type="text" placeholder="Search issuers..." value={issuerSearch} onChange={e => setIssuerSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredIssuers.map(i => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
              <input type="checkbox" checked={selectedIssuers.includes(i)} onChange={() => toggleIssuer(i)} />
              {i}
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Network">
        <div className="space-y-1">
          {allNetworks.map(n => (
            <label key={n} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
              <input type="checkbox" checked={selectedNetworks.includes(n)} onChange={() => toggleNetwork(n)} />
              {n}
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Annual Fee">
        <div className="flex flex-wrap gap-1.5">
          {FEE_RANGES.map(r => (
            <button key={r.value} onClick={() => setFeeRange(r.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${feeRange === r.value ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={`Min Bonus: $${minBonus}`}>
        <input type="range" min={0} max={3000} step={100} value={minBonus} onChange={e => setMinBonus(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>$0</span><span>$3,000</span></div>
      </CollapsibleSection>

      <CollapsibleSection title="Benefits">
        <div className="space-y-1">
          {(Object.keys(BENEFIT_LABELS) as (keyof Benefits)[]).map(b => (
            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
              <input type="checkbox" checked={selectedBenefits.includes(b)} onChange={() => toggleBenefit(b)} />
              {BENEFIT_LABELS[b]}
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {hasFilters && (
        <button onClick={clearAll} className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors mt-4">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Card Explorer</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} cards found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="hidden sm:flex border border-border rounded-full overflow-hidden">
            <button onClick={() => setListView(false)} className={`p-2 ${!listView ? 'bg-primary text-white' : 'bg-background'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setListView(true)} className={`p-2 ${listView ? 'bg-primary text-white' : 'bg-background'}`}><List className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden rounded-lg border border-border p-2 hover:bg-muted">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilterPills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeFilterPills.map((pill, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium dark:bg-primary-light/20 dark:text-emerald-300">
              {pill.label}
              <button onClick={pill.onRemove} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">{filterSidebar}</div>
        </aside>
        <div className="flex-1 min-w-0">
          <CardGrid cards={filtered} listView={listView} />
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background border-l border-border overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-4 pt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
        {title}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3 animate-fade-in">{children}</div>}
    </div>
  );
}
