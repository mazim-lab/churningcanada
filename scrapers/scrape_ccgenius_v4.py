#!/usr/bin/env python3
"""
Scrape ALL 228 Canadian credit cards from CreditCardGenius.ca
V4: Clear all filters, reset rating to 0, click Show All repeatedly.
"""

import json
import re
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://creditcardgenius.ca"


def parse_card_blocks(text):
    """Parse card data from listing page text."""
    cards = []
    lines = text.split('\n')
    
    card_starts = []
    for i, line in enumerate(lines):
        if re.match(r'\s*\d\.\d\s+Genius Rating', line.strip()):
            card_starts.append(i)
    
    print(f"Found {len(card_starts)} card rating markers")
    
    for idx, start_line in enumerate(card_starts):
        name_line = start_line - 1
        while name_line >= 0 and not lines[name_line].strip():
            name_line -= 1
        
        if name_line < 0:
            continue
        
        card_name = lines[name_line].strip()
        
        # Skip junk: too short, or known non-card text
        if len(card_name) < 5:
            continue
        if any(junk in card_name.lower() for junk in [
            "pros & cons", "user reviews", "genius rating", "details & eligibility",
            "earn up to", "get up to", "welcome bonus", "apply now", "learn more",
            "conditions apply", "limited time", "new!", "featured"
        ]):
            continue
        
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
        m = re.search(r'(\d\.\d)\s+Genius Rating', block_text)
        if m:
            card["genius_rating"] = m.group(1)
        
        # User rating
        m = re.search(r'(\d\.\d)\s+\((\d+)\)\s+User review', block_text)
        if m:
            card["user_rating"] = m.group(1)
            card["user_reviews_count"] = m.group(2)
        
        # Annual fee
        m = re.search(r'Annual fee\s*\n\s*\n?\s*(\$[\d,.]+(?:\s+\$[\d,.]+)?)', block_text)
        if m:
            fees = re.findall(r'\$([\d,.]+)', m.group(1))
            if fees:
                card["annual_fee"] = "$" + fees[0]
                if len(fees) > 1:
                    card["annual_fee_first_year"] = "$" + fees[1]
        
        if "1st year waived" in block_text or "first year waived" in block_text.lower():
            card["annual_fee_first_year"] = "$0"
        
        # Welcome bonus
        m = re.search(r'Welcome bonus\s*\n\s*\n?\s*(\$[\d,.]+)', block_text)
        if m:
            card["welcome_bonus_value"] = m.group(1)
        
        m = re.search(r'Welcome bonus\s*\n\s*\n?\s*\$[\d,.]+[◊]?\s*\n\s*(.+)', block_text)
        if m:
            details = m.group(1).strip()
            if details and not details.startswith("Annual") and not details.startswith("GC"):
                card["welcome_bonus_details"] = details
        
        # Annual rewards
        m = re.search(r'Annual rewards\s*\n\s*\n?\s*(\$[\d,.]+)', block_text)
        if m:
            card["annual_rewards_value"] = m.group(1)
        
        # Instant approval
        m = re.search(r'Instant approval:\s*(Yes|No)', block_text)
        if m:
            card["instant_approval"] = m.group(1)
        
        cards.append(card)
    
    return cards


def enrich_card(card):
    """Add issuer, network, card_type."""
    name_lower = card["name"].lower()
    
    issuer_patterns = [
        (r'\btd\b', "TD"),
        (r'\brbc\b|avion', "RBC"),
        (r'\bcibc\b|aventura', "CIBC"),
        (r'scotiabank|^scotia ', "Scotiabank"),
        (r'\bbmo\b', "BMO"),
        (r'american express|simplycash|cobalt|marriott bonvoy|aeroplan.*amex', "American Express"),
        (r'\bmbna\b', "MBNA"),
        (r'\bhsbc\b', "HSBC"),
        (r'national bank|nbc ', "National Bank"),
        (r'\btangerine\b', "Tangerine"),
        (r'\bsimplii\b', "Simplii"),
        (r'pc financial|president.s choice', "PC Financial"),
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
        (r'scene\+.*visa', "Scotiabank"),
    ]
    
    card["issuer"] = ""
    for pattern, issuer in issuer_patterns:
        if re.search(pattern, name_lower):
            card["issuer"] = issuer
            break
    
    if "visa" in name_lower:
        card["network"] = "Visa"
    elif "mastercard" in name_lower:
        card["network"] = "Mastercard"
    elif card.get("issuer") == "American Express" or "amex" in name_lower or "american express" in name_lower:
        card["network"] = "Amex"
    else:
        card["network"] = ""
    
    if any(w in name_lower for w in ["cash back", "cashback", "simplycash", "dividend", "momentum"]):
        card["card_type"] = "cashback"
    elif any(w in name_lower for w in ["low rate", "low interest", "true line", "select visa", "value visa"]):
        card["card_type"] = "low-rate"
    elif "student" in name_lower:
        card["card_type"] = "student"
    elif "secured" in name_lower or "guaranteed" in name_lower:
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
        
        # Step 1: Click "Reset Filters" to clear all preferences
        print("Resetting all filters...")
        try:
            reset_btn = page.query_selector('text="Reset Filters"')
            if reset_btn:
                reset_btn.click()
                page.wait_for_timeout(3000)
                print("  Filters reset!")
        except Exception as e:
            print(f"  Warning: {e}")
        
        # Step 2: Set rating filter to 0 (show all)
        try:
            # The rating filter shows "Showing X cards with a Genius Rating of 5/4/3/2/1/0 and above"
            # Click on the "0" button
            zero_btns = page.query_selector_all('button')
            for btn in zero_btns:
                try:
                    t = btn.inner_text().strip()
                    if t == "0":
                        btn.click()
                        page.wait_for_timeout(2000)
                        print("  Set rating filter to 0")
                        break
                except:
                    pass
        except Exception as e:
            print(f"  Warning: {e}")
        
        # Step 3: Keep clicking "Show More Cards" / "Show All Cards" until all loaded
        for attempt in range(10):
            try:
                show_btn = page.query_selector('text="Show All Cards"') or page.query_selector('text="Show More Cards"')
                if show_btn:
                    label = show_btn.inner_text().strip()
                    print(f"  Clicking '{label}' (attempt {attempt+1})...")
                    show_btn.click()
                    page.wait_for_timeout(3000)
                else:
                    print("  No more 'Show' buttons found")
                    break
            except:
                break
        
        # Get text
        text = page.inner_text("body")
        
        showing = re.search(r'Showing (\d+) cards', text)
        if showing:
            print(f"\nPage says: Showing {showing.group(1)} cards")
        
        # Count Genius Rating occurrences
        rating_count = len(re.findall(r'\d\.\d\s+Genius Rating', text))
        print(f"Rating markers found: {rating_count}")
        
        with open("ccgenius_v4_raw.txt", "w") as f:
            f.write(text)
        print(f"Saved raw text ({len(text)} chars)")
        
        browser.close()
    
    # Parse
    cards = parse_card_blocks(text)
    print(f"\nParsed {len(cards)} cards")
    
    for card in cards:
        enrich_card(card)
    
    # Dedup by normalized name
    seen = {}
    unique = []
    for card in cards:
        key = re.sub(r'[®™*©◊()\s]+', ' ', card["name"]).lower().strip()
        if key not in seen:
            seen[key] = True
            unique.append(card)
        else:
            # Keep the one with more data
            pass
    
    print(f"After dedup: {len(unique)} unique cards")
    
    # Remove cards with no issuer AND no fee AND no bonus (likely junk)
    clean = [c for c in unique if c["issuer"] or c["annual_fee"] or c["welcome_bonus_value"]]
    removed = len(unique) - len(clean)
    if removed:
        print(f"Removed {removed} junk entries (no issuer, fee, or bonus)")
    
    # Save
    output = "../data/canadian_cards.json"
    with open(output, "w") as f:
        json.dump(clean, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"SCRAPED {len(clean)} CANADIAN CREDIT CARDS")
    print(f"{'='*60}")
    
    issuers = {}
    types = {}
    networks = {}
    for c in clean:
        issuers[c.get("issuer") or "Unknown"] = issuers.get(c.get("issuer") or "Unknown", 0) + 1
        types[c.get("card_type", "?")] = types.get(c.get("card_type", "?"), 0) + 1
        networks[c.get("network") or "Unknown"] = networks.get(c.get("network") or "Unknown", 0) + 1
    
    print("\nBy issuer:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy type:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy network:")
    for k, v in sorted(networks.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    has_fee = sum(1 for c in clean if c["annual_fee"])
    has_bonus = sum(1 for c in clean if c["welcome_bonus_value"])
    has_rewards = sum(1 for c in clean if c["annual_rewards_value"])
    
    print(f"\nData quality ({len(clean)} cards):")
    print(f"  Has annual fee: {has_fee}/{len(clean)} ({100*has_fee//len(clean)}%)")
    print(f"  Has welcome bonus: {has_bonus}/{len(clean)} ({100*has_bonus//len(clean)}%)")
    print(f"  Has annual rewards: {has_rewards}/{len(clean)} ({100*has_rewards//len(clean)}%)")


if __name__ == "__main__":
    main()
