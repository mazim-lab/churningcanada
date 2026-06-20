import Link from "next/link";

export const metadata = {
  title: "Personal Finance — FinTerminal",
  description: "Practical, plain-language personal finance guides for Canadians, from tax-efficient borrowing to building real wealth.",
};

const ARTICLES = [
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
          <p className="lede">
            Money decisions are personal, and they are easier when someone explains the why and not just the
            what. These are the guides we wish we had earlier, written plainly, with your real life and your
            real constraints in mind. Start wherever you are.
          </p>

          <div className="cd-sec">Guides</div>
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/personal-finance/${a.slug}`} className="arow-card">
              <div className="at">{a.title}</div>
              <div className="ab">{a.dek}</div>
              <div className="am">
                <span className="tg">{a.tag}</span><span className="sep">·</span>
                <span>{a.read}</span><span className="sep">·</span>
                <span>{a.date}</span>
              </div>
            </Link>
          ))}

          <p className="lede" style={{ marginTop: 20 }}>
            More on the way, including TFSA versus RRSP in real numbers, a calm guide to your first taxable
            account, and how to think about debt when rates move.
          </p>
        </div>
      </main>
    </div>
  );
}
