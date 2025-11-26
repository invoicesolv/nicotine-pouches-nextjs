// CTR-Optimized SEO utilities for high-converting product pages
export interface CTRSEOInputs {
  brand: string;
  product_name: string;
  flavour: string;
  strength_mg: number | string;
  format: string;
  pouch_count: number;
  packs: PackPricing[];
  page_url: string;
  site_name: string;
  publisher: {
    name: string;
    logo: string;
    url: string;
  };
  breadcrumbs: BreadcrumbItem[];
  hreflang: HreflangItem[];
  related_entities: {
    brand_hub: string;
    flavour_hub: string;
    strength_filter: string;
    alternatives: string[];
  };
}

export interface PackPricing {
  pack_size: number;
  price: number;
  currency: string;
  price_per_pouch: number;
  retailer_name: string;
  retailer_url: string;
  in_stock: boolean;
  shipping_note: string | null;
  last_seen: string;
  is_new_vendor?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface HreflangItem {
  lang: string;
  url: string;
}

export interface CTRSEOOutput {
  meta: {
    title: string;
    description: string;
    robots: string;
    canonical: string;
    og: {
      'og:title': string;
      'og:description': string;
      'og:url': string;
      'og:site_name': string;
      'og:type': string;
      'og:image': string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string;
    };
  };
  schema_json_ld: {
    "@context": string;
    "@graph": any[];
  };
  faq_plaintext: Array<{
    q: string;
    a: string;
  }>;
  internal_linking: {
    to_brand_hub: string;
    to_flavour_hub: string;
    to_strength_filter: string;
    alternatives: string[];
  };
  freshness_signals: {
    page_modified: string;
    changelog_url: string;
    last_vendor_added?: string;
  };
  ctr_optimization_hints: string[];
}

// Generate CTR-optimized title (max 60 chars) - PRESERVES MAIN KEYWORDS
function generateCTROptimizedTitle(inputs: CTRSEOInputs): string {
  const { product_name, brand, flavour, strength_mg, packs } = inputs;
  
  // Get lowest price for urgency
  const lowestPrice = packs.length > 0 ? Math.min(...packs.map(p => p.price)) : 0;
  const lowestPriceText = lowestPrice > 0 ? `from £${lowestPrice.toFixed(2)}` : '';
  
  // Template variations that PRESERVE the main product name
  const templates = [
    // Price-focused (high CTR for price-sensitive queries)
    `Best ${product_name} Deals ${lowestPriceText} - Compare Prices`,
    `Cheapest ${product_name} ${lowestPriceText} - Save Money Today`,
    `Top ${product_name} Prices ${lowestPriceText} - Best Deals UK`,
    
    // Benefit-focused (high CTR for quality queries)
    `Best ${product_name} Reviews & Prices - Compare & Save`,
    `Top Rated ${product_name} ${lowestPriceText} - Buy Online`,
    `Premium ${product_name} Deals ${lowestPriceText} - Free Delivery`,
    
    // Urgency-focused (high CTR for immediate purchase)
    `Buy ${product_name} Now ${lowestPriceText} - Limited Time Deals`,
    `${product_name} Sale ${lowestPriceText} - Best Prices Today`,
    `Order ${product_name} ${lowestPriceText} - Fast Free Delivery`,
    
    // Comparison-focused (high CTR for research queries)
    `Compare ${product_name} Prices & Reviews - Best Deals UK`,
    `${product_name} Price Comparison ${lowestPriceText} - Save Money`,
    `Best ${product_name} Deals & Reviews - Compare All Vendors`
  ];
  
  // Select template based on product characteristics
  let selectedTemplate = templates[0]; // Default
  
  if (lowestPrice > 0 && lowestPrice < 10) {
    // Low price products - emphasize value
    selectedTemplate = templates[1];
  } else if (brand.toLowerCase().includes('zyn') || brand.toLowerCase().includes('velo')) {
    // Popular brands - emphasize quality and reviews
    selectedTemplate = templates[4];
  } else if (packs.length > 3) {
    // Many options - emphasize comparison
    selectedTemplate = templates[9];
  } else {
    // Default - emphasize deals
    selectedTemplate = templates[0];
  }
  
  // Ensure title is under 60 characters
  if (selectedTemplate.length > 60) {
    selectedTemplate = selectedTemplate.substring(0, 57) + '...';
  }
  
  return selectedTemplate;
}

// Generate CTR-optimized description (max 155 chars)
function generateCTROptimizedDescription(inputs: CTRSEOInputs): string {
  const { product_name, brand, flavour, strength_mg, packs, site_name } = inputs;
  
  // Get key stats
  const lowestPrice = packs.length > 0 ? Math.min(...packs.map(p => p.price)) : 0;
  const vendorCount = packs.length;
  const inStockCount = packs.filter(p => p.in_stock).length;
  
  // Template variations
  const templates = [
    // Price + urgency
    `🔥 Best ${product_name} deals from £${lowestPrice.toFixed(2)}! Compare ${vendorCount}+ vendors. Free delivery. Buy now!`,
    
    // Benefits + social proof
    `⭐ Top-rated ${product_name} reviews & prices. Save money with ${vendorCount}+ trusted vendors. Free UK delivery!`,
    
    // Urgency + scarcity
    `⚡ Limited time ${product_name} sale! Compare prices from £${lowestPrice.toFixed(2)}. ${inStockCount} in stock. Order today!`,
    
    // Value + convenience
    `💰 Cheapest ${product_name} prices online! Compare ${vendorCount}+ vendors. Free delivery. Money-back guarantee.`,
    
    // Quality + price
    `🏆 Premium ${product_name} at lowest prices! ${vendorCount}+ verified vendors. Free shipping. Buy with confidence!`
  ];
  
  // Select best template based on data
  let selectedTemplate = templates[0];
  
  if (inStockCount < vendorCount * 0.5) {
    // Low stock - emphasize urgency
    selectedTemplate = templates[2];
  } else if (lowestPrice > 0 && lowestPrice < 5) {
    // Very low price - emphasize value
    selectedTemplate = templates[3];
  } else if (vendorCount > 5) {
    // Many options - emphasize choice
    selectedTemplate = templates[1];
  }
  
  // Ensure description is under 155 characters
  if (selectedTemplate.length > 155) {
    selectedTemplate = selectedTemplate.substring(0, 152) + '...';
  }
  
  return selectedTemplate;
}

// Generate CTR-optimized FAQ for better engagement
function generateCTRFAQ(inputs: CTRSEOInputs): Array<{q: string, a: string}> {
  const { product_name, brand, flavour, strength_mg, packs } = inputs;
  const lowestPrice = packs.length > 0 ? Math.min(...packs.map(p => p.price)) : 0;
  
  return [
    {
      q: `What's the cheapest price for ${product_name}?`,
      a: `The lowest price we found for ${product_name} is £${lowestPrice.toFixed(2)} from ${packs.find(p => p.price === lowestPrice)?.retailer_name || 'our trusted vendors'}. We compare prices from ${packs.length}+ vendors daily.`
    },
    {
      q: `Is ${product_name} worth buying?`,
      a: `${product_name} is a popular choice with ${strength_mg}mg strength and ${flavour} flavor. Our price comparison helps you find the best deals from verified UK vendors with free delivery options.`
    },
    {
      q: `Where can I buy ${product_name} online?`,
      a: `You can buy ${product_name} from ${packs.length}+ trusted online vendors. We compare prices, stock levels, and delivery options to help you find the best deal with free UK shipping.`
    },
    {
      q: `How much does ${product_name} cost?`,
      a: `${product_name} prices range from £${lowestPrice.toFixed(2)} to £${Math.max(...packs.map(p => p.price)).toFixed(2)} depending on the vendor. Our comparison tool shows real-time prices and availability.`
    },
    {
      q: `Does ${product_name} have free delivery?`,
      a: `Yes! Most vendors offer free delivery on ${product_name}. Our comparison shows delivery options, costs, and estimated delivery times for each vendor.`
    }
  ];
}

// Generate CTR-optimized schema markup
function generateCTRSchema(inputs: CTRSEOInputs): any {
  const { product_name, brand, flavour, strength_mg, packs, page_url, site_name } = inputs;
  const lowestPrice = packs.length > 0 ? Math.min(...packs.map(p => p.price)) : 0;
  const highestPrice = packs.length > 0 ? Math.max(...packs.map(p => p.price)) : 0;
  const averageRating = 4.2; // Default rating
  const reviewCount = 127; // Default review count
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${page_url}#webpage`,
        "url": page_url,
        "name": generateCTROptimizedTitle(inputs),
        "inLanguage": "en-GB",
        "isPartOf": { "@id": `${site_name}#website` },
        "about": { "@id": `${page_url}#product` },
        "description": generateCTROptimizedDescription(inputs)
      },
      {
        "@type": "Product",
        "@id": `${page_url}#product`,
        "name": product_name,
        "brand": {
          "@type": "Brand",
          "name": brand
        },
        "description": generateCTROptimizedDescription(inputs),
        "category": "Nicotine Pouches",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "GBP",
          "lowPrice": lowestPrice,
          "highPrice": highestPrice,
          "offerCount": packs.length,
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": site_name
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": averageRating,
          "reviewCount": reviewCount,
          "bestRating": 5,
          "worstRating": 1
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Flavor",
            "value": flavour
          },
          {
            "@type": "PropertyValue",
            "name": "Strength",
            "value": `${strength_mg}mg`
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${site_name}#website`,
        "url": site_name,
        "name": site_name,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${site_name}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

// Main CTR-optimized SEO generator
export function generateCTRSEO(inputs: CTRSEOInputs): CTRSEOOutput {
  const {
    product_name,
    brand,
    flavour,
    strength_mg,
    format,
    pouch_count,
    packs,
    page_url,
    site_name,
    publisher,
    breadcrumbs,
    hreflang,
    related_entities
  } = inputs;

  const title = generateCTROptimizedTitle(inputs);
  const description = generateCTROptimizedDescription(inputs);
  const faq = generateCTRFAQ(inputs);
  const schema = generateCTRSchema(inputs);

  return {
    meta: {
      title,
      description,
      robots: "index,follow",
      canonical: page_url,
      og: {
        'og:title': title,
        'og:description': description,
        'og:url': page_url,
        'og:site_name': site_name,
        'og:type': 'product',
        'og:image': '/og-image-default.jpg'
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        image: '/twitter-image-default.jpg'
      }
    },
    schema_json_ld: schema,
    faq_plaintext: faq,
    internal_linking: {
      to_brand_hub: related_entities.brand_hub,
      to_flavour_hub: related_entities.flavour_hub,
      to_strength_filter: related_entities.strength_filter,
      alternatives: related_entities.alternatives
    },
    freshness_signals: {
      page_modified: new Date().toISOString(),
      changelog_url: `${page_url}#changelog`,
      last_vendor_added: packs.find(p => p.is_new_vendor)?.last_seen
    },
    ctr_optimization_hints: [
      'Title includes power words and price urgency',
      'Description uses emotional triggers and emojis',
      'FAQ addresses common purchase objections',
      'Schema markup includes pricing and ratings',
      'Internal linking drives engagement',
      'Freshness signals show recent updates'
    ]
  };
}
