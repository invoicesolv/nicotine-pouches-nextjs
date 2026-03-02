import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// In-memory rate limiting: 3 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { store_name, contact_email, website_url, country, message } = body;

    // Validate required fields
    if (!store_name?.trim()) {
      return NextResponse.json({ error: 'Store name is required.' }, { status: 400 });
    }
    if (!contact_email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    if (!country || !['uk', 'us'].includes(country)) {
      return NextResponse.json({ error: 'Country must be UK or US.' }, { status: 400 });
    }

    // Check for duplicate pending application with same email
    const { data: existing } = await supabaseAdmin()
      .from('store_applications')
      .select('id')
      .eq('contact_email', contact_email.toLowerCase().trim())
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An application with this email is already pending review.' },
        { status: 409 }
      );
    }

    // Insert application
    const { error: insertError } = await supabaseAdmin()
      .from('store_applications')
      .insert({
        store_name: store_name.trim(),
        contact_email: contact_email.toLowerCase().trim(),
        website_url: website_url?.trim() || null,
        country,
        message: message?.trim() || null,
        ip_address: ip,
      });

    if (insertError) {
      console.error('Error inserting store application:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Store application error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
