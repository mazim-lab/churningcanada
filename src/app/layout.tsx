import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu, MobileMenuButton, MobileMenuProvider } from "@/components/MobileMenu";
import { allCards } from "@/data/cards";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MoneyAtlas — Cards, Points & Personal Finance for Canadians",
  description: `Navigate your money. Compare ${allCards.length}+ credit cards, maximize travel points, and master personal finance — built for Canadians.`,
  openGraph: {
    title: "MoneyAtlas",
    description: "Navigate your money — cards, points, and personal finance for Canadians.",
    type: "website",
  },
};

const NAV = [
  { label: "Cards", href: "/cards" },
  { label: "Travel", href: "/cards?type=travel&sort=value" },
  { label: "Money", href: "/blog" },
  { label: "Tools", href: "/compare" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${body.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MobileMenuProvider>
            <MobileMenu />
            <Header />
            <main className="min-h-[calc(100vh-140px)]">{children}</main>
            <Footer />
          </MobileMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2 font-[family-name:var(--font-display)] ${className}`}>
      <span aria-hidden className="text-xl leading-none">🧭</span>
      <span className="text-2xl leading-none tracking-tight">
        <span className="text-foreground">Money</span><span className="text-gold-text dark:text-gold">Atlas</span>
      </span>
    </a>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <Wordmark />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="relative text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="/cards" className="hidden sm:inline-flex rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary-dark hover:bg-gold-light transition-all shadow-sm shadow-gold/20">
            Find a card
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24">
      <div className="atlas-rule" />
      <div className="border-t border-border/60 bg-muted/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Cards</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/cards?country=CA" className="hover:text-foreground transition-colors">Canadian Cards</a></li>
                <li><a href="/cards?country=US" className="hover:text-foreground transition-colors">US Cards</a></li>
                <li><a href="/cards?type=cashback" className="hover:text-foreground transition-colors">Cashback Cards</a></li>
                <li><a href="/cards?maxFee=0" className="hover:text-foreground transition-colors">No-Fee Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Travel &amp; Points</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/cards?type=travel&sort=value" className="hover:text-foreground transition-colors">Best Travel Cards</a></li>
                <li><a href="/guides/us-cards-for-canadians" className="hover:text-foreground transition-colors">US Cards for Canadians</a></li>
                <li><a href="/compare" className="hover:text-foreground transition-colors">Compare Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Money</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/blog" className="hover:text-foreground transition-colors">Guides &amp; Articles</a></li>
                <li><a href="/guides/us-cards-for-canadians" className="hover:text-foreground transition-colors">Guides</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">MoneyAtlas helps Canadians navigate credit cards, travel rewards, and personal finance.</p>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border/60 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MoneyAtlas. Information only — not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
