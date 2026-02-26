import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession, clearSessionCookie } from '@/lib/store-auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').filter(c => c).map(c => c.split('='))
    );
    const token = cookies['store_session'];

    if (token) {
      await invalidateSession(token);
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    // Still clear cookie even if there's an error
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  }
}
