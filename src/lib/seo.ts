// SEO utilities for product pages
export interface ProductSEOInputs {
  brand: string;
  product_name: string;
  flavour: string;
  strength_mg: number | string;
  format: string;
  pouch_count: number;
  nicotine_free_option: boolean;
  country_focus: string;
  primary_keyword: string;
  secondary_keywords: string[];
  brand_keywords: string[];
  competitor_brands: string[];
  product_list: ProductListItem[];
  packs: PackPricing[];
  new_vendor_policy: string;
  images: {
    hero: string;
    alt: string;
  };
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

export interface ProductListItem {
  name: string;
  brand: string;
  flavour: string;
  strength_mg: number;
  format: string;
  pouch_count: number;
  price: number;
  currency: string;
  in_stock: boolean;
  rating_value: number;
  review_count: number;
  sku: string;
  gtin13: string | null;
  url: string;
  image: string;
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

export interface SEOOutput {
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
  technical_seo_checklist: string[];
  graphql_keywords: {
    seed_terms: string[];
    expanded_terms_rules: string[];
  };
  on_page_copy_scaffold: {
    h1: string;
    intro: string;
    top_picks_section: {
      h2: string;
      cards_required_fields: string[];
    };
    price_table_section: {
      h2: string;
      table_columns: string[];
    };
    specs_section: {
      h2: string;
      bullets: string[];
    };
    disclaimer: string;
  };
  schema_json_ld: {
    BreadcrumbList: any;
    WebPage: any;
    ItemList: any;
    Product_set: any[];
    FAQPage: any;
  };
  internal_linking: {
    to_brand_hub: string;
    to_flavour_hub: string;
    to_strength_filter: string;
    related_flavours: string[];
  };
  comparison_meta_variations: {
    primary: string;
    alt_1: string;
    alt_2: string;
  };
  faq_plaintext: Array<{
    q: string;
    a: string;
  }>;
  compliance_notes: string[];
  page_speed_core_web_vitals: {
    lcp: string;
    cls: string;
    'fid/inp': string;
  };
  testing_and_validation: {
    html_validation: string;
    schema_validation: string;
    meta_validation: string;
    logs: string;
  };
}

// Generate SEO data for product comparison pages
export function generateProductSEO(inputs: ProductSEOInputs): SEOOutput {
  const { 
    brand,
    product_name,
    flavour, 
    strength_mg, 
    format,
    pouch_count,
    nicotine_free_option, 
    country_focus, 
    primary_keyword,
    secondary_keywords,
    brand_keywords,
    competitor_brands,
    product_list,
    packs,
    new_vendor_policy,
    images,
    page_url,
    site_name,
    publisher,
    breadcrumbs,
    hreflang,
    related_entities
  } = inputs;

  // Generate title (max 60 chars)
  const title = `${product_name} — Compare pack prices & strength`;

  // Generate description (max 155 chars)
  const description = `Live comparison for ${product_name} — packs, price per pouch, strength (${strength_mg}), format (${format}), stock & reviews.`;

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  // Generate WebPage schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${page_url}#webpage`,
    "url": page_url,
    "name": `${product_name} — comparison`,
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": site_name,
      "url": publisher.url
    },
    "publisher": {
      "@type": "Organization",
      "name": publisher.name,
      "url": publisher.url,
      "logo": {
        "@type": "ImageObject",
        "url": publisher.logo
      }
    }
  };

  // Generate ItemList schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${product_name} – comparison list`,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "numberOfItems": product_list.length,
    "itemListElement": product_list.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": product.url,
      "name": product.name
    }))
  };

  // Generate Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product_name,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "image": images.hero,
    "category": "Nicotine Pouches",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Flavour",
        "value": flavour
      },
      {
        "@type": "PropertyValue",
        "name": "Strength (mg)",
        "value": strength_mg.toString()
      },
      {
        "@type": "PropertyValue",
        "name": "Format",
        "value": format
      },
      {
        "@type": "PropertyValue",
        "name": "Pouches per can",
        "value": pouch_count.toString()
      }
    ]
  };

  // Generate AggregateOffer schema for pack pricing
  const aggregateOfferSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    "url": page_url,
    "priceCurrency": packs.length > 0 ? packs[0].currency : "GBP",
    "lowPrice": packs.length > 0 ? Math.min(...packs.map(p => p.price)).toString() : "0",
    "highPrice": packs.length > 0 ? Math.max(...packs.map(p => p.price)).toString() : "0",
    "offerCount": packs.length.toString(),
    "offers": packs.map(pack => ({
      "@type": "Offer",
      "price": pack.price.toString(),
      "priceCurrency": pack.currency,
      "availability": pack.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": pack.retailer_url,
      "seller": {
        "@type": "Organization",
        "name": pack.retailer_name
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Pack Size",
          "value": pack.pack_size.toString()
        },
        {
          "@type": "PropertyValue",
          "name": "Price per Pouch",
          "value": pack.price_per_pouch.toString()
        }
      ]
    }))
  };

  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How do pack prices compare for ${product_name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We list 1-, 5-, and 10-pack options with live price per pouch so you can quickly see the best value."
        }
      },
      {
        "@type": "Question",
        "name": "How often do new vendors appear?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${new_vendor_policy} We refresh offers and mark new retailers with a 'New' badge.`
        }
      },
      {
        "@type": "Question",
        "name": "What affects price per pouch?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pack size, promotions, shipping thresholds, and pouch count per can. Always review retailer delivery terms."
        }
      },
      {
        "@type": "Question",
        "name": `Is ${product_name} available in different strengths or formats?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we display strength (mg) and format (Slim/Mini) so you can pick what suits you."
        }
      }
    ]
  };

  // Generate seed terms
  const seedTerms = [
    `compare ${product_name} packs`,
    `${brand} ${flavour} price per pouch`,
    `${product_name} best price ${country_focus}`,
    `${brand} ${flavour} ${strength_mg} ${format}`,
    `${product_name} stock checker`,
    `buy ${product_name} online`,
    `${brand} ${flavour} deals`
  ];

  // Generate expanded terms rules
  const expandedTermsRules = [
    "Generate long-tails with '1-pack', '5-pack', '10-pack', 'bulk', 'cheapest', 'in stock today'.",
    "Include commercial modifiers: 'price', 'deal', 'delivery', 'free shipping', 'coupon'.",
    "Create brand + flavour + strength + format combinations.",
    "Mirror FAQ intents as question-keywords ('How many pouches per can?', 'What is price per pouch?')."
  ];

  // Generate unique formats from product list
  const uniqueFormats = Array.from(new Set(product_list.map(p => p.format))).join(', ');

  // Generate specs bullets
  const specsBullets = [
    `Brand: ${brand}`,
    `Product: ${product_name}`,
    `Flavour: ${flavour}`,
    `Strength: ${strength_mg}`,
    `Format: ${format}`,
    `Pouches per can: ${pouch_count}`
  ];

  // Generate intro text
  const intro = `What we compare (pack sizes, price per pouch, strength, format), update cadence ('${new_vendor_policy}'), and regional availability caveat.`;

  // Generate internal linking
  const internalLinking = {
    to_brand_hub: related_entities.brand_hub,
    to_flavour_hub: related_entities.flavour_hub,
    to_strength_filter: related_entities.strength_filter,
    related_flavours: related_entities.alternatives || [],
    alternatives: related_entities.alternatives
  };

  // Generate FAQ plaintext
  const faqPlaintext = [
    {
      q: `How do I find the cheapest ${product_name}?`,
      a: "Sort by price per pouch and check retailer shipping thresholds; larger packs often reduce cost per pouch."
    },
    {
      q: "Which pack size is best value?",
      a: "Use the price per pouch column; 10-packs typically win unless a retailer has a time-limited promo."
    },
    {
      q: "How often is pricing updated?",
      a: `${new_vendor_policy} Check each row's 'last seen' timestamp.`
    }
  ];

  // Generate comparison meta variations
  const comparisonMetaVariations = {
    primary: `${product_name} — Compare pack prices & price per pouch`,
    alt_1: `Best price for ${product_name}: 1, 5 & 10-packs`,
    alt_2: `${brand} ${flavour} deals — live pack comparison`
  };

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
        'og:type': 'website',
        'og:image': product_list[0]?.image || '/placeholder-product.jpg'
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        image: product_list[0]?.image || '/placeholder-product.jpg'
      }
    },
    technical_seo_checklist: [
      `Ensure only one canonical tag pointing to ${page_url}.`,
      `Implement hreflang for all locales in inputs.hreflang; include x-default.`,
      "Lazy-load non-critical images with width/height set; use <link rel='preload'> for hero image if LCP.",
      `Generate unique H1: '${flavour} ${brand} nicotine pouches comparison'.`,
      "Single H1; H2s for sections: Overview, Top picks, Price comparison, Specs, FAQs.",
      "Include internal links to: flavour hub, brand hub, strength filters, related flavours.",
      "Add breadcrumb markup and visible breadcrumbs.",
      "Compress images (WebP/AVIF) and include <img loading='lazy' decoding='async'>.",
      "Validate all JSON-LD with schema.org; no conflicting @types.",
      "Use descriptive anchor text (avoid 'click here').",
      "Add lastmod in XML sitemap when content/prices change.",
      "Return 200 status; avoid soft 404.",
      "Implement structured data only for products actually listed and, if aggregated, include ItemList + Offer.",
      "No doorway pages; unique copy for each flavour/brand combo.",
      "Set cache policy for price widgets (client-side refresh allowed)."
    ],
    graphql_keywords: {
      seed_terms: seedTerms,
      expanded_terms_rules: expandedTermsRules
    },
    on_page_copy_scaffold: {
      h1: `${flavour} ${brand} nicotine pouches comparison`,
      intro,
      top_picks_section: {
        h2: "Top picks",
        cards_required_fields: ["name", "price", "currency", "strength_mg", "format", "pouch_count", "rating_value", "url", "image"]
      },
      price_table_section: {
        h2: "Live price comparison",
        table_columns: ["Product", "Price", "Price per pouch", "Strength", "Format", "Pouches/can", "Stock", "Retailer"]
      },
      specs_section: {
        h2: "Specs & flavour profile",
        bullets: specsBullets
      },
      disclaimer: "Nicotine products are intended for adult consumers only. No health claims. Check local regulations."
    },
    schema_json_ld: {
      BreadcrumbList: breadcrumbSchema,
      WebPage: webPageSchema,
      ItemList: itemListSchema,
      Product_set: [productSchema],
      FAQPage: faqSchema
    },
    internal_linking: internalLinking,
    comparison_meta_variations: comparisonMetaVariations,
    faq_plaintext: faqPlaintext,
    compliance_notes: [
      "No health/cessation claims.",
      "Adults-only disclaimer on page.",
      "Respect local regulations; avoid cross-border purchase encouragement if restricted.",
      "Avoid superlatives without comparable metrics; use data-backed comparisons only."
    ],
    page_speed_core_web_vitals: {
      lcp: "Optimise hero image (preload, responsive sizes, AVIF/WebP).",
      cls: "Reserve space for price widgets and images with width/height.",
      "fid/inp": "Defer non-critical scripts; hydrate comparison table after first paint."
    },
    testing_and_validation: {
      html_validation: "No duplicate IDs; single H1; proper heading order.",
      schema_validation: "Test JSON-LD in Rich Results Test; ensure no mismatched currencies.",
      meta_validation: "Unique title/description; pixel width within limits.",
      logs: "Track clicks on sort/filter; schema render success; price fetch errors."
    }
  };
}

// Helper function to extract product data from database format
export function extractProductDataFromDB(product: any, vendorProducts: any[]): ProductSEOInputs {
  const nameParts = product.name.split(' ');
  const brand = nameParts[0] || '';
  const flavour = nameParts.slice(1).join(' ') || '';
  const product_name = product.name;
  
  // Extract strength from product name or vendor products
  const strengthMatch = product.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
  const strength_mg = strengthMatch ? strengthMatch[1] : 'Standard';
  
  // Extract format
  const formatMatch = product.name.match(/(Slim|Mini|Max|Ultra)/i);
  const format = formatMatch ? formatMatch[1] : 'Standard';
  
  // Default pouch count
  const pouch_count = 20;
  
  // Transform vendor products to product list format
  const product_list: ProductListItem[] = vendorProducts.map((vp: any) => {
    const strengthMatch = vp.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
    const strength = strengthMatch ? strengthMatch[1] : 'Standard';
    const strengthMg = parseFloat(strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
    
    return {
      name: vp.name,
      brand: brand,
      flavour: flavour,
      strength_mg: strengthMg,
      format: format,
      pouch_count: pouch_count,
      price: parseFloat(vp.price_1pack?.replace('£', '') || '0'),
      currency: 'GBP',
      in_stock: true, // Default to in stock
      rating_value: vp.vendors?.rating || 4.5,
      review_count: Math.floor(Math.random() * 100) + 10, // Mock review count
      sku: vp.sku || '',
      gtin13: null,
      url: vp.url || '#',
      image: product.image_url || '/placeholder-product.jpg'
    };
  });

  // Generate pack pricing from vendor products
  const packs: PackPricing[] = [];
  vendorProducts.forEach((vp: any) => {
    const packSizes = [
      { size: 1, price: vp.price_1pack },
      { size: 3, price: vp.price_3pack },
      { size: 5, price: vp.price_5pack },
      { size: 10, price: vp.price_10pack },
      { size: 20, price: vp.price_20pack },
      { size: 25, price: vp.price_25pack },
      { size: 30, price: vp.price_30pack },
      { size: 50, price: vp.price_50pack }
    ];

    packSizes.forEach(pack => {
      if (pack.price && pack.price !== 'N/A') {
        const price = parseFloat(pack.price.replace('£', ''));
        const pricePerPouch = price / (pack.size * pouch_count);
        
        packs.push({
          pack_size: pack.size,
          price: price,
          currency: 'GBP',
          price_per_pouch: pricePerPouch,
          retailer_name: vp.vendors?.name || 'Unknown Retailer',
          retailer_url: vp.url || '#',
          in_stock: true,
          shipping_note: vp.vendors?.shipping_info || null,
          last_seen: new Date().toISOString(),
          is_new_vendor: false // Could be determined by checking if vendor was added recently
        });
      }
    });
  });

  return {
    brand,
    product_name,
    flavour,
    strength_mg,
    format,
    pouch_count,
    nicotine_free_option: false, // Default to false
    country_focus: 'United Kingdom',
    primary_keyword: `compare ${product_name} packs`,
    secondary_keywords: [
      `${brand} ${flavour} price per pouch`,
      `${product_name} best price UK`,
      `${brand} ${flavour} deals`,
      `buy ${product_name} online`
    ],
    brand_keywords: [
      `${brand} nicotine pouches`,
      `${brand} pouches UK`,
      `${brand} comparison`
    ],
    competitor_brands: ['ZYN', 'LOOP', 'VLN'],
    product_list,
    packs,
    new_vendor_policy: 'New vendors added daily; table updates hourly',
    images: {
      hero: product.image_url || '/placeholder-product.jpg',
      alt: product_name
    },
    page_url: `https://nicotine-pouches.org/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`,
    site_name: 'Nicotine Pouches UK',
    publisher: {
      name: 'Nicotine Pouches UK',
      logo: 'https://nicotine-pouches.org/logo.png',
      url: 'https://nicotine-pouches.org'
    },
    breadcrumbs: [
      { name: 'Home', url: 'https://nicotine-pouches.org' },
      { name: 'Brands', url: 'https://nicotine-pouches.org/brand/' },
      { name: brand, url: `https://nicotine-pouches.org/brand/${brand.toLowerCase().replace(/\s+/g, '-')}` },
      { name: product_name, url: `https://nicotine-pouches.org/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}` }
    ],
    hreflang: [
      { lang: 'en-gb', url: `https://nicotine-pouches.org/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}` },
      { lang: 'en-us', url: `https://nicotine-pouches.org/us/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}` },
      { lang: 'x-default', url: `https://nicotine-pouches.org/product/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}` }
    ],
    related_entities: {
      brand_hub: `https://nicotine-pouches.org/brand/${brand.toLowerCase().replace(/\s+/g, '-')}`,
      flavour_hub: `https://nicotine-pouches.org/flavours/${flavour.toLowerCase().replace(/\s+/g, '-')}`,
      strength_filter: `https://nicotine-pouches.org/strength/${strength_mg}-mg`,
      alternatives: [
        `https://nicotine-pouches.org/product/${brand.toLowerCase()}-spearmint`,
        `https://nicotine-pouches.org/product/velo-ice-cool`
      ]
    }
  };
}
