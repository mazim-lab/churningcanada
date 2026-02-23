# ChurningCanada UI/Code Audit Report

This report details the findings of a comprehensive UI and code audit of the ChurningCanada website. The audit focused on two primary issues: dark mode visibility and incorrect issuer filtering.

## Issue 1: Dark Mode Fonts & UI Visibility

Numerous issues were found relating to hardcoded colors and missing dark mode variants, leading to poor visibility and a jarring user experience in the dark theme.

### Summary of Findings:
The primary issue is the repeated use of hardcoded theme colors (`text-primary`, `bg-white`) without corresponding `dark:` variants. The dark green primary color has very low contrast on the dark background, making text unreadable.

---

### File: `src/app/globals.css`

- **Analysis:** The CSS custom properties for the `.dark` theme are defined. A potential issue was noted with the contrast ratio between the card background (`--color-card`: `#292524`) and the main page background (`--color-background`: `#1c1917`). The low contrast can make it difficult to distinguish card elements from the background.
- **Recommendation:** Increase the lightness of `--color-card` in the `.dark` theme to improve its contrast against the page background. A value of `#332e2b` or similar would provide better separation.

---

### File: `src/app/page.tsx` (Homepage)

1.  **Search Input Field**
    -   **Line:** 86
    -   **Issue:** The search `<input>` has a hardcoded `bg-white` class. In dark mode, this creates a bright white box that is inconsistent with the theme.
    -   **Fix:** Replace `bg-white` with a theme-aware class. `bg-card` or `bg-muted` would be appropriate. Example: `className="... bg-white dark:bg-muted ..."`

2.  **"View all" Link**
    -   **Line:** 143
    -   **Issue:** The "View all →" link uses `text-primary`. This dark green color is nearly invisible against the dark background of the theme.
    -   **Fix:** Add a `dark:` variant to provide a lighter color in dark mode. `dark:text-gold` or `dark:text-primary-light` would be suitable. Example: `className="... text-primary dark:text-gold ..."`

---

### File: `src/app/cards/page.tsx` (Card Explorer)

This file contains multiple instances of the same color issues.

1.  **Filter Buttons (Selected State)**
    -   **Lines:** 172, 187, 196, 233, etc.
    -   **Issue:** Selected filter buttons use `bg-primary text-white`. The dark green `bg-primary` does not have a dark mode variant and can appear too dark and saturated against the dark theme background.
    -   **Fix:** Add a `dark:` variant for the background color. A slightly lighter or less saturated green would be better. Example: `dark:bg-primary-light`.

2.  **Checkbox Label & Section Header Hovers**
    -   **Lines:** 210, 221, 252, 346
    -   **Issue:** Multiple interactive elements (checkbox labels, collapsible section headers) use `hover:text-primary`. On hover in dark mode, the text becomes dark green and disappears against the dark background.
    -   **Fix:** Add a `dark:` variant for the hover state. Example: `className="... hover:text-primary dark:hover:text-gold ..."`

3.  **Grid/List View Toggle**
    -   **Lines:** 286-287
    -   **Issue:** The selected button in the view toggle uses `bg-primary text-white`, which has the same problem as the filter buttons.
    -   **Fix:** Add a `dark:` variant for the background. Example: `dark:bg-primary-light`.

---

## Issue 2: Issuer Filter Shows Wrong Cards

A thorough investigation was conducted into the report that filtering by an issuer (e.g., "Bank of America") incorrectly includes cards from other issuers.

### Summary of Findings:
**Unable to identify the root cause.** The filtering logic in the code and the underlying card data both appear to be correct.

### Investigation Details:

1.  **Code Logic Review (`src/app/cards/page.tsx`):**
    - The state variable `selectedIssuers` is correctly initialized as an empty array.
    - The `toggleIssuer` function correctly adds and removes items from this array.
    - The core filtering logic inside the `useMemo` hook is `cards = cards.filter(c => selectedIssuers.includes(c.issuer))`. This logic is sound and should only ever *remove* cards that do not match the selected issuers. It cannot add incorrect cards to the result set.
    - Other filters in the same `useMemo` hook are also subtractive and should not interfere in a way that would add cards back.
    - The `issuerSearch` text input was confirmed to only filter the list of issuers in the sidebar, not the cards themselves.

2.  **Data Integrity Review (`src/data/cards.ts` and JSON files):**
    - The data normalization functions (`normalizeCA`, `normalizeUS`) are simple and correctly assign the `issuer` field from the source JSON.
    - A manual review of `us_cards_comprehensive.json` was performed. It contains exactly four cards with `"issuer": "Bank of America"`, and they are all correct Bank of America products. No other cards were found to be mislabeled with this issuer.
    - A review of `canadian_cards_comprehensive.json` confirmed there are no cards with the "Bank of America" issuer.

### Conclusion:
The bug as described should not be possible given the current state of the code and data. The filtering implementation is straightforward and the data is clean.

This suggests the bug may be caused by one of the following:
- A subtle, non-obvious issue in the React state management or rendering lifecycle.
- An environmental factor or a browser-specific issue.
- A misunderstanding of how the bug is triggered (e.g., another filter or search term is active simultaneously).

**Recommendation:** This issue requires live debugging. A developer should run the application locally, set a breakpoint within the `useMemo` hook in `src/app/cards/page.tsx`, and inspect the `cards` array at each step of the filtering process to see where the discrepancy occurs.

---
*This audit was performed on 2026-02-22.*
