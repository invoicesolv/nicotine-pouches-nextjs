'use client';

import { useEffect } from 'react';

interface SearchConsoleMonitorProps {
  pageUrl?: string;
  pageTitle?: string;
}

export default function SearchConsoleMonitor({ pageUrl, pageTitle }: SearchConsoleMonitorProps) {
  useEffect(() => {
    // Get current page info if not provided
    const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const currentTitle = pageTitle || (typeof document !== 'undefined' ? document.title : '');

    // Track page views for Search Console
    if (typeof window !== 'undefined' && window.gtag && currentUrl) {
      // Track page view with enhanced ecommerce data
      window.gtag('event', 'page_view', {
        page_title: currentTitle,
        page_location: currentUrl,
        page_path: new URL(currentUrl).pathname,
        content_group1: 'Search Console',
        content_group2: 'Page View'
      });

      // Track search console specific events
      window.gtag('event', 'search_console_page_view', {
        page_url: currentUrl,
        page_title: currentTitle,
        timestamp: new Date().toISOString()
      });
    }

    // Track Core Web Vitals for Search Console
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      // This would require the web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      // getCLS(console.log);
      // getFID(console.log);
      // getFCP(console.log);
      // getLCP(console.log);
      // getTTFB(console.log);
    }

    // Track search console specific metrics
    const trackSearchConsoleMetrics = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        // Track page load time
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        window.gtag('event', 'search_console_metrics', {
          page_url: pageUrl,
          load_time: loadTime,
          dom_content_loaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          first_paint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          first_contentful_paint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        });
      }
    };

    // Track metrics after page load
    if (document.readyState === 'complete') {
      trackSearchConsoleMetrics();
    } else {
      window.addEventListener('load', trackSearchConsoleMetrics);
    }

    return () => {
      window.removeEventListener('load', trackSearchConsoleMetrics);
    };
  }, [pageUrl, pageTitle]);

  return null; // This component doesn't render anything
}
