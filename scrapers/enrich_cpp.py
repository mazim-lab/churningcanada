#!/usr/bin/env python3
"""
Enrich Canadian card data with cents-per-point valuations and first-year values.

CPP sources:
  - Prince of Travel (Q3 2025)
  - Milesopedia (Jan 2025)

We take the average of both sources where available, or whichever is available.
"""

import json, re, os, sys

# CPP valuations in CAD cents per point
# Format: program_key -> cpp_cad
# Using Prince of Travel (PoT) and Milesopedia (MO) averages
CPP_VALUATIONS = {
    # Bank programs
    "membership rewards":       1.95,  # PoT 2.2, MO 1.7 → avg
    "amex membership rewards":  1.95,
    "bmo rewards":              0.67,  # Both agree
    "rbc avion":                1.80,  # PoT 2.0, MO 1.6 → avg
    "rbc rewards":              1.80,
    "scene+":                   1.00,  # Both agree
    "scene plus":               1.00,
    "td rewards":               0.50,  # Both agree
    "cibc aventura":            1.10,  # PoT 1.0, MO 1.2 → avg
    "aventura":                 1.10,
    "national bank":            0.95,  # PoT 1.0, MO 0.9 → avg
    "nbc rewards":              0.95,
    "mbna rewards":             1.00,  # Both agree
    "desjardins bonusdollars":  1.00,  # MO $1/pt, effectively 100 cpp but it's dollars

    # Airline programs
    "aeroplan":                 2.05,  # PoT 2.1, MO 2.0 → avg
    "air miles":                10.50, # PoT only (per mile)
    "westjet rewards":          1.00,  # Both agree
    "viporter":                 1.50,  # PoT only

    # Hotel programs
    "marriott bonvoy":          0.80,  # PoT 0.8
    "hilton honors":            0.70,  # PoT 0.7

    # Cash back (1 point = 1 cent)
    "cash back":                1.00,
    "cashback":                 1.00,
    "pc optimum":               0.70,  # ~$0.007/pt (1000 pts = $1 at Loblaws, but often 1500/$1)
    "triangle rewards":         0.50,  # ~0.5 cpp rough estimate
    "ct money":                 0.50,
}

def detect_program(card):
    """Detect the rewards program from card fields."""
    name = (card.get("name") or "").lower()
    issuer = (card.get("issuer") or "").lower()
    bonus = (card.get("welcome_bonus") or "").lower()
    program = (card.get("rewards_program") or "").lower()

    # Check explicit program field first
    if program:
        for key in CPP_VALUATIONS:
            if key in program:
                return key, CPP_VALUATIONS[key]

    # Amex
    if "american express" in issuer or "amex" in issuer:
        if "aeroplan" in name:
            return "aeroplan", CPP_VALUATIONS["aeroplan"]
        if "marriott" in name or "bonvoy" in name:
            return "marriott bonvoy", CPP_VALUATIONS["marriott bonvoy"]
        if "hilton" in name:
            return "hilton honors", CPP_VALUATIONS["hilton honors"]
        if "air miles" in name:
            return "air miles", CPP_VALUATIONS["air miles"]
        # Default Amex = Membership Rewards
        return "membership rewards", CPP_VALUATIONS["membership rewards"]

    # TD
    if "td" in issuer:
        if "aeroplan" in name:
            return "aeroplan", CPP_VALUATIONS["aeroplan"]
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        return "td rewards", CPP_VALUATIONS["td rewards"]

    # RBC
    if "rbc" in issuer:
        if "avion" in name:
            return "rbc avion", CPP_VALUATIONS["rbc avion"]
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        if "westjet" in name:
            return "westjet rewards", CPP_VALUATIONS["westjet rewards"]
        return "rbc rewards", CPP_VALUATIONS["rbc rewards"]

    # Scotiabank
    if "scotiabank" in issuer or "scotia" in issuer:
        if "scene" in name or "scene" in bonus:
            return "scene+", CPP_VALUATIONS["scene+"]
        if "passport" in name:
            return "scene+", CPP_VALUATIONS["scene+"]  # Passport earns Scene+
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        return "scene+", CPP_VALUATIONS["scene+"]

    # CIBC
    if "cibc" in issuer:
        if "aventura" in name:
            return "cibc aventura", CPP_VALUATIONS["cibc aventura"]
        if "aeroplan" in name:
            return "aeroplan", CPP_VALUATIONS["aeroplan"]
        if "cash back" in name or "dividend" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        return "cibc aventura", CPP_VALUATIONS["cibc aventura"]

    # BMO
    if "bmo" in issuer:
        if "air miles" in name:
            return "air miles", CPP_VALUATIONS["air miles"]
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        if "eclipse" in name:
            return "bmo rewards", CPP_VALUATIONS["bmo rewards"]
        return "bmo rewards", CPP_VALUATIONS["bmo rewards"]

    # National Bank
    if "national bank" in issuer:
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        return "national bank", CPP_VALUATIONS["national bank"]

    # MBNA
    if "mbna" in issuer:
        return "mbna rewards", CPP_VALUATIONS["mbna rewards"]

    # Desjardins
    if "desjardins" in issuer:
        if "cash back" in name:
            return "cash back", CPP_VALUATIONS["cash back"]
        return "desjardins bonusdollars", CPP_VALUATIONS["desjardins bonusdollars"]

    # PC Financial
    if "pc financial" in issuer or "pc " in name.lower():
        return "pc optimum", CPP_VALUATIONS["pc optimum"]

    # Canadian Tire
    if "canadian tire" in issuer or "triangle" in name.lower():
        return "triangle rewards", CPP_VALUATIONS["triangle rewards"]

    # Cash back cards (generic)
    if "cash back" in name or "cashback" in name:
        return "cash back", CPP_VALUATIONS["cash back"]

    # Rogers, Tangerine, etc. are cash back
    if issuer in ("rogers", "tangerine", "simplii financial", "simplii", "wealthsimple", "neo financial"):
        return "cash back", CPP_VALUATIONS["cash back"]

    return None, None


def extract_bonus_points(card):
    """Extract the numeric bonus points from welcome_bonus text."""
    bonus = card.get("welcome_bonus") or ""
    if not bonus:
        return None

    name = (card.get("name") or "").lower()
    issuer = (card.get("issuer") or "").lower()

    program, _ = detect_program(card)

    # Cash back cards: look for dollar amounts but filter out spending caps
    if program in ("cash back", "cashback"):
        matches = re.findall(r'\$\s*([\d,]+(?:\.\d+)?)', bonus)
        if matches:
            vals = [float(m.replace(",", "")) for m in matches]
            reasonable = [v for v in vals if v <= 750]
            if reasonable:
                return max(reasonable)

    # Points-based: look for patterns like "80,000" or "100,000" followed by program keywords
    # Handle garbled text like "80,0004" by cleaning trailing single digits after comma-formatted numbers
    clean_bonus = re.sub(r'(\d{1,3}(?:,\d{3})+)\d(?!\d)', r'\1', bonus)  # "80,0004" → "80,000"
    clean_bonus = re.sub(r'\$[\d,]+(?:\.\d+)?', '', clean_bonus)  # Remove dollar amounts to avoid confusion

    numbers = re.findall(r'([\d,]+(?:\.\d+)?)\s*(?:bonus\s+)?(?:membership rewards|aeroplan|avion|scene|aventura|bmo|points|miles|optimum|air miles|bonvoy|hilton|td rewards|westjet|viporter)', clean_bonus.lower())
    if numbers:
        vals = [float(n.replace(",", "")) for n in numbers]
        # Cap at 500,000 — anything higher is likely a parsing error
        vals = [v for v in vals if v <= 500000]
        if vals:
            return max(vals)

    # Fallback: find numbers in reasonable points range (5000-500000)
    # Use higher floor to avoid picking up years (2025, 2026) or small numbers
    all_nums = [n for n in re.findall(r'(?<!\$)([\d,]+)', clean_bonus) if n.strip(",").strip()]
    big_nums = []
    for n in all_nums:
        try:
            v = float(n.replace(",", ""))
            # Skip years (2020-2030) and very small numbers
            if 2020 <= v <= 2030:
                continue
            if 5000 <= v <= 500000:
                big_nums.append(v)
        except ValueError:
            continue
    if big_nums:
        return max(big_nums)

    # Last resort: "$X in value" / "$X in first-year" patterns (direct dollar amount)
    m_value = re.search(r'\$\s*([\d,]+(?:\.\d+)?)\s*(?:in value|in first[- ]year)', bonus, re.IGNORECASE)
    if m_value:
        val = float(m_value.group(1).replace(",", ""))
        if val <= 5000:
            return val  # Will be treated as direct dollar value

    return None


def is_dollar_value_bonus(card, bonus_pts):
    """Check if the extracted bonus is a direct dollar value (small number from '$X in value')."""
    if bonus_pts is None or bonus_pts >= 5000:
        return False  # Large numbers are points, not dollars
    bonus = (card.get("welcome_bonus") or "")
    return bool(re.search(r'\$\s*[\d,]+(?:\.\d+)?\s*(?:in value|in first[- ]year)', bonus, re.IGNORECASE))


def compute_first_year_value(card, cpp, bonus_points):
    """Compute first year value in CAD dollars."""
    if bonus_points is None:
        return None

    program, _ = detect_program(card)

    # Direct dollar value from bonus text (e.g., CIBC "$1,800 in value")
    if is_dollar_value_bonus(card, bonus_points):
        bonus_value = bonus_points
    # Cash back: bonus_points is already in dollars
    elif program in ("cash back", "cashback"):
        bonus_value = bonus_points
    elif program == "desjardins bonusdollars":
        bonus_value = bonus_points
    elif cpp is None:
        return None
    elif program == "air miles":
        bonus_value = bonus_points * cpp / 100.0
    else:
        bonus_value = bonus_points * cpp / 100.0

    fee = card.get("annual_fee") or 0
    first_year_fee = card.get("first_year_fee")
    if isinstance(first_year_fee, (int, float)):
        effective_fee = first_year_fee
    else:
        effective_fee = fee

    return round(bonus_value - effective_fee, 2)


def enrich_cards(cards):
    """Enrich card list with CPP data and first-year values."""
    enriched = 0
    for card in cards:
        program, cpp = detect_program(card)
        if program:
            card["rewards_program"] = program
            card["cpp_cad"] = cpp

        bonus_pts = extract_bonus_points(card)
        if bonus_pts is not None:
            card["welcome_bonus_points"] = bonus_pts

        fyv = compute_first_year_value(card, cpp, bonus_pts)
        if fyv is not None:
            if is_dollar_value_bonus(card, bonus_pts) or program in ("cash back", "cashback", "desjardins bonusdollars"):
                card["welcome_bonus_value_cad"] = round(bonus_pts, 2)
            elif cpp:
                card["welcome_bonus_value_cad"] = round(bonus_pts * cpp / 100.0, 2)
            card["first_year_value_cad"] = fyv
            enriched += 1

    return enriched


def main():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "src", "data")
    ca_path = os.path.join(data_dir, "canadian_cards_comprehensive.json")

    with open(ca_path) as f:
        cards = json.load(f)

    print(f"Loaded {len(cards)} Canadian cards")

    count = enrich_cards(cards)
    print(f"Enriched {count}/{len(cards)} cards with first-year values")

    # Show results
    print(f"\n{'Card':<55} {'Program':<25} {'CPP':>5} {'Bonus Pts':>10} {'FYV':>8}")
    print("-" * 110)
    for c in sorted(cards, key=lambda x: x.get("first_year_value_cad") or 0, reverse=True):
        fyv = c.get("first_year_value_cad")
        if fyv is not None:
            print(f"{c['name'][:54]:<55} {(c.get('rewards_program') or ''):<25} {c.get('cpp_cad', 0):>5.2f} {c.get('welcome_bonus_points', 0):>10.0f} ${fyv:>7.2f}")

    # Show cards without values
    no_val = [c for c in cards if c.get("first_year_value_cad") is None]
    if no_val:
        print(f"\n--- {len(no_val)} cards without first-year value ---")
        for c in no_val:
            print(f"  {c['name'][:60]:<60} | issuer: {c.get('issuer')} | bonus: {(c.get('welcome_bonus') or 'None')[:60]}")

    if "--write" in sys.argv:
        with open(ca_path, "w") as f:
            json.dump(cards, f, indent=2)
        print(f"\n✅ Written enriched data to {ca_path}")


if __name__ == "__main__":
    main()
