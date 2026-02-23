#!/usr/bin/env python3
"""
Scrape ALL 228 cards from CreditCardGenius by intercepting API calls
with all filters removed. Uses Playwright to manipulate the UI filters.
"""

import json
from playwright.sync_api import sync_playwright

captured_cards = {}  # slug -> card dict (dedup)


def main():
    def handle_response(response):
        if "/api/v2/card/cards" in response.url:
            try:
                body = response.json()
                if isinstance(body, list):
                    for card in body:
                        if isinstance(card, dict) and "slug" in card:
                            captured_cards[card["slug"]] = card
                    print(f"  API response: {len(body)} cards (total unique: {len(captured_cards)})")
            except:
                pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        page.on("response", handle_response)

        # Load page
        print("Loading credit cards page...")
        page.goto("https://creditcardgenius.ca/credit-cards/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(5000)
        print(f"After initial load: {len(captured_cards)} unique cards")

        # Try to remove all filters by navigating to specific category pages
        categories = [
            "/credit-cards/category/best",
            "/credit-cards/category/cash-back",
            "/credit-cards/category/travel",
            "/credit-cards/category/no-annual-fee",
            "/credit-cards/category/low-interest",
            "/credit-cards/category/student",
            "/credit-cards/category/business",
            "/credit-cards/category/secured",
            "/credit-cards/network/visa",
            "/credit-cards/network/mastercard",
            "/credit-cards/network/amex",
            "/credit-cards/bank/td",
            "/credit-cards/bank/rbc",
            "/credit-cards/bank/cibc",
            "/credit-cards/bank/scotiabank",
            "/credit-cards/bank/bmo",
            "/credit-cards/bank/american-express",
            "/credit-cards/bank/mbna",
            "/credit-cards/bank/tangerine",
            "/credit-cards/bank/neo-financial",
            "/credit-cards/bank/hsbc",
            "/credit-cards/bank/national-bank",
            "/credit-cards/bank/desjardins",
            "/credit-cards/bank/home-trust",
            "/credit-cards/bank/capital-one",
            "/credit-cards/bank/rogers",
            "/credit-cards/bank/canadian-tire",
            "/credit-cards/bank/brim",
            "/credit-cards/bank/koho",
            "/credit-cards/bank/simplii",
            "/credit-cards/bank/pc-financial",
            "/credit-cards/bank/eq-bank",
            "/credit-cards/bank/wealthsimple",
        ]

        for cat_path in categories:
            url = f"https://creditcardgenius.ca{cat_path}"
            print(f"\nLoading: {cat_path}...")
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(2000)
                
                # Click Show All if available
                try:
                    btn = page.query_selector('text="Show All Cards"') or page.query_selector('text="Show More Cards"')
                    if btn:
                        btn.click()
                        page.wait_for_timeout(2000)
                except:
                    pass
                
            except Exception as e:
                print(f"  Error: {e}")
                continue

        print(f"\n{'='*60}")
        print(f"TOTAL UNIQUE CARDS CAPTURED: {len(captured_cards)}")
        print(f"{'='*60}")

        browser.close()

    # Process and save
    cards = list(captured_cards.values())
    
    # Clean and normalize
    clean_cards = []
    for c in cards:
        clean = {
            "slug": c.get("slug", ""),
            "name": c.get("titleAttribute", ""),
            "issuer": c.get("issuer", ""),
            "network": c.get("network", ""),
            "card_type": categorize_card(c),
            "annual_fee": c.get("annualFee"),
            "first_year_fee": c.get("firstYearFee"),
            "purchase_interest_rate": c.get("purchaseInterestRate"),
            "cash_advance_interest_rate": c.get("cashAdvanceInterestRate"),
            "balance_transfer_interest_rate": c.get("balanceTransferInterestRate"),
            "signup_bonus": c.get("signUpBonus"),
            "signup_bonus_formatted": c.get("signUpBonusFormatted"),
            "signup_bonus_value_cad": c.get("signUpBonusValue"),
            "welcome_bonus_conditions": c.get("welcomeBonus", ""),
            "annual_rewards_value": None,
            "genius_rating": c.get("geniusRating"),
            "return_on_spending_pct": c.get("returnOnSpending"),
            "rewards_description": c.get("rewardsValue", []),
            "reward_program": c.get("rewardProgramSlug", ""),
            "provinces": c.get("provinces", []),
            "instant_approval": c.get("instantApproval"),
            "image_url": c.get("imageUrl", ""),
            "card_image": c.get("cardImage", ""),
            "pros": c.get("pros", []),
            "cons": c.get("cons", []),
            "perks": c.get("perks", []),
            "insurance": c.get("insurance", []),
            "country": "CA",
            "source": "creditcardgenius",
            "url": f"https://creditcardgenius.ca/credit-cards/{c.get('slug', '')}",
        }
        
        # Extract annual rewards value from rewardsValue if available
        rv = c.get("rewardsValue")
        if isinstance(rv, list) and rv:
            # Try to find a dollar value
            pass
        
        clean_cards.append(clean)
    
    # Sort by genius rating
    clean_cards.sort(key=lambda x: x.get("genius_rating") or 0, reverse=True)
    
    output = "../data/canadian_cards.json"
    with open(output, "w") as f:
        json.dump(clean_cards, f, indent=2)
    
    print(f"\nSaved {len(clean_cards)} cards to {output}")
    
    # Summary
    issuers = {}
    types = {}
    for c in clean_cards:
        issuers[c["issuer"] or "Unknown"] = issuers.get(c["issuer"] or "Unknown", 0) + 1
        types[c["card_type"]] = types.get(c["card_type"], 0) + 1
    
    print("\nBy issuer:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    
    print("\nBy type:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")


def categorize_card(card):
    """Determine card type from card data."""
    name = (card.get("titleAttribute", "") or "").lower()
    slug = (card.get("slug", "") or "").lower()
    combined = name + " " + slug
    
    if any(w in combined for w in ["cash-back", "cashback", "simplycash", "dividend", "momentum", "smart-cash"]):
        return "cashback"
    elif any(w in combined for w in ["low-rate", "low-interest", "true-line", "select-visa", "value-visa", "adapta"]):
        return "low-rate"
    elif "student" in combined:
        return "student"
    elif "secured" in combined or "guaranteed" in combined:
        return "secured"
    elif "business" in combined:
        return "business"
    elif "prepaid" in combined:
        return "prepaid"
    elif any(w in combined for w in ["aeroplan", "avion", "aventura", "passport", "travel",
                                      "first-class", "marriott", "bonvoy", "cobalt",
                                      "gold-reward", "platinum", "viporter", "ascend",
                                      "eclipse", "green-card", "scene"]):
        return "travel"
    else:
        return "rewards"


if __name__ == "__main__":
    main()
