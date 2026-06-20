import re, sys, os, tempfile
from playwright.sync_api import sync_playwright

OUT = os.path.join(tempfile.gettempdir(), "amex_offers")
os.makedirs(OUT, exist_ok=True)

CARDS = [
    ("marriott-bonvoy-bevy", "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-bevy/"),
    ("marriott-bonvoy-brilliant", "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-brilliant/"),
    ("hilton-honors", "https://www.americanexpress.com/us/credit-cards/card/hilton-honors/"),
    ("hilton-honors-surpass", "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-surpass/"),
    ("green", "https://www.americanexpress.com/us/credit-cards/card/green/"),
    ("hilton-honors-aspire", "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-aspire/"),
    ("delta-blue", "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-blue-american-express-card/"),
    ("blue-business-plus", "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-blue-business-plus-credit-card-amex/"),
    ("delta-reserve-biz", "https://www.americanexpress.com/en-us/business/credit-cards/delta-skymiles-reserve/"),
    ("business-green", "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-business-green-card-amex/"),
    ("delta-platinum-biz", "https://www.americanexpress.com/en-us/business/credit-cards/delta-skymiles-platinum/"),
    ("marriott-bonvoy-business", "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/amex-marriott-bonvoy-business-credit-card/"),
    ("hilton-honors-business", "https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/hilton-honors-american-express-business-credit-card-amex/"),
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"

with sync_playwright() as p:
    browser = p.firefox.launch(headless=True)
    for slug, url in CARDS:
        try:
            page = browser.new_page(user_agent=UA, viewport={"width": 1280, "height": 1000})
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(6500)  # let the solicitation-offer API populate
            for _ in range(6):
                page.keyboard.press("End"); page.wait_for_timeout(350)
            txt = page.inner_text("body")
            hits = re.findall(r'(?i)(?:earn|welcome offer|new cardmember|as high as|up to)[^.\n]{0,130}(?:points|miles)', txt)
            seen = []
            for h in hits:
                h = re.sub(r'\s+', ' ', h).strip()
                if h not in seen: seen.append(h)
            print(f"### {slug}  (len {len(txt)})")
            for h in seen[:4]:
                print("   ", h[:150])
            try:
                with open(os.path.join(OUT, f"{slug}.txt"), "w", encoding="utf-8") as f:
                    f.write(txt)
            except Exception:
                pass
            page.close()
        except Exception as e:
            print(f"### {slug}  ERROR: {e}")
    browser.close()
