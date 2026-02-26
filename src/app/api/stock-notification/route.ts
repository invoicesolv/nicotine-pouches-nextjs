import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, productName, vendorName, productSlug } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Insert into stock_notifications table
    const { data, error } = await supabase()
      .from('stock_notifications')
      .insert([
        {
          email: emailLower,
          product_name: productName,
          vendor_name: vendorName || 'Unknown',
          product_slug: productSlug || null,
          notified: false,
          is_active: true
        }
      ])
      .select();

    if (error) {
      // Handle duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already subscribed for this product' },
          { status: 409 }
        );
      }

      console.error('Stock notification error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
        to: emailLower,
        subject: `Stock Alert Set: ${productName}`,
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
                  <div style="width: 60px; height: 60px; background-color: #3b82f6; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">🔔</span>
                  </div>
                  <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;">Stock Alert Confirmed</h1>
                </div>

                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #bae6fd;">
                  <p style="color: #0369a1; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">You'll be notified when:</p>
                  <p style="color: #1a1a1a; font-size: 18px; margin: 0; font-weight: 700;">${productName}</p>
                  ${vendorName ? `<p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">from ${vendorName}</p>` : ''}
                  <p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">is back in stock</p>
                </div>

                <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                  We'll send you an email the moment this product becomes available again.
                </p>

                <div style="text-align: center;">
                  <a href="https://nicotine-pouches.org" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Continue Shopping
                  </a>
                </div>

                <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You'll only receive one email when this product is restocked.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send stock notification email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Stock alert set successfully!',
        data: data?.[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Stock notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
