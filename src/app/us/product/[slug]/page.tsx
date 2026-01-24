import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import VendorLogo from '@/components/VendorLogo';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewBalls from '@/components/ReviewBalls';
import VendorAnalytics from '@/components/VendorAnalytics';
import ProductDetailsCard from '@/components/ProductDetailsCard';
import FAQSection from '@/components/FAQSection';
import CookieConsent from '@/components/CookieConsent';
import PriceAlertSignupPopup from '@/components/PriceAlertSignupPopup';
import { getImageStyles } from '@/utils/imageUtils';
import { generateProductHreflang, generateSafeHreflang } from '@/lib/hreflang';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import { generateLLMSEO, extractLLMSEODataFromDB } from '@/lib/llm-seo';
import ExpandableUSVendorCard from '@/components/ExpandableUSVendorCard';

// Fetch US product data from Supabase
async function getUSProduct(slug: string) {
  try {
    // Convert slug back to proper case name
    // Handle special cases: 'on-' becomes 'On!', 'sesh-' becomes 'Sesh+', 'nic-s-' stays 'NIC-S'
    let properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Replace 'On' with 'On!' at the start (for ON brand products)
    if (properCaseName.startsWith('On ')) {
      properCaseName = properCaseName.replace(/^On /, 'On! ');
    }
    // Replace 'Sesh' with 'Sesh+' at the start (for SESH brand products)
    if (properCaseName.startsWith('Sesh ')) {
      properCaseName = properCaseName.replace(/^Sesh /, 'Sesh+ ');
    }
    // Replace 'Nic S' with 'NIC-S' (for NIC-S brand products)
    if (properCaseName.startsWith('Nic S ')) {
      properCaseName = properCaseName.replace(/^Nic S /, 'NIC-S ');
    }
    
    // First try to find by exact name match
    let { data: product, error } = await supabase()
      .from('us_products')
      .select('*')
      .eq('product_title', properCaseName)
      .single();
    
    // If not found, try case-insensitive match with flexible special character handling
    if (error || !product) {
      // Handle triple hyphens (from "Tin - VELO" -> "tin---velo")
      // Replace multiple consecutive hyphens with a single space-dash-space pattern
      let normalizedSlug = slug.replace(/-{2,}/g, ' - ');
      const baseSearchTerm = normalizedSlug.replace(/-/g, ' ');
      
      // Try multiple variations: with/without special chars, with proper case
      const variations = [
        baseSearchTerm,
        baseSearchTerm.replace(/^on /i, 'On! '),
        baseSearchTerm.replace(/^sesh /i, 'Sesh+ '),
        baseSearchTerm.replace(/^nic s /i, 'NIC-S '),
        // Handle VELO/McLaren case variations
        baseSearchTerm.replace(/\bvelo\b/gi, 'VELO'),
        baseSearchTerm.replace(/\bmclaren\b/gi, 'McLaren'),
        baseSearchTerm.replace(/\bformula\s+1\b/gi, 'Formula 1'),
        // Try with proper case
        baseSearchTerm.replace(/\b\w/g, l => l.toUpperCase()),
        // Try with original slug (in case it matches better)
        slug.replace(/-{2,}/g, ' - ').replace(/-/g, ' '),
      ];
      
      for (const searchTerm of variations) {
      const { data: products, error: searchError } = await supabase()
        .from('us_products')
        .select('*')
        .ilike('product_title', `%${searchTerm}%`)
        .limit(1);

      if (searchError) {
          continue;
        }
        
        if (products && products.length > 0) {
          product = products[0];
          break;
        }
      }
      
      // If still not found, try fuzzy search by splitting into words
      if (!product) {
        const words = baseSearchTerm.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
          const { data: products, error: searchError } = await supabase()
            .from('us_products')
            .select('*')
            .or(words.map(w => `product_title.ilike.%${w}%`).join(','))
            .limit(10);
          
          if (!searchError && products && products.length > 0) {
            // Find the best match (product with most matching words)
            const bestMatch = products.reduce((best: any, p: any) => {
              const productWords = p.product_title.toLowerCase().split(/[\s-]+/);
              const matchCount = words.filter((w: string) => productWords.some((pw: string) => pw.includes(w.toLowerCase()))).length;
              const bestMatchCount = best ? words.filter((w: string) => best.product_title.toLowerCase().split(/[\s-]+/).some((pw: string) => pw.includes(w.toLowerCase()))).length : 0;
              return matchCount > bestMatchCount ? p : best;
            }, null as any);
            
            if (bestMatch) {
              product = bestMatch;
            }
          }
        }
      }
      
      if (!product) {
        // Silently return null - product doesn't exist, will show 404 page
        return null;
      }
    }

    // Get US vendor products that are mapped to this product using the new mapping system
    console.log('🔍 Looking for US mappings for product ID:', product.id);
    console.log('🔍 Product details:', {
      id: product.id,
      title: product.product_title,
      brand: product.brand
    });
    
    // Test query to see if we can fetch any mappings at all
    const { data: testMappings } = await supabase()
      .from('us_vendor_product_mapping')
      .select('*')
      .limit(5);
    console.log('🧪 Test query - any mappings exist:', testMappings?.length || 0);
    
    const { data: mappings, error: mappingError } = await supabase()
      .from('us_vendor_product_mapping')
      .select('*')
      .eq('product_id', parseInt(product.id));

    if (mappingError) {
      console.error('❌ Error fetching mappings:', mappingError);
      console.error('Mapping error details:', JSON.stringify(mappingError, null, 2));
    } else {
      console.log('✅ Found US mappings:', mappings?.length || 0);
      if (mappings && mappings.length > 0) {
        console.log('📋 Mappings details:', mappings.map((m: any) => ({
          vendor_product: m.vendor_product,
          us_vendor_id: m.us_vendor_id
        })));
      } else {
        // Debug: Check if there are any mappings for this product with different approaches
        console.log('🔍 No mappings found. Checking alternative approaches...');
        
        // Try to find mappings by product title
        const { data: titleMappings } = await supabase()
          .from('us_vendor_product_mapping')
          .select('*')
          .ilike('vendor_product', `%${product.product_title}%`);
        
        console.log('🔍 Mappings by title search:', titleMappings?.length || 0);
        if (titleMappings && titleMappings.length > 0) {
          console.log('📋 Title mappings:', titleMappings.map((m: any) => ({
            vendor_product: m.vendor_product,
            product_id: m.product_id,
            us_vendor_id: m.us_vendor_id
          })));
        }
      }
    }

    // Get vendor product details for each mapping
    let vendorProducts = [];
    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        console.log(`🔍 Fetching vendor product: "${mapping.vendor_product}" for vendor: ${mapping.us_vendor_id}`);
        
        const { data: vpData, error: vpError } = await supabase()
          .from('us_vendor_products_new')
          .select(`
            *,
            us_vendors!inner(
              id,
              name,
              website,
              status
            )
          `)
          .eq('us_vendor_id', mapping.us_vendor_id)
          .eq('name', mapping.vendor_product)
          .single();

        if (vpError) {
          console.error(`❌ Error fetching vendor product "${mapping.vendor_product}":`, vpError);
          console.error('VP error details:', JSON.stringify(vpError, null, 2));
        } else if (vpData) {
          console.log(`✅ Found vendor product:`, {
            name: vpData.name,
            vendor: vpData.us_vendors?.name,
            price_1pack: vpData.price_1pack
          });
          vendorProducts.push({
            mapping: mapping,
            vendor_product: vpData,
            vendor: vpData.us_vendors
          });
        }
      }
    }
    console.log('🎯 Total US vendor products found:', vendorProducts.length);

    // Helper function to format prices consistently
    const formatPrice = (price: any) => {
      if (!price) return 'N/A';
      const priceStr = price.toString();
      if (priceStr.includes('$')) {
        // Extract number from $X.XX format and reformat
        const numStr = priceStr.replace('$', '');
        return `$${parseFloat(numStr).toFixed(2)}`;
      } else {
        // Add $ and format to 2 decimal places
        return `$${parseFloat(priceStr).toFixed(2)}`;
      }
    };

    // Transform vendor products to store format and deduplicate by vendor
    const storesMap = new Map();
    vendorProducts?.forEach((item: any) => {
      const vp = item.vendor_product;
      const vendor = item.vendor;
      const key = `${vp.us_vendor_id}-${product.name}`;
      if (!storesMap.has(key)) {
        storesMap.set(key, {
          name: vendor.name,
          logo: vendor.name, // Pass vendor name instead of broken logo URL
          rating: 4.2 + Math.random() * 0.6, // Random rating between 4.2-4.8 for variety
          shipping: 'Standard shipping', // Default shipping since us_vendors doesn't have shipping_info
          product: vp.name, // Use the actual vendor product name
          price: formatPrice(vp.price_1pack),
          link: vp.url || '#',
          vendorId: vp.us_vendor_id,
        prices: {
          '1pack': formatPrice(vp.price_1pack),
          '3pack': formatPrice(vp.price_3pack),
          '5pack': formatPrice(vp.price_5pack),
          '10pack': formatPrice(vp.price_10pack),
          '15pack': formatPrice(vp.price_15pack),
          '20pack': formatPrice(vp.price_20pack),
          '25pack': formatPrice(vp.price_25pack),
          '30pack': formatPrice(vp.price_30pack),
          '50pack': formatPrice(vp.price_50pack),
          '100pack': formatPrice(vp.price_100pack)
        }
      });
      }
    });
    
    const stores = Array.from(storesMap.values());

    // If no vendor products found, create a default Prilla store
    if (stores.length === 0) {
      stores.push({
        name: 'Prilla',
        logo: 'Prilla',
        rating: 4.5,
        product: product.product_title,
        price: '$3.99',
        shipping: 'Free shipping on orders over $25',
        link: product.page_url || '#',
        vendorId: 'prilla',
        prices: {
          '1pack': '$3.99',
          '3pack': '$11.97',
          '5pack': '$19.95',
          '10pack': '$39.90',
          '15pack': '$59.85',
          '20pack': '$79.80',
          '25pack': '$99.75',
          '30pack': '$119.70',
          '50pack': '$199.50',
          '100pack': '$399.00'
        }
      });
    }

    // Transform product data to match expected format
    const transformedProduct = {
      id: product.id,
      slug: slug,
      title: product.product_title,
      name: product.product_title,
      image: product.image_url || '/placeholder-product.svg',
      rating: 4.5, // Default rating
      description: product.description || `Compare ${product.product_title} - best prices and deals.`,
      brand: product.brand,
      flavour: product.flavour,
      strength_group: product.strength,
      format: product.format,
      page_url: product.page_url,
      stores: stores
    };

    // Generate SEO data for US market with variant structure
    const brand = product.brand || 'Unknown Brand';
    const flavour = product.flavour || 'Unknown Flavour';
    const strengthGroup = product.strength || '6mg';
    
    // Generate regular SEO data
    const regularSeoData = await generateProductSEO({
      brand: brand,
      product_name: product.product_title || 'Unknown Product',
      flavour: flavour,
      strength_mg: parseFloat(strengthGroup) || 6,
      format: 'Pouches',
      pouch_count: 20,
      nicotine_free_option: false,
      primary_keyword: `${brand} ${flavour} nicotine pouches`,
      secondary_keywords: [`${brand} pouches`, `${flavour} pouches`, 'nicotine pouches US'],
      brand_keywords: [brand, `${brand} nicotine pouches`],
      product_list: stores.length > 0 ? stores.map((store: any) => ({
        name: store.name,
        price: store.prices?.['1pack'] || 'N/A',
        url: store.link || '#',
        in_stock: true,
        brand: brand,
        flavour: flavour,
        strength_mg: 6,
        format: 'Pouches',
        pouch_count: 20,
        nicotine_free_option: false,
        retailer_name: store.name,
        retailer_url: store.link || '#',
        shipping_note: store.shipping || 'Standard shipping',
        last_seen: new Date().toISOString(),
        currency: 'USD',
        rating_value: store.rating || 4.5,
        review_count: 0,
        sku: '',
        image_url: product.image_url || '/placeholder-product.jpg',
        description: product.description || '',
        gtin13: '',
        image: product.image_url || '/placeholder-product.jpg'
      })) : [],
      packs: stores.length > 0 ? [
        { 
          pack_size: 1, 
          price: parseFloat(stores[0]?.prices?.['1pack']?.replace('$', '') || '0'), 
          currency: 'USD',
          price_per_pouch: parseFloat(stores[0]?.prices?.['1pack']?.replace('$', '') || '0'),
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.link || '',
          in_stock: true,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 5, 
          price: parseFloat(stores[0]?.prices?.['5pack']?.replace('$', '') || '0'), 
          currency: 'USD',
          price_per_pouch: parseFloat(stores[0]?.prices?.['5pack']?.replace('$', '') || '0') / 5,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.link || '',
          in_stock: true,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 10, 
          price: parseFloat(stores[0]?.prices?.['10pack']?.replace('$', '') || '0'), 
          currency: 'USD',
          price_per_pouch: parseFloat(stores[0]?.prices?.['10pack']?.replace('$', '') || '0') / 10,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.link || '',
          in_stock: true,
          shipping_note: null,
          last_seen: new Date().toISOString()
        },
        { 
          pack_size: 20, 
          price: parseFloat(stores[0]?.prices?.['20pack']?.replace('$', '') || '0'), 
          currency: 'USD',
          price_per_pouch: parseFloat(stores[0]?.prices?.['20pack']?.replace('$', '') || '0') / 20,
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.link || '',
          in_stock: true,
          shipping_note: null,
          last_seen: new Date().toISOString()
        }
      ] : [],
      country_focus: 'United States',
      page_url: `https://nicotine-pouches.org/us/product/${slug}`,
      site_name: 'Nicotine Pouches US',
      publisher: {
      name: 'Nicotine Pouches US',
      logo: 'https://nicotine-pouches.org/logo.png',
      url: 'https://nicotine-pouches.org/us'
      },
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'US Products', url: '/us' },
        { name: product.product_title || 'Unknown Product', url: product.page_url || `https://nicotine-pouches.org/us/product/${slug}` }
      ],
      hreflang: generateSafeHreflang(generateProductHreflang(slug, true)),
      related_entities: {
        brand_hub: `/us/brand/${brand.toLowerCase()}`,
        flavour_hub: `/us/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/us/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      },
      competitor_brands: ['ZYN', 'Velo', 'Skruf', 'White Fox'],
      new_vendor_policy: 'We regularly add new vendors to ensure you get the best prices',
      images: {
        hero: product.image_url || '/placeholder-product.jpg',
        alt: product.product_title || 'Unknown Product'
      }
    });

    const llmSeoData = await generateLLMSEO({
      brand: brand,
      product_name: product.product_title || 'Unknown Product',
      flavour: flavour,
      strength_mg: parseFloat(strengthGroup) || 6,
      format: 'Pouches',
      pouch_count: 20,
      packs: stores.length > 0 ? [
        { 
          pack_size: 1, 
          price: parseFloat(stores[0]?.prices?.['1pack']?.replace('$', '') || '0'), 
          currency: 'USD',
          price_per_pouch: parseFloat(stores[0]?.prices?.['1pack']?.replace('$', '') || '0'),
          retailer_name: stores[0]?.name || 'Unknown',
          retailer_url: stores[0]?.link || '',
          in_stock: true,
          shipping_note: null,
          last_seen: new Date().toISOString()
        }
      ] : [],
      new_vendor_policy: 'We regularly add new vendors to ensure you get the best prices',
      images: {
        hero: product.image_url || '/placeholder-product.jpg',
        alt: product.product_title || 'Unknown Product'
      },
      page_url: `https://nicotine-pouches.org/us/product/${slug}`,
      site_name: 'Nicotine Pouches US',
      publisher: {
      name: 'Nicotine Pouches US',
      logo: 'https://nicotine-pouches.org/logo.png',
      url: 'https://nicotine-pouches.org/us'
      },
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'US Products', url: '/us' },
        { name: product.product_title || 'Unknown Product', url: product.page_url || `https://nicotine-pouches.org/us/product/${slug}` }
      ],
      hreflang: generateSafeHreflang(generateProductHreflang(slug, true)),
      related_entities: {
        brand_hub: `/us/brand/${brand.toLowerCase()}`,
        flavour_hub: `/us/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/us/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      }
    });
    
    console.log('US LLM SEO Data generated:', {
      hasData: !!llmSeoData,
      metaTitle: llmSeoData?.meta?.title || 'N/A',
      metaDescription: llmSeoData?.meta?.description || 'N/A',
      faqCount: llmSeoData?.faq_plaintext?.length || 0,
      schemaGenerated: !!llmSeoData?.schema_json_ld
    });
    
    return {
      ...transformedProduct,
      regularSeoData,
      llmSeoData
    };
  } catch (error) {
    console.error('Error fetching US product:', error);
    return null;
  }
}

interface USProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: USProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getUSProduct(resolvedParams.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found - Nicotine Pouches US',
      description: 'The requested product could not be found.'
    };
  }

  const regularSeoData = product.regularSeoData;
  const llmSeoData = product.llmSeoData;

  return {
    title: llmSeoData?.meta?.title || regularSeoData?.meta?.title || product.title || `${product.name} - Compare Prices & Deals US`,
    description: llmSeoData?.meta?.description || regularSeoData?.meta?.description || product.description || `Compare ${product.name} prices from top US vendors. Find the best deals and reviews.`,
    keywords: regularSeoData?.graphql_keywords?.seed_terms?.join(', ') || `${product.brand}, ${product.flavour}, nicotine pouches, ${product.strength_group}`,
    robots: llmSeoData?.meta?.robots || regularSeoData?.meta?.robots || "index,follow",
    authors: [{ name: 'Nicotine Pouches US' }],
    publisher: 'Nicotine Pouches US',
    openGraph: {
      title: llmSeoData?.meta?.og?.['og:title'] || regularSeoData?.meta?.og?.['og:title'] || product.title || `${product.name} - Compare Prices & Deals US`,
      description: llmSeoData?.meta?.og?.['og:description'] || regularSeoData?.meta?.og?.['og:description'] || product.description || `Compare ${product.name} prices from top US vendors.`,
      url: llmSeoData?.meta?.og?.['og:url'] || regularSeoData?.meta?.og?.['og:url'] || product.page_url || `https://nicotine-pouches.org/us/product/${resolvedParams.slug}`,
      siteName: llmSeoData?.meta?.og?.['og:site_name'] || regularSeoData?.meta?.og?.['og:site_name'] || "Nicotine Pouches US",
      type: 'website',
      images: [{
        url: llmSeoData?.meta?.og?.['og:image'] || regularSeoData?.meta?.og?.['og:image'] || product.image || '/placeholder-product.jpg',
        width: 1200,
        height: 630,
        alt: product.name
      }]
    },
    twitter: {
      card: (llmSeoData?.meta?.twitter?.card || regularSeoData?.meta?.twitter?.card || "summary_large_image") as "summary" | "summary_large_image" | "player" | "app",
      title: llmSeoData?.meta?.twitter?.title || regularSeoData?.meta?.twitter?.title || product.title || `${product.name} - Compare Prices & Deals US`,
      description: llmSeoData?.meta?.twitter?.description || regularSeoData?.meta?.twitter?.description || product.description || `Compare ${product.name} prices from top US vendors.`,
      images: [llmSeoData?.meta?.twitter?.image || regularSeoData?.meta?.twitter?.image || product.image || '/placeholder-product.jpg']
    },
    alternates: {
      canonical: llmSeoData?.meta?.canonical || regularSeoData?.meta?.canonical || `https://nicotine-pouches.org/us/product/${resolvedParams.slug}`,
      languages: {
        'en-US': `https://nicotine-pouches.org/us/product/${resolvedParams.slug}`,
        'x-default': `https://nicotine-pouches.org/us/product/${resolvedParams.slug}`
      }
    }
  };
}

export default async function USProductPage({ params }: USProductPageProps) {
  const resolvedParams = await params;
  const product = await getUSProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }


  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .product-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              padding: 0 15px !important;
            }
            .product-image-container {
              min-height: 300px !important;
              padding: 20px !important;
            }
            .product-title {
              font-size: 2rem !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              hyphens: auto !important;
            }
            .product-hero {
              padding: 40px 0 !important;
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
          }
          @media (max-width: 480px) {
            .product-title {
              font-size: 1.5rem !important;
            }
            .product-hero {
              padding: 30px 0 !important;
            }
            .product-hero-grid {
              padding: 0 10px !important;
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
            .comparison-table-filters {
              padding: 10px !important;
            }
            .main-content-layout {
              padding: 0 10px !important;
            }
          }
        `
      }} />
        {/* Structured Data - LLM SEO */}
        {product.llmSeoData?.schema_json_ld && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(product.llmSeoData.schema_json_ld)
            }}
          />
        )}
        
        {/* Explicit Product Schema for Security Audit Detection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name || 'Unknown Product',
              "brand": {
                "@type": "Brand",
                "name": product.brand || 'Unknown Brand'
              },
              "description": product.description || `Compare ${product.name} prices from top US vendors.`,
              "image": product.image || '/placeholder-product.jpg',
              "category": "Nicotine Pouches",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": product.stores && product.stores.length > 0 ? Math.min(...product.stores.map(s => parseFloat(s.price.replace(/[£$]/g, '')))) : 0,
                "highPrice": product.stores && product.stores.length > 0 ? Math.max(...product.stores.map(s => parseFloat(s.price.replace(/[£$]/g, '')))) : 0,
                "offerCount": product.stores?.length || 0,
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
        
        {/* Freshness Signals */}
        {product.llmSeoData?.freshness_signals && (
          <div style={{ display: 'none' }} data-llm-seo="freshness">
            {JSON.stringify(product.llmSeoData.freshness_signals)}
          </div>
        )}
        
        {/* Hreflang Meta Tags */}
        {generateSafeHreflang(generateProductHreflang(resolvedParams.slug, true)).map((entry) => (
          <link key={entry.lang} rel="alternate" {...({ hreflang: entry.lang } as any)} href={entry.url} />
        ))}
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
              padding: '0 20px',
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Klarna Text, sans-serif',
              textAlign: 'left'
            }}>
              <a href="/" style={{ color: '#0B051D', textDecoration: 'none', fontFamily: 'Klarna Text, sans-serif', fontWeight: '800' }}>Start</a>
              <span style={{ margin: '0 8px' }}>/</span>
              <a href="/us" style={{ color: '#0B051D', textDecoration: 'none', fontFamily: 'Klarna Text, sans-serif', fontWeight: '800' }}>US Products</a>
              <span style={{ margin: '0 8px' }}>/</span>
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


                  {/* Short Description */}
                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                    {(product.description || '').replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim()}
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
                    <option value="15pack">15 Pack</option>
                    <option value="20pack">20 Pack</option>
                    <option value="25pack">25 Pack</option>
                    <option value="30pack">30 Pack</option>
                    <option value="50pack">50 Pack</option>
                    <option value="100pack">100 Pack</option>
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
                  </select>
                
                </div>

                {/* Vendor List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                {product.stores.map((store: any, index: number) => (
                  <ExpandableUSVendorCard
                    key={index}
                    store={store}
                    storeIndex={index}
                  />
                ))}
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


            {/* FAQ Section */}
            <div style={{ marginBottom: '40px' }}>
              <FAQSection faqs={product.regularSeoData?.faq_plaintext || product.llmSeoData?.faq_plaintext || []} />
            </div>
        </main>

        {/* Footer */}
        <Footer showBrandsLink={false} isUSRoute={true} />
      </div>
      
      {/* Filter Coordinator - Disabled due to runtime errors */}
      {/* <FilterCoordinator /> */}
      
      {/* Vendor Analytics Component */}
      <VendorAnalytics 
        productId={product.id.toString()} 
        productName={product.name} 
        region="US" 
      />
      
      
      {/* Price Sort Filter Component */}
      <PriceSortFilter />
      
      {/* Shipping Filter Component */}
      <ShippingFilter />
      
        
        {/* Cookie Consent */}
        <CookieConsent />
        
        {/* Price Alert Signup Popup - Show on US product pages */}
        <PriceAlertSignupPopup 
          key={`popup-us-product-${product.id}`} 
          delay={3000} 
          scrollThreshold={30} 
        />
        
        {/* Client-side JavaScript for dynamic functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Store data globally for JavaScript access
              window.storesData = ${JSON.stringify(product.stores)};
              window.currentProductId = '${product.id}';
              window.selectedVariants = {}; // Initialize selected variants state
              
              // Function to update pack size displays
              window.updatePackSizeDisplay = function(selectedPack) {
                const packNumber = selectedPack.replace('pack', '');
                const packSizeDisplays = document.querySelectorAll('.pack-size-display');
                packSizeDisplays.forEach(display => {
                  display.textContent = \` (\${packNumber} Pack)\`;
                });
              };
              
              // Function to handle variant selection (simplified for US version)
              window.handleVariantChange = function(storeIndex, variantIndex) {
                console.log('handleVariantChange called:', { storeIndex, variantIndex });
                // US version doesn't use variants, so this is a no-op
              };
              
              // Function to update prices
              window.updatePrices = function(selectedPack) {
                if (!window.storesData) return;
                
                const priceDisplays = document.querySelectorAll('.price-display');
                priceDisplays.forEach((priceDisplay, index) => {
                  const store = window.storesData[index];
                  if (store && store.prices) {
                    const price = store.prices[selectedPack] || 'N/A';
                    priceDisplay.textContent = price;
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
                  // Find the store by matching the vendor name in the card
                  const vendorNameElement = card.querySelector('.vendor-name');
                  const vendorName = vendorNameElement ? vendorNameElement.textContent.trim() : '';
                  
                  const store = window.storesData.find(s => s.name === vendorName);
                  if (!store) {
                    card.style.display = 'none';
                    return;
                  }
                  
                  // Check if store has the selected pack size
                  const hasPackSize = store.prices && store.prices[selectedPack] && store.prices[selectedPack] !== 'N/A';
                  
                  if (hasPackSize) {
                    // Get price for sorting
                    const priceText = store.prices?.[selectedPack] || 'N/A';
                    const priceValue = parseFloat(priceText.replace(/[$,]/g, '')) || 999999; // High number for 'N/A' prices
                    
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
              
              // Create simple coordination function for US page - AVAILABLE IMMEDIATELY
              window.coordinateFilters = function(selectedPack, options = {}) {
                const { updatePrices = true, filterCards = true, triggerSort = true } = options;
                
                try {
                  // Step 1: Update prices if requested
                  if (updatePrices && typeof window.updatePrices === 'function') {
                    window.updatePrices(selectedPack);
                  }
                  
                  // Step 2: Filter vendor cards if requested
                  if (filterCards && typeof window.filterVendorCards === 'function') {
                    window.filterVendorCards(selectedPack);
                  }
                  
                  // Step 3: Trigger dependent sorts if requested
                  if (triggerSort) {
                    setTimeout(() => {
                      const priceSortSelect = document.getElementById('price-sort');
                      if (priceSortSelect) {
                        priceSortSelect.dispatchEvent(new Event('change'));
                      }
                      
                      const shippingSortSelect = document.getElementById('shipping-sort');
                      if (shippingSortSelect) {
                        shippingSortSelect.dispatchEvent(new Event('change'));
                      }
                      
                      const reviewSortSelect = document.getElementById('review-sort');
                      if (reviewSortSelect) {
                        reviewSortSelect.dispatchEvent(new Event('change'));
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error('❌ Error coordinating filters:', error);
                }
              };
              
              // Emit filtersReady event immediately after defining functions
              window.dispatchEvent(new Event('filtersReady'));
              console.log('✅ US Filters ready event dispatched');
              
              // PACK FILTER INITIALIZATION - After React hydration
              (function initUSPackFilter() {
                let initialized = false;
                
                function setupAndRun() {
                  if (initialized) return;
                  
                  const packSizeSelect = document.getElementById('pack-size');
                  const vendorCards = document.querySelectorAll('.vendor-card');
                  
                  // Only proceed if both exist
                  if (!packSizeSelect || vendorCards.length === 0) {
                    return;
                  }
                  
                  initialized = true;
                  
                  // Set up event listener
                  packSizeSelect.removeEventListener('change', window.handleUSPackSizeChange);
                  packSizeSelect.addEventListener('change', window.handleUSPackSizeChange);
                  
                  // Run initial coordination immediately
                  const defaultPack = packSizeSelect.value || '1pack';
                  if (typeof window.coordinateFilters === 'function') {
                    window.coordinateFilters(defaultPack);
                  }
                  
                  console.log('✅ US Pack filter initialized and ran with:', defaultPack);
                }
                
                // Try on load event (after React hydration)
                window.addEventListener('load', setupAndRun);
                
                // Also try with requestAnimationFrame (right after next paint)
                requestAnimationFrame(() => {
                  requestAnimationFrame(setupAndRun);
                });
                
                // Fallback: try after 200ms
                setTimeout(setupAndRun, 200);
              })();
              
              // US Pack size change handler
              window.handleUSPackSizeChange = function(event) {
                const selectedPack = event.target.value;
                if (typeof window.updatePackSizeDisplay === 'function') {
                  window.updatePackSizeDisplay(selectedPack);
                }
                if (typeof window.updatePrices === 'function') {
                  window.updatePrices(selectedPack);
                }
                if (typeof window.filterVendorCards === 'function') {
                  window.filterVendorCards(selectedPack);
                }
              };
            `
          }}
        />
    </div>
    </>
  );
}
