import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotine-pouches.org';

export async function POST(request: NextRequest) {
  try {
    const { type, ...data } = await request.json();

    // Verify API key for external calls
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let endpoint: string;

    switch (type) {
      case 'price-drop':
        endpoint = `${BASE_URL}/api/notifications/price-drop`;
        break;
      case 'back-in-stock':
        endpoint = `${BASE_URL}/api/notifications/back-in-stock`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Queue the notification job via QStash
    const response = await qstash.publishJSON({
      url: endpoint,
      body: data,
      retries: 3,
    });

    return NextResponse.json({
      success: true,
      message: `Notification queued: ${type}`,
      messageId: response.messageId
    });

  } catch (error) {
    console.error('Notification trigger error:', error);
    return NextResponse.json({ error: 'Failed to queue notification' }, { status: 500 });
  }
}
