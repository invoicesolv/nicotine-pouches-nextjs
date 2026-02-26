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

    const { user, vendor } = authResult;
    const url = new URL(request.url);

    // Date range (default: last 30 days)
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

    // Get analytics from vendor_analytics table
    const analyticsTable = isUK ? 'vendor_analytics' : 'us_vendor_analytics';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';

    const { data: analytics, error: analyticsError } = await supabaseAdmin()
      .from(analyticsTable)
      .select('*')
      .eq(vendorIdColumn, vendorId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    }

    // Calculate totals from analytics
    const totals = (analytics || []).reduce(
      (acc, day) => ({
        clicks: acc.clicks + (day.clicks || 0),
        impressions: acc.impressions + (day.impressions || 0),
        conversions: acc.conversions + (day.conversions || 0),
      }),
      { clicks: 0, impressions: 0, conversions: 0 }
    );

    // Calculate CTR
    const ctr = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : '0.00';

    // Get active products count
    const productsTable = isUK ? 'vendor_products' : 'us_vendor_products';

    const { count: activeProductsCount, error: productsError } = await supabaseAdmin()
      .from(productsTable)
      .select('*', { count: 'exact', head: true })
      .eq(vendorIdColumn, vendorId)
      .eq('in_stock', true);

    if (productsError) {
      console.error('Error fetching products count:', productsError);
    }

    // Get total products count
    const { count: totalProductsCount } = await supabaseAdmin()
      .from(productsTable)
      .select('*', { count: 'exact', head: true })
      .eq(vendorIdColumn, vendorId);

    // Get last update time from vendor_products
    const { data: lastProduct } = await supabaseAdmin()
      .from(productsTable)
      .select('updated_at')
      .eq(vendorIdColumn, vendorId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

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
        totalClicks: totals.clicks,
        totalImpressions: totals.impressions,
        totalConversions: totals.conversions,
        clickThroughRate: parseFloat(ctr),
        conversionRate: totals.clicks > 0
          ? parseFloat(((totals.conversions / totals.clicks) * 100).toFixed(2))
          : 0,
        activeProducts: activeProductsCount || 0,
        totalProducts: totalProductsCount || 0,
        lastUpdated: lastProduct?.updated_at || null,
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
