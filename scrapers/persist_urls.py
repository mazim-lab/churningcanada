import json
from pathlib import Path
A="https://www.americanexpress.com/us/credit-cards/card/"
AB="https://www.americanexpress.com/us/credit-cards/business/business-credit-cards/"
TD="https://www.td.com/ca/en/personal-banking/products/credit-cards/"
S="https://www.scotiabank.com/ca/en/personal/credit-cards/"
SB="https://www.scotiabank.com/ca/en/small-business/business-banking/credit-cards/"
DESJ="https://www.desjardins.com/en/credit-cards/"
URLS={
 # TD
 'td-aeroplan-visa-infinite-card':TD+'aeroplan/aeroplan-visa-infinite-card',
 'td-aeroplan-visa-infinite-privilege-credit-card':TD+'aeroplan/aeroplan-visa-infinite-privilege-card',
 'td-aeroplan-visa-platinum-credit-card':TD+'aeroplan/aeroplan-visa-platinum-card',
 'td-rewards-visa-card':TD+'travel-rewards/rewards-visa-card',
 # US Amex personal (confirmed working slugs)
 'platinum-card':A+'platinum/','american-express-gold-card':A+'gold-card/','american-express-green-card':A+'green/',
 'blue-cash-preferred-card':A+'blue-cash-preferred/','blue-cash-everyday-card':A+'blue-cash-everyday/',
 'hilton-honors-american-express-card':A+'hilton-honors/','hilton-honors-american-express-surpass-card':A+'hilton-honors-surpass/',
 'hilton-honors-american-express-aspire-card':A+'hilton-honors-aspire/',
 'delta-skymiles-gold-american-express-card':A+'delta-skymiles-gold-american-express-card/',
 'delta-skymiles-platinum-american-express-card':A+'delta-skymiles-platinum-american-express-card/',
 'delta-skymiles-reserve-american-express-card':A+'delta-skymiles-reserve-american-express-card/',
 'delta-skymiles-blue-american-express-card':A+'delta-skymiles-blue-american-express-card/',
 'marriott-bonvoy-bevy-american-express-card':A+'marriott-bonvoy-bevy/','marriott-bonvoy-brilliant-american-express-card':A+'marriott-bonvoy-brilliant/',
 # US Amex business
 'business-platinum-card':AB+'american-express-business-platinum-credit-card-amex/',
 'business-gold-card':AB+'american-express-business-gold-card-amex/',
 'business-green-rewards-card':AB+'american-express-business-green-card-amex/',
 'blue-business-cashtm-card':AB+'american-express-blue-business-credit-card-amex/',
 'blue-business-plus-credit-card':AB+'american-express-blue-business-plus-credit-card-amex/',
 'marriott-bonvoy-business-card':AB+'amex-marriott-bonvoy-business-credit-card/',
 'hilton-honors-business-card':AB+'hilton-honors-american-express-business-credit-card-amex/',
 'delta-skymiles-reserve-business-card':'https://www.americanexpress.com/en-us/business/credit-cards/delta-skymiles-reserve/',
 'delta-skymiles-platinum-business-card':'https://www.americanexpress.com/en-us/business/credit-cards/delta-skymiles-platinum/',
 # Scotia
 'scotia-momentum-no-fee-visa-card-for-students':S+'visa/student-scotia-momentum-no-fee-visa.html',
 'scotia-momentum-for-business-visa-card':SB+'scotia-momentum-for-business-visa-credit-card.html',
 'scotiabank-passport-visa-infinite-business-card':SB+'scotiabank-passport-visa-infinite-business-card.html',
 'scotialine-for-business-visa-credit-card':SB+'scotialine-for-business-visa-credit-card.html',
 'scotia-home-hardware-pro-visa-business-card':SB+'scotia-home-hardware-pro-visa-business-credit-card.html',
 # NBC
 'national-bank-platinum-business-mastercard':'https://www.nbc.ca/en/business/credit-cards/platinum-mastercard.html',
 'national-bank-business-line-mastercard':'https://www.nbc.ca/en/business/credit-cards/mastercard-line-credit.html',
 # RBC
 'rbc-cash-back-mastercard':'https://www.rbcroyalbank.com/credit-cards/cash-back-credit-card/cash-back-mastercard/',
 'rbc-u-s-dollar-visa-gold':'https://www.rbcroyalbank.com/credit-cards/rewards-credit-cards/us-dollar-credit-card.html',
 'rbc-rateadvantage-visa':'https://www.rbcroyalbank.com/credit-cards/low-interest-rate-credit-card/rate-advantage.html',
 'rbc-avion-visa-platinum':'https://www.rbcroyalbank.com/credit-cards/travel-credit-cards/platinum-avion.html',
 'rbc-avion-visa-infinite-privilege':'https://www.rbcroyalbank.com/credit-cards/travel/rbc-avion-visa-infinite-privilege.html',
 'rbc-avion-visa-business':'https://www.rbcroyalbank.com/business/credit-cards/small-business-credit-cards/rbc-avion-visa-business.html',
 'westjet-rbc-mastercard':'https://www.rbcroyalbank.com/credit-cards/travel-credit-cards/westjet-world-mastercard.html',
 # BMO
 'bmo-ascend-world-elite-business-mastercard':'https://www.bmo.com/en-ca/main/business/credit-cards/bmo-ascend-world-elite-business-mastercard/',
 'student-bmo-cashback-mastercard':'https://www.bmo.com/en-ca/main/personal/credit-cards/bmo-cashback-mastercard-for-students/',
 # CIBC
 'cibc-aventura-gold-visa-card':'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/aventura-gold-visa-card.html',
 # Chase
 'ink-business-preferred-credit-card':'https://creditcards.chase.com/business-credit-cards/ink/business-preferred',
 'ink-business-cash-credit-card':'https://creditcards.chase.com/business-credit-cards/ink/cash',
 'ink-business-unlimited-credit-card':'https://creditcards.chase.com/business-credit-cards/ink/unlimited',
 'ink-business-premier-credit-card':'https://creditcards.chase.com/business-credit-cards/ink/premier',
}
# Desjardins (slug pattern)
for s in ['desjardins-flexi-visa','desjardins-cash-back-visa','desjardins-cash-back-mastercard','desjardins-bonus-visa','desjardins-cash-back-world-elite-mastercard','desjardins-odyssey-gold-visa','desjardins-odyssey-world-elite-mastercard','desjardins-odyssey-visa-infinite-privilege']:
    URLS[s]=DESJ+s.replace('desjardins-','')+'.html'
# merge this-batch URLs
bf=Path('data/raw/cards/resolved_urls_batch.json')
if bf.exists(): URLS.update(json.load(open(bf)))
applied=0
for fn in ('src/data/canadian_cards_comprehensive.json','src/data/us_cards_comprehensive.json'):
    cards=json.load(open(fn,encoding='utf-8'))
    for c in cards:
        if c['slug'] in URLS: c['apply_url']=URLS[c['slug']]; applied+=1
    json.dump(cards,open(fn,'w',encoding='utf-8'),indent=2,ensure_ascii=True)
json.dump(URLS,open('data/raw/cards/resolved_urls.json','w'),indent=2)
print(f'wrote apply_url for {applied} cards; saved resolved_urls.json ({len(URLS)} entries)')
