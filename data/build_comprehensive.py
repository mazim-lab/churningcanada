#!/usr/bin/env python3
"""Build comprehensive Canadian credit card database from multiple sources."""

import json, re, html
from pathlib import Path

DATA_DIR = Path(__file__).parent
TODAY = "2026-02-22"

def clean_html(s):
    if not s: return None
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def slug_from_name(name):
    s = name.lower().strip()
    s = re.sub(r'[®™*†ǂ©]', '', s)
    s = re.sub(r'\(quebec version\)|\(qc\)', '', s).strip()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def normalize_name(name):
    n = name.lower()
    n = re.sub(r'[®™*†ǂ©]', '', n)
    n = re.sub(r'\(quebec version\)|\(qc\)', '', n)
    n = re.sub(r'\s+card$', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

# ============ PARSE CREDITCARDGENIUS ============
with open(DATA_DIR / 'ccgenius_api_raw.json') as f:
    ccg_raw = json.load(f)

BANK_MAP_POT = {
    "1": "American Express", "2": "BMO", "3": "CIBC", "4": "RBC", 
    "5": "Scotiabank", "6": "TD", "7": "MBNA", "8": "Tangerine",
    "9": "Capital One", "10": "Neo Financial", "11": "PC Financial",
    "12": "National Bank", "13": "Rogers", "14": "Simplii Financial",
    "15": "Brim Financial", "16": "Home Trust", "17": "Canadian Tire",
    "18": "Desjardins", "19": "Laurentian Bank", "20": "Meridian",
}
NETWORK_MAP = {"1": "Visa", "2": "Mastercard", "3": "Amex"}
REWARDS_MAP = {
    "1": "Aeroplan", "2": "Scene+", "3": "Membership Rewards", 
    "4": "Marriott Bonvoy", "5": "WestJet Dollars", "6": "Avios",
    "7": "TD Rewards", "8": "BMO Rewards", "9": "MBNA Rewards",
    "10": "Aeroplan", "11": "CIBC Aventura", "12": "RBC Avion",
    "13": "PC Optimum", "14": "Cash Back", "15": "Neo Rewards",
    "16": "Porter Points"
}

def get_nested(d, key):
    v = d.get(key)
    if isinstance(v, dict): return v.get('name')
    return v

def parse_ccg(c):
    name = c.get('displayNameClean') or c['name']
    # Parse multipliers
    earn_rates = {}
    m = c.get('multipliers', {})
    mapping = {'grocery': 'groceries', 'gas': 'gas', 'restaurant': 'dining', 
               'drug': 'drugstore', 'bills': 'recurring_bills', 'travel': 'travel',
               'regular': 'everything_else'}
    for k, v in m.items():
        if k in mapping:
            if isinstance(v, list):
                earn_rates[mapping[k]] = f"{v[0]['multi']}x"
            else:
                earn_rates[mapping[k]] = f"{v}x"
    
    wb = clean_html(c.get('welcomeBonusShort') or c.get('welcomeBonus') or '')
    bonus_adv = c.get('signUpBonusAdvanced', [])
    min_spend = None
    for b in (bonus_adv or []):
        if b.get('spendingRequirement', 0) > 0:
            min_spend = b['spendingRequirement']
            break
    
    card_type = 'rewards'
    if c.get('isCashBack'): card_type = 'cashback'

    return {
        'slug': slug_from_name(name),
        'name': re.sub(r'[®™*†ǂ]', '', name).strip(),
        'issuer': get_nested(c, 'issuer'),
        'network': get_nested(c, 'network'),
        'card_type': card_type,
        'annual_fee': c.get('annualFee'),
        'first_year_fee': 0 if c.get('firstYearFree') else c.get('annualFee'),
        'welcome_bonus': wb or None,
        'welcome_bonus_value_cad': round(c.get('signUpBonusValue', 0), 2) or None,
        'welcome_bonus_conditions': None,
        'min_spend': min_spend,
        'purchase_interest_rate': round(c.get('purchaseInterestRate', 0) * 100, 2) if c.get('purchaseInterestRate') else None,
        'cash_advance_rate': round(c.get('cashAdvanceInterestRate', 0) * 100, 2) if c.get('cashAdvanceInterestRate') else None,
        'balance_transfer_rate': round(c.get('balanceTransferInterestRate', 0) * 100, 2) if c.get('balanceTransferInterestRate') else None,
        'earn_rates': earn_rates or None,
        'rewards_program': c.get('rewardProgramSlug'),
        'foreign_transaction_fee': c.get('foreignExchangeFee', 0) > 0 if c.get('foreignExchangeFee') is not None else None,
        'foreign_transaction_fee_pct': round(c.get('foreignExchangeFee', 0) * 100, 2) if c.get('foreignExchangeFee') else None,
        'key_perks': [],
        'insurance': None,
        'minimum_income': c.get('minIncome'),
        'minimum_credit_score': None,
        'country': 'CA',
        'sources': ['creditcardgenius'],
        'last_updated': TODAY,
        'card_image_url': f"https://cdn.creditcardgenius.ca/img/cards/{c['slug']}.png" if c.get('useCardImage') else None,
        'ccgenius_rating': c.get('geniusRating'),
        'pros': c.get('pros'),
        'cons': c.get('cons'),
    }

ccg_cards = {}
for c in ccg_raw:
    parsed = parse_ccg(c)
    key = normalize_name(parsed['name'])
    if key not in ccg_cards:
        ccg_cards[key] = parsed

print(f"CreditCardGenius: {len(ccg_cards)} cards")

# ============ PARSE PRINCE OF TRAVEL ============
with open(DATA_DIR / 'pot_api_raw.json') as f:
    pot_raw = json.load(f)

def parse_pot(c):
    acf = c.get('acf', {})
    name = html.unescape(c['title']['rendered'])
    name_clean = re.sub(r'[®™*†ǂ©]', '', name).strip()
    
    bank_id = str(acf.get('bank', ''))
    network_id = str(acf.get('payment_network', ''))
    rewards_id = str(acf.get('rewards_program', ''))
    
    # Parse benefits
    benefits = acf.get('card_benefits', [])
    purchase_rate = cash_advance_rate = None
    earn_rates = {}
    perks = []
    insurance_info = {}
    
    for b in (benefits or []):
        title = (b.get('b_title') or '').lower()
        content = b.get('b_content') or ''
        
        if 'interest' in title:
            rates = re.findall(r'(\d+\.?\d*)%\s*(purchases|cash)', content.lower())
            for rate, typ in rates:
                if 'purchase' in typ: purchase_rate = float(rate)
                elif 'cash' in typ: cash_advance_rate = float(rate)
        
        if 'earning rate' in title:
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            for line in lines:
                # Try to extract category and rate
                m = re.search(r'(\d+\.?\d*)\s*(?:Aeroplan|BMO|Scene\+|Membership Rewards|Aventura|TD Rewards|VIPorter|MBNA|RBC|Avion)?\s*points?\s*per\s*dollar\s*(?:spent\s*)?(?:on\s*)?(.+)', line, re.I)
                if m:
                    rate_val = m.group(1)
                    category = m.group(2).strip().lower()
                    category = re.sub(r'\s+', '_', category)[:30]
                    earn_rates[category] = f"{rate_val}x"
        
        if 'perk' in title or 'benefit' in title:
            perks = [l.strip() for l in content.split('\n') if l.strip()]
        
        if 'insurance' in title:
            insurance_info['strength'] = content.strip()
    
    # Parse insurance from card_content
    for section in (acf.get('card_content') or []):
        title = (section.get('c_title') or '').lower()
        if 'insurance' in title:
            content = clean_html(section.get('c_content', ''))
            if content:
                # Extract specific coverage
                patterns = {
                    'travel_medical': r'emergency medical.*?(?:up to )?\$([0-9,]+(?:\s*million)?)',
                    'trip_cancellation': r'trip cancellation.*?(?:up to )?\$([0-9,]+)',
                    'flight_delay': r'flight delay.*?(?:up to )?\$([0-9,]+)',
                    'car_rental': r'car rental.*?(?:MSRP.*?)?\$([0-9,]+)',
                    'purchase_protection': r'purchase protection.*?(?:up to )?\$([0-9,]+)',
                    'extended_warranty': r'extended.*?warranty.*?(\d+.*?year)',
                }
                for key, pat in patterns.items():
                    m = re.search(pat, content, re.I)
                    if m:
                        insurance_info[key] = m.group(0)[:100]
    
    return {
        'slug': c['slug'],
        'name': name_clean,
        'issuer': BANK_MAP_POT.get(bank_id),
        'network': NETWORK_MAP.get(network_id),
        'card_type': 'rewards',  # PoT mostly covers rewards/travel
        'annual_fee': acf.get('annual_fee'),
        'first_year_fee': 0 if acf.get('first_year_free') else acf.get('first_year_annual_fee', acf.get('annual_fee')),
        'welcome_bonus': clean_html(acf.get('reward_points')),
        'welcome_bonus_value_cad': acf.get('welcome_bonus_value'),
        'welcome_bonus_conditions': None,
        'min_spend': acf.get('minimum_spend'),
        'purchase_interest_rate': purchase_rate,
        'cash_advance_rate': cash_advance_rate,
        'balance_transfer_rate': None,
        'earn_rates': earn_rates or None,
        'rewards_program': REWARDS_MAP.get(rewards_id),
        'foreign_transaction_fee': None,
        'foreign_transaction_fee_pct': None,
        'key_perks': perks[:10] if perks else [],
        'insurance': insurance_info if insurance_info else None,
        'minimum_income': acf.get('minimum_personal_income'),
        'minimum_credit_score': None,
        'country': 'CA',
        'sources': ['princeoftravel'],
        'last_updated': TODAY,
        'card_image_url': None,
        'pot_first_year_value': acf.get('welcome_bonus_value'),
        'pot_rewards_valuation_cpp': acf.get('rewards_valuation'),
        'pot_url': c.get('link'),
        'historical_offers': acf.get('historical_offers') if acf.get('show_historical_offers') else None,
    }

pot_cards = {}
for c in pot_raw:
    parsed = parse_pot(c)
    key = normalize_name(parsed['name'])
    pot_cards[key] = parsed

print(f"Prince of Travel: {len(pot_cards)} cards")

# ============ MERGE ============
def fuzzy_match(name1, name2):
    """Check if two card names likely refer to the same card."""
    if name1 == name2:
        return True
    # Remove common suffixes/differences
    def simplify(n):
        n = re.sub(r'\(quebec version\)|\(qc\)', '', n)
        n = re.sub(r'credit card', '', n)
        n = n.replace(' card', '').replace(' the ', ' ')
        n = re.sub(r'\s+', ' ', n).strip()
        return n
    
    s1, s2 = simplify(name1), simplify(name2)
    if s1 == s2: return True
    
    # Word overlap
    w1, w2 = set(s1.split()), set(s2.split())
    overlap = len(w1 & w2)
    total = max(len(w1), len(w2))
    return total > 0 and overlap / total >= 0.7

def merge_card(base, other, other_source):
    """Merge other card data into base, preferring base for existing values."""
    base['sources'] = list(set(base.get('sources', []) + [other_source]))
    
    # Fields to merge (take from other if base is missing)
    for field in ['min_spend', 'welcome_bonus', 'welcome_bonus_value_cad',
                  'purchase_interest_rate', 'cash_advance_rate', 'balance_transfer_rate',
                  'rewards_program', 'minimum_income', 'minimum_credit_score',
                  'card_image_url']:
        if not base.get(field) and other.get(field):
            base[field] = other[field]
    
    # Merge earn rates
    if other.get('earn_rates') and not base.get('earn_rates'):
        base['earn_rates'] = other['earn_rates']
    elif other.get('earn_rates') and base.get('earn_rates'):
        for k, v in other['earn_rates'].items():
            if k not in base['earn_rates']:
                base['earn_rates'][k] = v
    
    # Merge perks
    if other.get('key_perks') and not base.get('key_perks'):
        base['key_perks'] = other['key_perks']
    
    # Merge insurance
    if other.get('insurance') and not base.get('insurance'):
        base['insurance'] = other['insurance']
    
    # Add PoT-specific fields
    for field in ['pot_first_year_value', 'pot_rewards_valuation_cpp', 'pot_url', 'historical_offers']:
        if other.get(field):
            base[field] = other[field]
    
    # Add CCG-specific fields
    for field in ['ccgenius_rating', 'pros', 'cons']:
        if other.get(field):
            base[field] = other[field]

# Start with all CCG cards
merged = dict(ccg_cards)

# Merge PoT cards
matched = added = 0
for pot_key, pot_card in pot_cards.items():
    found = None
    for mkey in merged:
        if fuzzy_match(pot_key, mkey):
            found = mkey
            break
    
    if found:
        merge_card(merged[found], pot_card, 'princeoftravel')
        matched += 1
    else:
        pot_card_copy = dict(pot_card)
        merged[pot_key] = pot_card_copy
        added += 1

print(f"After PoT merge: {matched} matched, {added} new. Total: {len(merged)}")

# ============ ADD KNOWN MISSING CARDS (manually from FrugalFlyer/GCR) ============
additional_cards = [
    {
        'name': 'MBNA Amazon.ca Rewards Mastercard',
        'issuer': 'MBNA', 'network': 'Mastercard', 'card_type': 'rewards',
        'annual_fee': 0, 'welcome_bonus': '15,000 Amazon.ca Rewards points',
        'welcome_bonus_value_cad': 150, 'min_spend': None,
        'rewards_program': 'Amazon.ca Rewards', 'sources': ['frugalflyer'],
    },
    {
        'name': 'BMO VIPorter World Elite Mastercard',
        'issuer': 'BMO', 'network': 'Mastercard', 'card_type': 'travel',
        'annual_fee': 199, 'first_year_fee': 0,
        'welcome_bonus': '70,000 VIPorter points',
        'welcome_bonus_value_cad': 1175, 'min_spend': 18000,
        'rewards_program': 'VIPorter Points', 'sources': ['frugalflyer'],
    },
    {
        'name': 'Tims Financial World Mastercard',
        'issuer': 'Tims Financial', 'network': 'Mastercard', 'card_type': 'rewards',
        'annual_fee': 0, 'sources': ['greatcanadianrebates'],
    },
    {
        'name': 'KOHO Mastercard Prepaid',
        'issuer': 'KOHO', 'network': 'Mastercard', 'card_type': 'cashback',
        'annual_fee': 0, 'sources': ['greatcanadianrebates'],
    },
    {
        'name': 'Coast Capital Visa Platinum',
        'issuer': 'Coast Capital', 'network': 'Visa', 'card_type': 'rewards',
        'annual_fee': 0, 'sources': ['greatcanadianrebates'],
    },
    {
        'name': 'Innovation Federal Credit Union Visa',
        'issuer': 'Innovation FCU', 'network': 'Visa', 'card_type': 'rewards',
        'annual_fee': 0, 'sources': ['greatcanadianrebates'],
    },
    {
        'name': 'Zolve Visa Credit Card',
        'issuer': 'Zolve', 'network': 'Visa', 'card_type': 'rewards',
        'annual_fee': 0, 'sources': ['greatcanadianrebates'],
    },
    {
        'name': 'BMO eclipse rise Visa Card',
        'issuer': 'BMO', 'network': 'Visa', 'card_type': 'rewards',
        'annual_fee': 0, 'welcome_bonus': '20,000 BMO Rewards points',
        'welcome_bonus_value_cad': None, 'min_spend': 1500,
        'rewards_program': 'BMO Rewards', 'sources': ['princeoftravel'],
    },
    {
        'name': 'Brim World Elite Mastercard',
        'issuer': 'Brim Financial', 'network': 'Mastercard', 'card_type': 'travel',
        'annual_fee': 89, 'foreign_transaction_fee': False,
        'sources': ['princeoftravel'],
    },
    {
        'name': 'Desjardins Cash Back World Elite Mastercard',
        'issuer': 'Desjardins', 'network': 'Mastercard', 'card_type': 'cashback',
        'annual_fee': 100, 'sources': ['princeoftravel'],
    },
    {
        'name': 'Desjardins Cash Back Mastercard',
        'issuer': 'Desjardins', 'network': 'Mastercard', 'card_type': 'cashback',
        'annual_fee': 0, 'sources': ['princeoftravel'],
    },
    {
        'name': 'American Express Aeroplan Reserve Card',
        'issuer': 'American Express', 'network': 'Amex', 'card_type': 'travel',
        'annual_fee': 599, 'welcome_bonus': 'Up to 85,000 Aeroplan points',
        'welcome_bonus_value_cad': 858, 'min_spend': 7500,
        'rewards_program': 'Aeroplan', 'sources': ['princeoftravel'],
    },
    {
        'name': 'American Express Platinum Card',
        'issuer': 'American Express', 'network': 'Amex', 'card_type': 'travel',
        'annual_fee': 799, 'welcome_bonus': 'Up to 110,000 Membership Rewards points',
        'welcome_bonus_value_cad': 1581, 'min_spend': 10000,
        'rewards_program': 'Membership Rewards', 'sources': ['princeoftravel', 'frugalflyer'],
    },
    {
        'name': 'American Express Gold Rewards Card',
        'issuer': 'American Express', 'network': 'Amex', 'card_type': 'rewards',
        'annual_fee': 250, 'welcome_bonus': 'Up to 70,000 Membership Rewards points',
        'welcome_bonus_value_cad': 1676, 'min_spend': 13000,
        'rewards_program': 'Membership Rewards', 'sources': ['princeoftravel', 'frugalflyer', 'greatcanadianrebates'],
        'purchase_interest_rate': 21.99, 'cash_advance_rate': 21.99,
    },
]

for card in additional_cards:
    key = normalize_name(card['name'])
    if key not in merged:
        # Fill in template fields
        template = {
            'slug': slug_from_name(card['name']),
            'first_year_fee': card.get('first_year_fee', card.get('annual_fee')),
            'welcome_bonus_conditions': None,
            'purchase_interest_rate': None,
            'cash_advance_rate': None,
            'balance_transfer_rate': None,
            'earn_rates': None,
            'foreign_transaction_fee': None,
            'foreign_transaction_fee_pct': None,
            'key_perks': [],
            'insurance': None,
            'minimum_income': None,
            'minimum_credit_score': None,
            'country': 'CA',
            'last_updated': TODAY,
            'card_image_url': None,
        }
        template.update(card)
        merged[key] = template
        print(f"  Added: {card['name']}")
    else:
        # Merge source
        for src in card.get('sources', []):
            if src not in merged[key].get('sources', []):
                merged[key]['sources'].append(src)

# ============ FINAL CLEANUP ============
final_cards = []
for card in sorted(merged.values(), key=lambda x: x.get('name', '')):
    # Ensure all required fields exist
    card.setdefault('slug', slug_from_name(card.get('name', '')))
    card.setdefault('welcome_bonus', None)
    card.setdefault('welcome_bonus_value_cad', None)
    card.setdefault('welcome_bonus_conditions', None)
    card.setdefault('min_spend', None)
    card.setdefault('purchase_interest_rate', None)
    card.setdefault('cash_advance_rate', None)
    card.setdefault('balance_transfer_rate', None)
    card.setdefault('earn_rates', None)
    card.setdefault('foreign_transaction_fee', None)
    card.setdefault('foreign_transaction_fee_pct', None)
    card.setdefault('key_perks', [])
    card.setdefault('insurance', None)
    card.setdefault('minimum_income', None)
    card.setdefault('minimum_credit_score', None)
    card.setdefault('country', 'CA')
    card.setdefault('last_updated', TODAY)
    card.setdefault('card_image_url', None)
    final_cards.append(card)

# Save
output_path = DATA_DIR / 'canadian_cards_comprehensive.json'
with open(output_path, 'w') as f:
    json.dump(final_cards, f, indent=2, default=str)

print(f"\n{'='*60}")
print(f"TOTAL: {len(final_cards)} unique Canadian credit cards")
print(f"Saved to: {output_path}")
print(f"{'='*60}")

# Stats
sources_count = {}
for c in final_cards:
    for s in c.get('sources', []):
        sources_count[s] = sources_count.get(s, 0) + 1
print("\nSource coverage:")
for s, count in sorted(sources_count.items(), key=lambda x: -x[1]):
    print(f"  {s}: {count} cards")

issuers = {}
for c in final_cards:
    iss = c.get('issuer', 'Unknown')
    issuers[iss] = issuers.get(iss, 0) + 1
print("\nBy issuer:")
for iss, count in sorted(issuers.items(), key=lambda x: -x[1]):
    print(f"  {iss}: {count}")
