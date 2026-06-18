#!/usr/bin/env python3
"""Fetch each card's DETAIL page (apply_url) -> markdown, for benefits extraction.
Residential IP + per-domain method (banks block datacenter HTTP). Skips cards whose
apply_url is a generic listing page (no per-card detail). Writes data/raw/cards/<slug>.md
+ data/raw/cards/manifest.json. Long-running; run in background."""
import json, re, ssl, sys, urllib.request, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "raw" / "cards"
OUT.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

GENERIC = ('browse-all', 'all-credit-cards.html', 'compare-cards.html', 'all-cards/view-cards',
           'view-cards/', '/credit-cards/all-cards/', 'category=all')
def is_generic(u):
    u = (u or '').lower()
    return (not u) or any(g in u for g in GENERIC) or u.rstrip('/').endswith('/credit-cards')

def method_for(url):
    u = url.lower()
    if 'cibc.com' in u: return 'web_fetch'
    if any(d in u for d in ('bmo.com', 'simplii.com', 'pcfinancial.ca', 'wealthsimple.com')): return 'firefox'
    return 'chromium'

def fetch_html(url, method, pw):
    if method == 'web_fetch':
        ctx = ssl.create_default_context()
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            return r.read().decode('utf-8', 'ignore')
    eng = pw.firefox if method == 'firefox' else pw.chromium
    b = eng.launch(headless=True)
    try:
        pg = b.new_page(); pg.set_default_navigation_timeout(35000)
        pg.goto(url, wait_until='domcontentloaded'); pg.wait_for_timeout(3500)
        for _ in range(5):
            pg.keyboard.press('End'); pg.wait_for_timeout(500)
        return pg.content()
    finally:
        b.close()

cards = (json.load(open(ROOT / 'src/data/canadian_cards_comprehensive.json', encoding='utf-8'))
         + json.load(open(ROOT / 'src/data/us_cards_comprehensive.json', encoding='utf-8')))
targets, seen = [], set()
for c in cards:
    u = c.get('apply_url')
    if not u or is_generic(u) or c['slug'] in seen:
        continue
    seen.add(c['slug']); targets.append(c)

print(f"Fetching {len(targets)} card detail pages...", flush=True)
md = MarkItDown()
manifest = []
with sync_playwright() as pw:
    for i, c in enumerate(targets, 1):
        slug, url = c['slug'], c['apply_url']
        m = method_for(url)
        try:
            html = fetch_html(url, m, pw)
            text = md.convert_stream(__import__('io').BytesIO(html.encode('utf-8')), file_extension='.html').text_content
            if len(text) < 400:
                print(f"[{i}/{len(targets)}] SKIP {slug} (thin {len(text)})", flush=True); continue
            (OUT / f"{slug}.md").write_text(text, encoding='utf-8')
            manifest.append({'slug': slug, 'name': c['name'], 'country': c['country'], 'md_path': str(OUT / f"{slug}.md").replace('\\', '/')})
            print(f"[{i}/{len(targets)}] OK {slug} ({m}, {len(text)})", flush=True)
        except Exception as e:
            print(f"[{i}/{len(targets)}] FAIL {slug} ({m}): {type(e).__name__}", flush=True)
        time.sleep(0.2)
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f"\nDONE: {len(manifest)} pages saved to data/raw/cards/", flush=True)
