import re
from playwright.sync_api import sync_playwright
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
url="https://www.americanexpress.com/en-ca/credit-cards/simply-cash-preferred"
with sync_playwright() as p:
    b=p.firefox.launch(headless=True)
    pg=b.new_page(user_agent=UA);pg.goto(url,wait_until="domcontentloaded",timeout=45000);pg.wait_for_timeout(6000)
    for _ in range(5): pg.keyboard.press("End");pg.wait_for_timeout(300)
    t=pg.inner_text("body")
    hits=re.findall(r'(?i)\$\s?[0-9]+(?:\.[0-9]{2})?\s*(?:/\s*month|per month|monthly|a month|/year|annually)', t)
    print('simplycash-pref:', list(dict.fromkeys([re.sub(r'\s+',' ',h).strip() for h in hits]))[:8])
    b.close()
