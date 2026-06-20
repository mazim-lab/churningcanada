'use client';
import { useState, createContext, useContext } from 'react';
import { Menu, X } from 'lucide-react';

const MobileMenuContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/personal-finance', label: 'Personal Finance' },
  { href: '/deals', label: 'Deals' },
  { href: '/cards', label: 'Credit Cards' },
  { href: '/travel', label: 'Travel & Points' },
  { href: '/portfolio', label: 'Current Portfolio' },
];

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function MobileMenuButton() {
  const { setOpen } = useContext(MobileMenuContext);
  return (
    <button className="md:hidden p-2 -ml-2 text-foreground" onClick={() => setOpen(true)} aria-label="Open menu">
      <Menu className="w-5 h-5" />
    </button>
  );
}

export function MobileMenu() {
  const { open, setOpen } = useContext(MobileMenuContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="absolute top-0 left-0 h-full w-72 bg-card shadow-2xl border-r border-border">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <a href="/" className="flex items-center gap-2 text-base font-bold tracking-wide font-[family-name:var(--font-mono)]">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="12,1 13.6,10.4 23,12 13.6,13.6 12,23 10.4,13.6 1,12 10.4,10.4" fill="#E12B22" />
              <polygon points="12,5 12.9,11.1 19,12 12.9,12.9 12,19 11.1,12.9 5,12 11.1,11.1" fill="#EFE8D6" transform="rotate(45 12 12)" />
              <circle cx="12" cy="12" r="2.1" fill="#EFE8D6" stroke="#E12B22" strokeWidth="1.1" />
            </svg>
            <span className="text-foreground">FinTerminal</span>
          </a>
          <button onClick={() => setOpen(false)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50">
          <a href="/cards" className="block text-center rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-dark hover:bg-gold-light transition-all">
            Find a card
          </a>
        </div>
      </div>
    </div>
  );
}
