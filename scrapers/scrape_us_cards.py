#!/usr/bin/env python3
"""
Scrape US credit card data for Amex and Chase from Doctor of Credit.
These are the cards most relevant to Canadian churners getting US cards.
"""

import json
import re
import time
from playwright.sync_api import sync_playwright

def scrape_doc_page(page, url, label):
    """Scrape a Doctor of Credit card listing page."""
    print(f"\nScraping: {label}")
    print(f"  URL: {url}")
    
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
    except Exception as e:
        print(f"  Error loading page: {e}")
        return ""
    
    text = page.inner_text("body")
    print(f"  Got {len(text)} chars")
    return text


def scrape_amex_us(page):
    """Scrape Amex US cards from their official card listing."""
    url = "https://card.americanexpress.com/d/cm/credit-cards/"
    print(f"\nScraping Amex US: {url}")
    
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
    except:
        # Try alternate URL
        url = "https://www.americanexpress.com/us/credit-cards/"
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
    
    text = page.inner_text("body")
    
    with open("amex_us_raw.txt", "w") as f:
        f.write(text)
    
    print(f"  Got {len(text)} chars")
    return text


def scrape_chase_us(page):
    """Scrape Chase US cards from their official card listing."""
    url = "https://creditcards.chase.com/"
    print(f"\nScraping Chase US: {url}")
    
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
    except Exception as e:
        print(f"  Error: {e}")
        return ""
    
    text = page.inner_text("body")
    
    with open("chase_us_raw.txt", "w") as f:
        f.write(text)
    
    print(f"  Got {len(text)} chars")
    return text


def scrape_doc_best_offers(page):
    """Scrape Doctor of Credit's best current offers page."""
    url = "https://www.doctorofcredit.com/best-current-credit-card-sign-up-bonuses/"
    print(f"\nScraping DoC Best Offers: {url}")
    
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
    except Exception as e:
        print(f"  Error: {e}")
        return ""
    
    text = page.inner_text("body")
    
    with open("doc_best_offers_raw.txt", "w") as f:
        f.write(text)
    
    print(f"  Got {len(text)} chars")
    return text


def parse_amex_us_cards(text):
    """Parse Amex US cards from the raw text."""
    cards = []
    
    # Known Amex US cards with their key details
    # We'll extract what we can from the page and fill in manually where needed
    lines = text.split('\n')
    
    current_card = None
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Detect card names - Amex cards typically have specific patterns
        if any(keyword in line for keyword in ["Platinum Card®", "Gold Card", "Green Card", 
                                                 "Blue Cash", "Delta", "Hilton", "Marriott",
                                                 "EveryDay", "Cash Magnet", "Business"]):
            if len(line) < 100 and "Learn" not in line and "Apply" not in line:
                if current_card:
                    cards.append(current_card)
                
                current_card = {
                    "name": line,
                    "issuer": "American Express",
                    "network": "Amex",
                    "country": "US",
                    "source": "amex_us_website",
                    "annual_fee": "",
                    "welcome_bonus": "",
                    "card_type": "",
                }
        
        if current_card:
            # Annual fee
            fee_match = re.search(r'\$(\d+)\s*(?:annual fee|Annual Fee|/year)', line)
            if fee_match:
                current_card["annual_fee"] = "$" + fee_match.group(1)
            
            if "$0" in line and ("annual" in line.lower() or "fee" in line.lower()):
                current_card["annual_fee"] = "$0"
            
            # Welcome bonus  
            bonus_match = re.search(r'(?:earn|get|receive)\s+([\d,]+)\s*(?:points|Membership Rewards)', line, re.IGNORECASE)
            if bonus_match:
                current_card["welcome_bonus"] = bonus_match.group(1) + " points"
    
    if current_card:
        cards.append(current_card)
    
    return cards


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        # 1. Scrape Amex US
        amex_text = scrape_amex_us(page)
        
        # 2. Scrape Chase US
        chase_text = scrape_chase_us(page)
        
        # 3. Scrape Doctor of Credit best offers
        doc_text = scrape_doc_best_offers(page)
        
        browser.close()
    
    print(f"\n{'='*60}")
    print("RAW DATA COLLECTED")
    print(f"  Amex US: {len(amex_text)} chars")
    print(f"  Chase US: {len(chase_text)} chars")
    print(f"  DoC Best Offers: {len(doc_text)} chars")
    print(f"{'='*60}")
    
    # For now, save the raw text files for manual review
    # The parsing will be refined after we see the actual page structure
    print("\nRaw text saved to: amex_us_raw.txt, chase_us_raw.txt, doc_best_offers_raw.txt")
    print("Next step: Review these files and build proper parsers.")


if __name__ == "__main__":
    main()
