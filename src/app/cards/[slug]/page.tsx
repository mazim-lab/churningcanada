import { allCards, Card, BENEFIT_LABELS, Benefits, formatCurrency } from '@/data/cards';
import { valuationFor } from '@/data/point-valuations';
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
    title: `${card.name} — FinTerminal`,
    description: `${card.name} by ${card.issuer}. Annual fee: ${formatCurrency(card.annual_fee, card.country)}. ${card.welcome_bonus || 'Compare and learn more.'}`,
  };
}

const TAG_DEFS: [keyof Benefits, string][] = [
  ['lounge_access', 'lounge'], ['no_fx_fee', 'no-fx'], ['car_rental_insurance', 'car-ins'],
  ['free_checked_bags', 'free-bag'], ['travel_medical', 'travel-med'], ['trip_cancellation', 'trip-cancel'],
  ['mobile_insurance', 'mobile'], ['purchase_protection', 'purchase'], ['extended_warranty', 'warranty'], ['flight_delay', 'flight-delay'],
];

export default async function CardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = allCards.find(c => c.slug === slug);

  if (!card) {
    return (
      <div className="app norail">
        <main>
          <div className="head"><h1>404 · No Such Card</h1></div>
          <p className="cd-empty">That card isn’t in the registry. <Link href="/cards" style={{ color: 'var(--emerald)', fontWeight: 700 }}>← back to explorer</Link></p>
        </main>
      </div>
    );
  }

  const benefitEntries = Object.entries(card.benefits) as [keyof Benefits, boolean][];
  const active = benefitEntries.filter(([, v]) => v);
  const cpp = card.cpp_cad ?? 1.0;
  const val = valuationFor(card.rewards_program);
  const maxCpp = val.max ?? null;
  const bonusDisplay = card.welcome_bonus_points
    ? card.welcome_bonus_points.toLocaleString()
    : (card.welcome_bonus_value > 0 ? formatCurrency(card.welcome_bonus_value, card.country) : '—');
  const fxLabel = card.foreign_transaction_fee === false
    ? '0%'
    : (card.foreign_transaction_fee_pct != null ? `${card.foreign_transaction_fee_pct}%` : '—');

  const tags = TAG_DEFS.filter(([k]) => card.benefits[k]).map(([, l]) => l);

  // Drop APR/interest-rate rows that leaked into earn_rates (no card earns >10× base).
  const earnRates = [...card.earn_rates]
    .filter(er => { const n = parseFloat(er.rate); return isNaN(n) || n <= 10; })
    .sort((a, b) => (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0));

  const similar = allCards
    .filter(c => c.slug !== card.slug && c.card_type === card.card_type && c.country === card.country)
    .sort((a, b) => b.first_year_value - a.first_year_value)
    .slice(0, 4);

  return (
    <div className="app norail">
      <main>
        <nav className="crumb">
          <Link href="/">home</Link><span className="sep">/</span>
          <Link href="/cards">cards</Link><span className="sep">/</span>
          <span className="cur">{card.slug}</span>
        </nav>

        <div className="head">
          <h1>{card.name}</h1>
          <span className="meta">{card.issuer} · {card.rewards_program || card.card_type} · {card.network}</span>
        </div>

        <div className="cd-tags">
          <span className="tag em">{card.country === 'CA' ? 'Canada' : 'United States'}</span>
          <span className="tag">{card.card_type}</span>
          {card.is_business && <span className="tag">business</span>}
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        {/* headline vitals */}
        <div className="vitals">
          <div className="vital">
            <div className="k">Annual fee</div>
            <div className={`val${card.annual_fee > 0 ? ' neg' : ''}`}>{card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee, card.country)}</div>
            {card.first_year_fee != null && card.first_year_fee !== card.annual_fee && (
              <div className="sub">{card.first_year_fee === 0 ? 'first year free' : `first year ${formatCurrency(card.first_year_fee, card.country)}`}</div>
            )}
          </div>
          <div className="vital">
            <div className="k">Welcome bonus</div>
            <div className="val">{bonusDisplay}</div>
            <div className="sub">{card.welcome_bonus_points ? 'points' : (card.welcome_bonus_value > 0 ? 'est. value' : 'none listed')}</div>
          </div>
          <div className="vital">
            <div className="k">Est. 12-mo value</div>
            <div className={`val ${card.first_year_value < 0 ? 'neg' : 'pos'}`}>{formatCurrency(card.first_year_value, card.country)}</div>
            <div className="sub">bonus × ¢/pt − fee</div>
          </div>
          <div className="vital">
            <div className="k">Base ¢/pt</div>
            <div className="val">{cpp.toFixed(2)}</div>
            {maxCpp && <div className="sub">up to {maxCpp.toFixed(1)}¢ sweet spot</div>}
          </div>
          <div className="vital">
            <div className="k">Foreign txn</div>
            <div className={`val sm${fxLabel === '0%' ? ' pos' : ''}`}>{fxLabel}</div>
          </div>
          <div className="vital">
            <div className="k">Benefits</div>
            <div className="val sm">{active.length} / {benefitEntries.length}</div>
          </div>
        </div>

        {card.first_year_value_formula && (
          <p className="cd-formula">// {card.first_year_value_formula} = <b>{formatCurrency(card.first_year_value, card.country)}</b></p>
        )}

        {/* welcome bonus detail */}
        {card.welcome_bonus && (
          <>
            <div className="cd-sec">Welcome Offer</div>
            <div className="cd-note">
              {card.welcome_bonus}
              {card.welcome_bonus_conditions && <div className="fine">{card.welcome_bonus_conditions}</div>}
            </div>
          </>
        )}

        {/* notes for canadians */}
        {card.notes_for_canadians && (
          <>
            <div className="cd-sec">Note · For Canadians</div>
            <div className="cd-note red">{card.notes_for_canadians}</div>
          </>
        )}

        {/* earn rates */}
        <div className="cd-sec">Earn Rates</div>
        {earnRates.length > 0 ? (
          <div>
            {earnRates.map((er, i) => (
              <div key={i} className="erow">
                <span className="erate">{er.rate.match(/^[\d.]+x?/)?.[0] || er.rate}</span>
                <span className="ecat">{er.category}</span>
              </div>
            ))}
          </div>
        ) : card.earn_rates_summary ? (
          <p className="cd-empty">{card.earn_rates_summary}</p>
        ) : (
          <p className="cd-empty">no earn-rate data on file</p>
        )}

        {/* benefits */}
        <div className="cd-sec">Benefits &amp; Insurance</div>
        {card.benefits_incomplete ? (
          <p className="cd-empty">benefits data pending verification</p>
        ) : (
          <div className="benlist">
            {benefitEntries.map(([key, on]) => (
              <div key={key} className={`ben ${on ? 'on' : 'off'}`}>
                <span className="mk">{on ? '✓' : '·'}</span>{BENEFIT_LABELS[key]}
              </div>
            ))}
          </div>
        )}

        {/* key perks */}
        {card.key_perks.length > 0 && (
          <>
            <div className="cd-sec">Key Perks</div>
            <div className="cd-list">
              {card.key_perks.map((p, i) => <div key={i} className="cd-li">{p}</div>)}
            </div>
          </>
        )}

        {/* insurance detail */}
        {Object.keys(card.insurance).length > 0 && (
          <>
            <div className="cd-sec">Insurance Detail</div>
            <div className="kv">
              {Object.entries(card.insurance).map(([k, v]) => (
                <div key={k} className="kvrow">
                  <div className="kvk">{k.replace(/_/g, ' ')}</div>
                  <div className="kvv">{v}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* pros / cons */}
        {(card.pros.length > 0 || card.cons.length > 0) && (
          <>
            <div className="cd-sec">Assessment</div>
            <div className="proscons">
              <div>
                {card.pros.map((p, i) => <div key={i} className="pc-li pro"><span className="s">+</span>{p}</div>)}
              </div>
              <div>
                {card.cons.map((p, i) => <div key={i} className="pc-li con"><span className="s">−</span>{p}</div>)}
              </div>
            </div>
          </>
        )}

        {/* apply */}
        {card.apply_url && (
          <div style={{ marginTop: 18 }}>
            <a href={card.apply_url} target="_blank" rel="noopener noreferrer" className="cd-apply">APPLY →</a>
          </div>
        )}

        {/* similar */}
        {similar.length > 0 && (
          <>
            <div className="cd-sec">Similar Cards</div>
            <div>
              {similar.map(c => (
                <div key={c.slug} className="simrow">
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/cards/${c.slug}`} className="sn">{c.name}</Link>
                    <div className="si">{c.issuer} · {c.annual_fee === 0 ? 'no fee' : `${formatCurrency(c.annual_fee, c.country)}/yr`}</div>
                  </div>
                  <span className="sv" style={c.first_year_value < 0 ? { color: 'var(--red)' } : undefined}>{formatCurrency(c.first_year_value, c.country)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="cd-formula" style={{ marginTop: 22 }}>// last updated {card.last_updated || '—'} · est. value = welcome bonus × base ¢/pt − annual fee</p>

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
      </main>
    </div>
  );
}
