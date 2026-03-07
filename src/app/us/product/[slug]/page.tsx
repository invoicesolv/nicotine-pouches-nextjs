import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import VendorLogo from '@/components/VendorLogo';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewBalls from '@/components/ReviewBalls';
import VendorAnalytics from '@/components/VendorAnalytics';
import AdSenseInit from '@/components/AdSenseInit';
import ProductDetailsCard from '@/components/ProductDetailsCard';
import FAQSection from '@/components/FAQSection';
import CookieConsent from '@/components/CookieConsent';
import PriceAlertSignupPopup from '@/components/PriceAlertSignupPopup';
import { getImageStyles } from '@/utils/imageUtils';
import { generateProductHreflang, generateSafeHreflang } from '@/lib/hreflang';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import { generateLLMSEO, extractLLMSEODataFromDB } from '@/lib/llm-seo';
import ExpandableUSVendorCard from '@/components/ExpandableUSVendorCard';
import ProductHeroActions from '@/components/ProductHeroActions';
import ProductSectionNav from '@/components/ProductSectionNav';
import StrengthSelector from '@/components/StrengthSelector';
import PackSizeForm from '@/components/PackSizeForm';

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
            us_vendors(*)
          `)
          .eq('us_vendor_id', mapping.us_vendor_id)
          .eq('name', mapping.vendor_product)
          .maybeSingle();

        if (vpError && vpError.code !== 'PGRST116') {
          // Only log actual errors, not "no rows found"
          console.error(`❌ Error fetching vendor product "${mapping.vendor_product}":`, vpError);
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
          name: vendor?.name || 'Unknown',
          logo: vendor?.name || 'Unknown', // Pass vendor name instead of broken logo URL
          rating: vendor?.rating || null,
          trustpilot_score: vendor?.trustpilot_score || null,
          review_count: vendor?.review_count || 0,
          shipping: vendor?.shipping_info || 'Standard shipping',
          product: vp.name, // Use the actual vendor product name
          price: formatPrice(vp.price_1pack),
          link: vp.url || '#',
          vendorId: vp.us_vendor_id,
          updated_at: vp.updated_at, // Add updated_at for "Updated X ago" display
          stock_status: vp.stock_status,
          in_stock: vp.stock_status !== 'out_of_stock',
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
      headline: product.headline || '',
      short_description: product.short_description || '',
      description_long: product.description_long || '',
      content: product.content || '',
      brand: product.brand,
      flavour: product.flavour,
      strength_group: product.strength,
      format: product.format,
      nicotine_mg: product.nicotine_mg_pouch,
      page_url: product.page_url,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : (typeof product.ingredients === 'string' ? (() => { try { return JSON.parse(product.ingredients); } catch { return []; } })() : []),
      faq: Array.isArray(product.faq) ? product.faq : (typeof product.faq === 'string' ? (() => { try { return JSON.parse(product.faq); } catch { return []; } })() : []),
      usage_tips: product.usage_tips || '',
      usage_beginners: product.usage_beginners || '',
      usage_switchers: product.usage_switchers || '',
      brand_story: product.brand_story || '',
      brand_facts: product.brand_facts || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
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
      hreflang: generateSafeHreflang(generateProductHreflang(slug, true, false)),
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
      hreflang: generateSafeHreflang(generateProductHreflang(slug, true, false)),
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
    
    // Calculate available pack sizes from all stores
    // A pack size is "available" if at least one vendor has a valid price for it
    const allPackSizes = ['1pack', '3pack', '5pack', '10pack', '15pack', '20pack', '25pack', '30pack', '50pack', '100pack'];
    const availablePackSizes = allPackSizes.filter(packSizeKey => {
      return stores.some((store: any) => {
        const price = store.prices?.[packSizeKey];
        // Valid if price exists and is not 'N/A'
        return price && price !== 'N/A' && price !== '$NaN';
      });
    });

    console.log('US Available pack sizes:', availablePackSizes);

    return {
      ...transformedProduct,
      regularSeoData,
      llmSeoData,
      availablePackSizes: availablePackSizes.length > 0 ? availablePackSizes : ['1pack']
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
  searchParams: Promise<{
    pack?: string;
    sort?: string;
    shipping?: string;
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
    title: product.meta_title || llmSeoData?.meta?.title || regularSeoData?.meta?.title || product.title || `${product.name} - Compare Prices & Deals US`,
    description: product.meta_description || llmSeoData?.meta?.description || regularSeoData?.meta?.description || product.short_description || product.description || `Compare ${product.name} prices from top US vendors. Find the best deals and reviews.`,
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

export default async function USProductPage({ params, searchParams }: USProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const selectedPack = resolvedSearchParams.pack || '1pack';
  const product = await getUSProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Add selectedPack to product for use in the template
  product.selectedPack = selectedPack;


  return (
    <>
      {/* Google AdSense - raw script to avoid data-nscript attribute */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9898973838473500"
        crossOrigin="anonymous"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .content-container {
            width: calc(100% - 80px);
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
          }
          @media (min-width: 1536px) {
            .content-container {
              max-width: 90%;
            }
          }
          @media (max-width: 1024px) {
            .hero-ad-sidebar,
            .adsense-sidebar,
            .reviews-ad-sidebar,
            .details-ad-sidebar {
              display: none !important;
            }
          }
          @media (max-width: 768px) {
            .content-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
            }
            .comparison-section-wrapper {
              padding: 0 !important;
            }
            .product-hero-grid {
              display: block !important;
              padding: 0 15px !important;
            }
            .product-hero-top-row {
              display: flex !important;
              gap: 16px !important;
              align-items: flex-start !important;
            }
            .product-image-container {
              flex: 0 0 100px !important;
              min-height: auto !important;
              padding: 8px !important;
              max-width: 100px !important;
              position: relative !important;
            }
            .product-image-container img {
              width: 100% !important;
              height: auto !important;
              max-width: 100px !important;
              max-height: 100px !important;
              object-fit: contain !important;
            }
            .product-info-mobile {
              flex: 1 !important;
              min-width: 0 !important;
            }
            .product-title {
              font-size: 1.2rem !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              margin-bottom: 10px !important;
              line-height: 1.35 !important;
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
              font-weight: 700 !important;
              color: #202124 !important;
            }
            .product-hero p {
              font-size: 14px !important;
              line-height: 1.5 !important;
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
              color: #5f6368 !important;
            }
            .product-hero {
              padding: 12px 0 !important;
            }
            .product-description-desktop {
              display: block !important;
              font-size: 14px !important;
              margin-bottom: 0 !important;
              -webkit-line-clamp: 2 !important;
              display: -webkit-box !important;
              -webkit-box-orient: vertical !important;
              overflow: hidden !important;
              color: #5f6368 !important;
            }
            .product-action-row {
              display: none !important;
            }
            .main-content-layout {
              flex-direction: column !important;
              gap: 20px !important;
              margin: 0 !important;
              padding: 16px 0 0 0 !important;
              max-width: 100% !important;
            }
            .vendor-comparison {
              order: 1 !important;
              flex: none !important;
              min-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
            }
            .vendor-cards-container {
              padding: 0 !important;
              gap: 8px !important;
              width: 95% !important;
              margin: 0 auto !important;
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
              flex-direction: row !important;
              gap: 8px !important;
              align-items: center !important;
              overflow-x: auto !important;
              overflow-y: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
              padding: 12px 15px !important;
              margin: 0 0 0 0 !important;
              flex-wrap: nowrap !important;
              width: 100% !important;
              background: transparent !important;
            }
            .comparison-table-filters::-webkit-scrollbar {
              display: none !important;
            }
            .comparison-table-filters > * {
              flex-shrink: 0 !important;
              width: auto !important;
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
            .product-hero-grid {
              display: block !important;
              padding: 0 12px !important;
            }
            .product-hero-top-row {
              display: flex !important;
              gap: 12px !important;
              align-items: flex-start !important;
            }
            .product-image-container {
              min-height: auto !important;
              padding: 6px !important;
              flex: 0 0 80px !important;
              max-width: 80px !important;
            }
            .product-image-container img {
              max-width: 80px !important;
              max-height: 80px !important;
            }
            .product-info-mobile {
              flex: 1 !important;
              min-width: 0 !important;
            }
            .product-title {
              font-size: 1.1rem !important;
              margin-bottom: 4px !important;
              line-height: 1.2 !important;
            }
            .product-hero p {
              font-size: 12px !important;
              line-height: 1.3 !important;
            }
            .product-hero {
              padding: 12px 0 !important;
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
              padding: 10px 12px !important;
            }
            .main-content-layout {
              padding: 0 !important;
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
        
        {/* Product Schema - only render when stores with valid prices exist */}
        {(() => {
          const validStores = (product.stores || []).filter((s: any) => {
            const price = s.price?.replace(/[£$]/g, '');
            return price && parseFloat(price) > 0;
          });
          if (validStores.length === 0) return null;
          const prices = validStores.map((s: any) => parseFloat(s.price.replace(/[£$]/g, '')));
          return (
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
                  "description": product.short_description || product.description || `Compare ${product.name} prices from top US vendors.`,
                  "image": product.image || '/placeholder-product.jpg',
                  "category": "Nicotine Pouches",
                  "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "USD",
                    "lowPrice": Math.min(...prices),
                    "highPrice": Math.max(...prices),
                    "offerCount": validStores.length,
                    "availability": "https://schema.org/InStock"
                  }
                })
              }}
            />
          );
        })()}
        
        {/* Freshness Signals */}
        {product.llmSeoData?.freshness_signals && (
          <div style={{ display: 'none' }} data-llm-seo="freshness">
            {JSON.stringify(product.llmSeoData.freshness_signals)}
          </div>
        )}
        
        {/* Hreflang Meta Tags - US products only, no cross-region links (UK/US have different product catalogs) */}
        {generateSafeHreflang(generateProductHreflang(resolvedParams.slug, true, false)).map((entry) => (
          <link key={entry.lang} rel="alternate" hrefLang={entry.lang} href={entry.url} />
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
            <div className="content-container" style={{
              padding: '12px 15px',
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              textAlign: 'left'
            }}>
              <a href="/us" className="breadcrumb-link" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: '600' }}>Home</a>
              <span style={{ margin: '0 8px', color: '#9ca3af' }}>/</span>
              <a href="/us" className="breadcrumb-link" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '400' }}>Products</a>
              <span style={{ margin: '0 8px', color: '#9ca3af' }}>/</span>
              <span style={{ color: '#6b7280', fontWeight: '400' }}>{product.name}</span>
            </div>
          </div>

          {/* Product Hero Section */}
          <div className="product-hero" style={{
            backgroundColor: '#ffffff',
            padding: '16px 0 0 0',
            marginBottom: '0'
          }}>
            {/* Hero with Ad Sidebar */}
            <div className="content-container" style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start'
            }}>
              {/* Left - Product Content */}
              <div style={{ flex: '1', minWidth: 0 }}>
                <div className="product-hero-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '280px 1fr',
                  gap: '32px',
                  alignItems: 'start',
                  justifyContent: 'start'
                }}>
                  {/* Mobile: Top row with image and info side by side */}
                  <div className="product-hero-top-row" style={{ display: 'contents' }}>
                    {/* Product Image */}
                    <div className="product-image-container" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#fafafa',
                      borderRadius: '8px',
                      padding: '6px',
                      minHeight: 'auto',
                      position: 'relative'
                    }}>
                      <Image
                        src={product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        width={280}
                        height={280}
                        style={getImageStyles(product.image || '/placeholder-product.jpg')}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="product-info product-info-mobile">
                      <h1 className="product-title" style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#0B051D',
                        margin: '0 0 12px 0',
                        lineHeight: '1.2',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '-0.02em'
                      }}>
                        {product.name}
                      </h1>

                      {/* Use ProductHeroActions component for consistent icons */}
                      <ProductHeroActions product={product} ratingData={null} isUS={true} />

                      {/* Headline */}
                      {product.headline && (
                        <p style={{
                          fontSize: '15px',
                          color: '#374151',
                          fontWeight: '500',
                          lineHeight: '1.5',
                          marginBottom: '8px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>
                          {product.headline}
                        </p>
                      )}

                      {/* Short Description */}
                      <p className="product-description-desktop" style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '16px'
                      }}>
                        {(product.short_description || product.excerpt || product.description || '').replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim().substring(0, 250)}
                        {(product.short_description || product.excerpt || product.description || '').length > 250 && '...'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right - Hero Ad */}
              <div className="hero-ad-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px', alignSelf: 'flex-start' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Advertisement
                </div>
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', minHeight: '400px' }}
                  data-ad-client="ca-pub-9898973838473500"
                  data-ad-slot="4889694434"
                  data-ad-format="vertical"
                />
              </div>
            </div>

            {/* Section Navigation - Aligned with left content */}
            <div className="content-container" style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: '1', minWidth: 0 }}>
                <ProductSectionNav />
              </div>
              <div style={{ flex: '0 0 300px', maxWidth: '300px' }} />
            </div>
          </div>

            {/* Main Content Layout - Two Columns with Grey Background */}
            <div className="comparison-section-wrapper" style={{
              backgroundColor: '#f5f5f7',
              padding: '0 0 32px 0'
            }}>
            <div className="main-content-layout content-container" style={{
              paddingTop: '16px',
              display: 'flex',
              gap: '2rem'
            }}>
              
              {/* Left Column - Vendor Price Comparison */}
              <div className="vendor-comparison" suppressHydrationWarning style={{ flex: '1', minWidth: '0' }}>
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
                  
                  {/* Pack Size Filter - Only shows available pack sizes */}
                  <PackSizeForm selectedPack={product.selectedPack} availablePackSizes={product.availablePackSizes} />
                  
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

                {/* No Results Message - Hidden by default, shown via JS */}
                <div
                  id="no-results-message"
                  suppressHydrationWarning
                  style={{
                    display: 'none',
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '16px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    margin: '20px 0'
                  }}
                >
                  No vendors found for this pack size. Try selecting a different pack size.
                </div>

                {/* Vendor List */}
                <div
                  className="vendor-cards-container"
                  suppressHydrationWarning
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                {product.stores.map((store: any, index: number) => (
                  <ExpandableUSVendorCard
                    key={store.vendorId || store.name || index}
                    store={store}
                    storeIndex={index}
                    selectedPack={product.selectedPack}
                  />
                ))}
                </div>
              </div>

              {/* Right Column - Ad Sidebar */}
              <div className="adsense-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px' }}>
                <div style={{
                  position: 'sticky',
                  top: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Advertisement
                  </div>
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block', minHeight: '600px' }}
                    data-ad-client="ca-pub-9898973838473500"
                    data-ad-slot="4889694434"
                    data-ad-format="vertical"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div id="product-details" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            marginBottom: '0'
          }}>
            <div className="content-container" style={{
              display: 'flex',
              gap: '24px'
            }}>
              {/* Left - Product Details Content */}
              <div style={{ flex: '1', minWidth: 0 }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '1.5rem',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                }}>
                  Product Details
                </h3>
                <ProductDetailsCard product={product} />
              </div>

              {/* Right - Ad Sidebar */}
              <div className="details-ad-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px' }}>
                <div style={{
                  position: 'sticky',
                  top: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Advertisement
                  </div>
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block', minHeight: '400px' }}
                    data-ad-client="ca-pub-9898973838473500"
                    data-ad-slot="4889694434"
                    data-ad-format="vertical"
                  />
                </div>
              </div>
            </div>
          </div>

            {/* About This Product - Long Description */}
            {product.description_long && (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '40px 0',
                marginBottom: '0'
              }}>
                <div className="content-container">
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                  }}>
                    About {product.name}
                  </h3>
                  <div style={{ maxWidth: '720px' }}>
                    {product.description_long.split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} style={{
                        fontSize: '0.95rem',
                        color: '#374151',
                        lineHeight: '1.75',
                        marginBottom: '1rem'
                      }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '32px 0'
              }}>
                <div className="content-container">
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '1rem',
                    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                  }}>
                    Ingredients
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.ingredients.map((item: string, i: number) => (
                      <span key={i} style={{
                        padding: '6px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#4b5563'
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tips & Brand Story */}
            {(product.usage_tips || product.brand_story) && (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '40px 0'
              }}>
                <div className="content-container">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: product.brand_story && product.usage_tips ? '1fr 1fr' : '1fr',
                    gap: '2rem'
                  }}>
                    {product.usage_tips && (
                      <div>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '1rem',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          Usage Tips
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.7' }}>
                          {product.usage_tips}
                        </p>
                      </div>
                    )}
                    {product.brand_story && (
                      <div>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '1rem',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          About {product.brand || 'This Brand'}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.7' }}>
                          {product.brand_story}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Beginners & Switchers */}
            {(product.usage_beginners || product.usage_switchers) && (
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '40px 0'
              }}>
                <div className="content-container">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: product.usage_beginners && product.usage_switchers ? '1fr 1fr' : '1fr',
                    gap: '2rem'
                  }}>
                    {product.usage_beginners && (
                      <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '0.75rem',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          For Beginners
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.7' }}>
                          {product.usage_beginners}
                        </p>
                      </div>
                    )}
                    {product.usage_switchers && (
                      <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: '0.75rem',
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
                        }}>
                          Switching from Cigarettes
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.7' }}>
                          {product.usage_switchers}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section - Prefer product-level FAQs, fall back to SEO-generated */}
            <div id="features" style={{ marginBottom: '40px' }}>
              <FAQSection faqs={
                product.faq && product.faq.length > 0
                  ? product.faq.map((f: any) => ({ q: f.question, a: f.answer }))
                  : (product.regularSeoData?.faq_plaintext || product.llmSeoData?.faq_plaintext || [])
              } />
            </div>
        </main>

        {/* Footer */}
        <Footer showBrandsLink={false} isUSRoute={true} />
      </div>
      
      {/* Filter Coordinator - Disabled due to runtime errors */}
      {/* <FilterCoordinator /> */}
      
      {/* Initialize AdSense ad units */}
      <AdSenseInit />

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

                // Update prices for each vendor card by finding the store by vendor name
                const vendorCards = document.querySelectorAll('.vendor-card');
                vendorCards.forEach((card) => {
                  const vendorName = card.getAttribute('data-vendor-name');
                  const store = window.storesData.find(s => s.name === vendorName);
                  if (store && store.prices) {
                    const priceDisplay = card.querySelector('.price-display');
                    if (priceDisplay) {
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
                  // Find the store by matching the vendor name in the card's data attribute
                  const vendorName = card.getAttribute('data-vendor-name') || '';

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
                
                // Show/hide no results message (using existing element in DOM)
                const noResultsMsg = document.getElementById('no-results-message');
                if (visibleStores.length === 0) {
                  if (noResultsMsg) {
                    noResultsMsg.innerHTML = \`No vendors found for \${selectedPack.replace('pack', '')} pack size. Try selecting a different pack size.\`;
                    noResultsMsg.style.display = 'block';
                  }
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

                // Get initial pack from URL or default to 1pack
                const urlParams = new URLSearchParams(window.location.search);
                const initialPack = urlParams.get('pack') || '1pack';

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

                  // Apply initial filtering if pack is specified in URL (not default 1pack)
                  // Note: Server already renders correct pack display, so we only need to filter cards
                  if (initialPack && initialPack !== '1pack') {
                    console.log('✅ US Pack filter initialized with URL pack:', initialPack);
                    // Only filter cards - display and prices are already server-rendered correctly
                    if (typeof window.filterVendorCards === 'function') {
                      window.filterVendorCards(initialPack);
                    }
                  } else {
                    console.log('✅ US Pack filter initialized (default 1pack)');
                  }
                }

                // Try on load event (after React hydration)
                window.addEventListener('load', setupAndRun);

                // Fallback: try after 500ms to ensure React has hydrated
                setTimeout(setupAndRun, 500);
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
