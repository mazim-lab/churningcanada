import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8')); byslug={c['slug']:c for c in us}
JOBS=['marriott-bonvoy-bevy-american-express-card','marriott-bonvoy-brilliant-american-express-card','hilton-honors-american-express-aspire-card',
 'ink-business-unlimited-credit-card','ink-business-preferred-credit-card','ink-business-cash-credit-card']
def render(br,url):
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(4000)
    last=0
    for it in range(25):
        pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(800)
        h=pg.evaluate("document.body.scrollHeight")
        if h==last and it>4: break
        last=h
    pg.wait_for_timeout(1500)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
def ok(t): return len(t)>30000 and len(t) not in (63714,64965)
man=[]
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    for slug in JOBS:
        url=byslug[slug].get('apply_url'); done=False
        for br,nm in ((cr,'cr'),(ff,'ff')):
            try:
                t=render(br,url)
                if ok(t):
                    mp='data/raw/cards/us-'+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug]['name'],'country':'US','md_path':mp}); print(f"OK {slug} ({len(t)}) [{nm}]",flush=True); done=True; break
                else: print(f"thin {slug} {len(t)} [{nm}]",flush=True)
            except Exception as e: print(f"err {slug} [{nm}] {type(e).__name__}: {str(e)[:50]}",flush=True)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
        time.sleep(3)
    cr.close(); ff.close()
json.dump({'entries':man},open('data/raw/cards/manifest_render3.json','w'),indent=2)
print('resolved',len(man))
