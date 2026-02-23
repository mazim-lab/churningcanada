#!/usr/bin/env python3
"""
Scrape Canadian credit card data from CreditCardGenius.ca
Outputs structured JSON with card details.
"""

import json
import re
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://creditcardgenius.ca"

def scrape_card_list(page):
    """Get all card URLs from the main comparison page."""
    url = f"{BASE_URL}/best-credit-cards-in-canada/"
    print(f"Fetching card list: {url}")
    page.goto(url, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    # Find all individual card review links
    links = page.query_selector_all('a')
    card_urls = set()
    for link in links:
        href = link.get_attribute("href") or ""
        if "/credit-cards/" in href and href.count("/") >= 4:
            full_url = href if href.startswith("http") else f"{BASE_URL}{href}"
            if full_url not in card_urls:
                card_urls.add(full_url)
    
    print(f"Found {len(card_urls)} card URLs")
    return sorted(card_urls)


def scrape_all_cards_page(page):
    """Try the all credit cards listing page."""
    url = f"{BASE_URL}/credit-cards/"
    print(f"Fetching all cards page: {url}")
    page.goto(url, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    text = page.inner_text("body")
    with open("ccgenius_all_raw.txt", "w") as f:
        f.write(text)
    
    # Find card links
    links = page.query_selector_all('a[href*="/credit-cards/"]')
    card_urls = {}
    for link in links:
        href = link.get_attribute("href") or ""
        name = link.inner_text().strip()
        if href and name and len(name) > 5 and len(name) < 120:
            full_url = href if href.startswith("http") else f"{BASE_URL}{href}"
            # Filter out category pages
            parts = full_url.rstrip("/").split("/")
            if len(parts) >= 5 and "credit-cards" in parts:
                card_urls[full_url] = name
    
    print(f"Found {len(card_urls)} individual card pages")
    for url, name in sorted(card_urls.items(), key=lambda x: x[1]):
        print(f"  - {name}")
    
    return card_urls


def scrape_card_detail(page, url):
    """Scrape individual card detail page."""
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
    except Exception as e:
        print(f"  Error loading {url}: {e}")
        return None
    
    text = page.inner_text("body")
    
    card = {
        "url": url,
        "source": "creditcardgenius",
        "name": "",
        "issuer": "",
        "network": "",
        "annual_fee": "",
        "annual_fee_first_year": "",
        "interest_rate_purchases": "",
        "interest_rate_cash": "",
        "welcome_bonus": "",
        "welcome_bonus_value": "",
        "spend_requirement": "",
        "earn_rates": [],
        "perks": [],
        "insurance": [],
        "card_type": "",  # travel, cashback, low-rate, etc.
        "raw_text": text[:5000],
    }
    
    # Try to get the card name from the page title
    title = page.title()
    if title:
        card["name"] = title.split("|")[0].split(" Review")[0].split(" - ")[0].strip()
    
    # Extract structured data using common patterns
    # Annual fee
    fee_match = re.search(r'Annual [Ff]ee[:\s]*\$?([\d,.]+)', text)
    if fee_match:
        card["annual_fee"] = fee_match.group(1)
    
    # Check for $0 first year
    if re.search(r'(\$0|waived|rebate).*first year|first year.*(\$0|waived|rebate)', text, re.IGNORECASE):
        card["annual_fee_first_year"] = "$0"
    
    # Interest rates
    purchase_rate = re.search(r'(?:Purchase|Regular).*?Interest.*?(\d+\.?\d*)\s*%', text, re.IGNORECASE)
    if purchase_rate:
        card["interest_rate_purchases"] = purchase_rate.group(1) + "%"
    
    cash_rate = re.search(r'Cash.*?(?:Advance|advance).*?(\d+\.?\d*)\s*%', text, re.IGNORECASE)
    if cash_rate:
        card["interest_rate_cash"] = cash_rate.group(1) + "%"
    
    # Detect card network
    for network in ["Visa", "Mastercard", "MasterCard", "American Express", "Amex"]:
        if network.lower() in text.lower():
            card["network"] = "Amex" if "amex" in network.lower() or "american" in network.lower() else network
            break
    
    # Detect issuer
    issuers = ["TD", "RBC", "CIBC", "Scotiabank", "BMO", "American Express", "Amex",
               "MBNA", "HSBC", "National Bank", "Tangerine", "Simplii", "PC Financial",
               "Canadian Tire", "Triangle", "Rogers", "Brim", "Neo", "Desjardins",
               "Coast Capital", "Meridian"]
    for issuer in issuers:
        if issuer.lower() in text.lower():
            card["issuer"] = issuer
            break
    
    # Detect card type
    if any(w in text.lower() for w in ["travel", "aeroplan", "avion", "aventura", "scene+"]):
        card["card_type"] = "travel"
    elif any(w in text.lower() for w in ["cash back", "cashback"]):
        card["card_type"] = "cashback"
    elif "low rate" in text.lower() or "low interest" in text.lower():
        card["card_type"] = "low-rate"
    elif "business" in text.lower():
        card["card_type"] = "business"
    elif "student" in text.lower():
        card["card_type"] = "student"
    else:
        card["card_type"] = "rewards"
    
    return card


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # Step 1: Get all card URLs
        card_urls = scrape_all_cards_page(page)
        
        if not card_urls:
            print("No cards found on main page. Trying best-of page...")
            urls = scrape_card_list(page)
            card_urls = {u: "" for u in urls}
        
        # Step 2: Scrape each card detail page
        cards = []
        total = len(card_urls)
        for i, (url, name) in enumerate(sorted(card_urls.items(), key=lambda x: x[1])):
            print(f"\n[{i+1}/{total}] Scraping: {name or url}")
            card = scrape_card_detail(page, url)
            if card:
                if name and not card["name"]:
                    card["name"] = name
                cards.append(card)
                print(f"  -> {card['name']} | {card['issuer']} | Fee: ${card['annual_fee']} | Type: {card['card_type']}")
            
            # Be polite
            time.sleep(1)
        
        browser.close()
    
    # Save results
    output_path = "../data/creditcardgenius_cards.json"
    # Remove raw_text for the clean output
    clean_cards = []
    for c in cards:
        clean = {k: v for k, v in c.items() if k != "raw_text"}
        clean_cards.append(clean)
    
    with open(output_path, "w") as f:
        json.dump(clean_cards, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Scraped {len(cards)} cards, saved to {output_path}")
    print(f"{'='*60}")
    
    # Summary
    issuers = {}
    types = {}
    for c in cards:
        issuers[c["issuer"]] = issuers.get(c["issuer"], 0) + 1
        types[c["card_type"]] = types.get(c["card_type"], 0) + 1
    
    print("\nBy issuer:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k or 'Unknown'}: {v}")
    
    print("\nBy type:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
