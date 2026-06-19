import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
ca=json.load(open('src/data/canadian_cards_comprehensive.json',encoding='utf-8'))
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8'))
byslug={}
for c in ca: byslug[c['slug']]=('CA',c)
for c in us: byslug[c['slug']]=('US',c)
ENG={'rbc-cash-back-mastercard':'cr','marriott-bonvoy-bevy-american-express-card':'ff','marriott-bonvoy-brilliant-american-express-card':'ff',
 'hilton-honors-american-express-aspire-card':'ff','blue-business-cashtm-card':'ff','blue-business-plus-credit-card':'ff','business-green-rewards-card':'ff',
 'ink-business-unlimited-credit-card':'cr','ink-business-preferred-credit-card':'cr','ink-business-cash-credit-card':'cr'}
EXTRA={'aeroplan-card':('cr',['https://creditcards.chase.com/rewards-credit-cards/aeroplan','https://creditcards.chase.com/cardmember-benefits/aeroplan'])}
def render(br,url):
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(5000)
    h=pg.evaluate("document.body.scrollHeight")
    for y in range(0,h+4000,400): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(250)
    pg.wait_for_timeout(2500)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
def ok(t): return len(t)>9000 and len(t) not in (63714,64965,56920)
man=[]
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    jobs=[(s,e,[byslug[s][1].get('apply_url')]) for s,e in ENG.items()]
    jobs+=[(s,e,urls) for s,(e,urls) in EXTRA.items()]
    for slug,eng,urls in jobs:
        done=False
        for url in urls:
            if not url: continue
            try:
                t=render(ff if eng=='ff' else cr,url)
                if ok(t):
                    country=byslug[slug][0]; pre='us-' if country=='US' else ''
                    mp='data/raw/cards/'+pre+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug][1]['name'],'country':country,'md_path':mp}); print(f"OK {slug} ({len(t)})",flush=True); done=True; break
                else: print(f"thin {slug} {len(t)}",flush=True)
            except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
            time.sleep(3)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
        time.sleep(4)
    cr.close(); ff.close()
json.dump({'entries':man},open('data/raw/cards/manifest_render2.json','w'),indent=2)
print('resolved',len(man))
