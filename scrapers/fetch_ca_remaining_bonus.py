import re, os, tempfile
from playwright.sync_api import sync_playwright
OUT=os.path.join(tempfile.gettempdir(),"ca_offers");os.makedirs(OUT,exist_ok=True)
CARDS=[
 ("td-rewards","https://www.td.com/ca/en/personal-banking/products/credit-cards/travel-rewards/rewards-visa-card","firefox"),
 ("bmo-ascend","https://www.bmo.com/en-ca/main/personal/credit-cards/bmo-ascend-world-elite-mastercard/","firefox"),
 ("cibc-aventura-student","https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/aventura-visa-for-students.html","firefox"),
 ("cibc-adapta-student","https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/adapta-mastercard-for-students.html","firefox"),
]
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
with sync_playwright() as p:
    b=p.firefox.launch(headless=True)
    for slug,url,_ in CARDS:
        try:
            pg=b.new_page(user_agent=UA,viewport={"width":1280,"height":1000})
            pg.goto(url,wait_until="domcontentloaded",timeout=45000);pg.wait_for_timeout(6000)
            for _ in range(6): pg.keyboard.press("End");pg.wait_for_timeout(300)
            t=pg.inner_text("body")
            with open(os.path.join(OUT,slug+".txt"),"w",encoding="utf-8") as f: f.write(t)
            hits=re.findall(r'(?i)(?:earn|welcome|bonus|get|up to|value of)[^.\n]{0,120}(?:points|\$[0-9,]+)',t)
            seen=[]
            for h in hits:
                h=re.sub(r'\s+',' ',h).strip()
                if h not in seen: seen.append(h)
            print("### "+slug+" (len "+str(len(t))+")")
            for h in seen[:5]: print("   ",h[:150])
            pg.close()
        except Exception as e: print("### "+slug+" ERROR: "+str(e))
    b.close()
