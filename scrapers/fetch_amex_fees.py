import re, os, tempfile
from playwright.sync_api import sync_playwright
CARDS=[("cobalt","https://www.americanexpress.com/en-ca/credit-cards/cobalt-card/"),
 ("simplycash-preferred","https://www.americanexpress.com/en-ca/credit-cards/simply-cash-preferred-card/")]
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
with sync_playwright() as p:
    b=p.firefox.launch(headless=True)
    for slug,url in CARDS:
        try:
            pg=b.new_page(user_agent=UA,viewport={"width":1280,"height":1000})
            pg.goto(url,wait_until="domcontentloaded",timeout=45000);pg.wait_for_timeout(6000)
            for _ in range(5): pg.keyboard.press("End");pg.wait_for_timeout(300)
            t=pg.inner_text("body")
            hits=re.findall(r'(?i)\$\s?[0-9]+(?:\.[0-9]{2})?\s*(?:/\s*month|per month|monthly|a month|/year|per year|annually|annual)', t)
            seen=[]
            for h in hits:
                h=re.sub(r'\s+',' ',h).strip()
                if h not in seen: seen.append(h)
            print("### "+slug);
            for h in seen[:8]: print("   ",h)
            pg.close()
        except Exception as e: print("### "+slug+" ERR "+str(e))
    b.close()
