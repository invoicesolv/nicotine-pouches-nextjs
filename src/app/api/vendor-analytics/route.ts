import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Exact same validation as WordPress plugin
    const {
      event_type,
      event_data_raw
    } = body;

    if (!event_type) {
      return NextResponse.json(
        { success: false, error: 'Missing event type' },
        { status: 400 }
      );
    }

    // Parse event data (exact same as WordPress)
    const event_data = typeof event_data_raw === 'string' 
      ? JSON.parse(event_data_raw) 
      : event_data_raw;

    // Extract common data (exact same as WordPress)
    const vendor_id = event_data.vendor_id ? parseInt(event_data.vendor_id) : null;
    const vendor_name = event_data.vendor_name || '';
    const product_id = event_data.product_id ? parseInt(event_data.product_id) : null;
    const product_name = event_data.product_name || '';

    // Get additional context (exact same as WordPress)
    const user_ip = getUserIP(request);
    const user_agent = request.headers.get('user-agent') || '';
    const session_id = getOrCreateSessionId();

    // Log to database (exact same structure as WordPress)
    const { error: analyticsError } = await supabase()
      .from('vendor_analytics')
      .insert({
        event_type: event_type,
        vendor_id: vendor_id,
        vendor_name: vendor_name,
        product_id: product_id,
        product_name: product_name,
        event_data: JSON.stringify(event_data), // Exact same as WordPress json_encode($event_data)
        user_ip: user_ip,
        user_agent: user_agent,
        session_id: session_id,
        timestamp: new Date().toISOString() // Same format as WordPress current_time('mysql')
      });

    if (analyticsError) {
      console.error('Failed to insert vendor analytics:', analyticsError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event logged'
    });

  } catch (error) {
    console.error('Vendor analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user IP address (exact same as WordPress plugin)
function getUserIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (forwarded) {
    const ips = forwarded.split(',');
    for (const ip of ips) {
      const trimmedIP = ip.trim();
      if (isValidIP(trimmedIP)) {
        return trimmedIP;
      }
    }
  }

  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  return remoteAddr;
}

// Validate IP address (exact same logic as WordPress)
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Get or create session ID (exact same as WordPress)
function getOrCreateSessionId(): string {
  // In a real implementation, you'd use cookies or session storage
  // For now, generate a unique session ID like WordPress does
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
