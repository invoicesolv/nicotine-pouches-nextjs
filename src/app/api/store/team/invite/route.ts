import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Role hierarchy: higher number = more privilege
const ROLE_LEVELS: Record<string, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  store_owner: 4,
  super_admin: 5,
};

const INVITE_ALLOWED_ROLES = ['store_owner', 'admin', 'super_admin'];

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: AUTH_CACHE_HEADERS }
      );
    }

    const { user } = authResult;

    // Only store_owner, admin, or super_admin can invite
    if (!INVITE_ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite team members' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Validate role is a valid team role
    if (!ROLE_LEVELS[role]) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: viewer, editor, admin' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Can't invite someone with a higher role than yourself (unless super_admin)
    if (user.role !== 'super_admin' && ROLE_LEVELS[role] >= ROLE_LEVELS[user.role]) {
      return NextResponse.json(
        { error: 'Cannot invite someone with a role equal to or higher than your own' },
        { status: 403, headers: AUTH_CACHE_HEADERS }
      );
    }

    const vendorId = user.vendor_id || user.us_vendor_id;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'No vendor associated with this account' },
        { status: 400, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Check if email is already a team member for this vendor
    const normalizedEmail = email.toLowerCase();

    let existingQuery = supabaseAdmin()
      .from('store_users')
      .select('id')
      .eq('email', normalizedEmail);

    if (user.vendor_id && user.us_vendor_id) {
      existingQuery = existingQuery.or(`vendor_id.eq.${user.vendor_id},us_vendor_id.eq.${user.us_vendor_id}`);
    } else if (user.vendor_id) {
      existingQuery = existingQuery.eq('vendor_id', user.vendor_id);
    } else {
      existingQuery = existingQuery.eq('us_vendor_id', user.us_vendor_id);
    }

    const { data: existingUser } = await existingQuery.maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already a team member for this vendor' },
        { status: 409, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Generate invite code
    const inviteCode = randomBytes(24).toString('base64url');

    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insert invite
    const { data: invite, error: insertError } = await supabaseAdmin()
      .from('store_team_invites')
      .insert({
        vendor_id: vendorId,
        invited_by: user.id,
        email: normalizedEmail,
        role,
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating team invite:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500, headers: AUTH_CACHE_HEADERS }
      );
    }

    // Send invite email via Resend
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nicotine-pouches.org';
    const inviteUrl = `${baseUrl}/store/register?invite=${inviteCode}`;

    try {
      await resend.emails.send({
        from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
        to: normalizedEmail,
        subject: 'You have been invited to join a store team',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join a store team</h2>
            <p>You have been invited to join a vendor team on nicotine-pouches.org as a <strong>${role}</strong>.</p>
            <p>Click the link below to accept the invitation and create your account:</p>
            <p style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This invite expires in 7 days.</p>
            <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error('Error sending invite email:', emailError);
      // Don't fail the request — invite is created, email is best-effort
    }

    return NextResponse.json(
      { invite },
      { headers: AUTH_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in team invite API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500, headers: AUTH_CACHE_HEADERS }
    );
  }
}
