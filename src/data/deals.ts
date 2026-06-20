export interface Deal {
  title: string;
  merchant: string;
  /** Direct link to the merchant. We never credit where we spotted it. */
  url: string;
  blurb: string;
  category: string;
  posted: string;
  expires?: string;
}

// Curated 2 to 3 times a day. Pick genuinely good value or anything that fits the
// cards / points / personal-finance theme. Always link straight to the merchant.
export const DEALS: Deal[] = [
  {
    title: "20% back in Scene+ points on select gift cards",
    merchant: "Scene+",
    url: "https://www.sceneplus.ca/",
    blurb:
      "Redeem Scene+ points for select gift cards and get 20 percent of those points back. If you were already sitting on a points balance with no travel plans, this is a tidy way to stretch it on everyday spending.",
    category: "Points",
    posted: "Jun 20, 2026",
    expires: "while supplies last",
  },
  {
    title: "0% interest for 18 months on balance transfers",
    merchant: "BMO",
    url: "https://www.bmo.com/en-ca/main/personal/credit-cards/",
    blurb:
      "The BMO Preferred Rate Mastercard is running a balance transfer offer at 0 percent for 18 months with a 1 percent transfer fee. If you are carrying a balance on a high-rate card, moving it here can buy you real breathing room to pay it down.",
    category: "Credit",
    posted: "Jun 20, 2026",
  },
  {
    title: "Concert Week: $30 all-in tickets",
    merchant: "Ticketmaster",
    url: "https://www.ticketmaster.ca/",
    blurb:
      "Ticketmaster's Concert Week brings back flat $30 all-in tickets to a long list of summer shows. A nice excuse to plan a night out without the usual sticker shock, and a good fit if you have a card that earns extra on entertainment.",
    category: "Entertainment",
    posted: "Jun 20, 2026",
    expires: "limited time",
  },
];
