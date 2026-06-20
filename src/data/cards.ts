import canadianCardsRaw from './canadian_cards_comprehensive.json';
import usCardsRaw from './us_cards_comprehensive.json';
import { valuationFor } from './point-valuations';

// ── Types ──────────────────────────────────────────────

export interface EarnRate {
  category: string;
  rate: string;
}

export interface Benefits {
  lounge_access: boolean;
  no_fx_fee: boolean;
  car_rental_insurance: boolean;
  travel_medical: boolean;
  trip_cancellation: boolean;
  flight_delay: boolean;
  mobile_insurance: boolean;
  purchase_protection: boolean;
  extended_warranty: boolean;
  free_checked_bags: boolean;
}

export interface Card {
  slug: string;
  name: string;
  issuer: string;
  network: string;
  card_type: string;
  annual_fee: number;
  first_year_fee: number | null;
  welcome_bonus: string;
  welcome_bonus_value: number;
  welcome_bonus_conditions: string;
  earn_rates: EarnRate[];
  earn_rates_summary: string;
  rewards_program: string;
  foreign_transaction_fee: boolean | null;
  foreign_transaction_fee_pct: number | null;
  key_perks: string[];
  insurance: Record<string, string>;
  country: 'CA' | 'US';
  sources: string[];
  last_updated: string;
  card_image_url: string | null;
  notes_for_canadians: string | null;
  pros: string[];
  cons: string[];
  // Computed
  is_business: boolean;
  categories: string[];
  benefits: Benefits;
  first_year_value: number;
  first_year_value_formula: string | null;
  cpp_cad: number | null;
  welcome_bonus_points: number | null;
  apply_url: string | null;
  benefits_incomplete: boolean;
}

// ── Helpers ────────────────────────────────────────────

function normalizeNetwork(n: string | null, context = ''): string {
  const lower = (n || '').toLowerCase();
  const hay = `${n || ''} ${context}`.toLowerCase();
  if (lower === 'mc' || hay.includes('mastercard')) return 'Mastercard';
  if (lower === 'amex' || lower === 'american express' || hay.includes('american express') || hay.includes('amex')) return 'Amex';
  if (hay.includes('visa')) return 'Visa';
  if (n && lower !== 'unknown' && lower !== 'unkn') return n;
  return 'Unknown';
}

function cleanEarnRateKey(key: string): string {
  return key
    .replace(/<[^>]*>/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(\w)/, (_, c) => c.toUpperCase());
}

function textContains(text: string, ...terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(t => lower.includes(t));
}

function extractBenefits(card: { key_perks?: string[] | null; insurance?: Record<string, string> | null }): Benefits {
  const allText = [
    ...(card.key_perks || []),
    ...Object.values(card.insurance || {}),
  ].join(' ').toLowerCase();

  return {
    lounge_access: textContains(allText, 'lounge', 'priority pass', 'dragonpass', 'centurion'),
    no_fx_fee: textContains(allText, 'no foreign transaction', 'no fx', 'no foreign exchange'),
    car_rental_insurance: textContains(allText, 'car rental', 'auto rental'),
    travel_medical: textContains(allText, 'medical', 'emergency medical'),
    trip_cancellation: textContains(allText, 'trip cancellation', 'trip interruption'),
    flight_delay: textContains(allText, 'flight delay', 'baggage delay'),
    mobile_insurance: textContains(allText, 'mobile', 'cell phone', 'device'),
    purchase_protection: textContains(allText, 'purchase protection'),
    extended_warranty: textContains(allText, 'extended warranty'),
    free_checked_bags: textContains(allText, 'checked bag', 'free bag'),
  };
}

// Derive filter categories (travel/hotel/airline/cashback/rewards/business/student/secured)
// from the card's program, name and earn rates — the raw card_type is too coarse.
function deriveCategories(card: Card): string[] {
  const text = `${card.name} ${card.rewards_program} ${card.card_type} ${card.earn_rates_summary}`.toLowerCase();
  const brand = `${card.name} ${card.rewards_program}`.toLowerCase(); // for co-brand detection (earn rates cause false positives)
  const cats = new Set<string>();
  const has = (...ks: string[]) => ks.some(k => text.includes(k));
  const inBrand = (...ks: string[]) => ks.some(k => brand.includes(k));
  // airline/hotel = actual co-brand cards (by name/program), NOT cards that merely earn on travel
  const airline = inBrand('aeroplan', 'air canada', 'westjet', 'delta', 'skymiles', 'united', 'southwest', 'aadvantage', 'american airlines', 'avios', 'alaska', 'jetblue', 'flying blue', 'air miles', 'viporter', 'porter');
  const hotel = inBrand('bonvoy', 'marriott', 'hilton', 'ihg', 'hyatt', 'wyndham', 'best western');
  if (airline) cats.add('airline');
  if (hotel) cats.add('hotel');
  if (card.card_type === 'cashback' || has('cash back', 'cash-back', 'cashback', 'dividend', 'money-back', 'money back', 'rebate', 'simplycash', 'simply cash')) cats.add('cashback');
  if (has('membership rewards', 'ultimate rewards', 'td rewards', 'rbc rewards', 'bmo rewards', 'scene', 'thankyou', 'thank you', 'aventura', 'avion', 'aeroplan', 'rewards', 'points', 'miles')) cats.add('rewards');
  if (airline || hotel || has('aeroplan', 'avion', 'aventura', 'membership rewards', 'ultimate rewards', 'thankyou', 'passport', 'travel', 'miles', 'world elite', 'infinite') || card.benefits.lounge_access) cats.add('travel');
  if (card.is_business) cats.add('business');
  if (has('student')) cats.add('student');
  if (has('secured')) cats.add('secured');
  if (cats.size === 0) cats.add('rewards');
  return [...cats];
}

// ── Normalize Canadian cards ───────────────────────────

interface RawCA {
  slug: string;
  name: string;
  issuer: string | null;
  network: string;
  card_type: string;
  annual_fee: number;
  first_year_fee: number | string | null;
  welcome_bonus: string | null;
  welcome_bonus_value_cad: number | null;
  welcome_bonus_conditions: string | null;
  earn_rates: Record<string, string> | null;
  rewards_program: string | null;
  foreign_transaction_fee: string | boolean | null;
  foreign_transaction_fee_pct: number | null;
  key_perks: string[] | null;
  insurance: Record<string, string> | null;
  country: string;
  sources: string[];
  last_updated: string;
  card_image_url: string | null;
  pot_url?: string | null;
  pot_first_year_value?: number | null;
  first_year_value_cad?: number | null;
  cpp_cad?: number | null;
  welcome_bonus_points?: number | null;
  pros?: string[] | null;
  cons?: string[] | null;
  min_spend?: number | null;
  [key: string]: unknown;
}

function normalizeCA(raw: RawCA): Card {
  const earnRates: EarnRate[] = raw.earn_rates
    ? Object.entries(raw.earn_rates).map(([k, v]) => ({ category: cleanEarnRateKey(k), rate: v }))
    : [];

  const earnSummary = earnRates.map(e => `${e.rate} ${e.category}`).join(', ');
  // Value the bonus at OUR baseline cpp (points × baseline), consistent across the site;
  // fall back to the stored CAD value only for cards we have no points count for (e.g. cashback).
  const baselineCpp = valuationFor(raw.rewards_program || raw.name || '').baseline;
  const wbPoints = raw.welcome_bonus_points || null;
  const bonusValue = (wbPoints && baselineCpp)
    ? Math.round(wbPoints * baselineCpp / 100)
    : (raw.welcome_bonus_value_cad || raw.pot_first_year_value || 0);
  const firstYearFee = typeof raw.first_year_fee === 'number' ? raw.first_year_fee : null;
  const fee = raw.annual_fee || 0;

  const card: Card = {
    slug: raw.slug,
    name: raw.name,
    issuer: raw.issuer || 'Unknown',
    network: normalizeNetwork(raw.network, `${raw.name} ${raw.issuer || ''}`),
    card_type: raw.card_type || 'rewards',
    annual_fee: fee,
    first_year_fee: firstYearFee,
    welcome_bonus: raw.welcome_bonus || '',
    welcome_bonus_value: bonusValue,
    welcome_bonus_conditions: raw.welcome_bonus_conditions || '',
    earn_rates: earnRates,
    earn_rates_summary: earnSummary,
    rewards_program: raw.rewards_program || '',
    foreign_transaction_fee: raw.foreign_transaction_fee === false ? false : raw.foreign_transaction_fee === true ? true : null,
    foreign_transaction_fee_pct: raw.foreign_transaction_fee_pct || null,
    key_perks: raw.key_perks || [],
    insurance: raw.insurance || {},
    country: 'CA',
    sources: raw.sources || [],
    last_updated: raw.last_updated || '',
    card_image_url: raw.card_image_url || null,
    notes_for_canadians: null,
    pros: raw.pros || [],
    cons: raw.cons || [],
    is_business: false,
    categories: [],
    benefits: { lounge_access: false, no_fx_fee: false, car_rental_insurance: false, travel_medical: false, trip_cancellation: false, flight_delay: false, mobile_insurance: false, purchase_protection: false, extended_warranty: false, free_checked_bags: false },
    first_year_value: 0,
    first_year_value_formula: null,
    cpp_cad: null,
    welcome_bonus_points: null,
    apply_url: (raw as any).apply_url || null,
    benefits_incomplete: false,
  };

  card.is_business = textContains(card.name + ' ' + card.card_type, 'business');
  const storedBenefits = raw.benefits as Record<string, boolean> | undefined;
  card.benefits = (storedBenefits && typeof storedBenefits === 'object')
    ? { ...card.benefits, ...storedBenefits }
    : extractBenefits(card);
  // Also check key_perks for no_fx_fee
  if (card.key_perks.some(p => textContains(p, 'no foreign transaction'))) {
    card.benefits.no_fx_fee = true;
  }
  if (card.foreign_transaction_fee === false) {
    card.benefits.no_fx_fee = true;
  }
  // Flag premium cards with no detected benefits as incomplete
  const allBenefitsFalse = Object.values(card.benefits).every(v => !v);
  if (allBenefitsFalse && fee >= 150) {
    card.benefits_incomplete = true;
  }
  const effectiveFee = firstYearFee !== null ? firstYearFee : fee;
  card.first_year_value = bonusValue - effectiveFee;

  // Build formula string (baseline cpp)
  const pts = raw.welcome_bonus_points;
  const cpp = baselineCpp;
  card.cpp_cad = baselineCpp || null;
  card.welcome_bonus_points = pts || null;
  if (card.first_year_value > 0 && pts && cpp) {
    const feePart = effectiveFee > 0 ? ` − $${effectiveFee} fee` : '';
    card.first_year_value_formula = `${pts.toLocaleString()} pts × ${cpp}¢ CAD${feePart}`;
  } else if (card.first_year_value > 0 && bonusValue > 0) {
    const feePart = effectiveFee > 0 ? ` − $${effectiveFee} fee` : '';
    card.first_year_value_formula = `$${bonusValue} CAD bonus${feePart}`;
  } else {
    card.first_year_value_formula = null;
  }

  card.categories = deriveCategories(card);
  return card;
}

// ── Normalize US cards ─────────────────────────────────

interface RawUS {
  slug: string;
  name: string;
  issuer: string;
  network: string;
  card_type: string;
  annual_fee: number;
  signup_bonus: number | null;
  signup_bonus_formatted: string | null;
  signup_bonus_value_usd: number | null;
  signup_bonus_currency: string | null;
  welcome_bonus_conditions: string | null;
  earn_rates_summary: string | null;
  key_perks: string[] | null;
  foreign_transaction_fee: boolean;
  country: string;
  source: string;
  last_verified: string;
  notes_for_canadians: string | null;
  [key: string]: unknown;
}

// US rewards valuations — baseline cents-per-point (USD), by program keyword.
// Source: Frequent Miler / The Points Guy baseline valuations (cross-checked), 2026-06.
// US values stay in USD (native) and are labelled USD in the UI — we don't convert.
const US_PROGRAM_CPP: [string, number][] = [
  ['ihg', 0.5], ['hilton', 0.5], ['bonvoy', 0.8], ['marriott', 0.8], ['hyatt', 1.7],
  ['delta', 1.2], ['skymiles', 1.2], ['united', 1.3], ['southwest', 1.4], ['avios', 1.3],
  ['membership rewards', 1.5], ['ultimate rewards', 1.5], ['thankyou', 1.3], ['capital one', 1.3],
  ['american express', 1.5], ['amex', 1.5],
  ['cash', 100], ['miles', 1.3], ['points', 1.3],
];
function usCpp(text: string): number {
  const t = text.toLowerCase();
  for (const [k, v] of US_PROGRAM_CPP) if (t.includes(k)) return v;
  return 1.3;
}

// Pull the welcome-bonus points/miles out of the marketing text. The numeric signup_bonus
// fields are unreliable (often null, or the *spend* threshold), so the headline figure in
// signup_bonus_formatted is the source of truth. Take the largest number tied to a
// points/miles keyword; never grab a "$…" spend amount.
function extractUsBonusPoints(text: string): number | null {
  if (!text) return null;
  let best = 0;
  let m: RegExpExecArray | null;
  const re = /([\d][\d,]{2,})\s*(?:bonus\s+)?(?:membership\s+rewards|ultimate\s+rewards|thankyou|skymiles|avios|aeroplan|miles|points|pts)\b/gi;
  while ((m = re.exec(text))) { const n = parseInt(m[1].replace(/,/g, ''), 10); if (n > best && n <= 2_000_000) best = n; }
  const re2 = /(?:as high as|up to|earn(?:\s+up\s+to)?)\s+([\d][\d,]{3,})\b/gi;
  while ((m = re2.exec(text))) {
    const idx = m.index + m[0].indexOf(m[1]);
    if (text[idx - 1] === '$') continue;
    const n = parseInt(m[1].replace(/,/g, ''), 10);
    if (n > best && n <= 2_000_000) best = n;
  }
  return best > 0 ? best : null;
}
function extractUsBonusDollars(text: string): number {
  const m = text.match(/\$\s?([\d][\d,]{1,})/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function normalizeUS(raw: RawUS): Card {
  // Value the signup bonus with a program-specific baseline cpp, then convert USD→CAD.
  const cppUsd = usCpp(`${raw.name} ${raw.issuer || ''} ${raw.signup_bonus_currency || ''}`);
  const sfRaw = raw.signup_bonus_formatted || '';
  const curRaw = (raw.signup_bonus_currency || '').toLowerCase();
  const isCash = curRaw.includes('cash') || curRaw.includes('dollar') || curRaw.includes('statement')
    || (!/(point|mile|reward|avios|skymiles)/i.test(`${curRaw} ${sfRaw}`) && /\$\s?\d/.test(sfRaw));
  let bonusPoints: number | null = null;
  let bonusValueUsd = 0;
  if (isCash) {
    bonusValueUsd = (raw.signup_bonus_value_usd && raw.signup_bonus_value_usd <= 5000 ? raw.signup_bonus_value_usd : 0) || extractUsBonusDollars(sfRaw);
  } else {
    bonusPoints = extractUsBonusPoints(sfRaw);
    if (!bonusPoints && raw.signup_bonus && raw.signup_bonus >= 5000) bonusPoints = raw.signup_bonus;
    if (bonusPoints) bonusValueUsd = bonusPoints * cppUsd / 100;
    else if (raw.signup_bonus_value_usd) bonusValueUsd = raw.signup_bonus_value_usd > 2000 ? raw.signup_bonus_value_usd * cppUsd / 100 : raw.signup_bonus_value_usd;
  }
  const bonusValue = Math.round(bonusValueUsd); // USD (native; labelled in UI)
  const fee = raw.annual_fee || 0;
  // Prefer the refreshed welcome_bonus text if present, else build from signup fields
  // (without duplicating the currency word, e.g. "100,000 bonus points points").
  const sf = raw.signup_bonus_formatted || '';
  const cur = raw.signup_bonus_currency || '';
  const fallback = sf
    ? (cur && !sf.toLowerCase().includes(cur.toLowerCase()) ? `${sf} ${cur}` : sf)
    : '';
  const bonusText = (typeof raw.welcome_bonus === 'string' && raw.welcome_bonus.trim())
    ? String(raw.welcome_bonus)
    : fallback;

  const card: Card = {
    slug: raw.slug,
    name: raw.name,
    issuer: raw.issuer,
    network: normalizeNetwork(raw.network, `${raw.name} ${raw.issuer || ''}`),
    card_type: raw.card_type,
    annual_fee: fee,
    first_year_fee: null,
    welcome_bonus: bonusText,
    welcome_bonus_value: bonusValue,
    welcome_bonus_conditions: raw.welcome_bonus_conditions || '',
    earn_rates: [],
    earn_rates_summary: raw.earn_rates_summary || '',
    rewards_program: raw.signup_bonus_currency || '',
    foreign_transaction_fee: raw.foreign_transaction_fee,
    foreign_transaction_fee_pct: null,
    key_perks: raw.key_perks || [],
    insurance: {},
    country: 'US',
    sources: [raw.source || 'manual_research'],
    last_updated: raw.last_verified || '',
    card_image_url: null,
    notes_for_canadians: raw.notes_for_canadians || null,
    pros: [],
    cons: [],
    is_business: false,
    categories: [],
    benefits: { lounge_access: false, no_fx_fee: false, car_rental_insurance: false, travel_medical: false, trip_cancellation: false, flight_delay: false, mobile_insurance: false, purchase_protection: false, extended_warranty: false, free_checked_bags: false },
    first_year_value: 0,
    first_year_value_formula: null,
    cpp_cad: null,
    welcome_bonus_points: null,
    apply_url: (raw as any).apply_url || null,
    benefits_incomplete: false,
  };

  card.is_business = textContains(card.name + ' ' + card.card_type, 'business');
  const storedBenefits = raw.benefits as Record<string, boolean> | undefined;
  card.benefits = (storedBenefits && typeof storedBenefits === 'object')
    ? { ...card.benefits, ...storedBenefits }
    : extractBenefits(card);
  if (raw.foreign_transaction_fee === false) {
    card.benefits.no_fx_fee = true;
  }
  const allBenefitsFalseUS = Object.values(card.benefits).every(v => !v);
  if (allBenefitsFalseUS && fee >= 150) {
    card.benefits_incomplete = true;
  }
  card.first_year_value = Math.round(bonusValue - fee); // USD (native)
  card.first_year_value_formula = null;
  card.cpp_cad = isCash ? 1.0 : cppUsd;
  card.welcome_bonus_points = bonusPoints;

  card.categories = deriveCategories(card);
  return card;
}

// ── Export all cards ───────────────────────────────────

export const allCards: Card[] = (() => {
  const raw: Card[] = [
    ...(canadianCardsRaw as unknown as RawCA[]).map(normalizeCA),
    ...(usCardsRaw as unknown as RawUS[]).map(normalizeUS),
  ];
  // Deduplicate by slug — keep first occurrence
  const seen = new Set<string>();
  return raw.filter(c => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });
})();

export const canadianCards = allCards.filter(c => c.country === 'CA');
export const usCards = allCards.filter(c => c.country === 'US');

// ── Helper functions ──────────────────────────────────

export function getCardBySlug(slug: string): Card | undefined {
  return allCards.find(c => c.slug === slug);
}

export function getUniqueIssuers(): string[] {
  return [...new Set(allCards.map(c => c.issuer))].filter(i => i !== 'Unknown').sort();
}

export function getUniqueNetworks(): string[] {
  return [...new Set(allCards.map(c => c.network))].filter(n => n !== 'Unknown').sort();
}

export function getCardTypes(): string[] {
  return [...new Set(allCards.map(c => c.card_type))].sort();
}

export function getTopCardsByValue(count: number, country?: 'CA' | 'US'): Card[] {
  let cards = allCards;
  if (country) cards = cards.filter(c => c.country === country);
  return [...cards].sort((a, b) => b.first_year_value - a.first_year_value).slice(0, count);
}

export function formatCurrency(value: number, country: 'CA' | 'US' = 'CA'): string {
  const prefix = country === 'US' ? 'US$' : 'CA$';
  return `${prefix}${value.toLocaleString()}`;
}

export function getMaxFirstYearValue(): number {
  return Math.max(...allCards.map(c => c.first_year_value), 1);
}

export const BENEFIT_LABELS: Record<keyof Benefits, string> = {
  lounge_access: 'Airport Lounge',
  no_fx_fee: 'No FX Fee',
  car_rental_insurance: 'Car Rental Insurance',
  travel_medical: 'Travel Medical',
  trip_cancellation: 'Trip Cancellation',
  flight_delay: 'Flight Delay',
  mobile_insurance: 'Mobile Insurance',
  purchase_protection: 'Purchase Protection',
  extended_warranty: 'Extended Warranty',
  free_checked_bags: 'Free Checked Bags',
};
