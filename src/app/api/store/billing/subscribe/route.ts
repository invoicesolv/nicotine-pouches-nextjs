import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user, vendor } = authResult;

    // Only store_owner or super_admin can manage billing
    if (user.role !== 'store_owner' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only store owners and admins can manage billing.' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['pro', 'free'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "free".' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    const now = new Date().toISOString();

    if (plan === 'pro') {
      // Upgrade to pro: upsert subscription
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      const { data: subscription, error } = await supabaseAdmin()
        .from('store_subscriptions')
        .upsert(
          {
            vendor_id: vendor.id,
            plan: 'pro',
            status: 'active',
            price_cents: 10000,
            currency: 'eur',
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancelled_at: null,
            updated_at: now,
          },
          { onConflict: 'vendor_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error upserting subscription:', error);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500, headers: AUTH_CACHE_HEADERS }
        );
      }

      return NextResponse.json(
        { subscription },
        { headers: AUTH_CACHE_HEADERS }
      );
    } else {
      // Downgrade to free: mark as cancelled but keep active until period end
      const { data: existing } = await supabaseAdmin()
        .from('store_subscriptions')
        .select('*')
        .eq('vendor_id', vendor.id)
        .single();

      if (!existing) {
        // Already on free plan, nothing to do
        return NextResponse.json(
          {
            subscription: {
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
            },
          },
          { headers: AUTH_CACHE_HEADERS }
        );
      }

      const { data: subscription, error } = await supabaseAdmin()
        .from('store_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          updated_at: now,
        })
        .eq('vendor_id', vendor.id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500, headers: AUTH_CACHE_HEADERS }
        );
      }

      return NextResponse.json(
        { subscription },
        { headers: AUTH_CACHE_HEADERS }
      );
    }
  } catch (error: any) {
    console.error('Error in subscribe API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
