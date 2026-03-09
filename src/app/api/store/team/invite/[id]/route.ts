import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

const CANCEL_ALLOWED_ROLES = ['store_owner', 'admin', 'super_admin'];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user } = authResult;

    // Only store_owner, admin, or super_admin can cancel invites
    if (!CANCEL_ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to cancel invites' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    const vendorId = user.vendor_id || user.us_vendor_id;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Delete the invite — must match both id and vendor_id for security
    const { data, error } = await supabaseAdmin()
      .from('store_team_invites')
      .delete()
      .eq('id', inviteId)
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invite not found or does not belong to your vendor' },
        { status: 404, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in cancel invite API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
