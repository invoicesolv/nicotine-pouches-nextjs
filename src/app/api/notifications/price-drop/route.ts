import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handler(request: NextRequest) {
  try {
    const { productName, productSlug, oldPrice, newPrice, vendorName, productImage } = await request.json();

    if (!productName || !newPrice) {
      return NextResponse.json({ error: 'Product name and new price required' }, { status: 400 });
    }

    // Find all users watching this product
    const { data: alerts, error } = await supabase()
      .from('price_alerts')
      .select('*')
      .eq('is_active', true)
      .eq('notified', false)
      .or(`product_name.eq.${productName},product_slug.eq.${productSlug}`);

    if (error) {
      console.error('Error fetching price alerts:', error);
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: 'No users to notify', count: 0 });
    }

    const savings = oldPrice ? (parseFloat(oldPrice) - parseFloat(newPrice)).toFixed(2) : null;
    const percentOff = oldPrice ? Math.round((1 - parseFloat(newPrice) / parseFloat(oldPrice)) * 100) : null;

    let sentCount = 0;
    const errors: string[] = [];

    for (const alert of alerts) {
      try {
        await resend.emails.send({
          from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
          to: alert.email,
          subject: `🔥 Price Drop: ${productName}`,
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
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                      PRICE DROP ALERT
                    </div>
                    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;">${productName}</h1>
                    <p style="color: #666; font-size: 14px; margin: 0;">has been reduced in price!</p>
                  </div>

                  ${productImage ? `
                  <div style="text-align: center; margin-bottom: 24px;">
                    <img src="${productImage}" alt="${productName}" style="max-width: 200px; height: auto; border-radius: 12px;" />
                  </div>
                  ` : ''}

                  <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
                      ${oldPrice ? `
                      <div>
                        <p style="color: #666; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Was</p>
                        <p style="color: #999; font-size: 24px; margin: 0; text-decoration: line-through;">£${parseFloat(oldPrice).toFixed(2)}</p>
                      </div>
                      <div style="font-size: 24px; color: #22c55e;">→</div>
                      ` : ''}
                      <div>
                        <p style="color: #166534; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Now</p>
                        <p style="color: #166534; font-size: 32px; margin: 0; font-weight: 700;">£${parseFloat(newPrice).toFixed(2)}</p>
                      </div>
                    </div>
                    ${savings && percentOff ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(22, 101, 52, 0.2);">
                      <span style="background-color: #166534; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                        Save £${savings} (${percentOff}% off)
                      </span>
                    </div>
                    ` : ''}
                  </div>

                  ${vendorName ? `
                  <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
                    Lowest price at <strong>${vendorName}</strong>
                  </p>
                  ` : ''}

                  <div style="text-align: center;">
                    <a href="https://nicotine-pouches.org/product/${productSlug || productName.toLowerCase().replace(/\s+/g, '-')}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 16px 40px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);">
                      View Deal
                    </a>
                  </div>

                  <div style="border-top: 1px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      You're receiving this because you set a price alert for this product.
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
          .from('price_alerts')
          .update({ notified: true })
          .eq('id', alert.id);

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${alert.email}:`, emailError);
        errors.push(alert.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} price drop notifications`,
      count: sentCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Price drop notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
