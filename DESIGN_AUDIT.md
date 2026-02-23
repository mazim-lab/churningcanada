# ChurningCanada.ca — Design Audit

**Date:** February 22, 2026  
**Auditor:** Frontend Design Review  
**Verdict:** Competent but generic. Reads as "well-built AI template" rather than "designed by a human with taste." The bones are solid — good information architecture, sensible color palette, working dark mode. But it lacks the personality, texture, and craft that would make someone trust it as *the* authority on Canadian credit card rewards.

---

## 1. Typography — Grade: C+

### Problem: Inter + DM Sans is the most generic pairing possible
**Files:** `src/app/layout.tsx:7-16`, `src/app/globals.css:13-14`

Inter is the default font of AI-generated websites. DM Sans as a "display" font is barely distinguishable from Inter at heading sizes. There's no typographic personality — nothing that says "premium finance" or "Canadian."

**Fix — Option A (Distinctive serif + sans):**
```tsx
// layout.tsx
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

// Use a proper display serif for headings — gives "premium finance" feel
// Libre Caslon Display, or better yet, a variable serif like Newsreader
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
});
```

**Fix — Option B (If staying sans-serif):**
Use **Satoshi** (via Fontshare, self-hosted) or **General Sans** for body, paired with **Cabinet Grotesk** or **Clash Display** for headings. These are distinctive without being weird.

```css
/* globals.css */
--font-sans: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
--font-display: 'Cabinet Grotesk', 'Satoshi', ui-sans-serif, system-ui, sans-serif;
```

**Priority:** High — typography is the single biggest differentiator between "designed" and "generated."

### Problem: No typographic scale or rhythm
**File:** `src/app/globals.css`

There's no defined type scale. Heading sizes are scattered across files as arbitrary Tailwind classes (`text-2xl`, `text-3xl`, etc.) with no consistent modular scale.

**Fix:** Add a type scale to globals.css:
```css
h1 { font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.025em; line-height: 1.1; }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); letter-spacing: -0.02em; line-height: 1.2; }
h3 { font-size: clamp(1.125rem, 2vw, 1.5rem); letter-spacing: -0.01em; line-height: 1.3; }
```

**Priority:** Medium

---

## 2. Color & Theme — Grade: B

### What works
- The forest green (#1a5632) + gold (#d4a853) palette is distinctive and appropriate for a Canadian finance site.
- Warm stone backgrounds (`#fdfcfb`, `#f7f5f2`) are better than cold whites.
- Dark mode color overrides are thoughtful (bright green for readability, warm dark backgrounds).

### Problem: Gold is underused as an accent
**Various files**

Gold appears on bonus values and the search button, but it's not woven into the design language enough. It should appear in more micro-interactions, borders, and decorative elements.

**Fix:** Add gold as a subtle accent in more places:
```css
/* globals.css — add */
::selection {
  background: rgba(212, 168, 83, 0.25);
  color: var(--color-foreground);
}

/* Add gold underline accent to section headings */
h2::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 2px;
  background: var(--color-gold);
  margin-top: 0.5rem;
  border-radius: 1px;
}
```

**Priority:** Medium

### Problem: Dark mode primary green (#4ade80) is too "Tailwind default"
**File:** `src/app/globals.css:26`

`#4ade80` is literally Tailwind's `green-400`. It screams "I used a framework default." A more refined choice:

```css
.dark {
  --color-primary: #5cdb8b;       /* slightly warmer, less saturated */
  --color-primary-light: #8ee8b0;
  --color-primary-dark: #3cc973;
}
```

**Priority:** Low

---

## 3. Motion & Micro-interactions — Grade: B-

### What works
- Floating card silhouettes in hero (subtle, decorative)
- AnimatedCounter with intersection observer (nice touch)
- Card hover scale + shadow transitions
- Reading progress bar on guides
- Value meter fill animation
- Skeleton loading shimmer

### Problem: No scroll-triggered animations on content sections
**Files:** `src/app/page.tsx`, `src/app/cards/[slug]/page.tsx`

The homepage sections (stats bar, featured cards, blog placeholder) pop into existence with no entrance animation. Below the hero fold, everything is static.

**Fix:** Add a simple fade-up-on-scroll utility:
```tsx
// components/FadeIn.tsx
'use client';
import { useRef, useEffect, useState } from 'react';

export function FadeIn({ children, delay = 0, className = '' }: { 
  children: React.ReactNode; delay?: number; className?: string 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

Wrap homepage sections in `<FadeIn>`. Stagger the featured card grid items with increasing delay.

**Priority:** High — this is the difference between "alive" and "flat."

### Problem: No hover states on nav links beyond color change
**File:** `src/app/layout.tsx:56-60`

Nav links just change color. No underline animation, no weight shift, nothing tactile.

**Fix:**
```tsx
// In Header nav links, replace the className:
className="relative text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
```

**Priority:** Medium

### Problem: Blog cards have no hover image/gradient shift
**File:** `src/app/blog/page.tsx:52-57`

The gradient header area on blog cards doesn't respond to hover at all. It should shift or brighten.

**Fix:**
```tsx
<div className={`h-32 ${post.gradient} flex items-center justify-center transition-all duration-300 group-hover:brightness-110 group-hover:scale-[1.02]`}>
```
And add `group` to the parent article.

**Priority:** Low

---

## 4. Spatial Composition — Grade: B-

### Problem: Every section is centered `max-w-7xl` with no variation
**Files:** All pages

Every single content section uses `mx-auto max-w-7xl px-4 sm:px-6`. This creates a monotonous visual rhythm. There's no full-bleed moments, no asymmetry, no variation in container width.

**Fix examples:**
```tsx
// Homepage — make stats bar full-width with a subtle texture
<section className="border-b border-border/50 bg-muted/50 relative">
  <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02]" />
  ...
</section>

// Blog page — use narrower max-w-3xl for the article list (better reading width)
// Card detail — already uses max-w-4xl, good

// Homepage hero — consider slight asymmetry:
// Put the search bar slightly left, add a decorative card mockup on the right at md+ breakpoints
```

**Priority:** Medium

### Problem: Card detail page has no visual hierarchy break
**File:** `src/app/cards/[slug]/page.tsx`

Everything is the same width, same card, same background. The page reads as a flat list of sections. There's no moment that makes you stop and look.

**Fix:** Add a subtle colored banner behind the card header:
```tsx
{/* Before the main container */}
<div className="bg-gradient-to-b from-muted to-background pt-4 pb-8">
  <div className="mx-auto max-w-4xl px-4 sm:px-6">
    {/* breadcrumbs + header + stats go here */}
  </div>
</div>
```

**Priority:** Medium

---

## 5. Visual Polish — Grade: B-

### Problem: No texture or atmospheric depth anywhere
**Files:** All pages

Backgrounds are flat solid colors. No noise textures, no subtle patterns, no mesh gradients. The muted sections (`bg-muted/50`) are slightly different shades of beige but still feel sterile.

**Fix:** Add a subtle noise overlay:
```css
/* globals.css */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
```

**Priority:** Medium — subtle but adds analog warmth that separates "designed" from "generated."

### Problem: Card borders are all the same thin gray
**Files:** `src/components/CardGrid.tsx`, various

The left color border on cards (`border-l-[3px]`) is a nice touch, but the rest of the border is `border-border` (same as everything else). Cards don't feel like objects with depth.

**Fix:** Improve card shadows and borders:
```css
/* globals.css — replace .card-hover */
.card-hover {
  @apply transition-all duration-300 ease-out;
  box-shadow: 0 1px 3px rgba(45, 42, 38, 0.04), 0 1px 2px rgba(45, 42, 38, 0.02);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(45, 42, 38, 0.08), 0 4px 12px rgba(45, 42, 38, 0.04);
}
```

Use `translateY(-2px)` instead of `scale(1.02)` — scale looks cheap, translate looks premium.

**Priority:** High

### Problem: Footer is boring
**File:** `src/app/layout.tsx:75-100`

The footer is a standard 4-column grid with no personality. For a finance site, this is where you build trust.

**Fix:** Add a pre-footer CTA and more visual interest:
```tsx
<footer className="relative mt-20">
  {/* Decorative top edge */}
  <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
  <div className="bg-muted">
    {/* ... existing content ... */}
  </div>
</footer>
```

**Priority:** Low

---

## 6. Component Quality — Grade: B

### Problem: Buttons all look the same
**Files:** Various

Every CTA is `rounded-full bg-primary px-5 py-2 text-sm font-medium text-white`. There's no button hierarchy — primary, secondary, and ghost buttons are barely distinguished.

**Fix:** Create distinct button variants:
```css
/* globals.css */
.btn-primary {
  @apply rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white 
    hover:bg-primary-light transition-all duration-200
    shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30
    active:scale-[0.98];
}
.btn-gold {
  @apply rounded-full bg-gradient-to-r from-gold-dark to-gold px-6 py-2.5 text-sm font-semibold text-primary-dark
    hover:brightness-110 transition-all duration-200
    shadow-sm shadow-gold/20 active:scale-[0.98];
}
.btn-ghost {
  @apply rounded-full border border-border px-6 py-2.5 text-sm font-medium
    hover:bg-muted hover:border-foreground/20 transition-all duration-200;
}
```

**Priority:** Medium

### Problem: The header "Explore Cards" CTA doesn't stand out enough
**File:** `src/app/layout.tsx:63`

It's the same green as everything else. In the header it gets lost.

**Fix:**
```tsx
<a href="/cards" className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-5 py-2 text-sm font-semibold text-primary-dark hover:brightness-110 transition-all shadow-sm shadow-gold/20">
  Explore Cards
</a>
```

**Priority:** Medium

### Problem: No mobile hamburger menu
**File:** `src/app/layout.tsx:55`

The nav has `hidden md:flex` but there's no mobile menu at all. On small screens, users only see the logo, theme toggle, and "Explore Cards" button. All navigation (Cards, Compare, Guides, Blog) is invisible.

**Fix:** Add a mobile menu button and drawer (similar pattern to the mobile filter drawer on cards page). This is a critical UX gap.

```tsx
// In Header, add a mobile menu button:
<button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
  <Menu className="w-5 h-5" />
</button>
```

**Priority:** Critical — users literally cannot navigate on mobile.

### Problem: Compare page search dropdown has no click-outside handling
**File:** `src/app/compare/page.tsx:49-73`

The search dropdown opens but only closes when you select a card. Clicking outside doesn't close it (no click-outside listener).

**Fix:** Add a backdrop overlay like the mobile filter drawer uses, or use a `useEffect` with a `mousedown` listener on `document`.

**Priority:** High

---

## 7. Mobile Responsiveness — Grade: C+

### Problem: No mobile navigation (Critical — repeated for emphasis)
**File:** `src/app/layout.tsx:55`

**Priority:** Critical

### Problem: Stats bar overflows on small screens
**File:** `src/app/page.tsx:81-97`

Three stat columns with `flex gap-10` don't wrap. On ~320px screens, this overflows.

**Fix:**
```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-wrap justify-center gap-6 sm:gap-10">
```

**Priority:** High

### Problem: Compare page table isn't great on mobile
**File:** `src/app/compare/page.tsx`

The table has `overflow-x-auto` which helps, but with 4 cards selected the table is extremely wide and the labels column is narrow. 

**Fix:** On mobile, consider a stacked card-vs-card layout instead of a horizontal table. For now, at minimum make the label column sticky:
```tsx
<td className="p-3 text-sm font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[120px]">{label}</td>
```

**Priority:** Medium

### Problem: Quick filter pills in hero wrap awkwardly on mobile
**File:** `src/app/page.tsx:72-82`

The pills wrap to 2 lines with uneven spacing on 375px screens.

**Fix:** Use `overflow-x-auto` with `flex-nowrap` and `snap-x` on mobile, grid on desktop:
```tsx
<div className="flex gap-3 mt-10 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible snap-x snap-mandatory">
  {quickFilters.map(f => (
    <a key={f.label} href={f.href} className="snap-start shrink-0 sm:shrink ...">
```

**Priority:** Low

---

## 8. Dark Mode — Grade: B+

### What works
- Color variables properly swap
- Country badges have dark variants (`dark:bg-red-900/30`)
- Gold adjusts appropriately
- Card backgrounds use `bg-card` consistently

### Problem: Some hardcoded light-mode colors
**File:** `src/app/cards/[slug]/page.tsx:100`

The "Notes for Canadians" box uses `bg-gradient-to-br from-red-50/80 via-orange-50/30 to-white` — `to-white` is hardcoded and doesn't respect dark mode (the `dark:` override on the same element might override it, but the gradient is still light-biased).

**Fix:** Already has dark overrides (`dark:from-red-900/15` etc.), but confirm `to-white` → should be `to-background`:
```tsx
className="... bg-gradient-to-br from-red-50/80 via-orange-50/30 to-background dark:from-red-900/15 dark:via-orange-900/5 dark:to-card ..."
```

**Priority:** Low

### Problem: IssuerAvatar logo container is always white
**File:** `src/components/IssuerAvatar.tsx:45`

`bg-white` is hardcoded. In dark mode, issuer logos sit on a bright white square.

**Fix:**
```tsx
<div className={`${sizeClasses[size]} rounded-lg overflow-hidden shrink-0 shadow-sm bg-white dark:bg-white/90`}>
```

Or better, use a subtle neutral:
```tsx
className="... bg-white dark:bg-stone-100 ..."
```

Most logos look fine on light backgrounds, so `bg-white/90` in dark mode is acceptable — it just shouldn't be jarring. The current `bg-white` creates a harsh square.

**Priority:** Low

---

## 9. Overall "Vibe" — Grade: B-

### The Good
- **Content quality is excellent.** The US Cards guide is genuinely valuable, well-structured content. The ITIN form instructions are outstanding.
- **Information architecture is smart.** Card explorer filters, comparison tool, detailed card pages — all the right pages exist.
- **Color palette is appropriate.** Green + gold for a Canadian finance site is on-brand.
- **Interactive guide** with checklists and localStorage persistence is a killer feature.
- **Dark mode** is a first-class citizen, not an afterthought.

### The Bad
- **It looks like every other AI-generated Next.js site.** Inter font, rounded-2xl cards, same spacing, same shadows, same everything. If you put this next to 10 other sites built by Claude/ChatGPT, they'd be hard to tell apart.
- **No personality.** Where's the Canadian flair beyond a maple leaf emoji? Where's the brand voice in the visual design?
- **No imagery.** Zero photos, illustrations, or custom graphics. Just Lucide icons and gradient placeholder boxes.
- **The blog is all "Coming Soon."** This damages credibility. Either have real content or don't show the section.

### What would make this feel "designed by a human":
1. **A distinctive typeface** (fix #1 above)
2. **One custom illustration** — even a simple line-art maple leaf pattern or credit card illustration in the hero
3. **Texture** — noise overlay, subtle paper texture in the muted backgrounds
4. **Asymmetric hero layout** at desktop — search on left, decorative element on right
5. **A signature micro-interaction** — something unique like a card flip animation on hover, or a gold sparkle on the "first year value" numbers
6. **Remove the blog section from homepage** until real content exists

---

## Priority Summary

### Critical
| Issue | File | Line |
|-------|------|------|
| No mobile navigation menu | `layout.tsx` | 55 |

### High
| Issue | File | Line |
|-------|------|------|
| Generic Inter + DM Sans fonts | `layout.tsx` | 7-16 |
| No scroll-triggered animations | `page.tsx` (home) | all sections |
| Card hover uses scale instead of translateY | `globals.css` | 76-79 |
| Stats bar overflows on mobile | `page.tsx` (home) | 81-97 |
| Compare search dropdown no click-outside | `compare/page.tsx` | 49-73 |

### Medium
| Issue | File | Line |
|-------|------|------|
| No typographic scale | `globals.css` | — |
| Gold underused as accent | various | — |
| No texture/noise overlay | `globals.css` | — |
| Nav hover states too basic | `layout.tsx` | 56-60 |
| All buttons look the same | various | — |
| Header CTA doesn't stand out | `layout.tsx` | 63 |
| Card detail page flat hierarchy | `cards/[slug]/page.tsx` | — |
| Monotonous container widths | all pages | — |
| Compare table mobile sticky labels | `compare/page.tsx` | — |

### Low
| Issue | File | Line |
|-------|------|------|
| Dark mode primary too "Tailwind default" | `globals.css` | 26 |
| Blog card hover no gradient shift | `blog/page.tsx` | 52 |
| Footer lacks personality | `layout.tsx` | 75 |
| IssuerAvatar bg-white in dark mode | `IssuerAvatar.tsx` | 45 |
| "Notes for Canadians" hardcoded white | `cards/[slug]/page.tsx` | 100 |
| Hero quick filters overflow mobile | `page.tsx` (home) | 72-82 |
| Blog "Coming Soon" on homepage hurts trust | `page.tsx` (home) | 103-120 |

---

## TL;DR

**Ship-blocking:** Add mobile navigation. That's the only truly broken thing.

**To go from "AI template" to "designed":** Change the fonts (biggest bang for buck), add scroll animations, improve card hover physics (translateY not scale), add a noise texture, and use gold more aggressively as an accent. These 5 changes would transform the perceived quality without changing the layout or content.

**The content and architecture are genuinely good** — this is a site with real utility. The design just needs to catch up to the content quality.
