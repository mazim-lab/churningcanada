#!/usr/bin/env python3
"""Find CreditCardGenius's internal API endpoints by monitoring network requests."""

from playwright.sync_api import sync_playwright
import json

def main():
    api_calls = []
    
    def handle_response(response):
        url = response.url
        if "api" in url.lower() or "card" in url.lower() or "credit" in url.lower():
            if not any(x in url for x in [".png", ".jpg", ".css", ".js", ".svg", ".woff", "google", "facebook", "analytics"]):
                try:
                    content_type = response.headers.get("content-type", "")
                    if "json" in content_type or "text" in content_type:
                        api_calls.append({
                            "url": url,
                            "status": response.status,
                            "content_type": content_type,
                        })
                except:
                    pass
    
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
        
        # Click show all
        try:
            btn = page.query_selector('text="Show All Cards"') or page.query_selector('text="Show More Cards"')
            if btn:
                btn.click()
                page.wait_for_timeout(3000)
        except:
            pass
        
        browser.close()
    
    print(f"\nFound {len(api_calls)} API-like calls:")
    for call in api_calls:
        print(f"  [{call['status']}] {call['url'][:120]}")
        print(f"       Content-Type: {call['content_type']}")

if __name__ == "__main__":
    main()
