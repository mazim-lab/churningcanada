#!/usr/bin/env python3
"""Local fetch + markitdown step of the card-refresh pipeline.

For each issuer in BANKS, fetch the all-cards page using its configured method
(chromium / firefox / web_fetch — banks block datacenter HTTP, so this must run
from a residential machine), capture the HTML, convert to clean markdown with
markitdown, and write one .md per issuer+country to data/raw/md/. Also writes a
manifest the parse step (consensus agents) iterates over.

Reliable for WELCOME BONUSES (they're in the page text). NOT reliable for annual
fees (often JS-rendered numerals that markitdown drops) — fees are a separate
quarterly/manual check.

Usage: python scrapers/fetch_and_convert.py
"""
import json, ssl, sys, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
from markitdown import MarkItDown

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bank_scraper import BANKS

ROOT = Path(__file__).resolve().parent.parent
MD = ROOT / "data" / "raw" / "md"
MD.mkdir(parents=True, exist_ok=True)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def fetch_html(url, method):
    if method == "web_fetch":
        ctx = ssl.create_default_context()
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            return r.read().decode("utf-8", "ignore")
    with sync_playwright() as p:
        eng = p.firefox if method == "firefox" else p.chromium
        b = eng.launch(headless=True)
        try:
            pg = b.new_page()
            pg.goto(url, wait_until="domcontentloaded", timeout=40000)
            pg.wait_for_timeout(4000)
            for _ in range(6):
                pg.keyboard.press("End"); pg.wait_for_timeout(600)
            return pg.content()
        finally:
            b.close()


# group bank_keys by issuer + country (keeps Amex CA vs US separate)
groups = {}
for bk, cfg in BANKS.items():
    key = cfg["issuer"].lower().replace(" ", "-") + "-" + cfg["country"].lower()
    groups.setdefault(key, {"issuer": cfg["issuer"], "country": cfg["country"], "banks": []})
    groups[key]["banks"].append((bk, cfg))

md = MarkItDown()
manifest = []
for key, g in groups.items():
    parts = []
    for bk, cfg in g["banks"]:
        try:
            html = fetch_html(cfg["url"], cfg["method"])
            text = md.convert_stream(__import__("io").BytesIO(html.encode("utf-8")),
                                     file_extension=".html").text_content
            parts.append(f"\n\n# SOURCE: {bk} ({cfg['url']})\n\n{text}")
            print(f"OK   {bk:24} {cfg['method']:10} html={len(html):>8} md={len(text):>7}")
        except Exception as e:
            print(f"FAIL {bk:24} {cfg['method']:10} {type(e).__name__}: {str(e)[:60]}")
    if parts:
        out = MD / f"{key}.md"
        out.write_text("".join(parts), encoding="utf-8")
        manifest.append({"key": key, "issuer": g["issuer"], "country": g["country"],
                         "md_path": str(out).replace("\\", "/"), "chars": sum(len(p) for p in parts)})

(MD / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(f"\nWrote {len(manifest)} issuer markdown files + manifest.json")
