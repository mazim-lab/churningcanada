export interface SweetSpot {
  /** URL slug for the post's own page at /travel/sweet-spots/<slug>. */
  slug: string;
  /** The loyalty program this example uses, e.g. "Aeroplan". Drives the rotation. */
  program: string;
  /** Post headline. */
  title: string;
  /** One-sentence summary shown on the travel tab and as the lede. */
  dek: string;
  /** Short read estimate, e.g. "5 min read". */
  read: string;
  /** Month-year stamp, e.g. "Jun 2026". */
  date: string;
  /** Body copy. Split into paragraphs on blank lines when rendered. */
  body: string;
  /** Optional on-site link (a card filter or guide) and its label. */
  href?: string;
  hrefLabel?: string;
}

/**
 * The rotation the twice-weekly sweet-spot cron walks through. Each run posts a
 * worked example for the NEXT program after the most recent SWEET_SPOTS entry,
 * looping back to the start. Keep this list in the intended order.
 */
export const ROTATION = [
  "Aeroplan",
  "Avios",
  "WestJet",
  "Delta",
  "United",
  "Alaska",
  "Flying Blue",
] as const;

// Newest at the top. Each entry is one worked redemption example in the house
// voice. The twice-weekly cron prepends a new one for the next program in
// ROTATION. See docs/CRON_RUNBOOK.md section 5.
export const SWEET_SPOTS: SweetSpot[] = [
  {
    slug: "aeroplan-toronto-to-europe-business-60k",
    program: "Aeroplan",
    title: "Aeroplan sweet spot: Toronto to Europe in business for about 60,000 points",
    dek: "A worked example of the redemption Aeroplan is famous for, a lie-flat seat across the Atlantic for roughly 60,000 points one-way and very little cash.",
    read: "5 min read",
    date: "Jun 2026",
    body:
      "Let us walk through one of the cleanest uses of Aeroplan points there is, a one-way business class seat from Toronto to Europe. This is an example to show how the math works, not a quote on any specific date, so always confirm the live price when you search.\n\nThe setup is simple. Aeroplan prices flights on Star Alliance partners from a distance and region based chart rather than the floating cash fare, and Toronto to most of Europe sits in a band that lands around 60,000 points one-way in business off-peak. The same seat in cash often runs three to four thousand dollars or more, which is what makes this redemption sing.\n\nHere is the cents-per-point math on a realistic booking. Say the cash fare is $3,600 and the award books for 60,000 points plus about $200 in taxes and fees. That works out to (3600 minus 200) divided by 60000, times 100, which is roughly 5.7 cents per point. Anything north of 2 cents is a good use of Aeroplan, so this is squarely in the range where your points are doing real work.\n\nTwo things make it even better. Aeroplan does not pass along carrier-imposed fuel surcharges, so the cash you pay stays low on partners like Lufthansa, Swiss, Austrian, or Brussels Airlines. And if your route connects through a partner hub, you can often add an Aeroplan stopover for a flat 5,000 points, turning one trip into two destinations.\n\nA few honest caveats. Partner business space is limited and the best dates go quickly, so flexibility helps a lot, and you want to search a few days on either side of your ideal date. The June 1 chart update nudged several long-haul premium awards higher, so price your specific trip before you assume a number. And book the moment the math works and the seat is there, because award seats are not held for free while you think it over.",
    href: "/travel/aeroplan-sweet-spots",
    hrefLabel: "Full Aeroplan sweet-spots guide",
  },
];
