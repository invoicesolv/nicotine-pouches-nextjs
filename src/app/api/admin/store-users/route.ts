import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin()
      .from('store_users')
      .select('id, email, vendor_id, us_vendor_id, role, is_active, last_login, permissions, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data: users, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch store users' }, { status: 500 });
    }

    // Get vendor info for all users
    const vendorIds = [...new Set((users || []).map(u => u.vendor_id || u.us_vendor_id).filter(Boolean))];

    let vendorMap = new Map<string, any>();
    if (vendorIds.length > 0) {
      const { data: vendors } = await supabaseAdmin()
        .from('pouch_vendors')
        .select('id, name, country, logo_url, website_url')
        .in('id', vendorIds);

      vendorMap = new Map((vendors || []).map(v => [v.id, v]));
    }

    // Get report preferences
    const userIds = (users || []).map(u => u.id);
    let prefsMap = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: prefs } = await supabaseAdmin()
        .from('store_report_preferences')
        .select('store_user_id, report_frequency, last_sent_at')
        .in('store_user_id', userIds);

      prefsMap = new Map((prefs || []).map(p => [p.store_user_id, p]));
    }

    const enriched = (users || []).map(u => {
      const vid = u.vendor_id || u.us_vendor_id;
      const vendor = vid ? vendorMap.get(vid) : null;
      const pref = prefsMap.get(u.id);
      return {
        ...u,
        vendor: vendor || null,
        report_frequency: pref?.report_frequency || 'off',
        last_report_sent: pref?.last_sent_at || null,
      };
    });

    return NextResponse.json({
      data: enriched,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching store users:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
