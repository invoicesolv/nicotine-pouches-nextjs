import { NextRequest, NextResponse } from 'next/server';
import { validateInviteCode, getVendorInfo } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Debug: Check if supabase admin is working
    const admin = supabaseAdmin();
    if (!admin) {
      console.error('supabaseAdmin returned null');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Debug: Try a direct query
    const { data: debugData, error: debugError } = await admin
      .from('store_invites')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (debugError) {
      console.error('Direct query error:', debugError.code, debugError.message);
    }

    const invite = await validateInviteCode(code);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code', debug: { hasDebugData: !!debugData, debugError: debugError?.message } },
        { status: 404 }
      );
    }

    // Get vendor info for the invite
    const vendor = await getVendorInfo(invite.vendor_id || undefined, invite.us_vendor_id || undefined);

    return NextResponse.json({
      valid: true,
      email: invite.email, // Pre-filled email if specified
      vendor: vendor ? {
        name: vendor.name,
        country: vendor.country,
      } : null,
      expiresAt: invite.expires_at,
    });
  } catch (error: any) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'An error occurred', details: error.message },
      { status: 500 }
    );
  }
}
