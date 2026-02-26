import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { supabase } from '@/lib/supabase';
import { Client } from '@upstash/qstash';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://nicotine-pouches.org';

async function handler(request: NextRequest) {
  try {
    // Get all active price alerts
    const { data: alerts, error: alertsError } = await supabase()
      .from('price_alerts')
      .select('*')
      .eq('is_active', true)
      .eq('notified', false);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: 'No active alerts to check', checked: 0 });
    }

    let notificationsQueued = 0;

    // Get unique product slugs from alerts
    const productSlugs = [...new Set(alerts.map(a => a.product_slug).filter(Boolean))];

    for (const slug of productSlugs) {
      // Get current price from wp_products
      const { data: product, error: productError } = await supabase()
        .from('wp_products')
        .select('name, slug, lowest_price, image_url')
        .eq('slug', slug)
        .single();

      if (productError || !product) continue;

      // Find alerts for this product where current price is lower than when they signed up
      const productAlerts = alerts.filter(a => a.product_slug === slug);

      for (const alert of productAlerts) {
        // If we have stored the original price and current is lower, notify
        if (alert.current_price && product.lowest_price < alert.current_price) {
          // Queue notification via QStash
          await qstash.publishJSON({
            url: `${BASE_URL}/api/notifications/price-drop`,
            body: {
              productName: product.name,
              productSlug: product.slug,
              oldPrice: alert.current_price,
              newPrice: product.lowest_price,
              productImage: product.image_url
            },
            retries: 3,
          });

          notificationsQueued++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${alerts.length} alerts, queued ${notificationsQueued} notifications`,
      checked: alerts.length,
      queued: notificationsQueued
    });

  } catch (error) {
    console.error('Cron check price alerts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);

// Also allow GET for manual testing (no signature verification)
export async function GET(request: NextRequest) {
  // Verify internal call or API key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.CRAWLER_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return handler(request);
}
