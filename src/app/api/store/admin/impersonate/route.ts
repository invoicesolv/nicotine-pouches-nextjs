import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, getVendorInfo, AUTH_CACHE_HEADERS } from '@/lib/store-auth';

// POST /api/store/admin/impersonate — Start impersonating a vendor
export async function POST(request: NextRequest) {
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
        { error: 'Unauthorized — super admin only' },
        { status: 403 }
      );
    }

    const { vendorId } = await request.json();

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await getVendorInfo(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const response = NextResponse.json({
      success: true,
      vendor,
    });

    // Set impersonation cookie (30 day max, cleared on stop)
    response.headers.append(
      'Set-Cookie',
      `store_impersonate=${vendorId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}${secure}`
    );

    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// DELETE /api/store/admin/impersonate — Stop impersonating
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const response = NextResponse.json({ success: true });

    // Clear impersonation cookie
    response.headers.append(
      'Set-Cookie',
      'store_impersonate=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
    );

    return response;
  } catch (error: any) {
    console.error('Stop impersonation error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
