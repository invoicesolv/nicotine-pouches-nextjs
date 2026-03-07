import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: AUTH_CACHE_HEADERS });
    }

    const { data, error } = await supabaseAdmin()
      .from('store_report_preferences')
      .select('*')
      .eq('store_user_id', authResult.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Return defaults if no row exists
    return NextResponse.json({
      preferences: data || {
        report_frequency: 'off',
        include_analytics: true,
        include_products: true,
        include_rankings: true,
        email_override: null,
        last_sent_at: null,
      },
    });
  } catch (error) {
    console.error('Error fetching report preferences:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: AUTH_CACHE_HEADERS });
    }

    const body = await request.json();
    const { report_frequency, include_analytics, include_products, include_rankings, email_override } = body;

    const validFrequencies = ['off', 'daily', 'weekly', 'monthly'];
    if (report_frequency && !validFrequencies.includes(report_frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    if (email_override && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_override)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (report_frequency !== undefined) updateData.report_frequency = report_frequency;
    if (include_analytics !== undefined) updateData.include_analytics = include_analytics;
    if (include_products !== undefined) updateData.include_products = include_products;
    if (include_rankings !== undefined) updateData.include_rankings = include_rankings;
    if (email_override !== undefined) updateData.email_override = email_override || null;

    const { data, error } = await supabaseAdmin()
      .from('store_report_preferences')
      .upsert({
        store_user_id: authResult.user.id,
        ...updateData,
      }, { onConflict: 'store_user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving report preferences:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error('Error saving report preferences:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
