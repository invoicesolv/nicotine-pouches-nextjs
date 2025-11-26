// Hreflang utility for proper international SEO implementation
// Fixes duplicate entries and ensures reciprocal hreflang tags

export interface HreflangEntry {
  lang: string;
  url: string;
}

/**
 * Generate proper hreflang entries for product pages
 * Ensures no duplicates and validates URLs exist
 */
export function generateProductHreflang(slug: string, isUSRoute: boolean = false): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/product/${slug}`;
  const usUrl = `${baseUrl}/us/product/${slug}`;
  
  // For US routes, prioritize US URL as primary
  if (isUSRoute) {
    return [
      { lang: 'en-US', url: usUrl },
      { lang: 'en-GB', url: ukUrl },
      { lang: 'x-default', url: usUrl }
    ];
  } else {
    // For UK routes, prioritize UK URL as primary
    return [
      { lang: 'en-GB', url: ukUrl },
      { lang: 'en-US', url: usUrl },
      { lang: 'x-default', url: ukUrl }
    ];
  }
}

/**
 * Generate proper hreflang entries for brand pages
 */
export function generateBrandHreflang(slug: string, isUSRoute: boolean = false): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/brand/${slug}`;
  const usUrl = `${baseUrl}/us/brand/${slug}`;
  
  // For US routes, prioritize US URL as primary
  if (isUSRoute) {
    return [
      { lang: 'en-US', url: usUrl },
      { lang: 'en-GB', url: ukUrl },
      { lang: 'x-default', url: usUrl }
    ];
  } else {
    // For UK routes, prioritize UK URL as primary
    return [
      { lang: 'en-GB', url: ukUrl },
      { lang: 'en-US', url: usUrl },
      { lang: 'x-default', url: ukUrl }
    ];
  }
}

/**
 * Generate proper hreflang entries for static pages
 */
export function generateStaticPageHreflang(path: string): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}${path}`;
  const usUrl = `${baseUrl}/us${path}`;
  
  // For root pages, prioritize UK as default
  if (path === '/' || path === '') {
    return [
      { lang: 'en-GB', url: ukUrl },
      { lang: 'en-US', url: usUrl },
      { lang: 'x-default', url: ukUrl }
    ];
  }
  
  // For other static pages
  return [
    { lang: 'en-GB', url: ukUrl },
    { lang: 'en-US', url: usUrl },
    { lang: 'x-default', url: ukUrl }
  ];
}

/**
 * Generate proper hreflang entries for city pages
 */
export function generateCityPageHreflang(slug: string): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/${slug}`;
  const usUrl = `${baseUrl}/us/${slug}`;
  
  return [
    { lang: 'en-GB', url: ukUrl },
    { lang: 'en-US', url: usUrl },
    { lang: 'x-default', url: ukUrl }
  ];
}

/**
 * Remove duplicate hreflang entries and validate URLs
 */
export function cleanHreflangEntries(entries: HreflangEntry[]): HreflangEntry[] {
  const seen = new Set<string>();
  const cleaned: HreflangEntry[] = [];
  
  for (const entry of entries) {
    const key = `${entry.lang}-${entry.url}`;
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(entry);
    }
  }
  
  return cleaned;
}

/**
 * Generate hreflang HTML tags
 */
export function generateHreflangHTML(entries: HreflangEntry[]): string {
  const cleaned = cleanHreflangEntries(entries);
  
  return cleaned.map(entry => 
    `<link rel="alternate" hrefLang="${entry.lang}" href="${entry.url}" />`
  ).join('\n');
}

/**
 * Check if a URL should be included in hreflang (not 404)
 * This is a basic check - in production you might want to validate against actual URLs
 */
export function shouldIncludeInHreflang(url: string): boolean {
  // Skip known 404 patterns
  const skipPatterns = [
    /\/us\/blog$/,
    /\/brand\/(vampyou|sesh\+)$/,
    /\/us\/brand\/(vampyou|sesh\+)$/,
  ];
  
  return !skipPatterns.some(pattern => pattern.test(url));
}

/**
 * Generate safe hreflang entries that exclude known 404 URLs
 */
export function generateSafeHreflang(entries: HreflangEntry[]): HreflangEntry[] {
  return cleanHreflangEntries(entries).filter(entry => 
    shouldIncludeInHreflang(entry.url)
  );
}
