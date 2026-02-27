import { SEO_CONFIG, getFullUrl, formatCurrency } from '@/config/seo-config';
import { AggregateRating } from './aggregate-ratings';

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  brand: string;
  flavour: string;
  strength: string;
  description: string;
  image: string;
  lowestPrice: number;
  highestPrice: number;
  storeCount: number;
  aggregateRating: AggregateRating;
}

export interface BrandData {
  brandName: string;
  description: string;
  productCount: number;
  image: string;
  aggregateRating: AggregateRating;
}

export interface LocationData {
  cityName: string;
  citySlug: string;
  region: string;
  description: string;
  image: string;
  population?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  aggregateRating?: any;
}

export interface BlogData {
  title: string;
  slug: string;
  description: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  category: string;
  image: string;
}

export interface StaticPageData {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

/**
 * Generate SEO data for product pages
 */
export function getProductSEOTemplate(product: ProductData): any {
  const template = SEO_CONFIG.templates.product;
  
  return {
    title: template.titleTemplate
      .replace('{productName}', product.name)
      .replace('{lowestPrice}', formatCurrency(product.lowestPrice)),
    description: template.descriptionTemplate
      .replace('{productName}', product.name)
      .replace('{storeCount}', product.storeCount.toString())
      .replace('{reviewCount}', (product.aggregateRating?.reviewCount || 0).toString())
      .replace('{ratingValue}', product.aggregateRating?.ratingValue || '4.5'),
    keywords: template.keywordsTemplate
      .replace('{brand}', product.brand)
      .replace('{flavour}', product.flavour)
      .replace('{strength}', product.strength),
    canonical: getFullUrl(`/product/${product.slug}`),
    image: product.image,
    url: `/product/${product.slug}`,
    product,
    aggregateRating: product.aggregateRating,
    schema: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.image,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "category": "Nicotine Pouches",
      "aggregateRating": product.aggregateRating,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "GBP",
        "lowPrice": product.lowestPrice,
        "highPrice": product.highestPrice,
        "offerCount": product.storeCount,
        "availability": "https://schema.org/InStock"
      }
    }
  };
}

/**
 * Generate SEO data for brand pages
 */
export function getBrandSEOTemplate(brand: BrandData): any {
  const template = SEO_CONFIG.templates.brand;

  // Generate clean slug (strip special characters)
  const brandSlug = brand.brandName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return {
    title: template.titleTemplate
      .replace('{brandName}', brand.brandName),
    description: template.descriptionTemplate
      .replace('{brandName}', brand.brandName)
      .replace('{productCount}', brand.productCount.toString()),
    keywords: template.keywordsTemplate
      .replace('{brandName}', brand.brandName),
    canonical: getFullUrl(`/brand/${brandSlug}`),
    image: brand.image,
    url: `/brand/${brandSlug}`,
    brand,
    aggregateRating: brand.aggregateRating,
    schema: {
      "@context": "https://schema.org",
      "@type": "Brand",
      "name": brand.brandName,
      "description": brand.description,
      "url": getFullUrl(`/brand/${brandSlug}`),
      "logo": brand.image,
      "aggregateRating": brand.aggregateRating,
      "sameAs": [
        SEO_CONFIG.facebookPage,
        SEO_CONFIG.instagramPage
      ]
    }
  };
}

/**
 * Generate SEO data for location pages
 */
export function getLocationSEOTemplate(location: LocationData): any {
  const template = SEO_CONFIG.templates.location;
  
  return {
    title: template.titleTemplate
      .replace('{cityName}', location.cityName),
    description: template.descriptionTemplate
      .replace('{cityName}', location.cityName)
      .replace('{region}', location.region),
    keywords: template.keywordsTemplate
      .replace('{cityName}', location.cityName)
      .replace('{region}', location.region),
    canonical: getFullUrl(`/${location.citySlug}`),
    image: location.image,
    url: `/${location.citySlug}`,
    geoRegion: 'UK',
    location,
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `${SEO_CONFIG.appName} - ${location.cityName}`,
      "description": location.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location.cityName,
        "addressRegion": location.region,
        "addressCountry": "GB"
      },
      "geo": location.geo ? {
        "@type": "GeoCoordinates",
        "latitude": location.geo.latitude,
        "longitude": location.geo.longitude
      } : undefined,
      "url": getFullUrl(`/${location.citySlug}`),
      "image": location.image || SEO_CONFIG.defaultImages.ogImage,
      "aggregateRating": location.aggregateRating,
      "telephone": "+44 20 XXXX XXXX", // Default UK number
      "priceRange": "££-£££",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      },
      "serviceArea": {
        "@type": "City",
        "name": location.cityName
      }
    }
  };
}

/**
 * Generate SEO data for blog posts
 */
export function getBlogSEOTemplate(blog: BlogData): any {
  const template = SEO_CONFIG.templates.blog;
  
  return {
    title: template.titleTemplate
      .replace('{title}', blog.title),
    description: blog.description,
    keywords: template.keywordsTemplate,
    canonical: getFullUrl(`/blog/${blog.slug}`),
    image: blog.image,
    url: `/blog/${blog.slug}`,
    blog,
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blog.title,
      "description": blog.description,
      "image": blog.image,
      "author": {
        "@type": "Person",
        "name": blog.author.name,
        "image": blog.author.avatar
      },
      "publisher": {
        "@type": "Organization",
        "name": SEO_CONFIG.organization.name,
        "logo": {
          "@type": "ImageObject",
          "url": SEO_CONFIG.organization.logo
        }
      },
      "datePublished": blog.date,
      "dateModified": blog.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": getFullUrl(`/blog/${blog.slug}`)
      }
    }
  };
}

/**
 * Generate SEO data for static pages
 */
export function getStaticPageSEOTemplate(page: StaticPageData): any {
  const template = SEO_CONFIG.templates.static;
  
  return {
    title: template.titleTemplate
      .replace('{title}', page.title),
    description: page.description,
    keywords: page.keywords,
    canonical: getFullUrl(page.url),
    url: page.url,
    page,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "description": page.description,
      "url": getFullUrl(page.url),
      "isPartOf": {
        "@type": "WebSite",
        "name": SEO_CONFIG.appName,
        "url": SEO_CONFIG.domain
      }
    }
  };
}

/**
 * Generate SEO data for homepage
 */
export function getHomepageSEOTemplate(): any {
  return {
    title: `Nicotine Pouches UK | Compare 700+ Products Across 10+ Shops`,
    description: 'Compare 700+ nicotine pouches from 10+ UK shops. Find cheap ZYN, VELO, Nordic Spirit prices updated daily. Buy from the cheapest retailer.',
    keywords: 'nicotine pouches uk, cheap nicotine pouches, cheapest nicotine pouches uk, buy nicotine pouches, best deals nicotine pouches, order nicotine pouches uk, ZYN UK, VELO UK, nicotine pouches price comparison',
    canonical: SEO_CONFIG.domain,
    url: '/',
    schema: {
      "@context": "https://schema.org",
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
    }
  };
}

/**
 * Generate breadcrumb data for any page
 */
export function generateBreadcrumbData(
  pageType: string,
  pageData: any,
  additionalBreadcrumbs: Array<{name: string, url: string}> = []
): Array<{name: string, url: string}> {
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ];

  switch (pageType) {
    case 'product':
      breadcrumbs.push(
        { name: 'Products', url: '/products' },
        { name: pageData.name, url: `/product/${pageData.slug}` }
      );
      break;
    case 'brand':
      breadcrumbs.push(
        { name: 'Brands', url: '/brands' },
        { name: pageData.brandName, url: `/brand/${pageData.brandName.toLowerCase().replace(/\s+/g, '-')}` }
      );
      break;
    case 'location':
      breadcrumbs.push(
        { name: 'Locations', url: '/locations' },
        { name: pageData.cityName, url: `/${pageData.cityName.toLowerCase().replace(/\s+/g, '-')}` }
      );
      break;
    case 'blog':
      breadcrumbs.push(
        { name: 'Blog', url: '/blog' },
        { name: pageData.title, url: `/blog/${pageData.slug}` }
      );
      break;
    default:
      if (additionalBreadcrumbs.length > 0) {
        breadcrumbs.push(...additionalBreadcrumbs);
      }
  }

  return breadcrumbs;
}
