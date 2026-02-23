#!/usr/bin/env python3
"""
ChurningCanada Bank Card Scraper
Scrapes credit card data directly from Canadian and US bank websites.
Designed to run as a GitHub Action on a weekly schedule.

Usage:
    python scrapers/bank_scraper.py [--bank BANK_NAME] [--all]
"""

import json
import os
import re
import sys
import argparse
from datetime import datetime
from pathlib import Path

# Try playwright - required for most banks
try:
    from playwright.sync_api import sync_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False
    print("WARNING: playwright not installed. Install with: pip install playwright && playwright install")

# Try urllib for web_fetch fallback
import urllib.request
import ssl

DATA_DIR = Path(__file__).parent.parent / "data"
WEBSITE_DATA_DIR = Path(__file__).parent.parent / "website" / "src" / "data"

# ============================================================
# Bank scraper configurations
# ============================================================

BANKS = {
    # Canadian Banks
    "amex_canada": {
        "url": "https://www.americanexpress.com/en-ca/credit-cards/all-cards/view-cards/",
        "country": "CA",
        "method": "chromium",
        "issuer": "American Express",
    },
    "td_canada": {
        "url": "https://www.td.com/ca/en/personal-banking/products/credit-cards/browse-all",
        "country": "CA",
        "method": "chromium",
        "issuer": "TD",
    },
    "rbc_personal": {
        "url": "https://www.rbcroyalbank.com/credit-cards/all-credit-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "RBC",
    },
    "rbc_business": {
        "url": "https://www.rbcroyalbank.com/business/credit-cards/index.html#credit-cards",
        "country": "CA",
        "method": "chromium",
        "issuer": "RBC",
    },
    "scotiabank_personal": {
        "url": "https://www.scotiabank.com/ca/en/personal/credit-cards/compare-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "Scotiabank",
    },
    "scotiabank_business": {
        "url": "https://www.scotiabank.com/ca/en/business-banking/banking-solutions/credit-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "Scotiabank",
    },
    "cibc": {
        "url": "https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards.html",
        "country": "CA",
        "method": "web_fetch",  # Blocks Playwright
        "issuer": "CIBC",
    },
    "bmo_personal": {
        "url": "https://www.bmo.com/main/personal/credit-cards/all-cards/",
        "country": "CA",
        "method": "firefox",  # Chromium blocked
        "issuer": "BMO",
    },
    "bmo_business": {
        "url": "https://www.bmo.com/en-ca/main/business/credit-cards/",
        "country": "CA",
        "method": "firefox",
        "issuer": "BMO",
    },
    "nbc_personal": {
        "url": "https://www.nbc.ca/personal/mastercard-credit-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "National Bank",
    },
    "nbc_business": {
        "url": "https://www.nbc.ca/business/credit-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "National Bank",
    },
    "mbna": {
        "url": "https://www.mbna.ca/en/credit-cards/compare-credit-cards",
        "country": "CA",
        "method": "chromium",
        "issuer": "MBNA",
    },
    "tangerine": {
        "url": "https://www.tangerine.ca/en/personal/spend/credit-cards",
        "country": "CA",
        "method": "chromium",
        "issuer": "Tangerine",
    },
    "rogers": {
        "url": "https://www.rogersbank.com/en/compare_cards",
        "country": "CA",
        "method": "chromium",
        "issuer": "Rogers",
    },
    "wealthsimple": {
        "url": "https://www.wealthsimple.com/en-ca/credit-card",
        "country": "CA",
        "method": "firefox",
        "issuer": "Wealthsimple",
    },
    "neo": {
        "url": "https://www.neofinancial.com/credit-cards",
        "country": "CA",
        "method": "chromium",
        "issuer": "Neo Financial",
    },
    "simplii": {
        "url": "https://www.simplii.com/en/credit-cards/cash-back-visa.html",
        "country": "CA",
        "method": "firefox",  # Chromium blocked
        "issuer": "Simplii Financial",
    },
    "pc_financial": {
        "url": "https://www.pcfinancial.ca/en/credit-cards/",
        "country": "CA",
        "method": "firefox",  # Chromium blocked
        "issuer": "PC Financial",
    },
    "ctfs": {
        "url": "https://www.ctfs.com/content/ctfs3/en/homepage.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "Canadian Tire",
    },
    "desjardins": {
        "url": "https://www.desjardins.com/qc/en/credit-cards.html",
        "country": "CA",
        "method": "chromium",
        "issuer": "Desjardins",
    },
    # US Banks
    "amex_us_personal": {
        "url": "https://www.americanexpress.com/us/credit-cards/?category=all",
        "country": "US",
        "method": "chromium",
        "issuer": "American Express",
    },
    "amex_us_business": {
        "url": "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/",
        "country": "US",
        "method": "chromium",
        "issuer": "American Express",
    },
    "chase_personal": {
        "url": "https://creditcards.chase.com/all-credit-cards?CELL=6TKV",
        "country": "US",
        "method": "chromium",
        "issuer": "Chase",
    },
    "chase_business": {
        "url": "https://creditcards.chase.com/business-credit-cards",
        "country": "US",
        "method": "chromium",
        "issuer": "Chase",
    },
}


def fetch_page(url: str, method: str = "chromium") -> str:
    """Fetch page content using the appropriate method."""
    if method == "web_fetch":
        ctx = ssl.create_default_context()
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")

    if not HAS_PLAYWRIGHT:
        raise RuntimeError("Playwright required but not installed")

    with sync_playwright() as p:
        if method == "firefox":
            browser = p.firefox.launch(headless=True)
        else:
            browser = p.chromium.launch(headless=True)

        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)

        # Accept cookies if prompted
        try:
            page.click("button:has-text('Accept')", timeout=3000)
            page.wait_for_timeout(2000)
        except:
            pass

        # Scroll to load lazy content
        for _ in range(8):
            page.keyboard.press("End")
            page.wait_for_timeout(800)

        text = page.inner_text("body")
        browser.close()
        return text


def make_slug(name: str) -> str:
    """Generate a URL-safe slug from a card name."""
    slug = name.lower()
    slug = re.sub(r'[®™*†¤§‡♦◊]+', '', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def parse_fee(fee_str: str) -> float:
    """Parse annual fee string to numeric value."""
    if not fee_str:
        return 0.0
    fee_str = fee_str.replace(",", "")
    match = re.search(r'\$(\d+(?:\.\d+)?)', fee_str)
    if match:
        return float(match.group(1))
    if "no annual fee" in fee_str.lower() or fee_str == "$0":
        return 0.0
    return 0.0


def to_website_schema(card: dict, issuer: str, country: str) -> dict:
    """Convert scraped card data to the website's expected schema."""
    name = card.get("name", "Unknown Card")
    fee_str = card.get("annual_fee", "$0")
    fee = parse_fee(fee_str)

    # Detect network
    name_lower = name.lower()
    if "visa" in name_lower:
        network = "Visa"
    elif "mastercard" in name_lower:
        network = "Mastercard"
    elif "american express" in name_lower or "amex" in name_lower:
        network = "American Express"
    else:
        network = "Unknown"

    # Detect card type
    card_type = card.get("type", "personal")
    is_business = card_type == "business" or "business" in name_lower

    # Detect rewards type
    if "cash back" in name_lower or "cashback" in name_lower or "dividend" in name_lower:
        rtype = "cashback"
    elif any(k in name_lower for k in ["aeroplan", "avion", "aventura", "travel", "passport", "points", "rewards", "scene", "bonvoy", "hilton", "delta", "united", "southwest"]):
        rtype = "rewards"
    elif "low rate" in name_lower or "low interest" in name_lower or "preferred rate" in name_lower:
        rtype = "low_interest"
    else:
        rtype = "rewards"

    # Parse interest rate
    rate_str = card.get("interest_purchases") or card.get("interest_rates") or None
    purchase_rate = None
    if rate_str:
        match = re.search(r'(\d+\.?\d*)%', rate_str)
        if match:
            purchase_rate = float(match.group(1))

    return {
        "slug": make_slug(name),
        "name": name,
        "issuer": issuer,
        "network": network,
        "card_type": rtype,
        "annual_fee": fee,
        "first_year_fee": None,
        "welcome_bonus": card.get("welcome_bonus", ""),
        "welcome_bonus_value_cad": None,
        "welcome_bonus_conditions": None,
        "min_spend": None,
        "purchase_interest_rate": purchase_rate,
        "cash_advance_rate": None,
        "balance_transfer_rate": None,
        "earn_rates": {},
        "rewards_program": None,
        "foreign_transaction_fee": None,
        "foreign_transaction_fee_pct": None,
        "key_perks": card.get("features", []),
        "insurance": {},
        "minimum_income": None,
        "minimum_credit_score": None,
        "country": country,
        "sources": [BANKS.get(card.get("_bank_key", ""), {}).get("url", "")],
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "card_image_url": None,
        "pot_first_year_value": None,
        "pot_rewards_valuation_cpp": None,
        "pot_url": None,
        "historical_offers": [],
        "apply_url": None,
        "is_business": is_business,
    }


def build_comprehensive_databases():
    """Build comprehensive CA and US databases from individual bank files."""
    ca_cards = []
    us_cards = []

    for bank_key, config in BANKS.items():
        filename = f"{bank_key}_cards.json"
        filepath = DATA_DIR / filename
        if not filepath.exists():
            # Try alternate naming
            alt_names = [
                f"{config['issuer'].lower().replace(' ', '_')}_canada_cards.json",
                f"{bank_key}.json",
            ]
            for alt in alt_names:
                if (DATA_DIR / alt).exists():
                    filepath = DATA_DIR / alt
                    break

        if not filepath.exists():
            print(f"  SKIP {bank_key}: no data file found")
            continue

        raw_cards = json.load(open(filepath))
        issuer = config["issuer"]
        country = config["country"]

        for card in raw_cards:
            card["_bank_key"] = bank_key
            converted = to_website_schema(card, issuer, country)
            if country == "CA":
                ca_cards.append(converted)
            else:
                us_cards.append(converted)

    return ca_cards, us_cards


def save_databases(ca_cards, us_cards):
    """Save comprehensive databases to both data/ and website/src/data/."""
    # Save to data/
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_DIR / "canadian_cards_comprehensive.json", "w") as f:
        json.dump(ca_cards, f, indent=2)
    with open(DATA_DIR / "us_cards_comprehensive.json", "w") as f:
        json.dump(us_cards, f, indent=2)

    # Save to website/src/data/
    WEBSITE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(WEBSITE_DATA_DIR / "canadian_cards_comprehensive.json", "w") as f:
        json.dump(ca_cards, f, indent=2)
    with open(WEBSITE_DATA_DIR / "us_cards_comprehensive.json", "w") as f:
        json.dump(us_cards, f, indent=2)

    print(f"\n✅ Saved {len(ca_cards)} CA cards + {len(us_cards)} US cards")


def main():
    parser = argparse.ArgumentParser(description="ChurningCanada Bank Card Scraper")
    parser.add_argument("--bank", help="Scrape a specific bank")
    parser.add_argument("--all", action="store_true", help="Scrape all banks")
    parser.add_argument("--build", action="store_true", help="Build comprehensive DBs from existing bank files")
    args = parser.parse_args()

    if args.build:
        print("Building comprehensive databases from existing bank files...")
        ca, us = build_comprehensive_databases()
        save_databases(ca, us)
        return

    if not args.all and not args.bank:
        parser.print_help()
        return

    banks_to_scrape = BANKS if args.all else {args.bank: BANKS[args.bank]}

    for bank_key, config in banks_to_scrape.items():
        print(f"\n{'='*50}")
        print(f"Scraping: {bank_key} ({config['issuer']})")
        print(f"  URL: {config['url']}")
        print(f"  Method: {config['method']}")

        try:
            text = fetch_page(config["url"], config["method"])
            print(f"  Fetched: {len(text)} chars")

            # Save raw text for debugging
            raw_dir = DATA_DIR / "raw"
            raw_dir.mkdir(parents=True, exist_ok=True)
            with open(raw_dir / f"{bank_key}_raw.txt", "w") as f:
                f.write(text)

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    print("\nScraping complete. Run with --build to rebuild databases.")


if __name__ == "__main__":
    main()
