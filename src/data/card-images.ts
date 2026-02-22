// Issuer color/initial mapping for avatar components

export interface IssuerStyle {
  initials: string;
  bg: string;
  text: string;
}

const ISSUER_STYLES: Record<string, IssuerStyle> = {
  'American Express': { initials: 'AE', bg: 'bg-blue-600', text: 'text-white' },
  'Amex': { initials: 'AE', bg: 'bg-blue-600', text: 'text-white' },
  'Chase': { initials: 'CH', bg: 'bg-blue-700', text: 'text-white' },
  'Scotiabank': { initials: 'SB', bg: 'bg-red-600', text: 'text-white' },
  'BMO': { initials: 'BMO', bg: 'bg-sky-600', text: 'text-white' },
  'RBC': { initials: 'RBC', bg: 'bg-blue-800', text: 'text-yellow-300' },
  'TD': { initials: 'TD', bg: 'bg-green-600', text: 'text-white' },
  'CIBC': { initials: 'CIBC', bg: 'bg-red-700', text: 'text-white' },
  'Capital One': { initials: 'C1', bg: 'bg-red-600', text: 'text-white' },
  'Citi': { initials: 'Citi', bg: 'bg-blue-500', text: 'text-white' },
  'HSBC': { initials: 'HSBC', bg: 'bg-red-600', text: 'text-white' },
  'National Bank': { initials: 'NB', bg: 'bg-red-500', text: 'text-white' },
  'Desjardins': { initials: 'DJ', bg: 'bg-green-700', text: 'text-white' },
  'Tangerine': { initials: 'TG', bg: 'bg-orange-500', text: 'text-white' },
  'Simplii': { initials: 'SM', bg: 'bg-orange-600', text: 'text-white' },
  'Rogers': { initials: 'RG', bg: 'bg-red-500', text: 'text-white' },
  'PC Financial': { initials: 'PC', bg: 'bg-red-700', text: 'text-white' },
  'Brim': { initials: 'BR', bg: 'bg-slate-800', text: 'text-white' },
  'Neo': { initials: 'Neo', bg: 'bg-violet-600', text: 'text-white' },
  'Wealthsimple': { initials: 'WS', bg: 'bg-slate-900', text: 'text-white' },
  'MBNA': { initials: 'MB', bg: 'bg-blue-800', text: 'text-white' },
  'US Bank': { initials: 'USB', bg: 'bg-red-700', text: 'text-white' },
  'Wells Fargo': { initials: 'WF', bg: 'bg-red-600', text: 'text-yellow-300' },
  'Bank of America': { initials: 'BoA', bg: 'bg-red-700', text: 'text-white' },
  'Barclays': { initials: 'BC', bg: 'bg-cyan-600', text: 'text-white' },
  'Discover': { initials: 'DI', bg: 'bg-orange-500', text: 'text-white' },
};

export function getIssuerStyle(issuer: string): IssuerStyle {
  // Exact match
  if (ISSUER_STYLES[issuer]) return ISSUER_STYLES[issuer];
  // Partial match
  for (const [key, style] of Object.entries(ISSUER_STYLES)) {
    if (issuer.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(issuer.toLowerCase())) {
      return style;
    }
  }
  // Fallback: generate from issuer name
  const initials = issuer.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return { initials, bg: 'bg-slate-600', text: 'text-white' };
}

export interface NetworkStyle {
  label: string;
  bg: string;
  text: string;
}

const NETWORK_STYLES: Record<string, NetworkStyle> = {
  'Visa': { label: 'VISA', bg: 'bg-blue-700', text: 'text-white' },
  'Mastercard': { label: 'MC', bg: 'bg-orange-600', text: 'text-white' },
  'Amex': { label: 'AMEX', bg: 'bg-blue-500', text: 'text-white' },
  'American Express': { label: 'AMEX', bg: 'bg-blue-500', text: 'text-white' },
  'Discover': { label: 'DISC', bg: 'bg-orange-500', text: 'text-white' },
};

export function getNetworkStyle(network: string): NetworkStyle {
  if (NETWORK_STYLES[network]) return NETWORK_STYLES[network];
  return { label: network.slice(0, 4).toUpperCase(), bg: 'bg-slate-500', text: 'text-white' };
}

// Category color coding for left border — warm tones
export function getCategoryColor(cardType: string): string {
  switch (cardType.toLowerCase()) {
    case 'travel': return 'border-l-emerald-700';
    case 'cashback': return 'border-l-amber-500';
    case 'rewards': return 'border-l-purple-700';
    case 'hotel': return 'border-l-amber-800';
    case 'airline': return 'border-l-sky-500';
    case 'business': return 'border-l-stone-600';
    case 'student': return 'border-l-teal-600';
    case 'secured': return 'border-l-stone-400';
    default: return 'border-l-stone-400';
  }
}
