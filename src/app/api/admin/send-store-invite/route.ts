import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createInvite, getVendorInfo } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CRAWLER_API_KEY || '';

function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '').trim();
  if (!ADMIN_API_KEY || !apiKey) return false;
  return apiKey === ADMIN_API_KEY;
}

function generateInviteEmail(vendorName: string, inviteCode: string, inviteUrl: string, contactName?: string): string {
  const greeting = contactName ? contactName : `${vendorName} team`;
  const f = "'Plus Jakarta Sans',Arial,sans-serif";

  const spacer = (h: number) => `<table role="presentation" style="border-collapse:collapse"><tbody><tr><td height="${h}" style="height:${h}px;font-size:${h}px;line-height:${h}px;padding:0">&nbsp;</td></tr></tbody></table>`;
  const divider = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:100%;width:100%"><tbody><tr><td align="left"><hr class="divider-line" style="border:none;background-color:#EEEEEE;height:1px;font-size:1px;line-height:1px;Margin:0;padding:0;max-width:100%" /></td></tr></tbody></table>`;

  const featureRow = (text: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:100%"><tbody><tr><td valign="middle" width="28" style="padding-top:14px;padding-bottom:14px;padding-right:12px;width:28px"><span class="check-icon" style="color:#16a34a;font-size:18px;font-weight:700;font-family:Arial,sans-serif;">&#10003;</span></td><td valign="middle" width="100%" style="padding-top:14px;padding-bottom:14px;width:100%"><p class="primary" style="Margin:0;color:#0C0C0C;font-size:15px;font-family:${f};line-height:20px;font-weight:500">${text}</p></td></tr></tbody></table>${divider}`;

  const detailRow = (label: string, value: string, mono?: boolean) => {
    const valStyle = mono
      ? `font-family:'Courier New',Courier,monospace;font-size:18px;letter-spacing:1px`
      : `font-family:${f};font-size:16px`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:100%"><tbody><tr><td valign="middle" width="100%" style="padding-top:14px;padding-bottom:14px;width:100%"><p class="primary" style="Margin:0;color:#0C0C0C;font-size:15px;font-family:${f};line-height:20px">${label}</p></td><td valign="middle" align="right" style="padding-top:14px;padding-bottom:14px;padding-left:16px;white-space:nowrap"><p class="primary" style="Margin:0;color:#0C0C0C;${valStyle};line-height:20px;font-weight:700">${value}</p></td></tr></tbody></table>${divider}`;
  };

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <title>Your store dashboard is ready</title>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css" /><!--<![endif]-->
  <!--[if (gte mso 9)|(IE)]><style type="text/css">table{border-collapse:collapse;}</style><![endif]-->
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light only; }
    div[style*="Margin: 16px 0"] { Margin: 0 !important; }
    html, body { Margin: 0; padding: 0; border: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit !important; text-decoration: none !important; }
    #MessageViewBody a { color: inherit !important; text-decoration: none !important; }
    .nolink a { color: inherit !important; text-decoration: none !important; }
    .email-layout-content { padding-left: 40px; padding-right: 40px; }
    .email-content-wrapper { max-width: 600px; width: 100%; Margin: 0 auto; }
    @media screen and (max-width: 600px) { .main-container { width: 100% !important; } }
    @media screen and (max-width: 480px) { .email-layout-content { padding-left: 20px !important; padding-right: 20px !important; } }
  </style>
</head>
<body id="body" style="Margin:0;padding:0;border:0;background-color:#FEFEFE;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

  <div style="color:transparent;visibility:hidden;opacity:0;font-size:0px;border:0;max-height:1px;width:1px;margin:0px;padding:0px;display:none!important;line-height:0px!important;">
    Your products are already on nicotine-pouches.org — claim your free store dashboard to see rankings, analytics, and manage listings.
  </div>

  <table class="background-container" border="0" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#FEFEFE" width="100%" style="Margin:0;padding:0;border:0;border-collapse:collapse;background-color:#FEFEFE;width:100%">
    <tbody><tr><td align="center" valign="top" style="vertical-align:top">
      <table class="main-container" border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" bgcolor="#FEFEFE" style="Margin:0;padding:0;border:0;border-collapse:collapse;width:100%;background-color:#FEFEFE">
        <tbody><tr><td align="left" valign="top" style="text-align:left;vertical-align:top">

          <!-- Logo -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%"><tbody><tr><td>
            <table class="email-content-wrapper" role="presentation" width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;width:100%"><tbody><tr>
              <td class="email-layout-content" align="left" style="padding-top:24px;padding-bottom:24px">
                <a href="https://nicotine-pouches.org" target="_blank" style="display:inline-block;text-decoration:none"><img src="https://nicotine-pouches.org/logo.png" alt="Nicotine Pouches" width="200" height="54" style="display:block;-ms-interpolation-mode:bicubic;width:200px;height:54px" /></a>
              </td>
            </tr></tbody></table>
          </td></tr></tbody></table>

          <!-- Content -->
          <table class="email-content-wrapper" role="presentation" width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;width:100%"><tbody><tr>
            <td class="email-layout-content" align="left">

              ${spacer(8)}

              <h1 class="primary" style="Margin:0;color:#0C0C0C;font-size:28px;font-family:${f};line-height:32px;font-weight:700">Your store dashboard is ready</h1>

              ${spacer(12)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px">Hi ${greeting},</p>

              ${spacer(16)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px"><strong>${vendorName}</strong> is already listed on nicotine-pouches.org. Your products, prices, and stock status are compared against 10+ UK shops every day.</p>

              ${spacer(12)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px">We built a free store dashboard so you can see how you rank and manage your listings directly.</p>

              ${spacer(40)}

              <h2 class="primary" style="Margin:0;color:#0C0C0C;font-size:21px;font-family:${f};line-height:24px;font-weight:700">What's included</h2>

              ${spacer(16)}

              ${featureRow('Price rankings vs every competitor, per product')}
              ${featureRow('Shipping, stock rate, and Trustpilot score ranking')}
              ${featureRow('Click and impression analytics with period comparison')}
              ${featureRow('UTM tracking for conversion attribution')}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:100%"><tbody><tr><td valign="middle" width="28" style="padding-top:14px;padding-bottom:14px;padding-right:12px;width:28px"><span class="check-icon" style="color:#16a34a;font-size:18px;font-weight:700;font-family:Arial,sans-serif;">&#10003;</span></td><td valign="middle" width="100%" style="padding-top:14px;padding-bottom:14px;width:100%"><p class="primary" style="Margin:0;color:#0C0C0C;font-size:15px;font-family:${f};line-height:20px;font-weight:500">Product mapping and stock management</p></td></tr></tbody></table>

              ${spacer(40)}

              <h2 class="primary" style="Margin:0;color:#0C0C0C;font-size:21px;font-family:${f};line-height:24px;font-weight:700">Your invite</h2>

              ${spacer(16)}

              ${detailRow('Invite code', inviteCode, true)}
              ${detailRow('Cost', 'Free')}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:100%"><tbody><tr><td valign="middle" width="100%" style="padding-top:14px;padding-bottom:14px;width:100%"><p class="primary" style="Margin:0;color:#0C0C0C;font-size:15px;font-family:${f};line-height:20px">Contract</p></td><td valign="middle" align="right" style="padding-top:14px;padding-bottom:14px;padding-left:16px;white-space:nowrap"><p class="primary" style="Margin:0;color:#0C0C0C;font-family:${f};font-size:16px;line-height:20px;font-weight:700">None</p></td></tr></tbody></table>

              ${spacer(16)}

              <p style="Margin:0"><a href="${inviteUrl}" target="_blank" class="accent-link" style="color:#16a34a;font-size:16px;font-family:${f};line-height:22px;font-weight:700;text-decoration:none">Claim your dashboard &rarr;</a></p>

              ${spacer(12)}

              <p class="secondary" style="Margin:0;color:#555555;font-size:13px;font-family:${f};line-height:18px">Or paste the code at <a href="https://nicotine-pouches.org/store/register" style="color:inherit;text-decoration:underline">nicotine-pouches.org/store/register</a></p>

              ${spacer(40)}

              <h2 class="primary" style="Margin:0;color:#0C0C0C;font-size:21px;font-family:${f};line-height:24px;font-weight:700">Have a question?</h2>

              ${spacer(12)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px">Your products are already on the site. The dashboard just gives you visibility into the data and control over your listings. No fee, no contract, no catch.</p>

              ${spacer(16)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px">Reply to this email if anything's unclear. I read everything.</p>

              ${spacer(24)}

              <p class="primary" style="Margin:0;color:#0C0C0C;font-size:16px;font-family:${f};line-height:22px;font-weight:600">Kevin Negash</p>
              <p class="secondary" style="Margin:0;color:#555555;font-size:14px;font-family:${f};line-height:20px">Founder, nicotine-pouches.org</p>

              ${spacer(40)}

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:100%;width:100%"><tbody><tr><td class="divider-line" height="1" style="font-size:1px;line-height:1px;height:1px;background-color:#EEEEEE">&nbsp;</td></tr></tbody></table>

              ${spacer(30)}

              <a href="https://nicotine-pouches.org" target="_blank" style="display:inline-block;text-decoration:none"><img src="https://nicotine-pouches.org/logo.png" alt="Nicotine Pouches" width="150" height="40" style="display:block;-ms-interpolation-mode:bicubic;width:150px;height:40px" /></a>

              ${spacer(20)}

              <p class="secondary" style="Margin:0;color:#555555;font-size:13px;font-family:${f};line-height:18px">UK's largest nicotine pouch price comparison.<br /><span class="nolink">700+ products across 10+ shops, updated daily.</span></p>

              ${spacer(16)}

              <p class="secondary" style="Margin:0;color:#555555;font-size:12px;font-family:${f};line-height:17px">This is a one-time invitation. You won't receive further emails unless you create an account.</p>

              ${spacer(40)}

            </td>
          </tr></tbody></table>

        </td></tr></tbody>
      </table>
    </td></tr></tbody>
  </table>

</body>
</html>`;
}

export async function POST(request: NextRequest) {
  if (!authenticateAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { vendorId, usVendorId, email, contactName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!vendorId && !usVendorId) {
      return NextResponse.json({ error: 'Either vendorId or usVendorId is required' }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await getVendorInfo(vendorId, usVendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Create invite
    const invite = await createInvite(vendorId, usVendorId, email, 'admin');
    if (!invite) {
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nicotine-pouches.org';
    const inviteUrl = `${baseUrl}/store/register?invite=${invite.invite_code}`;

    // Generate and send email
    const html = generateInviteEmail(vendor.name, invite.invite_code, inviteUrl, contactName);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Kevin at Nicotine Pouches <kevin@nicotine-pouches.org>',
      to: email,
      subject: `${vendor.name} — your free store dashboard is ready`,
      html,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailError.message,
        invite: {
          inviteCode: invite.invite_code,
          inviteUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      emailId: emailData?.id,
      invite: {
        inviteCode: invite.invite_code,
        inviteUrl,
        expiresAt: invite.expires_at,
      },
      vendor: {
        name: vendor.name,
        country: vendor.country,
      },
    });
  } catch (error: any) {
    console.error('Error sending store invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite', details: error.message },
      { status: 500 }
    );
  }
}
