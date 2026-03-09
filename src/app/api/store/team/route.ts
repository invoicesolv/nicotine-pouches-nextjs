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

    const { user } = authResult;

    // Build vendor match conditions — team members share vendor_id or us_vendor_id
    const vendorId = user.vendor_id;
    const usVendorId = user.us_vendor_id;

    if (!vendorId && !usVendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Fetch team members matching either vendor_id or us_vendor_id
    let membersQuery = supabaseAdmin()
      .from('store_users')
      .select('id, email, role, is_active, last_login, created_at');

    if (vendorId && usVendorId) {
      membersQuery = membersQuery.or(`vendor_id.eq.${vendorId},us_vendor_id.eq.${usVendorId}`);
    } else if (vendorId) {
      membersQuery = membersQuery.eq('vendor_id', vendorId);
    } else {
      membersQuery = membersQuery.eq('us_vendor_id', usVendorId);
    }

    const { data: members, error: membersError } = await membersQuery.order('created_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching team members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Fetch pending invites for this vendor
    const matchVendorId = vendorId || usVendorId;

    const { data: invites, error: invitesError } = await supabaseAdmin()
      .from('store_team_invites')
      .select('id, email, role, invite_code, expires_at, created_at')
      .eq('vendor_id', matchVendorId)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (invitesError) {
      console.error('Error fetching team invites:', invitesError);
      return NextResponse.json(
        { error: 'Failed to fetch team invites' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { members: members || [], invites: invites || [] },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in team API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
