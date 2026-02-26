import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handler(request: NextRequest) {
  try {
    const { productName, productSlug, vendorName, price, productImage } = await request.json();

    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 });
    }

    // Find all users waiting for this product
    const { data: notifications, error } = await supabase()
      .from('stock_notifications')
      .select('*')
      .eq('is_active', true)
      .eq('notified', false)
      .ilike('product_name', `%${productName}%`);

    if (error) {
      console.error('Error fetching stock notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ message: 'No users to notify', count: 0 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const notification of notifications) {
      try {
        await resend.emails.send({
          from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
          to: notification.email,
          subject: `🎉 Back in Stock: ${productName}`,
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
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">✓</span>
                    </div>
                    <div style="background-color: #22c55e; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                      BACK IN STOCK
                    </div>
                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;">${productName}</h1>
                    <p style="color: #666; font-size: 16px; margin: 0;">is available again!</p>
                  </div>

                  ${productImage ? `
                  <div style="text-align: center; margin-bottom: 24px;">
                    <img src="${productImage}" alt="${productName}" style="max-width: 200px; height: auto; border-radius: 12px;" />
                  </div>
                  ` : ''}

                  <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                    <p style="color: #166534; font-size: 16px; margin: 0; text-align: center;">
                      <strong>Great news!</strong> The product you were waiting for is now back in stock.
                    </p>
                    ${price ? `
                    <p style="color: #166534; font-size: 24px; margin: 16px 0 0 0; text-align: center; font-weight: 700;">
                      £${parseFloat(price).toFixed(2)}
                    </p>
                    ` : ''}
                    ${vendorName ? `
                    <p style="color: #666; font-size: 14px; margin: 8px 0 0 0; text-align: center;">
                      Available at ${vendorName}
                    </p>
                    ` : ''}
                  </div>

                  <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #fcd34d;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
                      ⚡ <strong>Act fast!</strong> Popular items can sell out quickly.
                    </p>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://nicotine-pouches.org/product/${productSlug || productName.toLowerCase().replace(/\s+/g, '-')}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 16px 40px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);">
                      Buy Now
                    </a>
                  </div>

                  <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      You're receiving this because you requested to be notified when this product was back in stock.
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        });

        // Mark as notified
        await supabase()
          .from('stock_notifications')
          .update({ notified: true })
          .eq('id', notification.id);

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${notification.email}:`, emailError);
        errors.push(notification.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} back-in-stock notifications`,
      count: sentCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Back in stock notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
