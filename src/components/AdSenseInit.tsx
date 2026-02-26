'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Small delay to ensure ads are in DOM
    const timer = setTimeout(() => {
      try {
        const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        if (ads.length > 0 && typeof window !== 'undefined') {
          ads.forEach(() => {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          });
        }
      } catch (err) {
        // Silently handle - ads may already be initialized
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  return null;
}
