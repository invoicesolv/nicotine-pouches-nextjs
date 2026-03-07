import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * OpenAPI endpoint for querying store vendors and their contact emails.
 * Used by Apollo.io and other external tools.
 *
 * Authentication: Bearer token (Axelio workspace_id or CRAWLER_API_KEY)
 *
 * GET /api/openapi/stores
 * GET /api/openapi/stores?country=uk
 * GET /api/openapi/stores?has_account=true
 */
export async function GET(request: NextRequest) {
  // Auth: Bearer token
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  const token = authHeader?.replace('Bearer ', '') || apiKeyHeader;

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }

  // Validate against workspace IDs or crawler API key
  const validTokens = [
    process.env.CRM_WORKSPACE_ID,
    process.env.CRM_WORKSPACE_ID_2,
    process.env.CRAWLER_API_KEY,
  ].filter(Boolean);

  if (!validTokens.includes(token)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const country = url.searchParams.get('country');
    const hasAccount = url.searchParams.get('has_account');

    // Get all pouch vendors
    let vendorQuery = supabaseAdmin()
      .from('pouch_vendors')
      .select('id, name, country, logo_url, website_url, vendor_id, us_vendor_id')
      .order('name', { ascending: true });

    if (country) {
      vendorQuery = vendorQuery.eq('country', country.toLowerCase());
    }

    const { data: vendors, error: vendorsError } = await vendorQuery;

    if (vendorsError) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    // Get all store users
    const { data: storeUsers } = await supabaseAdmin()
      .from('store_users')
      .select('id, email, vendor_id, us_vendor_id, role, is_active, last_login, created_at');

    const userByVendor = new Map<string, any>();
    for (const u of storeUsers || []) {
      const vid = u.vendor_id || u.us_vendor_id;
      if (vid) userByVendor.set(vid, u);
    }

    // Get vendor details (shipping, trustpilot) from vendors table
    const { data: vendorDetails } = await supabaseAdmin()
      .from('vendors')
      .select('id, name, shipping_cost, free_shipping_threshold, trustpilot_score, review_count, offer_type, offer_description');

    const detailMap = new Map((vendorDetails || []).map((v: any) => [v.id, v]));

    // Get store invites (to show pending invites)
    const { data: invites } = await supabaseAdmin()
      .from('store_invites')
      .select('vendor_id, us_vendor_id, email, invite_code, expires_at, used_at, created_at')
      .is('used_at', null);

    const inviteByVendor = new Map<string, any>();
    for (const inv of invites || []) {
      const vid = inv.vendor_id || inv.us_vendor_id;
      if (vid) inviteByVendor.set(vid, inv);
    }

    const stores = (vendors || []).map(v => {
      const user = userByVendor.get(v.id);
      const detail = v.vendor_id ? detailMap.get(v.vendor_id) : null;
      const invite = inviteByVendor.get(v.id);

      return {
        vendor_id: v.id,
        name: v.name,
        country: v.country,
        website_url: v.website_url,
        logo_url: v.logo_url,
        has_store_account: !!user,
        store_account: user ? {
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          last_login: user.last_login,
          created_at: user.created_at,
        } : null,
        pending_invite: invite ? {
          email: invite.email,
          invite_code: invite.invite_code,
          expires_at: invite.expires_at,
        } : null,
        trustpilot_score: detail?.trustpilot_score || null,
        review_count: detail?.review_count || null,
        shipping_cost: detail?.shipping_cost || null,
        free_shipping_threshold: detail?.free_shipping_threshold || null,
        active_offer: detail?.offer_description || null,
      };
    });

    // Filter by has_account if requested
    const filtered = hasAccount !== null
      ? stores.filter(s => hasAccount === 'true' ? s.has_store_account : !s.has_store_account)
      : stores;

    return NextResponse.json({
      total: filtered.length,
      stores: filtered,
    });
  } catch (error) {
    console.error('OpenAPI stores error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
