import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Doto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MobileMenu, MobileMenuProvider } from "@/components/MobileMenu";
import { TerminalHeader } from "@/components/TerminalHeader";
import { allCards } from "@/data/cards";
import "./globals.css";
import "./terminal.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", weight: ["400", "500", "700"], variable: "--font-jetbrains" });
const doto = Doto({ subsets: ["latin"], display: "swap", weight: ["500", "700", "900"], variable: "--font-doto" });

export const metadata: Metadata = {
  title: "FinTerminal — Cards, Points & Personal Finance for Canadians",
  description: `The terminal for Canadian money: compare ${allCards.length}+ credit cards, maximize travel points, and track a real portfolio — verified data, no sponsored noise.`,
  openGraph: {
    title: "FinTerminal",
    description: "The terminal for Canadian money — cards, points, personal finance and a live portfolio.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${doto.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <MobileMenuProvider>
            <MobileMenu />
            <TerminalHeader />
            {children}
          </MobileMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
