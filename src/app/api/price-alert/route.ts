import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET user's price alerts by user_id or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    let query = supabase()
      .from('price_alerts')
      .select('id, product_id, product_slug, product_name, target_price, current_price, created_at, alert_type');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim()).eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching price alerts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch price alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alerts: data || []
    });

  } catch (error) {
    console.error('Price alert GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, productName, productSlug, currentPrice, targetPrice, productImage, vendorName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Insert into price_alerts table
    const { data, error } = await supabase()
      .from('price_alerts')
      .insert([
        {
          email: emailLower,
          product_name: productName || 'Unknown Product',
          product_slug: productSlug || null,
          current_price: currentPrice || null,
          target_price: targetPrice || null,
          product_image: productImage || null,
          vendor_name: vendorName || null,
          notified: false,
          is_active: true
        }
      ])
      .select();

    if (error) {
      // Handle duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already tracking this product' },
          { status: 409 }
        );
      }

      console.error('Price alert error:', error);
      return NextResponse.json(
        { error: 'Failed to set price alert' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      const priceDisplay = currentPrice ? `£${parseFloat(currentPrice).toFixed(2)}` : 'current price';

      await resend.emails.send({
        from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
        to: emailLower,
        subject: `Price Alert Set${productName ? `: ${productName}` : ''}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">💰</span>
                  </div>
                  <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;">Price Alert Activated</h1>
                </div>

                <div style="background-color: #faf5ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9d5ff;">
                  <p style="color: #7c3aed; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">We're tracking:</p>
                  ${productName ? `<p style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">${productName}</p>` : ''}
                  ${currentPrice ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e9d5ff;">
                    <span style="color: #666; font-size: 14px;">Current price:</span>
                    <span style="color: #1a1a1a; font-size: 18px; font-weight: 700;">${priceDisplay}</span>
                  </div>
                  ` : ''}
                </div>

                <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                  We'll notify you immediately when the price drops. Never miss a deal again!
                </p>

                <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                  <p style="color: #166534; font-size: 14px; margin: 0; text-align: center;">
                    <strong>Tip:</strong> Set alerts on multiple products to maximize your savings
                  </p>
                </div>

                <div style="text-align: center;">
                  <a href="https://nicotine-pouches.org" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Browse More Products
                  </a>
                </div>

                <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You can unsubscribe from price alerts at any time.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send price alert email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Price alert set successfully!',
        data: data?.[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Price alert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
