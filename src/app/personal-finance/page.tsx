import { LoadMoreCards } from "@/components/LoadMoreCards";

export const metadata = {
  title: "Personal Finance — FinTerminal",
  description: "Practical, plain-language personal finance guides for Canadians, from tax-efficient borrowing to building real wealth.",
};

const ARTICLES = [
  {
    slug: "costco-membership-worth-it-canada",
    title: "Does a Costco membership pay for itself?",
    dek: "A clear, no-hype look at Costco Canada's fees, the 2% Executive reward, and where the savings really come from, so you can run the breakeven math for your own household.",
    tag: "Money",
    read: "8 min read",
    date: "Jun 2026",
  },
  {
    slug: "smith-manoeuvre",
    title: "The Smith Manoeuvre, explained properly",
    dek: "How Canadian homeowners can turn mortgage interest into a tax deduction and build an investment portfolio at the same time. Every variation, step by step, with the risks laid out honestly.",
    tag: "Strategy",
    read: "18 min read",
    date: "Jun 2026",
  },
];

export default function PersonalFinancePage() {
  return (
    <div className="app norail">
      <main>
        <div className="doc">
          <div className="head"><h1>Personal Finance</h1></div>

          <div className="cd-sec">Guides</div>
          <LoadMoreCards
            cards={ARTICLES.map((a) => ({
              href: `/personal-finance/${a.slug}`,
              title: a.title,
              dek: a.dek,
              tag: a.tag,
              meta: [a.read, a.date],
            }))}
            pageSize={10}
          />

          <p className="lede" style={{ marginTop: 20 }}>
            More on the way, including TFSA versus RRSP in real numbers, a calm guide to your first taxable
            account, and how to think about debt when rates move.
          </p>
        </div>
      </main>
    </div>
  );
}
