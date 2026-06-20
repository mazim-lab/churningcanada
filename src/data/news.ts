export interface NewsItem {
  /** Headline timestamp for the typewriter ticker. */
  time: string;
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
  /** Where "read more" points. Prefer our own pages. */
  href?: string;
}

// Canadian market first. Newest at the top.
export const NEWS: NewsItem[] = [
  {
    time: "09:40",
    headline: "Amex Canada lifts welcome bonuses across its Membership Rewards cards",
    dek: "American Express has refreshed the offers on its Membership Rewards lineup, with the top of the range now reaching up to 170,000 points.",
    body:
      "If a points-earning Amex has been on your list, this is a good window to look. The elevated offers span the Cobalt, Gold, and Platinum cards, and those Membership Rewards points transfer to Aeroplan at one to one when you are ready to book a trip.",
    category: "Card offers",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "American Express",
    href: "/cards?q=membership%20rewards",
  },
  {
    time: "09:12",
    headline: "Amex Aeroplan Reserve cards return with up to 95,000 points",
    dek: "The premium Aeroplan Reserve and Aeroplan Business Reserve cards are back with refreshed welcome offers worth up to 85,000 and 95,000 Aeroplan points.",
    body:
      "These are among the richer Aeroplan offers we have seen this year. As always, weigh the welcome points against the annual fee and the perks you will actually use, and have a redemption in mind so the points go to work quickly.",
    category: "Card offers",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "American Express",
    href: "/cards?q=aeroplan",
  },
  {
    time: "08:48",
    headline: "Aeroplan gives 10,000 points back on hotel redemptions",
    dek: "Redeem 50,000 points or more on an Aeroplan hotel stay and get 10,000 points back, through June 22.",
    body:
      "Hotel redemptions usually are not where Aeroplan shines, but a 10,000-point rebate changes the math on a stay you were already planning. If a flight redemption makes more sense for you, our sweet-spots guide walks through where the real value tends to hide.",
    category: "Promotions",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "Aeroplan",
    href: "/travel/aeroplan-sweet-spots",
  },
  {
    time: "08:20",
    headline: "TD bumps its Aeroplan Visa welcome offers to as much as 45,000 points",
    dek: "TD's Aeroplan co-branded cards are carrying higher welcome bonuses, with up to 45,000 points on the table depending on the card.",
    body:
      "TD's Aeroplan cards can be a comfortable home base for Air Canada flyers, especially with the first-year fee rebates that often come attached. Check the spend requirement and the fee carefully so the offer fits your real budget.",
    category: "Card offers",
    region: "CA",
    date: "Jun 2026",
    sourceLabel: "TD",
    href: "/cards?q=td%20aeroplan",
  },
  {
    time: "07:55",
    headline: "Chase Ink business cards jump to 100,000 points for US-card collectors",
    dek: "The Chase Ink Business Cash and Ink Business Unlimited are offering 100,000 points after $8,000 of spending in four months, starting mid-month.",
    body:
      "This one is for Canadians who have built a US credit profile. Chase business cards do not count toward the 5/24 rule, which makes them a useful piece of the puzzle. New to the US side of the hobby? Our ITIN guide covers the whole path from a Canadian start.",
    category: "US market",
    region: "US",
    date: "Jun 2026",
    sourceLabel: "Chase",
    href: "/guides/us-cards-for-canadians",
  },
];
