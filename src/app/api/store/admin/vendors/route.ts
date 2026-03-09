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

    const { data: vendors, error } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('id, name, country, logo_url')
      .order('name');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    // Get store users to know claim/account status
    const { data: storeUsers } = await supabaseAdmin()
      .from('store_users')
      .select('vendor_id, us_vendor_id, email, role, is_active, claimed');

    const userMap = new Map<string, { email: string; claimed: boolean }>();
    for (const u of storeUsers || []) {
      const vid = (u as any).vendor_id || (u as any).us_vendor_id;
      if (vid) userMap.set(vid, { email: (u as any).email, claimed: (u as any).claimed });
    }

    const vendorsWithStatus = (vendors || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      country: v.country,
      logo_url: v.logo_url,
      claimed: userMap.get(v.id)?.claimed ?? false,
      accountEmail: userMap.get(v.id)?.email || null,
    }));

    return NextResponse.json({ vendors: vendorsWithStatus });
  } catch (error: any) {
    console.error('Admin vendors error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
