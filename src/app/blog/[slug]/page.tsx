import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <div className="flex items-center gap-3 mb-8 text-sm text-muted-foreground">
          <span>ChurningCanada Team</span>
          <span>·</span>
          <span>5 min read</span>
        </div>

        <div className="rounded-xl border border-border bg-muted p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">Coming Soon</p>
          <p className="text-sm">This post is being written. Check back later!</p>
        </div>
      </article>
    </div>
  );
}
