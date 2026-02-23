#!/usr/bin/env python3
"""Test scraper for TD Canada credit cards using Playwright."""

import json
from playwright.sync_api import sync_playwright

def scrape_td_cards():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # TD credit cards overview page
        url = "https://www.td.com/ca/en/personal-banking/products/credit-cards"
        print(f"Fetching: {url}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # Wait for content to load
        page.wait_for_timeout(3000)
        
        # Get all text content for analysis
        content = page.content()
        text = page.inner_text("body")
        
        # Try to find card containers
        # First, let's see what's on the page
        cards = page.query_selector_all('[class*="card"], [class*="Card"], [class*="product"], [class*="Product"]')
        print(f"\nFound {len(cards)} potential card elements")
        
        # Get all links that might be individual card pages
        links = page.query_selector_all('a[href*="credit-card"]')
        card_links = set()
        for link in links:
            href = link.get_attribute("href")
            text_content = link.inner_text().strip()
            if href and text_content and len(text_content) > 5:
                card_links.add((text_content[:80], href))
        
        print(f"\nFound {len(card_links)} card-related links:")
        for name, href in sorted(card_links):
            print(f"  - {name}: {href}")
        
        # Save raw text for analysis
        with open("td_raw.txt", "w") as f:
            f.write(text[:50000])
        
        print(f"\nSaved raw page text ({len(text)} chars) to td_raw.txt")
        
        browser.close()

if __name__ == "__main__":
    scrape_td_cards()
