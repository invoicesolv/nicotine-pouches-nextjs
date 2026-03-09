import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    return NextResponse.json({
      user: authResult.user,
      vendor: authResult.vendor,
      isImpersonating: authResult.isImpersonating || false,
    }, { headers: AUTH_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
