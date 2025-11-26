import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { VENDOR_ANALYTICS_CONFIG, getCurrencySymbol, getRegionFromCurrency, isVendorSyncEnabled } from '../../../config/vendor-analytics';

interface VendorClickData {
  workspace_id: string;
  vendor_id: string;
  vendor_name: string;
  product_id: string;
  product_name: string;
  pack_size: string;
  price: number;
  currency: string;
  region: string;
  timestamp: string;  // Changed from click_timestamp to match AI-CRM schema
  user_ip: string;
  user_agent: string;
  referrer: string;
  session_id: string;
  store_id: string;
  test_mode: boolean;
  user_id: string;
  click_type: string;  // Added click_type field as required by AI-CRM
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields (exact same as WordPress plugin)
    const {
      action, // WordPress sends 'vendor_click_tracking'
      nonce, // WordPress sends nonce
      vendor_id,
      product_id,
      vendor_name,
      product_name,
      vendor_url,
      page_url,
      pack_size = '1',
      price = '0',
      currency = 'GBP',
      session_id,
      click_type = 'vendor_click'
    } = body;

    // For pack size changes, vendor_id might be empty
    if (!vendor_id && click_type !== 'pack_size_change') {
      return NextResponse.json(
        { success: false, error: 'Missing vendor ID' },
        { status: 400 }
      );
    }

    // Check if CRM sync is enabled
    if (!isVendorSyncEnabled()) {
      return NextResponse.json({
        success: true,
        message: 'Sync disabled, click not tracked'
      });
    }

    // Convert currency to match CRM expectations
    const currencySymbol = getCurrencySymbol(currency);

    // Parse price to numeric value
    let parsedPrice = 0;
    if (price && price !== '0') {
      const cleanPrice = price.toString().replace(/[^0-9.,]/g, '');
      const normalizedPrice = cleanPrice.replace(',', '.');
      parsedPrice = parseFloat(normalizedPrice);
    }

    // Get user IP address
    const userIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';

    // Get referrer
    const referrer = request.headers.get('referer') || page_url || '';

    // Determine region based on currency
    const region = getRegionFromCurrency(currency);

    // Generate session ID if not provided (exact same format as WordPress)
    const finalSessionId = session_id || `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare data matching CRM vendor_click_tracking table structure (exact same as WordPress plugin)
    const clickData: VendorClickData = {
      workspace_id: VENDOR_ANALYTICS_CONFIG.CRM_WORKSPACE_ID,
      vendor_id: vendor_id ? vendor_id.toString() : '0', // For pack size changes, vendor_id might be 0
      vendor_name: vendor_name || '',
      product_id: product_id || '',
      product_name: product_name || '',
      pack_size: pack_size.toString(),
      price: parsedPrice,
      currency: currencySymbol,
      region: region,
      timestamp: new Date().toISOString(), // Changed from click_timestamp to match AI-CRM schema
      user_ip: userIP,
      user_agent: userAgent,
      referrer: referrer,
      session_id: finalSessionId,
      store_id: 'wordpress-store', // Exact same as WordPress get_option('blogname', 'wordpress-store')
      test_mode: process.env.NODE_ENV === 'development', // Same as WordPress defined('WP_DEBUG') && WP_DEBUG
      user_id: 'anonymous_' + Math.random().toString(36).substr(2, 9), // Same as WordPress 'anonymous_' . uniqid()
      click_type: click_type // Added click_type field as required by AI-CRM
    };

    // Send to CRM API (exact same headers as WordPress plugin)
    const crmResponse = await fetch(VENDOR_ANALYTICS_CONFIG.CRM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': VENDOR_ANALYTICS_CONFIG.CRM_WORKSPACE_ID,
        'X-WP-Source': 'vendor-profiles-plugin', // Exact same as WordPress
        'User-Agent': 'WordPress-VendorProfiles/1.0' // Exact same as WordPress
      },
      body: JSON.stringify(clickData)
    });

    if (!crmResponse.ok) {
      const errorText = await crmResponse.text();
      console.error('CRM API error:', crmResponse.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `CRM API returned error code: ${crmResponse.status}. Response: ${errorText}` 
        },
        { status: 500 }
      );
    }

    // Also log to our analytics database (exact same structure as WordPress plugin)
    try {
      const { error: analyticsError } = await supabase()
        .from('vendor_analytics')
        .insert({
          event_type: click_type,
          vendor_id: vendor_id ? parseInt(vendor_id) : null, // For pack size changes, vendor_id might be null
          vendor_name: vendor_name || '',
          product_id: product_id ? parseInt(product_id) : null,
          product_name: product_name || '',
          event_data: JSON.stringify({
            vendor_url: vendor_url || '',
            page_url: page_url || '',
            pack_size: parseInt(pack_size),
            price: parsedPrice,
            currency: currencySymbol,
            region: region,
            session_id: finalSessionId,
            user_ip: userIP,
            user_agent: userAgent,
            referrer: referrer
          }), // Exact same as WordPress json_encode($event_data)
          user_ip: userIP,
          user_agent: userAgent,
          session_id: finalSessionId,
          timestamp: new Date().toISOString() // Same format as WordPress current_time('mysql')
        });

      if (analyticsError) {
        console.error('Analytics logging error:', analyticsError);
      }
    } catch (analyticsError) {
      console.error('Analytics database error:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully and synced to CRM',
      data: {
        vendor_id: vendor_id,
        product_id: product_id,
        workspace_id: VENDOR_ANALYTICS_CONFIG.CRM_WORKSPACE_ID,
        price: parsedPrice,
        currency: currencySymbol,
        timestamp: clickData.timestamp,
        response_code: crmResponse.status
      }
    });

  } catch (error) {
    console.error('Vendor click tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
