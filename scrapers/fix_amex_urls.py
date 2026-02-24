#!/usr/bin/env python3
"""Fix Amex CA card URLs to point to individual detail pages."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
BASE = "https://www.americanexpress.com"

# Mapping: card name substring → detail page path
AMEX_CA_URLS = {
    "The Platinum Card": "/en-ca/charge-cards/the-platinum-card",
    "Business Gold Rewards": "/en-ca/charge-cards/small-business-gold-card",
    "Gold Rewards Card": "/en-ca/credit-cards/gold-rewards-card",
    "Marriott Bonvoy® Business": "/en-ca/credit-cards/marriott-bonvoy-business-card",
    "Marriott Bonvoy": "/en-ca/credit-cards/marriott-bonvoy-card",
    "Aeroplan®* Business Reserve": "/en-ca/credit-cards/aeroplan-business-reserve-card",
    "Aeroplan®* Reserve": "/en-ca/credit-cards/aeroplan-reserve",
    "Aeroplan®* Card": "/en-ca/charge-cards/aeroplan-card",
    "Business Platinum": "/en-ca/charge-cards/small-business-platinum-card",
    "Cobalt": "/en-ca/credit-cards/cobalt-card",
    "Green Card": "/en-ca/credit-cards/green-card",
    "SimplyCash® Preferred": "/en-ca/credit-cards/simply-cash-preferred",
    "SimplyCash® Card": "/en-ca/credit-cards/simply-cash",
    "Essential": "/en-ca/credit-cards/essential-credit-card",
}

with open(DATA_DIR / "canadian_cards_comprehensive.json") as f:
    cards = json.load(f)

fixed = 0
for card in cards:
    if card.get("issuer") != "American Express":
        continue
    name = card["name"]
    for substr, path in AMEX_CA_URLS.items():
        if substr in name:
            old_url = card.get("apply_url", "")
            new_url = BASE + path
            if old_url != new_url:
                card["apply_url"] = new_url
                print(f"  {name[:55]:55s} → {path}")
                fixed += 1
            break
    else:
        print(f"  ⚠ No match: {name}")

with open(DATA_DIR / "canadian_cards_comprehensive.json", "w") as f:
    json.dump(cards, f, indent=2)

print(f"\nFixed {fixed} Amex CA URLs")
