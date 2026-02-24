#!/usr/bin/env python3
"""
Scrape card detail pages using agent-browser to extract:
- Earn rates (category → multiplier)
- Insurance/coverage details
- Foreign transaction fee
- Interest rates
- Key perks/benefits
- Income requirements
- Min spend for welcome bonus

Usage:
  python3 detail_scraper.py --issuer "American Express" --country CA
  python3 detail_scraper.py --issuer "Chase" --country US
  python3 detail_scraper.py --all
  python3 detail_scraper.py --card "amex-cobalt-card"
"""

import json, os, re, subprocess, sys, time, argparse
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
SCRAPE_DIR = Path(__file__).parent / "detail_cache"
SCRAPE_DIR.mkdir(exist_ok=True)


def run_ab(cmd, timeout=30):
    """Run an agent-browser command and return stdout."""
    try:
        result = subprocess.run(
            f"agent-browser {cmd}",
            shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return None
    except Exception as e:
        return f"ERROR: {e}"


def open_page(url):
    """Open a page and wait for content."""
    run_ab("close 2>/dev/null", timeout=5)
    time.sleep(1)
    result = run_ab(f'open "{url}"', timeout=30)
    if not result or "✗" in (result or ""):
        return False
    # Wait for network idle
    run_ab("wait --load networkidle", timeout=20)
    time.sleep(2)
    return True


def expand_accordions():
    """Click all accordion/expandable buttons to reveal hidden content."""
    snapshot = run_ab("snapshot -i -c", timeout=10) or ""
    # Find all button refs — click ones that look like accordion expanders
    keywords = ['coverage', 'insurance', 'travel', 'mobile', 'shopping', 'protection',
                'benefits', 'perks', 'pluscircle', 'redefine', 'elevate', 'everyday',
                'flexibility', 'financial', 'service', 'exclusive', 'borrowing',
                'hotel', 'lounge', 'point', 'reward', 'foreign', 'welcome']
    clicked = 0
    for line in snapshot.split('\n'):
        m = re.search(r'button.*?\[ref=(e\d+)\]', line)
        if m and any(kw.lower() in line.lower() for kw in keywords):
            ref = m.group(1)
            run_ab(f"click @{ref}", timeout=5)
            clicked += 1
            time.sleep(0.2)
    if clicked:
        time.sleep(1)
    return clicked


def get_page_text():
    """Get full text content from main or body, expanding accordions first."""
    # First expand accordion sections to reveal insurance/benefit details
    expand_accordions()
    time.sleep(1)
    text = run_ab('get text "main"', timeout=15)
    if not text or len(text) < 100 or "✗" in text:
        text = run_ab('get text "body"', timeout=15)
    return text or ""


def get_snapshot():
    """Get compact snapshot of interactive elements."""
    return run_ab("snapshot -c -d 5", timeout=15) or ""


def parse_earn_rates(text):
    """Extract earn rate categories from page text."""
    rates = {}

    # Amex duplicates earn rates in text: "2X POINTS On dining...2XPOINTSOn dining..."
    # Also footnote digits like "42X" where 4 is a superscript footnote before "2X"
    # Strategy: find all "NX POINTS On category" patterns, filter to reasonable multipliers (1-15)

    def clean_category(raw):
        """Clean category text — remove trailing descriptions after the core category."""
        cat = raw.strip().rstrip('0123456789').strip()
        # Truncate at common description starters
        for sep in ['Such as', 'From ', 'For eligible', 'For ', 'With ', 'Including', 'On eligible']:
            idx = cat.find(sep)
            if idx > 2:
                cat = cat[:idx].strip()
        # Remove trailing punctuation
        cat = cat.rstrip('.,;:*†').strip()
        return cat if len(cat) >= 2 else None

    # Pattern: "5X POINTS On eats & drinks" or "5XPOINTSOn eats" (Amex no-space duplicate)
    matches = re.findall(r'(\d+)\s*[Xx]\s*POINTS?\s*(?:On|on|for|For)\s+([A-Za-z][^\d\n]{3,50})', text)
    for mult, category in matches:
        m = int(mult)
        if m > 15:
            continue
        cat = clean_category(category)
        if cat and len(cat) < 60:
            rates[cat] = f"{m}x"

    # Pattern: "Earn Nx on category" or "N points per $1 on category"
    matches2 = re.findall(r'(?:Earn\s+)?(\d+(?:\.\d+)?)\s*(?:points?\s+per\s+\$1|x|X)\s+(?:on|for)\s+([A-Za-z][^\d\n]{3,50})', text)
    for mult, category in matches2:
        m = float(mult)
        if m > 15:
            continue
        cat = clean_category(category)
        if cat and len(cat) < 60 and cat not in rates:
            rates[cat] = f"{mult}x"

    # Pattern: "X% cash back on Y" or "X% On Y" (e.g., SimplyCash "4% On gas")
    matches3 = re.findall(r'(\d+(?:\.\d+)?)\s*%\s*(?:cash\s*back|CB)?\s*(?:On|on|for)\s+([A-Za-z][^\d\n]{3,50})', text, re.IGNORECASE)
    for pct, category in matches3:
        p = float(pct)
        if p > 30:
            continue
        cat = clean_category(category)
        skip_words = ['interest', 'apr', 'purchase', 'advance', 'fee', 'balance', 'transfer', 'payment', 'funds']
        if cat and len(cat) < 60 and not any(w in cat.lower() for w in skip_words):
            rates[cat] = f"{pct}%"

    # Pattern: "N ADDITIONAL POINT On category"
    matches4 = re.findall(r'(\d+)\s*ADDITIONAL\s+POINTS?\s+(?:On|on)\s+([A-Za-z][^\d\n]{3,50})', text)
    for mult, category in matches4:
        m = int(mult)
        if m > 10:
            continue
        cat = clean_category(category)
        if cat and len(cat) < 60:
            rates[cat] = f"+{m}x bonus"

    return rates


def parse_insurance(text):
    """Extract insurance/coverage details."""
    insurance = {}

    patterns = {
        'travel_medical': r'(?:Out of Province|Emergency Medical|Travel Medical)\s*(?:Insurance)?[^.]*?Coverage\s+up\s+to\s+(?:a\s+maximum\s+of\s+)?\$?([\d,]+(?:\.\d+)?)',
        'flight_delay': r'Flight Delay\s*(?:Insurance)?[^.]*?up\s+to\s+\$?([\d,]+)',
        'baggage_delay': r'Baggage Delay\s*(?:Insurance)?[^.]*?up\s+to\s+\$?([\d,]+)',
        'lost_baggage': r'Lost\s+(?:or\s+Stolen\s+)?Baggage\s*(?:Insurance)?[^.]*?up\s+to\s+\$?([\d,]+)',
        'travel_accident': r'Travel Accident\s*(?:Insurance)?[^.]*?up\s+to\s+\$?([\d,]+)',
        'car_rental': r'(?:Car|Auto)\s*Rental\s*(?:Theft\s*(?:and|&)\s*Damage|Collision|CDW)\s*(?:Insurance)?[^.]*?(?:up\s+to\s+)?\$?([\d,]+)',
        'purchase_protection': r'Purchase\s*(?:Protection|Security|Coverage)[^.]*?(?:up\s+to\s+)?\$?([\d,]+)',
        'extended_warranty': r'Extended\s*(?:Warranty|Protection)[^.]*?(?:up\s+to\s+)?(\d+)\s*(?:year|month)',
        'mobile_insurance': r'(?:Mobile|Cell\s*Phone)\s*(?:Device\s*)?(?:Insurance|Protection|Coverage)',
        'trip_cancellation': r'Trip\s*(?:Cancellation|Interruption)\s*(?:Insurance)?[^.]*?(?:up\s+to\s+)?\$?([\d,]+)',
    }

    for key, pattern in patterns.items():
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            if m.groups():
                insurance[key] = m.group(1).replace(",", "")
            else:
                insurance[key] = "Yes"

    return insurance


def parse_fx_fee(text):
    """Extract foreign transaction fee."""
    # Look for explicit no FX fee
    if re.search(r'no\s+foreign\s+(?:transaction|exchange|currency)\s+fee', text, re.IGNORECASE):
        return False, 0
    if re.search(r'0%\s+foreign\s+(?:transaction|exchange)', text, re.IGNORECASE):
        return False, 0

    # Look for FX fee percentage
    m = re.search(r'(\d+(?:\.\d+)?)\s*%\s*(?:foreign\s+(?:transaction|exchange|currency)|FX)\s*fee', text, re.IGNORECASE)
    if m:
        return True, float(m.group(1))

    # Amex standard 2.5%
    m2 = re.search(r'foreign\s+(?:transaction|exchange|currency)\s+fee\s*(?:of\s+)?(\d+(?:\.\d+)?)\s*%', text, re.IGNORECASE)
    if m2:
        return True, float(m2.group(1))

    return None, None


def parse_interest_rates(text):
    """Extract interest rates."""
    rates = {}
    m = re.search(r'(?:Purchase|Purchases)\s*(?:Interest\s*Rate|APR)?\s*:?\s*(\d+\.\d+)\s*%', text, re.IGNORECASE)
    if m:
        rates['purchases'] = float(m.group(1))

    m2 = re.search(r'(?:Cash\s*Advance|Funds?\s*Advance)\s*(?:Interest\s*Rate|APR)?\s*:?\s*(\d+\.\d+)\s*%', text, re.IGNORECASE)
    if m2:
        rates['cash_advance'] = float(m2.group(1))

    m3 = re.search(r'(?:Balance\s*Transfer)\s*(?:Interest\s*Rate|APR)?\s*:?\s*(\d+\.\d+)\s*%', text, re.IGNORECASE)
    if m3:
        rates['balance_transfer'] = float(m3.group(1))

    return rates


def parse_perks(text):
    """Extract key perks/benefits."""
    perks = []

    perk_keywords = [
        (r'(?:free\s+)?(?:first\s+)?checked\s+bag', 'Free first checked bag'),
        (r'(?:airport\s+)?lounge\s+(?:access|pass)', 'Airport lounge access'),
        (r'Priority\s+Pass', 'Priority Pass lounge access'),
        (r'Global\s+Entry|NEXUS|TSA\s+PreCheck', 'Travel program credit (NEXUS/Global Entry)'),
        (r'concierge\s+service', 'Concierge service'),
        (r'no\s+foreign\s+(?:transaction|exchange|currency)\s+fee', 'No foreign transaction fee'),
        (r'hotel\s+(?:collection|elite|status)', 'Hotel elite status/collection'),
        (r'(?:Centurion|Maple Leaf|Plaza Premium)\s+Lounge', 'Premium lounge access'),
        (r'Front\s+Of\s+The\s+Line', 'Front of the Line presale tickets'),
        (r'Instacart|DoorDash|Uber\s+Eats', 'Food delivery credits'),
        (r'statement\s+credit', 'Statement credits'),
        (r'DashPass|Uber\s+One', 'Subscription perks'),
    ]

    for pattern, label in perk_keywords:
        if re.search(pattern, text, re.IGNORECASE):
            perks.append(label)

    return perks


def parse_income_req(text):
    """Extract minimum income requirement."""
    m = re.search(r'\$\s*([\d,]+)\s*(?:annual\s+)?(?:personal\s+)?income', text, re.IGNORECASE)
    if m:
        return int(m.group(1).replace(",", ""))
    return None


def scrape_card(card):
    """Scrape a single card's detail page."""
    url = card.get("apply_url")
    name = card.get("name", "Unknown")
    slug = card.get("slug", "unknown")

    if not url:
        print(f"  ⚠ No URL for {name}")
        return None

    cache_file = SCRAPE_DIR / f"{slug}.txt"

    # Use cached text if fresh (< 24 hours)
    if cache_file.exists():
        age_hours = (time.time() - cache_file.stat().st_mtime) / 3600
        if age_hours < 24:
            print(f"  📋 Using cached text for {name}")
            text = cache_file.read_text()
            return parse_card_text(text, card)

    print(f"  🌐 Fetching {name}...")
    print(f"     {url}")

    if not open_page(url):
        print(f"  ❌ Failed to open page for {name}")
        return None

    text = get_page_text()

    if len(text) < 200:
        print(f"  ⚠ Page too short ({len(text)} chars) for {name}, retrying...")
        time.sleep(3)
        text = get_page_text()

    if len(text) < 200:
        print(f"  ❌ Still too short for {name}")
        return None

    # Cache the text
    cache_file.write_text(text)
    print(f"  ✅ Got {len(text)} chars")

    return parse_card_text(text, card)


def parse_card_text(text, card):
    """Parse all details from card page text."""
    details = {}

    earn_rates = parse_earn_rates(text)
    if earn_rates:
        details["earn_rates"] = earn_rates

    insurance = parse_insurance(text)
    if insurance:
        details["insurance"] = insurance

    has_fx, fx_pct = parse_fx_fee(text)
    if has_fx is not None:
        details["foreign_transaction_fee"] = has_fx
        if fx_pct:
            details["foreign_transaction_fee_pct"] = fx_pct

    interest = parse_interest_rates(text)
    if interest:
        details["interest_rates"] = interest

    perks = parse_perks(text)
    if perks:
        details["key_perks"] = perks

    income = parse_income_req(text)
    if income:
        details["min_income"] = income

    return details


def enrich_cards(cards, all_cards_ref, issuer_filter=None, country_filter=None, slug_filter=None, limit=None):
    """Scrape and enrich a list of cards. Saves JSON after every 5 cards."""
    enriched = 0
    errors = 0

    filtered = cards
    if issuer_filter:
        filtered = [c for c in filtered if (c.get("issuer") or "").lower() == issuer_filter.lower()]
    if country_filter:
        filtered = [c for c in filtered if (c.get("country") or "").upper() == country_filter.upper()]
    if slug_filter:
        filtered = [c for c in filtered if c.get("slug") == slug_filter]
    if limit:
        filtered = filtered[:limit]

    print(f"\nScraping {len(filtered)} cards...")

    for i, card in enumerate(filtered):
        print(f"\n[{i+1}/{len(filtered)}] {card['name']}")

        details = scrape_card(card)

        if details:
            # Merge into card
            for key, val in details.items():
                if key == "earn_rates" and val:
                    card["earn_rates"] = val
                elif key == "insurance" and val:
                    card["insurance"] = val
                elif key == "key_perks" and val:
                    existing = card.get("key_perks") or []
                    merged = list(set(existing + val))
                    card["key_perks"] = merged
                else:
                    card[key] = val
            enriched += 1
        else:
            errors += 1

        # Save incrementally every 5 cards (skip in dry-run)
        if all_cards_ref and ((i + 1) % 5 == 0 or (i + 1) == len(filtered)):
            _save_cards(all_cards_ref)
            print(f"  💾 Saved progress ({enriched} enriched, {errors} errors so far)")

    # Close browser at end
    run_ab("close", timeout=5)

    return enriched, errors


def _save_cards(all_cards):
    """Write current card state to JSON files."""
    ca_path = DATA_DIR / "canadian_cards_comprehensive.json"
    us_path = DATA_DIR / "us_cards_comprehensive.json"
    ca_out = [c for c in all_cards if c.get("country", "").upper() == "CA"]
    us_out = [c for c in all_cards if c.get("country", "").upper() == "US"]
    with open(ca_path, "w") as f:
        json.dump(ca_out, f, indent=2)
    with open(us_path, "w") as f:
        json.dump(us_out, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Scrape card detail pages")
    parser.add_argument("--issuer", help="Filter by issuer name")
    parser.add_argument("--country", help="Filter by country (CA/US)")
    parser.add_argument("--card", help="Scrape single card by slug")
    parser.add_argument("--limit", type=int, help="Max cards to scrape")
    parser.add_argument("--all", action="store_true", help="Scrape all cards")
    parser.add_argument("--dry-run", action="store_true", help="Don't write results")
    args = parser.parse_args()

    # Load cards
    ca_path = DATA_DIR / "canadian_cards_comprehensive.json"
    us_path = DATA_DIR / "us_cards_comprehensive.json"

    with open(ca_path) as f:
        ca_cards = json.load(f)
    with open(us_path) as f:
        us_cards = json.load(f)

    all_cards = ca_cards + us_cards
    print(f"Loaded {len(ca_cards)} CA + {len(us_cards)} US = {len(all_cards)} total cards")

    if not (args.all or args.issuer or args.card or args.country):
        parser.print_help()
        return

    enriched, errors = enrich_cards(
        all_cards,
        all_cards_ref=all_cards if not args.dry_run else None,
        issuer_filter=args.issuer,
        country_filter=args.country,
        slug_filter=args.card,
        limit=args.limit
    )

    print(f"\n{'='*60}")
    print(f"Results: {enriched} enriched, {errors} errors")

    if not args.dry_run and enriched > 0:
        _save_cards(all_cards)
        ca_count = sum(1 for c in all_cards if c.get("country", "").upper() == "CA")
        us_count = sum(1 for c in all_cards if c.get("country", "").upper() == "US")
        print(f"✅ Final save: {ca_count} CA cards and {us_count} US cards")


if __name__ == "__main__":
    main()
