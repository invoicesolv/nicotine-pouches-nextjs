import { NextRequest, NextResponse } from 'next/server';
import { createInvite, getVendorInfo } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

// Admin API key for authentication
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CRAWLER_API_KEY || '';

function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '').trim();

  if (!ADMIN_API_KEY || !apiKey) {
    return false;
  }

  return apiKey === ADMIN_API_KEY;
}

// POST: Create a new invite
export async function POST(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { vendorId, usVendorId, email } = await request.json();

    if (!vendorId && !usVendorId) {
      return NextResponse.json(
        { error: 'Either vendorId (UK) or usVendorId (US) is required' },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const vendor = await getVendorInfo(vendorId, usVendorId);

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Create the invite
    const invite = await createInvite(vendorId, usVendorId, email, 'admin');

    if (!invite) {
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Generate the invite URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nicotine-pouches.org';
    const inviteUrl = `${baseUrl}/store/register?invite=${invite.invite_code}`;

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        inviteCode: invite.invite_code,
        inviteUrl,
        email: invite.email,
        expiresAt: invite.expires_at,
        vendor: {
          name: vendor.name,
          country: vendor.country,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite', details: error.message },
      { status: 500 }
    );
  }
}

// GET: List all invites
export async function GET(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'pending', 'used', 'expired', 'all'
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = supabaseAdmin()
      .from('store_invites')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    const now = new Date().toISOString();

    if (status === 'pending') {
      query = query.is('used_at', null).gt('expires_at', now);
    } else if (status === 'used') {
      query = query.not('used_at', 'is', null);
    } else if (status === 'expired') {
      query = query.is('used_at', null).lt('expires_at', now);
    }

    const { data: invites, error } = await query;

    if (error) {
      throw error;
    }

    // Enrich with vendor info
    const enrichedInvites = await Promise.all(
      (invites || []).map(async (invite) => {
        const vendor = await getVendorInfo(invite.vendor_id, invite.us_vendor_id);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nicotine-pouches.org';

        return {
          id: invite.id,
          inviteCode: invite.invite_code,
          inviteUrl: `${baseUrl}/store/register?invite=${invite.invite_code}`,
          email: invite.email,
          vendor: vendor ? {
            id: vendor.id,
            name: vendor.name,
            country: vendor.country,
          } : null,
          status: invite.used_at
            ? 'used'
            : new Date(invite.expires_at) < new Date()
            ? 'expired'
            : 'pending',
          expiresAt: invite.expires_at,
          usedAt: invite.used_at,
          createdAt: invite.created_at,
          createdBy: invite.created_by,
        };
      })
    );

    return NextResponse.json({
      invites: enrichedInvites,
      total: enrichedInvites.length,
    });
  } catch (error: any) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Revoke an invite
export async function DELETE(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const inviteId = url.searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin()
      .from('store_invites')
      .delete()
      .eq('id', inviteId)
      .is('used_at', null); // Only delete unused invites

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Invite revoked successfully',
    });
  } catch (error: any) {
    console.error('Error revoking invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite', details: error.message },
      { status: 500 }
    );
  }
}
