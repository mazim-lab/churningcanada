# FinTerminal — Update Runbook (for scheduled cron agents)

This document tells an automated agent (or a human) exactly how to refresh each
section of the site. It is self-contained: a cloud cron agent that has cloned this
repo should be able to follow any job below without prior context.

Last verified: 2026-06-21.

---

## 0. Ground rules (read first, every job)

- **Voice.** All written copy (deals, news, guides, theses) follows the house voice:
  human, warm, like an experienced churner-and-father — knowledgeable but mindful of
  people's finances; clarity with a sprinkle of kindness; overall positive. **No em
  dashes. No AI cadence (no staccato three-word clauses).**
- **Privacy / public repo.** This repo is (or will be) public on GitHub. **Never commit
  personal financial data.** The portfolio commits **percentages only** — never dollar
  amounts, share counts, account balances, or option strikes. Personal CSVs live in
  `private/` (gitignored). Verify with `git check-ignore private/` before any commit.
- **Sourcing & attribution.** Deals link **straight to the merchant** and never credit
  RedFlagDeals. News credits PoT / OMAAT / DoC **only** for genuine exclusives/scoops;
  public info (offer changes, airline news) is written as our own reporting. Do not
  mention competitor sites anywhere else on the site.
- **Verify before publishing.** Do not write a number, bonus, fee, or deal from memory.
  Confirm it against a real source (issuer page, merchant page, brokerage snapshot).
  If you cannot confirm, mark it UNSURE and leave the stored value rather than guess.
- **Build / dev gotchas.**
  - OneDrive locks `.next`: run `rm -rf .next` before any `npm run build`.
  - **Never** run `npm run build` while `npm run dev` is live (it corrupts the dev
    server's `.next`). Validate JSON with a quick `python -c "import json; json.load(open(...))"`
    instead of a full build when the dev server is running.
  - After data edits, the dev server hot-reloads JSON imports automatically.
- **Cost.** Use the user's Claude Max plan, not API credits.

### Cron feasibility (important)

| Job | Cadence | Cloud-cron friendly? | Why |
|---|---|---|---|
| Deals | on demand | **No — manual job (decided 2026-06-29)** | RFD now paywalls WebFetch (HTTP 402) and merchant prices need on-page checks, so claude-in-chrome plus a live interactive session are required. Run it manually with Claude, not as a cron. |
| News | daily/weekly | **Yes** | WebSearch/WebFetch only |
| Card data refresh | quarterly | **Partial** | Issuer pages bot-block `WebFetch`; need the residential/Playwright fetch or the real browser to (re)capture `data/raw/cards/*.md`. The *audit/extraction* over already-captured `.md` files IS cloud-friendly. |
| Portfolio | twice weekly | **No — stays manual** | Needs the user's private Wealthsimple CSVs + all-time return %. A cloud cron has no access to these. Keep manual. |

### How to ship a change (every job ends here)

- **Repo:** `github.com/mazim-lab/finterminal`. The working tree **is** a git repo with
  a GitHub remote — **ignore the harness env banner if it says "Is a git repository:
  false", that banner is wrong.** `private/` is gitignored (verified with `git check-ignore`).
- **Production branch:** `main` is the Vercel production branch (the redesign was merged
  2026-06-24). Deploy is on **Vercel**, configured in the dashboard (no `vercel.json` in-repo).
- **Source of truth = the committed data files.** News, Deals, and Sweet-spot posts render
  directly from `src/data/news.ts`, `src/data/deals.ts`, and `src/data/sweet-spots.ts`. The
  old optional Airtable read was retired 2026-06-29; do NOT reintroduce a remote source.
  Editing these files and pushing to `main` is the entire publish path.
- **Prerequisites a runner needs:** `python` and Node/`npm` on PATH. The card-page
  recapture step (§3c) needs a real browser (claude-in-chrome) or the Playwright pipeline
  — **a cloud cron has neither**, and issuer pages bot-block `WebFetch`. If a refresh needs
  new `.md` captures, the cron should STOP and open a task for the user rather than fetch
  with WebFetch.

To ship a data update (the News, Deals, and Sweet-spot crons AUTO-PUBLISH to production):
1. Work on `main`. Pull first (`git pull --rebase origin main`) so you are current.
2. Stage only intended files (e.g. `git add src/data/deals.ts`). **Never `git add private/`.**
3. Commit with a clear message; push to main: `git push origin main`.
4. Vercel auto-redeploys `main` to production within a couple of minutes. No manual deploy.
5. Roll back a bad push with `git revert <sha>` then push. **Never force-push.**

---

## 1. DEALS — manual, browser-verified (run with Claude on demand)

**File:** `src/data/deals.ts` (a `Deal[]`). **Page:** `src/app/deals/page.tsx`.

**Not automated (decided 2026-06-29):** Deals run as a MANUAL, interactive job with Claude,
not a cron. RedFlagDeals now paywalls headless fetches and merchant prices need on-page
verification, so the claude-in-chrome browser and a live session are required. Just ask
Claude to refresh deals; the steps below apply. Target 1-2 good deals per refresh.

**Scope (do not drift):** real **product/service** deals that save people money — a
quality item at a deep discount, OR a productive buy that pays for itself over time
(robot vacuum, coffee grinder, water filters, headphones, home improvement). **NOT
credit-card or bank welcome offers** — those belong in the Cards tab.

**Source:** `https://forums.redflagdeals.com/hot-deals-f9/` — scan the thread list and
the "Trending Hot Deals" box. Favour high-engagement, on-theme items.

**Steps:**
1. Open the Hot Deals forum. Identify 1-2 (default) on-scope product/service deals — high
   upvotes/replies and genuine value. One or two strong deals is plenty; only post a third
   if several are truly great. Posting just one, or none when nothing good is live, is fine.
2. **Open each thread and VERIFY** price, terms, and expiry. Do not trust the title alone.
   (We were once burned by posting plausible-but-unverified placeholder deals — never again.)
3. Pull the **clean merchant product URL** from the thread's "Deal Link" / "Get This
   Deal". **Strip RFD affiliate redirects** (`*.o93x.net`, `amzn.to`, `go.redirectingat.com`)
   down to the bare `bestbuy.ca/.../<id>` or `amazon.ca/dp/<ASIN>`.
4. Write each as a `Deal`:
   ```ts
   { title, merchant, url /* DIRECT, never RFD */, price, was /* struck-through reg price */,
     blurb /* house voice, include one honest caveat if the deal has a catch */,
     category, posted /* "Mon D, YYYY" */, expires? /* human label */, expiresAt? /* "YYYY-MM-DD" */ }
   ```
5. **Add new deals to the top.** Set `expiresAt` (ISO date) on anything time-limited.
6. The page **auto-archives** expired deals: it splits into "Today's picks" vs a
   collapsible "Archive" by comparing `expiresAt` to today (America/Toronto). A deal
   stays live through its whole end date and moves to Archive the next day. The page
   uses `export const revalidate = 3600`, so this happens hourly with **no redeploy**.
   Old deals self-archive — you only add new ones and occasionally prune the archive.
7. Commit & push.

**Manual, browser-verified (decided 2026-06-29):** RedFlagDeals now 307-redirects `WebFetch`
to a tollbit paywall (HTTP 402), and Amazon/Costco prices must be verified on the page, so
this job needs the **claude-in-chrome browser in a live interactive session**. It is run
**manually with Claude on demand**, not as an unattended cron (a headless `claude -p` run
can't reliably drive the browser). Never post a price you could not load on the merchant's
own page.

---

## 2. NEWS — daily or weekly

**File:** `src/data/news.ts` (a `NewsItem[]`). **Page:** `src/app/news/page.tsx`.

**APPEND-ONLY ARCHIVE + freshness (set 2026-06-30): the `NEWS` array is a PERMANENT archive.
NEVER delete, reorder, or rewrite existing items** (people browse the news history). Each
refresh only ADDS new items to the TOP. An item is eligible to add only if it was PUBLISHED
within the last 2 days (ideally same day); verify each one's publication date. De-dupe: skip
any story already in the array. If nothing new qualifies, ADD NOTHING and leave the feed
unchanged (no padding, no rewriting). The only items ever removed were the stale Jun 1
Aeroplan chart and Jan Air Transat (a one-time cleanup on 2026-06-30); do not remove anything
else. Evergreen or structural changes belong in the guides, not the newswire. Each item's `date`
is a full day-level date in the form `Mon D, YYYY` (e.g. `Jun 30, 2026`) = the day the story
hit the wire; the ticker shows just the month and day. The ticker shows the 5 newest items;
the full archive renders below with a "Load more" button.

**Steps:**
1. Read the EXISTING `NEWS` array first. Via WebSearch, find **Canada-first** items PUBLISHED
   in the last 2 days (cards/points/travel/personal finance) that are NOT already present, and
   PREPEND them while keeping every existing item.
2. For each, set `exclusive: [...]` (crediting PoT/OMAAT/DoC by name) **only** if the
   story is genuinely exclusive to that outlet. Otherwise write it as our own reporting
   with `sourceLabel` = the issuer/airline.
3. Keep the typewriter ticker fed from the same array.
4. House voice. Commit & push.

---

## 3. CARD DATA REFRESH — quarterly-ish

Two data files: `src/data/canadian_cards_comprehensive.json` (CA, 131 cards) and
`src/data/us_cards_comprehensive.json` (US, 63 cards). Normalization + display logic is
in `src/data/cards.ts`; point valuations in `src/data/point-valuations.ts`.

**Golden source per card (use these, NOT the raw scraper dicts):**
- **CA cards:** `data/raw/cards/<slug>.md` — real issuer pages (markitdown; image-heavy,
  so `grep` for "earn"/"cash back"/"points"/"%"/"fee"/"welcome").
- **US Amex cards:** `data/raw/md/american-express-us.md` (one big file with every US Amex
  card). The 23 US-Amex files in `scrapers/detail_cache/` are all an identical
  **22047-byte Amex login-wall page — junk, ignore them.**
- **US Chase/other:** `scrapers/detail_cache/<slug>.txt` (real pages for non-Amex).
- **`scrapers/detail_cache/*.txt` has many junk duplicate files** (identical md5/size
  across unrelated cards). Always prefer the `.md` source for CA. Detect dupes by
  grouping files on size/md5 before trusting them.

### 3a. Welcome bonuses, annual fees, FX fee, features

Pattern (proven 2026-06-21): **fan out ~11 auditor agents**, ~12 cards each. Each agent
gets a batch file with the stored values + the card's `md_source`, and verifies:

- **annual_fee** (CAD, primary cardholder's ongoing fee).
- **welcome_bonus** — text + `welcome_bonus_points` (point count for points cards, `null`
  for cash/no-bonus cards) + `welcome_bonus_value_cad`. **Run an internal-consistency
  check:** the text must agree with points and value (a "$100 cash back" card must not
  carry `points: 120`; a cash-back card must not have a points value). This is the exact
  class of bug that started the last audit (Tangerine).
- **foreign_transaction_fee** — `true` (charges, usually 2.5%) or `false` (FX-free).
  **Also set `foreign_transaction_fee_pct: 2.5`** on cards that charge it, or the detail
  page renders "—" instead of "2.5%" (the boolean alone is not enough). Known FX-free CA
  cards: Scotia Passport Visa Infinite (regular/Privilege/Business), Scotia Gold Amex,
  Wealthsimple, and the USD-billed TD/RBC/Scotia U.S.-Dollar cards. **Rogers charges FX
  then rebates** → `true`.
- **features/key_perks** — flag fabricated perks (lounge/hotel-elite/concierge on cards
  that don't have them) and benefit-flag contamination from a wrong cache.

**Source priority:** the `md` first (issuer's own page); if the exact welcome bonus is on
a linked offer page not in the `md`, do ONE targeted WebSearch (`"<card> welcome bonus
2026 canada"`) and trust the **issuer page over aggregators** (Milesopedia etc. lag).

**Apply with QC judgment, not blindly:**
- Apply md/issuer-confirmed fixes (fees, FX, internal-consistency, fabricated-perk removal).
- **Hold** risky web-only "offer changed" bumps (promo periods) and re-verify with 1–2
  independent agents before applying.
- Watch for **wrong/sibling cached pages** (a card's `md` showing a different card). When
  found, the card's `apply_url` is usually also wrong (a user-facing bug — the Apply
  button links to the wrong card). Re-pull the correct page (see 3c) and fix `apply_url`.

### 3b. Earn rates

US logic lives in `parseUsEarnRates` (in `cards.ts`); CA earn rates parse in
`normalizeCA` with a **safety quality-gate filter** (drops category keys >40 chars / >7
words or junk patterns like "Go to note", "à la carte", "purchasesGo", and non-clean
rates). Keep that gate — it stops shared-cache contamination from ever rendering.

To (re)extract earn rates: **fan out ~11 agents** over the golden sources. Each card →
array of `{category, rate}`:
- Rate format: points/miles multipliers as `"Nx"` (e.g. `"5x"` = 5 pts/$1, `"1.25x"`,
  "1 pt per $1.50" → `"0.67x"`); cash back as `"N%"` (e.g. `"4%"`, `"0.5%"`).
- Category: SHORT and clean, **≤40 chars and ≤7 words** (or the gate drops it). No
  sentence fragments.
- Always include the base "All other purchases" rate.
- **THE #1 TRAP — use the CARD'S OWN multiplier, NOT the inflated "up to Nx total"** that
  bundles airline/hotel/elite/member earning. Examples that bit us: United "7x total" is
  2x card + 5x MileagePlus → store **2x**; IHG "26x" ≈ 10x card; Hyatt "9x" → 4x card;
  Marriott "14–18x" → the 3x/6x card portion; WestJet "up to 6x" bundles Silver status.
- Exclude welcome bonuses, intro/BT rates, APR, fees, partner cross-sell ads.
- Low-interest / no-reward cards get an empty `{}` (they correctly show "no earn-rate data").

Store as a `{category: rate}` dict on each card's `earn_rates`. Merge, then validate:
**0 gate violations, 0 junk keys.**

### 3c. Re-capturing a wrong/stale `.md` page

Issuer sites (esp. RBC) **bot-block `WebFetch`** (returns an empty shell). Options:
- Use the real **claude-in-chrome browser** (local session): navigate to the correct
  official product URL, `get_page_text`, write to `data/raw/cards/<slug>.md`. Watch for
  **301 redirects** — a redirect to a different card's page means the card is
  **discontinued** (e.g. `rbc-rateadvantage-visa` now redirects to RBC Visa Classic Low
  Rate → it was removed as a duplicate).
- Or re-run the original residential Playwright + markitdown pipeline (see
  the finterminal project memory for the full pipeline).
- Confirm the fetched page is the RIGHT card (name/fee/bonus match, not a sibling) before
  overwriting. Fix the card's `apply_url` to the correct URL at the same time.

### 3d. Point valuations

`src/data/point-valuations.ts` maps each program → `{ baseline, max }` cents-per-point.
The CA bonus value displayed = `points × baseline / 100`, so a wrong cpp inflates every
card on that program. Sanity-check after any change (e.g. **PC Optimum = 0.1¢**, 1,000
pts = $1 — it was wrongly 0.7¢ and inflated PC cards 7×).

### 3e. Card-data validation checklist (run after any refresh)

1. JSON valid: `python -c "import json; json.load(open('src/data/canadian_cards_comprehensive.json',encoding='utf-8'))"` (and the US file).
2. No card showing a round 5,000/10,000 "points" that's actually a `$` spend threshold.
3. No cash-back card mislabeled with a points `rewards_program` or a points welcome value.
4. Earn rates: 0 categories >40 chars; 0 junk/fragment keys; no card sharing a
   byte-identical earn-rate blob with an unrelated card (contamination tell).
5. FX: every card has `foreign_transaction_fee` set (not null); chargers have `_pct: 2.5`.
6. Spot-check 5–10 flagship cards on the live detail pages.
7. Run an **independent audit pass** (a second wave of agents that re-derive truth from
   source and diff against stored) for anything high-stakes.

---

## 4. PORTFOLIO — twice weekly (MANUAL, not a cron)

Documented in full in the `finterminal-update-playbook` memory. Summary: positions are
mostly long-dated **options (LEAPS)** that free price APIs don't quote, so values come
from the user's Wealthsimple, not an API. The user provides into `private/` (gitignored):
`holdings-report-YYYY-MM-DD.csv`, the full `activities-export-YYYY-MM-DD.csv`, and the
Wealthsimple **all-time return %** per account. Scripts in `private/`
(`compute_holdings.py`, `by_ticker.py`, `analyze.py`, `timeseries.py`) produce the
per-underlying return/weight, top profit/loss, closed positions, and history. Write
**percentages only** into `src/data/portfolio.ts`. **A cloud cron cannot do this** (no
access to the private brokerage data) — keep it a manual, user-initiated update.

---

## 5. SWEET SPOTS — twice weekly (rotating program)

**File:** `src/data/sweet-spots.ts` (a `SweetSpot[]` plus a `ROTATION` list).
**Renders at:** `/travel/sweet-spots/<slug>`, listed on the Travel & Points tab tagged "Sweet spot".

Each run posts ONE worked redemption example for the NEXT program in `ROTATION` after the
most recent `SWEET_SPOTS` entry, looping back to the start.

**Steps:**
1. Read `src/data/sweet-spots.ts`. Take `SWEET_SPOTS[0].program` (the newest post) and find
   its index in `ROTATION`. The program for THIS run is the next one in `ROTATION` (wrap to
   the first after the last). Current order: Aeroplan, Avios, WestJet, Delta, United, Alaska,
   Flying Blue, then loop.
2. Research a genuine, currently-valid sweet spot for that program via WebSearch (a specific
   route and cabin that prices well on the program's own or partner chart). Do NOT invent
   numbers; treat mileage figures as approximate and tell readers to confirm live pricing.
3. Write ONE `SweetSpot` object in the HOUSE VOICE (no em dashes, warm, honest caveats),
   matching the shape and length of the existing entry: `{ slug, program, title, dek, read,
   date: "Mon YYYY", body (paragraphs separated by blank lines, with a cents-per-point or
   value example and at least one honest caveat), href?, hrefLabel? }`. Make `slug` unique
   and descriptive, e.g. `avios-short-haul-yyz-bos-7500`.
4. PREPEND it to `SWEET_SPOTS` (newest first).
5. Commit and push to `main` (auto-publishes). The travel page and sitemap pick it up
   automatically, so there are no other files to touch.

**Cloud-friendly:** yes. Pure WebSearch plus a data-file edit, no browser needed.

---

## 6. Quick file map

| What | Where |
|---|---|
| CA card data | `src/data/canadian_cards_comprehensive.json` |
| US card data | `src/data/us_cards_comprehensive.json` |
| Card normalization + earn-rate gates | `src/data/cards.ts` |
| Point valuations (cpp) | `src/data/point-valuations.ts` |
| Deals | `src/data/deals.ts` + `src/app/deals/page.tsx` |
| News | `src/data/news.ts` + `src/app/news/page.tsx` |
| Sweet-spot posts | `src/data/sweet-spots.ts` + `src/app/travel/sweet-spots/[slug]/page.tsx` |
| Portfolio (% only) | `src/data/portfolio.ts` |
| CA card source pages | `data/raw/cards/<slug>.md` |
| US Amex source | `data/raw/md/american-express-us.md` |
| US Chase/other source | `scrapers/detail_cache/<slug>.txt` (non-Amex only) |
| Private portfolio data + scripts | `private/` (gitignored) |
