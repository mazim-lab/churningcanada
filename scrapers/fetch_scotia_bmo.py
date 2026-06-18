import json, io, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown
md=MarkItDown()
S="https://www.scotiabank.com/ca/en/personal/credit-cards"
SB="https://www.scotiabank.com/ca/en/small-business/business-banking/business-credit-cards"
B="https://www.bmo.com/en-ca/main/personal/credit-cards"
BB="https://www.bmo.com/en-ca/main/business/credit-cards"
CAND={
 'scotia-momentum-no-fee-visa-card-for-students':('cr',[S+'/visa/momentum-no-fee-visa-card.html',S+'/visa/momentum-no-fee-visa.html']),
 'scotia-momentum-for-business-visa-card':('cr',[SB+'/momentum-business-visa-card.html',SB+'/momentum-business-visa.html']),
 'scotiabank-passport-visa-infinite-business-card':('cr',[SB+'/passport-visa-infinite-business-card.html',SB+'/passport-visa-infinite-business.html']),
 'scotialine-for-business-visa-credit-card':('cr',[SB+'/scotialine-for-business-visa.html',SB+'/scotialine-for-business-visa-card.html']),
 'scotia-home-hardware-pro-visa-business-card':('cr',[SB+'/home-hardware-pro-visa-business-card.html']),
 'bmo-preferred-rate-mastercard':('ff',[B+'/bmo-preferred-rate-mastercard/']),
 'bmo-u-s-dollar-mastercard':('ff',[B+'/bmo-us-dollar-mastercard/']),
 'student-bmo-cashback-mastercard':('ff',[B+'/bmo-cashback-mastercard-for-students/',B+'/student-bmo-cashback-mastercard/']),
 'bmo-cashback-business-mastercard':('ff',[BB+'/bmo-cashback-business-mastercard/']),
 'bmo-preferred-rate-mastercard2':('ff',[]),
}
ca=json.load(open('src/data/canadian_cards_comprehensive.json',encoding='utf-8')); byslug={c['slug']:c for c in ca}
def real(t): return len(t)>10000 and len(t) not in (56920,63714,64965)
man=[]
with sync_playwright() as p:
    cr=p.chromium.launch(headless=True); ff=p.firefox.launch(headless=True)
    for slug,(eng,urls) in CAND.items():
        if slug not in byslug: continue
        br=ff if eng=='ff' else cr; done=False
        for url in urls:
            try:
                pg=br.new_page(); pg.goto(url,wait_until='domcontentloaded',timeout=40000); pg.wait_for_timeout(5000)
                for _ in range(8): pg.keyboard.press('End'); pg.wait_for_timeout(350)
                t=md.convert_stream(io.BytesIO(pg.content().encode()),file_extension='.html').text_content; pg.close()
                if real(t):
                    mp='data/raw/cards/'+slug+'.md'; Path(mp).write_text(t,encoding='utf-8')
                    man.append({'slug':slug,'name':byslug[slug]['name'],'country':'CA','md_path':mp}); done=True
                    print(f"OK {slug} ({len(t)})",flush=True); break
                else: print(f"thin/listing {slug} {len(t)} <- {url.split('/')[-1][:35]}",flush=True)
            except Exception as e: print(f"err {slug} {type(e).__name__}",flush=True)
            time.sleep(15)
        if not done: print(f"UNRESOLVED {slug}",flush=True)
        time.sleep(15)
    cr.close(); ff.close()
Path('data/raw/cards/manifest_scotia_bmo.json').write_text(json.dumps(man,indent=2),encoding='utf-8')
print('resolved',len(man))
