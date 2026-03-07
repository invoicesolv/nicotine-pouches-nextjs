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

    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all pouch_vendors with their store user status
    const { data: vendors, error } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('id, name, country, logo_url, vendor_id, us_vendor_id')
      .order('name');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    // Get store users to know which vendors have accounts
    const { data: storeUsers } = await supabaseAdmin()
      .from('store_users')
      .select('vendor_id, email, role, is_active');

    const userMap = new Map(
      (storeUsers || []).map(u => [u.vendor_id, u])
    );

    const vendorsWithStatus = (vendors || []).map(v => ({
      ...v,
      hasAccount: userMap.has(v.id),
      accountEmail: userMap.get(v.id)?.email || null,
    }));

    return NextResponse.json({ vendors: vendorsWithStatus });
  } catch (error: any) {
    console.error('Admin vendors error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
