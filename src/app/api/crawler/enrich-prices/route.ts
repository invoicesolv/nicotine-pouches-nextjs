import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// API Key for crawler authentication
const CRAWLER_API_KEY = (process.env.CRAWLER_API_KEY || '').trim();

// Debug: Log if API key is loaded (first 10 chars only for security)
if (typeof process !== 'undefined' && process.env) {
  console.log('CRAWLER_API_KEY loaded:', CRAWLER_API_KEY ? `${CRAWLER_API_KEY.substring(0, 10)}...` : 'NOT SET');
}

interface ScrapedProduct {
  url: string;
  productName: string;
  price1Pack: string;
  price15Pack: string;
  price30Pack: string;
  price50Pack: string;
  price100Pack: string;
  stockStatus?: string; // Optional stock status field
  inStock?: boolean; // Optional in stock boolean
}

// Helper function to clean and parse price
function parsePrice(price: string | null | undefined): string | null {
  if (!price) return null;
  
  const priceStr = price.trim();
  
  // Check for out of stock indicators (case-insensitive)
  const outOfStockPatterns = [
    'out of stock',
    'out-of-stock',
    'outofstock',
    'unavailable',
    'sold out',
    'soldout',
    'not available',
    'n/a'
  ];
  
  if (outOfStockPatterns.some(pattern => priceStr.toLowerCase() === pattern)) {
    return null; // Return null to indicate no price (out of stock)
  }
  
  // Remove currency symbols and whitespace
  const cleaned = priceStr.replace(/[€£$,\s]/g, '').trim();
  
  // If empty after cleaning, return null
  if (!cleaned || cleaned === '') {
    return null;
  }
  
  return cleaned;
}

// Helper function to find vendor ID by name
async function getVendorId(vendorName: string): Promise<number | null> {
  const { data, error } = await supabaseAdmin()
    .from('vendors')
    .select('id')
    .ilike('name', `%${vendorName}%`)
    .limit(1)
    .single();

  if (error || !data) {
    console.error(`Error finding vendor ${vendorName}:`, error);
    return null;
  }

  return data.id;
}

// Cache for mappings per vendor (to avoid fetching repeatedly)
const mappingsCache = new Map<number, Array<{ vendor_product: string; product_id: number }>>();
const usMappingsCache = new Map<string, Array<{ vendor_product: string; product_id: number }>>();

// Helper function to get mappings for a vendor (with caching)
async function getVendorMappings(vendorId: number): Promise<Array<{ vendor_product: string; product_id: number }> | null> {
  // Check cache first
  if (mappingsCache.has(vendorId)) {
    return mappingsCache.get(vendorId)!;
  }

  // Fetch from database
  const { data: mappings, error: mappingError } = await supabaseAdmin()
    .from('vendor_product_mapping')
    .select('vendor_product, product_id')
    .eq('vendor_id', vendorId);

  if (mappingError) {
    console.error('Error fetching vendor mappings:', mappingError);
    return null;
  }

  if (!mappings || mappings.length === 0) {
    console.log(`No mappings found for vendor ${vendorId}`);
    return null;
  }

  // Cache the mappings
  mappingsCache.set(vendorId, mappings);
  return mappings;
}

// Helper function to get US vendor mappings (with caching)
async function getUSVendorMappings(usVendorId: string): Promise<Array<{ vendor_product: string; product_id: number }> | null> {
  // Check cache first
  if (usMappingsCache.has(usVendorId)) {
    return usMappingsCache.get(usVendorId)!;
  }

  // Fetch from database
  const { data: mappings, error: mappingError } = await supabaseAdmin()
    .from('us_vendor_product_mapping')
    .select('vendor_product, product_id')
    .eq('us_vendor_id', usVendorId);

  if (mappingError) {
    console.error('Error fetching US vendor mappings:', mappingError);
    return null;
  }

  if (!mappings || mappings.length === 0) {
    console.log(`No mappings found for US vendor ${usVendorId}`);
    return null;
  }

  // Cache the mappings
  usMappingsCache.set(usVendorId, mappings);
  return mappings;
}

// Helper function to find US vendor product using vendor mapping
async function findUSVendorProduct(productName: string, usVendorId: string) {
  // Step 1: Get mappings (cached)
  const mappings = await getUSVendorMappings(usVendorId);

  if (!mappings || mappings.length === 0) {
    return null;
  }

  // Step 2: Find the best matching vendor_product from mappings
  const normalizedScrapedName = productName.trim().toLowerCase();

  // Helper function to normalize product names for better matching
  const normalizeForMatching = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\[.*?\]/g, '') // Remove [16 mg] style brackets
      .replace(/\(.*?\)/g, '') // Remove (40pcs) style parentheses
      .replace(/\d+mg/g, '') // Remove strength like "16mg", "11mg"
      .replace(/\d+\s*mg/g, '') // Remove "16 mg" with space
      .replace(/s\d+/g, '') // Remove strength codes like "S4", "S3"
      .replace(/no\.\d+/g, '') // Remove "No.9", "No.5"
      .replace(/nicotine\s*pouches?/gi, '') // Remove "Nicotine Pouches"
      .replace(/&/g, '') // Remove &
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const normalizedScraped = normalizeForMatching(productName);

  let bestMatch: { vendor_product: string; product_id: number } | null = null;

  // Exact match (case-insensitive)
  bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) =>
    m.vendor_product && m.vendor_product.trim().toLowerCase() === normalizedScrapedName
  ) || null;

  // Normalized match (removes strength, brackets, etc.)
  if (!bestMatch) {
    bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) => {
      if (!m.vendor_product) return false;
      const normalizedMapped = normalizeForMatching(m.vendor_product);
      return normalizedMapped === normalizedScraped;
    }) || null;
  }

  // Partial match if no exact match
  if (!bestMatch) {
    bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) => {
      if (!m.vendor_product) return false;
      const normalizedMapped = normalizeForMatching(m.vendor_product);
      const scrapedWords = normalizedScraped.split(/\s+/).filter(w => w.length > 2);
      const mappedWords = normalizedMapped.split(/\s+/).filter(w => w.length > 2);
      const commonWords = scrapedWords.filter(w => mappedWords.includes(w));

      if (commonWords.length >= 2) {
        return true;
      }

      return normalizedMapped.includes(normalizedScraped) ||
             normalizedScraped.includes(normalizedMapped);
    }) || null;
  }

  if (!bestMatch) {
    console.log(`No US mapping match found for product: ${productName}`);
    return null;
  }

  // Step 3: Find the vendor_product entry in us_vendor_products_new
  const { data: vpList, error: vpError } = await supabaseAdmin()
    .from('us_vendor_products_new')
    .select('id, name, url, price_1pack')
    .eq('us_vendor_id', usVendorId)
    .eq('name', bestMatch.vendor_product);

  if (vpError || !vpList || vpList.length === 0) {
    // If exact match fails, try case-insensitive
    const { data: vpList2, error: vpError2 } = await supabaseAdmin()
      .from('us_vendor_products_new')
      .select('id, name, url, price_1pack')
      .eq('us_vendor_id', usVendorId)
      .ilike('name', bestMatch.vendor_product);

    if (vpError2 || !vpList2 || vpList2.length === 0) {
      console.log(`US vendor product not found for mapped name: ${bestMatch.vendor_product}`);
      return null;
    }

    if (vpList2.length > 1) {
      console.log(`⚠️ Found ${vpList2.length} duplicate US entries for "${bestMatch.vendor_product}"`);
    }
    return { ...vpList2[0], mappedName: bestMatch.vendor_product };
  }

  if (vpList.length > 1) {
    console.log(`⚠️ Found ${vpList.length} duplicate US entries for "${bestMatch.vendor_product}"`);
  }

  return { ...vpList[0], mappedName: bestMatch.vendor_product };
}

// Helper function to find vendor product using vendor mapping
async function findVendorProduct(productName: string, vendorId: number) {
  // Step 1: Get mappings (cached)
  const mappings = await getVendorMappings(vendorId);
  
  if (!mappings || mappings.length === 0) {
    return null;
  }

  // Step 2: Find the best matching vendor_product from mappings
  // Try exact match first, then case-insensitive, then smart partial match
  const normalizedScrapedName = productName.trim().toLowerCase();
  
  // Helper function to normalize product names for better matching
  const normalizeForMatching = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\[.*?\]/g, '') // Remove [16 mg] style brackets
      .replace(/\(.*?\)/g, '') // Remove (40pcs) style parentheses
      .replace(/\d+mg/g, '') // Remove strength like "16mg", "11mg"
      .replace(/\d+\s*mg/g, '') // Remove "16 mg" with space
      .replace(/s\d+/g, '') // Remove strength codes like "S4", "S3"
      .replace(/no\.\d+/g, '') // Remove "No.9", "No.5"
      .replace(/hypèr|hyper|extra|strong|regular|mini|slim|ultra/gi, '') // Remove common strength descriptors
      .replace(/nicotine\s*pouches?/gi, '') // Remove "Nicotine Pouches"
      .replace(/caffeine\s*pouches?/gi, '') // Remove "Caffeine Pouches"
      .replace(/&/g, '') // Remove &
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const normalizedScraped = normalizeForMatching(productName);
  
  let bestMatch: { vendor_product: string; product_id: number } | null = null;
  
  // Exact match (case-insensitive)
  bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) => 
    m.vendor_product && m.vendor_product.trim().toLowerCase() === normalizedScrapedName
  ) || null;

  // Normalized match (removes strength, brackets, etc.)
  if (!bestMatch) {
    bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) => {
      if (!m.vendor_product) return false;
      const normalizedMapped = normalizeForMatching(m.vendor_product);
      return normalizedMapped === normalizedScraped;
    }) || null;
  }

  // Partial match if no exact match
  if (!bestMatch) {
    bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) => {
      if (!m.vendor_product) return false;
      const normalizedMapped = normalizeForMatching(m.vendor_product);
      // Check if key words match (at least 3 words in common)
      const scrapedWords = normalizedScraped.split(/\s+/).filter(w => w.length > 2);
      const mappedWords = normalizedMapped.split(/\s+/).filter(w => w.length > 2);
      const commonWords = scrapedWords.filter(w => mappedWords.includes(w));
      
      // If we have at least 2 common meaningful words, it's a match
      if (commonWords.length >= 2) {
        return true;
      }
      
      // Fallback to substring match
      return normalizedMapped.includes(normalizedScraped) || 
             normalizedScraped.includes(normalizedMapped);
    }) || null;
  }

  if (!bestMatch) {
    console.log(`No mapping match found for product: ${productName}`);
    return null;
  }

  // Step 3: Find ALL vendor_product entries using the mapped vendor_product name
  // This handles cases where duplicates exist - we'll update all of them
  const { data: vpList, error: vpError } = await supabaseAdmin()
    .from('vendor_products')
    .select('id, name, url')
    .eq('vendor_id', vendorId)
    .eq('name', bestMatch.vendor_product);

  if (vpError || !vpList || vpList.length === 0) {
    // If exact match fails, try case-insensitive
    const { data: vpList2, error: vpError2 } = await supabaseAdmin()
      .from('vendor_products')
      .select('id, name, url')
      .eq('vendor_id', vendorId)
      .ilike('name', bestMatch.vendor_product);

    if (vpError2 || !vpList2 || vpList2.length === 0) {
      console.log(`Vendor product not found for mapped name: ${bestMatch.vendor_product}`);
      return null;
    }

    // Return the first one for compatibility, but log if duplicates exist
    if (vpList2.length > 1) {
      console.log(`⚠️ Found ${vpList2.length} duplicate entries for "${bestMatch.vendor_product}" (vendor_id: ${vendorId}). All will be updated.`);
    }
    return vpList2[0]; // Return first for compatibility, but we'll update all
  }

  // Log if duplicates exist
  if (vpList.length > 1) {
    console.log(`⚠️ Found ${vpList.length} duplicate entries for "${bestMatch.vendor_product}" (vendor_id: ${vendorId}). All will be updated.`);
  }

  return vpList[0]; // Return first for compatibility, but we'll update all
}

// Authenticate the request
function authenticateRequest(request: NextRequest): boolean {
  if (!CRAWLER_API_KEY || CRAWLER_API_KEY.length === 0) {
    console.error('CRAWLER_API_KEY is not set in environment variables');
    return false;
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === CRAWLER_API_KEY) {
      return true;
    }
    // Debug logging
    console.log('Auth header token mismatch:', {
      received: token.substring(0, 10) + '...',
      expected: CRAWLER_API_KEY.substring(0, 10) + '...',
      lengths: { received: token.length, expected: CRAWLER_API_KEY.length },
      exactMatch: token === CRAWLER_API_KEY
    });
  }

  // Check query parameter
  const apiKey = request.nextUrl.searchParams.get('apiKey');
  if (apiKey) {
    const trimmedKey = apiKey.trim();
    if (trimmedKey === CRAWLER_API_KEY) {
      return true;
    }
    console.log('Query param key mismatch:', {
      received: trimmedKey.substring(0, 10) + '...',
      expected: CRAWLER_API_KEY.substring(0, 10) + '...',
      lengths: { received: trimmedKey.length, expected: CRAWLER_API_KEY.length }
    });
  }

  // Debug logging
  if (!authHeader && !apiKey) {
    console.log('No auth header or query parameter provided');
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Log API key status (for debugging - remove in production)
    console.log('=== CRAWLER API AUTH DEBUG ===');
    console.log('CRAWLER_API_KEY exists:', !!CRAWLER_API_KEY);
    console.log('CRAWLER_API_KEY length:', CRAWLER_API_KEY?.length || 0);
    console.log('CRAWLER_API_KEY first 10:', CRAWLER_API_KEY?.substring(0, 10) || 'NOT SET');
    
    // Authenticate
    if (!authenticateRequest(request)) {
      const authHeader = request.headers.get('authorization');
      const apiKeyParam = request.nextUrl.searchParams.get('apiKey');
      const hasKey = !!CRAWLER_API_KEY;
      
      // Extract token from header for debugging
      let receivedToken = null;
      if (authHeader) {
        receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      }
      
      console.log('=== AUTH FAILED DEBUG ===');
      console.log('Has auth header:', !!authHeader);
      console.log('Has API key param:', !!apiKeyParam);
      console.log('API key configured:', hasKey);
      console.log('Received token length:', receivedToken?.length || 0);
      console.log('Received token first 10:', receivedToken?.substring(0, 10) || 'N/A');
      console.log('Expected key first 10:', CRAWLER_API_KEY?.substring(0, 10) || 'NOT SET');
      console.log('Tokens match:', receivedToken === CRAWLER_API_KEY);
      
      return NextResponse.json(
        { 
          error: 'Unauthorized. Invalid API key.',
          debug: {
            hasAuthHeader: !!authHeader,
            hasApiKeyParam: !!apiKeyParam,
            apiKeyConfigured: hasKey,
            receivedTokenLength: receivedToken?.length || 0,
            expectedKeyLength: CRAWLER_API_KEY?.length || 0,
            tokensMatch: receivedToken === CRAWLER_API_KEY
          }
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Authentication successful');

    // Clear mappings cache for this request
    mappingsCache.clear();

    const body = await request.json();
    const { vendorName, products, vendorId, region = 'UK' } = body;

    // Validate required fields
    if (!vendorName && !vendorId) {
      return NextResponse.json(
        { error: 'vendorName or vendorId is required' },
        { status: 400 }
      );
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'products array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check if this is a US region request (UUID vendor ID or explicit region)
    const isUSRegion = region === 'US' || (vendorId && typeof vendorId === 'string' && vendorId.includes('-'));
    console.log(`🔍 Region check: region=${region}, vendorId=${vendorId}, isUSRegion=${isUSRegion}`);

    // Handle US region - update us_vendor_products_new table with mapping support
    if (isUSRegion) {
      console.log('🇺🇸 Processing US region request with vendorId:', vendorId);
      const usVendorId = vendorId;

      // Clear US mappings cache for fresh data
      usMappingsCache.clear();

      const results = {
        success: 0,
        failed: 0,
        updated: 0,
        created: 0,
        errors: [] as Array<{ product: string; error: string }>,
        price_drops: [] as Array<{ productName: string; product_name: string; oldPrice: string; newPrice: string; url: string }>
      };

      for (const product of products) {
        try {
          const productName = product.productName || product['Product Name'];
          const rawUrl = product.url || product.URL;
          const url = rawUrl && typeof rawUrl === 'string' ? rawUrl.trim() : null;

          // Parse US pack prices (support both formats)
          const price1Pack = parsePrice(product.price1Pack || product['1-pack']);
          const price3Pack = parsePrice(product.price3Pack || product['3-pack']);
          const price5Pack = parsePrice(product.price5Pack || product['5-pack']);
          const price10Pack = parsePrice(product.price10Pack || product['10-pack']);
          const price20Pack = parsePrice(product.price20Pack || product['20-pack']);
          const price25Pack = parsePrice(product.price25Pack || product['25-pack']);
          const price30Pack = parsePrice(product.price30Pack || product['30-pack']);
          const price50Pack = parsePrice(product.price50Pack || product['50-pack']);

          if (!productName) {
            results.failed++;
            results.errors.push({ product: 'Unknown', error: 'Product name is required' });
            continue;
          }

          // Check for out of stock
          const rawPrices = [
            product.price1Pack || product['1-pack'],
            product.price3Pack || product['3-pack'],
            product.price5Pack || product['5-pack'],
            product.price10Pack || product['10-pack'],
            product.price20Pack || product['20-pack'],
            product.price25Pack || product['25-pack'],
            product.price30Pack || product['30-pack'],
            product.price50Pack || product['50-pack']
          ].filter(p => p !== undefined && p !== null);

          const allOutOfStock = rawPrices.length > 0 && rawPrices.every(p => {
            const pStr = p.toString().trim().toLowerCase();
            return pStr === 'out of stock' || pStr === 'unavailable' || pStr === 'sold out' || pStr === 'n/a';
          });

          // Check explicit out of stock fields
          const explicitOutOfStock = product.outOfStock === true ||
                                     product.outOfStock === 'true' ||
                                     product.out_of_stock === true ||
                                     product.out_of_stock === 'true';

          // Find existing product using mapping
          console.log(`🔍 US: Looking for "${productName}" with vendor ${usVendorId}`);
          const existingProduct = await findUSVendorProduct(productName, usVendorId);

          if (existingProduct) {
            // Check for price drop
            if (price1Pack !== null && existingProduct.price_1pack) {
              const oldPrice = parseFloat(existingProduct.price_1pack);
              const newPrice = parseFloat(price1Pack);
              if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice) {
                console.log(`💰 US Price drop: "${productName}": $${oldPrice} → $${newPrice}`);
                results.price_drops.push({
                  productName, product_name: productName,
                  oldPrice: `$${oldPrice.toFixed(2)}`,
                  newPrice: `$${newPrice.toFixed(2)}`,
                  url: url || existingProduct.url || ''
                });
              }
            }

            // Build update data
            const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
            if (price1Pack !== null) updateData.price_1pack = parseFloat(price1Pack);
            if (price3Pack !== null) updateData.price_3pack = parseFloat(price3Pack);
            if (price5Pack !== null) updateData.price_5pack = parseFloat(price5Pack);
            if (price10Pack !== null) updateData.price_10pack = parseFloat(price10Pack);
            if (price20Pack !== null) updateData.price_20pack = parseFloat(price20Pack);
            if (price25Pack !== null) updateData.price_25pack = parseFloat(price25Pack);
            if (price30Pack !== null) updateData.price_30pack = parseFloat(price30Pack);
            if (price50Pack !== null) updateData.price_50pack = parseFloat(price50Pack);
            if (url) updateData.url = url;

            // Determine stock status
            if (explicitOutOfStock || allOutOfStock) {
              updateData.stock_status = 'out_of_stock';
              console.log(`📦 US Product "${productName}" marked as OUT OF STOCK`);
            } else {
              updateData.stock_status = 'in_stock';
            }

            // Update all products with matching vendor_id and name (handles duplicates)
            const mappedName = existingProduct.mappedName || productName;
            const { data: updatedProducts, error: updateError } = await supabaseAdmin()
              .from('us_vendor_products_new')
              .update(updateData)
              .eq('us_vendor_id', usVendorId)
              .eq('name', mappedName)
              .select('id');

            if (updateError) {
              results.failed++;
              results.errors.push({ product: productName, error: updateError.message });
            } else {
              const updateCount = updatedProducts?.length || 0;
              if (updateCount > 1) {
                console.log(`✅ US: Updated ${updateCount} duplicate entries for "${productName}"`);
              }
              results.success++;
              results.updated += updateCount || 1;
              console.log(`✅ US: Updated "${productName}" (mapped to "${mappedName}")`);
            }
          } else {
            // Product not found in mapping - log detailed error
            results.failed++;
            results.errors.push({
              product: productName,
              error: 'Product not found in us_vendor_product_mapping. Please add it to us_vendor_product_mapping first.'
            });
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push({ product: product.productName || 'Unknown', error: error.message });
        }
      }

      return NextResponse.json({
        success: true,
        vendorId: usVendorId,
        region: 'US',
        summary: {
          total: products.length,
          success: results.success,
          failed: results.failed,
          updated: results.updated,
          created: results.created
        },
        price_drops: results.price_drops.length > 0 ? results.price_drops : undefined,
        errors: results.errors.length > 0 ? results.errors : undefined
      });
    }

    // UK region - original logic
    // Get vendor ID
    let finalVendorId: number;
    if (vendorId) {
      finalVendorId = parseInt(vendorId);
    } else {
      const foundVendorId = await getVendorId(vendorName);
      if (!foundVendorId) {
        return NextResponse.json(
          { error: `Vendor "${vendorName}" not found` },
          { status: 404 }
        );
      }
      finalVendorId = foundVendorId;
    }

    const results = {
      success: 0,
      failed: 0,
      updated: 0,
      created: 0,
      errors: [] as Array<{ product: string; error: string }>,
      price_drops: [] as Array<{ productName: string; product_name: string; oldPrice: string; newPrice: string; url: string }>
    };

    // Process each product
    for (const product of products) {
      try {
        const productName = product.productName || product['Product Name'];
        const rawUrl = product.url || product.URL;
        // Trim and validate URL - only update if it's a non-empty string
        const url = rawUrl && typeof rawUrl === 'string' ? rawUrl.trim() : null;
        
        // Debug logging for URL handling
        if (!url || url.length === 0) {
          console.log(`⚠️  No URL for product: ${productName}`, {
            hasUrlField: 'url' in product,
            hasURLField: 'URL' in product,
            urlValue: product.url,
            URLValue: product.URL,
            rawUrl: rawUrl
          });
        }
        const price1Pack = parsePrice(product.price1Pack || product['1-pack']);
        const price3Pack = parsePrice(product.price3Pack || product['3-pack']);
        const price5Pack = parsePrice(product.price5Pack || product['5-pack']);
        const price10Pack = parsePrice(product.price10Pack || product['10-pack']);
        const price15Pack = parsePrice(product.price15Pack || product['15-pack']);
        const price20Pack = parsePrice(product.price20Pack || product['20-pack']);
        const price30Pack = parsePrice(product.price30Pack || product['30-pack']);
        const price50Pack = parsePrice(product.price50Pack || product['50-pack']);
        const price100Pack = parsePrice(product.price100Pack || product['100-pack']);
        
        // Check if all prices are "Out of stock" strings (as per crawler documentation)
        // The crawler sends "Out of stock" in all pack size fields when product is unavailable
        const rawPrices = [
          product.price1Pack || product['1-pack'],
          product.price3Pack || product['3-pack'],
          product.price5Pack || product['5-pack'],
          product.price10Pack || product['10-pack'],
          product.price15Pack || product['15-pack'],
          product.price20Pack || product['20-pack'],
          product.price30Pack || product['30-pack'],
          product.price50Pack || product['50-pack'],
          product.price100Pack || product['100-pack']
        ].filter(p => p !== undefined && p !== null); // Only check fields that exist
        
        // Check if all provided prices are "Out of stock" (case-insensitive)
        const allOutOfStock = rawPrices.length > 0 && rawPrices.every(p => {
          const pStr = p.toString().trim().toLowerCase();
          return pStr === 'out of stock' || pStr === 'out-of-stock' || pStr === 'outofstock' || 
                 pStr === 'unavailable' || pStr === 'sold out' || pStr === 'soldout' || pStr === 'n/a';
        });
        
        // Handle stock status - check if product is out of stock
        // Check multiple possible fields: stockStatus, stock_status, inStock, in_stock, outOfStock, out_of_stock
        // Accept explicit "out of stock" fields from crawler
        const explicitOutOfStock = product.outOfStock === true || 
                                   product.outOfStock === 'true' ||
                                   product.out_of_stock === true ||
                                   product.out_of_stock === 'true' ||
                                   product.isOutOfStock === true ||
                                   product.isOutOfStock === 'true' ||
                                   product.is_out_of_stock === true ||
                                   product.is_out_of_stock === 'true';
        
        const stockStatus = product.stockStatus || product.stock_status || product.inStock !== undefined ? (product.inStock === false || product.inStock === 'false' ? 'out_of_stock' : 'in_stock') : null;
        const isOutOfStock = allOutOfStock || 
                            explicitOutOfStock ||
                            stockStatus === 'out_of_stock' || 
                            (product.inStock === false || product.inStock === 'false') ||
                            (product.stockStatus && (product.stockStatus.toLowerCase().includes('out') || product.stockStatus.toLowerCase() === 'unavailable'));

        if (!productName) {
          results.failed++;
          results.errors.push({
            product: 'Unknown',
            error: 'Product name is required'
          });
          continue;
        }

        // Find existing vendor product
        const existingProduct = await findVendorProduct(productName, finalVendorId);

        const updateData: any = {};
        
        // Update prices if provided
        if (price1Pack !== null) updateData.price_1pack = price1Pack;
        if (price3Pack !== null) updateData.price_3pack = price3Pack;
        if (price5Pack !== null) updateData.price_5pack = price5Pack;
        if (price10Pack !== null) updateData.price_10pack = price10Pack;
        if (price15Pack !== null) updateData.price_15pack = price15Pack;
        if (price20Pack !== null) updateData.price_20pack = price20Pack;
        if (price30Pack !== null) updateData.price_30pack = price30Pack;
        if (price50Pack !== null) updateData.price_50pack = price50Pack;
        if (price100Pack !== null) updateData.price_100pack = price100Pack;
        
        // Update URL if provided and not empty
        if (url && url.length > 0) {
          updateData.url = url;
          console.log(`Updating URL for ${productName}: ${url.substring(0, 50)}...`);
        } else {
          console.log(`No URL provided for ${productName} (url was: ${rawUrl})`);
        }
        
        // Update stock_status if provided or if we detected out of stock
        // Check if all prices are null (likely out of stock)
        const allPricesNull = price1Pack === null && price3Pack === null && price5Pack === null && 
                             price10Pack === null && price15Pack === null && price20Pack === null &&
                             price30Pack === null && price50Pack === null && price100Pack === null;
        
        // Determine stock status
        // IMPORTANT: Crawler sends "Out of stock" as STRING values in all pack size fields when unavailable
        // parsePrice() converts these strings to null, but we check rawPrices for "Out of stock" detection
        
        // Check if we have valid prices (not null, not "out of stock" strings)
        // parsePrice() returns null for "Out of stock" strings, so hasValidPrices will be false
        const hasValidPrices = price1Pack !== null || price3Pack !== null || price5Pack !== null || 
                               price10Pack !== null || price15Pack !== null || price20Pack !== null ||
                               price30Pack !== null || price50Pack !== null || price100Pack !== null;
        
        // DEFAULT: Mark as IN STOCK unless crawler explicitly says otherwise
        // Priority 1: If crawler sent explicit "out of stock" field (outOfStock, out_of_stock, isOutOfStock, etc.)
        // This takes highest priority - crawler explicitly says product is out of stock
        if (explicitOutOfStock) {
          updateData.stock_status = 'out_of_stock';
          console.log(`📦 Product "${productName}" marked as OUT OF STOCK (crawler sent explicit outOfStock/out_of_stock field)`);
        }
        // Priority 2: If crawler sent "Out of stock" strings in ALL price fields, mark as out_of_stock
        // This handles the documented behavior: all pack sizes contain "Out of stock" string
        else if (allOutOfStock) {
          updateData.stock_status = 'out_of_stock';
          console.log(`📦 Product "${productName}" marked as OUT OF STOCK (crawler sent "Out of stock" strings in all pack size fields)`);
        } 
        // DEFAULT: Everything else is IN STOCK
        // If we have valid prices, product is IN STOCK
        // If no prices but crawler didn't say out of stock, product is IN STOCK
        // If all prices are null but crawler didn't say out of stock, product is IN STOCK
        else {
          updateData.stock_status = 'in_stock';
          if (hasValidPrices) {
            console.log(`✅ Product "${productName}" marked as IN STOCK (has valid prices: ${[price1Pack, price3Pack, price5Pack, price10Pack, price15Pack, price20Pack, price30Pack, price50Pack, price100Pack].filter(p => p !== null).join(', ')})`);
          } else {
            console.log(`✅ Product "${productName}" marked as IN STOCK (default - crawler did not indicate out of stock)`);
          }
        }

        if (existingProduct) {
          // Update ALL existing products with the same vendor_id and name (handles duplicates)
          // First, find the mapped vendor_product name to match against
          const mappings = await getVendorMappings(finalVendorId);
          const normalizedScrapedName = productName.trim().toLowerCase();

          // Helper function to normalize product names (same as in findVendorProduct)
          const normalizeForMatching = (name: string): string => {
            return name
              .toLowerCase()
              .replace(/\[.*?\]/g, '')
              .replace(/\(.*?\)/g, '')
              .replace(/\d+mg/g, '')
              .replace(/\d+\s*mg/g, '')
              .replace(/s\d+/g, '')
              .replace(/no\.\d+/g, '')
              .replace(/hypèr|hyper|extra|strong|regular|mini|slim|ultra/gi, '')
              .replace(/nicotine\s*pouches?/gi, '')
              .replace(/caffeine\s*pouches?/gi, '')
              .replace(/&/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          };

          const normalizedScraped = normalizeForMatching(productName);
          let mappedProductName = productName; // Default to scraped name

          // Find the mapped vendor_product name
          if (mappings && mappings.length > 0) {
            const bestMatch = mappings.find((m: { vendor_product: string; product_id: number }) =>
              m.vendor_product && m.vendor_product.trim().toLowerCase() === normalizedScrapedName
            ) || mappings.find((m: { vendor_product: string; product_id: number }) => {
              if (!m.vendor_product) return false;
              const normalizedMapped = normalizeForMatching(m.vendor_product);
              return normalizedMapped === normalizedScraped;
            });

            if (bestMatch) {
              mappedProductName = bestMatch.vendor_product;
            }
          }

          // Fetch current prices BEFORE updating to detect price drops
          const { data: currentProduct } = await supabaseAdmin()
            .from('vendor_products')
            .select('id, name, url, price_1pack, price_5pack, price_10pack, price_15pack, price_30pack')
            .eq('vendor_id', finalVendorId)
            .eq('name', mappedProductName)
            .limit(1)
            .single();

          // Check for price drop (compare 1-pack prices)
          if (currentProduct && price1Pack !== null && currentProduct.price_1pack) {
            const oldPrice = parseFloat(currentProduct.price_1pack);
            const newPrice = parseFloat(price1Pack);
            if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice) {
              console.log(`💰 Price drop detected for "${productName}": €${oldPrice} → €${newPrice}`);
              results.price_drops.push({
                productName: productName,
                product_name: productName,
                oldPrice: `€${oldPrice.toFixed(2)}`,
                newPrice: `€${newPrice.toFixed(2)}`,
                url: url || currentProduct.url || ''
              });
            }
          }

          // Update ALL products with matching vendor_id and name (handles duplicates)
          const { data: updatedProducts, error: updateError } = await supabaseAdmin()
            .from('vendor_products')
            .update(updateData)
            .eq('vendor_id', finalVendorId)
            .eq('name', mappedProductName)
            .select('id');

          if (updateError) {
            results.failed++;
            results.errors.push({
              product: productName,
              error: updateError.message
            });
          } else {
            const updateCount = updatedProducts?.length || 0;
            if (updateCount > 1) {
              console.log(`✅ Updated ${updateCount} duplicate entries for "${productName}"`);
            }
            results.success++;
            results.updated += updateCount || 1;
          }
        } else {
          // Product not found in vendor mapping - skip it
          results.failed++;
          results.errors.push({
            product: productName,
            error: 'Product not found in vendor mapping. Please add it to vendor_product_mapping first.'
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          product: product.productName || 'Unknown',
          error: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      vendorId: finalVendorId,
      vendorName: vendorName || `ID: ${finalVendorId}`,
      summary: {
        total: products.length,
        success: results.success,
        failed: results.failed,
        updated: results.updated,
        created: results.created
      },
      price_drops: results.price_drops.length > 0 ? results.price_drops : undefined,
      errors: results.errors.length > 0 ? results.errors : undefined
    });
  } catch (error: any) {
    console.error('Error in enrich-prices API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for authentication check
export async function GET(request: NextRequest) {
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid API key.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'API is accessible. Use POST to submit scraped data.',
    endpoint: '/api/crawler/enrich-prices',
    format: {
      vendorName: 'string (e.g., "Snusifer") - for UK vendors',
      vendorId: 'number for UK (e.g., 1) or UUID for US (e.g., "905bb09e-3c88-4ef1-ad9f-0beb12d43878")',
      region: 'string (optional: "UK" or "US", auto-detected from vendorId format)',
      products: [
        {
          productName: 'string',
          url: 'string',
          '1-pack': 'string (price)',
          '3-pack': 'string (price, optional)',
          '5-pack': 'string (price, optional)',
          '10-pack': 'string (price, optional)',
          '15-pack': 'string (price, optional)',
          '20-pack': 'string (price, optional)',
          '25-pack': 'string (price, optional)',
          '30-pack': 'string (price, optional)',
          '50-pack': 'string (price, optional)',
          '100-pack': 'string (price, optional)',
          outOfStock: 'boolean (optional, explicit out of stock flag)'
        }
      ]
    },
    usVendors: {
      'Prilla': '905bb09e-3c88-4ef1-ad9f-0beb12d43878',
      'Northerner US': 'afaac4cd-6416-425b-9373-abb632539630',
      'Nicokick': 'c9cf4e8a-eff7-4619-97f9-0cb7ea510aef'
    }
  });
}

