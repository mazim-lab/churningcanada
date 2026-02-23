#!/usr/bin/env python3
"""Scrape all credit cards from Ratehub.ca using Playwright to intercept API calls."""
import json
from playwright.sync_api import sync_playwright

def main():
    cards_data = []
    api_responses = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        page = context.new_page()
        
        # Intercept all API/XHR responses
        def handle_response(response):
            url = response.url
            if any(k in url for k in ['api', 'credit-card', 'cards', 'graphql', 'product']):
                try:
                    ct = response.headers.get('content-type', '')
                    if 'json' in ct or 'graphql' in url:
                        body = response.json()
                        api_responses.append({'url': url, 'data': body})
                        print(f"  API: {url[:120]}")
                except:
                    pass
        
        page.on("response", handle_response)
        
        # Visit the card comparison tool which lists all cards
        urls = [
            "https://www.ratehub.ca/credit-cards/rewards",
            "https://www.ratehub.ca/credit-cards/cash-back",
            "https://www.ratehub.ca/credit-cards/travel",
            "https://www.ratehub.ca/credit-cards/no-annual-fee",
            "https://www.ratehub.ca/credit-cards/business",
            "https://www.ratehub.ca/credit-cards/low-interest",
            "https://www.ratehub.ca/credit-cards/secured",
            "https://www.ratehub.ca/credit-cards/student",
        ]
        
        for url in urls:
            print(f"\nVisiting: {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(3000)
                # Scroll to load more
                for _ in range(3):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(1500)
            except Exception as e:
                print(f"  Error: {e}")
        
        browser.close()
    
    print(f"\n{'='*60}")
    print(f"Captured {len(api_responses)} API responses")
    
    # Save all API responses
    with open("../data/ratehub_api_raw.json", "w") as f:
        json.dump(api_responses, f, indent=2, default=str)
    
    print(f"Saved to ../data/ratehub_api_raw.json")

if __name__ == "__main__":
    main()
