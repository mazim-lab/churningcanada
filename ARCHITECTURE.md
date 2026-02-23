# ChurningCanada.ca — Architecture & Feature Plan

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Data**: Static JSON → eventually headless CMS
- **Deployment**: Vercel + Cloudflare DNS
- **Repo**: mazim-lab/churningcanada (private)

## Core Pages

### 1. Homepage
- Hero: "Find Your Next Card" search bar
- Quick filters: Best Travel | Best Cashback | No Fee | US Cards for Canadians
- Featured/trending cards (editorial picks)
- Latest blog posts
- Quick stats ("192 cards tracked across 35 issuers")

### 2. Card Explorer (/cards)
The main attraction. Full-featured card comparison tool.

**Filters (sidebar or top bar):**
- Country: 🇨🇦 Canada | 🇺🇸 US | All
- Card Type: Travel | Cashback | Rewards | Hotel | Airline | Business | Student | Secured | Low-Rate
- Personal / Business toggle
- Issuer: Amex, Chase, Scotiabank, CIBC, BMO, RBC, TD, etc.
- Network: Visa | Mastercard | Amex
- Rewards Program: Aeroplan | Scene+ | Avion | Membership Rewards | Ultimate Rewards | etc.
- Annual Fee: $0 | Under $100 | $100-$299 | $300+ | slider
- Welcome Bonus Value: slider (min value)

**Benefit Filters (checkboxes):**
- ✈️ Airport Lounge Access
- 🌍 No Foreign Transaction Fee
- 🚗 Car Rental Insurance
- 🏥 Travel Medical Insurance
- ✋ Trip Cancellation/Interruption
- ⏰ Flight Delay Insurance
- 📱 Mobile/Cell Phone Insurance
- 🛡️ Purchase Protection
- 🔧 Extended Warranty
- 🎫 Global Entry / TSA PreCheck / NEXUS
- 🛎️ Concierge Service
- 🏨 Hotel Status/Perks
- 🧳 Free Checked Bags

**Sort Options:**
- Best Value (welcome bonus value - annual fee)
- Highest Welcome Bonus
- Lowest Annual Fee
- Best Earn Rate
- Editorial Rating
- Newest Offers

**Card Display:**
- Grid or list toggle
- Card image, name, issuer badge
- Annual fee, welcome bonus (value + points)
- Top 3 earn rates
- Key benefit icons (lounge, no FX, insurance)
- "Compare" checkbox (compare up to 4)
- Quick "Details" expand

### 3. Card Detail Page (/cards/[slug])
- Full card breakdown
- All earn rates by category
- Complete insurance/benefits table
- Pros/cons
- Editorial review/rating
- "Best for" badges
- Historical bonus tracker (if data available from PoT)
- Apply link (affiliate when available)
- Related/similar cards

### 4. Compare Tool (/compare)
- Side-by-side comparison of 2-4 cards
- Every field compared
- Highlight differences
- Winner badges per category

### 5. Blog (/blog)
**Categories:**
- Credit Card Reviews
- Churning Strategy
- Personal Finance
- Points & Miles Guides  
- US Cards for Canadians (ITIN guide, cross-border tips)
- Deal Alerts
- Loyalty Program Guides
- News & Updates

**Blog Features:**
- Category filter/sort
- Tag system
- Search
- Reading time estimate
- Related posts
- Author bio (AI-generated, reviewed by human)

### 6. ITIN Guide (/guides/itin)
Comprehensive guide for Canadians getting US credit cards:
- What is an ITIN and why you need one
- Step-by-step application process
- Timeline expectations
- Which US cards to get first
- Building US credit from Canada
- Amex Global Transfer explained

### 7. Rewards Calculator (/calculator)
- Input monthly spend by category
- Shows best card(s) for your spending pattern
- Compares annual rewards across top recommendations

### 8. Glossary (/glossary)
Common churning/credit card terms

## Unique Features (Differentiators)
1. **Cross-border focus**: No other site does CA + US cards with Canadian-specific notes
2. **Benefit-based search**: Most sites only filter by type/issuer, not by specific benefits
3. **Historical bonus tracking**: Show if current bonus is above/below average
4. **Churning Path Planner**: Suggest optimal card application order
5. **Points Valuation Guide**: What each point currency is worth

## Data Model
```
Card {
  slug, name, issuer, network
  country (CA|US)
  card_type, is_business
  annual_fee, first_year_fee
  welcome_bonus, welcome_bonus_value, welcome_bonus_conditions
  earn_rates {}
  rewards_program
  foreign_transaction_fee
  benefits {
    lounge_access, no_fx_fee, car_rental_insurance,
    travel_medical, trip_cancellation, flight_delay,
    mobile_insurance, purchase_protection, extended_warranty,
    global_entry_nexus, concierge, hotel_status, free_checked_bags
  }
  insurance {}
  minimum_income, minimum_credit_score
  key_perks []
  pros [], cons []
  editorial_rating
  apply_url
  card_image_url
  sources []
  last_updated
  notes_for_canadians (US cards only)
}
```

## Design Direction
- Clean, modern, minimalist
- Dark/light mode
- Mobile-first responsive
- Fast (static generation where possible)
- No clutter — unlike DoC's wall of text
- Card images where available but not mandatory
- Smooth animations, polished feel
