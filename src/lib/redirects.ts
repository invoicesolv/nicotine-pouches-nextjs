// Redirect mapping system for discontinued products and pages
// This file handles intelligent redirects for 404 URLs found in the sitemap

export interface RedirectRule {
  pattern: RegExp;
  destination: string;
  type: 'exact' | 'pattern' | 'brand' | 'category';
  priority: number;
}

export interface RedirectMap {
  [key: string]: string;
}

// Discontinued brands and their redirect destinations
const discontinuedBrands: RedirectMap = {
  'vampyou': '/brand/on', // Redirect to similar brand
  'sesh+': '/brand/on', // Redirect to similar brand
  'chainpop': '/brand/on', // Redirect to similar brand
  '77': '/brand/on', // Redirect to similar brand
  'hit': '/brand/on', // Redirect to similar brand
  'niccos': '/brand/on', // Redirect to similar brand
  'pablo': '/brand/on', // Redirect to similar brand
  'kurwa': '/brand/on', // Redirect to similar brand
};

// Discontinued product patterns and their redirect destinations
const discontinuedPatterns: RedirectRule[] = [
  // Note: Removed broad patterns that were catching legitimate products
  // Only use specific redirects for known discontinued products
  
  // Discontinued brand pages (only specific ones)
  {
    pattern: /^\/brand\/(vampyou|sesh\+)$/,
    destination: '/brand/on',
    type: 'brand',
    priority: 2
  },
  // US discontinued brand pages (only specific ones)
  {
    pattern: /^\/us\/brand\/(vampyou|sesh\+)$/,
    destination: '/us/brand/on',
    type: 'brand',
    priority: 2
  },
  // Discontinued blog route
  {
    pattern: /^\/us\/blog$/,
    destination: '/us',
    type: 'exact',
    priority: 3
  }
];

// Specific URL mappings for high-traffic discontinued products
const specificRedirects: RedirectMap = {
  // US discontinued products -> comparison page
  '/us/product/on-coffee-2mg': '/us/compare',
  '/us/product/sesh-mint-6mg': '/us/compare',
  '/us/product/on-mint-8mg': '/us/compare',
  '/us/product/nic-s-mint-3mg': '/us/compare',
  '/us/product/nic-s-wintergreen-9mg': '/us/compare',
  '/us/product/sesh-clear-8mg': '/us/compare',
  '/us/product/on-citrus-8mg': '/us/compare',
  '/us/product/nic-s-wintergreen-6mg': '/us/compare',
  '/us/product/sesh-mango-8mg': '/us/compare',
  '/us/product/nic-s-cinnamon-6mg': '/us/compare',
  '/us/product/on-citrus-4mg': '/us/compare',
  '/us/product/on-original-8mg': '/us/compare',
  '/us/product/nic-s-cinnamon-3mg': '/us/compare',
  '/us/product/sesh-mint-8mg': '/us/compare',
  '/us/product/nic-s-mint-6mg': '/us/compare',
  '/us/product/on-wintergreen-8mg': '/us/compare',
  '/us/product/on-coffee-4mg': '/us/compare',
  '/us/product/sesh-clear-6mg': '/us/compare',
  '/us/product/sesh-wintergreen-4mg': '/us/compare',
  '/us/product/sesh-cappuccino-4mg': '/us/compare',
  '/us/product/nic-s-berry-6mg': '/us/compare',
  '/us/product/on-original-4mg': '/us/compare',
  '/us/product/on-wintergreen-2mg': '/us/compare',
  '/us/product/on-mint-4mg': '/us/compare',
  '/us/product/nic-s-wintergreen-3mg': '/us/compare',
  '/us/product/sesh-wintergreen-8mg': '/us/compare',
  '/us/product/nic-s-flavor-free-6mg': '/us/compare',
  '/us/product/on-mint-2mg': '/us/compare',
  '/us/product/sesh-mango-4mg': '/us/compare',
  '/us/product/sesh-cappuccino-6mg': '/us/compare',
  '/us/product/nic-s-flavor-free-3mg': '/us/compare',
  '/us/product/nic-s-berry-3mg': '/us/compare',
  '/us/product/on-wintergreen-4mg': '/us/compare',
  '/us/product/sesh-mango-6mg': '/us/compare',
  '/us/product/sesh-mint-4mg': '/us/compare',
  '/us/product/sesh-clear-4mg': '/us/compare',
  '/us/product/nic-s-berry-9mg': '/us/compare',
  '/us/product/nic-s-mint-9mg': '/us/compare',
  '/us/product/on-cinnamon-4mg': '/us/compare',
  '/us/product/nic-s-orange-3mg': '/us/compare',
  '/us/product/sesh-cappuccino-8mg': '/us/compare',
  '/us/product/nic-s-flavor-free-9mg': '/us/compare',
  '/us/product/nic-s-orange-6mg': '/us/compare',
  '/us/product/on-cinnamon-8mg': '/us/compare',
  '/us/product/on-cinnamon-2mg': '/us/compare',
  '/us/product/on-original-2mg': '/us/compare',
  '/us/product/on-citrus-2mg': '/us/compare',
  '/us/product/nic-s-cinnamon-9mg': '/us/compare',
  '/us/product/on-coffee-8mg': '/us/compare',
  
  // UK discontinued products -> comparison page
  '/product/chainpop-apple-amp-cinnamon': '/compare',
  '/product/on-raspberry-lemon': '/compare',
  '/product/vampyou-savage-mango': '/compare',
  '/product/77-cola-amp-cherry': '/compare',
  '/product/77-apple-amp-mint': '/compare',
  '/product/vampyou-cool-berry': '/compare',
  '/product/chainpop-pomegranate-amp-melon': '/compare',
  '/product/on-coffee': '/compare',
  '/product/on-watermelon-mint': '/compare',
  '/product/on-spearmint': '/compare',
  '/product/on-grapefruit-spritz': '/compare',
  '/product/77-liquorice-amp-citrus': '/compare',
  '/product/chainpop-lychee-amp-coconut': '/compare',
  '/product/chainpop-raspberry-amp-lemon': '/compare',
  '/product/chainpop-violet-amp-cactus': '/compare',
  '/product/on-lemon-berry': '/compare',
  '/product/on-island-twist': '/compare',
  '/product/77-cola-amp-vanilla': '/compare',
  '/product/niccos-x-mint': '/compare',
  '/product/on-citrus': '/compare',
  '/product/chainpop-peach-amp-honey': '/compare',
  '/product/vampyou-frutti-blast': '/compare',
  '/product/vampyou-frostbite': '/compare',
  '/product/77-raspberry-amp-vanilla': '/compare',
  '/product/on-smooth-mint': '/compare',
  '/product/ice-frost-20': '/compare',
  '/product/77-melon-amp-mint': '/compare',
  '/product/on-spicy-lime': '/compare',
  '/product/vampyou-blueberry-ice': '/compare',
  '/product/vampyou-berry-kiwi-rush': '/compare',
  
  // Discontinued brand pages
  '/brand/vampyou': '/brand/on',
  '/us/brand/sesh+': '/us/brand/on',
  
  // Discontinued blog route
  '/us/blog': '/us',
};

/**
 * Find the best redirect destination for a given URL
 * @param url - The URL to find a redirect for
 * @returns The redirect destination URL or null if no redirect found
 */
export function findRedirect(url: string): string | null {
  // First check for exact matches in specific redirects
  if (specificRedirects[url]) {
    return specificRedirects[url];
  }
  
  // Then check pattern matches (sorted by priority)
  const sortedPatterns = discontinuedPatterns.sort((a, b) => b.priority - a.priority);
  
  for (const rule of sortedPatterns) {
    if (rule.pattern.test(url)) {
      return rule.destination;
    }
  }
  
  return null;
}

/**
 * Check if a product should be excluded from sitemap
 * @param productName - The product name to check
 * @param productUrl - The product URL to check
 * @returns True if the product should be excluded from sitemap
 */
export function shouldExcludeFromSitemap(productName: string, productUrl: string): boolean {
  // Only check specific discontinued products, not broad patterns
  // This prevents legitimate products from being excluded
  
  // Check specific discontinued products
  if (specificRedirects[productUrl]) {
    return true;
  }
  
  return false;
}

/**
 * Get all discontinued brand names
 * @returns Array of discontinued brand names
 */
export function getDiscontinuedBrands(): string[] {
  return Object.keys(discontinuedBrands);
}

/**
 * Get all specific redirect URLs
 * @returns Array of URLs that have specific redirects
 */
export function getSpecificRedirectUrls(): string[] {
  return Object.keys(specificRedirects);
}
