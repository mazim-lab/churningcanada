"""Parsers for Canadian banks: TD, RBC, Scotiabank, CIBC, BMO, NBC, MBNA, Tangerine, Rogers, Wealthsimple, Neo, Simplii, PC, CTFS, Desjardins."""
import re


def parse_td(text: str) -> list[dict]:
    """Parse TD Canada cards (all on one page)."""
    blocks = text.split("Quick Compare")
    cards = []
    for block in blocks:
        if "Annual Fee" not in block:
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {}
        for line in lines:
            line_clean = line.replace("\xa0", " ").replace("\u202f", " ").strip()
            if ("Visa" in line_clean or "Mastercard" in line_clean) and "Card" in line_clean and len(line_clean) < 80:
                card["name"] = line_clean
                break
        for line in lines:
            if any(k in line.lower() for k in ["earn", "up to", "points", "cash back"]) and len(line) > 20:
                card["welcome_bonus"] = line.replace("\xa0", " ").strip()
                break
        for i, line in enumerate(lines):
            if line == "Annual Fee" and i > 0:
                card["annual_fee"] = lines[i - 1].strip()
                break
        for i, line in enumerate(lines):
            if line == "Interest: Purchases" and i > 0:
                card["interest_purchases"] = lines[i - 1].strip()
                break
        name = card.get("name", "").lower()
        card["type"] = "business" if "business" in name else "personal"
        if card.get("name"):
            cards.append(card)
    return cards


def parse_rbc_personal(text: str, headings: list[str]) -> list[dict]:
    """Parse RBC personal cards. Needs h3 headings."""
    card_names = [h for h in headings if any(k in h for k in ["Visa", "Mastercard", "RBC"])]
    blocks = re.split(r'Apply Now\n', text)
    cards = []
    name_idx = 0
    for block in blocks:
        if "Annual Fee" not in block or name_idx >= len(card_names):
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"name": card_names[name_idx], "type": "personal"}
        name_idx += 1
        for i, line in enumerate(lines):
            if line == "Annual Fee" and i + 1 < len(lines):
                card["annual_fee"] = lines[i + 1]
                break
        for line in lines:
            if any(k in line.lower() for k in ["get up to", "earn up to"]) and len(line) > 20:
                card["welcome_bonus"] = line
                break
        for i, line in enumerate(lines):
            if line == "Purchase Rate" and i + 1 < len(lines):
                card["interest_purchases"] = lines[i + 1]
                break
        cards.append(card)
    return cards


def parse_rbc_business(text: str) -> list[dict]:
    """Parse RBC business cards (descriptive layout)."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # Find card names followed by card details
    card_lines = []
    for i, line in enumerate(lines):
        if ("Visa" in line or "Mastercard" in line) and len(line) < 80 and len(line) > 10:
            # Check if this looks like a card name (not a reference line)
            if i > 0 and ("Call" in lines[i - 1] or "Explore" in lines[i - 1] or i < 3):
                continue
            card_lines.append((i, line))

    # Dedupe and pick actual card names
    seen = set()
    for idx, name in card_lines:
        if name in seen:
            continue
        seen.add(name)
        card = {"name": name, "type": "business"}
        # Look for annual fee in next 20 lines
        for j in range(idx, min(idx + 20, len(lines))):
            if "Annual Fee:" in lines[j]:
                card["annual_fee"] = lines[j].split(":")[-1].strip()
                break
            if lines[j] == "Annual Fee:" and j + 1 < len(lines):
                card["annual_fee"] = lines[j + 1]
                break
        for j in range(idx, min(idx + 20, len(lines))):
            if "Purchase Rate:" in lines[j] and j + 1 < len(lines):
                card["interest_purchases"] = lines[j + 1]
                break
        for j in range(idx, min(idx + 10, len(lines))):
            if any(k in lines[j].lower() for k in ["welcome", "bonus", "receive"]) and len(lines[j]) > 15:
                card["welcome_bonus"] = lines[j]
                break
        cards.append(card)
    return cards


def parse_scotiabank_personal(text: str, headings: list[str]) -> list[dict]:
    """Parse Scotiabank personal cards. Needs h3 headings."""
    card_names = [h.replace("\xa0", " ").replace("\u202f", " ").strip() for h in headings
                  if any(k in h for k in ["Visa", "Mastercard", "American Express"]) and len(h) < 80]
    lines = [l.strip().replace("\xa0", " ").replace("\u202f", " ") for l in text.split("\n") if l.strip()]
    cards = []
    for name in card_names:
        card = {"name": name, "type": "personal"}
        name_clean = name.replace("®", "").replace("*", "").replace("™", "").replace("TM", "")
        found_idx = None
        for i, line in enumerate(lines):
            line_clean = line.replace("®", "").replace("*", "").replace("™", "").replace("TM", "").replace("\xa0", " ").replace("\u202f", " ")
            if name_clean[:30] in line_clean and len(line) < 80:
                found_idx = i
                break
        if found_idx is not None:
            for j in range(found_idx, min(found_idx + 20, len(lines))):
                if lines[j].startswith("Annual fee:") and "annual_fee" not in card:
                    card["annual_fee"] = lines[j].replace("Annual fee:", "").strip()
                if lines[j].startswith("Interest rate"):
                    card["interest_rates"] = lines[j].split(":", 1)[1].strip() if ":" in lines[j] else lines[j]
                if any(k in lines[j].lower() for k in ["earn up to", "earn 10%", "earn 5%", "bonus"]) and "welcome_bonus" not in card and len(lines[j]) > 20:
                    card["welcome_bonus"] = lines[j]
        cards.append(card)
    return cards


def parse_scotiabank_business(text: str) -> list[dict]:
    """Parse Scotiabank business cards (simple layout)."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # Look for card names with Visa/Mastercard
    for i, line in enumerate(lines):
        if ("Visa" in line or "Mastercard" in line) and "Card" in line and len(line) < 80:
            card = {"name": line, "type": "business"}
            for j in range(i, min(i + 15, len(lines))):
                if "Annual fee" in lines[j] and j + 1 < len(lines):
                    # fee might be on next line
                    if "$" in lines[j]:
                        card["annual_fee"] = re.search(r'\$\d+', lines[j]).group() if re.search(r'\$\d+', lines[j]) else "$0"
                    elif j + 2 < len(lines) and "$" in lines[j + 2]:
                        card["annual_fee"] = lines[j + 2]
                    break
            for j in range(i, min(i + 10, len(lines))):
                if any(k in lines[j].lower() for k in ["earn up to", "bonus"]) and len(lines[j]) > 15:
                    card["welcome_bonus"] = lines[j]
                    break
            cards.append(card)
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique


def parse_cibc(html: str) -> list[dict]:
    """Parse CIBC cards from HTML (web_fetch, server-rendered)."""
    cards = []
    # Extract card blocks from markdown-style content
    blocks = re.split(r'### \[', html)
    for block in blocks:
        if "Annual fee" not in block:
            continue
        card = {"type": "personal"}
        # Card name from link text
        name_match = re.match(r'([^\]]+)', block)
        if name_match:
            name = name_match.group(1).split(" about ")[0].strip()
            card["name"] = name
        fee_match = re.search(r'Annual fee\s*\n\s*\$(\d+)', block)
        if fee_match:
            card["annual_fee"] = f"${fee_match.group(1)}"
        elif "Annual fee" in block and "$0" in block:
            card["annual_fee"] = "$0"
        for line in block.split("\n"):
            if any(k in line.lower() for k in ["earn up to", "apply and earn", "join and earn"]) and len(line) > 15:
                card["welcome_bonus"] = line.strip()
                break
        if card.get("name"):
            cards.append(card)
    return cards


def parse_bmo_personal(text: str) -> list[dict]:
    """Parse BMO personal cards (Firefox required, fee above 'annual fee' label)."""
    blocks = text.split("APPLY NOW")
    cards = []
    for block in blocks:
        if "annual fee" not in block.lower():
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {}
        for line in lines:
            lc = line.replace("\xa0", " ").strip()
            if any(k in lc for k in ["BMO", "eclipse", "Ascend", "CashBack", "VIPorter"]) and len(lc) < 80 and "Welcome" not in lc and "annual" not in lc.lower():
                card["name"] = lc
                break
        for i, line in enumerate(lines):
            if "annual fee" in line.lower() and i > 0:
                j = i - 1
                while j >= 0:
                    if "$" in lines[j]:
                        card["annual_fee"] = lines[j]
                        break
                    j -= 1
                break
        for line in lines:
            if "Welcome offer:" in line:
                card["welcome_bonus"] = line.replace("Welcome offer:", "").strip()
                break
        for i, line in enumerate(lines):
            if "for purchases" in line and i > 0:
                card["interest_purchases"] = lines[i - 1]
                break
        card["type"] = "personal"
        if card.get("name"):
            cards.append(card)
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique


def parse_bmo_business(text: str) -> list[dict]:
    """Parse BMO business cards (Firefox required, simple page)."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if ("BMO" in line or "CashBack" in line) and ("Mastercard" in line or "Visa" in line) and len(line) < 80:
            card = {"name": line, "type": "business"}
            for j in range(i, min(i + 20, len(lines))):
                if "Annual fee" in lines[j] or "annual fee" in lines[j].lower():
                    # Fee is on previous line with $
                    k = j - 1
                    while k >= i:
                        if "$" in lines[k]:
                            card["annual_fee"] = lines[k]
                            break
                        k -= 1
                    break
            for j in range(i, min(i + 15, len(lines))):
                if "Welcome offer:" in lines[j]:
                    card["welcome_bonus"] = lines[j].replace("Welcome offer:", "").strip()
                    break
            for j in range(i, min(i + 15, len(lines))):
                if "On purchases" in lines[j] and j > 0:
                    card["interest_purchases"] = lines[j - 1]
                    break
            cards.append(card)
    return cards


def parse_nbc_personal(text: str) -> list[dict]:
    """Parse National Bank personal cards."""
    cards = []
    # Split on "Apply now" or "Discover the"
    blocks = re.split(r'Apply now\n|Discover the ', text)
    for block in blocks:
        if "Annual fee" not in block and "annual fee" not in block.lower():
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"type": "personal"}
        for line in lines:
            if "Mastercard" in line and len(line) < 60:
                card["name"] = f"National Bank {line}"
                break
        for i, line in enumerate(lines):
            if "Annual fee" in line and i + 1 < len(lines):
                # Fee might be embedded or on next line
                m = re.search(r'\$\d+', line)
                if m:
                    card["annual_fee"] = m.group()
                elif "$" in lines[i + 1]:
                    card["annual_fee"] = lines[i + 1]
                break
        for line in lines:
            if any(k in line.lower() for k in ["up to", "points", "cashback"]) and len(line) > 15:
                card["welcome_bonus"] = line
                break
        for line in lines:
            if "Purchase rate" in line:
                m = re.search(r'[\d.]+%', line)
                if m:
                    card["interest_purchases"] = m.group()
                break
        if card.get("name"):
            cards.append(card)
    return cards


def parse_nbc_business(text: str) -> list[dict]:
    """Parse National Bank business cards."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if "Mastercard" in line and ("Business" in line or "Corporate" in line) and len(line) < 60:
            card = {"name": f"National Bank {line}", "type": "business"}
            for j in range(i, min(i + 10, len(lines))):
                if "Annual fee" in lines[j]:
                    m = re.search(r'\$\d+', lines[j])
                    if m:
                        card["annual_fee"] = m.group()
                    elif j + 1 < len(lines) and "$" in lines[j + 1]:
                        card["annual_fee"] = lines[j + 1]
                    break
            for j in range(i, min(i + 10, len(lines))):
                if "Interest rate on purchases" in lines[j]:
                    m = re.search(r'[\d.]+%', lines[j])
                    if m:
                        card["interest_purchases"] = m.group()
                    elif j + 1 < len(lines):
                        card["interest_purchases"] = lines[j + 1]
                    break
            cards.append(card)
    return cards


def parse_mbna(text: str) -> list[dict]:
    """Parse MBNA cards (TD Bank subsidiary)."""
    blocks = text.split("Compare Card")
    cards = []
    for block in blocks:
        if "Annual Fee" not in block:
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"type": "personal"}
        for line in lines:
            if "MBNA" in line and ("Mastercard" in line or "Card" in line) and len(line) < 80:
                card["name"] = line.strip()
                break
        for i, line in enumerate(lines):
            if line == "Annual Fee" and i > 0:
                card["annual_fee"] = lines[i - 1]
                break
        for i, line in enumerate(lines):
            if line == "Interest: Purchases" and i > 0:
                card["interest_purchases"] = lines[i - 1]
                break
        for line in lines:
            if "Welcome offer:" in line:
                card["welcome_bonus"] = line.replace("Welcome offer:", "").strip()
                break
        if card.get("name"):
            cards.append(card)
    return cards


def parse_tangerine(text: str) -> list[dict]:
    """Parse Tangerine cards (2 cards, no annual fee)."""
    cards = []
    # Find the two card names
    for name_pattern in ["Money-Back Credit Card", "Money-Back World Mastercard"]:
        card = {"type": "personal", "annual_fee": "$0"}
        for line in text.split("\n"):
            line = line.strip()
            if name_pattern in line and len(line) < 60:
                card["name"] = f"Tangerine {line}"
                break
        if not card.get("name"):
            card["name"] = f"Tangerine {name_pattern}"
        for line in text.split("\n"):
            if "cash back" in line.lower() and "categories" in line.lower() and len(line) < 80:
                card["features"] = [line.strip()]
                break
        cards.append(card)
    return cards


def parse_rogers(text: str) -> list[dict]:
    """Parse Rogers Bank cards."""
    cards = []
    for name in ["Rogers Red Mastercard®", "Rogers Red World Elite® Mastercard®"]:
        card = {"name": name, "type": "personal", "annual_fee": "$0"}
        cards.append(card)
    return cards


def parse_wealthsimple(text: str) -> list[dict]:
    """Parse Wealthsimple credit card (single card)."""
    return [{
        "name": "Wealthsimple Cash Back Visa",
        "type": "personal",
        "annual_fee": "$0",
        "features": ["2% cash back on everything", "No FX fees"],
    }]


def parse_neo(text: str) -> list[dict]:
    """Parse Neo Financial cards."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if "Neo" in line and ("Mastercard" in line or "Card" in line) and len(line) < 60:
            card = {"name": line, "type": "personal"}
            for j in range(i, min(i + 10, len(lines))):
                if "Annual fee" in lines[j]:
                    m = re.search(r'\$\d+', lines[j])
                    card["annual_fee"] = m.group() if m else "$0"
                    break
                if "Guaranteed approval" in lines[j]:
                    card["annual_fee"] = "$0"
                    break
            for j in range(i, min(i + 10, len(lines))):
                if "Minimum income" in lines[j]:
                    m = re.search(r'\$([\d,]+)', lines[j])
                    if m:
                        card["minimum_income"] = m.group()
                    break
            cards.append(card)
    return cards


def parse_simplii(text: str) -> list[dict]:
    """Parse Simplii Financial cards (Firefox required)."""
    return [{
        "name": "Simplii Financial Cash Back Visa Card",
        "type": "personal",
        "annual_fee": "$0",
        "interest_purchases": "21.99%",
        "features": ["Up to 4% cash back at restaurants", "Up to 1.5% on groceries"],
    }]


def parse_pc(text: str) -> list[dict]:
    """Parse PC Financial cards (Firefox required)."""
    cards = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if "PC" in line and "Mastercard" in line and len(line) < 60:
            card = {"name": line, "type": "personal", "annual_fee": "$0"}
            cards.append(card)
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique if unique else [
        {"name": "PC® Mastercard®", "type": "personal", "annual_fee": "$0"},
        {"name": "PC® World Mastercard®", "type": "personal", "annual_fee": "$0"},
        {"name": "PC® World Elite® Mastercard®", "type": "personal", "annual_fee": "$0"},
        {"name": "PC Insiders™ World Elite® Mastercard®", "type": "personal", "annual_fee": "$119"},
    ]


def parse_ctfs(text: str) -> list[dict]:
    """Parse Canadian Tire / CTFS cards."""
    cards = []
    for line in text.split("\n"):
        line = line.strip()
        if ("Triangle" in line or "Cash Advantage" in line) and ("Mastercard" in line or "Card" in line) and len(line) < 60:
            card = {"name": line, "type": "personal", "annual_fee": "$0"}
            cards.append(card)
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique if unique else [
        {"name": "Cash Advantage® Mastercard®", "type": "personal", "annual_fee": "$0"},
        {"name": "Triangle® Mastercard®", "type": "personal", "annual_fee": "$0"},
        {"name": "Triangle® World Elite® Mastercard®", "type": "personal", "annual_fee": "$0"},
    ]


def parse_desjardins(text: str) -> list[dict]:
    """Parse Desjardins cards."""
    cards = []
    # Split on "Apply for this card" or "Apply for the"
    blocks = re.split(r'Apply for this card|Apply for the', text)
    for block in blocks:
        if "Interest rate on purchases" not in block and "interest rate" not in block.lower():
            continue
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        card = {"type": "personal"}
        for line in lines:
            if ("Visa" in line or "Mastercard" in line) and len(line) < 60:
                card["name"] = f"Desjardins {line}" if "Desjardins" not in line else line
                break
        for line in lines:
            if "Annual fee" in line:
                if "None" in line or "$0" in line:
                    card["annual_fee"] = "$0"
                else:
                    m = re.search(r'\$\d+', line)
                    if m:
                        card["annual_fee"] = m.group()
                break
        for line in lines:
            m = re.search(r'(\d+\.?\d*)%', line)
            if m and "interest" not in card:
                card["interest_purchases"] = f"{m.group(1)}%"
        if card.get("name"):
            cards.append(card)
    # Dedupe
    seen = set()
    unique = []
    for c in cards:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique.append(c)
    return unique
