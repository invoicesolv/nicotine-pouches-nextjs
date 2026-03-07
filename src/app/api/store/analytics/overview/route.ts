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

    if (!vendor?.realVendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    const vendorId = vendor.realVendorId;
    const isUK = vendor.country === 'uk';

    // Date range (default: last 30 days)
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';

    // Fetch all counts in parallel
    const [clicksResult, impressionsResult, totalProductsResult, instockResult, mappedResult, lastProductResult] = await Promise.all([
      // Count clicks from vendor_analytics
      supabaseAdmin()
        .from('vendor_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('event_type', 'vendor_click')
        .gte('timestamp', startDate.toISOString()),
      // Count impressions
      supabaseAdmin()
        .from('vendor_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('event_type', 'vendor_exposure')
        .gte('timestamp', startDate.toISOString()),
      // Total products
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),
      // In-stock products
      supabaseAdmin()
        .from(vpTable)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('stock_status', 'instock'),
      // Mapped products
      supabaseAdmin()
        .from(mappingTable)
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendorId),
      // Last update
      supabaseAdmin()
        .from(vpTable)
        .select('updated_at')
        .eq('vendor_id', vendorId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    const totalClicks = clicksResult.count || 0;
    const totalImpressions = impressionsResult.count || 0;
    const totalProducts = totalProductsResult.count || 0;
    const inStockProducts = instockResult.count || 0;
    const mappedProducts = mappedResult.count || 0;

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
        clickThroughRate: ctr,
        totalProducts,
        inStockProducts,
        outOfStockProducts: totalProducts - inStockProducts,
        mappedProducts,
        unmappedProducts: totalProducts - mappedProducts,
        lastUpdated: lastProductResult.data?.updated_at || null,
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
