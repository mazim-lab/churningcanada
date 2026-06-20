'use client';

import { useState, useMemo, Suspense } from 'react';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { allCards, Card, Benefits, formatCurrency, getUniqueNetworks } from '@/data/cards';
import { valuationFor } from '@/data/point-valuations';

type SortKey = 'name' | 'tags' | 'fee' | 'bonus' | 'cpp' | 'value';
type SortDir = 'asc' | 'desc';

const CARD_TYPES = ['travel', 'cashback', 'airline', 'hotel', 'business'];
const TAG_DEFS: [keyof Benefits, string][] = [
  ['lounge_access', 'lounge'], ['no_fx_fee', 'no-fx'], ['car_rental_insurance', 'car-ins'],
  ['free_checked_bags', 'free-bag'], ['travel_medical', 'travel-med'], ['trip_cancellation', 'trip-cancel'],
  ['mobile_insurance', 'mobile'], ['purchase_protection', 'purchase'], ['extended_warranty', 'warranty'], ['flight_delay', 'flight-delay'],
];
const RAIL_BENEFITS: [keyof Benefits, string][] = [
  ['lounge_access', 'Lounge access'], ['no_fx_fee', 'No FX fee'], ['car_rental_insurance', 'Car rental ins.'], ['free_checked_bags', 'Free checked bag'],
];
const COLUMNS: { key: SortKey; label: string; right?: boolean }[] = [
  { key: 'name', label: 'Card' }, { key: 'tags', label: 'Tags' }, { key: 'fee', label: 'Annual fee', right: true },
  { key: 'bonus', label: 'Bonus', right: true }, { key: 'cpp', label: 'Base ¢/pt', right: true }, { key: 'value', label: 'Est. 12-mo value', right: true },
];
const tagsFor = (c: Card) => TAG_DEFS.filter(([k]) => c.benefits[k]).map(([, l]) => l);
const cppFor = (c: Card) => c.cpp_cad ?? 1.0;

export default function CardsPage() {
  return <Suspense fallback={<div className="app norail"><main><div className="head"><h1>Card Explorer</h1></div></main></div>}><Explorer /></Suspense>;
}

function Explorer() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [country, setCountry] = useState<'CA' | 'US' | 'all'>((searchParams.get('country') as 'CA' | 'US') || 'all');
  const [types, setTypes] = useState<string[]>(searchParams.get('type') ? searchParams.get('type')!.split(',') : []);
  const [networks, setNetworks] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<(keyof Benefits)[]>([]);
  const [maxFee, setMaxFee] = useState(1000);
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allNetworks = useMemo(() => getUniqueNetworks(), []);
  const base = useMemo(() => (country === 'all' ? allCards : allCards.filter((c) => c.country === country)), [country]);
  const typeCounts = useMemo(() => Object.fromEntries(CARD_TYPES.map((t) => [t, base.filter((c) => c.categories.includes(t)).length])), [base]);
  const netCounts = useMemo(() => Object.fromEntries(allNetworks.map((n) => [n, base.filter((c) => c.network === n).length])), [base, allNetworks]);
  const benefitCounts = useMemo(() => Object.fromEntries(RAIL_BENEFITS.map(([k]) => [k, base.filter((c) => c.benefits[k]).length])), [base]);

  const filtered = useMemo(() => {
    let cards = base;
    if (query) {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean).map((w) => (w === 'amex' ? 'american express' : w));
      cards = cards.filter((c) => {
        let t = `${c.name} ${c.issuer} ${c.rewards_program} ${c.card_type}`.toLowerCase();
        if (t.includes('american express')) t += ' amex';
        if (t.includes('mastercard')) t += ' mc';
        return words.every((w) => t.includes(w));
      });
    }
    if (types.length) cards = cards.filter((c) => types.some((t) => c.categories.includes(t)));
    if (networks.length) cards = cards.filter((c) => networks.includes(c.network));
    if (benefits.length) cards = cards.filter((c) => benefits.every((b) => c.benefits[b]));
    if (maxFee < 1000) cards = cards.filter((c) => c.annual_fee <= maxFee);

    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (c: Card): number | string => {
      switch (sortKey) {
        case 'name': return c.name.toLowerCase();
        case 'tags': return tagsFor(c).length;
        case 'fee': return c.annual_fee;
        case 'bonus': return c.welcome_bonus_value;
        case 'cpp': return cppFor(c);
        case 'value': return c.first_year_value;
      }
    };
    return [...cards].sort((a, b) => {
      const av = val(a), bv = val(b);
      if (typeof av === 'string' || typeof bv === 'string') return String(av).localeCompare(String(bv)) * dir;
      return (av - bv) * dir;
    });
  }, [base, query, types, networks, benefits, maxFee, sortKey, sortDir]);

  const maxValue = Math.max(...filtered.map((c) => c.first_year_value), 1);
  const top = filtered.reduce<Card | null>((a, c) => (!a || c.first_year_value > a.first_year_value ? c : a), null);
  const noFx = filtered.filter((c) => c.benefits.no_fx_fee).length;
  let topCpp = 0, topProg = '';
  filtered.forEach((c) => { const v = valuationFor(c.rewards_program); const m = v.max ?? v.baseline; if (m > topCpp) { topCpp = m; topProg = c.rewards_program; } });

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc'); }
  };
  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const arrow = sortDir === 'asc' ? '▲' : '▼';
  const sortLabel = COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase() ?? 'value';

  return (
    <div className="app">
      <aside className="rail">
        <h4>Card type</h4>
        {CARD_TYPES.map((t) => (
          <label key={t} className={`filt${types.includes(t) ? ' on' : ''}`} style={{ textTransform: 'capitalize' }}>
            <input type="checkbox" checked={types.includes(t)} onChange={() => toggle(types, t, setTypes)} /> {t}
            <span className="ct">{typeCounts[t]}</span>
          </label>
        ))}

        <h4>Max annual fee</h4>
        <input type="range" min={0} max={1000} step={25} value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} />
        <div className="range">{maxFee >= 1000 ? 'Any' : `$0 — $${maxFee}`}</div>

        <h4>Benefits</h4>
        {RAIL_BENEFITS.map(([k, label]) => (
          <label key={k} className={`filt${benefits.includes(k) ? ' on' : ''}`}>
            <input type="checkbox" checked={benefits.includes(k)} onChange={() => toggle(benefits, k, setBenefits)} /> {label}
            <span className="ct">{benefitCounts[k]}</span>
          </label>
        ))}

        <h4>Network</h4>
        {allNetworks.map((n) => (
          <label key={n} className={`filt${networks.includes(n) ? ' on' : ''}`}>
            <input type="checkbox" checked={networks.includes(n)} onChange={() => toggle(networks, n, setNetworks)} /> {n}
            <span className="ct">{netCounts[n]}</span>
          </label>
        ))}

        <h4>Country</h4>
        {(['all', 'CA', 'US'] as const).map((c) => (
          <label key={c} className={`filt${country === c ? ' on' : ''}`}>
            <input type="radio" name="country" checked={country === c} onChange={() => setCountry(c)} /> {c === 'all' ? 'All' : c}
          </label>
        ))}
      </aside>

      <main>
        <div className="head">
          <h1>Card Explorer</h1>
          <span className="meta">showing {filtered.length} / {allCards.length} · sorted by {sortLabel} {arrow}</span>
        </div>
        <div className="subhead">Independent value engine — benefits verified from issuer documents, ranked by <b>estimated first-year value</b>. No sponsored placements.</div>

        <div className="stats">
          <div className="stat"><div className="l">Cards tracked</div><div className="v">{filtered.length}</div><div className="d">comprehensive data</div></div>
          <div className="stat"><div className="l">Top value</div><div className="v em">{top ? formatCurrency(top.first_year_value, top.country) : '—'}</div><div className="d">{top ? top.name : ''}</div></div>
          <div className="stat"><div className="l">Top ¢/pt</div><div className="v gd">{topCpp ? `${topCpp.toFixed(1)}¢` : '—'}</div><div className="d">{topProg ? `${topProg} sweet spot` : ''}</div></div>
          <div className="stat"><div className="l">No-FX options</div><div className="v">{noFx}</div><div className="d">0% foreign txn</div></div>
        </div>

        <div className="tablewrap">
          <div className="tablescroll">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className={col.right ? 'r' : ''} onClick={() => onSort(col.key)}>
                      {col.label}{sortKey === col.key && <span className="ar"> {arrow}</span>}
                    </th>
                  ))}
                  <th className="r">Value index</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const tags = tagsFor(c);
                  return (
                    <tr key={c.slug}>
                      <td>
                        <a href={`/cards/${c.slug}`}>
                          <div className="cn">{c.name}</div>
                          <div className="ci" style={{ textTransform: 'lowercase' }}>{c.issuer} · {c.rewards_program || c.card_type}</div>
                        </a>
                      </td>
                      <td>
                        {tags.slice(0, 3).map((t, i) => <span key={t} className={i === 0 ? 'tag em' : 'tag'}>{t}</span>)}
                        {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
                      </td>
                      <td className={`r mono${c.annual_fee > 0 ? ' negv' : ''}`}>{formatCurrency(c.annual_fee, c.country)}</td>
                      <td className="r mono">{c.welcome_bonus_points ? c.welcome_bonus_points.toLocaleString() : (c.welcome_bonus_value > 0 ? formatCurrency(c.welcome_bonus_value, c.country) : '—')}</td>
                      <td className="r mono">{cppFor(c).toFixed(2)}</td>
                      <td className={`r mono big ${c.first_year_value < 0 ? 'negv' : 'pos'}`}>{formatCurrency(c.first_year_value, c.country)}</td>
                      <td className="r"><span className="vbar" style={{ '--w': `${Math.max(0, (c.first_year_value / maxValue) * 100)}%` } as CSSProperties} /></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'var(--ink-dim)' }} className="mono">no cards match these filters</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="foot">
            <span>est. value = welcome bonus × base ¢/pt − annual fee · native currency</span>
            <span>click a column to sort · <a href="/how-we-value-points">methodology →</a></span>
          </div>
        </div>
      </main>
    </div>
  );
}
