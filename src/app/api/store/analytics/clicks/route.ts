import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { user } = authResult;
    const url = new URL(request.url);

    // Date range params
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Determine vendor type
    const isUK = !!user.vendor_id;
    const vendorId = isUK ? user.vendor_id : user.us_vendor_id;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400 }
      );
    }

    // Get daily analytics
    const analyticsTable = isUK ? 'vendor_analytics' : 'us_vendor_analytics';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';

    const { data: dailyData, error: dailyError } = await supabaseAdmin()
      .from(analyticsTable)
      .select('date, clicks, impressions, conversions')
      .eq(vendorIdColumn, vendorId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily analytics:', dailyError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Fill in missing dates with zeros
    const dateMap = new Map<string, { clicks: number; impressions: number; conversions: number }>();

    // Initialize all dates in range with zeros
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { clicks: 0, impressions: 0, conversions: 0 });
    }

    // Fill in actual data
    for (const row of dailyData || []) {
      dateMap.set(row.date, {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        conversions: row.conversions || 0,
      });
    }

    // Convert to array sorted by date
    const chartData = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    // Get top products by clicks if product-level tracking exists
    const clicksTable = isUK ? 'product_clicks' : 'us_product_clicks';
    const productTable = isUK ? 'products' : 'us_products';

    let topProducts: any[] = [];

    try {
      const { data: topProductsData } = await supabaseAdmin()
        .from(clicksTable)
        .select(`
          product_id,
          count,
          product:${productTable}(name, slug)
        `)
        .eq(vendorIdColumn, vendorId)
        .gte('created_at', startDate.toISOString())
        .order('count', { ascending: false })
        .limit(10);

      topProducts = (topProductsData || []).map(row => ({
        productId: row.product_id,
        productName: row.product?.name || 'Unknown',
        productSlug: row.product?.slug || '',
        clicks: row.count || 0,
      }));
    } catch {
      // Product-level clicks table may not exist, continue without it
    }

    return NextResponse.json({
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      chartData,
      topProducts,
    });
  } catch (error: any) {
    console.error('Error in clicks analytics API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
