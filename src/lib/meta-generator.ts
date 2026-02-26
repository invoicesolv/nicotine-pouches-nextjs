// Meta tag generation utilities for existing pages

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  geoRegion?: string;
}

// Generate meta tags for homepage
export function generateHomepageMeta(): PageMeta {
  return {
    title: 'Nicotine Pouches UK - Compare Prices & Find Best Deals',
    description: 'Compare nicotine pouches from top UK brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
    keywords: 'nicotine pouches, UK, compare prices, ZYN, VELO, LOOP, best deals, nicotine pouches UK',
    ogTitle: 'Nicotine Pouches UK - Compare Prices & Find Best Deals',
    ogDescription: 'Compare nicotine pouches from top UK brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
    ogImage: 'https://nicotine-pouches.org/og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org',
    twitterTitle: 'Nicotine Pouches UK - Compare Prices & Find Best Deals',
    twitterDescription: 'Compare nicotine pouches from top UK brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
    twitterImage: 'https://nicotine-pouches.org/og-image.jpg',
    canonical: 'https://nicotine-pouches.org',
    robots: 'index,follow',
    geoRegion: 'UK'
  };
}

// Generate meta tags for compare page
export function generateComparePageMeta(): PageMeta {
  return {
    title: 'Compare Nicotine Pouches - Best Prices & Deals UK',
    description: 'Compare nicotine pouches by brand, strength, and flavour. Find the best deals from top UK retailers with live price updates and reviews.',
    keywords: 'compare nicotine pouches, best prices, UK retailers, nicotine pouches comparison, deals',
    ogTitle: 'Compare Nicotine Pouches - Best Prices & Deals UK',
    ogDescription: 'Compare nicotine pouches by brand, strength, and flavour. Find the best deals from top UK retailers with live price updates and reviews.',
    ogImage: 'https://nicotine-pouches.org/compare-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/compare',
    twitterTitle: 'Compare Nicotine Pouches - Best Prices & Deals UK',
    twitterDescription: 'Compare nicotine pouches by brand, strength, and flavour. Find the best deals from top UK retailers with live price updates and reviews.',
    twitterImage: 'https://nicotine-pouches.org/compare-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/compare',
    robots: 'index,follow'
  };
}

// Generate meta tags for brand page
export function generateBrandPageMeta(brandName: string, productCount: number): PageMeta {
  return {
    title: `${brandName} Nicotine Pouches - Compare Prices & Reviews UK`,
    description: `Compare all ${brandName} nicotine pouches by price, strength, and flavour. ${productCount} products available from top UK retailers with live price updates.`,
    keywords: `${brandName} nicotine pouches, ${brandName} pouches UK, ${brandName} comparison, best ${brandName} deals`,
    ogTitle: `${brandName} Nicotine Pouches - Compare Prices & Reviews UK`,
    ogDescription: `Compare all ${brandName} nicotine pouches by price, strength, and flavour. ${productCount} products available from top UK retailers with live price updates.`,
    ogImage: `https://nicotine-pouches.org/brand-images/${brandName.toLowerCase()}-og.jpg`,
    ogUrl: `https://nicotine-pouches.org/brand/${brandName.toLowerCase().replace(/\s+/g, '-')}`,
    twitterTitle: `${brandName} Nicotine Pouches - Compare Prices & Reviews UK`,
    twitterDescription: `Compare all ${brandName} nicotine pouches by price, strength, and flavour. ${productCount} products available from top UK retailers with live price updates.`,
    twitterImage: `https://nicotine-pouches.org/brand-images/${brandName.toLowerCase()}-og.jpg`,
    canonical: `https://nicotine-pouches.org/brand/${brandName.toLowerCase().replace(/\s+/g, '-')}`,
    robots: 'index,follow'
  };
}

// Generate meta tags for about page
export function generateAboutPageMeta(): PageMeta {
  return {
    title: 'About Us - Nicotine Pouches UK Price Comparison',
    description: 'Learn about Nicotine Pouches UK, your trusted source for comparing nicotine pouch prices, reviews, and finding the best deals from UK retailers.',
    keywords: 'about nicotine pouches UK, price comparison, reviews, best deals, UK retailers',
    ogTitle: 'About Us - Nicotine Pouches UK Price Comparison',
    ogDescription: 'Learn about Nicotine Pouches UK, your trusted source for comparing nicotine pouch prices, reviews, and finding the best deals from UK retailers.',
    ogImage: 'https://nicotine-pouches.org/about-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/about-us',
    twitterTitle: 'About Us - Nicotine Pouches UK Price Comparison',
    twitterDescription: 'Learn about Nicotine Pouches UK, your trusted source for comparing nicotine pouch prices, reviews, and finding the best deals from UK retailers.',
    twitterImage: 'https://nicotine-pouches.org/about-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/about-us',
    robots: 'index,follow'
  };
}

// Generate meta tags for FAQ page
export function generateFAQPageMeta(): PageMeta {
  return {
    title: 'Frequently Asked Questions - Nicotine Pouches UK',
    description: 'Find answers to common questions about nicotine pouches, pricing, delivery, and more. Get help with your nicotine pouch shopping experience.',
    keywords: 'nicotine pouches FAQ, questions, help, delivery, pricing, UK',
    ogTitle: 'Frequently Asked Questions - Nicotine Pouches UK',
    ogDescription: 'Find answers to common questions about nicotine pouches, pricing, delivery, and more. Get help with your nicotine pouch shopping experience.',
    ogImage: 'https://nicotine-pouches.org/faq-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/frequently-asked-questions',
    twitterTitle: 'Frequently Asked Questions - Nicotine Pouches UK',
    twitterDescription: 'Find answers to common questions about nicotine pouches, pricing, delivery, and more. Get help with your nicotine pouch shopping experience.',
    twitterImage: 'https://nicotine-pouches.org/faq-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/frequently-asked-questions',
    robots: 'index,follow'
  };
}

// Generate meta tags for contact page
export function generateContactPageMeta(): PageMeta {
  return {
    title: 'Contact Us - Nicotine Pouches UK',
    description: 'Get in touch with Nicotine Pouches UK for questions about price comparisons, product information, or general inquiries. We\'re here to help.',
    keywords: 'contact nicotine pouches UK, customer service, help, support',
    ogTitle: 'Contact Us - Nicotine Pouches UK',
    ogDescription: 'Get in touch with Nicotine Pouches UK for questions about price comparisons, product information, or general inquiries. We\'re here to help.',
    ogImage: 'https://nicotine-pouches.org/contact-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/contact-us',
    twitterTitle: 'Contact Us - Nicotine Pouches UK',
    twitterDescription: 'Get in touch with Nicotine Pouches UK for questions about price comparisons, product information, or general inquiries. We\'re here to help.',
    twitterImage: 'https://nicotine-pouches.org/contact-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/contact-us',
    robots: 'index,follow'
  };
}

// Generate meta tags for terms page
export function generateTermsPageMeta(): PageMeta {
  return {
    title: 'Terms and Conditions - Nicotine Pouches UK',
    description: 'Read our terms and conditions for using Nicotine Pouches UK price comparison service. Understand your rights and our responsibilities.',
    keywords: 'terms conditions, nicotine pouches UK, legal, privacy policy',
    ogTitle: 'Terms and Conditions - Nicotine Pouches UK',
    ogDescription: 'Read our terms and conditions for using Nicotine Pouches UK price comparison service. Understand your rights and our responsibilities.',
    ogImage: 'https://nicotine-pouches.org/terms-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/terms-and-conditions',
    twitterTitle: 'Terms and Conditions - Nicotine Pouches UK',
    twitterDescription: 'Read our terms and conditions for using Nicotine Pouches UK price comparison service. Understand your rights and our responsibilities.',
    twitterImage: 'https://nicotine-pouches.org/terms-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/terms-and-conditions',
    robots: 'index,follow'
  };
}

// Generate meta tags for become a member page
export function generateBecomeMemberPageMeta(): PageMeta {
  return {
    title: 'Become a Member - Nicotine Pouches UK',
    description: 'Join our community of nicotine pouch enthusiasts and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    keywords: 'become a member, nicotine pouches community, exclusive benefits, member deals, UK',
    ogTitle: 'Become a Member - Nicotine Pouches UK',
    ogDescription: 'Join our community of nicotine pouch enthusiasts and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    ogImage: 'https://nicotine-pouches.org/member-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/become-a-member',
    twitterTitle: 'Become a Member - Nicotine Pouches UK',
    twitterDescription: 'Join our community of nicotine pouch enthusiasts and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    twitterImage: 'https://nicotine-pouches.org/member-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/become-a-member',
    robots: 'index,follow'
  };
}

// Generate meta tags for US become a member page
export function generateUSGuidesPageMeta(): PageMeta {
  return {
    title: 'Guides - Nicotine Pouches US',
    description: 'Expert guides on nicotine pouches in the US. Learn about different brands, strengths, flavors, and find the perfect pouch for your needs.',
    keywords: 'nicotine pouches guides, nicotine pouch tips, best nicotine pouches, US guides',
    ogTitle: 'Guides - Nicotine Pouches US',
    ogDescription: 'Expert guides on nicotine pouches in the US. Learn about different brands, strengths, flavors, and find the perfect pouch for your needs.',
    ogImage: 'https://nicotine-pouches.org/us-guides-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/us/guides',
    twitterTitle: 'Guides - Nicotine Pouches US',
    twitterDescription: 'Expert guides on nicotine pouches in the US. Learn about different brands, strengths, flavors, and find the perfect pouch for your needs.',
    twitterImage: 'https://nicotine-pouches.org/us-guides-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/us/guides',
    robots: 'index,follow'
  };
}

export function generateUSBecomeMemberPageMeta(): PageMeta {
  return {
    title: 'Become a Member - Nicotine Pouches US',
    description: 'Join our community of nicotine pouch enthusiasts in the US and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    keywords: 'become a member, nicotine pouches community, exclusive benefits, member deals, US',
    ogTitle: 'Become a Member - Nicotine Pouches US',
    ogDescription: 'Join our community of nicotine pouch enthusiasts in the US and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    ogImage: 'https://nicotine-pouches.org/us-member-og-image.jpg',
    ogUrl: 'https://nicotine-pouches.org/us/become-a-member',
    twitterTitle: 'Become a Member - Nicotine Pouches US',
    twitterDescription: 'Join our community of nicotine pouch enthusiasts in the US and unlock exclusive benefits. Get early access to reviews, personalized recommendations, and member-only deals.',
    twitterImage: 'https://nicotine-pouches.org/us-member-og-image.jpg',
    canonical: 'https://nicotine-pouches.org/us/become-a-member',
    robots: 'index,follow'
  };
}

// Generate meta tags for blog posts
export function generateBlogPostMeta(title: string, excerpt: string, slug: string, image?: string): PageMeta {
  return {
    title: `${title} - Nicotine Pouches UK Blog`,
    description: excerpt.length > 155 ? excerpt.substring(0, 152) + '...' : excerpt,
    keywords: 'nicotine pouches blog, news, reviews, guides, UK',
    ogTitle: `${title} - Nicotine Pouches UK Blog`,
    ogDescription: excerpt.length > 155 ? excerpt.substring(0, 152) + '...' : excerpt,
    ogImage: image || 'https://nicotine-pouches.org/blog-og-image.jpg',
    ogUrl: `https://nicotine-pouches.org/blog/${slug}`,
    twitterTitle: `${title} - Nicotine Pouches UK Blog`,
    twitterDescription: excerpt.length > 155 ? excerpt.substring(0, 152) + '...' : excerpt,
    twitterImage: image || 'https://nicotine-pouches.org/blog-og-image.jpg',
    canonical: `https://nicotine-pouches.org/blog/${slug}`,
    robots: 'index,follow'
  };
}

// Generate meta tags for location pages
export function generateLocationMeta(cityData: {
  name: string;
  region: string;
  population: string;
  description: string;
  image: string;
}): PageMeta {
  const cityName = cityData.name;
  const region = cityData.region;
  
  // Convert city name to slug format (same as used in CITY_SLUGS array)
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    title: `Nicotine Pouches in ${cityName} - Compare Prices & Find Best Deals`,
    description: `Find the best nicotine pouches in ${cityName}, ${region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.`,
    keywords: `nicotine pouches ${cityName}, ${cityName} nicotine pouches, ${region} nicotine pouches, ZYN ${cityName}, VELO ${cityName}, local delivery`,
    ogTitle: `Nicotine Pouches in ${cityName} - Compare Prices & Find Best Deals`,
    ogDescription: `Find the best nicotine pouches in ${cityName}, ${region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.`,
    ogImage: cityData.image,
    ogUrl: `https://nicotine-pouches.org/${citySlug}`,
    twitterTitle: `Nicotine Pouches in ${cityName} - Compare Prices & Find Best Deals`,
    twitterDescription: `Find the best nicotine pouches in ${cityName}, ${region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.`,
    twitterImage: cityData.image,
    canonical: `https://nicotine-pouches.org/${citySlug}`,
    robots: 'index,follow',
    geoRegion: 'UK'
  };
}

// Convert PageMeta to Next.js Metadata format
export function pageMetaToMetadata(meta: PageMeta) {
  const metadata = {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: meta.robots,
    authors: [{ name: 'Nicotine Pouches UK' }],
    publisher: 'Nicotine Pouches UK',
    alternates: {
      canonical: meta.canonical,
      languages: {
        'en-GB': meta.canonical || 'https://nicotine-pouches.org',
        'en-US': 'https://nicotine-pouches.org/us',
        'x-default': meta.canonical || 'https://nicotine-pouches.org',
      },
    },
    openGraph: {
      title: meta.ogTitle || meta.title,
      description: meta.ogDescription || meta.description,
      url: meta.ogUrl || meta.canonical,
      siteName: 'Nicotine Pouches',
      type: 'website',
      locale: 'en-GB',
      images: meta.ogImage ? [
        {
          url: meta.ogImage,
          width: 1200,
          height: 630,
          alt: meta.ogTitle || meta.title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle || meta.title,
      description: meta.twitterDescription || meta.description,
      images: meta.twitterImage ? [meta.twitterImage] : undefined,
      creator: '@nicotinepouches',
      site: '@nicotinepouches',
    },
    other: {
      'geo.region': meta.geoRegion || 'UK',
      'keywords': meta.keywords || '',
      'author': 'Nicotine Pouches UK',
      'publisher': 'Nicotine Pouches UK',
      'article:author': 'Nicotine Pouches UK',
      'article:publisher': 'Nicotine Pouches UK',
      'og:author': 'Nicotine Pouches UK',
      'og:publisher': 'Nicotine Pouches UK',
    },
  };
  
  return metadata;
}
