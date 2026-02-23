import canadianCardsRaw from './canadian_cards_comprehensive.json';
import usCardsRaw from './us_cards_comprehensive.json';

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
  benefits: Benefits;
  first_year_value: number;
  apply_url: string | null;
  benefits_incomplete: boolean;
}

// ── Helpers ────────────────────────────────────────────

function normalizeNetwork(n: string | null): string {
  if (!n) return 'Unknown';
  const lower = n.toLowerCase();
  if (lower === 'mc') return 'Mastercard';
  if (lower === 'american express' || lower === 'amex') return 'Amex';
  return n;
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
  const bonusValue = raw.welcome_bonus_value_cad || raw.pot_first_year_value || 0;
  const firstYearFee = typeof raw.first_year_fee === 'number' ? raw.first_year_fee : null;
  const fee = raw.annual_fee || 0;

  const card: Card = {
    slug: raw.slug,
    name: raw.name,
    issuer: raw.issuer || 'Unknown',
    network: normalizeNetwork(raw.network),
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
    benefits: { lounge_access: false, no_fx_fee: false, car_rental_insurance: false, travel_medical: false, trip_cancellation: false, flight_delay: false, mobile_insurance: false, purchase_protection: false, extended_warranty: false, free_checked_bags: false },
    first_year_value: 0,
    apply_url: null,
    benefits_incomplete: false,
  };

  card.is_business = textContains(card.name + ' ' + card.card_type, 'business');
  card.benefits = extractBenefits(card);
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

function normalizeUS(raw: RawUS): Card {
  const bonusValue = raw.signup_bonus_value_usd || 0;
  const fee = raw.annual_fee || 0;
  const bonusText = raw.signup_bonus_formatted
    ? `${raw.signup_bonus_formatted} ${raw.signup_bonus_currency || 'points'}`
    : '';

  const card: Card = {
    slug: raw.slug,
    name: raw.name,
    issuer: raw.issuer,
    network: normalizeNetwork(raw.network),
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
    benefits: { lounge_access: false, no_fx_fee: false, car_rental_insurance: false, travel_medical: false, trip_cancellation: false, flight_delay: false, mobile_insurance: false, purchase_protection: false, extended_warranty: false, free_checked_bags: false },
    first_year_value: 0,
    apply_url: null,
    benefits_incomplete: false,
  };

  card.is_business = textContains(card.name + ' ' + card.card_type, 'business');
  card.benefits = extractBenefits(card);
  if (raw.foreign_transaction_fee === false) {
    card.benefits.no_fx_fee = true;
  }
  const allBenefitsFalseUS = Object.values(card.benefits).every(v => !v);
  if (allBenefitsFalseUS && fee >= 150) {
    card.benefits_incomplete = true;
  }
  card.first_year_value = bonusValue - fee;

  return card;
}

// ── Export all cards ───────────────────────────────────

export const allCards: Card[] = (() => {
  const raw: Card[] = [
    ...(canadianCardsRaw as RawCA[]).map(normalizeCA),
    ...(usCardsRaw as RawUS[]).map(normalizeUS),
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
