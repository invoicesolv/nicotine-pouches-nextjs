import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/store-auth';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/store/claim — Step 1: Request claim (sends verification email)
export async function POST(request: NextRequest) {
  try {
    const { vendor_id, email } = await request.json();

    if (!vendor_id || !email) {
      return NextResponse.json({ error: 'vendor_id and email are required' }, { status: 400 });
    }

    // Find the unclaimed store account for this vendor
    const { data: account, error } = await supabaseAdmin()
      .from('store_users')
      .select('id, email, vendor_id, us_vendor_id, claimed, contact_email')
      .or(`vendor_id.eq.${vendor_id},us_vendor_id.eq.${vendor_id}`)
      .eq('claimed', false)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'No unclaimed store found for this vendor' }, { status: 404 });
    }

    // Generate claim token
    const claimToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Store the token and the email they want to claim with
    await supabaseAdmin()
      .from('store_users')
      .update({
        claim_token: claimToken,
        claim_token_expires_at: expiresAt.toISOString(),
        contact_email: email.toLowerCase(),
      })
      .eq('id', account.id);

    // Get vendor name
    const { data: vendor } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('name')
      .eq('id', vendor_id)
      .single();

    const vendorName = vendor?.name || 'your store';
    const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nicotine-pouches.org'}/store/claim?token=${claimToken}`;

    // Send verification email
    try {
      await resend.emails.send({
        from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
        to: email.toLowerCase(),
        subject: `Claim your ${vendorName} store on Nicotine Pouches`,
        html: `
          <div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #111; margin: 0;">Claim Your Store</h1>
              <p style="color: #666; font-size: 14px; margin-top: 8px;">nicotine-pouches.org</p>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Someone requested to claim the <strong>${vendorName}</strong> store portal on nicotine-pouches.org.
              </p>
              <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                If this was you, click the button below to set up your account. Your store already has product data, pricing, and analytics ready.
              </p>
              <div style="text-align: center;">
                <a href="${claimUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Claim ${vendorName}
                </a>
              </div>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link expires in 48 hours. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send claim email:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Claim request error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT /api/store/claim — Step 2: Complete claim (set password)
export async function PUT(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'token, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Find account by claim token
    const { data: account, error } = await supabaseAdmin()
      .from('store_users')
      .select('id, claim_token_expires_at, claimed')
      .eq('claim_token', token)
      .eq('claimed', false)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Invalid or expired claim token' }, { status: 400 });
    }

    // Check expiry
    if (new Date(account.claim_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Claim token has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash password and complete the claim
    const passwordHash = await hashPassword(password);

    const { error: updateError } = await supabaseAdmin()
      .from('store_users')
      .update({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        claimed: true,
        claim_token: null,
        claim_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('Claim update error:', updateError);
      return NextResponse.json({ error: 'Failed to complete claim' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Store claimed successfully. You can now log in.' });
  } catch (error) {
    console.error('Claim complete error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// GET /api/store/claim?token=xxx — Validate a claim token
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const { data: account, error } = await supabaseAdmin()
      .from('store_users')
      .select('id, contact_email, vendor_id, us_vendor_id, claimed, claim_token_expires_at')
      .eq('claim_token', token)
      .eq('claimed', false)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (new Date(account.claim_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    // Get vendor info
    const vendorId = account.vendor_id || account.us_vendor_id;
    const { data: vendor } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('name, country, logo_url')
      .eq('id', vendorId)
      .single();

    return NextResponse.json({
      valid: true,
      vendor: vendor || null,
      email: account.contact_email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
