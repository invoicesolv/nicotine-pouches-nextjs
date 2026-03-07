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

    // vendor_analytics always uses integer vendor_id
    const vendorId = vendor.realVendorId;

    // Date range params
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch click events from vendor_analytics
    const { data: clickEvents, error: clicksError } = await supabaseAdmin()
      .from('vendor_analytics')
      .select('timestamp, event_type, product_id, product_name')
      .eq('vendor_id', vendorId)
      .in('event_type', ['vendor_click', 'vendor_exposure'])
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })
      .limit(10000);

    if (clicksError) {
      console.error('Error fetching analytics:', clicksError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Aggregate by date
    const dateMap = new Map<string, { clicks: number; impressions: number }>();

    // Initialize all dates in range with zeros
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { clicks: 0, impressions: 0 });
    }

    // Aggregate events into daily buckets
    const productClicks = new Map<string, { name: string; clicks: number }>();

    for (const event of clickEvents || []) {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      const day = dateMap.get(dateStr) || { clicks: 0, impressions: 0 };

      if (event.event_type === 'vendor_click') {
        day.clicks++;
        // Track per-product clicks
        if (event.product_name) {
          const existing = productClicks.get(event.product_name) || { name: event.product_name, clicks: 0 };
          existing.clicks++;
          productClicks.set(event.product_name, existing);
        }
      } else if (event.event_type === 'vendor_exposure') {
        day.impressions++;
      }

      dateMap.set(dateStr, day);
    }

    // Convert to sorted array
    const chartData = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    // Top products by clicks
    const topProducts = Array.from(productClicks.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

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
