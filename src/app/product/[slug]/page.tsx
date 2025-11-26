import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { generateLLMSEO, extractLLMSEODataFromDB } from '@/lib/llm-seo';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import { getSEOTags, renderSchemaTag, generateStandaloneAggregateRating, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getProductSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getProductAggregateRating } from '@/lib/aggregate-ratings';
import VendorLogo from '@/components/VendorLogo';
import PackFilter from '@/components/PackFilter';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewFilter from '@/components/ReviewFilter';
import ReviewBalls from '@/components/ReviewBalls';
import ReviewForm from '@/components/ReviewForm';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import VendorAnalytics from '@/components/VendorAnalytics';
import ProductComparisonTable from '@/components/ProductComparisonTable';
import ProductDetailsCard from '@/components/ProductDetailsCard';
import FAQSection from '@/components/FAQSection';
import CookieConsent from '@/components/CookieConsent';
import { getImageStyles } from '@/utils/imageUtils';
import { generateProductHreflang, generateSafeHreflang } from '@/lib/hreflang';

// Fetch product data from Supabase
async function getProduct(slug: string) {
  try {
    // Convert slug back to proper case name
    const properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // First try to find by exact name match in wp_products
    let { data: product, error } = await supabase()
      .from('wp_products')
      .select('*')
      .eq('name', properCaseName)
      .single();

    // If not found, try case-insensitive match
    if (error || !product) {
      const { data: products, error: searchError } = await supabase()
        .from('wp_products')
        .select('*')
        .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
        .limit(1);

      if (searchError || !products || products.length === 0) {
        console.error('Product not found:', { searchError, slug, properCaseName });
        return null;
      }
      product = products[0];
    }

    // Extract brand and flavour from product name for wp_products
    const productName = product.name || '';
    const brand = productName.split(' ')[0] || 'Unknown';
    const flavour = productName.split(' ').slice(1).join(' ') || 'Unknown';
    const strengthGroup = '6mg'; // Default strength for wp_products
    
    console.log('Found product:', { id: product.id, name: product.name, brand, flavour });

    // Get vendor products using the correct mapping approach
    let vendorProducts = [];
    
    // First, get mappings for this product
    const { data: mappings, error: mappingError } = await supabase()
      .from('vendor_product_mapping')
      .select('vendor_product, vendor_id')
      .eq('product_id', product.id);

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
      } else {
      console.log('Found mappings:', mappings?.length || 0);
    }

    if (mappings && mappings.length > 0) {
      // Get vendor products using the correct join
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(`
          *,
          vendors!inner(
            id,
            name,
            logo_url,
            rating,
            shipping_info
          )
        `)
        .in('name', mappings.map((m: any) => m.vendor_product))
        .in('vendor_id', mappings.map((m: any) => m.vendor_id));

      if (vpError) {
        console.error('Error fetching mapped vendor products:', vpError);
      } else {
        vendorProducts = vpData || [];
      }
    } else {
      // Fallback: search for products with similar brand name
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(`
          *,
          vendors!inner(
            id,
            name,
            logo_url,
            rating,
            shipping_info
          )
        `)
        .ilike('name', `%${brand.toLowerCase()}%`)
      .limit(10);

      if (vpError) {
        console.error('Error fetching vendor products by brand:', vpError);
      } else {
        vendorProducts = vpData || [];
      }
    }
    
    console.log('Found vendor products:', vendorProducts.length);

    // Helper function to format prices consistently
    const formatPrice = (price: any) => {
      if (!price) return 'N/A';
      const priceStr = price.toString();
      if (priceStr.includes('£')) {
        // Extract number from £X.XX format and reformat
        const numStr = priceStr.replace('£', '');
        return `£${parseFloat(numStr).toFixed(2)}`;
      } else {
        // Add £ and format to 2 decimal places
        return `£${parseFloat(priceStr).toFixed(2)}`;
      }
    };

    // Transform vendor products to store format and group by vendor
    const storesMap = new Map();
    vendorProducts?.forEach((vp: any) => {
      const vendorKey = vp.vendor_id;
      
      if (!storesMap.has(vendorKey)) {
        storesMap.set(vendorKey, {
      id: vp.id,
          name: vp.vendors.name,
      logo: vp.vendors.logo_url,
          rating: vp.vendors.rating || 4.5,
          shipping_info: vp.vendors.shipping_info || 'Standard shipping',
          vendorId: vp.vendor_id,
          variants: []
        });
      }
      
      // Extract strength from product name (e.g., "6mg", "10mg", "Mini 3mg")
      const strengthMatch = vp.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
      const strength = strengthMatch ? strengthMatch[1] : 'Standard';
      
      // Add variant to the vendor
      storesMap.get(vendorKey).variants.push({
        product: vp.name,
        strength: strength,
        price: formatPrice(vp.price_1pack),
        link: vp.url || '#',
        prices: {
          '1pack': formatPrice(vp.price_1pack),
          '3pack': formatPrice(vp.price_3pack),
          '5pack': formatPrice(vp.price_5pack),
          '10pack': formatPrice(vp.price_10pack),
          '20pack': formatPrice(vp.price_20pack),
          '25pack': formatPrice(vp.price_25pack),
          '30pack': formatPrice(vp.price_30pack),
          '50pack': formatPrice(vp.price_50pack)
          },
          in_stock: true
      });
    });
    
    // Convert to array and sort variants by strength
    const stores = Array.from(storesMap.values()).map(store => ({
      ...store,
      variants: store.variants.sort((a: any, b: any) => {
        // Sort by strength: Mini < Normal < Strong < Extra Strong
        const strengthOrder: { [key: string]: number } = { 'Mini': 1, 'Normal': 2, 'Strong': 3, 'Extra Strong': 4, 'Max': 5, 'Ultra': 6 };
        const aOrder = strengthOrder[a.strength] || 0;
        const bOrder = strengthOrder[b.strength] || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // If same strength category, sort by mg value
        const aMg = parseFloat(a.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        const bMg = parseFloat(b.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        return aMg - bMg;
      }),
      // Add legacy prices for backward compatibility
      prices: store.variants[0]?.prices || {
        '1pack': 'N/A',
        '3pack': 'N/A',
        '5pack': 'N/A',
        '10pack': 'N/A',
        '20pack': 'N/A',
        '25pack': 'N/A',
        '30pack': 'N/A',
        '50pack': 'N/A'
      },
      url: store.variants[0]?.link || '#',
      in_stock: true,
      shipping_cost: 0,
      free_shipping_threshold: 0
    }));
    
    // Generate SEO data
    const regularSeoData = await generateProductSEO({
      brand: brand,
      product_name: product.name || 'Unknown Product',
      flavour: flavour,
      strength_mg: strengthGroup,
      format: 'Pouches',
      pouch_count: 20, // Default value
      nicotine_free_option: false,
      country_focus: 'UK',
      primary_keyword: product.name || 'Unknown Product',
      secondary_keywords: [brand, flavour, 'nicotine pouches'],
      brand_keywords: [brand],
      competitor_brands: ['ZYN', 'Velo', 'Skruf'],
      product_list: stores.length > 0 ? stores.map((store: any) => ({
        name: store.name,
        price: store.variants?.[0]?.prices?.['1pack'] || store.prices?.['1pack'] || 'N/A',
        url: store.variants?.[0]?.link || store.url || '#',
        in_stock: store.in_stock,
        brand: brand,
        flavour: flavour,
        strength_mg: store.variants?.[0]?.strength || 'Standard',
        format: 'Pouches',
        pouch_count: 20,
        nicotine_free_option: false,
        retailer_name: store.name,
        retailer_url: store.variants?.[0]?.link || store.url || '#',
        shipping_note: store.shipping_info || 'Standard shipping',
        last_seen: new Date().toISOString(),
        currency: 'GBP',
        rating_value: store.rating || 4.5,
        review_count: 0,
        sku: '',
        image_url: product.image || '/placeholder-product.jpg',
        description: product.description || '',
        gtin13: '',
        image: product.image || '/placeholder-product.jpg'
      })) : [],
      packs: stores.length > 0 ? [
        { 
          pack_size: 1, 
          price: parseFloat(stores[0]?.variants?.[0]?.prices?.['1pack']?.replace('£', '') || stores[0]?.prices?.['1pack']?.replace('£', '') || '0'), 
          currency: 'GBP',
          price_per_pouch: parseFloat(stores[0]?.variants?.[0]?.prices?.['1pack']?.replace('£', '') || stores[0]?.prices?.['1pack']?.replace('£', '') || '0'),
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.variants?.[0]?.link || stores[0]?.url || '',
          in_stock: stores[0]?.in_stock || false,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 5, 
          price: parseFloat(stores[0]?.variants?.[0]?.prices?.['5pack']?.replace('£', '') || stores[0]?.prices?.['5pack']?.replace('£', '') || '0'), 
          currency: 'GBP',
          price_per_pouch: parseFloat(stores[0]?.variants?.[0]?.prices?.['5pack']?.replace('£', '') || stores[0]?.prices?.['5pack']?.replace('£', '') || '0') / 5,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.variants?.[0]?.link || stores[0]?.url || '',
          in_stock: stores[0]?.in_stock || false,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 10, 
          price: parseFloat(stores[0]?.variants?.[0]?.prices?.['10pack']?.replace('£', '') || stores[0]?.prices?.['10pack']?.replace('£', '') || '0'), 
          currency: 'GBP',
          price_per_pouch: parseFloat(stores[0]?.variants?.[0]?.prices?.['10pack']?.replace('£', '') || stores[0]?.prices?.['10pack']?.replace('£', '') || '0') / 10,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.variants?.[0]?.link || stores[0]?.url || '',
          in_stock: stores[0]?.in_stock || false,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 20, 
          price: parseFloat(stores[0]?.variants?.[0]?.prices?.['20pack']?.replace('£', '') || stores[0]?.prices?.['20pack']?.replace('£', '') || '0'), 
          currency: 'GBP',
          price_per_pouch: parseFloat(stores[0]?.variants?.[0]?.prices?.['20pack']?.replace('£', '') || stores[0]?.prices?.['20pack']?.replace('£', '') || '0') / 20,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.variants?.[0]?.link || stores[0]?.url || '',
          in_stock: stores[0]?.in_stock || false,
          shipping_note: null,
          last_seen: new Date().toISOString()
        }
      ] : [],
      new_vendor_policy: 'We regularly add new vendors to ensure you get the best prices',
      images: {
        hero: product.image || '/placeholder-product.jpg',
        alt: product.name || 'Unknown Product'
      },
      page_url: product.page_url || `https://nicotine-pouches.org/product/${slug}`,
      site_name: 'Nicotine Pouches UK',
      publisher: {
        name: 'Nicotine Pouches UK',
        logo: '/logo.png',
        url: 'https://nicotine-pouches.org'
      },
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: product.name || 'Unknown Product', url: product.page_url || `https://nicotine-pouches.org/product/${slug}` }
      ],
      hreflang: generateSafeHreflang(generateProductHreflang(slug, false)),
      related_entities: {
        brand_hub: `/brand/${brand.toLowerCase()}`,
        flavour_hub: `/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      }
    });

    const llmSeoData = await generateLLMSEO({
      brand: brand,
      product_name: product.name || 'Unknown Product',
      flavour: flavour,
      strength_mg: parseFloat(strengthGroup) || 0,
      format: 'Pouches',
      pouch_count: 20,
      packs: stores.length > 0 ? [
        { 
          pack_size: 1, 
          price: parseFloat(stores[0]?.variants?.[0]?.prices?.['1pack']?.replace('£', '') || stores[0]?.prices?.['1pack']?.replace('£', '') || '0'), 
          currency: 'GBP',
          price_per_pouch: parseFloat(stores[0]?.variants?.[0]?.prices?.['1pack']?.replace('£', '') || stores[0]?.prices?.['1pack']?.replace('£', '') || '0'),
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.variants?.[0]?.link || stores[0]?.url || '',
          in_stock: stores[0]?.in_stock || false,
          shipping_note: null,
          last_seen: new Date().toISOString()
        }
      ] : [],
      new_vendor_policy: 'We regularly add new vendors to ensure you get the best prices',
      images: {
        hero: product.image || '/placeholder-product.jpg',
        alt: product.name || 'Unknown Product'
      },
      page_url: product.page_url || `https://nicotine-pouches.org/product/${slug}`,
      site_name: 'Nicotine Pouches UK',
      publisher: {
        name: 'Nicotine Pouches UK',
        logo: '/logo.png',
        url: 'https://nicotine-pouches.org'
      },
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: product.name || 'Unknown Product', url: product.page_url || `https://nicotine-pouches.org/product/${slug}` }
      ],
      hreflang: generateSafeHreflang(generateProductHreflang(slug, false)),
      related_entities: {
        brand_hub: `/brand/${brand.toLowerCase()}`,
        flavour_hub: `/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      }
    });
    
    console.log('LLM SEO Data generated:', {
      hasData: !!llmSeoData,
      metaTitle: llmSeoData?.meta?.title || 'N/A',
      metaDescription: llmSeoData?.meta?.description || 'N/A',
      faqCount: llmSeoData?.faq_plaintext?.length || 0,
      schemaGenerated: !!llmSeoData?.schema_json_ld
    });
    
    return {
      id: product.id || 'unknown',
      slug: slug,
      title: product.name || 'Unknown Product',
      name: product.name || 'Unknown Product',
      image: product.image_url || '/placeholder-product.jpg',
      rating: 0, // Default rating since wp_products doesn't have rating
      description: product.content || 'No description available',
      brand: brand,
      flavour: flavour,
      strength_group: strengthGroup,
      format: 'Pouches',
      page_url: product.page_url || `https://nicotine-pouches.org/product/${slug}`,
      stores: stores,
      content: product.content || '',
      excerpt: product.excerpt || '',
      regularSeoData,
      llmSeoData
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }

  // Fetch aggregate rating for the product
  const ratingData = await getProductAggregateRating(product.id);
  
  // Prepare product data for SEO template
  const productData = {
    id: product.id,
    name: product.name,
    slug: resolvedParams.slug,
    brand: product.brand,
    flavour: product.flavour,
    strength: product.strength_group,
    description: product.description,
    image: product.image,
    lowestPrice: product.stores && product.stores.length > 0 
      ? Math.min(...product.stores.filter(s => s.price).map(s => parseFloat(s.price.replace(/[£$]/g, ''))))
      : 0,
    highestPrice: product.stores && product.stores.length > 0 
      ? Math.max(...product.stores.filter(s => s.price).map(s => parseFloat(s.price.replace(/[£$]/g, ''))))
      : 0,
    storeCount: product.stores?.length || 0,
    aggregateRating: ratingData?.aggregateRating || {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": 0,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Generate SEO data using centralized template
  const seoData = getProductSEOTemplate(productData);
  
  // Use centralized SEO function
  return getSEOTags('product', seoData);
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Fetch aggregate rating for the product
  const ratingData = await getProductAggregateRating(product.id);
  
  // Prepare product data for schema
  const productData = {
    id: product.id,
    name: product.name,
    slug: resolvedParams.slug,
    brand: product.brand,
    flavour: product.flavour,
    strength: product.strength_group,
    description: product.description,
    image: product.image,
    lowestPrice: product.stores && product.stores.length > 0 
      ? Math.min(...product.stores.filter(s => s.price).map(s => parseFloat(s.price.replace(/[£$]/g, ''))))
      : 0,
    highestPrice: product.stores && product.stores.length > 0 
      ? Math.max(...product.stores.filter(s => s.price).map(s => parseFloat(s.price.replace(/[£$]/g, ''))))
      : 0,
    storeCount: product.stores?.length || 0,
    aggregateRating: ratingData?.aggregateRating || {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": 0,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Generate breadcrumb data
  const breadcrumbs = generateBreadcrumbData('product', productData);

  return (
    <>
      {/* Standalone AggregateRating Schema */}
      {ratingData && generateStandaloneAggregateRating('Product', product.name, ratingData.aggregateRating)}
      
      {/* Product Schema */}
      {renderSchemaTag('product', { product: productData, aggregateRating: productData.aggregateRating })}
      
      {/* Breadcrumb Schema */}
      {generateBreadcrumbSchema(breadcrumbs)}
      
      {/* Legacy SEO Data (keep for compatibility) */}
      {product.regularSeoData?.schema_json_ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(product.regularSeoData.schema_json_ld)
          }}
        />
      )}
      
      {product.llmSeoData?.schema_json_ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(product.llmSeoData.schema_json_ld)
          }}
        />
      )}
      
      {/* Freshness Signals */}
      {product.llmSeoData?.freshness_signals && (
        <div style={{ display: 'none' }} data-llm-seo="freshness">
          {JSON.stringify(product.llmSeoData.freshness_signals)}
        </div>
      )}
      
      {/* Hreflang Meta Tags */}
      {generateSafeHreflang(generateProductHreflang(resolvedParams.slug, false)).map((entry) => (
        <link key={entry.lang} rel="alternate" hrefLang={entry.lang} href={entry.url} />
      ))}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .product-hero-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 20px !important;
              padding: 0 15px !important;
              align-items: start !important;
            }
            .product-image-container {
              min-height: 250px !important;
              padding: 15px !important;
            }
            .product-title {
              font-size: 1.8rem !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              hyphens: auto !important;
              margin-bottom: 10px !important;
            }
            .product-hero p {
              font-size: 14px !important;
              line-height: 1.4 !important;
            }
            .product-hero {
              padding: 30px 0 !important;
            }
            .main-content-layout {
              flex-direction: column !important;
              gap: 20px !important;
              margin: 40px auto 20px auto !important;
              padding: 0 15px !important;
            }
            .vendor-comparison {
              order: 1 !important;
              flex: none !important;
              min-width: 100% !important;
              width: 100% !important;
            }
            .product-info-sidebar {
              order: 2 !important;
              flex: none !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            .product-info-sidebar > div {
              position: static !important;
              top: auto !important;
              max-width: 100% !important;
            }
            .comparison-table-filters {
              flex-direction: column !important;
              gap: 10px !important;
              align-items: stretch !important;
            }
            .comparison-table-filters > div {
              width: 100% !important;
            }
            .vendor-card {
              margin-bottom: 15px !important;
            }
            .vendor-info {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .vendor-details {
              margin-top: 10px !important;
              width: 100% !important;
            }
            .comparison-table-top {
              padding: 0.75rem 1rem 0.5rem 2rem !important;
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 8px !important;
            }
            .comparison-table-top > div:last-child {
              margin-left: 52px !important;
            }
            .comparison-chevron {
              left: 8px !important;
            }
            .comparison-chevron svg {
              width: 14px !important;
              height: 10px !important;
            }
            .comparison-vertical-border {
              left: 30px !important;
              width: 2px !important;
            }
            .vendor-card > div:last-child {
              flex-direction: row !important;
              align-items: stretch !important;
              gap: 12px !important;
              padding: 1rem !important;
            }
            .vendor-card > div:last-child > div:first-child {
              order: 1 !important;
            }
            .vendor-card > div:last-child > div:last-child {
              order: 2 !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .vendor-card .product-title-link {
              font-size: 0.85rem !important;
              line-height: 1.4 !important;
              word-wrap: break-word !important;
            }
            .variant-button {
              font-size: 0.65rem !important;
              padding: 2px 4px !important;
            }
          }
          @media (max-width: 480px) {
            .product-hero-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 15px !important;
              padding: 0 10px !important;
            }
            .product-image-container {
              min-height: 200px !important;
              padding: 10px !important;
            }
            .product-title {
              font-size: 1.4rem !important;
              margin-bottom: 8px !important;
            }
            .product-hero p {
              font-size: 12px !important;
              line-height: 1.3 !important;
            }
            .product-hero {
              padding: 20px 0 !important;
            }
            .vendor-card {
              padding: 0 !important;
              margin-bottom: 10px !important;
            }
            .comparison-table-top {
              padding: 0.5rem 0.75rem 0.5rem 1.5rem !important;
            }
            .vendor-card > div:last-child {
              flex-direction: row !important;
              padding: 0.75rem !important;
              gap: 8px !important;
            }
            .vendor-card > div:last-child > div:first-child {
              order: 1 !important;
            }
            .vendor-card > div:last-child > div:last-child {
              order: 2 !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .vendor-card .product-title-link {
              font-size: 0.8rem !important;
            }
            .variant-button {
              font-size: 0.6rem !important;
              padding: 1px 3px !important;
            }
            .comparison-table-filters {
              padding: 10px !important;
            }
            .main-content-layout {
              padding: 0 10px !important;
            }
          }
        `
      }} />
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          {/* Header */}
          <Header />

        {/* Main Content */}
        <main id="main" className="clearfix" style={{
          backgroundColor: '#f3f3f5',
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{
            backgroundColor: '#ffffff',
            padding: '0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
                padding: '15px 20px',
              fontSize: '14px',
                color: '#666'
              }}>
                <a href="/" style={{ color: '#007cba', textDecoration: 'none' }}>Home</a>
                <span style={{ margin: '0 8px' }}>›</span>
                <a href="/products" style={{ color: '#007cba', textDecoration: 'none' }}>Products</a>
                <span style={{ margin: '0 8px' }}>›</span>
                <span style={{ color: '#333' }}>{product.name}</span>
            </div>
          </div>

          {/* Product Hero Section */}
          <div className="product-hero" style={{
            backgroundColor: '#ffffff',
            padding: '60px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="product-hero-grid" style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              display: 'grid',
              gridTemplateColumns: '400px 1fr',
              gap: '60px',
              alignItems: 'center'
            }}>
              
              {/* Product Image */}
              <div className="product-image-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '20px',
                padding: '40px',
                minHeight: '400px'
              }}>
                <Image
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                  width={300}
                  height={300}
                  style={getImageStyles(product.image || '/placeholder-product.jpg')}
                />
              </div>

              {/* Product Info */}
              <div>
                <h1 className="product-title" style={{
                  fontSize: '3rem',
                  fontWeight: '1000',
                  color: '#0B051D',
                  margin: '0 0 15px 0',
                  lineHeight: '1.1',
                  fontFamily: 'Klarna Text, sans-serif',
                  letterSpacing: '-0.05em'
                    }}>
                      {product.name}
                </h1>

                <div className="product-rating" style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    <ReviewBalls rating={product.rating || 4.5} size={24} />
                  </div>
                  <span style={{
                    color: '#666',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    {(product.rating || 4.5).toFixed(1)}
                  </span>
                </div>

                {/* Short Description */}
                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  {(product.excerpt || product.description || '').replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim()}
                </p>

                <button style={{
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '25px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Klarna Text, sans-serif'
                }}>
                  Compare prices
                </button>
              </div>
            </div>
          </div>

                  
            {/* Main Content Layout - Two Columns */}
            <div className="main-content-layout" style={{
              maxWidth: '100%',
              margin: '60px auto 40px auto',
              padding: '0 20px',
              display: 'flex',
              gap: '2rem'
            }}>
              
              {/* Left Column - Vendor Price Comparison */}
              <div className="vendor-comparison" style={{ flex: '1', minWidth: '0' }}>
                {/* Filter Options */}
                <div className="comparison-table-filters" style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                {/* Filter Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  border: '1px solid #e9ecef'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                  </svg>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    Filters
                  </span>
                </div>
                
                {/* Sort Filter */}
                <select id="price-sort" style={{
                  padding: '6px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  backgroundColor: '#fff',
                  color: '#495057',
                  cursor: 'pointer',
                  fontWeight: '500',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}>
                  <option value="low-high">Lowest Price</option>
                  <option value="high-low">Highest Price</option>
                </select>
                
                {/* Pack Size Filter */}
                <select id="pack-size" style={{
                  padding: '6px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  backgroundColor: '#fff',
                  color: '#495057',
                  cursor: 'pointer',
                  fontWeight: '500',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}>
                  <option value="1pack">1 Pack</option>
                  <option value="3pack">3 Pack</option>
                  <option value="5pack">5 Pack</option>
                  <option value="10pack">10 Pack</option>
                  <option value="20pack">20 Pack</option>
                  <option value="25pack">25 Pack</option>
                  <option value="30pack">30 Pack</option>
                  <option value="50pack">50 Pack</option>
                </select>
                
                {/* Shipping Filter */}
                <select id="shipping-sort" style={{
                  padding: '6px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  backgroundColor: '#fff',
                  color: '#495057',
                  cursor: 'pointer',
                  fontWeight: '500',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}>
                  <option value="fastest">Fastest Shipping</option>
                  <option value="slowest">Slowest Shipping</option>
                </select>
                
                {/* Review Filter */}
                <select id="review-sort" style={{
                  padding: '6px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  backgroundColor: '#fff',
                  color: '#495057',
                  cursor: 'pointer',
                  fontWeight: '500',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='https://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 8px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '32px'
                }}>
                  <option value="highest">Highest Reviews</option>
                  <option value="lowest">Lowest Reviews</option>
                </select>
                  </div>
                  
              {/* Modern Vendor Comparison */}
              <div className="vendor-cards-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
              {product.stores.map((store: any, storeIndex: number) => {
                const selectedVariant = 0; // Default to first variant for SSR
                const currentVariant = store.variants?.[selectedVariant] || store;
                const selectedPackSize = '1pack'; // Default pack size for SSR
                
                return (
                  <div key={storeIndex} 
                       className="vendor-card"
                       data-store-index={storeIndex}
                       data-vendor-id={store.vendorId || storeIndex}
                       data-vendor-name={store.name}
                       data-price={currentVariant?.prices?.['1pack']?.replace('£', '') || '0'}
                       data-store-name={store.name}
                       style={{
                         backgroundColor: '#fff',
                         borderRadius: '20px',
                         border: '1px solid #fff',
                         padding: '0',
                         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
                         opacity: 1,
                         transform: 'translateY(0)',
                         transition: 'all 0.4s ease-out'
                       }}>
                   
                   {/* Top Section - Logo, Vendor Name, and Variants */}
                   <div className="comparison-table-top" style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     padding: '1rem 1.5rem 0.75rem 3.87rem',
                     borderBottom: '3px solid #f3f3f5',
                     position: 'relative'
                   }}>
                     {/* Chevron down icon before vertical border line */}
                     <div className="comparison-chevron" style={{
                       position: 'absolute',
                       left: '12px',
                       top: '50%',
                       transform: 'translateY(-50%)',
                       cursor: 'pointer'
                     }}>
                       <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                         <path d="M2 2L8 8L14 2" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                        </div>
                     {/* Vertical border line 100px from left */}
                     <div className="comparison-vertical-border" style={{
                       position: 'absolute',
                       left: '40px',
                       top: '0',
                       width: '2px',
                       height: '100%',
                       backgroundColor: '#f3f3f5'
                     }}></div>
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       gap: '12px'
                     }}>
                      <a href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`} rel="nofollow">
                        <VendorLogo 
                          logo={store.logo} 
                          name={store.name} 
                          size={38}
                        />
                      </a>
                      <a 
                        href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`}
                        rel="nofollow"
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          textDecoration: 'none'
                        }}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {store.name}
                      </a>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginLeft: '8px'
                      }}>
                        <ReviewBalls rating={store.rating || 4.5} size={16} />
                        <span className="review-rating" style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          {store.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                </div>
                     
                      </div>

                   {/* Bottom Section - Product Details and Price */}
                   <div style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     padding: '0.75rem 1.5rem 1rem 1.5rem'
                   }}>
                     <div style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: '4px',
                       flex: '1'
                     }}>
                         <a href={store.variants?.[0]?.link || store.url || '#'}
                            className="product-title-link"
                            style={{
                          fontSize: '0.9rem',
                              color: '#0073aa',
                              textDecoration: 'none',
                              fontWeight: '500'
                            }}>
                           {store.variants?.[0]?.product || store.name || 'N/A'}
                           <span className="pack-size-display" style={{ color: '#6b7280', fontSize: '0.85rem' }}> (1 Pack)</span>
                         </a>
                       
                         {/* Variant Selection */}
                         {store.variants && store.variants.length > 1 && (
                           <div style={{
                             display: 'flex',
                             gap: '4px',
                             flexWrap: 'wrap',
                             marginTop: '4px'
                           }}>
                             {store.variants.map((variant: any, variantIndex: number) => (
                               <button
                                 key={variantIndex}
                                 className="variant-button"
                                 data-store-index={storeIndex}
                                 data-variant-index={variantIndex}
                                 style={{
                                   padding: '2px 6px',
                                   borderRadius: '8px',
                                   border: variantIndex === 0 ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                                   backgroundColor: variantIndex === 0 ? '#eff6ff' : '#fff',
                                   color: variantIndex === 0 ? '#1d4ed8' : '#6b7280',
                                   fontSize: '0.7rem',
                                   fontWeight: '500',
                                   cursor: 'pointer',
                                   transition: 'all 0.2s ease',
                                   whiteSpace: 'nowrap'
                                 }}
                               >
                                 {variant.strength}
                               </button>
                             ))}
                           </div>
                         )}
                       </div>

                     <div style={{
                         display: 'flex',
                         alignItems: 'center',
                       gap: '12px'
                     }}>
                       <div style={{
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'flex-end',
                         gap: '2px'
                       }}>
                           <span className="price-display" style={{
                             fontSize: '1.25rem',
                             fontWeight: 'bold',
                             color: '#1f2937'
                           }}>
                             {store.variants?.[0]?.prices?.['1pack'] || store.prices?.['1pack'] || 'N/A'}
                           </span>
                         <div style={{
                           fontSize: '0.75rem',
                           color: '#6b7280'
                         }}>
                           <span>Lowest price</span>
                         </div>
                       </div>
                       
                         <a href={store.variants?.[0]?.link || store.url || '#'}
                            target="_blank"
                            rel="nofollow"
                            className="buy-now-button"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: 'none',
                              padding: '8px',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              borderRadius: '4px'
                            }}>
                         <span style={{
                             fontSize: '1.1rem',
                           color: '#6b7280',
                           fontWeight: 'bold'
                         }}>
                           &gt;
                         </span>
                       </a>
                       </div>
                     </div>
                    </div>
                );
              })}
              </div>
                  </div>
                  
              {/* Right Column - Product Info Sidebar */}
              <div className="product-info-sidebar" style={{ flex: '0 0 280px', maxWidth: '280px' }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
                  position: 'sticky',
                  top: '2rem',
                  maxWidth: '280px'
                }}>
                  <ProductDetailsCard product={product} />
                </div>
              </div>
            </div>
                  
      {/* Pack Filter Component */}
      <PackFilter stores={product.stores} />

      {/* Client-side pack size handling script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Store data globally for JavaScript access
            window.storesData = ${JSON.stringify(product.stores)};
            window.currentProductId = '${product.id}';
            
            // Function to update pack size displays
            window.updatePackSizeDisplay = function(selectedPack) {
              const packNumber = selectedPack.replace('pack', '');
              const packSizeDisplays = document.querySelectorAll('.pack-size-display');
              packSizeDisplays.forEach(display => {
                display.textContent = \` (\${packNumber} Pack)\`;
              });
            };
            
            // Function to handle variant selection
            window.handleVariantChange = function(storeIndex, variantIndex) {
              console.log('handleVariantChange called:', { storeIndex, variantIndex });
              
              // Update the selected variant for this store
              if (!window.selectedVariants) {
                window.selectedVariants = {};
              }
              window.selectedVariants[storeIndex] = variantIndex;
              
              // Update the product title and price for this specific store
              const store = window.storesData[storeIndex];
              console.log('Store data:', store);
              
              if (store && store.variants && store.variants[variantIndex]) {
                const variant = store.variants[variantIndex];
                console.log('Selected variant:', variant);
                
                // Update product title
                const productTitle = document.querySelector(\`[data-store-index="\${storeIndex}"] .product-title-link\`);
                console.log('Product title element:', productTitle);
                if (productTitle) {
                  const selectedPack = document.getElementById('pack-size')?.value || '1pack';
                  const packNumber = selectedPack.replace('pack', '');
                  productTitle.textContent = variant.product + \` (\${packNumber} Pack)\`;
                  console.log('Updated product title to:', productTitle.textContent);
                }
                
                // Update price
                const priceDisplay = document.querySelector(\`[data-store-index="\${storeIndex}"] .price-display\`);
                console.log('Price display element:', priceDisplay);
                if (priceDisplay) {
                  const selectedPack = document.getElementById('pack-size')?.value || '1pack';
                  const price = variant.prices[selectedPack] || variant.price || 'N/A';
                  priceDisplay.textContent = price;
                  console.log('Updated price to:', price);
                }
                
                // Update variant button states
                const variantButtons = document.querySelectorAll(\`[data-store-index="\${storeIndex}"] .variant-button\`);
                console.log('Found variant buttons for store', storeIndex, ':', variantButtons.length);
                variantButtons.forEach((btn, index) => {
                  if (index === variantIndex) {
                    btn.style.border = '1px solid #3b82f6';
                    btn.style.backgroundColor = '#eff6ff';
                    btn.style.color = '#1d4ed8';
                    console.log('Selected variant button', index);
                  } else {
                    btn.style.border = '1px solid #e5e7eb';
                    btn.style.backgroundColor = '#fff';
                    btn.style.color = '#6b7280';
                  }
                });
              } else {
                console.error('Store or variant not found:', { store, variantIndex });
              }
            };
            
            // Function to update prices
            window.updatePrices = function(selectedPack) {
              if (!window.storesData) return;
              
              const priceDisplays = document.querySelectorAll('.price-display');
              priceDisplays.forEach((priceDisplay, index) => {
                const store = window.storesData[index];
                if (store && store.variants) {
                  // Get selected variant for this store
                  const selectedVariantIndex = window.selectedVariants?.[index] || 0;
                  const selectedVariant = store.variants[selectedVariantIndex];
                  
                  if (selectedVariant) {
                    const price = selectedVariant.prices[selectedPack] || selectedVariant.price || 'N/A';
                    priceDisplay.textContent = price;
                  } else if (store.prices) {
                    const price = store.prices[selectedPack] || 'N/A';
                    priceDisplay.textContent = price;
                  }
                }
              });
            };
            
            // Function to filter and sort vendor cards based on pack size availability and price
            window.filterVendorCards = function(selectedPack) {
              if (!window.storesData) return;
              
              const vendorCards = document.querySelectorAll('.vendor-card');
              const vendorContainer = document.querySelector('.vendor-cards-container') || vendorCards[0]?.parentNode;
              
              // Create array of visible stores with their prices for sorting
              const visibleStores = [];
              
              vendorCards.forEach((card, index) => {
                const store = window.storesData[index];
                if (!store) {
                  card.style.display = 'none';
                  return;
                }
                
                // Check if store has the selected pack size
                const hasPackSize = (store.variants && store.variants[0] && store.variants[0].prices[selectedPack]) ||
                                  (store.prices && store.prices[selectedPack] && store.prices[selectedPack] !== 'N/A');
                
                if (hasPackSize) {
                  // Get price for sorting
                  const priceText = store.variants?.[0]?.prices?.[selectedPack] || store.prices?.[selectedPack] || 'N/A';
                  const priceValue = parseFloat(priceText.replace(/[£,]/g, '')) || 999999; // High number for 'N/A' prices
                  
                  visibleStores.push({
                    card: card,
                    store: store,
                    price: priceValue,
                    priceText: priceText,
                    index: index
                  });
                } else {
                  card.style.display = 'none';
                }
              });
              
              // Sort by price (lowest to highest)
              visibleStores.sort((a, b) => a.price - b.price);
              
              // Reorder cards in DOM and show them
              if (vendorContainer && visibleStores.length > 0) {
                visibleStores.forEach((item, sortedIndex) => {
                  // Move card to correct position
                  if (sortedIndex === 0) {
                    vendorContainer.insertBefore(item.card, vendorContainer.firstChild);
                  } else {
                    const previousCard = visibleStores[sortedIndex - 1].card;
                    vendorContainer.insertBefore(item.card, previousCard.nextSibling);
                  }
                  
                  // Show card with animation
                  item.card.style.display = 'block';
                  item.card.style.opacity = '1';
                  item.card.style.transform = 'translateY(0)';
                  
                  // Add slight delay for staggered animation
                  setTimeout(() => {
                    item.card.style.transition = 'all 0.3s ease';
                  }, sortedIndex * 50);
                });
              }
              
              // Show/hide no results message
              let noResultsMsg = document.getElementById('no-results-message');
              if (visibleStores.length === 0) {
                if (!noResultsMsg) {
                  noResultsMsg = document.createElement('div');
                  noResultsMsg.id = 'no-results-message';
                  noResultsMsg.style.cssText = \`
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                    font-size: 16px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    margin: 20px 0;
                  \`;
                  noResultsMsg.innerHTML = \`No vendors found for \${selectedPack.replace('pack', '')} pack size. Try selecting a different pack size.\`;
                  
                  // Insert after the filter section
                  const filterSection = document.querySelector('.comparison-table-filters');
                  if (filterSection) {
                    filterSection.parentNode.insertBefore(noResultsMsg, filterSection.nextSibling);
                  }
                }
                noResultsMsg.style.display = 'block';
              } else {
                if (noResultsMsg) {
                  noResultsMsg.style.display = 'none';
                }
              }
            };
            
            // Set up pack size change handler and variant button handlers
            document.addEventListener('DOMContentLoaded', function() {
              const packSizeSelect = document.getElementById('pack-size');
              
              if (packSizeSelect) {
                // Override the PackFilter's event listener with our enhanced version
                packSizeSelect.addEventListener('change', function() {
                  const selectedPack = this.value;
                  window.updatePackSizeDisplay(selectedPack);
                  window.updatePrices(selectedPack);
                  window.filterVendorCards(selectedPack);
                });
              }
              
              // Set up variant button click handlers with event delegation
              function setupVariantButtons() {
                const variantButtons = document.querySelectorAll('.variant-button');
                console.log('Found variant buttons:', variantButtons.length);
                
                variantButtons.forEach(button => {
                  // Remove any existing listeners to avoid duplicates
                  button.removeEventListener('click', handleVariantClick);
                  button.addEventListener('click', handleVariantClick);
                });
              }
              
              function handleVariantClick(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const storeIndex = parseInt(this.getAttribute('data-store-index'));
                const variantIndex = parseInt(this.getAttribute('data-variant-index'));
                
                console.log('Variant clicked:', { storeIndex, variantIndex });
                window.handleVariantChange(storeIndex, variantIndex);
              }
              
              // Set up initial variant buttons
              setupVariantButtons();
              
              // Also set up event delegation on the document for dynamically added buttons
              document.addEventListener('click', function(event) {
                if (event.target.classList.contains('variant-button')) {
                  event.preventDefault();
                  event.stopPropagation();
                  
                  const storeIndex = parseInt(event.target.getAttribute('data-store-index'));
                  const variantIndex = parseInt(event.target.getAttribute('data-variant-index'));
                  
                  console.log('Variant clicked via delegation:', { storeIndex, variantIndex });
                  window.handleVariantChange(storeIndex, variantIndex);
                }
              });
              
              // Re-setup buttons after a short delay to catch any late-rendered elements
              setTimeout(setupVariantButtons, 500);
              setTimeout(setupVariantButtons, 1000);
            });
          `
        }}
      />

            {/* Product Details Card - Moved to right sidebar in two-column layout */}
                      
            {/* Reviews Section */}
                      <div style={{
              backgroundColor: '#ffffff',
              padding: '40px 0',
              marginBottom: '40px'
            }}>
                        <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                      <div style={{
                  textAlign: 'center',
                  marginBottom: '40px'
                }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    marginBottom: '10px'
                  }}>
                    Customer Reviews
                  </h2>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '30px'
                  }}>
                    See what customers are saying about {product.name}
                  </p>
                  <ReviewBalls rating={product.rating} />
                      </div>
                      
                <ReviewsDisplay productId={product.id} />

                    <div style={{
                  textAlign: 'center',
                  marginTop: '40px'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                        fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    Write a Review
                  </h3>
                <ReviewForm 
                  productId={product.id}
                  productName={product.name}
                    vendors={product.stores}
                />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ marginBottom: '40px' }}>
            <FAQSection faqs={product.regularSeoData?.faq_plaintext || product.llmSeoData?.faq_plaintext || []} />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      {/* Vendor Analytics Component */}
      <VendorAnalytics 
        productId={product.id.toString()} 
        productName={product.name} 
        region="UK" 
      />
      
        {/* Cookie Consent */}
        <CookieConsent />
    </div>
    </>
  );
}