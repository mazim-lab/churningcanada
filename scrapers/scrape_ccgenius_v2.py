#!/usr/bin/env python3
"""
Scrape ALL Canadian credit cards from CreditCardGenius.ca listing page.
V2: Parse the listing page text directly instead of visiting individual pages.
Clicks "Show All Cards" to load the full 228-card database.
"""

import json
import re
from playwright.sync_api import sync_playwright

BASE_URL = "https://creditcardgenius.ca"


def parse_card_blocks(text):
    """Parse the listing page text into individual card data blocks."""
    cards = []
    
    # Split text into card blocks. Each card starts with its name followed by rating.
    # Pattern: Card Name\n X.X Genius Rating
    lines = text.split('\n')
    
    current_card = None
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect start of a card block: line followed by "X.X Genius Rating"
        if i + 1 < len(lines) and re.match(r'\s*\d\.\d\s+Genius Rating', lines[i+1].strip()):
            # Save previous card
            if current_card and current_card.get("name"):
                cards.append(current_card)
            
            current_card = {
                "name": line,
                "source": "creditcardgenius",
                "genius_rating": "",
                "user_rating": "",
                "annual_fee": "",
                "annual_fee_first_year": "",
                "welcome_bonus_value": "",
                "welcome_bonus_details": "",
                "annual_rewards_value": "",
                "instant_approval": "",
                "promo_text": "",
                "url": "",
            }
            
            # Parse rating
            rating_match = re.match(r'\s*(\d\.\d)\s+Genius Rating', lines[i+1].strip())
            if rating_match:
                current_card["genius_rating"] = rating_match.group(1)
            i += 2
            continue
        
        if current_card:
            # Parse user reviews line
            if "User reviews" in line or "User review" in line:
                user_match = re.match(r'(\d\.\d)\s+\((\d+)\)\s+User review', line)
                if user_match:
                    current_card["user_rating"] = user_match.group(1)
            
            # Parse annual fee
            if line == "Annual fee" and i + 2 < len(lines):
                fee_line = lines[i+1].strip()
                # Handle "$120.00 $0" (regular + first year waived)
                fee_parts = re.findall(r'\$[\d,.]+', fee_line)
                if fee_parts:
                    current_card["annual_fee"] = fee_parts[0]
                    if len(fee_parts) > 1:
                        current_card["annual_fee_first_year"] = fee_parts[1]
                
                # Check for "1st year waived"
                if i + 2 < len(lines) and "1st year waived" in lines[i+2].strip():
                    current_card["annual_fee_first_year"] = "$0"
                    i += 1
                i += 2
                continue
            
            # Parse welcome bonus
            if line == "Welcome bonus" and i + 1 < len(lines):
                bonus_line = lines[i+1].strip()
                bonus_val = re.search(r'\$([\d,.]+)', bonus_line)
                if bonus_val:
                    current_card["welcome_bonus_value"] = "$" + bonus_val.group(1)
                # Get the details (e.g., "30,000 points")
                if i + 2 < len(lines):
                    details = lines[i+2].strip()
                    if details and not details.startswith("Annual") and not details.startswith("GC"):
                        current_card["welcome_bonus_details"] = details
                i += 2
                continue
            
            # Parse annual rewards
            if line == "Annual rewards" and i + 1 < len(lines):
                rewards_line = lines[i+1].strip()
                rewards_val = re.search(r'\$([\d,.]+)', rewards_line)
                if rewards_val:
                    current_card["annual_rewards_value"] = "$" + rewards_val.group(1)
                i += 2
                continue
            
            # Parse instant approval
            if line.startswith("Instant approval:"):
                current_card["instant_approval"] = line.split(":")[1].strip()
            
            # Parse promo text (the line with GeniusCash offers)
            if "GeniusCash" in line and "+" in line:
                current_card["promo_text"] = line.strip()
        
        i += 1
    
    # Don't forget the last card
    if current_card and current_card.get("name"):
        cards.append(current_card)
    
    return cards


def enrich_card_data(card):
    """Add derived fields like issuer, network, card_type."""
    name = card["name"].lower()
    
    # Detect issuer from card name
    issuer_map = [
        ("td", "TD"),
        ("rbc", "RBC"),
        ("cibc", "CIBC"),
        ("scotiabank", "Scotiabank"),
        ("scotia ", "Scotiabank"),
        ("bmo", "BMO"),
        ("american express", "American Express"),
        ("amex", "American Express"),
        ("simplycash", "American Express"),
        ("cobalt", "American Express"),
        ("marriott bonvoy", "American Express"),
        ("mbna", "MBNA"),
        ("hsbc", "HSBC"),
        ("national bank", "National Bank"),
        ("tangerine", "Tangerine"),
        ("simplii", "Simplii"),
        ("pc financial", "PC Financial"),
        ("canadian tire", "Canadian Tire"),
        ("triangle", "Canadian Tire"),
        ("rogers", "Rogers"),
        ("brim", "Brim"),
        ("neo ", "Neo Financial"),
        ("desjardins", "Desjardins"),
        ("home trust", "Home Trust"),
        ("koho", "KOHO"),
        ("eq bank", "EQ Bank"),
        ("wealthsimple", "Wealthsimple"),
        ("capital one", "Capital One"),
        ("loop", "Loop"),
        ("venn", "Venn"),
    ]
    
    card["issuer"] = ""
    for pattern, issuer in issuer_map:
        if pattern in name:
            card["issuer"] = issuer
            break
    
    # Detect network from card name
    if "visa" in name:
        card["network"] = "Visa"
    elif "mastercard" in name or "master card" in name:
        card["network"] = "Mastercard"
    elif card["issuer"] == "American Express":
        card["network"] = "Amex"
    else:
        card["network"] = ""
    
    # Detect card type from name and promo
    combined = name + " " + card.get("promo_text", "").lower()
    if any(w in combined for w in ["cash back", "cashback", "simplycash", "dividend"]):
        card["card_type"] = "cashback"
    elif any(w in combined for w in ["low rate", "low interest", "true line", "select visa", "value visa"]):
        card["card_type"] = "low-rate"
    elif any(w in combined for w in ["student"]):
        card["card_type"] = "student"
    elif any(w in combined for w in ["secured"]):
        card["card_type"] = "secured"
    elif any(w in combined for w in ["business"]):
        card["card_type"] = "business"
    elif any(w in combined for w in ["prepaid"]):
        card["card_type"] = "prepaid"
    elif any(w in combined for w in ["aeroplan", "avion", "aventura", "passport", "travel", 
                                      "first class", "scene+", "marriott", "bonvoy",
                                      "cobalt", "gold reward", "platinum", "viporter",
                                      "ascend", "eclipse"]):
        card["card_type"] = "travel"
    else:
        card["card_type"] = "rewards"
    
    # Build URL from card name
    slug = re.sub(r'[®™*©◊]+', '', card["name"])
    slug = slug.strip().lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    card["url"] = f"{BASE_URL}/credit-cards/{slug}"
    
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
        
        # Click "Show All Cards" to load all 228 cards
        try:
            show_all_btn = page.query_selector('text="Show All Cards"')
            if show_all_btn:
                print("Clicking 'Show All Cards'...")
                show_all_btn.click()
                page.wait_for_timeout(5000)
            else:
                # Try alternative selectors
                show_more = page.query_selector('text="Show More Cards"')
                if show_more:
                    print("Clicking 'Show More Cards'...")
                    show_more.click()
                    page.wait_for_timeout(3000)
                    # Click again if "Show All" appears
                    show_all = page.query_selector('text="Show All Cards"')
                    if show_all:
                        show_all.click()
                        page.wait_for_timeout(5000)
        except Exception as e:
            print(f"Warning: Could not click show all: {e}")
        
        # Get full page text
        text = page.inner_text("body")
        
        with open("ccgenius_full_raw.txt", "w") as f:
            f.write(text)
        print(f"Saved raw text ({len(text)} chars)")
        
        browser.close()
    
    # Parse the text into card blocks
    cards = parse_card_blocks(text)
    print(f"\nParsed {len(cards)} card blocks from listing")
    
    # Enrich with derived data
    for card in cards:
        enrich_card_data(card)
    
    # Deduplicate by name
    seen = {}
    unique_cards = []
    for card in cards:
        key = card["name"].lower().strip()
        if key not in seen:
            seen[key] = True
            unique_cards.append(card)
    
    print(f"After dedup: {len(unique_cards)} unique cards")
    
    # Save
    output_path = "../data/canadian_cards.json"
    with open(output_path, "w") as f:
        json.dump(unique_cards, f, indent=2)
    
    print(f"\nSaved to {output_path}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY: {len(unique_cards)} Canadian credit cards")
    print(f"{'='*60}")
    
    issuers = {}
    types = {}
    networks = {}
    for c in unique_cards:
        issuers[c.get("issuer", "Unknown") or "Unknown"] = issuers.get(c.get("issuer", "Unknown") or "Unknown", 0) + 1
        types[c.get("card_type", "other")] = types.get(c.get("card_type", "other"), 0) + 1
        networks[c.get("network", "Unknown") or "Unknown"] = networks.get(c.get("network", "Unknown") or "Unknown", 0) + 1
    
    print("\nBy issuer:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy type:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy network:")
    for k, v in sorted(networks.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    # Show first 10 cards as sample
    print(f"\n--- Sample (first 10 cards) ---")
    for c in unique_cards[:10]:
        print(f"  {c['name']}")
        print(f"    Issuer: {c['issuer']} | Network: {c['network']} | Type: {c['card_type']}")
        print(f"    Fee: {c['annual_fee']} (1st yr: {c['annual_fee_first_year'] or 'same'})")
        print(f"    Welcome Bonus: {c['welcome_bonus_value']} ({c['welcome_bonus_details']})")
        print(f"    Annual Rewards: {c['annual_rewards_value']}")
        print(f"    Rating: {c['genius_rating']}/5")
        print()


if __name__ == "__main__":
    main()
