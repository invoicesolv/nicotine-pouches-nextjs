// Hreflang utility for proper international SEO implementation
// Fixes duplicate entries and ensures reciprocal hreflang tags

export interface HreflangEntry {
  lang: string;
  url: string;
}

/**
 * Generate proper hreflang entries for product pages
 * Ensures no duplicates and validates URLs exist
 * @param slug - The product slug
 * @param isUSRoute - Whether this is a US route
 * @param existsInBothRegions - Set to false if product only exists in one region (skips cross-region alternate)
 */
export function generateProductHreflang(slug: string, isUSRoute: boolean = false, existsInBothRegions: boolean = true): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/product/${slug}`;
  const usUrl = `${baseUrl}/us/product/${slug}`;

  // If product only exists in one region, don't generate cross-region alternates
  if (!existsInBothRegions) {
    if (isUSRoute) {
      return [
        { lang: 'en-US', url: usUrl },
        { lang: 'x-default', url: usUrl }
      ];
    } else {
      return [
        { lang: 'en-GB', url: ukUrl },
        { lang: 'x-default', url: ukUrl }
      ];
    }
  }

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
 * @param slug - The brand slug
 * @param isUSRoute - Whether this is a US route
 * @param existsInBothRegions - Set to false if brand only exists in one region (skips cross-region alternate)
 */
export function generateBrandHreflang(slug: string, isUSRoute: boolean = false, existsInBothRegions: boolean = true): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/brand/${slug}`;
  const usUrl = `${baseUrl}/us/brand/${slug}`;

  // If brand only exists in one region, don't generate cross-region alternates
  if (!existsInBothRegions) {
    if (isUSRoute) {
      return [
        { lang: 'en-US', url: usUrl },
        { lang: 'x-default', url: usUrl }
      ];
    } else {
      return [
        { lang: 'en-GB', url: ukUrl },
        { lang: 'x-default', url: ukUrl }
      ];
    }
  }

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

// List of UK-only paths that should NOT have US alternates
const UK_ONLY_PATHS = [
  '/blog',
  '/blog-posts',
  '/vendors',
  '/digital-services-act',
  '/here-we-are',
  '/features',
  '/news',
  '/press'
];

/**
 * Generate proper hreflang entries for static pages
 * @param path - The page path (e.g., '/about-us')
 * @param skipUSAlternate - Set to true to skip generating US alternate (for UK-only content)
 */
export function generateStaticPageHreflang(path: string, skipUSAlternate: boolean = false): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}${path}`;
  const usUrl = `${baseUrl}/us${path}`;

  // Check if this path is UK-only (no US equivalent exists)
  const isUKOnlyPath = UK_ONLY_PATHS.some(ukPath =>
    path === ukPath || path.startsWith(`${ukPath}/`)
  );

  // Skip US alternate for UK-only paths or when explicitly requested
  if (isUKOnlyPath || skipUSAlternate) {
    return [
      { lang: 'en-GB', url: ukUrl },
      { lang: 'x-default', url: ukUrl }
    ];
  }

  // For root pages, prioritize UK as default
  if (path === '/' || path === '') {
    return [
      { lang: 'en-GB', url: ukUrl },
      { lang: 'en-US', url: usUrl },
      { lang: 'x-default', url: ukUrl }
    ];
  }

  // For other static pages with US equivalents
  return [
    { lang: 'en-GB', url: ukUrl },
    { lang: 'en-US', url: usUrl },
    { lang: 'x-default', url: ukUrl }
  ];
}

/**
 * Generate proper hreflang entries for city pages
 * Note: UK city pages do NOT have US counterparts, so no en-US alternate is generated
 */
export function generateCityPageHreflang(slug: string): HreflangEntry[] {
  const baseUrl = 'https://nicotine-pouches.org';
  const ukUrl = `${baseUrl}/${slug}`;

  // UK city pages only exist in the UK section - no US alternate
  return [
    { lang: 'en-GB', url: ukUrl },
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

// UK city slugs - these only exist in the UK section, not US
const UK_CITY_SLUGS = [
  'aberdeen', 'armagh', 'bangor-wales', 'bangor-northern-ireland', 'bath', 'belfast', 'birmingham', 'bradford', 'brighton-and-hove', 'bristol',
  'cambridge', 'canterbury', 'cardiff', 'carlisle', 'chelmsford', 'chester', 'chichester', 'city-of-london', 'city-of-westminster', 'colchester',
  'coventry', 'derby', 'derry', 'doncaster', 'dundee', 'dunfermline', 'durham', 'edinburgh', 'ely', 'exeter',
  'glasgow', 'gloucester', 'hereford', 'inverness', 'kingston-upon-hull', 'lancaster', 'leeds', 'leicester', 'lichfield', 'lincoln',
  'lisburn', 'liverpool', 'london', 'manchester', 'milton-keynes', 'newcastle', 'newcastle-upon-tyne', 'newport', 'newry', 'norwich', 'nottingham',
  'oxford', 'perth', 'peterborough', 'plymouth', 'portsmouth', 'preston', 'ripon', 'salford', 'salisbury', 'sheffield',
  'southampton', 'southend-on-sea', 'st-albans', 'st-asaph', 'st-davids', 'stirling', 'stoke-on-trent', 'sunderland', 'swansea', 'truro',
  'wakefield', 'wells', 'winchester', 'wolverhampton', 'worcester', 'wrexham', 'york'
];

/**
 * Check if a URL should be included in hreflang (not 404)
 * This is a basic check - in production you might want to validate against actual URLs
 */
export function shouldIncludeInHreflang(url: string): boolean {
  // Skip known 404 patterns - these US routes don't exist
  const skipPatterns = [
    /\/us\/blog($|\/)/, // /us/blog and /us/blog/*
    /\/us\/blog-posts($|\/)/, // /us/blog-posts and /us/blog-posts/*
    /\/us\/vendors($|\/)/, // /us/vendors
    /\/us\/digital-services-act($|\/)/, // /us/digital-services-act
    /\/us\/features($|\/)/, // /us/features
    /\/us\/news($|\/)/, // /us/news
    /\/us\/press($|\/)/, // /us/press
    /\/us\/here-we-are($|\/)/, // /us/here-we-are
    /\/brand\/(vampyou|sesh\+)$/,
    /\/us\/brand\/(vampyou|sesh\+)$/,
  ];

  if (skipPatterns.some(pattern => pattern.test(url))) {
    return false;
  }

  // Skip UK city slugs in the US section (they don't exist there)
  const usCityMatch = url.match(/\/us\/([^\/]+)$/);
  if (usCityMatch) {
    const slug = usCityMatch[1];
    if (UK_CITY_SLUGS.includes(slug)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate safe hreflang entries that exclude known 404 URLs
 */
export function generateSafeHreflang(entries: HreflangEntry[]): HreflangEntry[] {
  return cleanHreflangEntries(entries).filter(entry => 
    shouldIncludeInHreflang(entry.url)
  );
}
