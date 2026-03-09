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

    if (!vendor) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Fetch subscription for this vendor
    const { data: subscription, error: subError } = await supabaseAdmin()
      .from('store_subscriptions')
      .select('*')
      .eq('vendor_id', vendor.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine (free plan)
      console.error('Error fetching subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Default free plan if no subscription exists
    const subscriptionData = subscription || {
      id: null,
      vendor_id: vendor.id,
      plan: 'free',
      status: 'active',
      price_cents: 0,
      currency: 'eur',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_payment_method_id: null,
      card_last4: null,
      card_brand: null,
      current_period_start: null,
      current_period_end: null,
      trial_end: null,
      cancelled_at: null,
      created_at: null,
      updated_at: null,
    };

    // Fetch last 12 payments
    const { data: payments, error: payError } = await supabaseAdmin()
      .from('store_payments')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (payError) {
      console.error('Error fetching payments:', payError);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { subscription: subscriptionData, payments: payments || [] },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in billing API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
