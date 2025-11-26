// Central SEO configuration for site-wide constants
// Update these values to change SEO settings across the entire site

export const SEO_CONFIG = {
  // Site Information
  domain: 'https://nicotine-pouches.org',
  appName: 'Nicotine Pouches',
  appDescription: 'Compare nicotine pouches from top UK brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
  
  // Social Media
  twitterHandle: '@nicotinepouches',
  facebookPage: 'https://facebook.com/nicotinepouches',
  instagramPage: 'https://instagram.com/nicotinepouches',
  
  // Organization Details
  organization: {
    name: 'Nicotine Pouches UK',
    alternateName: 'Nicotine Pouches',
    url: 'https://nicotine-pouches.org',
    logo: 'https://nicotine-pouches.org/logo.png',
    description: 'Premium nicotine pouches price comparison service. Find the best deals on nicotine pouches in the UK with our comprehensive price comparison platform.',
    foundingDate: '2024',
    founder: {
      name: 'Nicotine Pouches Team'
    },
    address: {
      addressCountry: 'GB',
      addressRegion: 'England'
    },
    contactPoint: {
      contactType: 'customer service',
      email: 'support@nicotine-pouches.org',
      availableLanguage: ['English']
    },
    serviceArea: {
      name: 'United Kingdom'
    }
  },
  
  // Default Images
  defaultImages: {
    ogImage: 'https://nicotine-pouches.org/og-image.jpg',
    twitterImage: 'https://nicotine-pouches.org/twitter-image.jpg',
    logo: 'https://nicotine-pouches.org/logo.png',
    placeholder: '/placeholder-product.jpg'
  },
  
  // SEO Defaults
  defaults: {
    robots: 'index,follow',
    keywords: 'nicotine pouches, UK, compare prices, ZYN, VELO, LOOP, best deals, nicotine pouches UK',
    author: 'Nicotine Pouches UK',
    publisher: 'Nicotine Pouches UK',
    locale: 'en-GB',
    currency: 'GBP',
    country: 'UK'
  },
  
  // Page Templates
  templates: {
    product: {
      titleTemplate: '{productName} - Compare Prices from £{lowestPrice} | Best UK Deals',
      descriptionTemplate: 'Compare {productName} prices from {storeCount}+ UK retailers. {reviewCount} reviews, {ratingValue}★ rating. Find the best deals today.',
      keywordsTemplate: '{brand}, {flavour}, nicotine pouches, {strength}, UK, compare prices, best deals'
    },
    brand: {
      titleTemplate: '{brandName} Nicotine Pouches - Compare Prices & Reviews UK',
      descriptionTemplate: 'Compare all {brandName} nicotine pouches by price, strength, and flavour. {productCount} products available from top UK retailers with live price updates.',
      keywordsTemplate: '{brandName} nicotine pouches, {brandName} pouches UK, {brandName} comparison, best {brandName} deals'
    },
    location: {
      titleTemplate: 'Nicotine Pouches in {cityName} - Compare Prices & Find Best Deals',
      descriptionTemplate: 'Find the best nicotine pouches in {cityName}, {region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.',
      keywordsTemplate: 'nicotine pouches {cityName}, {cityName} nicotine pouches, {region} nicotine pouches, ZYN {cityName}, VELO {cityName}, local delivery'
    },
    blog: {
      titleTemplate: '{title} - Nicotine Pouches UK Blog',
      descriptionTemplate: '{description}',
      keywordsTemplate: 'nicotine pouches blog, news, reviews, guides, UK'
    },
    static: {
      titleTemplate: '{title} - Nicotine Pouches UK',
      descriptionTemplate: '{description}',
      keywordsTemplate: 'nicotine pouches UK, {keywords}'
    }
  },
  
  // Schema.org Types
  schemaTypes: {
    product: 'Product',
    brand: 'Brand',
    organization: 'Organization',
    website: 'WebSite',
    article: 'Article',
    faq: 'FAQPage',
    breadcrumb: 'BreadcrumbList',
    localBusiness: 'LocalBusiness',
    aggregateRating: 'AggregateRating',
    offer: 'AggregateOffer'
  }
} as const;

// Helper function to get full URL
export function getFullUrl(path: string): string {
  return `${SEO_CONFIG.domain}${path.startsWith('/') ? path : `/${path}`}`;
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const symbol = currency === 'GBP' ? '£' : '$';
  return `${symbol}${amount.toFixed(2)}`;
}

// Helper function to generate keywords from template
export function generateKeywords(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
}
