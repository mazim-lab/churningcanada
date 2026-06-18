#!/usr/bin/env python3
"""
ChurningCanada — LLM-assisted card-data refresh (prototype).

Why this exists
---------------
The old HTML scrapers (`bank_scraper.py`) broke: banks change markup and add
bot-protection, so the per-bank parsers silently went stale. This script takes a
more resilient approach — it fetches each card's issuer page and asks Claude to
extract the volatile fields (annual fee, welcome bonus, earn rates, FX fee) into
a fixed schema. An LLM reading prose is far more robust to layout changes than
CSS selectors.

What it does (and does NOT do)
------------------------------
- Reads the live card list from src/data/<country>_cards_comprehensive.json.
- Fetches each card's source page (apply_url / sources[0]).
- Calls Claude with a strict output schema to extract current offer details.
- Diffs the extraction against the live data and CLASSIFIES each card:
  unchanged | minor | MAJOR | review (low confidence / offer not found / fetch failed).
- Writes a DRAFT file + a human-readable change report under data/llm_extract/.
- It NEVER overwrites src/data. A human reviews the report and applies changes.
  (In CI this runs into a pull request — see .github/workflows/llm-refresh.yml.)

Honest limitations
------------------
- The *fetch* step is still the fragile part: some issuer pages block bots or
  render offers with JavaScript. Those cards are reported as "review" with the
  reason, not silently dropped.
- The LLM can misread a number. That's why output is a draft + flagged report,
  not an auto-merge. Treat MAJOR changes as "verify before shipping".

Setup
-----
    pip install -r scrapers/requirements.txt        # installs `anthropic`
    export ANTHROPIC_API_KEY=sk-ant-...             # your key (a GitHub secret in CI)

Usage
-----
    # Cheap scaffolding test — fetch only, no LLM, no key needed:
    python scrapers/llm_extract.py --country CA --limit 5 --no-llm

    # Real run on a few cards (needs ANTHROPIC_API_KEY):
    python scrapers/llm_extract.py --country CA --limit 10

    # Full refresh (both countries):
    python scrapers/llm_extract.py --all

Model
-----
Defaults to claude-opus-4-8 (most capable). For a cheaper high-volume run you can
set CHURNING_EXTRACT_MODEL=claude-haiku-4-5 (or claude-sonnet-4-6) — extraction
is a task where the smaller models do well and cost ~5x/1.7x less. The choice is
yours; this script does not downgrade automatically.
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DATA = ROOT / "src" / "data"
OUT_DIR = ROOT / "data" / "llm_extract"

DEFAULT_MODEL = os.environ.get("CHURNING_EXTRACT_MODEL", "claude-opus-4-8")

# Approx prices ($/1M tokens) for the cost estimate only — update if they change.
PRICES = {
    "claude-opus-4-8": (5.0, 25.0),
    "claude-sonnet-4-6": (3.0, 15.0),
    "claude-haiku-4-5": (1.0, 5.0),
}

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

MAX_PAGE_CHARS = 14000  # bound tokens per request; offer details are near the top


# ── Page fetching ────────────────────────────────────────────────────────────

def fetch_page_text(url: str, timeout: int = 25) -> tuple[str | None, str]:
    """Fetch a URL and return (clean_text, status). status is 'ok' or an error reason."""
    if not url:
        return None, "no source url"
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        return None, "missing deps (pip install requests beautifulsoup4)"

    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    except Exception as e:  # noqa: BLE001 - network errors are expected and varied
        return None, f"fetch error: {type(e).__name__}"

    if resp.status_code != 200:
        return None, f"http {resp.status_code}"

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    if len(text) < 200:
        return None, "page too short (likely JS-rendered or blocked)"
    return text[:MAX_PAGE_CHARS], "ok"


# ── LLM extraction ───────────────────────────────────────────────────────────

def build_schema():
    """Pydantic schema for the extracted fields. Imported lazily (needs anthropic/pydantic)."""
    from typing import Literal, Optional, List
    from pydantic import BaseModel, Field

    class EarnRate(BaseModel):
        category: str = Field(description="What the rate applies to, e.g. 'dining', 'gas', 'everything else'")
        rate: str = Field(description="The rate as written, e.g. '5x', '2%', '3 points/$1'")

    class CardExtract(BaseModel):
        offer_found: bool = Field(description="True only if THIS card's details are actually present on the page.")
        annual_fee: Optional[float] = Field(description="Annual fee in the card's local currency; 0 for no-fee; null if not stated.")
        welcome_bonus: Optional[str] = Field(description="The headline welcome/signup bonus as written, e.g. '70,000 points'. null if none.")
        welcome_bonus_value_estimate: Optional[float] = Field(description="Approx cash value of the bonus if the page states or clearly implies one; else null. Do NOT invent a valuation.")
        earn_rates: List[EarnRate] = Field(default_factory=list, description="Earn/reward rates listed on the page.")
        no_foreign_transaction_fee: Optional[bool] = Field(description="True if the page says no FX fee; False if it states one; null if unclear.")
        confidence: Literal["high", "medium", "low"] = Field(description="Your confidence in this extraction given the page content.")
        notes: Optional[str] = Field(description="Anything notable: 'offer expired', 'limited-time', 'page is a card list not a detail page', etc.")

    return CardExtract


def extract_card(client, model, card, page_text, schema):
    """Call Claude to extract offer details. Returns (parsed_dict, usage) or (None, None)."""
    name = card.get("name", "Unknown")
    issuer = card.get("issuer", "")
    system = (
        "You extract current credit-card offer details from the text of an issuer's web page. "
        "Only report what is actually on the page. If the specific card is not present (e.g. the "
        "page is a generic list, a 404, or a different card), set offer_found=false and explain in notes. "
        "Never guess fees or bonuses that aren't stated. Prefer the local-currency annual fee."
    )
    user = (
        f"Card to find: {name} (issuer: {issuer}).\n\n"
        f"Page text:\n{page_text}"
    )
    try:
        resp = client.messages.parse(
            model=model,
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": user}],
            output_format=schema,
        )
    except Exception as e:  # noqa: BLE001
        print(f"    ! LLM error for {name}: {type(e).__name__}: {e}", file=sys.stderr)
        return None, None
    return resp.parsed_output.model_dump(), resp.usage


# ── Diffing / classification ─────────────────────────────────────────────────

def _bonus_value(card):
    return card.get("welcome_bonus_value_cad") or card.get("signup_bonus_value_usd") or card.get("pot_first_year_value")


def classify(card, extract):
    """Compare an extraction to the live card. Returns (level, changes:list[str])."""
    if extract is None:
        return "review", ["fetch/extract failed"]
    if not extract.get("offer_found"):
        return "review", [f"offer not found on page ({extract.get('notes') or 'no detail'})"]
    if extract.get("confidence") == "low":
        return "review", ["low confidence extraction"]

    changes = []
    major = False

    cur_fee = card.get("annual_fee")
    new_fee = extract.get("annual_fee")
    if new_fee is not None and cur_fee is not None and abs(float(new_fee) - float(cur_fee)) >= 1:
        changes.append(f"annual_fee {cur_fee} -> {new_fee}")
        major = True

    cur_bonus = (card.get("welcome_bonus") or "").strip()
    new_bonus = (extract.get("welcome_bonus") or "").strip()
    if new_bonus and new_bonus.lower() != cur_bonus.lower():
        changes.append(f"welcome_bonus '{cur_bonus[:40]}' -> '{new_bonus[:40]}'")
        major = True

    cur_val = _bonus_value(card)
    new_val = extract.get("welcome_bonus_value_estimate")
    if new_val and cur_val and abs(float(new_val) - float(cur_val)) / max(float(cur_val), 1) > 0.25:
        changes.append(f"bonus_value ~{cur_val} -> ~{new_val} (>25%)")
        major = True

    if not changes:
        return "unchanged", []
    return ("major" if major else "minor"), changes


# ── Main ─────────────────────────────────────────────────────────────────────

def load_cards(country):
    fn = "canadian_cards_comprehensive.json" if country == "CA" else "us_cards_comprehensive.json"
    return json.load(open(SRC_DATA / fn, encoding="utf-8")), fn


def run_country(country, limit, use_llm, client, model, schema):
    cards, fn = load_cards(country)
    if limit:
        cards = cards[:limit]
    results = []
    totals = {"unchanged": 0, "minor": 0, "major": 0, "review": 0}
    tok_in = tok_out = 0

    print(f"\n=== {country}: {len(cards)} cards from {fn} ===")
    for i, card in enumerate(cards, 1):
        name = card.get("name", "?")
        url = card.get("apply_url") or (card.get("sources") or [None])[0]
        page, status = fetch_page_text(url)
        print(f"[{i}/{len(cards)}] {name[:48]:48} fetch={status}")

        extract = None
        if page and use_llm:
            extract, usage = extract_card(client, model, card, page, schema)
            if usage:
                tok_in += usage.input_tokens + getattr(usage, "cache_read_input_tokens", 0)
                tok_out += usage.output_tokens
        elif page and not use_llm:
            extract = {"offer_found": None, "confidence": "n/a", "notes": "no-llm scaffolding test"}

        if not use_llm:
            level = "fetch-ok" if page else "fetch-fail"
        elif page is None:
            level, chg = "review", [f"fetch failed: {status}"]
        else:
            level, chg = classify(card, extract)
        if use_llm:
            totals[level] = totals.get(level, 0) + 1
            results.append({"name": name, "url": url, "level": level,
                            "changes": chg if page else [f"fetch failed: {status}"],
                            "extract": extract})
        else:
            results.append({"name": name, "url": url, "fetch": status})
        time.sleep(0.3)  # be polite to issuer servers

    return {"country": country, "results": results, "totals": totals,
            "tokens": {"in": tok_in, "out": tok_out}}


def write_report(runs, use_llm, model):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # Draft JSON (full machine-readable output)
    (OUT_DIR / "draft_extract.json").write_text(
        json.dumps(runs, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [f"# Card-data refresh report\n", f"_Generated {stamp} · model: {model if use_llm else 'none (fetch-only)'}_\n"]

    if not use_llm:
        for run in runs:
            ok = sum(1 for r in run["results"] if r["fetch"] == "ok")
            lines.append(f"\n## {run['country']}: {ok}/{len(run['results'])} pages fetched OK\n")
            for r in run["results"]:
                if r["fetch"] != "ok":
                    lines.append(f"- ⚠️ {r['name']} — {r['fetch']}")
        (OUT_DIR / "report.md").write_text("\n".join(lines), encoding="utf-8")
        return

    grand = 0.0
    for run in runs:
        t = run["totals"]
        pin, pout = PRICES.get(model, (0, 0))
        cost = run["tokens"]["in"] / 1e6 * pin + run["tokens"]["out"] / 1e6 * pout
        grand += cost
        lines.append(
            f"\n## {run['country']} — {sum(t.values())} cards "
            f"(unchanged {t.get('unchanged',0)}, minor {t.get('minor',0)}, "
            f"**major {t.get('major',0)}**, review {t.get('review',0)}) · ~${cost:.2f}\n")

        flagged = [r for r in run["results"] if r["level"] in ("major", "minor", "review")]
        if not flagged:
            lines.append("_No changes or issues flagged._")
            continue
        lines.append("| Card | Level | Changes / reason |")
        lines.append("|------|-------|------------------|")
        for r in sorted(flagged, key=lambda x: {"major": 0, "minor": 1, "review": 2}[x["level"]]):
            badge = {"major": "🔴 major", "minor": "🟡 minor", "review": "🔵 review"}[r["level"]]
            chg = "; ".join(r["changes"]) or "—"
            lines.append(f"| [{r['name'][:50]}]({r['url']}) | {badge} | {chg} |")

    lines.append(f"\n---\n**Estimated total LLM cost: ~${grand:.2f}**")
    lines.append("\n⚠️ This is a DRAFT. Nothing in src/data/ was changed. Verify 🔴 major "
                 "changes against the issuer site before applying them to the live data.")
    (OUT_DIR / "report.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description="LLM-assisted card-data refresh (writes a draft + report; never edits src/data).")
    ap.add_argument("--country", choices=["CA", "US"], help="Single country to process.")
    ap.add_argument("--all", action="store_true", help="Process both CA and US.")
    ap.add_argument("--limit", type=int, default=0, help="Only the first N cards (for testing).")
    ap.add_argument("--no-llm", action="store_true", help="Fetch pages only; skip the LLM (no API key needed).")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"Model id (default {DEFAULT_MODEL}).")
    args = ap.parse_args()

    countries = ["CA", "US"] if args.all else ([args.country] if args.country else [])
    if not countries:
        ap.error("specify --country CA|US or --all")

    use_llm = not args.no_llm
    client = schema = None
    if use_llm:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("ERROR: ANTHROPIC_API_KEY not set. Use --no-llm to test fetching only.", file=sys.stderr)
            sys.exit(1)
        try:
            import anthropic
        except ImportError:
            print("ERROR: pip install anthropic (or pip install -r scrapers/requirements.txt)", file=sys.stderr)
            sys.exit(1)
        client = anthropic.Anthropic()
        schema = build_schema()
        print(f"Model: {args.model}")

    runs = [run_country(c, args.limit, use_llm, client, args.model, schema) for c in countries]
    write_report(runs, use_llm, args.model)
    print(f"\n[done] Wrote {OUT_DIR / 'report.md'} and {OUT_DIR / 'draft_extract.json'}")
    if use_llm:
        for run in runs:
            print(f"   {run['country']}: {run['totals']}")


if __name__ == "__main__":
    main()
