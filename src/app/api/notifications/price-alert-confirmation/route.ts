import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, productName, alertType, targetPrice, minPriceReduction, currentPrice } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const alertTypeText = alertType === 'target_price'
      ? `when price drops to £${parseFloat(targetPrice).toFixed(2)}`
      : `when price drops by £${parseFloat(minPriceReduction).toFixed(2)} or more`;

    await resend.emails.send({
      from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
      to: email,
      subject: `Price Alert Confirmed: ${productName}`,
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
                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">✓</span>
                </div>
                <h1 style="color: #1a1a1a; font-size: 26px; margin: 0 0 10px 0; font-weight: 700;">Price Alert Set!</h1>
                <p style="color: #666; font-size: 16px; margin: 0;">We'll notify you when the price changes</p>
              </div>

              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                <p style="color: #166534; font-size: 14px; margin: 0 0 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</p>
                <p style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px 0; font-weight: 700;">${productName}</p>

                <div style="border-top: 1px solid #bbf7d0; padding-top: 16px; margin-top: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666; font-size: 14px;">Current price:</span>
                    <span style="color: #1a1a1a; font-size: 16px; font-weight: 600;">${currentPrice}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666; font-size: 14px;">Alert trigger:</span>
                    <span style="color: #059669; font-size: 14px; font-weight: 600;">${alertTypeText}</span>
                  </div>
                </div>
              </div>

              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                You'll receive an email notification as soon as we detect a price change that matches your alert criteria.
              </p>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://nicotine-pouches.org" style="display: inline-block; background: linear-gradient(135deg, #111827 0%, #374151 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Browse More Products
                </a>
              </div>

              <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  You can manage your price alerts in your account dashboard.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return NextResponse.json({ success: true, message: 'Confirmation email sent' });

  } catch (error) {
    console.error('Price alert confirmation email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
