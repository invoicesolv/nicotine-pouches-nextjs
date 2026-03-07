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

    // Get all vendors with their shipping/trust data
    const { data: allVendors, error: vendorsError } = await supabaseAdmin()
      .from('vendors')
      .select('id, name, shipping_cost, free_shipping_threshold, trustpilot_score, review_count, same_day_available, offer_type, offer_value, offer_description');

    if (vendorsError || !allVendors) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    // Get product counts and avg prices per vendor
    const { data: vendorProducts, error: vpError } = await supabaseAdmin()
      .from('vendor_products')
      .select('vendor_id, price, stock_status');

    if (vpError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Get mapping counts per vendor
    const { data: mappings, error: mapError } = await supabaseAdmin()
      .from('vendor_product_mapping')
      .select('vendor_id');

    if (mapError) {
      return NextResponse.json({ error: 'Failed to fetch mappings' }, { status: 500 });
    }

    // Get analytics (last 90 days) per vendor
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const { data: analytics, error: analyticsError } = await supabaseAdmin()
      .from('vendor_analytics')
      .select('vendor_id, event_type')
      .in('event_type', ['vendor_click', 'vendor_exposure'])
      .gte('timestamp', startDate.toISOString());

    // Build per-vendor product stats
    const productStats = new Map<number, { prices: number[]; total: number; inStock: number }>();
    for (const vp of vendorProducts || []) {
      const stats = productStats.get(vp.vendor_id) || { prices: [], total: 0, inStock: 0 };
      stats.total++;
      if (vp.stock_status === 'in_stock') stats.inStock++;
      if (vp.price && parseFloat(vp.price) > 0) stats.prices.push(parseFloat(vp.price));
      productStats.set(vp.vendor_id, stats);
    }

    // Build per-vendor mapping counts
    const mappingCounts = new Map<number, number>();
    for (const m of mappings || []) {
      mappingCounts.set(m.vendor_id, (mappingCounts.get(m.vendor_id) || 0) + 1);
    }

    // Build per-vendor analytics
    const analyticsStats = new Map<number, { clicks: number; impressions: number }>();
    for (const a of analytics || []) {
      const stats = analyticsStats.get(a.vendor_id) || { clicks: 0, impressions: 0 };
      if (a.event_type === 'vendor_click') stats.clicks++;
      else if (a.event_type === 'vendor_exposure') stats.impressions++;
      analyticsStats.set(a.vendor_id, stats);
    }

    // Build metrics for each vendor
    const vendorMetrics: VendorMetrics[] = allVendors
      .filter(v => {
        const stats = productStats.get(v.id);
        return stats && stats.total > 0; // Only rank vendors with products
      })
      .map(v => {
        const stats = productStats.get(v.id) || { prices: [], total: 0, inStock: 0 };
        const mapped = mappingCounts.get(v.id) || 0;
        const aStats = analyticsStats.get(v.id) || { clicks: 0, impressions: 0 };
        const avgPrice = stats.prices.length > 0
          ? stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length
          : null;

        return {
          vendorId: v.id,
          name: v.name,
          avgPrice: avgPrice ? parseFloat(avgPrice.toFixed(2)) : null,
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

    // Ranking functions — returns sorted vendor IDs (best first)
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

    // Build rankings
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
