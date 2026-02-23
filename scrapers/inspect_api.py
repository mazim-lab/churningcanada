#!/usr/bin/env python3
import json

with open("../data/ccgenius_api_raw.json") as f:
    cards = json.load(f)

print(f"Total cards from API: {len(cards)}")

slugs = set()
for c in cards:
    if isinstance(c, dict):
        slugs.add(c.get("slug", ""))
print(f"Unique slugs: {len(slugs)}")

if cards:
    c = cards[0]
    print(f"\nSample card: {c.get('titleAttribute', '?')}")
    print(f"  Slug: {c.get('slug')}")
    print(f"  Annual Fee: {c.get('annualFee')}")
    print(f"  First Year Fee: {c.get('firstYearFee')}")
    print(f"  Purchase Rate: {c.get('purchaseInterestRate')}")
    print(f"  Cash Advance Rate: {c.get('cashAdvanceInterestRate')}")
    print(f"  Sign Up Bonus: {c.get('signUpBonus')} ({c.get('signUpBonusFormatted')})")
    print(f"  Sign Up Bonus Value: ${c.get('signUpBonusValue')}")
    wb = c.get('welcomeBonus', '') or ''
    print(f"  Welcome Bonus: {wb[:100]}")
    print(f"  Genius Rating: {c.get('geniusRating')}")
    print(f"  Network: {c.get('network')}")
    print(f"  Issuer: {c.get('issuer')}")
    print(f"  Card Type: {c.get('cardType')}")
    print(f"  Return on Spending: {c.get('returnOnSpending')}%")
    img = c.get('imageUrl', '') or ''
    print(f"  Image: {img[:80]}")
    print(f"  Provinces: {c.get('provinces')}")
    print(f"  Rewards: {c.get('rewardsValue')}")
    print(f"  Reward Program: {c.get('rewardProgramSlug')}")

    # Show issuers and networks across all cards
    issuers = {}
    networks = {}
    card_types = {}
    for card in cards:
        if isinstance(card, dict):
            i = card.get('issuer', 'Unknown') or 'Unknown'
            n = card.get('network', 'Unknown') or 'Unknown'
            t = card.get('cardType', 'Unknown') or 'Unknown'
            issuers[i] = issuers.get(i, 0) + 1
            networks[n] = networks.get(n, 0) + 1
            card_types[t] = card_types.get(t, 0) + 1

    print(f"\nIssuers:")
    for k, v in sorted(issuers.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

    print(f"\nNetworks:")
    for k, v in sorted(networks.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

    print(f"\nCard Types:")
    for k, v in sorted(card_types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

    # Show all card names
    print(f"\nAll cards:")
    for card in sorted(cards, key=lambda x: x.get('geniusRating', 0) if isinstance(x, dict) else 0, reverse=True):
        if isinstance(card, dict):
            name = card.get('titleAttribute', '?')
            fee = card.get('annualFee', '?')
            bonus = card.get('signUpBonusValue', '?')
            rating = card.get('geniusRating', '?')
            issuer = card.get('issuer', '?')
            print(f"  [{rating}] {name} | {issuer} | Fee: ${fee} | Bonus: ${bonus}")
