import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/store/claim/vendors — List all vendors and their claim status
export async function GET() {
  try {
    const { data: vendors } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('id, name, country, logo_url, website_url')
      .order('name', { ascending: true });

    const { data: storeUsers } = await supabaseAdmin()
      .from('store_users')
      .select('vendor_id, us_vendor_id, claimed');

    const claimMap = new Map<string, boolean>();
    for (const su of storeUsers || []) {
      const vid = su.vendor_id || su.us_vendor_id;
      if (vid) claimMap.set(vid, su.claimed);
    }

    const result = (vendors || []).map(v => ({
      id: v.id,
      name: v.name,
      country: v.country,
      logo_url: v.logo_url,
      website_url: v.website_url,
      claimed: claimMap.get(v.id) ?? false,
      has_account: claimMap.has(v.id),
    }));

    return NextResponse.json({ vendors: result });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
