"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SplitFlapWordmark } from "./SplitFlapWordmark";
import { Ticker } from "./Ticker";

const NAV = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Personal Finance", href: "/personal-finance" },
  { label: "Deals", href: "/deals" },
  { label: "Credit Cards", href: "/cards" },
  { label: "Travel & Points", href: "/travel" },
  { label: "Current Portfolio", href: "/portfolio" },
];

export function TerminalHeader() {
  const path = usePathname() || "/";
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <div className="topbar">
      <SplitFlapWordmark />
      <nav>
        {NAV.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <a key={n.href} href={n.href} className={active ? "on" : ""}>
              {n.label}
            </a>
          );
        })}
      </nav>
      <div className="right">
        <Ticker />
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") router.push(`/cards${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
          placeholder="⌘K  search 195 cards…"
        />
      </div>
    </div>
  );
}
