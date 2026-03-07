import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { getVendorInfo } from '@/lib/store-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : 'https://nicotine-pouches.org';

type Frequency = 'daily' | 'weekly' | 'monthly';

function getDaysForFrequency(freq: Frequency): number {
  if (freq === 'daily') return 1;
  if (freq === 'weekly') return 7;
  return 30;
}

function getFrequencyLabel(freq: Frequency): string {
  if (freq === 'daily') return 'Daily';
  if (freq === 'weekly') return 'Weekly';
  return 'Monthly';
}

function shouldSendReport(freq: Frequency, lastSentAt: string | null): boolean {
  if (!lastSentAt) return true;
  const last = new Date(lastSentAt);
  const now = new Date();
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  if (freq === 'daily') return hoursSince >= 20; // ~daily, with buffer
  if (freq === 'weekly') return hoursSince >= 144; // ~6 days
  return hoursSince >= 648; // ~27 days
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

function trendArrow(pct: number | null): string {
  if (pct === null) return '-';
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return '0%';
}

async function generateReportForUser(
  userId: string,
  vendorId: string | null,
  usVendorId: string | null,
  frequency: Frequency,
  includeAnalytics: boolean,
  includeProducts: boolean,
  includeRankings: boolean,
) {
  const vendor = await getVendorInfo(vendorId || undefined, usVendorId || undefined);
  if (!vendor) return null;

  const isUK = vendor.country === 'uk';
  const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
  const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
  const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
  const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;
  const analyticsVendorId = vendor.realVendorId;

  const days = getDaysForFrequency(frequency);
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  const prevStartDate = new Date();
  prevStartDate.setDate(startDate.getDate() - days);

  const report: any = { vendor, frequency, days, period: { start: startDate.toISOString().split('T')[0], end: now.toISOString().split('T')[0] } };

  // Product counts (always included for context)
  const [totalRes, inStockRes, mappedRes] = await Promise.all([
    supabaseAdmin().from(vpTable).select('id', { count: 'exact', head: true }).eq(vendorIdColumn, vendorIdValue),
    supabaseAdmin().from(vpTable).select('id', { count: 'exact', head: true }).eq(vendorIdColumn, vendorIdValue).eq('stock_status', 'in_stock'),
    supabaseAdmin().from(mappingTable).select('id', { count: 'exact', head: true }).eq(vendorIdColumn, vendorIdValue),
  ]);

  report.products = {
    total: totalRes.count || 0,
    inStock: inStockRes.count || 0,
    outOfStock: (totalRes.count || 0) - (inStockRes.count || 0),
    mapped: mappedRes.count || 0,
  };

  // Analytics
  if (includeAnalytics && analyticsVendorId) {
    const [clicksRes, impressionsRes, conversionsRes, prevClicksRes, prevImpressionsRes] = await Promise.all([
      supabaseAdmin().from('vendor_analytics').select('id', { count: 'exact', head: true }).eq('vendor_id', analyticsVendorId).eq('event_type', 'vendor_click').gte('timestamp', startDate.toISOString()),
      supabaseAdmin().from('vendor_analytics').select('id', { count: 'exact', head: true }).eq('vendor_id', analyticsVendorId).eq('event_type', 'vendor_exposure').gte('timestamp', startDate.toISOString()),
      supabaseAdmin().from('vendor_analytics').select('id', { count: 'exact', head: true }).eq('vendor_id', analyticsVendorId).eq('event_type', 'vendor_conversion').gte('timestamp', startDate.toISOString()),
      supabaseAdmin().from('vendor_analytics').select('id', { count: 'exact', head: true }).eq('vendor_id', analyticsVendorId).eq('event_type', 'vendor_click').gte('timestamp', prevStartDate.toISOString()).lt('timestamp', startDate.toISOString()),
      supabaseAdmin().from('vendor_analytics').select('id', { count: 'exact', head: true }).eq('vendor_id', analyticsVendorId).eq('event_type', 'vendor_exposure').gte('timestamp', prevStartDate.toISOString()).lt('timestamp', startDate.toISOString()),
    ]);

    const clicks = clicksRes.count || 0;
    const impressions = impressionsRes.count || 0;
    const conversions = conversionsRes.count || 0;
    const prevClicks = prevClicksRes.count || 0;
    const prevImpressions = prevImpressionsRes.count || 0;
    const ctr = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0;
    const prevCtr = prevImpressions > 0 ? parseFloat(((prevClicks / prevImpressions) * 100).toFixed(2)) : 0;

    report.analytics = {
      clicks, impressions, conversions, ctr,
      clicksTrend: pctChange(clicks, prevClicks),
      impressionsTrend: pctChange(impressions, prevImpressions),
      ctrTrend: pctChange(ctr, prevCtr),
    };
  }

  // CSV attachments
  report.csvAttachments = [];

  if (includeAnalytics && analyticsVendorId) {
    const { data: events } = await supabaseAdmin()
      .from('vendor_analytics')
      .select('timestamp, event_type')
      .eq('vendor_id', analyticsVendorId)
      .in('event_type', ['vendor_click', 'vendor_exposure', 'vendor_conversion'])
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })
      .limit(50000);

    const dateMap = new Map<string, { clicks: number; impressions: number; conversions: number }>();
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dateMap.set(d.toISOString().split('T')[0], { clicks: 0, impressions: 0, conversions: 0 });
    }
    for (const e of events || []) {
      const ds = new Date(e.timestamp).toISOString().split('T')[0];
      const day = dateMap.get(ds) || { clicks: 0, impressions: 0, conversions: 0 };
      if (e.event_type === 'vendor_click') day.clicks++;
      else if (e.event_type === 'vendor_exposure') day.impressions++;
      else if (e.event_type === 'vendor_conversion') day.conversions++;
      dateMap.set(ds, day);
    }

    const csvLines = ['Date,Clicks,Impressions,Conversions,CTR (%)'];
    for (const [date, d] of Array.from(dateMap.entries()).sort()) {
      const ctr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : '0.00';
      csvLines.push([date, d.clicks, d.impressions, d.conversions, ctr].map(escapeCsv).join(','));
    }
    report.csvAttachments.push({
      filename: `analytics-${now.toISOString().split('T')[0]}.csv`,
      content: Buffer.from(csvLines.join('\n')).toString('base64'),
    });
  }

  if (includeProducts) {
    const { data: products } = await supabaseAdmin()
      .from(vpTable)
      .select('product_name, price, stock_status, updated_at')
      .eq(vendorIdColumn, vendorIdValue)
      .order('product_name', { ascending: true })
      .limit(10000);

    const csvLines = ['Product Name,Price,Stock Status,Last Updated'];
    for (const p of products || []) {
      csvLines.push([
        p.product_name,
        p.price ? `£${parseFloat(p.price).toFixed(2)}` : 'N/A',
        p.stock_status || 'Unknown',
        p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : '',
      ].map(escapeCsv).join(','));
    }
    report.csvAttachments.push({
      filename: `products-${now.toISOString().split('T')[0]}.csv`,
      content: Buffer.from(csvLines.join('\n')).toString('base64'),
    });
  }

  return report;
}

function generateReportEmailHtml(report: any): string {
  const f = "'Plus Jakarta Sans',Arial,sans-serif";
  const freq = getFrequencyLabel(report.frequency);
  const vendorName = report.vendor.name;
  const period = `${report.period.start} to ${report.period.end}`;

  const kpiRow = (label: string, value: string | number, trend?: number | null) => {
    const trendHtml = trend !== null && trend !== undefined
      ? `<span style="color:${trend >= 0 ? '#16a34a' : '#dc2626'};font-size:13px;font-weight:600;margin-left:8px">${trend >= 0 ? '+' : ''}${trend}%</span>`
      : '';
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #EEEEEE;font-family:${f};font-size:14px;color:#555555">${label}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #EEEEEE;font-family:${f};font-size:16px;font-weight:700;color:#0C0C0C">${value}${trendHtml}</td>
      </tr>`;
  };

  let analyticsSection = '';
  if (report.analytics) {
    const a = report.analytics;
    analyticsSection = `
      <h2 style="margin:0 0 16px 0;font-family:${f};font-size:18px;font-weight:700;color:#0C0C0C">Performance</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${kpiRow('Clicks', a.clicks.toLocaleString(), a.clicksTrend)}
        ${kpiRow('Impressions', a.impressions.toLocaleString(), a.impressionsTrend)}
        ${kpiRow('Conversions', a.conversions.toLocaleString())}
        ${kpiRow('Click-Through Rate', a.ctr + '%', a.ctrTrend)}
      </table>
      <table role="presentation"><tr><td height="32" style="height:32px;font-size:32px;line-height:32px">&nbsp;</td></tr></table>`;
  }

  const p = report.products;
  const productsSection = `
    <h2 style="margin:0 0 16px 0;font-family:${f};font-size:18px;font-weight:700;color:#0C0C0C">Inventory</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      ${kpiRow('Total Products', p.total)}
      ${kpiRow('In Stock', p.inStock)}
      ${kpiRow('Out of Stock', p.outOfStock)}
      ${kpiRow('Mapped to Comparison', p.mapped)}
    </table>
    <table role="presentation"><tr><td height="32" style="height:32px;font-size:32px;line-height:32px">&nbsp;</td></tr></table>`;

  const attachmentNote = report.csvAttachments.length > 0
    ? `<p style="margin:0;font-family:${f};font-size:14px;color:#555555;line-height:20px">
        CSV reports are attached to this email for detailed analysis.
      </p>
      <table role="presentation"><tr><td height="24" style="height:24px;font-size:24px;line-height:24px">&nbsp;</td></tr></table>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css" />
  <!--<![endif]-->
  <style type="text/css">
    :root { color-scheme: light only; }
    html, body { margin: 0; padding: 0; }
    .email-layout-content { padding-left: 40px; padding-right: 40px; }
    @media screen and (max-width: 480px) {
      .email-layout-content { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FEFEFE">
  <div style="color:transparent;visibility:hidden;opacity:0;font-size:0px;max-height:1px;width:1px;display:none!important;line-height:0px!important">
    Your ${freq.toLowerCase()} store report for ${vendorName} — ${period}
  </div>
  <table border="0" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#FEFEFE" width="100%" style="border-collapse:collapse;background-color:#FEFEFE">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="600" style="max-width:600px;width:100%">
          <tr>
            <td class="email-layout-content" style="padding-top:24px;padding-bottom:24px">
              <a href="${BASE_URL}" style="display:inline-block;text-decoration:none">
                <img src="${BASE_URL}/logo.png" alt="Nicotine Pouches" width="200" height="54" style="display:block;width:200px;height:54px" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="email-layout-content">
              <table role="presentation"><tr><td height="8" style="height:8px;font-size:8px;line-height:8px">&nbsp;</td></tr></table>

              <h1 style="margin:0;font-family:${f};font-size:24px;font-weight:700;color:#0C0C0C;line-height:30px">
                ${freq} Report — ${vendorName}
              </h1>
              <table role="presentation"><tr><td height="8" style="height:8px;font-size:8px;line-height:8px">&nbsp;</td></tr></table>
              <p style="margin:0;font-family:${f};font-size:14px;color:#555555;line-height:20px">${period}</p>

              <table role="presentation"><tr><td height="32" style="height:32px;font-size:32px;line-height:32px">&nbsp;</td></tr></table>

              ${analyticsSection}
              ${productsSection}

              ${attachmentNote}

              <a href="${BASE_URL}/store" style="color:#16a34a;font-size:16px;font-family:${f};font-weight:700;text-decoration:none">View full dashboard &rarr;</a>

              <table role="presentation"><tr><td height="40" style="height:40px;font-size:40px;line-height:40px">&nbsp;</td></tr></table>

              <table role="presentation" width="100%"><tr><td height="1" style="height:1px;background-color:#EEEEEE;font-size:1px;line-height:1px">&nbsp;</td></tr></table>
              <table role="presentation"><tr><td height="24" style="height:24px;font-size:24px;line-height:24px">&nbsp;</td></tr></table>

              <a href="${BASE_URL}" style="display:inline-block;text-decoration:none">
                <img src="${BASE_URL}/logo.png" alt="Nicotine Pouches" width="150" height="40" style="display:block;width:150px;height:40px" />
              </a>
              <table role="presentation"><tr><td height="16" style="height:16px;font-size:16px;line-height:16px">&nbsp;</td></tr></table>
              <p style="margin:0;font-family:${f};font-size:12px;color:#999999;line-height:17px">
                You're receiving this because you enabled ${freq.toLowerCase()} reports in your store settings.<br />
                <a href="${BASE_URL}/store/settings" style="color:#999999;text-decoration:underline">Manage report preferences</a>
              </p>
              <table role="presentation"><tr><td height="40" style="height:40px;font-size:40px;line-height:40px">&nbsp;</td></tr></table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function handler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const frequencyParam = url.searchParams.get('frequency') as Frequency | null;
    const frequencies: Frequency[] = frequencyParam
      ? [frequencyParam]
      : ['daily', 'weekly', 'monthly'];

    // Get all users with active report preferences
    const { data: prefs, error: prefsError } = await supabaseAdmin()
      .from('store_report_preferences')
      .select('*, store_user:store_users(id, email, vendor_id, us_vendor_id, is_active)')
      .in('report_frequency', frequencies)
      .neq('report_frequency', 'off');

    if (prefsError) {
      console.error('Error fetching report preferences:', prefsError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    if (!prefs || prefs.length === 0) {
      return NextResponse.json({ message: 'No reports to send', sent: 0 });
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const pref of prefs) {
      const user = pref.store_user as any;
      if (!user || !user.is_active) { skipped++; continue; }

      const freq = pref.report_frequency as Frequency;
      if (!shouldSendReport(freq, pref.last_sent_at)) { skipped++; continue; }

      try {
        const report = await generateReportForUser(
          user.id,
          user.vendor_id,
          user.us_vendor_id,
          freq,
          pref.include_analytics,
          pref.include_products,
          pref.include_rankings,
        );

        if (!report) { skipped++; continue; }

        const emailTo = pref.email_override || user.email;
        const html = generateReportEmailHtml(report);

        const attachments = report.csvAttachments.map((a: any) => ({
          filename: a.filename,
          content: a.content,
        }));

        await resend.emails.send({
          from: 'Nicotine Pouches <reports@nicotine-pouches.org>',
          to: emailTo,
          subject: `${getFrequencyLabel(freq)} Report — ${report.vendor.name} — ${report.period.start} to ${report.period.end}`,
          html,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        // Update last_sent_at
        await supabaseAdmin()
          .from('store_report_preferences')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', pref.id);

        sent++;
      } catch (err: any) {
        console.error(`Error sending report for user ${user.id}:`, err);
        errors.push(`User ${user.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sent} reports, skipped ${skipped}`,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Store reports cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);

// Manual trigger with API key auth
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.CRAWLER_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handler(request);
}
