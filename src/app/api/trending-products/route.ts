import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrendingProduct {
  id: number;
  name: string;
  brand: string;
  image_url: string;
  price: string;
  original_price: string;
  store_count: number;
  tracking_count: number;
  trend_score: number;
  strength_group: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'trending'; // trending, popular, new
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const excludeNames = searchParams.get('exclude')?.split(',').map(n => n.toLowerCase().trim()) || [];
  const region = searchParams.get('region') || 'UK';

  // Determine which tables to use based on region
  // Note: US products table doesn't exist yet, so we fall back to wp_products for now
  const productsTable = 'wp_products'; // TODO: Use 'us_products' when table exists
  const currencySymbol = region === 'US' ? '$' : '£';

  try {
    // Get click/view analytics from last 7 days for trending
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase()
      .from('vendor_analytics')
      .select('product_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .in('event_type', ['vendor_click', 'vendor_exposure']);

    // Count clicks per product
    const clickCounts = new Map<number, number>();
    analyticsData?.forEach((item: any) => {
      if (item.product_id) {
        clickCounts.set(item.product_id, (clickCounts.get(item.product_id) || 0) + 1);
      }
    });

    // Fetch real price alert tracking counts (by product_id) - use admin to bypass RLS
    const adminClient = supabaseAdmin();
    const { data: priceAlerts, error: alertsError } = await adminClient
      .from('price_alerts')
      .select('product_id')
      .eq('is_active', true);

    const trackingCounts = new Map<number, number>();
    priceAlerts?.forEach((alert: any) => {
      if (alert.product_id) {
        const count = trackingCounts.get(alert.product_id) || 0;
        trackingCounts.set(alert.product_id, count + 1);
      }
    });

    // Get products with their vendor mappings - only fetch what we need
    // Max needed: offset 20 + limit 15 = 35 products after dedup, fetch 60 for buffer
    const { data: products, error: productsError } = await supabase()
      .from(productsTable)
      .select('id, name, image_url, price, created_at')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(60);

    if (productsError) throw productsError;

    // Get vendor mappings for store count and prices
    const productIds = products?.map((p: any) => p.id) || [];
    const { data: mappings } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id, vendor_id, vendor_product')
      .in('product_id', productIds);

    // Count UNIQUE stores per product and collect vendor_product + vendor_id pairs
    const storeVendors = new Map<number, Set<number>>();
    const productMappings = new Map<number, Array<{vendor_product: string, vendor_id: number}>>();
    mappings?.forEach((m: any) => {
      if (!storeVendors.has(m.product_id)) {
        storeVendors.set(m.product_id, new Set());
        productMappings.set(m.product_id, []);
      }
      storeVendors.get(m.product_id)!.add(m.vendor_id);
      if (m.vendor_product) {
        productMappings.get(m.product_id)!.push({
          vendor_product: m.vendor_product,
          vendor_id: m.vendor_id
        });
      }
    });

    // Convert to counts
    const storeCounts = new Map<number, number>();
    storeVendors.forEach((vendors, productId) => {
      storeCounts.set(productId, vendors.size);
    });

    // Get all unique vendor_product names to fetch prices
    const allVendorProductNames = Array.from(new Set(
      Array.from(productMappings.values()).flat().map(m => m.vendor_product)
    ));

    // Fetch vendor offers (discounts)
    const allVendorIds = Array.from(new Set(
      Array.from(productMappings.values()).flat().map(m => m.vendor_id)
    ));

    const { data: vendorOffers } = await supabase()
      .from('vendors')
      .select('id, offer_type, offer_value')
      .in('id', allVendorIds);

    // Create vendor discount map
    const vendorDiscounts = new Map<number, number>();
    vendorOffers?.forEach((v: any) => {
      if (v.offer_type === 'percentage_discount' && v.offer_value) {
        vendorDiscounts.set(v.id, Number(v.offer_value) / 100);
      }
    });

    // Fetch prices from vendor_products (need name + vendor_id to match)
    const lowestPrices = new Map<number, number>();
    if (allVendorProductNames.length > 0) {
      const { data: vendorPrices } = await supabase()
        .from('vendor_products')
        .select('name, vendor_id, price_1pack')
        .in('name', allVendorProductNames)
        .not('price_1pack', 'is', null);

      // Create a map of "name|vendor_id" to price (with vendor offers applied)
      const vendorProductPrices = new Map<string, number>();
      vendorPrices?.forEach((vp: any) => {
        let price = Number(String(vp.price_1pack).replace(/[£$,]/g, ''));
        if (price > 0) {
          // Apply vendor discount if exists
          const discount = vendorDiscounts.get(vp.vendor_id);
          if (discount) {
            price = price * (1 - discount);
          }
          const key = `${vp.name}|${vp.vendor_id}`;
          vendorProductPrices.set(key, price);
        }
      });

      // Find lowest price for each product
      productMappings.forEach((mappingList, productId) => {
        let lowestPrice: number | null = null;
        mappingList.forEach((mapping) => {
          const key = `${mapping.vendor_product}|${mapping.vendor_id}`;
          const price = vendorProductPrices.get(key);
          if (price && (lowestPrice === null || price < lowestPrice)) {
            lowestPrice = price;
          }
        });
        if (lowestPrice !== null) {
          lowestPrices.set(productId, lowestPrice);
        }
      });
    }

    // Process products with scores
    const processedProducts = (products || [])
      .filter((product: any) => product && product.name) // Filter out null/undefined products
      .map((product: any) => {
      const clicks = clickCounts.get(product.id) || 0;
      const stores = storeCounts.get(product.id) || 0;
      const daysSinceCreated = Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyBonus = Math.max(0, 30 - daysSinceCreated) / 30; // Bonus for products < 30 days old

      // Different scoring based on section
      let score = 0;
      if (section === 'trending') {
        // Trending: prioritize recent clicks
        score = (clicks * 0.5) + (stores * 0.3) + (recencyBonus * 0.2 * 100);
      } else if (section === 'popular') {
        // Popular: prioritize store count and total engagement
        score = (stores * 0.5) + (clicks * 0.3) + (recencyBonus * 0.2 * 100);
      } else if (section === 'new') {
        // New: prioritize recency
        score = (recencyBonus * 0.6 * 100) + (clicks * 0.2) + (stores * 0.2);
      }

      // Get tracking count from price alerts by product_id
      const trackingCount = trackingCounts.get(product.id) || 0;

      // Get lowest vendor price, fallback to wp_products.price
      const lowestVendorPrice = lowestPrices.get(product.id);
      const parsedOriginalPrice = product.price ? Number(product.price) : null;
      const originalPrice = parsedOriginalPrice && !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : null;

      // Use lowest vendor price if available, otherwise use original price
      let displayPrice = 3.99; // default fallback
      if (lowestVendorPrice && !isNaN(Number(lowestVendorPrice))) {
        displayPrice = Number(lowestVendorPrice);
      } else if (originalPrice !== null) {
        displayPrice = originalPrice;
      }

      // For strikethrough: use original price if higher than display, otherwise calculate 25% higher
      const strikethroughPrice = originalPrice !== null && originalPrice > displayPrice
        ? originalPrice
        : displayPrice * 1.25;

      return {
        id: product.id,
        name: product.name,
        brand: product.name?.split(' ')[0] || 'Unknown',
        image_url: product.image_url,
        price: `${currencySymbol}${Number(displayPrice).toFixed(2)}`,
        original_price: `${currencySymbol}${Number(strikethroughPrice).toFixed(2)}`,
        store_count: stores,
        tracking_count: trackingCount, // Real tracking count from price alerts
        trend_score: score,
        strength_group: 'Normal',
        created_at: product.created_at
      };
    });

    // Sort by score and apply pagination
    processedProducts.sort((a: any, b: any) => b.trend_score - a.trend_score);

    // Deduplicate by product name (keep the one with highest score)
    // Also exclude products that were already shown in another section
    const seenNames = new Set<string>(excludeNames);
    const uniqueProducts = processedProducts.filter((product: any) => {
      const normalizedName = product.name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) {
        return false;
      }
      seenNames.add(normalizedName);
      return true;
    });

    // Get total count before slicing
    const total = uniqueProducts.length;

    // Apply offset and limit
    const paginatedProducts = uniqueProducts.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      total,
      section,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
