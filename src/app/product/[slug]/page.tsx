import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Cache product pages for 1 hour
export const revalidate = 3600;
import { generateLLMSEO, extractLLMSEODataFromDB } from '@/lib/llm-seo';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import { getSEOTags, renderSchemaTag, generateStandaloneAggregateRating, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getProductSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getProductAggregateRating } from '@/lib/aggregate-ratings';
import VendorLogo from '@/components/VendorLogo';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewFilter from '@/components/ReviewFilter';
import ReviewFilterDropdown from '@/components/ReviewFilterDropdown';
import ReviewBalls from '@/components/ReviewBalls';
import TrustpilotRating from '@/components/TrustpilotRating';
import TrustpilotReviews from '@/components/TrustpilotReviews';
import ReviewForm from '@/components/ReviewForm';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import VendorAnalytics from '@/components/VendorAnalytics';
import ProductComparisonTable from '@/components/ProductComparisonTable';
import { convertVendorPrices } from '@/lib/currency-converter';
import ComparisonDialog from '@/components/ComparisonDialog';
import ProductDetailsCard from '@/components/ProductDetailsCard';
import FAQSection from '@/components/FAQSection';
import CookieConsent from '@/components/CookieConsent';
import PriceAlertSignupPopup from '@/components/PriceAlertSignupPopup';
import StockNotificationButton from '@/components/StockNotificationButton';
import { getImageStyles } from '@/utils/imageUtils';
import { generateProductHreflang, generateSafeHreflang } from '@/lib/hreflang';
import PackSizeForm from '@/components/PackSizeForm';
import ShippingFilterDropdown from '@/components/ShippingFilterDropdown';
import CombinedFilterPopup from '@/components/CombinedFilterPopup';
import ExpandableVendorCard from '@/components/ExpandableVendorCard';
import ProductHeroActions from '@/components/ProductHeroActions';
import ProductSectionNav from '@/components/ProductSectionNav';
import StrengthSelector from '@/components/StrengthSelector';
import RelatedProductsCarousel from '@/components/RelatedProductsCarousel';

// Helper function to check if a price is valid
function isValidPrice(price: any): boolean {
  if (!price) return false;
  if (price === 'N/A' || price === '' || price === null || price === undefined) return false;
  const priceStr = price.toString().trim();
  if (priceStr === '' || priceStr === 'N/A') return false;
  const priceNum = parseFloat(priceStr.replace(/[£€$]/g, '').replace(/,/g, '').trim());
  return !isNaN(priceNum) && priceNum > 0;
}

// Helper function to parse price to number
function parsePriceToNumber(price: any): number {
  if (!isValidPrice(price)) return 0;
  return parseFloat(price.toString().replace(/[£€$]/g, '').replace(/,/g, '').trim() || '0');
}

// Helper function to calculate price for a pack size (handles vendor-specific logic)
function calculatePackPrice(variant: any, packSize: string, vendorName?: string): number {
  if (!variant?.prices) return 0;

  let calculatedPrice = 0;
  const packCount = parseInt(packSize.replace('pack', '')) || 1;

  // Nicpouch stores per-unit prices - multiply by pack count
  const isNicpouch = vendorName && vendorName.toLowerCase().includes('nicpouch');

  if (isNicpouch && isValidPrice(variant.prices[packSize])) {
    const pricePerUnit = parsePriceToNumber(variant.prices[packSize]);
    if (pricePerUnit > 0) {
      calculatedPrice = pricePerUnit * packCount;
      return calculatedPrice;
    }
  }

  if (packSize === '15pack') {
    // Check if 15 pack price exists
    if (isValidPrice(variant.prices['15pack'])) {
      calculatedPrice = parsePriceToNumber(variant.prices['15pack']);
    }

    // For Snusifer, prioritize 1pack over 10pack
    const use1PackFallback = vendorName && vendorName.toLowerCase().includes('snusifer');

    if (!calculatedPrice && use1PackFallback && isValidPrice(variant.prices['1pack'])) {
      // Use 1 pack: price_1pack * 15
      const price1Pack = parsePriceToNumber(variant.prices['1pack']);
      if (price1Pack > 0) {
        calculatedPrice = price1Pack * 15;
      }
    } else if (!calculatedPrice && isValidPrice(variant.prices['10pack'])) {
      // Calculate from 10 pack: (price_10pack / 10) * 15
      const price10Pack = parsePriceToNumber(variant.prices['10pack']);
      if (price10Pack > 0) {
        const pricePerPouch = price10Pack / 10;
        calculatedPrice = pricePerPouch * 15;
      }
    } else if (!calculatedPrice && isValidPrice(variant.prices['1pack'])) {
      // Fallback to 1 pack: price_1pack * 15
      const price1Pack = parsePriceToNumber(variant.prices['1pack']);
      if (price1Pack > 0) {
        calculatedPrice = price1Pack * 15;
      }
    }
  }

  // For other pack sizes or fallback, use the pack size price directly
  if (!calculatedPrice && isValidPrice(variant.prices[packSize])) {
    calculatedPrice = parsePriceToNumber(variant.prices[packSize]);
  }

  return calculatedPrice;
}

// Fetch product data from Supabase
async function getProduct(slug: string, packSize: string = '1pack', shippingFilter: string = 'fastest', sortFilter: string = 'low-high') {
  try {
    // Convert slug back to proper case name
    // First replace 'amp' with '&amp;' to handle HTML entities
    // Handle "x-" pattern specially: "pablo-x-ice-cold" -> "Pablo X-Ice Cold"
    let properCaseName = slug.replace(/-/g, ' ').replace(/\bamp\b/g, '&amp;');
    
    // Check if slug contains "x-" pattern (e.g., "pablo-x-ice-cold")
    const hasXPattern = /-x-/.test(slug);
    if (hasXPattern) {
      // Replace " x " with " X-" to match product names like "Pablo X-Ice Cold"
      properCaseName = properCaseName.replace(/\s+x\s+/gi, ' X-');
    }
    
    properCaseName = properCaseName.replace(/\b\w/g, l => l.toUpperCase());
    
    // First try to find by exact name match in wp_products
    let { data: product, error } = await supabase()
      .from('wp_products')
      .select('*')
      .eq('name', properCaseName)
      .single();

    // If not found, try case-insensitive match with flexible special character handling
    if (error || !product) {
      const baseSearchTerm = slug.replace(/-/g, ' ').replace(/\bamp\b/g, '&amp;');
      
      // Generate multiple variations to handle special characters
      // Common patterns: "Dr Pepper" -> "Dr. Pepper", "Raspberry-Strawberry" -> "Raspberry-Strawberry"
      const variations = [
        baseSearchTerm, // Basic: "hit dr pepper"
        baseSearchTerm.replace(/\bdr\b/gi, 'Dr.'), // "hit Dr. pepper"
        baseSearchTerm.replace(/\bdr\s+pepper\b/gi, 'Dr. Pepper'), // "hit Dr. Pepper"
        // Handle hyphens in compound words (e.g., "raspberry-strawberry")
        baseSearchTerm.replace(/\b(\w+)\s+(\w+)\b/g, (match, w1, w2) => {
          // If two words could be hyphenated, try both
          return `${w1}-${w2}`;
        }),
        // Try with both hyphenated and non-hyphenated versions
        baseSearchTerm.replace(/\s+/g, '-'), // "hit-dr-pepper"
      ];
      
      // If slug contains "x-" pattern, add variations with "X-"
      if (hasXPattern) {
        variations.push(
          baseSearchTerm.replace(/\s+x\s+/gi, ' X-'),
          baseSearchTerm.replace(/\s+x\s+/gi, '-X-')
        );
      }
      
      // Also try with proper case variations
      const properCaseVariations = variations.map(v => 
        v.replace(/\b\w/g, l => l.toUpperCase())
      );
      
      // Combine all variations
      const allVariations = [...variations, ...properCaseVariations, baseSearchTerm];
      
      for (const searchTerm of allVariations) {
      const { data: products, error: searchError } = await supabase()
        .from('wp_products')
        .select('*')
          .ilike('name', `%${searchTerm}%`)
        .limit(1);

        if (searchError) {
          continue;
      }
        
        if (products && products.length > 0) {
      product = products[0];
          break;
        }
      }
      
      // If still not found, try a more aggressive fuzzy search
      if (!product) {
        // Split slug into words and search for products containing all words
        const words = slug.split('-').filter(w => w.length > 2);
        if (words.length > 0) {
          const { data: products, error: searchError } = await supabase()
            .from('wp_products')
            .select('*')
            .or(words.map(w => `name.ilike.%${w}%`).join(','))
            .limit(10);
          
          if (!searchError && products && products.length > 0) {
            // Find the best match (product with most matching words)
            // Prioritize products with "X-" if slug contains "x-"
            const bestMatch = products.reduce((best: any, p: any) => {
              const productWords = p.name.toLowerCase().split(/[\s-]+/);
              const matchCount = words.filter((w: string) => productWords.some((pw: string) => pw.includes(w))).length;
              const bestMatchCount = best ? words.filter((w: string) => best.name.toLowerCase().split(/[\s-]+/).some((pw: string) => pw.includes(w))).length : 0;
              
              // If slug has "x-" pattern, prioritize products with "X-" in name
              if (hasXPattern) {
                const hasXInName = /X-/i.test(p.name);
                const bestHasX = best ? /X-/i.test(best.name) : false;
                
                // If current product has X- and best doesn't, prefer current
                if (hasXInName && !bestHasX) {
                  return p;
                }
                // If best has X- and current doesn't, keep best
                if (bestHasX && !hasXInName) {
                  return best;
                }
              }
              
              return matchCount > bestMatchCount ? p : best;
            }, null as any);
            
            if (bestMatch) {
              product = bestMatch;
            }
          }
        }
      }

      if (!product) {
        console.error('Product not found:', { slug, properCaseName });
        return null;
      }
    }

    // Use enhanced database columns if available, fallback to parsing from product name
    const productName = product.name || '';
    const brand = product.brand_name || productName.split(' ')[0] || 'Unknown';
    // For flavour display, use the full name from product (minus brand) for better UX
    const flavour = productName.split(' ').slice(1).join(' ') || product.flavour_category || 'Unknown';
    // For strength, prefer nicotine_mg if available, otherwise try to parse from name or use default
    const strengthMatch = productName.match(/(\d+(?:\.\d+)?)\s*mg/i);
    const strengthGroup = product.nicotine_mg
      ? `${product.nicotine_mg}mg`
      : (strengthMatch ? `${strengthMatch[1]}mg` : '6mg');
    // Capitalize format for display (slim -> Slim)
    const rawFormat = product.pouch_format || 'pouches';
    const productFormat = rawFormat.charAt(0).toUpperCase() + rawFormat.slice(1);
    
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

    // Build select with all price columns to determine available pack sizes
    const vendorProductSelect = `
      id,
      name,
      vendor_id,
      url,
      price_1pack,
      price_3pack,
      price_5pack,
      price_10pack,
      price_15pack,
      price_20pack,
      price_25pack,
      price_30pack,
      price_50pack,
      price_100pack,
      stock_status,
      updated_at,
      created_at,
      vendors!inner(
        id,
        name,
        logo_url,
        rating,
        trustpilot_score,
        review_count,
        shipping_info,
        shipping_cost,
        free_shipping_threshold,
        delivery_speed,
        currency,
        needs_currency_conversion,
        offer_type,
        offer_value,
        offer_description
      )
    `;

    if (mappings && mappings.length > 0) {
      // Get vendor products - only select needed columns, limit to 20 vendors max
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(vendorProductSelect)
        .in('name', mappings.map((m: any) => m.vendor_product))
        .in('vendor_id', mappings.map((m: any) => m.vendor_id))
        .limit(20);

      if (vpError) {
        console.error('Error fetching mapped vendor products:', vpError);
      } else {
        vendorProducts = vpData || [];
      }
    } else {
      // Fallback: search for products with similar brand name - only needed columns
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(vendorProductSelect)
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
    // Returns null if price is invalid (no N/A values)
    const formatPrice = (price: any): string | null => {
      if (!price || price === '' || price === null || price === undefined) return null;
      const priceStr = price.toString().trim();
      if (priceStr === '' || priceStr === 'N/A' || priceStr.toLowerCase() === 'out of stock') return null;
      if (priceStr.includes('£')) {
        // Extract number from £X.XX format and reformat
        const numStr = priceStr.replace('£', '');
        const num = parseFloat(numStr);
        if (isNaN(num) || num <= 0) return null;
        return `£${num.toFixed(2)}`;
      } else {
        // Add £ and format to 2 decimal places
        const num = parseFloat(priceStr);
        if (isNaN(num) || num <= 0) return null;
        return `£${num.toFixed(2)}`;
      }
    };

    // Transform vendor products to store format and group by vendor
    const storesMap = new Map();
    vendorProducts?.forEach((vp: any) => {
      const vendorKey = vp.vendor_id;
      const vendor = vp.vendors;
      
      if (!storesMap.has(vendorKey)) {
        storesMap.set(vendorKey, {
      id: vp.id,
          name: vendor.name,
      logo: vendor.logo_url,
          rating: vendor.rating || 4.5,
          trustpilot_score: vendor.trustpilot_score || null,
          review_count: vendor.review_count || 0,
          shipping_info: vendor.shipping_info || 'Standard shipping',
          shipping_cost: typeof vendor.shipping_cost === 'string' ? parseFloat(vendor.shipping_cost) || 0 : (vendor.shipping_cost || 0),
          free_shipping_threshold: typeof vendor.free_shipping_threshold === 'string' ? parseFloat(vendor.free_shipping_threshold) || 0 : (vendor.free_shipping_threshold || 0),
          delivery_speed: vendor.delivery_speed || null,
          vendorId: vp.vendor_id,
          updated_at: vp.updated_at || vp.created_at || null,
          vendor: {
            currency: vendor.currency || 'GBP',
            needs_currency_conversion: vendor.needs_currency_conversion || false
          },
          currency: vendor.currency || 'GBP',
          needs_currency_conversion: vendor.needs_currency_conversion || false,
          offer_type: vendor.offer_type || null,
          offer_value: vendor.offer_value || null,
          offer_description: vendor.offer_description || null,
          variants: []
        });
      }
      
      // Extract strength from product name (e.g., "6mg", "10mg", "Mini 3mg", "#2", "#4")
      // First try to match variant identifiers like #2, #4
      let strengthMatch = vp.name.match(/#(\d+)/i);
      let strength: string;
      if (strengthMatch) {
        // Use "#2", "#4", etc. as the strength identifier
        strength = `#${strengthMatch[1]}`;
      } else {
        // Fall back to standard strength patterns
        strengthMatch = vp.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
        strength = strengthMatch ? strengthMatch[1] : 'Standard';
      }
      
      // Prepare raw prices - include all pack sizes to calculate available options
      const rawPrices: Record<string, any> = {};
      if (vp.price_1pack !== undefined) rawPrices['1pack'] = vp.price_1pack;
      if (vp.price_3pack !== undefined) rawPrices['3pack'] = vp.price_3pack;
      if (vp.price_5pack !== undefined) rawPrices['5pack'] = vp.price_5pack;
      if (vp.price_10pack !== undefined) rawPrices['10pack'] = vp.price_10pack;
      if (vp.price_15pack !== undefined) rawPrices['15pack'] = vp.price_15pack;
      if (vp.price_20pack !== undefined) rawPrices['20pack'] = vp.price_20pack;
      if (vp.price_25pack !== undefined) rawPrices['25pack'] = vp.price_25pack;
      if (vp.price_30pack !== undefined) rawPrices['30pack'] = vp.price_30pack;
      if (vp.price_50pack !== undefined) rawPrices['50pack'] = vp.price_50pack;
      if (vp.price_100pack !== undefined) rawPrices['100pack'] = vp.price_100pack;
      
      // Apply currency conversion if needed
      const convertedPrices = convertVendorPrices(vendor, rawPrices);
      
      // Determine stock status
      const stockStatus = vp.stock_status || 'in_stock';
      const isInStock = stockStatus !== 'out_of_stock' && stockStatus !== 'unavailable' && stockStatus !== 'sold_out';
      
      // Filter out pack sizes with no prices (null, empty, or invalid)
      const validPrices: any = {};
      Object.keys(convertedPrices).forEach(key => {
        const price = convertedPrices[key];
        if (price && price !== '' && price !== null && price !== undefined && price !== 'N/A') {
          const priceStr = price.toString().trim();
          if (priceStr !== '' && priceStr !== 'N/A' && priceStr.toLowerCase() !== 'out of stock') {
            const num = parseFloat(priceStr.replace(/[£€$]/g, '').replace(/,/g, ''));
            if (!isNaN(num) && num > 0) {
              validPrices[key] = price;
            }
          }
        }
      });
      
      // Only add variant if it has at least one valid price
      if (Object.keys(validPrices).length > 0) {
      storesMap.get(vendorKey).variants.push({
        product: vp.name,
        strength: strength,
          price: validPrices['1pack'] || Object.values(validPrices)[0] || null,
        link: vp.url || '#',
          prices: validPrices,
          in_stock: isInStock,
          stock_status: stockStatus
        });
      }
    });
    
    // Convert to array, show all vendors regardless of pack size availability
    let stores = Array.from(storesMap.values())
      .map(store => {
        // Debug: Log offer data for Snusifer
        if (store.name === 'Snusifer') {
          console.log('Snusifer store data before mapping:', {
            offer_type: store.offer_type,
            offer_value: store.offer_value,
            offer_description: store.offer_description
          });
        }
        return {
      ...store,
        variants: store.variants
          .sort((a: any, b: any) => {
        // Sort by strength: Mini < Normal < Strong < Extra Strong
        const strengthOrder: { [key: string]: number } = { 'Mini': 1, 'Normal': 2, 'Strong': 3, 'Extra Strong': 4, 'Max': 5, 'Ultra': 6 };
        const aOrder = strengthOrder[a.strength] || 0;
        const bOrder = strengthOrder[b.strength] || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // If same strength category, sort by mg value
        const aMg = parseFloat(a.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        const bMg = parseFloat(b.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        return aMg - bMg;
          })
        };
      });

    // Apply shipping filter
    if (shippingFilter === 'free') {
      console.log(`Applying free shipping filter for pack size: ${packSize}`);
      console.log('Available stores:', stores.map(s => s.name));
      
      stores = stores.filter(store => {
        console.log(`\nChecking ${store.name}:`);
        console.log('Store variants:', store.variants.length);
        console.log('First variant prices:', store.variants[0]?.prices);
        
        // Use first variant for price calculation
        const variant = store.variants[0];
        const packPrice = calculatePackPrice(variant, packSize, store.name);
        const freeThreshold = parseFloat(store.free_shipping_threshold || '0');
        const shippingCost = parseFloat(store.shipping_cost || '0');
        
        // Free shipping if:
        // 1. shipping_cost is 0 (always free shipping, like Snusifer)
        // 2. OR packPrice meets the free threshold (threshold-based free shipping)
        const hasFreeShipping = shippingCost === 0 || (packPrice >= freeThreshold && freeThreshold > 0);
        
        console.log(`${store.name}: Pack price £${packPrice}, Shipping cost £${shippingCost}, Threshold £${freeThreshold}, Qualifies: ${hasFreeShipping}`);
        
        return hasFreeShipping;
      });
    } else {
      // Sort by shipping priority
      stores.sort((a, b) => {
        // Use first variant for price calculation
        const variantA = a.variants[0];
        const variantB = b.variants[0];
        
        const packPriceA = calculatePackPrice(variantA, packSize, a.name);
        const packPriceB = calculatePackPrice(variantB, packSize, b.name);
        const freeThresholdA = parseFloat(a.free_shipping_threshold || '0');
        const freeThresholdB = parseFloat(b.free_shipping_threshold || '0');
        
        const shippingCostA = parseFloat(a.shipping_cost || '0');
        const shippingCostB = parseFloat(b.shipping_cost || '0');
        const freeShippingA = shippingCostA === 0 || (packPriceA >= freeThresholdA && freeThresholdA > 0);
        const freeShippingB = shippingCostB === 0 || (packPriceB >= freeThresholdB && freeThresholdB > 0);
        
        const getShippingPriority = (shipping: string, hasFreeShipping: boolean) => {
          if (!shipping) return 999;
          if (hasFreeShipping) return 0;
          if (shipping.includes('same day')) return 1;
          if (shipping.includes('next day') || shipping.includes('1 day')) return 2;
          if (shipping.includes('2 day') || shipping.includes('2-day')) return 3;
          if (shipping.includes('3 day') || shipping.includes('3-day')) return 4;
          return 5;
        };
        
        const priorityA = getShippingPriority(a.delivery_speed || '', freeShippingA);
        const priorityB = getShippingPriority(b.delivery_speed || '', freeShippingB);
        
        // Always sort by fastest (priorityA - priorityB)
        return priorityA - priorityB;
      });
    }

    // Apply price sorting (always lowest to highest)
    if (sortFilter === 'low-high') {
      stores.sort((a, b) => {
        const variantA = a.variants[0];
        const variantB = b.variants[0];
        const priceA = calculatePackPrice(variantA, packSize, a.name);
        const priceB = calculatePackPrice(variantB, packSize, b.name);

        return priceA - priceB;
      });
    }

    // Sort by price (lowest first)
    stores.sort((a, b) => {
      const variantA = a.variants[0];
      const variantB = b.variants[0];
      const priceA = calculatePackPrice(variantA, packSize, a.name);
      const priceB = calculatePackPrice(variantB, packSize, b.name);
      return priceA - priceB;
    });

    const processedStores = stores
      .filter(store => {
        // Only include stores that have variants with valid prices for the selected pack size
        const variant = store.variants[0];
        if (!variant) return false;
        const calculatedPriceNum = calculatePackPrice(variant, packSize, store.name);
        return calculatedPriceNum > 0;
      })
      .map(store => {
        // Calculate price for selected pack size with 15 pack logic
        const variant = store.variants[0];
        const calculatedPriceNum = calculatePackPrice(variant, packSize, store.name);
        const calculatedPrice = calculatedPriceNum > 0 ? `£${calculatedPriceNum.toFixed(2)}` : null;
        
        return {
      ...store,
          // Show the calculated price for the selected pack (null if no price)
          price: calculatedPrice,
      selectedPackSize: packSize,
        // Only include pack sizes that have valid prices (no N/A defaults)
          prices: variant?.prices || {},
          url: variant?.link || '#',
      in_stock: true,
      // Keep the original shipping data from vendor
      // shipping_cost and free_shipping_threshold are already set above
        };
      });
    
    // Generate SEO data
    const regularSeoData = await generateProductSEO({
      brand: brand,
      product_name: product.name || 'Unknown Product',
      flavour: flavour,
      strength_mg: strengthGroup,
      format: productFormat,
      pouch_count: 20, // Default value
      nicotine_free_option: false,
      country_focus: 'UK',
      primary_keyword: product.name || 'Unknown Product',
      secondary_keywords: [brand, flavour, 'nicotine pouches'],
      brand_keywords: [brand],
      competitor_brands: ['ZYN', 'Velo', 'Skruf'],
      product_list: stores.length > 0 ? stores
        .filter((store: any) => {
          // Only include stores with valid 1pack prices for SEO
          const price = store.variants?.[0]?.prices?.['1pack'] || store.prices?.['1pack'];
          return price && price !== '' && price !== 'N/A' && price !== null;
        })
        .map((store: any) => ({
        name: store.name,
        price: store.variants?.[0]?.prices?.['1pack'] || store.prices?.['1pack'] || null,
        url: store.variants?.[0]?.link || store.url || '#',
        in_stock: store.in_stock,
        brand: brand,
        flavour: flavour,
        strength_mg: store.variants?.[0]?.strength || 'Standard',
        format: productFormat,
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
        hero: product.image_url && product.image_url.startsWith('http') ? product.image_url : `https://nicotine-pouches.org${product.image_url || '/placeholder-product.jpg'}`,
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
      hreflang: generateSafeHreflang(generateProductHreflang(slug, false, false)),
      related_entities: {
        brand_hub: `/brand/${brand.toLowerCase()}`,
        flavour_hub: `/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      }
    });

    console.log('🔍 DEBUG - Brand extraction:', {
      productName: product.name,
      extractedBrand: brand,
      brandType: typeof brand,
      brandLength: brand?.length
    });
    
    console.log('🔍 LLM SEO Input - Brand:', brand, 'Product Name:', product.name);

    const llmSeoData = await generateLLMSEO({
      brand: brand,
      product_name: product.name || 'Unknown Product',
      flavour: flavour,
      strength_mg: parseFloat(strengthGroup) || 0,
      format: productFormat,
      pouch_count: 20,
      packs: stores.map((store, index) => {
        const packSizeNumber = parseInt(packSize.replace('pack', ''));
        
        // Get the actual price for the selected pack size from the store's variants
        let actualPrice = 0;
        let retailerUrl = '';
        
        if (store.variants && store.variants.length > 0) {
          const variant = store.variants[0]; // Use first variant
          const packPriceKey = `${packSizeNumber}pack`;
          const priceStr = variant.prices?.[packPriceKey] || variant.price || '£0';
          actualPrice = parseFloat(priceStr.replace('£', '') || '0');
          retailerUrl = variant.link || store.url || '';
        } else {
          // Fallback to store.price if no variants
          actualPrice = parseFloat(store.price?.replace('£', '') || '0');
          retailerUrl = store.url || '';
        }
        
        const pricePerPouch = actualPrice / packSizeNumber;
        
        return {
          pack_size: packSizeNumber,
          price: actualPrice,
          currency: 'GBP',
          price_per_pouch: pricePerPouch,
          retailer_name: store.name || 'Unknown',
          retailer_url: retailerUrl,
          in_stock: store.in_stock || false,
          shipping_note: store.shipping_info || null,
          last_seen: new Date().toISOString(),
          offer_id: `${product.page_url || `https://nicotine-pouches.org/product/${slug}`}/offer/${store.name?.toLowerCase().replace(/\s+/g, '-')}-${packSize}-${index}`,
          sku: `${brand.toUpperCase().replace(/\s+/g, '-')}-${(product.name || 'Unknown Product').replace(/\s+/g, '-').toUpperCase()}-${packSizeNumber}PK`
        };
      }),
      new_vendor_policy: 'We regularly add new vendors to ensure you get the best prices',
      images: {
        hero: product.image_url && product.image_url.startsWith('http') ? product.image_url : `https://nicotine-pouches.org${product.image_url || '/placeholder-product.jpg'}`,
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
      hreflang: generateSafeHreflang(generateProductHreflang(slug, false, false)),
      related_entities: {
        brand_hub: `/brand/${brand.toLowerCase()}`,
        flavour_hub: `/flavour/${flavour.toLowerCase()}`,
        strength_filter: `/strength/${strengthGroup}`,
        alternatives: ['ZYN', 'Velo', 'Skruf']
      },
      sku: `${brand.toUpperCase().replace(/\s+/g, '-')}-${(product.name || 'Unknown Product').replace(/\s+/g, '-').toUpperCase()}`,
      mpn: product.mpn || `${brand.toUpperCase()}-${(product.name || 'Unknown Product').replace(/\s+/g, '-').toUpperCase()}`,
      gtin8: product.gtin8 || undefined,
      gtin13: product.gtin13 || undefined,
      gtin14: product.gtin14 || undefined
    });
    
    console.log('LLM SEO Data generated:', {
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
      // Check if any store has a valid price for this pack size
      return stores.some(store => {
        // Check all variants in the store
        return store.variants?.some((variant: any) => {
          const price = variant.prices?.[packSizeKey];
          return isValidPrice(price);
        });
      });
    });

    console.log('Available pack sizes:', availablePackSizes);

    return {
      id: product.id || 'unknown',
      slug: slug,
      title: product.name || 'Unknown Product',
      name: product.name || 'Unknown Product',
      headline: product.headline || '',
      image: product.image_url || '/placeholder-product.jpg',
      rating: 0, // Default rating since wp_products doesn't have rating
      description: product.content || 'No description available',
      description_short: product.description_short || '',
      description_long: product.description_long || '',
      brand: brand,
      flavour: flavour,
      flavour_category: product.flavour_category || '',
      strength_group: strengthGroup,
      format: productFormat,
      page_url: product.page_url || `https://nicotine-pouches.org/product/${slug}`,
      stores: processedStores,
      content: product.content || '',
      excerpt: product.excerpt || '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
      faq: Array.isArray(product.faq) ? product.faq : [],
      usage_tips: Array.isArray(product.usage_tips) ? product.usage_tips : [],
      usage_beginners: Array.isArray(product.usage_beginners) ? product.usage_beginners : [],
      usage_switchers: Array.isArray(product.usage_switchers) ? product.usage_switchers : [],
      brand_story: product.brand_story || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      regularSeoData,
      llmSeoData,
      selectedPack: packSize,
      availablePackSizes: availablePackSizes.length > 0 ? availablePackSizes : ['1pack'] // Fallback to 1pack if none available
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
    // Only include aggregateRating if we have valid reviews (reviewCount > 0)
    // Google rejects schema with reviewCount: 0
    aggregateRating: ratingData?.aggregateRating && ratingData.reviewCount > 0 
      ? ratingData.aggregateRating 
      : undefined
  };

  // Generate SEO data using centralized template
  const seoData = getProductSEOTemplate(productData);

  // Override with DB meta fields when set
  if (product.meta_title) seoData.title = product.meta_title;
  if (product.meta_description) seoData.description = product.meta_description;

  // Use centralized SEO function
  return getSEOTags('product', seoData);
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    pack?: string;
    shipping?: string;
    sort?: string;
  }>;
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const selectedPack = resolvedSearchParams.pack || '1pack';
  
  const product = await getProduct(resolvedParams.slug, selectedPack, resolvedSearchParams.shipping || 'fastest', resolvedSearchParams.sort || 'low-high');

  if (!product) {
    notFound();
  }

  // Fetch rating, review counts, reviews, and vendor data ALL in parallel
  const vendorReviewCountMap = new Map<number, number>();
  const allTrustpilotReviews: any[] = [];
  const vendorNameMap = new Map<number, string>();
  const vendorLogoMap = new Map<number, string>();
  let totalTrustpilotReviewCount = 0;
  let ratingData: any = null;

  const vendorIds = product.stores?.map((store: any) => store.vendorId).filter(Boolean) || [];

  // All independent queries in one Promise.all
  const [ratingResult, ...reviewResults] = await Promise.all([
    getProductAggregateRating(product.id),
    ...(vendorIds.length > 0 ? [
      supabase().from('reviews').select('vendor_id').in('vendor_id', vendorIds).eq('is_approved', true),
      supabase().from('trustpilot_reviews').select('vendor_id').in('vendor_id', vendorIds),
      supabase().from('vendors').select('id, name, logo_url').in('id', vendorIds),
      supabase().from('trustpilot_reviews').select('*').in('vendor_id', vendorIds)
        .order('review_date', { ascending: false, nullsFirst: false }).limit(10),
      supabase().from('trustpilot_reviews').select('*', { count: 'exact', head: true }).in('vendor_id', vendorIds)
    ] : [])
  ]);

  ratingData = ratingResult;

  if (vendorIds.length > 0) {
    const [userReviews, trustpilotReviewsList, vendorsResult, reviewsResult, reviewCountResult] = reviewResults as any[];

    // Count review counts per vendor
    userReviews?.data?.forEach((r: any) => {
      vendorReviewCountMap.set(r.vendor_id, (vendorReviewCountMap.get(r.vendor_id) || 0) + 1);
    });
    trustpilotReviewsList?.data?.forEach((r: any) => {
      vendorReviewCountMap.set(r.vendor_id, (vendorReviewCountMap.get(r.vendor_id) || 0) + 1);
    });

    totalTrustpilotReviewCount = reviewCountResult?.count || 0;

    const vendorLogoMapping: { [key: string]: string } = {
      'Two Wombats': '/vendor-logos/two-wombats.jpg',
      'HAYYP': '/vendor-logos/HAYPP.jpg',
      'Snusifer': '/vendor-logos/Snusifer.png',
      'Emeraldpods': '/vendor-logos/Emeraldpods.webp',
      'Emerald': '/vendor-logos/Emeraldpods.webp',
      'Snus Vikings': '/vendor-logos/Snus-viking.png',
      'Northerner UK': '/vendor-logos/northerner_black_mobile.webp',
      'Northerner US': '/vendor-logos/northerner_black_mobile.webp',
      'Nicokick': '/vendor-logos/Nicokick.png',
      'Nicokick (55788)': '/vendor-logos/Nicokick.png',
      'Nicpouch': '/vendor-logos/NICPOUCHUK.jpg',
      'GotPouches': '/vendor-logos/gotpouches.png',
      'SnusDirect': '/vendor-logos/snusdirekt.avif',
      'SnusDaddy': '/vendor-logos/pouchdaddy.png',
      'Prime Nic Pouches': '/vendor-logos/PrimeNicPouches.png',
      'Prime': '/vendor-logos/PrimeNicPouches.png',
      'PrimeNicPouches': '/vendor-logos/PrimeNicPouches.png',
      'PrimeVapes': '/vendor-logos/PrimeVapes.png',
      'NicoUK': '/vendor-logos/NicoUK.png',
      'NicPouches': '/vendor-logos/NicPouches.svg',
      'SnusBoys': '/vendor-logos/SnusBoys.png',
      'NicPouchesDirect': '/vendor-logos/NicPouchesDirect.png',
    };

    vendorsResult?.data?.forEach((vendor: any) => {
      vendorNameMap.set(vendor.id, vendor.name);
      vendorLogoMap.set(vendor.id, vendorLogoMapping[vendor.name] || vendor.logo_url || '');
    });

    reviewsResult?.data?.forEach((review: any) => {
      allTrustpilotReviews.push({
        ...review,
        vendor_name: vendorNameMap.get(review.vendor_id) || 'Unknown Vendor',
        vendor_logo: vendorLogoMap.get(review.vendor_id) || null
      });
    });
  }
  
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
    // Only include aggregateRating if we have valid reviews (reviewCount > 0)
    // Google rejects schema with reviewCount: 0
    aggregateRating: ratingData?.aggregateRating && ratingData.reviewCount > 0 
      ? ratingData.aggregateRating 
      : undefined
  };

  // Generate breadcrumb data
  const breadcrumbs = generateBreadcrumbData('product', productData);

  // Fetch related products (same brand, excluding current product)
  let relatedProducts: any[] = [];
  try {
    const brandName = product.brand || product.name.split(' ')[0];
    const { data: brandProducts } = await supabase()
      .from('wp_products')
      .select('id, name, image_url, price')
      .ilike('name', `${brandName}%`)
      .neq('id', product.id)
      .not('image_url', 'is', null)
      .limit(20);

    if (brandProducts && brandProducts.length > 0) {
      const productIds = brandProducts.map((p: any) => p.id);

      // Fetch mappings + tracking in parallel (was 4 sequential queries, now 2 parallel)
      const [mappingsResult, trackingResult] = await Promise.all([
        supabase().from('vendor_product_mapping').select('product_id, vendor_id, vendor_product').in('product_id', productIds),
        supabase().from('price_alerts').select('product_id').in('product_id', productIds)
      ]);

      const vpMappings = mappingsResult.data || [];

      // Count unique vendors per product
      const storeCounts = new Map<number, number>();
      const vendorSets = new Map<number, Set<number>>();
      vpMappings.forEach((m: any) => {
        if (!vendorSets.has(m.product_id)) vendorSets.set(m.product_id, new Set());
        vendorSets.get(m.product_id)!.add(m.vendor_id);
      });
      vendorSets.forEach((vendors, productId) => {
        storeCounts.set(productId, vendors.size);
      });

      // Get lowest prices — single query using mapping data we already have
      const lowestPrices = new Map<number, string>();
      if (vpMappings.length > 0) {
        const { data: vpPrices } = await supabase()
          .from('vendor_products')
          .select('name, vendor_id, price_1pack')
          .in('name', vpMappings.map((m: any) => m.vendor_product))
          .in('vendor_id', vpMappings.map((m: any) => m.vendor_id))
          .not('price_1pack', 'is', null)
          .limit(100);

        if (vpPrices) {
          const nameVendorToProduct = new Map<string, number>();
          vpMappings.forEach((m: any) => {
            nameVendorToProduct.set(`${m.vendor_product}__${m.vendor_id}`, m.product_id);
          });

          vpPrices.forEach((vp: any) => {
            const productId = nameVendorToProduct.get(`${vp.name}__${vp.vendor_id}`);
            if (productId && vp.price_1pack) {
              const priceStr = String(vp.price_1pack).replace(/[£$€]/g, '');
              const priceNum = parseFloat(priceStr);
              if (!isNaN(priceNum) && priceNum > 0) {
                const existing = lowestPrices.get(productId);
                const existingNum = existing ? parseFloat(existing.replace(/[£$]/g, '')) : Infinity;
                if (priceNum < existingNum) {
                  lowestPrices.set(productId, `£${priceNum.toFixed(2)}`);
                }
              }
            }
          });
        }
      }

      const trackingCounts = new Map<number, number>();
      trackingResult.data?.forEach((t: any) => {
        trackingCounts.set(t.product_id, (trackingCounts.get(t.product_id) || 0) + 1);
      });

      relatedProducts = brandProducts
        .filter((p: any) => (storeCounts.get(p.id) || 0) > 0)
        .map((p: any) => {
          const price = lowestPrices.get(p.id) || (p.price > 0 ? `£${parseFloat(p.price).toFixed(2)}` : '£3.99');
          const priceNum = parseFloat(price.replace(/[£$]/g, ''));
          return {
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            price: price,
            original_price: !isNaN(priceNum) && priceNum > 1 ? `£${(priceNum * 1.25).toFixed(2)}` : undefined,
            store_count: storeCounts.get(p.id) || 0,
            tracking_count: trackingCounts.get(p.id) || 0,
            slug: p.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
          };
        })
        .slice(0, 12);
    }
  } catch (err) {
    console.error('Error fetching related products:', err);
  }

  return (
    <>
      {/* Google AdSense - raw script to avoid data-nscript attribute */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9898973838473500"
        crossOrigin="anonymous"
      />
      {/* Standalone AggregateRating Schema - Only render if reviewCount > 0 */}
      {ratingData && ratingData.reviewCount > 0 && (() => {
        // Calculate SKU, MPN, GTIN values (same logic as in getProduct function)
        const skuValue = `${product.brand?.toUpperCase().replace(/\s+/g, '-')}-${product.name.replace(/\s+/g, '-').toUpperCase()}`;
        const mpnValue = `${product.brand?.toUpperCase()}-${product.name.replace(/\s+/g, '-').toUpperCase()}`;
        
        // Auto-generate multiple offers for all stores and all pack sizes
        const offersData = product.stores && product.stores.length > 0 ? (() => {
          // Collect all offers from all vendors and all pack sizes
          const allOffers: any[] = [];
          const allPrices: number[] = [];
          
          // Pack sizes to check (in order)
          const packSizes = ['1pack', '3pack', '5pack', '10pack', '15pack', '20pack', '25pack', '30pack', '50pack', '100pack'];
          
          product.stores.forEach((store: any) => {
            // Get the first variant (or use store directly if no variants)
            const variant = store.variants?.[0] || store;
            const prices = variant.prices || store.prices || {};
            const storeUrl = variant.link || store.url || `https://nicotine-pouches.org/product/${resolvedParams.slug}`;
            const stockStatus = variant.stock_status || store.stock_status || 'in_stock';
            
            // Determine availability
            const availability = stockStatus === 'out_of_stock' || 
                               stockStatus === 'unavailable' ||
                               stockStatus === 'sold_out'
              ? "https://schema.org/OutOfStock" 
              : "https://schema.org/InStock";
            
            // Get location/areaServed (default to UK for UK products)
            const areaServed = store.country || store.location || "GB";
            
            // Generate one offer per pack size that has a valid price
            packSizes.forEach((packSize) => {
              const priceStr = prices[packSize];
              if (!priceStr || priceStr.trim() === '' || priceStr === 'N/A' || priceStr === 'Out of stock') {
                return; // Skip pack sizes without valid prices
              }
              
              // Extract price value
              const priceValue = parseFloat(priceStr.replace(/[£$€]/g, ''));
              if (isNaN(priceValue) || priceValue <= 0) {
                return; // Skip invalid prices
              }
              
              // Determine currency from price string or default to GBP
              const priceCurrency = priceStr.includes('$') ? 'USD' : 
                                   priceStr.includes('€') ? 'EUR' : 
                                   priceStr.includes('£') ? 'GBP' : 'GBP';
              
              // Extract pack size number for description
              const packSizeNumber = packSize.replace('pack', '');
              
              allOffers.push({
                "@type": "Offer",
                "url": storeUrl,
                "priceCurrency": priceCurrency,
                "price": priceValue.toFixed(2),
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "itemCondition": "https://schema.org/NewCondition",
                "availability": availability,
                "areaServed": {
                  "@type": "Country",
                  "name": areaServed === "GB" ? "United Kingdom" : areaServed === "US" ? "United States" : areaServed
                },
                "seller": {
                  "@type": "Organization",
                  "name": store.name,
                  "url": store.website || store.url || undefined
                },
                "name": `${store.name} - ${packSizeNumber} Pack` // Optional: descriptive name
              });
              
              allPrices.push(priceValue);
            });
          });
          
          if (allOffers.length === 0) {
            return undefined;
          }
          
          const lowPrice = Math.min(...allPrices).toFixed(2);
          const highPrice = Math.max(...allPrices).toFixed(2);
          
          return {
            "@type": "AggregateOffer",
            "priceCurrency": "GBP",
            "lowPrice": lowPrice,
            "highPrice": highPrice,
            "offerCount": allOffers.length,
            "offers": allOffers // Include ALL offers from ALL vendors and ALL pack sizes
          };
        })() : undefined;
        
        // Ensure image URL is absolute - product.image comes from product.image_url
        const imageUrl = product.image && product.image !== '/placeholder-product.jpg'
          ? (product.image.startsWith('http') ? product.image : `https://nicotine-pouches.org${product.image}`)
          : `https://nicotine-pouches.org/placeholder-product.jpg`;
        
        // Get description (strip HTML tags) - product.description comes from product.content
        const description = (product.description || product.content || '')
          .replace(/<[^>]*>/g, '')
          .replace(/\\n/g, ' ')
          .trim() || `Buy ${product.name} nicotine pouches online. Compare prices from multiple vendors.`;
        
        // Ensure offers are generated - fetch ALL stores with prices
        // REQUIRED: Schema.org requires either offers, aggregateRating, or review in Product
        const finalOffersData = offersData || (product.stores && product.stores.length > 0 ? (() => {
          const storesWithPrices = product.stores.filter((s: any) => {
            const price = s.price?.trim() || '';
            return price !== '' && price !== 'Out of stock' && price !== 'N/A' && parseFloat(price.replace(/[£$]/g, '')) > 0;
          });
          if (storesWithPrices.length === 0) {
            console.warn('⚠️ No stores with valid prices found for offers generation');
            return undefined;
          }
          
          const prices = storesWithPrices.map((s: any) => parseFloat(s.price.replace(/[£$]/g, '')));
          const lowPrice = Math.min(...prices).toFixed(2);
          const highPrice = Math.max(...prices).toFixed(2);
          
          return {
            "@type": "AggregateOffer",
            "priceCurrency": "GBP",
            "lowPrice": lowPrice,
            "highPrice": highPrice,
            "offerCount": storesWithPrices.length,
            "offers": storesWithPrices.map((store: any) => {
              // Extract price value
              const priceValue = parseFloat(store.price?.replace(/[£$]/g, '') || '0');
              
              // Determine currency from price string or default to GBP
              const priceCurrency = store.price?.includes('$') ? 'USD' : 
                                   store.price?.includes('€') ? 'EUR' : 
                                   store.price?.includes('£') ? 'GBP' : 'GBP';
              
              // Determine availability
              const availability = store.stock_status === 'out_of_stock' || 
                                 store.stock_status === 'unavailable' ||
                                 store.stock_status === 'sold_out'
                ? "https://schema.org/OutOfStock" 
                : "https://schema.org/InStock";
              
              // Get location/areaServed (default to UK for UK products)
              const areaServed = store.country || store.location || "GB";
              
              return {
                "@type": "Offer",
                "url": store.url || `https://nicotine-pouches.org/product/${resolvedParams.slug}`,
                "priceCurrency": priceCurrency,
                "price": priceValue.toFixed(2),
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "itemCondition": "https://schema.org/NewCondition",
                "availability": availability,
                "areaServed": {
                  "@type": "Country",
                  "name": areaServed === "GB" ? "United Kingdom" : areaServed === "US" ? "United States" : areaServed
                },
                "seller": {
                  "@type": "Organization",
                  "name": store.name,
                  "url": store.website || store.url || undefined
                }
              };
            })
          };
        })() : undefined);
        
        // Debug: Log offers data before passing to schema
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Generating AggregateRating schema with offers:', {
            productName: product.name,
            imageUrl: imageUrl,
            offersData: finalOffersData ? {
              type: finalOffersData['@type'],
              offerCount: finalOffersData.offerCount,
              lowPrice: finalOffersData.lowPrice,
              highPrice: finalOffersData.highPrice,
              individualOffersCount: finalOffersData.offers?.length || 0,
              firstOffer: finalOffersData.offers?.[0] ? {
                url: finalOffersData.offers[0].url,
                price: finalOffersData.offers[0].price,
                priceCurrency: finalOffersData.offers[0].priceCurrency,
                availability: finalOffersData.offers[0].availability,
                areaServed: finalOffersData.offers[0].areaServed
              } : null
            } : null,
            storesCount: product.stores?.length || 0
          });
        }
        
        return generateStandaloneAggregateRating(
          'Product', 
          product.name, 
          ratingData.aggregateRating,
          {
            name: product.name,
            image: imageUrl,
            description: description,
            brand: product.brand,
            sku: skuValue,
            mpn: mpnValue,
            offers: finalOffersData,
            aggregateRating: ratingData.aggregateRating
          }
        );
      })()}
      
      {/* Breadcrumb Schema */}
      {generateBreadcrumbSchema(breadcrumbs)}
      
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
      
      {/* Hreflang Meta Tags - UK products only, no cross-region links (UK/US have different product catalogs) */}
      {generateSafeHreflang(generateProductHreflang(resolvedParams.slug, false, false)).map((entry) => (
        <link key={entry.lang} rel="alternate" hrefLang={entry.lang} href={entry.url} />
      ))}
      
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
          /* Desktop defaults - hide mobile elements */
          .strength-selector-mobile {
            display: none;
          }
          .price-summary-mobile {
            display: none;
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
            .product-info-mobile {
              flex: 1 !important;
              min-width: 0 !important;
            }
            .strength-selector-wrapper {
              display: none !important;
            }
            .strength-selector-mobile {
              display: none !important;
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
            .price-summary-mobile {
              display: block !important;
            }
            .rating-badge-mobile {
              display: flex !important;
            }
            .breadcrumb-link:hover {
              text-decoration: underline !important;
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
            .variant-button {
              font-size: 0.65rem !important;
              padding: 2px 4px !important;
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
            .product-info-mobile {
              flex: 1 !important;
              min-width: 0 !important;
            }
            .product-title {
              font-size: 1.2rem !important;
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
            .product-title {
              font-size: 1.1rem !important;
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
              padding: 10px 12px !important;
            }
            .main-content-layout {
              padding: 0 !important;
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
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{
            backgroundColor: '#ffffff',
            padding: '0'
          }}>
            <div className="content-container" style={{
              padding: '12px 0',
              fontSize: '15px',
              color: '#6b7280',
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
            }}>
              <Link href="/" className="breadcrumb-link" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
              <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
              <Link href="/products" className="breadcrumb-link" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '400' }}>Products</Link>
              <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
              <span style={{ color: '#6b7280', fontWeight: '400' }}>{product.name}</span>
            </div>
          </div>

          {/* Product Hero Section */}
          <div className="product-hero" style={{
            backgroundColor: '#ffffff',
            padding: '16px 0 0 0'
          }}>
            {/* Hero with Ad Sidebar */}
            <div className="content-container" style={{
              display: 'flex',
              gap: '24px'
            }}>
              {/* Left - Product Content */}
              <div style={{ flex: '1', minWidth: 0 }}>
                <div className="product-hero-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '280px 1fr',
                  gap: '32px',
                  alignItems: 'start'
                }}>

                  {/* Mobile: Top Row with Image + Basic Info */}
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
                      {/* Rating Badge - Mobile */}
                      <div className="rating-badge-mobile" style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '-4px',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '4px 8px',
                        display: 'none',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                        fontSize: '13px',
                        fontWeight: '600',
                        zIndex: 10
                      }}>
                        <span style={{ color: '#fbbc04' }}>★</span>
                        <span style={{ color: '#202124' }}>
                          {(() => {
                            const vendorRatings = product.stores
                              ?.map((s: any) => parseFloat(s.trustpilot_score || s.rating || 0))
                              .filter((r: number) => r > 0) || [];
                            const avg = vendorRatings.length > 0
                              ? vendorRatings.reduce((sum: number, r: number) => sum + r, 0) / vendorRatings.length
                              : 4.5;
                            return avg.toFixed(1);
                          })()}
                        </span>
                      </div>
                      <Image
                        src={product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        width={280}
                        height={280}
                        style={getImageStyles(product.image || '/placeholder-product.jpg')}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="product-info-mobile">
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

                      <ProductHeroActions product={product} ratingData={ratingData} />

                      {/* Headline */}
                      {product.headline && (
                        <p style={{
                          fontSize: '15px',
                          color: '#6b7280',
                          fontWeight: '400',
                          lineHeight: '1.5',
                          marginBottom: '8px'
                        }}>
                          {product.headline}
                        </p>
                      )}

                      {/* Short Description - Hidden on mobile */}
                      <p className="product-description-desktop" style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '16px'
                      }}>
                        {(product.description_short || product.excerpt || product.description || '').replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim().substring(0, 250)}
                        {(product.description_short || product.excerpt || product.description || '').length > 250 && '...'}
                      </p>
                    </div>
                  </div>

                  {/* Mobile-only Strength Selector - positioned below image */}
                  <div className="strength-selector-mobile">
                    <StrengthSelector product={product} />
                  </div>
                </div>

                {/* Section Navigation */}
                <div style={{ marginTop: '8px' }}>
                  <ProductSectionNav />
                </div>
              </div>

              {/* Right - Hero Ad */}
              <div className="hero-ad-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px' }}>
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
          </div>

            {/* Main Content Layout - Two Columns with Grey Background */}
            <div className="comparison-section-wrapper" style={{
              backgroundColor: '#f5f5f7',
              padding: '0 0 32px 0'
            }}>
            <div className="main-content-layout content-container" style={{
              display: 'flex',
              gap: '2rem',
              paddingTop: '16px'
            }}>

              {/* Left Column - Vendor Price Comparison */}
              <div id="prices" className="vendor-comparison" style={{ flex: '1', minWidth: '0' }}>
                {/* Filter Options */}
                <div className="comparison-table-filters" style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                  position: 'relative',
                  zIndex: 100
                }}>
                {/* Combined Filter Popup */}
                <Suspense fallback={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                    border: '1px solid #e9ecef',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                    </svg>
                </div>
                }>
                  <CombinedFilterPopup
                    selectedPack={product.selectedPack}
                    selectedShipping={resolvedSearchParams.shipping || 'fastest'}
                    availablePackSizes={product.availablePackSizes}
                  />
                </Suspense>
                
                {/* Sort Filter */}
                <select id="price-sort" style={{
                  padding: '6px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
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
                <PackSizeForm selectedPack={product.selectedPack} availablePackSizes={product.availablePackSizes} />
                
                {/* Shipping Filter */}
                <ShippingFilterDropdown selectedShipping={resolvedSearchParams.shipping || 'fastest'} />
                
                {/* Review Filter */}
                <ReviewFilterDropdown />
                <ReviewFilter />
                  </div>
                  
              {/* Modern Vendor Comparison */}
              <div className="vendor-cards-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                zIndex: 1
              }}>
              {product.stores.map((store: any, storeIndex: number) => (
                <ExpandableVendorCard
                  key={storeIndex}
                  store={store}
                  storeIndex={storeIndex}
                  product={product}
                  vendorReviewCountMap={vendorReviewCountMap}
                />
              ))}
              </div>
                  </div>
                  
              {/* Right Column - AdSense Sidebar */}
              <div className="adsense-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px' }}>
                <div style={{
                  position: 'sticky',
                  top: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {/* Ad Label */}
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Advertisement
                  </div>
                  {/* Google AdSense - Vertical Ad */}
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


      {/* Minimal variant handling script - KEEP VARIANT BUTTONS ONLY */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Store data for variant selection only
            window.storesData = ${JSON.stringify(product.stores)};
            window.currentProductId = '${product.id}';
            
            // Variant button handler ONLY - pack filtering is server-side now
            document.addEventListener('DOMContentLoaded', function() {
              console.log('✅ Product Page: DOM loaded, setting up variant buttons');
              
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
              marginBottom: '0'
            }}>
              <div className="content-container" style={{
                display: 'flex',
                gap: '24px'
              }}>
                {/* Left - Reviews Content */}
                <div id="reviews" style={{ flex: '1', minWidth: 0 }}>
                  {/* Trustpilot Reviews Section - Show FIRST */}
                  {allTrustpilotReviews && allTrustpilotReviews.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        marginBottom: '1.5rem'
                      }}>
                        Vendor Reviews from Trustpilot
                      </h3>
                      <TrustpilotReviews
                        reviews={allTrustpilotReviews}
                        initialLimit={10}
                        vendorIds={product.stores?.map((s: any) => s.vendorId).filter(Boolean)}
                        totalCount={totalTrustpilotReviewCount}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '40px' }}>
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
                    <ReviewBalls rating={ratingData?.ratingValue || product.rating || 4.5} />
                  </div>
                  {ratingData && ratingData.reviewCount > 0 && (
                    <p style={{
                      fontSize: '1rem',
                      color: '#666',
                      marginTop: '10px',
                      marginBottom: '20px'
                    }}>
                      Based on {ratingData.reviewCount} {ratingData.reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  )}

                  <ReviewsDisplay productId={product.id} />

                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '1.5rem'
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

                {/* Right - Ad Sidebar */}
                <div className="reviews-ad-sidebar" style={{ flex: '0 0 300px', maxWidth: '300px' }}>
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

          {/* Product Details + Extra Info Section — sits beside ad sidebar */}
          <div id="product-details" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            marginBottom: '0'
          }}>
            <div className="content-container" style={{
              display: 'flex',
              gap: '24px'
            }}>
              {/* Left Column — all product info */}
              <div style={{ flex: '1', minWidth: 0 }}>
                {/* Product Details Card */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0B051D',
                  marginBottom: '1.5rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  Product Details
                </h3>
                <ProductDetailsCard product={product} />

                {/* Ingredients — PriceRunner table style */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#0B051D',
                      marginBottom: '16px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      Ingredients
                    </h3>
                    <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                      {product.ingredients.map((item: string, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 20px',
                          backgroundColor: i % 2 === 0 ? '#f3f4f6' : '#ffffff',
                          fontSize: '14px'
                        }}>
                          <span style={{ color: '#6b7280' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Tips — two-column PriceRunner layout */}
                {(product.usage_tips?.length > 0 || product.brand_story) && (
                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#0B051D',
                      marginBottom: '16px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      How to use
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: product.brand_story && product.usage_tips?.length > 0 ? '1fr 1fr' : '1fr',
                      gap: '24px'
                    }}>
                      {product.usage_tips && product.usage_tips.length > 0 && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                          {product.usage_tips.map((tip: string, i: number) => (
                            <div key={i} style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '14px 20px',
                              backgroundColor: i % 2 === 0 ? '#f3f4f6' : '#ffffff',
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}>
                              <span style={{ color: '#9ca3af', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ color: '#374151' }}>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {product.brand_story && (
                        <div>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#0B051D',
                            marginBottom: '12px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            About {product.brand}
                          </h4>
                          <div style={{
                            padding: '20px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.7'
                          }}>
                            {product.brand_story}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Beginner & Switcher Tips — two-column PriceRunner layout */}
                {(product.usage_beginners?.length > 0 || product.usage_switchers?.length > 0) && (
                  <div style={{ marginTop: '40px' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#0B051D',
                      marginBottom: '16px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      Getting started
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: product.usage_beginners?.length > 0 && product.usage_switchers?.length > 0 ? '1fr 1fr' : '1fr',
                      gap: '24px'
                    }}>
                      {product.usage_beginners && product.usage_beginners.length > 0 && (
                        <div>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#0B051D',
                            marginBottom: '12px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            New to pouches
                          </h4>
                          <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            {product.usage_beginners.map((tip: string, i: number) => (
                              <div key={i} style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '14px 20px',
                                backgroundColor: i % 2 === 0 ? '#f3f4f6' : '#ffffff',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                alignItems: 'flex-start'
                              }}>
                                <span style={{ color: '#10b981', fontWeight: '700', flexShrink: 0 }}>&#10003;</span>
                                <span style={{ color: '#374151' }}>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.usage_switchers && product.usage_switchers.length > 0 && (
                        <div>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#0B051D',
                            marginBottom: '12px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                          }}>
                            Switching from smoking or vaping
                          </h4>
                          <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            {product.usage_switchers.map((tip: string, i: number) => (
                              <div key={i} style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '14px 20px',
                                backgroundColor: i % 2 === 0 ? '#f3f4f6' : '#ffffff',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                alignItems: 'flex-start'
                              }}>
                                <span style={{ color: '#3b82f6', fontWeight: '700', flexShrink: 0 }}>&#8594;</span>
                                <span style={{ color: '#374151' }}>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Ad Sidebar */}
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

          {/* FAQ Section */}
          <div id="features" style={{ marginBottom: '40px' }}>
            <FAQSection faqs={
              product.faq && product.faq.length > 0
                ? product.faq.map((f: any) => ({ q: f.question, a: f.answer }))
                : (product.regularSeoData?.faq_plaintext || product.llmSeoData?.faq_plaintext || [])
            } />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div style={{ padding: '0 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
              <RelatedProductsCarousel
                products={relatedProducts}
                title={`More ${product.brand} Products`}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      {/* Filter Coordinator - Disabled due to runtime errors */}
      {/* <FilterCoordinator /> */}
      
      {/* Vendor Analytics Component */}
      <VendorAnalytics 
        productId={product.id.toString()} 
        productName={product.name} 
        region="UK" 
      />
      
        {/* Cookie Consent */}
        <CookieConsent />
        
        {/* Price Alert Signup Popup - Show on product pages */}
        <PriceAlertSignupPopup 
          key={`popup-product-${product.id}`} 
          delay={3000} 
          scrollThreshold={30} 
        />
    </div>
    </>
  );
}
