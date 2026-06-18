import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
BB="https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/"
CARD="https://www.americanexpress.com/us/credit-cards/card/"
# candidates per card (try in order)
CAND={
 'business-platinum-card':[BB+'american-express-business-platinum-credit-card-amex/'],
 'business-gold-card':[BB+'american-express-business-gold-credit-card-amex/'],
 'business-green-rewards-card':[BB+'american-express-business-green-rewards-credit-card-amex/',BB+'american-express-business-green-credit-card-amex/'],
 'blue-business-cashtm-card':[BB+'american-express-blue-business-cash-credit-card-amex/',BB+'blue-business-cash-credit-card-amex/'],
 'blue-business-plus-credit-card':[BB+'american-express-blue-business-plus-credit-card-amex/',BB+'blue-business-plus-credit-card-amex/'],
 'delta-skymiles-reserve-business-card':[BB+'delta-skymiles-reserve-business-credit-card-amex/',BB+'american-express-delta-skymiles-reserve-business-credit-card-amex/'],
 'delta-skymiles-platinum-business-card':[BB+'delta-skymiles-platinum-business-credit-card-amex/',BB+'american-express-delta-skymiles-platinum-business-credit-card-amex/'],
 'marriott-bonvoy-business-card':[BB+'marriott-bonvoy-business-credit-card-amex/',BB+'american-express-marriott-bonvoy-business-credit-card-amex/'],
 'hilton-honors-business-card':[BB+'hilton-honors-business-credit-card-amex/',BB+'american-express-hilton-honors-business-credit-card-amex/'],
 'amazon-business-prime-card':[BB+'amazon-business-prime-american-express-card-amex/',BB+'amazon-business-prime-credit-card-amex/'],
 'amazon-business-card':[BB+'amazon-business-american-express-card-amex/',BB+'amazon-business-credit-card-amex/'],
 'plum-card':[BB+'american-express-business-plum-card-amex/',BB+'the-plum-card-amex/'],
 # retry personal throttled ones
 'marriott-bonvoy-bevy-american-express-card':[CARD+'marriott-bonvoy-bevy-american-express-card/'],
 'marriott-bonvoy-brilliant-american-express-card':[CARD+'marriott-bonvoy-brilliant-american-express-card/'],
}
us=json.load(open('src/data/us_cards_comprehensive.json',encoding='utf-8')); byslug={c['slug']:c for c in us}
def fetch(br,url):
    pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=40000); pg.wait_for_timeout(4500)
    for _ in range(8): pg.keyboard.press('End'); pg.wait_for_timeout(300)
    t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close(); return t
def real(t): return len(t)>8000 and len(t) not in (63714,64965)
man=[]
with sync_playwright() as p:
    b=p.firefox.launch(headless=True)
    for i,(slug,urls) in enumerate(CAND.items(),1):
        done=False
        for url in urls:
            for attempt in range(2):
                try:
                    t=fetch(b,url)
                    if real(t):
                        mp='data/raw/cards/us-'+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                        man.append({'slug':slug,'name':byslug[slug]['name'],'country':'US','md_path':mp})
                        print(f"[{i}/14] OK {slug} ({len(t)}) <- {url.split('/')[-2][:40]}",flush=True); done=True; break
                    elif len(t) in (63714,64965):
                        print(f"[{i}/14] throttled {slug}, wait",flush=True); time.sleep(16)
                    else:
                        print(f"[{i}/14] thin {slug} {len(t)} <- {url.split('/')[-2][:30]}",flush=True); break
                except Exception as e: print(f"[{i}/14] err {slug} {type(e).__name__}",flush=True); time.sleep(8)
            if done: break
            time.sleep(4)
        if not done: print(f"[{i}/14] UNRESOLVED {slug}",flush=True)
        time.sleep(6)
    b.close()
Path('data/raw/cards/manifest_usbiz.json').write_text(json.dumps(man,indent=2),encoding='utf-8')
print('resolved',len(man),'/',len(CAND))
