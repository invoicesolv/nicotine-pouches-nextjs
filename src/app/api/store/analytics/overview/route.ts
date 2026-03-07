import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

function pctChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
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
    const url = new URL(request.url);

    if (!vendor?.realVendorId && !vendor?.usVendorUuid) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    const isUK = vendor.country === 'uk';

    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;

    const analyticsVendorId = vendor.realVendorId;

    // Current period
    const days = parseInt(url.searchParams.get('days') || '30');
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    // Previous period (same length, immediately before current)
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date();
    prevStartDate.setDate(startDate.getDate() - days);

    // Fetch product/mapping counts (these don't have periods)
    const [totalProductsRes, inStockRes, mappedRes, lastUpdatedRes] = await Promise.all([
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue)
        .eq('stock_status', 'in_stock'),
      supabaseAdmin()
        .from(mappingTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
      supabaseAdmin()
        .from(vpTable)
        .select('updated_at')
        .eq(vendorIdColumn, vendorIdValue)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    const totalProducts = totalProductsRes.count || 0;
    const inStockProducts = inStockRes.count || 0;
    const mappedProducts = mappedRes.count || 0;
    const lastUpdated = lastUpdatedRes.data?.updated_at || null;

    let totalClicks = 0;
    let totalImpressions = 0;
    let totalConversions = 0;
    let prevClicks = 0;
    let prevImpressions = 0;
    let prevConversions = 0;

    if (analyticsVendorId) {
      // Current + previous period analytics in parallel
      const [
        clicksRes, impressionsRes, conversionsRes,
        prevClicksRes, prevImpressionsRes, prevConversionsRes,
      ] = await Promise.all([
        // Current period
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_click')
          .gte('timestamp', startDate.toISOString()),
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_exposure')
          .gte('timestamp', startDate.toISOString()),
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_conversion')
          .gte('timestamp', startDate.toISOString()),
        // Previous period
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_click')
          .gte('timestamp', prevStartDate.toISOString())
          .lt('timestamp', prevEndDate.toISOString()),
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_exposure')
          .gte('timestamp', prevStartDate.toISOString())
          .lt('timestamp', prevEndDate.toISOString()),
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_conversion')
          .gte('timestamp', prevStartDate.toISOString())
          .lt('timestamp', prevEndDate.toISOString()),
      ]);

      totalClicks = clicksRes.count || 0;
      totalImpressions = impressionsRes.count || 0;
      totalConversions = conversionsRes.count || 0;
      prevClicks = prevClicksRes.count || 0;
      prevImpressions = prevImpressionsRes.count || 0;
      prevConversions = prevConversionsRes.count || 0;
    }

    const ctr = totalImpressions > 0
      ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
      : 0;

    const prevCtr = prevImpressions > 0
      ? parseFloat(((prevClicks / prevImpressions) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      vendor: vendor ? {
        name: vendor.name,
        country: vendor.country,
      } : null,
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      },
      kpis: {
        totalClicks,
        totalImpressions,
        totalConversions,
        clickThroughRate: ctr,
        totalProducts,
        inStockProducts,
        outOfStockProducts: totalProducts - inStockProducts,
        mappedProducts,
        unmappedProducts: totalProducts - mappedProducts,
        lastUpdated,
      },
      trends: {
        totalClicks: pctChange(totalClicks, prevClicks),
        totalImpressions: pctChange(totalImpressions, prevImpressions),
        totalConversions: pctChange(totalConversions, prevConversions),
        clickThroughRate: pctChange(ctr, prevCtr),
        // Product counts don't have period-based history, so no trends
        mappedProducts: null,
        inStockProducts: null,
        totalProducts: null,
        outOfStockProducts: null,
      },
    });
  } catch (error: any) {
    console.error('Error in analytics overview API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
