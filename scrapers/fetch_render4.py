import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8')); byslug={c['slug']:c for c in us}
# Amex (eval blocked) -> keyboard scroll; Chase -> eval scroll
AMEX=['marriott-bonvoy-bevy-american-express-card','marriott-bonvoy-brilliant-american-express-card','hilton-honors-american-express-aspire-card']
CHASE=['ink-business-cash-credit-card']
def render_kbd(br,url):  # no eval
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(5000)
    for _ in range(40): pg.keyboard.press('End'); pg.wait_for_timeout(500)
    pg.wait_for_timeout(2000)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
def render_eval(br,url):
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(4000)
    last=0
    for it in range(30):
        pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(900)
        h=pg.evaluate("document.body.scrollHeight")
        if h==last and it>5: break
        last=h
    pg.wait_for_timeout(1500)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
man=[]
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    for slug in AMEX:
        url=byslug[slug].get('apply_url'); done=False
        for br in (ff,cr):
            try:
                t=render_kbd(br,url)
                if len(t)>30000 and len(t) not in (63714,64965):
                    Path('data/raw/cards/us-'+slug+'.md').write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug]['name'],'country':'US','md_path':'data/raw/cards/us-'+slug+'.md'}); print(f"OK {slug} ({len(t)})",flush=True); done=True; break
                else: print(f"thin {slug} {len(t)}",flush=True)
            except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
        time.sleep(3)
    for slug in CHASE:
        url=byslug[slug].get('apply_url'); done=False
        for attempt in range(3):
            try:
                t=render_eval(cr,url)
                if len(t)>40000:
                    Path('data/raw/cards/us-'+slug+'.md').write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug]['name'],'country':'US','md_path':'data/raw/cards/us-'+slug+'.md'}); print(f"OK {slug} ({len(t)})",flush=True); done=True; break
                else: print(f"thin {slug} {len(t)} a{attempt}",flush=True); time.sleep(5)
            except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
    cr.close(); ff.close()
json.dump({'entries':man},open('data/raw/cards/manifest_render4.json','w'),indent=2)
print('resolved',len(man))
