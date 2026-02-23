import Image from 'next/image';
import { getIssuerStyle } from '@/data/card-images';

const ISSUER_LOGOS: Record<string, string> = {
  'American Express': '/logos/amex.png',
  'Amex': '/logos/amex.png',
  'Scotiabank': '/logos/scotiabank.png',
  'CIBC': '/logos/cibc.png',
  'BMO': '/logos/bmo.png',
  'RBC': '/logos/rbc.png',
  'TD': '/logos/td.png',
  'MBNA': '/logos/mbna.png',
  'Capital One': '/logos/capital-one.png',
  'Brim': '/logos/brim.png',
  'Brim Financial': '/logos/brim.png',
  'Neo': '/logos/neo.png',
  'Neo Financial': '/logos/neo.png',
  'Desjardins': '/logos/desjardins.png',
  'Home Trust': '/logos/hometrust.png',
  'Tangerine': '/logos/tangerine.png',
  'PC Financial': '/logos/pc-financial.png',
  'National Bank': '/logos/national-bank.png',
  'Rogers': '/logos/rogers.png',
  'Canadian Tire': '/logos/canadian-tire.png',
  'Simplii': '/logos/simplii.png',
  'Simplii Financial': '/logos/simplii.png',
  'Meridian': '/logos/meridian.png',
  'KOHO': '/logos/koho.png',
  'Chase': '/logos/chase.png',
  'Citi': '/logos/citi.png',
  'Bank of America': '/logos/bank-of-america.png',
  'Wells Fargo': '/logos/wells-fargo.png',
  'US Bank': '/logos/us-bank.png',
  'U.S. Bank': '/logos/us-bank.png',
  'Barclays': '/logos/barclays.png',
  'Bilt': '/logos/bilt.png',
  'HSBC': '/logos/hsbc.png',
  'Discover': '/logos/discover.png',
  'Wealthsimple': '/logos/wealthsimple.png',
};

function getLogoPath(issuer: string): string | null {
  if (ISSUER_LOGOS[issuer]) return ISSUER_LOGOS[issuer];
  for (const [key, path] of Object.entries(ISSUER_LOGOS)) {
    if (issuer.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(issuer.toLowerCase())) {
      return path;
    }
  }
  return null;
}

export function IssuerAvatar({ issuer, size = 'md' }: { issuer: string; size?: 'sm' | 'md' | 'lg' }) {
  const logo = getLogoPath(issuer);
  const sizeMap = { sm: 32, md: 40, lg: 56 };
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  if (logo) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden shrink-0 shadow-sm bg-white dark:bg-stone-100`}>
        <Image
          src={logo}
          alt={issuer}
          width={sizeMap[size]}
          height={sizeMap[size]}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
    );
  }

  // Fallback to initials
  const style = getIssuerStyle(issuer);
  const fallbackClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  return (
    <div className={`${fallbackClasses[size]} ${style.bg} ${style.text} rounded-lg flex items-center justify-center font-bold shrink-0 shadow-sm`}>
      {style.initials}
    </div>
  );
}
