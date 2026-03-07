import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, createSession, createSessionCookie, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Only super_admin can impersonate
    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized — super admin only' },
        { status: 403 }
      );
    }

    const { vendorId } = await request.json();

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    // Find the store user for this vendor
    const { data: targetUser, error: userError } = await supabaseAdmin()
      .from('store_users')
      .select('id, email, vendor_id, role')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'No store account found for this vendor' },
        { status: 404 }
      );
    }

    // Create a session for the target user
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'admin-impersonate';
    const sessionResult = await createSession(targetUser.id, ipAddress);

    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Failed to create impersonation session' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      impersonating: targetUser.email,
    });

    response.headers.set('Set-Cookie', createSessionCookie(sessionResult.token));
    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
