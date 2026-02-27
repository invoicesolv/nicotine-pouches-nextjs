import { Metadata } from 'next';
import { SEO_CONFIG, getFullUrl, formatCurrency, generateKeywords } from '@/config/seo-config';

export interface PageData {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  url?: string;
  /** Set to true to skip generating en-US alternate (for UK-only content) */
  skipUSAlternate?: boolean;
  [key: string]: any;
}

export type PageType = 'product' | 'brand' | 'location' | 'homepage' | 'blog' | 'static';

/**
 * Master function to generate SEO metadata based on page type
 */
export function getSEOTags(pageType: PageType, pageData: PageData): Metadata {
  const template = (SEO_CONFIG.templates as any)[pageType];
  
  // Generate title and description from templates
  const title = pageData.title || generateTitle(template, pageData);
  const description = pageData.description || generateDescription(template, pageData);
  // For location pages, use the processed keywords from the template
  // For other pages, generate keywords from template if not provided
  const keywords = pageData.keywords || (template && pageType !== 'location' ? generateKeywords(template.keywordsTemplate, pageData) : '');
  
  // Generate canonical URL
  const canonical = pageData.canonical || getFullUrl(pageData.url || '/');

  // Generate Open Graph image
  const ogImage = pageData.image || SEO_CONFIG.defaultImages.ogImage;

  // Determine if we should include en-US alternate
  // Skip for: location pages (UK cities), blog pages (UK-only content), brand pages (UK/US have different products), product pages, or when explicitly flagged as UK-only content
  const shouldIncludeUSAlternate = pageType !== 'location' && pageType !== 'blog' && pageType !== 'brand' && pageType !== 'product' && !pageData.skipUSAlternate;

  // Build language alternates
  const languageAlternates: Record<string, string> = {
    'en-GB': canonical,
    'x-default': canonical,
  };

  // Only add en-US alternate if the content exists in the US section
  if (shouldIncludeUSAlternate) {
    languageAlternates['en-US'] = canonical.replace('/us/', '/').replace(SEO_CONFIG.domain, `${SEO_CONFIG.domain}/us`);
  }

  return {
    title,
    description,
    keywords,
    robots: pageData.robots || SEO_CONFIG.defaults.robots,
    authors: [{ name: SEO_CONFIG.defaults.author }],
    publisher: SEO_CONFIG.defaults.publisher,
    metadataBase: new URL(SEO_CONFIG.domain),
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title: pageData.ogTitle || title,
      description: pageData.ogDescription || description,
      url: canonical,
      siteName: SEO_CONFIG.appName,
      type: 'website',
      locale: SEO_CONFIG.defaults.locale,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.twitterTitle || title,
      description: pageData.twitterDescription || description,
      images: [pageData.twitterImage || ogImage],
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
    },
    other: {
      'geo.region': pageData.geoRegion || SEO_CONFIG.defaults.country,
      'keywords': keywords,
      'author': SEO_CONFIG.defaults.author,
      'publisher': SEO_CONFIG.defaults.publisher,
      'article:author': SEO_CONFIG.defaults.author,
      'article:publisher': SEO_CONFIG.defaults.publisher,
      'og:author': SEO_CONFIG.defaults.author,
      'og:publisher': SEO_CONFIG.defaults.publisher,
    },
  };
}

/**
 * Generate title from template
 */
function generateTitle(template: any, data: PageData): string {
  return template.titleTemplate.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    return data[key] || match;
  });
}

/**
 * Generate description from template
 */
function generateDescription(template: any, data: PageData): string {
  return template.descriptionTemplate.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    return data[key] || match;
  });
}

/**
 * Generate JSON-LD structured data for different schema types
 */
export function renderSchemaTag(schemaType: string, data: any): JSX.Element {
  const schema = generateSchema(schemaType, data);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

/**
 * Generate schema based on type
 */
function generateSchema(schemaType: string, data: any): any {
  const baseContext = { "@context": "https://schema.org" };
  
  switch (schemaType) {
    case 'product':
      return {
        ...baseContext,
        "@type": "Product",
        "name": data.product?.name || data.name,
        "description": data.product?.description || data.description,
        "image": data.product?.image || data.image,
        "brand": {
          "@type": "Brand",
          "name": data.product?.brand || data.brand
        },
        "category": "Nicotine Pouches",
        "aggregateRating": data.aggregateRating,
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "GBP",
          "lowPrice": data.product?.lowestPrice || data.lowestPrice,
          "highPrice": data.product?.highestPrice || data.highestPrice,
          "offerCount": data.product?.storeCount || data.storeCount,
          "availability": "https://schema.org/InStock"
        }
      };
      
    case 'brand':
      return {
        ...baseContext,
        "@type": "Brand",
        "name": data.brandName || data.name,
        "description": data.description,
        "url": data.url,
        "logo": data.logo,
        "aggregateRating": data.aggregateRating,
        "sameAs": [
          data.facebookUrl,
          data.twitterUrl,
          data.instagramUrl
        ].filter(Boolean)
      };
      
    case 'organization':
      return {
        ...baseContext,
        "@type": "Organization",
        "name": SEO_CONFIG.organization.name,
        "alternateName": SEO_CONFIG.organization.alternateName,
        "url": SEO_CONFIG.organization.url,
        "logo": {
          "@type": "ImageObject",
          "url": SEO_CONFIG.organization.logo,
          "width": 200,
          "height": 60
        },
        "description": SEO_CONFIG.organization.description,
        "foundingDate": SEO_CONFIG.organization.foundingDate,
        "founder": {
          "@type": "Person",
          "name": SEO_CONFIG.organization.founder.name
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": SEO_CONFIG.organization.address.addressCountry,
          "addressRegion": SEO_CONFIG.organization.address.addressRegion
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": SEO_CONFIG.organization.contactPoint.contactType,
          "email": SEO_CONFIG.organization.contactPoint.email,
          "availableLanguage": SEO_CONFIG.organization.contactPoint.availableLanguage
        },
        "sameAs": [
          SEO_CONFIG.facebookPage,
          SEO_CONFIG.instagramPage
        ],
        "serviceArea": {
          "@type": "Country",
          "name": SEO_CONFIG.organization.serviceArea.name
        }
      };
      
    case 'website':
      return {
        ...baseContext,
        "@type": "WebSite",
        "name": SEO_CONFIG.appName,
        "alternateName": SEO_CONFIG.organization.alternateName,
        "url": SEO_CONFIG.domain,
        "description": SEO_CONFIG.appDescription,
        "publisher": {
          "@type": "Organization",
          "name": SEO_CONFIG.organization.name,
          "url": SEO_CONFIG.organization.url
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SEO_CONFIG.domain}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };
      
    case 'article':
      const articleSchema: any = {
        ...baseContext,
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "image": data.image,
        "author": {
          "@type": "Person",
          "name": data.author?.name || SEO_CONFIG.defaults.author
        },
        "publisher": {
          "@type": "Organization",
          "name": SEO_CONFIG.organization.name,
          "logo": {
            "@type": "ImageObject",
            "url": SEO_CONFIG.organization.logo
          }
        },
        "datePublished": data.datePublished || data.date,
        "dateModified": data.dateModified || data.date,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": data.url
        },
        "keywords": data.keywords?.join(', ')
      };
      
      // Add speakable if present
      if (data.speakableSections && data.speakableSections.length > 0) {
        articleSchema.speakable = {
          "@type": "SpeakableSpecification",
          "cssSelector": data.speakableSections
        };
      }
      
      // Add review rating if this is a review article
      if (data.itemReviewed && data.rating) {
        articleSchema.itemReviewed = {
          "@type": data.itemReviewed.type,
          "name": data.itemReviewed.name
        };
        articleSchema.reviewRating = {
          "@type": "Rating",
          "ratingValue": data.rating.ratingValue,
          "bestRating": data.rating.bestRating,
          "worstRating": data.rating.worstRating
        };
      }
      
      return articleSchema;
      
    case 'faq':
      return {
        ...baseContext,
        "@type": "FAQPage",
        "mainEntity": data.faqs?.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question || faq.title,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer || faq.content
          }
        })) || []
      };
      
    case 'breadcrumb':
      return {
        ...baseContext,
        "@type": "BreadcrumbList",
        "itemListElement": data.breadcrumbs?.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        })) || []
      };
      
    case 'localBusiness':
      return {
        ...baseContext,
        "@type": "LocalBusiness",
        "name": data.businessName || `${SEO_CONFIG.appName} - ${data.cityName}`,
        "description": data.description,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.cityName,
          "addressRegion": data.region,
          "addressCountry": "GB"
        },
        "geo": data.geo ? {
          "@type": "GeoCoordinates",
          "latitude": data.geo.latitude,
          "longitude": data.geo.longitude
        } : undefined,
        "url": data.url,
        "telephone": data.telephone,
        "openingHours": data.openingHours,
        "aggregateRating": data.aggregateRating
      };
      
    case 'aggregateRating':
      return {
        ...baseContext,
        "@type": "AggregateRating",
        "itemReviewed": {
          "@type": data.itemType || "Product",
          "name": data.itemName
        },
        "ratingValue": data.ratingValue,
        "reviewCount": data.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      };
      
    default:
      return baseContext;
  }
}

/**
 * Generate standalone AggregateRating schema
 */
export function generateStandaloneAggregateRating(
  itemType: string,
  itemName: string,
  aggregateRating: any
): JSX.Element {
  return renderSchemaTag('aggregateRating', {
    itemType,
    itemName,
    ...aggregateRating
  });
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): JSX.Element {
  return renderSchemaTag('breadcrumb', { breadcrumbs });
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>): JSX.Element {
  return renderSchemaTag('faq', { faqs });
}
