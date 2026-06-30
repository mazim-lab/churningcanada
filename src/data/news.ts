export interface NewsItem {
  /** Headline timestamp for the typewriter ticker. */
  time: string;
  /** URL slug for the item's own page at /news/<slug>. */
  slug: string;
  headline: string;
  dek: string;
  body: string;
  category: string;
  region: "CA" | "US";
  /** Day-level date the story hit the wire, "Mon D, YYYY" (e.g. "Jun 30, 2026"). */
  date: string;
  /**
   * Only set this for genuine scoops that an outlet broke exclusively. We then
   * credit them ("According to ..."). Public info like offer changes needs no credit.
   */
  exclusive?: string[];
  /** Primary source (issuer / program), shown as a small label. */
  sourceLabel?: string;
  /** First-party link to the official announcement / offer page (the source). */
  sourceUrl?: string;
  /** Optional related section/filter to jump to (a card filter, a guide, deals). */
  href?: string;
  /** Short label for that section link, e.g. "Compare Aeroplan cards". */
  hrefLabel?: string;
}

// Canadian market first. Newest at the top. This is a permanent append-only
// archive: never delete or rewrite existing items, only prepend new ones.
export const NEWS: NewsItem[] = [
  {
    time: "11:30",
    slug: "petro-canada-triangle-canada-day-bonus-ct-money",
    headline: "Petro-Canada is handing out bonus CT Money on Canada Day fill-ups",
    dek: "From July 1 to 5 you can collect $3 in bonus Canadian Tire Money every time you pump 25 litres or more, and there is no cap on how often you earn it.",
    body:
      "If you have a road trip or even just a few errands lined up around Canada Day, this is an easy bit of value to grab. Petro-Canada and Triangle Rewards are giving $3 in bonus CT Money on every fuel-up of 25 litres or more between July 1 and July 5, and unlike a lot of these promos there is no one-and-done limit, so each separate fill counts. You will need to scan your Triangle Rewards card or a linked cardless method at the pump, or pay with a Triangle credit card, for it to register. It is not life-changing money, but if you were filling up anyway it adds up nicely across the week, especially when more than one driver in the household is pumping gas.",
    category: "Loyalty programs",
    region: "CA",
    date: "Jun 29, 2026",
    sourceLabel: "Petro-Canada and Triangle Rewards",
  },
  {
    time: "11:00",
    slug: "aeroplan-estore-20x-canadian-down-feather",
    headline: "Earn 20x Aeroplan points on bedding from the Canadian Down & Feather Company",
    dek: "Through July 12 the Aeroplan eStore is paying 20 points per dollar at the Canadian-made bedding brand, one of the richest multipliers we have seen on the portal this year.",
    body:
      "This is a nice one if a new duvet or fresh pillows were already on your list. From now through July 12 you earn 20 Aeroplan points for every dollar you spend at the Canadian Down & Feather Company when you start your shopping through the Aeroplan eStore, which works out to roughly a 30 percent return once you value the points. The habit to build is clicking through the eStore first and easing off any ad blockers, since that tracking is what triggers the bonus. We would not buy bedding you do not actually need just to chase points, but if you were going to replace yours anyway, this is a tidy way to pad your Aeroplan balance toward the next trip.",
    category: "Travel and points",
    region: "CA",
    date: "Jun 29, 2026",
    sourceLabel: "Aeroplan",
    href: "/travel/aeroplan-sweet-spots",
    hrefLabel: "Aeroplan sweet-spots guide",
  },
  {
    time: "10:30",
    slug: "amex-aeroplan-reserve-150k-welcome",
    headline: "The Amex Aeroplan Reserve is back at its all-time-high 150,000-point welcome offer",
    dek: "Through July 28 new cardmembers can earn up to 150,000 Aeroplan points, the richest welcome bonus this card has ever carried.",
    body:
      "If a premium Aeroplan card has been on your radar, this is the strongest window we have seen. The offer breaks into 70,000 points after $7,500 of spending in the first three months, another 40,000 once you reach $45,000 in the first year, and a final 40,000 for a purchase made between months 15 and 17. Those are serious spend targets, so this really suits a household that already runs big everyday expenses through one card rather than someone stretching to hit them. Applications close July 28, and the annual fee and perks are worth weighing against how often you actually fly Air Canada.",
    category: "Card offers",
    region: "CA",
    date: "Jun 28, 2026",
    sourceLabel: "American Express",
    href: "/cards?q=aeroplan",
    hrefLabel: "Compare Aeroplan cards",
  },
  {
    time: "10:00",
    slug: "westjet-companion-voucher-fuel-surcharge-trimmed",
    headline: "WestJet trims the companion voucher fuel surcharge from $60 to $40",
    dek: "As fuel prices ease, WestJet has cut the surcharge on companion voucher bookings to $40, with Porter going further down to $20.",
    body:
      "Here is a small but welcome bit of relief for WestJet Rewards members. The fuel surcharge WestJet added to companion voucher bookings back in April, tied to the spike around the Strait of Hormuz, has come down from $60 to $40 per booking now that oil prices have settled. Porter made a similar move in the same week, halving its reward-flight surcharge to $20. It is not a huge sum either way, but if you were holding a companion voucher for a summer trip, it is a little less to pay at checkout.",
    category: "Travel and points",
    region: "CA",
    date: "Jun 26, 2026",
    sourceLabel: "WestJet",
    href: "/travel",
    hrefLabel: "Explore travel and points",
  },
  {
    time: "09:30",
    slug: "british-airways-porter-codeshare-avios",
    headline: "British Airways and Porter launch a codeshare, and you can earn Avios on Porter flights",
    dek: "From July 8 you can book 17 Porter destinations across Canada on a single British Airways ticket and earn Avios and tier points on the Porter legs.",
    body:
      "This is a genuinely handy tie-up for anyone who flies between Canada and the UK. Starting July 8 British Airways customers can connect through Toronto or Montreal to seventeen Porter cities, from Ottawa and Halifax to Edmonton and Winnipeg, all on one booking. The part that matters for points is that British Airways Club members earn Avios and tier points on these Porter-operated flights, with the haul based on your BA fare rather than the distance. If you have been parking Avios for a European trip, those short domestic hops can now quietly help you get there.",
    category: "Travel and points",
    region: "CA",
    date: "Jun 24, 2026",
    sourceLabel: "British Airways",
    sourceUrl: "https://mediacentre.britishairways.com/news/24062026/british-airways-and-porter-airlines-announce-new-codeshare-agreement-1",
    href: "/travel",
    hrefLabel: "Explore travel and points",
  },
  {
    time: "09:00",
    slug: "rbc-avion-ticketmaster-redemption",
    headline: "RBC opens up Avion points for Ticketmaster events across Canada",
    dek: "Avion Rewards members can now put points toward concert and event tickets on Ticketmaster.ca, from a single cent up to $500 a day with no redemption fees.",
    body:
      "RBC and Live Nation Canada have wired Avion Rewards straight into Ticketmaster.ca, so you can link your accounts and let points cover part or all of a ticket. You can apply anywhere from one cent up to $500 worth of points per day with no added redemption fee, which makes it easy to shave a bit off a night out you were buying anyway. One honest note: Avion points usually stretch further against flights, so we would lean on this for shows you were already going to, not as your main way to spend points.",
    category: "Loyalty programs",
    region: "CA",
    date: "Jun 17, 2026",
    sourceLabel: "RBC Avion Rewards",
    sourceUrl: "https://www.newswire.ca/news-releases/rbc-and-live-nation-canada-launch-avion-rewards-points-redemption-for-ticketmaster-events-across-canada-829995608.html",
    href: "/cards?q=avion",
    hrefLabel: "Compare Avion cards",
  },
  {
    time: "08:30",
    slug: "chase-sapphire-preferred-100k-refresh",
    headline: "Chase Sapphire Preferred refreshes its perks and brings back a 100,000-point bonus",
    dek: "The June refresh keeps the $95 annual fee while adding a $100 hotel credit and a Global Entry, TSA PreCheck or NEXUS credit, alongside its best-ever welcome offer.",
    body:
      "This one is for Canadians who have built a US credit profile and can apply on the US side. Chase kept the Sapphire Preferred's $95 annual fee through a mid-June refresh that doubled the Chase Travel hotel credit to $100, added a $120 Global Entry, TSA PreCheck or NEXUS credit every four years, and tucked in a few new bonus categories. The headline is the 100,000-point welcome offer after $5,000 of spending in three months, which matches the richest bonus this card has ever run, and these elevated offers tend not to stick around. New to the US side of the hobby? Our guide walks the whole path from a Canadian start, including the 5/24 rule worth keeping in mind.",
    category: "US market",
    region: "US",
    date: "Jun 15, 2026",
    sourceLabel: "Chase",
    sourceUrl: "https://media.chase.com/news/Meet-the-New-Chase-Sapphire-Preferred",
    href: "/guides/us-cards-for-canadians",
    hrefLabel: "US cards for Canadians guide",
  },
];
