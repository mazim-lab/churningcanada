'use client';
import { useState, createContext, useContext } from 'react';
import { Menu, X } from 'lucide-react';

const MobileMenuContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

const navLinks = [
  { href: '/cards', label: 'Cards' },
  { href: '/compare', label: 'Compare' },
  { href: '/guides/us-cards-for-canadians', label: 'Guides' },
  { href: '/blog', label: 'Blog' },
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
          <a href="/" className="font-bold text-lg font-[family-name:var(--font-display)]">
            <span className="text-accent">Churning</span><span className="text-gold-text dark:text-gold">Canada</span>
            <span className="ml-0.5">🍁</span>
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
          <a href="/cards" className="block text-center rounded-full bg-gradient-to-r from-gold-dark to-gold px-6 py-2.5 text-sm font-semibold text-primary-dark hover:brightness-110 transition-all">
            Explore Cards
          </a>
        </div>
      </div>
    </div>
  );
}
