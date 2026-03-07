import { NextRequest, NextResponse } from 'next/server';
import { validateInviteCode, getVendorInfo, AUTH_CACHE_HEADERS } from '@/lib/store-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    const invite = await validateInviteCode(code);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 404, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Get vendor info for the invite
    const vendor = await getVendorInfo(invite.vendor_id || undefined, invite.us_vendor_id || undefined);

    return NextResponse.json({
      valid: true,
      email: invite.email,
      vendor: vendor ? {
        name: vendor.name,
        country: vendor.country,
      } : null,
      expiresAt: invite.expires_at,
    }, { headers: AUTH_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
