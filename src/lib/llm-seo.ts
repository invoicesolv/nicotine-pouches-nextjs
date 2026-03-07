// LLM-optimized SEO utilities for RAG systems
export interface LLMSEOInputs {
  brand: string;
  product_name: string;
  flavour: string;
  strength_mg: number;
  format: string;
  pouch_count: number;
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
  offer_id?: string;
  sku?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface HreflangItem {
  lang: string;
  url: string;
}

export interface LLMSEOOutput {
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
  table_data_attributes: {
    table_id: string;
    aria_caption: string;
    columns: Array<{
      key: string;
      label: string;
      scope: string;
    }>;
    rows: Array<{
      data_attributes: Record<string, any>;
      cells: Array<{
        value: any;
        display: string;
      }>;
    }>;
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
  llm_readability_hints: string[];
}

// Generate LLM-optimized SEO data
export function generateLLMSEO(inputs: LLMSEOInputs): LLMSEOOutput {
  const {
    brand,
    product_name,
    flavour,
    strength_mg,
    format,
    pouch_count,
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
  const title = `${product_name} — Compare pack prices & price per pouch`;

  // Generate description (max 155 chars)
  const description = `Live comparison for ${product_name} — packs, price per pouch, strength (${strength_mg}), format (${format}), stock & reviews.`;

  // Generate stable @graph for LLM consumption
  const schemaGraph: any[] = [
    {
      "@type": "WebPage",
      "@id": `${page_url}#webpage`,
      "url": page_url,
      "name": title,
      "inLanguage": "en-GB",
      "isPartOf": { "@id": `${publisher.url}#website` },
      "dateModified": new Date().toISOString()
    },
    {
      "@type": "WebSite",
      "@id": `${publisher.url}#website`,
      "name": site_name,
      "url": publisher.url
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${page_url}#breadcrumbs`,
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url?.startsWith('http') ? item.url : `https://nicotine-pouches.org${item.url?.startsWith('/') ? item.url : `/${item.url}`}`
      }))
    },
    {
      "@type": "Product",
      "@id": `${page_url}#product`,
      "name": product_name,
      "category": "Nicotine Pouches",
      "brand": { "@type": "Brand", "name": brand },
      "image": images.hero,
      "additionalProperty": [
        { "@type": "PropertyValue", "name": "flavour", "value": flavour },
        { "@type": "PropertyValue", "name": "strength_mg", "value": strength_mg },
        { "@type": "PropertyValue", "name": "format", "value": format },
        { "@type": "PropertyValue", "name": "pouches_per_can", "value": pouch_count }
      ],
      ...(packs.length > 0 ? {
        "offers": {
          "@type": "AggregateOffer",
          "@id": `${page_url}#aggregate`,
          "url": page_url,
          "priceCurrency": packs[0].currency,
          "offerCount": packs.length,
          "lowPrice": Math.min(...packs.map(p => p.price)),
          "highPrice": Math.max(...packs.map(p => p.price)),
          "offers": packs.map(pack => ({
            "@type": "Offer",
            "@id": pack.offer_id || `${page_url}/offer/${pack.retailer_name.toLowerCase().replace(/\s+/g, '-')}-${pack.pack_size}pk-${new Date().toISOString().split('T')[0]}`,
            "sku": pack.sku || `${brand.toUpperCase()}-${flavour.replace(/\s+/g, '').toUpperCase()}-${pack.pack_size}PK`,
            "url": pack.retailer_url,
            "price": pack.price,
            "priceCurrency": pack.currency,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": pack.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "@id": `${pack.retailer_url}#org`,
              "name": pack.retailer_name
            },
            "additionalProperty": [
              { "@type": "PropertyValue", "name": "pack_size", "value": pack.pack_size },
              { "@type": "PropertyValue", "name": "price_per_pouch", "value": pack.price_per_pouch },
              { "@type": "PropertyValue", "name": "last_seen", "value": pack.last_seen },
              ...(pack.shipping_note ? [{ "@type": "PropertyValue", "name": "shipping_note", "value": pack.shipping_note }] : [])
            ]
          }))
        }
      } : {})
    }
  ];

  // Generate FAQ content for schema (must be before adding to graph)
  const faqItems = [
    {
      question: `How do I find the cheapest ${product_name}?`,
      answer: "Sort by price per pouch and check retailer shipping thresholds; larger packs often reduce cost per pouch."
    },
    {
      question: "Which pack size is best value?",
      answer: "Use the price per pouch column; 10-packs typically win unless a retailer has a time-limited promo."
    },
    {
      question: "How often is pricing updated?",
      answer: `${new_vendor_policy} Check each row's 'last seen' timestamp.`
    },
    {
      question: `What affects price per pouch for ${product_name}?`,
      answer: "Pack size, promotions, shipping thresholds, and pouch count per can. Always review retailer delivery terms."
    },
    {
      question: `What is the nicotine strength of ${product_name}?`,
      answer: `${product_name} contains ${strength_mg}mg of nicotine per pouch, which is considered ${strength_mg <= 6 ? 'mild' : strength_mg <= 12 ? 'medium' : 'strong'} strength.`
    },
    {
      question: `How many pouches are in a can of ${product_name}?`,
      answer: `Each can of ${product_name} contains ${pouch_count} pouches in ${format} format.`
    }
  ];

  // Add FAQPage schema to graph for +40% AI visibility (Princeton GEO research)
  schemaGraph.push({
    "@type": "FAQPage",
    "@id": `${page_url}#faq`,
    "mainEntity": faqItems.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  });

  // Generate table data attributes for LLM consumption
  const tableColumns = [
    { key: "pack_size", label: "Pack size", scope: "col" },
    { key: "price", label: "Price", scope: "col" },
    { key: "price_per_pouch", label: "Price / pouch", scope: "col" },
    { key: "strength_mg", label: "Strength", scope: "col" },
    { key: "format", label: "Format", scope: "col" },
    { key: "pouches_per_can", label: "Pouches/can", scope: "col" },
    { key: "retailer_name", label: "Retailer", scope: "col" },
    { key: "in_stock", label: "Stock", scope: "col" },
    { key: "cta", label: "Go to retailer", scope: "col" }
  ];

  const tableRows = packs.map(pack => ({
    data_attributes: {
      "data-offer-id": pack.offer_id || `${page_url}/offer/${pack.retailer_name.toLowerCase().replace(/\s+/g, '-')}-${pack.pack_size}pk-${new Date().toISOString().split('T')[0]}`,
      "data-pack-size": pack.pack_size,
      "data-price": pack.price,
      "data-currency": pack.currency,
      "data-price-per-pouch": pack.price_per_pouch,
      "data-strength-mg": strength_mg,
      "data-format": format,
      "data-pouches-per-can": pouch_count,
      "data-retailer": pack.retailer_name,
      "data-retailer-url": pack.retailer_url,
      "data-in-stock": pack.in_stock,
      "data-last-seen": pack.last_seen,
      ...(pack.shipping_note && { "data-shipping-note": pack.shipping_note }),
      ...(pack.is_new_vendor && { "data-badge": "new" })
    },
    cells: [
      { value: pack.pack_size, display: pack.pack_size.toString() },
      { value: pack.price, display: `${pack.currency === 'GBP' ? '£' : '€'}${pack.price.toFixed(2)}` },
      { value: pack.price_per_pouch, display: `${pack.currency === 'GBP' ? '£' : '€'}${pack.price_per_pouch.toFixed(3)}` },
      { value: strength_mg, display: `${strength_mg}mg` },
      { value: format, display: format },
      { value: pouch_count, display: pouch_count.toString() },
      { value: pack.retailer_name, display: pack.retailer_name },
      { value: pack.in_stock, display: pack.in_stock ? "In stock" : "Out of stock" },
      { value: pack.retailer_url, display: "View" }
    ]
  }));

  // Convert FAQ items to plaintext format for UI display
  const faqPlaintext = faqItems.map(faq => ({
    q: faq.question,
    a: faq.answer
  }));

  // Generate freshness signals
  const freshnessSignals = {
    page_modified: new Date().toISOString(),
    changelog_url: `${page_url}/changes.json`,
    last_vendor_added: packs.find(p => p.is_new_vendor)?.last_seen
  };

  // LLM readability hints
  const llmReadabilityHints = [
    "Keep units explicit: 'mg', 'pouches/can', 'pack size'.",
    "Expose microdata via JSON-LD + data-* attributes in each row.",
    "Avoid ambiguous phrasing ('best', 'cheap') unless backed by numeric comparison.",
    "Provide ISO dates for 'last_seen'.",
    "Use consistent currency formatting; avoid mixing € and EUR within the same table.",
    "Stable @id anchors let you resolve and dedupe entities across crawls.",
    "Numeric fields are machine-scannable for ranking/aggregation.",
    "Offer-level additionalProperty carries comparison-only fields that schema.org doesn't natively model."
  ];

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
        'og:image': images.hero
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        image: images.hero
      }
    },
    schema_json_ld: {
      "@context": "https://schema.org",
      "@graph": schemaGraph
    },
    table_data_attributes: {
      table_id: "price-compare",
      aria_caption: `${product_name} pack prices, price per pouch, stock and retailers — updated frequently`,
      columns: tableColumns,
      rows: tableRows
    },
    faq_plaintext: faqPlaintext,
    internal_linking: {
      to_brand_hub: related_entities.brand_hub,
      to_flavour_hub: related_entities.flavour_hub,
      to_strength_filter: related_entities.strength_filter,
      alternatives: related_entities.alternatives
    },
    freshness_signals: freshnessSignals,
    llm_readability_hints: llmReadabilityHints
  };
}

// Helper function to extract LLM SEO data from database format
export function extractLLMSEODataFromDB(product: any, vendorProducts: any[]): LLMSEOInputs {
  const nameParts = product.name.split(' ');
  const brand = nameParts[0] || '';
  const flavour = nameParts.slice(1).join(' ') || '';
  const product_name = product.name;
  
  // Extract strength from product name
  const strengthMatch = product.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
  const strength_mg = strengthMatch ? parseFloat(strengthMatch[1]) : 10;
  
  // Extract format
  const formatMatch = product.name.match(/(Slim|Mini|Max|Ultra)/i);
  const format = formatMatch ? formatMatch[1] : 'Slim';
  
  // Default pouch count
  const pouch_count = 20;
  
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
          is_new_vendor: false,
          offer_id: `${product_name.toLowerCase().replace(/\s+/g, '-')}-${pack.size}pk-${vp.vendors?.name?.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
          sku: `${brand.toUpperCase()}-${flavour.replace(/\s+/g, '').toUpperCase()}-${pack.size}PK`
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
