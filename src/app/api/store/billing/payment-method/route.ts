import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user, vendor } = authResult;

    // Only store_owner or super_admin can update payment method
    if (user.role !== 'store_owner' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only store owners and admins can update payment methods.' },
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
    const { card_last4, card_brand } = body;

    if (!card_last4 || !card_brand) {
      return NextResponse.json(
        { error: 'card_last4 and card_brand are required' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Check that a subscription record exists
    const { data: existing } = await supabaseAdmin()
      .from('store_subscriptions')
      .select('id')
      .eq('vendor_id', vendor.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'No subscription found. Subscribe to a plan first.' },
        { status: 404, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { data: subscription, error } = await supabaseAdmin()
      .from('store_subscriptions')
      .update({
        card_last4,
        card_brand,
        updated_at: new Date().toISOString(),
      })
      .eq('vendor_id', vendor.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment method:', error);
      return NextResponse.json(
        { error: 'Failed to update payment method' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { subscription },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in payment-method API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
