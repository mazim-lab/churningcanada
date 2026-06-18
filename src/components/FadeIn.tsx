'use client';
import { useRef, useEffect, useState } from 'react';

export function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't available, reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      // threshold 0 + negative bottom rootMargin: reveal as soon as the top of
      // the section enters the viewport, so it's already visible by the time the
      // user reaches it (no blank gap on tall sections).
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);

    // Safety net: if the observer hasn't fired shortly after mount, reveal anyway.
    const fallback = setTimeout(() => setVisible(true), 600);

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
