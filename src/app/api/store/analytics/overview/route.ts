import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

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

    // UK: integer vendor_id, US: uuid us_vendor_id
    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;

    // vendor_analytics always uses integer vendor_id
    const analyticsVendorId = vendor.realVendorId;

    // Date range (default: last 30 days)
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all counts in parallel
    const queries: Promise<any>[] = [
      // Total products
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
      // In-stock products
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue)
        .eq('stock_status', 'in_stock'),
      // Mapped products
      supabaseAdmin()
        .from(mappingTable)
        .select('id', { count: 'exact', head: true })
        .eq(vendorIdColumn, vendorIdValue),
      // Last update
      supabaseAdmin()
        .from(vpTable)
        .select('updated_at')
        .eq(vendorIdColumn, vendorIdValue)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
    ];

    // Analytics queries only if we have an integer vendor_id
    if (analyticsVendorId) {
      queries.push(
        // Count clicks
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_click')
          .gte('timestamp', startDate.toISOString()),
        // Count impressions
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_exposure')
          .gte('timestamp', startDate.toISOString()),
        // Count conversions
        supabaseAdmin()
          .from('vendor_analytics')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', analyticsVendorId)
          .eq('event_type', 'vendor_conversion')
          .gte('timestamp', startDate.toISOString()),
      );
    }

    const results = await Promise.all(queries);

    const totalProducts = results[0].count || 0;
    const inStockProducts = results[1].count || 0;
    const mappedProducts = results[2].count || 0;
    const lastUpdated = results[3].data?.updated_at || null;
    const totalClicks = analyticsVendorId ? (results[4]?.count || 0) : 0;
    const totalImpressions = analyticsVendorId ? (results[5]?.count || 0) : 0;
    const totalConversions = analyticsVendorId ? (results[6]?.count || 0) : 0;

    const ctr = totalImpressions > 0
      ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      vendor: vendor ? {
        name: vendor.name,
        country: vendor.country,
      } : null,
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
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
    });
  } catch (error: any) {
    console.error('Error in analytics overview API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
