import json, io, re, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
ca=json.load(open('src/data/canadian_cards_comprehensive.json',encoding='utf-8'))
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8'))
byslug={c['slug']:(('CA',c) if c in ca else ('US',c)) for c in ca}; 
byslug={}
for c in ca: byslug[c['slug']]=('CA',c)
for c in us: byslug[c['slug']]=('US',c)
TARGETS={
 'rbc-cash-back-mastercard':'cr','marriott-bonvoy-bevy-american-express-card':'ff','marriott-bonvoy-brilliant-american-express-card':'ff',
 'hilton-honors-american-express-aspire-card':'ff','blue-business-cashtm-card':'ff','blue-business-plus-credit-card':'ff',
 'business-green-rewards-card':'ff','ink-business-unlimited-credit-card':'cr','ink-business-preferred-credit-card':'cr','ink-business-cash-credit-card':'cr',
}
URLU={'aeroplan-card':'https://creditcards.chase.com/travel-credit-cards/aeroplan'}
def render(br,url):
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(5000)
    h=pg.evaluate("document.body.scrollHeight")
    for y in range(0,h+3000,500): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(250)
    pg.wait_for_timeout(1500)
    for kw in ['Benefits','benefit','Coverage','Insurance','Protection','See more','Learn more','Show']:
        try:
            for el in pg.get_by_text(re.compile(kw,2)).all()[:8]:
                try: el.click(timeout=1000); pg.wait_for_timeout(300)
                except: pass
        except: pass
    pg.wait_for_timeout(1200)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
man=[]
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    jobs=[(s,e,byslug[s][1].get('apply_url')) for s,e in TARGETS.items()]
    jobs.append(('aeroplan-card','cr',URLU['aeroplan-card']))
    for slug,eng,url in jobs:
        if not url: print(f"no url {slug}"); continue
        try:
            t=render(ff if eng=='ff' else cr,url)
            if len(t)>9000 and len(t) not in (63714,64965,56920):
                country=byslug[slug][0]; pre='us-' if country=='US' else ''
                mp='data/raw/cards/'+pre+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                man.append({'slug':slug,'name':byslug[slug][1]['name'],'country':country,'md_path':mp}); print(f"OK {slug} ({len(t)})",flush=True)
            else: print(f"thin {slug} {len(t)}",flush=True)
        except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
        time.sleep(4)
    cr.close(); ff.close()
json.dump({'entries':man},open('data/raw/cards/manifest_render.json','w'),indent=2)
print('resolved',len(man))
