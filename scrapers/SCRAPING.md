# Card data scraping & benefits-refresh playbook

This documents how to refresh card **offers** (welcome bonus, fees — monthly/quarterly) and
**benefits** (insurance coverages — quarterly, they rarely change) for every issuer.

## Source of truth for URLs
Each card's correct detail-page URL is stored in its **`apply_url`** field in
`src/data/canadian_cards_comprehensive.json` and `src/data/us_cards_comprehensive.json`.
**Always fetch from `apply_url`** — these were resolved card-by-card (see history) and are
the canonical detail pages. Do NOT use the issuer "all cards / compare / browse" listing URLs.

## Golden rules (learned the hard way)
1. **Verify the URL before concluding a card is "blocked."** Almost every card that looked
   blocked was just a wrong URL/slug. A short ~26–64 KB page that repeats for several cards is
   usually a **listing/redirect** page (wrong slug), not the card. Distinct page size ≈ real page.
2. **Benefits lazy-load on scroll.** Fetch must scroll the full page (or the insurance section
   never loads). markitdown the final rendered HTML.
3. **Amex blocks `page.evaluate`** ("eval is disabled" CSP) → use **keyboard scrolling**
   (`page.keyboard.press('End')` in a loop), not JS scroll. Amex also hides coverages behind
   **"All Benefits" sub-tab buttons** ("Travel", "Shopping & Entertainment") — must
   `get_by_role('button', name='Travel').click()` etc. to expand them. Do NOT click broadly /
   by text — that hits nav links and navigates away (contaminates the capture).
4. Keyword detection only works on clean PDFs (COI/BCG). On marketing pages use the LLM
   extractor (it distinguishes rental *insurance* from rental *discounts*, and *included* from
   *optional add-on* coverage).

## Per-issuer fetch methods
| Issuer | Engine | URL pattern | Render notes |
|---|---|---|---|
| **TD** | chromium | `td.com/ca/en/personal-banking/products/credit-cards/<category>/<card>` (categories: aeroplan, travel-rewards, cash-back, low-rate; NO "td-" prefix) | also publishes BCG PDFs: `td.com/content/dam/tdct/document/pdf/personal-banking/credit-cards/welcome-guide/<key>-bcg-en.pdf` |
| **Amex CA** | (PDF) | per-card Certificate-of-Insurance PDFs listed on `americanexpress.com/en-ca/insurance/coverage/` → `.../certificates-of-insurance/<Card>-COI-EN.pdf` | parse PDFs with markitdown; keyword-detect 7 insurance flags (note: "Buyer's Assurance"=extended warranty, curly apostrophe — normalize ’→'); set lounge/checked-bag by known fact |
| **Amex US personal** | firefox | `americanexpress.com/us/credit-cards/card/<slug>/` (slug usually `<name>-card`, e.g. gold-card; Delta uses full `delta-skymiles-gold-american-express-card`) | keyboard-scroll + click "Travel"/"Shopping & Entertainment" benefit buttons |
| **Amex US business** | firefox | `americanexpress.com/us/credit-cards/business/business-credit-cards/<slug>/` (slugs vary: `american-express-business-platinum-credit-card-amex`, `american-express-business-gold-card-amex`); Delta business: `americanexpress.com/en-us/business/credit-cards/<slug>/` | read real slugs off the business listing page; same keyboard-scroll + button-click |
| **RBC** | chromium | from `rbcroyalbank.com/sitemap.xml` → `/credit-cards/<cat>-credit-card/<slug>/`; business cards on `/business/credit-cards/...` | JS scroll-to-bottom |
| **Scotia** | chromium | `scotiabank.com/ca/en/personal/credit-cards/<network>/<slug>.html` (network = visa/mastercard/american-express); business: `/ca/en/small-business/business-banking/credit-cards/<slug>.html` | enumerate slugs from the compare-cards & small-business pages |
| **BMO** | firefox | `bmo.com/en-ca/main/personal/credit-cards/<slug>/`; business `/en-ca/main/business/credit-cards/<slug>/` | chromium gets BLOCKED — use firefox. Page is JS; sitemap/robots time out — get slugs from apply_url |
| **CIBC** | web_fetch (urllib) | `cibc.com/en/personal-banking/credit-cards/all-credit-cards/<slug>.html` | CIBC blocks Playwright; plain HTTP works |
| **National Bank** | chromium | `nbc.ca/en/business/credit-cards/<slug>.html` etc. | slugs from `nbc.ca/en/business/sitemap.xml` |
| **Desjardins** | chromium | `desjardins.com/en/credit-cards/<slug>.html` (slug = our slug minus `desjardins-`) | JS scroll |
| **Chase (US)** | chromium | `creditcards.chase.com/business-credit-cards/ink/<x>`; Aeroplan: `/travel-credit-cards/aircanada/aeroplan` | benefits lazy-load — JS scroll-to-bottom-until-stable (height stops growing); needs the FULL scroll or benefits stay hidden |
| **Tangerine / Canadian Tire** | chromium | SPA — use the exact card URL (`tangerine.ca/.../credit-cards/<x>`, `triangle.canadiantire.ca/...`, `ctfs.com/content/ctfs/en/cards/<x>.html`) | links not in listing HTML; must have the direct URL |

## Render snippets
- **Chase / RBC / banks (JS scroll):** loop `page.evaluate("window.scrollTo(0,document.body.scrollHeight)")` + 800ms wait until `scrollHeight` stops growing, then markitdown `page.content()`.
- **Amex (eval blocked):** `for _ in range(40): page.keyboard.press('End'); page.wait_for_timeout(500)` then click benefit buttons: `for label in ['Travel','Shopping & Entertainment','Rewards & Benefits']: for el in page.get_by_role('button', name=label).all(): el.click()`.
- Validate: real page is large & distinct; reject sizes that repeat across cards (listing/redirect) — e.g. Amex US business listing = 63714/64965 chars.

## Benefits-extraction pipeline
1. Fetch detail page per above → markitdown → `data/raw/cards/<slug>.md` (+ `us-` prefix for US).
2. Run the consensus workflow: a Sonnet agent per card reads the md and returns the 10 benefit
   booleans + confidence. Apply **high/medium** confidence; leave **low** on keyword inference.
   Schema/flags: lounge_access, no_fx_fee, car_rental_insurance, travel_medical,
   trip_cancellation, flight_delay, mobile_insurance, purchase_protection, extended_warranty,
   free_checked_bags. Stored in each card's `benefits` object; `src/data/cards.ts` prefers the
   stored object and falls back to keyword inference (`extractBenefits`).
3. Residential IP required — banks/Amex 403 datacenter IPs; run locally, not in cloud/cron.

## Offers refresh (welcome bonus / fees)
Same fetch, but extract `welcome_bonus`, fee, points; then `scrapers/recompute_values.py`
recomputes first-year value from `src/data/point-valuations.ts` (baseline cpp). Values shown in
native currency (CAD/US$), never converted.
