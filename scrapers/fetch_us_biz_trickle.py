import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
BB="https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/"
CARD="https://www.americanexpress.com/us/credit-cards/card/"
CAND={
 'business-gold-card':[BB+'american-express-business-gold-credit-card-amex/'],
 'business-green-rewards-card':[BB+'american-express-business-green-rewards-credit-card-amex/'],
 'blue-business-cashtm-card':[BB+'american-express-blue-business-cash-credit-card-amex/'],
 'delta-skymiles-reserve-business-card':[BB+'delta-skymiles-reserve-business-credit-card-amex/'],
 'delta-skymiles-platinum-business-card':[BB+'delta-skymiles-platinum-business-credit-card-amex/'],
 'marriott-bonvoy-business-card':[BB+'marriott-bonvoy-business-credit-card-amex/'],
 'hilton-honors-business-card':[BB+'hilton-honors-business-credit-card-amex/'],
 'amazon-business-prime-card':[BB+'amazon-business-prime-american-express-card-amex/'],
 'amazon-business-card':[BB+'amazon-business-american-express-card-amex/'],
 'plum-card':[BB+'american-express-business-plum-card-amex/'],
 'marriott-bonvoy-bevy-american-express-card':[CARD+'marriott-bonvoy-bevy-american-express-card/'],
 'marriott-bonvoy-brilliant-american-express-card':[CARD+'marriott-bonvoy-brilliant-american-express-card/'],
}
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8')); byslug={c['slug']:c for c in us}
def real(t): return len(t)>8000 and len(t) not in (63714,64965)
man=json.load(open('data/raw/cards/manifest_usbiz.json'))  # start with the 2 valid
have={e['slug'] for e in man}
print("trickle: 60s initial cooldown",flush=True); time.sleep(60)
with sync_playwright() as p:
    b=p.firefox.launch(headless=True)
    for slug,urls in CAND.items():
        if slug in have: continue
        done=False
        for attempt in range(2):
            try:
                pg=b.new_page(); pg.goto(urls[0],wait_until='domcontentloaded',timeout=45000); pg.wait_for_timeout(5000)
                for _ in range(8): pg.keyboard.press('End'); pg.wait_for_timeout(300)
                t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close()
                if real(t):
                    mp='data/raw/cards/us-'+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug]['name'],'country':'US','md_path':mp})
                    print(f"OK {slug} ({len(t)})",flush=True); done=True; break
                else: print(f"throttled {slug} a{attempt} ({len(t)})",flush=True)
            except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
            time.sleep(75)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
        time.sleep(90)
    b.close()
Path('data/raw/cards/manifest_usbiz.json').write_text(json.dumps(man,indent=2),encoding='utf-8')
print("trickle done. total valid:",len(man),flush=True)
