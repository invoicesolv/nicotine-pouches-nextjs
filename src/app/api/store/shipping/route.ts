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
    if (!vendor?.realVendorId) {
      return NextResponse.json({ error: 'No vendor linked' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin()
      .from('vendors')
      .select('shipping_info, delivery_speed, cutoff_time, free_shipping_threshold, shipping_methods, same_day_available, same_day_location, shipping_cost, offer_type, offer_value, offer_description, trustpilot_score, review_count, trustpilot_url')
      .eq('id', vendor.realVendorId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch shipping info' }, { status: 500 });
    }

    return NextResponse.json({ shipping: data });
  } catch (error: any) {
    console.error('Shipping info error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
