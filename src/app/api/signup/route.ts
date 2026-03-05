import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { pushLeadToAxelio } from '@/lib/axelio';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'newsletter' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Insert signup into database
    const { data, error } = await supabase()
      .from('signups')
      .insert([
        {
          email: emailLower,
          source,
          is_active: true
        }
      ])
      .select();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        );
      }

      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe email' },
        { status: 500 }
      );
    }

    // Send confirmation email via Resend
    try {
      await resend.emails.send({
        from: 'Nicotine Pouches <noreply@nicotine-pouches.org>',
        to: emailLower,
        subject: 'Welcome to Nicotine Pouches!',
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
                  <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 10px 0;">Welcome!</h1>
                  <p style="color: #666; font-size: 16px; margin: 0;">Thanks for subscribing to Nicotine Pouches</p>
                </div>

                <div style="border-top: 1px solid #e9ecef; padding-top: 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hi there,
                  </p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for signing up! You're now part of our community and will be the first to know about:
                  </p>
                  <ul style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                    <li>New product releases and brands</li>
                    <li>Exclusive deals and discounts</li>
                    <li>Expert guides and reviews</li>
                    <li>Industry news and updates</li>
                  </ul>
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    In the meantime, feel free to explore our website and discover the best nicotine pouches available.
                  </p>

                  <div style="text-align: center;">
                    <a href="https://nicotine-pouches.org" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Explore Now
                    </a>
                  </div>
                </div>

                <div style="border-top: 1px solid #e9ecef; margin-top: 40px; padding-top: 20px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You received this email because you signed up at nicotine-pouches.org
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      // Log email error but don't fail the signup
      console.error('Failed to send confirmation email:', emailError);
    }

    // Push to Axelio CRM as a lead (fire-and-forget)
    pushLeadToAxelio(emailLower, source).catch((err) => {
      console.error('Failed to push lead to Axelio:', err);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed!',
        data: data[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
