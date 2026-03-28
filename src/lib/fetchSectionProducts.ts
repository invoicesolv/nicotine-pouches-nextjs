import { supabase, supabaseAdmin } from '@/lib/supabase';

export interface SectionProduct {
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
  created_at?: string;
}

/**
 * Fetches products for a homepage section (popular, trending, new).
 * Can be called server-side or client-side.
 */
export async function fetchSectionProducts(
  section: 'popular' | 'trending' | 'new',
  limit: number = 12,
  offset: number = 0,
  currencySymbol: string = '£',
  locale?: string
): Promise<SectionProduct[]> {
  try {
    // For DE locale, use de_vendor_products directly (no canonical products table)
    if (locale === 'de' || locale === 'it') {
      return fetchEURegionSectionProducts(section, limit, offset, currencySymbol, locale);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const adminClient = supabaseAdmin();

    // Fetch analytics, price alerts, and products in parallel
    const [analyticsResult, alertsResult, productsResult] = await Promise.all([
      supabase()
        .from('vendor_analytics')
        .select('product_id')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .in('event_type', ['vendor_click', 'vendor_exposure'])
        .limit(5000),
      adminClient
        ? adminClient
            .from('price_alerts')
            .select('product_id')
            .eq('is_active', true)
            .limit(5000)
        : Promise.resolve({ data: [] }),
      supabase()
        .from('wp_products')
        .select('id, name, image_url, price, created_at')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(60),
    ]);

    const { data: analyticsData } = analyticsResult;
    const { data: priceAlerts } = alertsResult;
    const { data: products, error: productsError } = productsResult;

    if (productsError) {
      // Detect Cloudflare 522 / connection errors and fail fast
      if (productsError.message && (productsError.message.includes('<!DOCTYPE') || productsError.message.includes('fetch') || productsError.message.includes('abort'))) {
        console.error(`Supabase connection error in ${section} products:`, productsError.message.substring(0, 100));
        return [];
      }
      throw productsError;
    }

    // Count clicks per product
    const clickCounts = new Map<number, number>();
    analyticsData?.forEach((item: any) => {
      if (item.product_id) {
        clickCounts.set(item.product_id, (clickCounts.get(item.product_id) || 0) + 1);
      }
    });

    const trackingCounts = new Map<number, number>();
    priceAlerts?.forEach((alert: any) => {
      if (alert.product_id) {
        trackingCounts.set(alert.product_id, (trackingCounts.get(alert.product_id) || 0) + 1);
      }
    });

    // Get vendor mappings for store count and prices
    const productIds = products?.map((p: any) => p.id) || [];
    const { data: mappings } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id, vendor_id, vendor_product')
      .in('product_id', productIds);

    // Count UNIQUE stores per product
    const storeVendors = new Map<number, Set<number>>();
    const productMappings = new Map<number, Array<{ vendor_product: string; vendor_id: number }>>();
    mappings?.forEach((m: any) => {
      if (!storeVendors.has(m.product_id)) {
        storeVendors.set(m.product_id, new Set());
        productMappings.set(m.product_id, []);
      }
      storeVendors.get(m.product_id)!.add(m.vendor_id);
      if (m.vendor_product) {
        productMappings.get(m.product_id)!.push({
          vendor_product: m.vendor_product,
          vendor_id: m.vendor_id,
        });
      }
    });

    const storeCounts = new Map<number, number>();
    storeVendors.forEach((vendors, productId) => {
      storeCounts.set(productId, vendors.size);
    });

    // Get all unique vendor_product names and vendor IDs
    const allVendorProductNames = Array.from(
      new Set(Array.from(productMappings.values()).flat().map((m) => m.vendor_product))
    );
    const allVendorIds = Array.from(
      new Set(Array.from(productMappings.values()).flat().map((m) => m.vendor_id))
    );

    // Fetch vendor offers and vendor prices in parallel
    const [vendorOffersResult, vendorPricesResult] = await Promise.all([
      supabase().from('vendors').select('id, offer_type, offer_value').in('id', allVendorIds),
      allVendorProductNames.length > 0
        ? supabase()
            .from('vendor_products')
            .select('name, vendor_id, price_1pack')
            .in('name', allVendorProductNames)
            .not('price_1pack', 'is', null)
        : Promise.resolve({ data: [] }),
    ]);

    // Create vendor discount map
    const vendorDiscounts = new Map<number, number>();
    vendorOffersResult.data?.forEach((v: any) => {
      if (v.offer_type === 'percentage_discount' && v.offer_value) {
        vendorDiscounts.set(v.id, Number(v.offer_value) / 100);
      }
    });

    // Find lowest price per product
    const lowestPrices = new Map<number, number>();
    if (allVendorProductNames.length > 0) {
      const vendorPrices = vendorPricesResult.data;
      const vendorProductPrices = new Map<string, number>();
      vendorPrices?.forEach((vp: any) => {
        let price = Number(String(vp.price_1pack).replace(/[£$,]/g, ''));
        if (price > 0) {
          const discount = vendorDiscounts.get(vp.vendor_id);
          if (discount) {
            price = price * (1 - discount);
          }
          vendorProductPrices.set(`${vp.name}|${vp.vendor_id}`, price);
        }
      });

      productMappings.forEach((mappingList, productId) => {
        let lowestPrice: number | null = null;
        mappingList.forEach((mapping) => {
          const price = vendorProductPrices.get(`${mapping.vendor_product}|${mapping.vendor_id}`);
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
      .filter((product: any) => product && product.name)
      .map((product: any) => {
        const clicks = clickCounts.get(product.id) || 0;
        const stores = storeCounts.get(product.id) || 0;
        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const recencyBonus = Math.max(0, 30 - daysSinceCreated) / 30;

        let score = 0;
        if (section === 'trending') {
          score = stores === 0 ? -1 : clicks * 5 + stores * 2 + recencyBonus * 10;
        } else if (section === 'popular') {
          score = stores === 0 ? -1 : stores * 10 + clicks * 2;
        } else if (section === 'new') {
          score = recencyBonus * 100 + clicks * 0.2 + stores * 0.2;
        }

        const trackingCount = trackingCounts.get(product.id) || 0;
        const lowestVendorPrice = lowestPrices.get(product.id);
        const parsedOriginalPrice = product.price ? Number(product.price) : null;
        const originalPrice =
          parsedOriginalPrice && !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : null;

        let displayPrice = 3.99;
        if (lowestVendorPrice && !isNaN(Number(lowestVendorPrice))) {
          displayPrice = Number(lowestVendorPrice);
        } else if (originalPrice !== null) {
          displayPrice = originalPrice;
        }

        const strikethroughPrice =
          originalPrice !== null && originalPrice > displayPrice
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
          tracking_count: trackingCount,
          trend_score: score,
          strength_group: 'Normal',
          created_at: product.created_at,
        };
      });

    // Sort by score
    processedProducts.sort((a: any, b: any) => b.trend_score - a.trend_score);

    // Deduplicate and exclude negative scores
    const seenNames = new Set<string>();
    const uniqueProducts = processedProducts.filter((product: any) => {
      if (product.trend_score < 0) return false;
      const normalizedName = product.name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    });

    return uniqueProducts.slice(offset, offset + limit);
  } catch (error) {
    console.error(`Error fetching ${section} products:`, error);
    return [];
  }
}

/**
 * DE-specific product fetching — uses de_vendor_products directly
 * since there's no canonical de_products table.
 */
async function fetchEURegionSectionProducts(
  section: 'popular' | 'trending' | 'new',
  limit: number = 12,
  offset: number = 0,
  currencySymbol: string = '€',
  locale: string = 'de'
): Promise<SectionProduct[]> {
  try {
    const tableName = locale === 'it' ? 'it_vendor_products' : 'de_vendor_products';
    const vendorIdCol = locale === 'it' ? 'it_vendor_id' : 'de_vendor_id';
    // Fetch vendor products with prices, ordered by updated_at
    const orderCol = section === 'new' ? 'created_at' : 'updated_at';
    const { data: products, error } = await supabase()
      .from(tableName)
      .select('id, name, de_vendor_id, url, price_1pack, stock_status, image_url, created_at, updated_at')
      .eq('stock_status', 'in_stock')
      .not('price_1pack', 'is', null)
      .gt('price_1pack', 0)
      .order(orderCol, { ascending: false })
      .limit(200);

    if (error || !products) return [];

    // Count how many vendors carry each product (by normalized name)
    const nameToVendors = new Map<string, Set<string>>();
    const nameToLowestPrice = new Map<string, number>();
    const nameToProduct = new Map<string, any>();

    for (const p of products) {
      const normName = p.name.toLowerCase().trim();
      if (!nameToVendors.has(normName)) {
        nameToVendors.set(normName, new Set());
        nameToProduct.set(normName, p);
      }
      nameToVendors.get(normName)!.add(p[vendorIdCol]);

      const price = Number(p.price_1pack);
      if (price > 0) {
        const current = nameToLowestPrice.get(normName);
        if (!current || price < current) {
          nameToLowestPrice.set(normName, price);
          nameToProduct.set(normName, p); // keep the one with lowest price
        }
      }
    }

    // Deduplicate: one entry per unique product name, with store count and best price
    const deduped = Array.from(nameToProduct.entries()).map(([normName, product]) => {
      const storeCount = nameToVendors.get(normName)?.size || 1;
      const lowestPrice = nameToLowestPrice.get(normName) || Number(product.price_1pack);
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(product.created_at || product.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyBonus = Math.max(0, 30 - daysSinceCreated) / 30;

      let score = 0;
      if (section === 'popular') score = storeCount * 10;
      else if (section === 'trending') score = storeCount * 5 + recencyBonus * 10;
      else if (section === 'new') score = recencyBonus * 100;

      return {
        id: product.id,
        name: product.name,
        brand: product.name?.split(' ')[0] || 'Unknown',
        image_url: product.image_url || '',
        price: `${currencySymbol}${lowestPrice.toFixed(2)}`,
        original_price: `${currencySymbol}${(lowestPrice * 1.25).toFixed(2)}`,
        store_count: storeCount,
        tracking_count: 0,
        trend_score: score,
        strength_group: 'Normal',
        created_at: product.created_at,
      };
    });

    deduped.sort((a, b) => b.trend_score - a.trend_score);
    return deduped.slice(offset, offset + limit);
  } catch (error) {
    console.error(`Error fetching DE ${section} products:`, error);
    return [];
  }
}
