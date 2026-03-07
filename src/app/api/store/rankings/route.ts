import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

interface VendorMetrics {
  vendorId: number;
  name: string;
  avgPrice: number | null;
  productCount: number;
  mappedCount: number;
  stockRate: number;
  shippingCost: number | null;
  freeShippingThreshold: number | null;
  trustpilotScore: number | null;
  reviewCount: number | null;
  sameDayAvailable: boolean;
  totalClicks: number;
  totalImpressions: number;
  ctr: number;
  hasOffer: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { vendor } = authResult;
    if (!vendor?.realVendorId) {
      return NextResponse.json({ error: 'No vendor linked' }, { status: 400 });
    }

    const myVendorId = vendor.realVendorId;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    // Run all queries in parallel using aggregation to avoid row limits
    const [vendorsRes, productStatsRes, mappingStatsRes, analyticsStatsRes] = await Promise.all([
      // All vendors with shipping/trust data
      supabaseAdmin()
        .from('vendors')
        .select('id, name, shipping_cost, free_shipping_threshold, trustpilot_score, review_count, same_day_available, offer_type, offer_description'),

      // Product stats aggregated per vendor using RPC-style query
      supabaseAdmin().rpc('get_vendor_product_stats'),

      // Mapping counts per vendor
      supabaseAdmin().rpc('get_vendor_mapping_counts'),

      // Analytics aggregated per vendor
      supabaseAdmin().rpc('get_vendor_analytics_stats', { start_ts: startDate.toISOString() }),
    ]);

    // If RPCs don't exist, fall back to paginated queries
    let productStats: Map<number, { avgPrice: number | null; total: number; inStock: number }>;
    let mappingCounts: Map<number, number>;
    let analyticsStats: Map<number, { clicks: number; impressions: number }>;

    if (productStatsRes.error) {
      // Fallback: query with vendor_id grouping manually
      // Get unique vendor IDs from the vendors table
      const vendorIds = (vendorsRes.data || []).map((v: any) => v.id);
      productStats = new Map();

      // Query per vendor (batch)
      for (const vid of vendorIds) {
        const [totalRes, inStockRes] = await Promise.all([
          supabaseAdmin()
            .from('vendor_products')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', vid),
          supabaseAdmin()
            .from('vendor_products')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', vid)
            .eq('stock_status', 'in_stock'),
        ]);

        const total = totalRes.count || 0;
        const inStock = inStockRes.count || 0;

        if (total > 0) {
          // Get avg price with a limited sample
          const { data: priceData } = await supabaseAdmin()
            .from('vendor_products')
            .select('price')
            .eq('vendor_id', vid)
            .gt('price', 0)
            .limit(500);

          const prices = (priceData || []).map((p: any) => parseFloat(p.price)).filter((p: number) => p > 0);
          const avgPrice = prices.length > 0
            ? parseFloat((prices.reduce((a: number, b: number) => a + b, 0) / prices.length).toFixed(2))
            : null;

          productStats.set(vid, { avgPrice, total, inStock });
        }
      }
    } else {
      productStats = new Map();
      for (const row of productStatsRes.data || []) {
        productStats.set(row.vendor_id, {
          avgPrice: row.avg_price ? parseFloat(row.avg_price) : null,
          total: row.total_count,
          inStock: row.in_stock_count,
        });
      }
    }

    if (mappingStatsRes.error) {
      mappingCounts = new Map();
      const vendorIds = (vendorsRes.data || []).map((v: any) => v.id);
      for (const vid of vendorIds) {
        const { count } = await supabaseAdmin()
          .from('vendor_product_mapping')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vid);
        if (count && count > 0) mappingCounts.set(vid, count);
      }
    } else {
      mappingCounts = new Map();
      for (const row of mappingStatsRes.data || []) {
        mappingCounts.set(row.vendor_id, row.mapping_count);
      }
    }

    if (analyticsStatsRes.error) {
      analyticsStats = new Map();
      const vendorIds = (vendorsRes.data || []).map((v: any) => v.id);
      for (const vid of vendorIds) {
        const [clicksRes, impressionsRes] = await Promise.all([
          supabaseAdmin()
            .from('vendor_analytics')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', vid)
            .eq('event_type', 'vendor_click')
            .gte('timestamp', startDate.toISOString()),
          supabaseAdmin()
            .from('vendor_analytics')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', vid)
            .eq('event_type', 'vendor_exposure')
            .gte('timestamp', startDate.toISOString()),
        ]);
        const clicks = clicksRes.count || 0;
        const impressions = impressionsRes.count || 0;
        if (clicks > 0 || impressions > 0) {
          analyticsStats.set(vid, { clicks, impressions });
        }
      }
    } else {
      analyticsStats = new Map();
      for (const row of analyticsStatsRes.data || []) {
        analyticsStats.set(row.vendor_id, { clicks: row.click_count, impressions: row.impression_count });
      }
    }

    if (vendorsRes.error || !vendorsRes.data) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    // Build metrics for each vendor
    const vendorMetrics: VendorMetrics[] = vendorsRes.data
      .filter((v: any) => {
        const stats = productStats.get(v.id);
        return stats && stats.total > 0;
      })
      .map((v: any) => {
        const stats = productStats.get(v.id) || { avgPrice: null, total: 0, inStock: 0 };
        const mapped = mappingCounts.get(v.id) || 0;
        const aStats = analyticsStats.get(v.id) || { clicks: 0, impressions: 0 };

        return {
          vendorId: v.id,
          name: v.name,
          avgPrice: stats.avgPrice,
          productCount: stats.total,
          mappedCount: mapped,
          stockRate: stats.total > 0 ? parseFloat(((stats.inStock / stats.total) * 100).toFixed(1)) : 0,
          shippingCost: v.shipping_cost ? parseFloat(v.shipping_cost) : null,
          freeShippingThreshold: v.free_shipping_threshold ? parseFloat(v.free_shipping_threshold) : null,
          trustpilotScore: v.trustpilot_score ? parseFloat(v.trustpilot_score) : null,
          reviewCount: v.review_count || null,
          sameDayAvailable: v.same_day_available || false,
          totalClicks: aStats.clicks,
          totalImpressions: aStats.impressions,
          ctr: aStats.impressions > 0
            ? parseFloat(((aStats.clicks / aStats.impressions) * 100).toFixed(2))
            : 0,
          hasOffer: !!(v.offer_type && v.offer_description),
        };
      });

    // Ranking functions
    const rankBy = (
      metrics: VendorMetrics[],
      key: keyof VendorMetrics,
      direction: 'asc' | 'desc',
      filterNull = true
    ) => {
      const filtered = filterNull
        ? metrics.filter(m => m[key] !== null && m[key] !== undefined)
        : metrics;
      const sorted = [...filtered].sort((a, b) => {
        const aVal = (a[key] as number) ?? (direction === 'asc' ? Infinity : -Infinity);
        const bVal = (b[key] as number) ?? (direction === 'asc' ? Infinity : -Infinity);
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
      return sorted.map(m => m.vendorId);
    };

    const totalVendors = vendorMetrics.length;
    const myMetrics = vendorMetrics.find(m => m.vendorId === myVendorId);

    if (!myMetrics) {
      return NextResponse.json({ error: 'Vendor not found in rankings' }, { status: 404 });
    }

    const buildRanking = (
      label: string,
      key: keyof VendorMetrics,
      direction: 'asc' | 'desc',
      format: (val: any) => string,
      description: string,
    ) => {
      const ranked = rankBy(vendorMetrics, key, direction);
      const position = ranked.indexOf(myVendorId) + 1;
      const value = myMetrics[key];
      const bestVendor = vendorMetrics.find(m => m.vendorId === ranked[0]);

      return {
        label,
        rank: position || null,
        total: ranked.length,
        value: value !== null && value !== undefined ? format(value) : 'N/A',
        bestValue: bestVendor && ranked[0] !== myVendorId
          ? format(bestVendor[key])
          : null,
        bestVendorName: bestVendor && ranked[0] !== myVendorId
          ? bestVendor.name
          : null,
        direction,
        description,
      };
    };

    const rankings = [
      buildRanking('Average Price', 'avgPrice', 'asc', v => `£${v.toFixed(2)}`, 'Lower is better. Average price across all your products.'),
      buildRanking('Shipping Cost', 'shippingCost', 'asc', v => v === 0 ? 'Free' : `£${v.toFixed(2)}`, 'Lower is better. What customers pay for shipping.'),
      buildRanking('Free Shipping Threshold', 'freeShippingThreshold', 'asc', v => v === 0 ? 'Always free' : `£${v.toFixed(2)}`, 'Lower is better. Minimum order for free shipping.'),
      buildRanking('Trustpilot Score', 'trustpilotScore', 'desc', v => `${v}/5`, 'Higher is better. Your Trustpilot rating.'),
      buildRanking('Review Count', 'reviewCount', 'desc', v => v.toLocaleString(), 'Higher is better. Total Trustpilot reviews.'),
      buildRanking('Product Coverage', 'mappedCount', 'desc', v => `${v} products`, 'Higher is better. Products mapped to comparison pages.'),
      buildRanking('Stock Rate', 'stockRate', 'desc', v => `${v}%`, 'Higher is better. Percentage of products in stock.'),
      buildRanking('Click-Through Rate', 'ctr', 'desc', v => `${v}%`, 'Higher is better. Clicks / impressions (last 90 days).'),
      buildRanking('Total Clicks', 'totalClicks', 'desc', v => v.toLocaleString(), 'Higher is better. Total clicks in the last 90 days.'),
    ];

    return NextResponse.json({
      vendorName: myMetrics.name,
      totalVendors,
      rankings,
    });
  } catch (error: any) {
    console.error('Rankings error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
