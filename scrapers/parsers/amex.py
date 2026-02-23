"""Amex Canada, US Personal, US Business parsers."""
import re


def parse_amex_canada(text: str) -> list[dict]:
    """Parse Amex Canada cards page (domcontentloaded + 5s wait)."""
    blocks = text.split("Apply Now")
    cards = []
    for block in blocks:
        if "Annual Fee" not in block and "Card Fee" not in block and "No annual fee" not in block.lower():
            continue
        lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
        card = {}
        for i, line in enumerate(lines):
            if line == "Compare Card" and i + 1 < len(lines):
                name = lines[i + 1]
                if i + 2 < len(lines) and not any(k in lines[i + 2] for k in ["Annual Fee", "Card Fee", "No annual", "Interest"]):
                    name += " " + lines[i + 2]
                card["name"] = name.strip()
                break
        for line in lines:
            if "Annual Fee:" in line:
                card["annual_fee"] = line.split("Annual Fee:")[-1].strip()
                break
            elif "Card Fee:" in line:
                card["annual_fee"] = line.split("Card Fee:")[-1].strip()
                break
            elif "no annual fee" in line.lower():
                card["annual_fee"] = "$0"
                break
        for line in lines:
            if "Welcome Bonus" in line or "bonus" in line.lower():
                card["welcome_bonus"] = line.strip()
                break
        features = []
        in_features = False
        for line in lines:
            if "Featured Benefits" in line:
                in_features = True
                continue
            if in_features:
                if line in ("Footnotes", "Apply Now", "Learn More"):
                    break
                if len(line) > 10:
                    features.append(line)
        card["features"] = features
        card["type"] = "personal"
        if card.get("name"):
            cards.append(card)
    return cards


def parse_amex_us_personal(text: str, headings: list[str]) -> list[dict]:
    """Parse Amex US Personal cards page. Needs headings from h2/h3."""
    card_names = [re.sub(r'Links to product page$', '', h).strip() for h in headings if "Links to product page" in h]
    blocks = re.split(r'Apply Now\s*\n\s*View Details\s*\n\s*Add to Compare', text)
    cards = []
    card_idx = 0
    for block in blocks:
        if "Annual Fee" not in block and "No Annual Fee" not in block:
            continue
        if card_idx >= len(card_names):
            break
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"name": card_names[card_idx], "type": "personal"}
        card_idx += 1
        for i, line in enumerate(lines):
            if re.match(r'(Annual Fee:|No Annual Fee)', line):
                j = i - 1
                while j >= 0 and lines[j] in ("♦︎ ‡ † Offer & Benefit Terms", "Link will open in a new tab.", "¤ Rates and Fees"):
                    j -= 1
                card["annual_fee"] = line
                break
        for i, line in enumerate(lines):
            if "AS HIGH AS" in line:
                bonus = line
                if i + 1 < len(lines):
                    bonus += " " + lines[i + 1]
                card["welcome_bonus"] = bonus
                break
            elif "Earn Up To" in line:
                card["welcome_bonus"] = line
                break
        features = []
        in_feat = False
        for line in lines:
            if "Show More Benefits" in line:
                in_feat = True
                continue
            if in_feat:
                if any(k in line for k in ["Welcome Offer", "AS HIGH AS", "Earn Up To", "Apply and find"]):
                    break
                if len(line) > 15:
                    features.append(line)
        card["features"] = features
        cards.append(card)
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique


def parse_amex_us_business(text: str) -> list[dict]:
    """Parse Amex US Business cards page."""
    blocks = re.split(r'¤Rates & Fees', text)
    cards = []
    for block in blocks:
        if "Annual Fee" not in block:
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"type": "business"}
        for line in lines:
            if len(line) > 3 and line not in ("Apply Now", "View Details", "Add to Compare", "Link will open in a new tab."):
                card["name"] = line
                break
        for line in lines:
            if "Annual Fee" in line:
                card["annual_fee"] = line
                break
        for i, line in enumerate(lines):
            if "AS HIGH AS" in line:
                bonus = line
                if i + 1 < len(lines):
                    bonus += " " + lines[i + 1]
                card["welcome_bonus"] = bonus
                break
            elif any(k in line for k in ["Earn Up To", "Earn up to"]):
                card["welcome_bonus"] = line
                break
        features = []
        in_feat = False
        for line in lines:
            if "Show More Benefits" in line or "Featured Benefits" in line:
                in_feat = True
                continue
            if in_feat:
                if any(k in line for k in ["Welcome Offer", "AS HIGH AS", "Earn Up To", "Apply"]):
                    break
                if len(line) > 15:
                    features.append(line)
        card["features"] = features
        if card.get("name") and card.get("annual_fee"):
            # Filter out junk first entry
            if "Know if" not in card.get("name", ""):
                cards.append(card)
    return cards
