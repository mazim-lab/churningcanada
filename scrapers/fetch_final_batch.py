import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
# slug -> (engine, url, country)
TG={
 'tangerine-money-back-world-mastercard':('cr','https://www.tangerine.ca/en/personal/spend/credit-cards/world-credit-card','CA'),
 'triangle-world-elite-mastercard':('cr','https://triangle.canadiantire.ca/en/credit-cards/triangle-world-elite-mastercard.html','CA'),
 'cash-advantage-mastercard':('cr','https://www.ctfs.com/content/ctfs/en/cards/cash_advantage.html','CA'),
 'hilton-honors-american-express-aspire-card':('ff','https://www.americanexpress.com/us/credit-cards/card/hilton-honors-aspire/','US'),
 'blue-business-plus-credit-card':('ff','https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-blue-business-plus-credit-card-amex/','US'),
 'business-green-rewards-card':('ff','https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/american-express-business-green-card-amex/','US'),
 'marriott-bonvoy-bevy-american-express-card':('ff','https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-bevy/','US'),
 'marriott-bonvoy-brilliant-american-express-card':('ff','https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-brilliant/','US'),
 'ink-business-preferred-credit-card':('crL','https://creditcards.chase.com/business-credit-cards/ink/business-preferred','US'),
 'ink-business-cash-credit-card':('crL','https://creditcards.chase.com/business-credit-cards/ink/cash','US'),
 'ink-business-unlimited-credit-card':('crL','https://creditcards.chase.com/business-credit-cards/ink/unlimited','US'),
 'ink-business-premier-credit-card':('crL','https://creditcards.chase.com/business-credit-cards/ink/premier','US'),
}
ca=json.load(open('src/data/canadian_cards_comprehensive.json',encoding='utf-8'))
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8'))
byslug={c['slug']:c for c in ca+us}
def real(t): return len(t)>7000 and len(t) not in (63714,64965,56920)
man=[]; urls={}
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    for slug,(eng,url,country) in TG.items():
        br=ff if eng=='ff' else cr
        try:
            pg=br.new_page()
            wait='networkidle' if eng=='crL' else 'domcontentloaded'
            try: pg.goto(url,wait_until=wait,timeout=45000)
            except: pg.goto(url,wait_until='domcontentloaded',timeout=40000)
            pg.wait_for_timeout(8000 if eng=='crL' else 4500)
            for _ in range(12): pg.keyboard.press('End'); pg.wait_for_timeout(350)
            t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close()
            if real(t):
                pre='us-' if country=='US' else ''
                mp='data/raw/cards/'+pre+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                man.append({'slug':slug,'name':byslug[slug]['name'],'country':country,'md_path':mp}); urls[slug]=url
                print(f"OK {slug} ({len(t)})",flush=True)
            else: print(f"thin/listing {slug} {len(t)}",flush=True)
        except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
        time.sleep(5)
    cr.close(); ff.close()
json.dump({'entries':man},open('data/raw/cards/manifest_finalbatch.json','w'),indent=2)
json.dump(urls,open('data/raw/cards/resolved_urls_batch.json','w'),indent=2)
print('resolved',len(man))
