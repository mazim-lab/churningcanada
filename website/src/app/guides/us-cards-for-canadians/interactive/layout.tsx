import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Guide: US Credit Cards for Canadians (Step-by-Step Wizard)',
  description:
    'Interactive step-by-step wizard to help Canadians get a US mailing address, ITIN, build US credit history, and apply for the best US rewards credit cards.',
  openGraph: {
    title: 'Interactive Guide: US Credit Cards for Canadians',
    description:
      'Walk through 7 steps to unlock US credit cards as a Canadian — with checklists and progress tracking.',
    type: 'article',
  },
};

export default function InteractiveGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
