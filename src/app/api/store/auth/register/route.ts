import { NextRequest, NextResponse } from 'next/server';
import {
  validateInviteCode,
  markInviteAsUsed,
  createStoreUser,
  getStoreUserByEmail,
  createSession,
  getVendorInfo,
  createSessionCookie,
} from '@/lib/store-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, inviteCode } = await request.json();

    if (!email || !password || !inviteCode) {
      return NextResponse.json(
        { error: 'Email, password, and invite code are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate invite code
    const invite = await validateInviteCode(inviteCode);

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if invite has a specific email and if it matches
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invite code is for a different email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getStoreUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create the user
    const user = await createStoreUser(
      email,
      password,
      invite.vendor_id || undefined,
      invite.us_vendor_id || undefined
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Mark invite as used
    await markInviteAsUsed(invite.id);

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Create session
    const sessionResult = await createSession(user.id, ipAddress);

    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Account created but failed to create session. Please login.' },
        { status: 500 }
      );
    }

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
        permissions: user.permissions,
      },
      vendor,
    });

    // Set session cookie
    response.headers.set('Set-Cookie', createSessionCookie(sessionResult.token));

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
