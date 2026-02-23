#!/usr/bin/env python3
"""Scrape all TD Canada credit cards from the browse-all page."""

import json
from playwright.sync_api import sync_playwright

def scrape_td_all_cards():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        url = "https://www.td.com/ca/en/personal-banking/products/credit-cards/browse-all"
        print(f"Fetching: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)
        
        # Get the full text
        text = page.inner_text("body")
        
        # Save for analysis
        with open("td_all_raw.txt", "w") as f:
            f.write(text)
        
        # Find all card detail links
        links = page.query_selector_all('a')
        card_pages = set()
        for link in links:
            href = link.get_attribute("href") or ""
            name = link.inner_text().strip()
            # Look for individual card product pages
            if "/credit-cards/" in href and any(x in href for x in ["card", "Card"]) and "browse" not in href:
                if name and len(name) > 3 and len(name) < 100:
                    full_url = href if href.startswith("http") else f"https://www.td.com{href}"
                    card_pages.add((name, full_url))
        
        print(f"\nFound {len(card_pages)} individual card pages:")
        for name, url in sorted(card_pages):
            print(f"  - {name}")
            print(f"    {url}")
        
        # Now scrape one individual card page for structure
        if card_pages:
            test_name, test_url = sorted(card_pages)[0]
            print(f"\n--- Testing individual card page: {test_name} ---")
            page.goto(test_url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(2000)
            
            card_text = page.inner_text("body")
            with open("td_card_sample.txt", "w") as f:
                f.write(card_text)
            print(f"Saved sample card page ({len(card_text)} chars)")
            
            # Look for key data points
            for keyword in ["annual fee", "Annual Fee", "interest rate", "Interest Rate", 
                          "welcome bonus", "Welcome Bonus", "earn rate", "Earn Rate",
                          "points", "cash back", "reward"]:
                if keyword.lower() in card_text.lower():
                    # Find the context around the keyword
                    idx = card_text.lower().index(keyword.lower())
                    context = card_text[max(0,idx-50):idx+100].replace('\n', ' ').strip()
                    print(f"  Found '{keyword}': ...{context}...")
        
        browser.close()

if __name__ == "__main__":
    scrape_td_all_cards()
