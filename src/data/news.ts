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

// Canadian market first. Newest at the top.
export const NEWS: NewsItem[] = [
  {
    time: "11:30",
    slug: "british-airways-porter-codeshare-avios",
    headline: "British Airways and Porter sign a codeshare, and you can earn Avios on Porter flights",
    dek: "From July 8 you can book 17 Porter destinations across Canada on a single British Airways ticket and earn Avios and tier points on the Porter legs.",
    body:
      "This is a genuinely useful tie-up for anyone who flies between Canada and the UK. British Airways customers can now connect through Toronto or Montreal to seventeen Porter cities, from Ottawa and Halifax to Edmonton and Victoria, all on one booking. The part that matters for points is that British Airways Club members earn Avios and tier points on eligible Porter-operated flights. If you have been parking Avios for a European trip, those short domestic hops can now quietly help you get there.",
    category: "Travel and points",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "British Airways",
    sourceUrl: "https://mediacentre.britishairways.com/news/24062026/british-airways-and-porter-airlines-announce-new-codeshare-agreement-1",
    href: "/travel",
    hrefLabel: "Explore travel and points",
  },
  {
    time: "11:05",
    slug: "rbc-avion-ticketmaster-redemption",
    headline: "RBC opens up Avion points for Ticketmaster events across Canada",
    dek: "Avion Rewards members can now put points toward concert and event tickets on Ticketmaster.ca, from one cent up to $500 a day with no redemption fees.",
    body:
      "RBC and Live Nation Canada have wired Avion Rewards straight into Ticketmaster.ca, so you can link your accounts and let points cover part or all of a ticket. You can apply anywhere from a single cent up to $500 worth of points per day, with no added redemption fee, which makes it easy to shave a bit off a night out you were buying anyway. One honest note: Avion points usually stretch further against flights, so we would lean on this for shows you were already going to, not as your main way to spend points.",
    category: "Loyalty programs",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "RBC Avion Rewards",
    sourceUrl: "https://www.newswire.ca/news-releases/rbc-and-live-nation-canada-launch-avion-rewards-points-redemption-for-ticketmaster-events-across-canada-829995608.html",
    href: "/cards?q=avion",
    hrefLabel: "Compare Avion cards",
  },
  {
    time: "10:40",
    slug: "scotiabank-preferred-package-fee-rebate",
    headline: "Scotiabank adds a $40 card-fee rebate for Preferred Package clients",
    dek: "As of June 22, Preferred Package account holders can get a $40 annual fee rebate on one eligible Scotiabank credit card, starting at their next card anniversary.",
    body:
      "If you already bank with Scotiabank on a Preferred Package, this quietly lowers the cost of carrying one of their cards. The $40 rebate lands on one eligible card where you are the primary cardholder, kicking in on the first anniversary after June 22. The catch worth knowing is the condition attached: you generally need at least $15,000 in qualifying purchases on that card over the prior twelve months, so it rewards steady everyday use rather than a card you rarely touch.",
    category: "Personal finance",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "Scotiabank",
    href: "/cards?q=scotiabank",
    hrefLabel: "Compare Scotiabank cards",
  },
  {
    time: "10:10",
    slug: "amex-canada-membership-rewards-highs",
    headline: "Amex Canada is running some of its richest Membership Rewards offers in years",
    dek: "The current welcome bonuses span the Cobalt, Gold, and Platinum, with the Platinum reaching up to 170,000 points, and applications close July 28.",
    body:
      "If a points-earning Amex has been on your list, this is a strong window to look. The Platinum sits at the top of the range at up to 170,000 Membership Rewards points, earned in stages across the first year and a bit, while the Gold and Cobalt carry their own elevated offers. Remember these are tiered bonuses with real spend requirements behind each milestone, so check that the targets fit your normal budget before you apply. Membership Rewards points transfer to Aeroplan at one to one when you are ready to book.",
    category: "Card offers",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "American Express",
    href: "/cards?q=membership%20rewards",
    hrefLabel: "Compare Membership Rewards cards",
  },
  {
    time: "09:35",
    slug: "westjet-rbc-welcome-offers",
    headline: "WestJet RBC cards return with up to 30,000 welcome points",
    dek: "Apply between June 16 and November 3 and the WestJet RBC World Elite Mastercard carries up to 30,000 WestJet points, with 5,000 on the standard card.",
    body:
      "For families who lean on WestJet, this is a comfortable home-base card again. The World Elite version offers up to 30,000 welcome WestJet points, while the standard WestJet RBC Mastercard gives 5,000 points after your first purchase. As always, weigh the annual fee and the spend tied to the bonus against how often you actually fly WestJet, and remember WestJet points are most valuable on their own flights rather than as a flexible currency.",
    category: "Card offers",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "RBC",
    href: "/cards?q=westjet",
    hrefLabel: "Compare WestJet cards",
  },
  {
    time: "09:05",
    slug: "chase-sapphire-preferred-100k",
    headline: "Chase Sapphire Preferred brings back its 100,000-point bonus for US-card collectors",
    dek: "The refreshed Sapphire Preferred is offering 100,000 points after $5,000 of spending in three months, only the third time it has hit that level in seventeen years.",
    body:
      "This one is for Canadians who have built a US credit profile and can apply on the US side. The Sapphire Preferred kept its $95 annual fee through a June refresh that added a $100 Chase Travel hotel credit, a Global Entry, TSA PreCheck or Nexus credit, and new bonus categories. The 100,000-point offer is the headline, and these elevated bonuses have historically not lasted long, so do not dawdle if it fits. New to the US side of the hobby? Our ITIN guide walks the whole path from a Canadian start, including the 5/24 rule to keep in mind.",
    category: "US market",
    region: "US",
    date: "Jun 2026",
    sourceLabel: "Chase",
    href: "/guides/us-cards-for-canadians",
    hrefLabel: "US cards for Canadians guide",
  },
  {
    time: "08:30",
    slug: "aeroplan-buy-points-30-percent",
    headline: "Aeroplan's buy-points promo offers up to 30 percent off through June 30",
    dek: "Air Canada is discounting purchased Aeroplan points by up to 30 percent until the end of June, with the top tier reached at 100,000 points bought.",
    body:
      "Speculatively buying points is rarely a good idea, but topping up to reach a specific award you have already found can pay off, and right now the discount climbs to 30 percent on larger purchases through June 30. Two honest caveats before you jump: only buy if you have a concrete high-value redemption in mind, and remember the June 1 reward-chart update pushed several long-haul premium awards higher, so price your trip first. Our sweet-spots guide can help you find redemptions where points like these still go a long way.",
    category: "Promotions",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "Aeroplan",
    href: "/travel/aeroplan-sweet-spots",
    hrefLabel: "Aeroplan sweet-spots guide",
  },
];
