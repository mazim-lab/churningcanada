#!/usr/bin/env python3
"""
Scrape ALL credit cards from CreditCardGenius via their internal API.
Uses Playwright to intercept the /api/v2/card/cards JSON response.
"""

import json
import re
from playwright.sync_api import sync_playwright

captured_cards = []
captured_count = None

def main():
    global captured_cards, captured_count
    
    def handle_response(response):
        global captured_cards, captured_count
        url = response.url
        
        if "/api/v2/card/cards" in url:
            try:
                body = response.json()
                if isinstance(body, list):
                    captured_cards.extend(body)
                    print(f"  Captured {len(body)} cards from {url[:80]}")
                elif isinstance(body, dict) and "cards" in body:
                    captured_cards.extend(body["cards"])
                    print(f"  Captured {len(body['cards'])} cards from {url[:80]}")
                elif isinstance(body, dict):
                    # Maybe the cards are nested somewhere
                    for key, val in body.items():
                        if isinstance(val, list) and len(val) > 5:
                            captured_cards.extend(val)
                            print(f"  Captured {len(val)} cards from key '{key}' at {url[:80]}")
                            break
                    else:
                        print(f"  Got dict response with keys: {list(body.keys())[:10]}")
                        # Save for inspection
                        with open("ccgenius_api_raw.json", "w") as f:
                            json.dump(body, f, indent=2)
            except Exception as e:
                print(f"  Error parsing card response: {e}")
        
        if "/api/v2/card/count" in url:
            try:
                body = response.json()
                captured_count = body
                print(f"  Card count: {body}")
            except Exception as e:
                print(f"  Error parsing count: {e}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        page.on("response", handle_response)
        
        url = "https://creditcardgenius.ca/credit-cards/"
        print(f"Loading: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(5000)
        
        print(f"\nCaptured {len(captured_cards)} cards so far")
        
        # Try clicking show more/all to trigger more API calls
        for attempt in range(5):
            try:
                btn = page.query_selector('text="Show All Cards"') or page.query_selector('text="Show More Cards"')
                if btn:
                    label = btn.inner_text().strip()
                    print(f"Clicking '{label}'...")
                    btn.click()
                    page.wait_for_timeout(3000)
                else:
                    break
            except:
                break
        
        print(f"\nTotal captured: {len(captured_cards)} cards")
        
        browser.close()
    
    if not captured_cards:
        print("No cards captured from API. Check ccgenius_api_raw.json for response structure.")
        return
    
    # Inspect the structure of captured cards
    if captured_cards:
        sample = captured_cards[0]
        print(f"\nCard data structure ({len(sample)} fields):")
        for key in sorted(sample.keys()) if isinstance(sample, dict) else []:
            val = sample[key]
            if isinstance(val, (str, int, float, bool, type(None))):
                print(f"  {key}: {repr(val)[:80]}")
            elif isinstance(val, list):
                print(f"  {key}: list[{len(val)}]")
            elif isinstance(val, dict):
                print(f"  {key}: dict{{{', '.join(list(val.keys())[:5])}}}")
    
    # Save raw API data
    with open("../data/ccgenius_api_raw.json", "w") as f:
        json.dump(captured_cards, f, indent=2)
    print(f"\nSaved raw API data to ../data/ccgenius_api_raw.json")


if __name__ == "__main__":
    main()
