#!/usr/bin/env python3
"""
Scrape ALL Canadian credit cards from CreditCardGenius.ca
V3: Reset rating filter to 0, click Show All, parse listing page text.
"""

import json
import re
from playwright.sync_api import sync_playwright

BASE_URL = "https://creditcardgenius.ca"


def parse_card_blocks(text):
    """Parse card data from the listing page text."""
    cards = []
    lines = text.split('\n')
    
    # Find card block boundaries: "X.X Genius Rating" marks start of a card
    card_starts = []
    for i, line in enumerate(lines):
        if re.match(r'\s*\d\.\d\s+Genius Rating', line.strip()):
            card_starts.append(i)
    
    print(f"Found {len(card_starts)} card rating markers")
    
    for idx, start_line in enumerate(card_starts):
        # Card name is the line BEFORE the rating
        name_line = start_line - 1
        while name_line >= 0 and not lines[name_line].strip():
            name_line -= 1
        
        if name_line < 0:
            continue
        
        card_name = lines[name_line].strip()
        # Skip junk names
        if len(card_name) < 3 or card_name in ["Pros & Cons", "User Reviews"]:
            continue
        
        # Determine end of this card block
        end_line = card_starts[idx + 1] - 2 if idx + 1 < len(card_starts) else min(start_line + 50, len(lines))
        
        block_text = '\n'.join(lines[start_line:end_line])
        
        card = {
            "name": card_name,
            "source": "creditcardgenius",
            "genius_rating": "",
            "user_rating": "",
            "user_reviews_count": "",
            "annual_fee": "",
            "annual_fee_first_year": "",
            "welcome_bonus_value": "",
            "welcome_bonus_details": "",
            "annual_rewards_value": "",
            "instant_approval": "",
        }
        
        # Rating
        rating_match = re.search(r'(\d\.\d)\s+Genius Rating', block_text)
        if rating_match:
            card["genius_rating"] = rating_match.group(1)
        
        # User rating
        user_match = re.search(r'(\d\.\d)\s+\((\d+)\)\s+User review', block_text)
        if user_match:
            card["user_rating"] = user_match.group(1)
            card["user_reviews_count"] = user_match.group(2)
        
        # Annual fee - look for "$X.XX" pattern after "Annual fee"
        fee_section = re.search(r'Annual fee\s*\n\s*\n?\s*(\$[\d,.]+(?:\s+\$[\d,.]+)?)', block_text)
        if fee_section:
            fee_text = fee_section.group(1)
            fees = re.findall(r'\$([\d,.]+)', fee_text)
            if fees:
                card["annual_fee"] = "$" + fees[0]
                if len(fees) > 1:
                    card["annual_fee_first_year"] = "$" + fees[1]
        
        if "1st year waived" in block_text or "first year waived" in block_text.lower():
            card["annual_fee_first_year"] = "$0"
        
        # Welcome bonus value
        wb_section = re.search(r'Welcome bonus\s*\n\s*\n?\s*(\$[\d,.]+)', block_text)
        if wb_section:
            card["welcome_bonus_value"] = wb_section.group(1)
        
        # Welcome bonus details (line after the value)
        wb_details = re.search(r'Welcome bonus\s*\n\s*\n?\s*\$[\d,.]+[◊]?\s*\n\s*(.+)', block_text)
        if wb_details:
            details = wb_details.group(1).strip()
            if details and not details.startswith("Annual") and not details.startswith("GC"):
                card["welcome_bonus_details"] = details
        
        # Annual rewards
        ar_section = re.search(r'Annual rewards\s*\n\s*\n?\s*(\$[\d,.]+)', block_text)
        if ar_section:
            card["annual_rewards_value"] = ar_section.group(1)
        
        # Instant approval
        ia_match = re.search(r'Instant approval:\s*(Yes|No)', block_text)
        if ia_match:
            card["instant_approval"] = ia_match.group(1)
        
        cards.append(card)
    
    return cards


def enrich_card(card):
    """Add issuer, network, card_type from card name."""
    name = card["name"]
    name_lower = name.lower()
    
    # Issuer detection (order matters - check specific before generic)
    issuer_patterns = [
        (r'\btd\b', "TD"),
        (r'\brbc\b', "RBC"),
        (r'\bcibc\b', "CIBC"),
        (r'\bscotiabank\b|^scotia\b', "Scotiabank"),
        (r'\bbmo\b', "BMO"),
        (r'american express|simplycash|cobalt|marriott bonvoy.*amex|^amex\b', "American Express"),
        (r'\bmbna\b', "MBNA"),
        (r'\bhsbc\b', "HSBC"),
        (r'national bank', "National Bank"),
        (r'\btangerine\b', "Tangerine"),
        (r'\bsimplii\b', "Simplii"),
        (r'pc financial', "PC Financial"),
        (r'canadian tire|triangle', "Canadian Tire"),
        (r'\brogers\b', "Rogers"),
        (r'\bbrim\b', "Brim"),
        (r'\bneo\b', "Neo Financial"),
        (r'\bdesjardins\b', "Desjardins"),
        (r'home trust', "Home Trust"),
        (r'\bkoho\b', "KOHO"),
        (r'eq bank', "EQ Bank"),
        (r'wealthsimple', "Wealthsimple"),
        (r'capital one', "Capital One"),
        (r'\bloop\b', "Loop"),
        (r'\bvenn\b', "Venn"),
        (r'more rewards', "RBC"),
        (r'avion', "RBC"),
    ]
    
    card["issuer"] = ""
    for pattern, issuer in issuer_patterns:
        if re.search(pattern, name_lower):
            card["issuer"] = issuer
            break
    
    # Network
    if "visa" in name_lower:
        card["network"] = "Visa"
    elif "mastercard" in name_lower:
        card["network"] = "Mastercard"
    elif card["issuer"] == "American Express":
        card["network"] = "Amex"
    elif "amex" in name_lower or "american express" in name_lower:
        card["network"] = "Amex"
    else:
        card["network"] = ""
    
    # Card type
    if any(w in name_lower for w in ["cash back", "cashback", "simplycash", "dividend", "momentum"]):
        card["card_type"] = "cashback"
    elif any(w in name_lower for w in ["low rate", "low interest", "true line", "select visa", "value visa"]):
        card["card_type"] = "low-rate"
    elif "student" in name_lower:
        card["card_type"] = "student"
    elif "secured" in name_lower:
        card["card_type"] = "secured"
    elif "business" in name_lower:
        card["card_type"] = "business"
    elif "prepaid" in name_lower:
        card["card_type"] = "prepaid"
    elif any(w in name_lower for w in ["aeroplan", "avion", "aventura", "passport", "travel",
                                        "first class", "marriott", "bonvoy", "cobalt",
                                        "gold reward", "platinum", "viporter", "ascend",
                                        "eclipse", "green card"]):
        card["card_type"] = "travel"
    else:
        card["card_type"] = "rewards"
    
    # Country
    card["country"] = "CA"
    
    return card


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        url = f"{BASE_URL}/credit-cards/"
        print(f"Fetching: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
        
        # Reset rating filter to 0 to show ALL cards
        print("Resetting rating filter to show all cards...")
        try:
            # Look for the rating slider/filter — try clicking on "0" rating option
            rating_buttons = page.query_selector_all('button')
            for btn in rating_buttons:
                text = btn.inner_text().strip()
                if text == "0":
                    btn.click()
                    page.wait_for_timeout(2000)
                    print("  Clicked rating '0' filter")
                    break
        except Exception as e:
            print(f"  Warning: Could not reset rating filter: {e}")
        
        # Click Show All Cards
        try:
            for attempt in range(3):
                show_btn = page.query_selector('text="Show All Cards"')
                if not show_btn:
                    show_btn = page.query_selector('text="Show More Cards"')
                if show_btn:
                    print(f"  Clicking '{show_btn.inner_text().strip()}'...")
                    show_btn.click()
                    page.wait_for_timeout(3000)
                else:
                    break
        except Exception as e:
            print(f"  Warning: Could not click show all: {e}")
        
        # Get text
        text = page.inner_text("body")
        
        # Check how many we got
        showing_match = re.search(r'Showing (\d+) cards', text)
        if showing_match:
            print(f"Page says: Showing {showing_match.group(1)} cards")
        
        with open("ccgenius_v3_raw.txt", "w") as f:
            f.write(text)
        print(f"Saved raw text ({len(text)} chars)")
        
        browser.close()
    
    # Parse
    cards = parse_card_blocks(text)
    print(f"\nParsed {len(cards)} cards")
    
    # Enrich
    for card in cards:
        enrich_card(card)
    
    # Dedup
    seen = {}
    unique = []
    for card in cards:
        key = card["name"].lower().strip()
        if key not in seen:
            seen[key] = True
            unique.append(card)
    
    print(f"After dedup: {len(unique)} unique cards")
    
    # Save
    output = "../data/canadian_cards.json"
    with open(output, "w") as f:
        json.dump(unique, f, indent=2)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SCRAPED {len(unique)} CANADIAN CREDIT CARDS")
    print(f"{'='*60}")
    
    issuers = {}
    types = {}
    for c in unique:
        issuers[c.get("issuer") or "Unknown"] = issuers.get(c.get("issuer") or "Unknown", 0) + 1
        types[c.get("card_type", "other")] = types.get(c.get("card_type", "other"), 0) + 1
    
    print("\nBy issuer:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy type:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    # Data quality check
    has_fee = sum(1 for c in unique if c["annual_fee"])
    has_bonus = sum(1 for c in unique if c["welcome_bonus_value"])
    has_rewards = sum(1 for c in unique if c["annual_rewards_value"])
    has_issuer = sum(1 for c in unique if c["issuer"])
    
    print(f"\nData quality:")
    print(f"  Has annual fee: {has_fee}/{len(unique)}")
    print(f"  Has welcome bonus: {has_bonus}/{len(unique)}")
    print(f"  Has annual rewards: {has_rewards}/{len(unique)}")
    print(f"  Has issuer: {has_issuer}/{len(unique)}")
    
    # Show 5 sample cards with full data
    print(f"\n--- Top 5 Cards (by Genius Rating) ---")
    for c in sorted(unique, key=lambda x: float(x["genius_rating"] or "0"), reverse=True)[:5]:
        print(f"\n  {c['name']}")
        print(f"    Issuer: {c['issuer']} | Network: {c['network']} | Type: {c['card_type']}")
        print(f"    Annual Fee: {c['annual_fee']} (1st yr: {c['annual_fee_first_year'] or 'same'})")
        print(f"    Welcome Bonus: {c['welcome_bonus_value']} {c['welcome_bonus_details']}")
        print(f"    Annual Rewards: {c['annual_rewards_value']}")
        print(f"    Genius Rating: {c['genius_rating']}/5 | User Rating: {c['user_rating']}")


if __name__ == "__main__":
    main()
