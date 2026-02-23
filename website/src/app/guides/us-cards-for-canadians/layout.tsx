import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ITIN Guide: How Canadians Can Get US Credit Cards (2026 Step-by-Step)',
  description:
    'Complete step-by-step guide for Canadians to get a US mailing address, ITIN, build US credit history, and apply for the best US rewards credit cards including Chase, Amex, and Citi.',
  openGraph: {
    title: 'The Complete Guide to US Credit Cards for Canadians',
    description:
      'Everything you need to know about getting an ITIN, building US credit, and accessing the world\'s best rewards cards.',
    type: 'article',
  },
};

export default function USCardsGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
