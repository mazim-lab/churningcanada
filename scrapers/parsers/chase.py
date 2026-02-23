"""Chase US Personal and Business parsers."""
import re


def parse_chase_business(text: str, headings: list[str]) -> list[dict]:
    """Parse Chase Business cards. Needs headings from h2/h3 with 'Links to product page'."""
    card_names = [re.sub(r'Links to product page$', '', h).strip() for h in headings if "Links to product page" in h]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    cards = []
    card_idx = 0
    i = 0
    while i < len(lines):
        if lines[i] == "ANNUAL FEE" and card_idx < len(card_names):
            card = {"name": card_names[card_idx], "type": "business"}
            if i + 1 < len(lines):
                fee = lines[i + 1]
                if "Opens pricing" in fee and i + 2 < len(lines):
                    fee = lines[i + 2]
                card["annual_fee"] = fee
            j = i - 1
            while j >= 0 and j > i - 20:
                if "AT A GLANCE" in lines[j] and j + 1 < len(lines):
                    card["at_a_glance"] = lines[j + 1]
                    break
                j -= 1
            j = i - 1
            while j >= 0 and j > i - 20:
                if any(k in lines[j].lower() for k in ["bonus point", "bonus mile", "cash back", "earn up to"]):
                    card["welcome_bonus"] = lines[j]
                    break
                if "NEW CARDMEMBER OFFER" in lines[j] and j + 1 < len(lines):
                    card["welcome_bonus"] = lines[j + 1]
                    break
                j -= 1
            j = i - 1
            while j >= 0 and j > i - 10:
                if "%" in lines[j] and "APR" in lines[j]:
                    card["interest_purchases"] = lines[j]
                    break
                j -= 1
            cards.append(card)
            card_idx += 1
        i += 1
    return cards


def parse_chase_personal(text: str, headings: list[str]) -> list[dict]:
    """Parse Chase Personal cards (all cards page includes business too)."""
    card_names = [re.sub(r'Links to product page$', '', h).strip() for h in headings if "Links to product page" in h]
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    cards = []
    card_idx = 0
    i = 0
    while i < len(lines):
        if lines[i] == "ANNUAL FEE" and card_idx < len(card_names):
            card = {"name": card_names[card_idx]}
            if i + 1 < len(lines):
                fee = lines[i + 1]
                if "Opens pricing" in fee and i + 2 < len(lines):
                    fee = lines[i + 2]
                card["annual_fee"] = fee
            j = i - 1
            while j >= 0 and j > i - 20:
                if any(k in lines[j].lower() for k in ["bonus point", "bonus mile", "cash back", "earn up to", "bonus points"]):
                    card["welcome_bonus"] = lines[j]
                    break
                if "NEW CARDMEMBER OFFER" in lines[j] and j + 1 < len(lines):
                    card["welcome_bonus"] = lines[j + 1]
                    break
                j -= 1
            j = i - 1
            while j >= 0 and j > i - 10:
                if "%" in lines[j] and "APR" in lines[j]:
                    card["interest_purchases"] = lines[j]
                    break
                j -= 1
            name_lower = card["name"].lower()
            card["type"] = "business" if any(k in name_lower for k in ["business", "ink "]) else "personal"
            cards.append(card)
            card_idx += 1
        i += 1
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique
