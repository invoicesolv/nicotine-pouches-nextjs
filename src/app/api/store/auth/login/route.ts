import { NextRequest, NextResponse } from 'next/server';
import {
  getStoreUserByEmail,
  verifyPassword,
  createSession,
  updateLastLogin,
  getVendorInfo,
  createSessionCookie,
  AUTH_CACHE_HEADERS,
} from '@/lib/store-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getStoreUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Create session
    const sessionResult = await createSession(user.id, ipAddress);

    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Update last login
    await updateLastLogin(user.id);

    // Get vendor info
    const vendor = await getVendorInfo(user.vendor_id || undefined, user.us_vendor_id || undefined);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        vendor_id: user.vendor_id,
        us_vendor_id: user.us_vendor_id,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        permissions: user.permissions,
      },
      vendor,
    }, { headers: AUTH_CACHE_HEADERS });

    // Set session cookie
    response.headers.set('Set-Cookie', createSessionCookie(sessionResult.token));

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
