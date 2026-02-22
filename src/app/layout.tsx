import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ChurningCanada — Find the Best Credit Cards in Canada",
  description: "Compare 192+ credit cards across Canada and the US. Find the best travel, cashback, and rewards cards for Canadians.",
  openGraph: {
    title: "ChurningCanada",
    description: "The smartest way to earn rewards in Canada",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Header />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight font-[family-name:var(--font-display)]">
          <span className="text-primary text-2xl leading-none">Churning</span><span className="text-gold-text dark:text-gold text-2xl leading-none">Canada</span>
          <span className="text-xl leading-none ml-0.5">🍁</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/cards" className="text-muted-foreground hover:text-foreground transition-colors">Cards</a>
          <a href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
          <a href="/guides/us-cards-for-canadians" className="text-muted-foreground hover:text-foreground transition-colors">Guides</a>
          <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="/cards" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors">
            Explore Cards
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer-gradient mt-20">
      <div className="border-t border-border/50 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Cards</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/cards?country=CA" className="hover:text-foreground transition-colors">Canadian Cards</a></li>
                <li><a href="/cards?country=US" className="hover:text-foreground transition-colors">US Cards</a></li>
                <li><a href="/cards?type=travel" className="hover:text-foreground transition-colors">Travel Cards</a></li>
                <li><a href="/cards?type=cashback" className="hover:text-foreground transition-colors">Cashback Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Tools</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/compare" className="hover:text-foreground transition-colors">Compare Cards</a></li>
                <li><a href="/cards?fee=0" className="hover:text-foreground transition-colors">No Fee Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">Learn</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="/guides/us-cards-for-canadians" className="hover:text-foreground transition-colors">US Cards for Canadians</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/70">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">ChurningCanada helps Canadians find and compare the best credit cards.</p>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2025 ChurningCanada. Not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
