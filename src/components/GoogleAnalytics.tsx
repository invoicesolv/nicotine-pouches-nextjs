'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views on route changes
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9FT722JELW';
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.origin + url,
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}
