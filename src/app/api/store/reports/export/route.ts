import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest, AUTH_CACHE_HEADERS } from '@/lib/store-auth';
import { supabaseAdmin } from '@/lib/supabase';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: any[][]): string {
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: AUTH_CACHE_HEADERS });
    }

    const { vendor } = authResult;
    if (!vendor?.realVendorId && !vendor?.usVendorUuid) {
      return NextResponse.json({ error: 'No vendor associated' }, { status: 400 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'analytics';
    const days = parseInt(url.searchParams.get('days') || '30');

    const isUK = vendor.country === 'uk';
    const vpTable = isUK ? 'vendor_products' : 'us_vendor_products_new';
    const mappingTable = isUK ? 'vendor_product_mapping' : 'us_vendor_product_mapping';
    const vendorIdColumn = isUK ? 'vendor_id' : 'us_vendor_id';
    const vendorIdValue = isUK ? vendor.realVendorId : vendor.usVendorUuid;
    const analyticsVendorId = vendor.realVendorId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const now = new Date();

    let csv = '';
    let filename = '';

    if (type === 'analytics') {
      // Export daily analytics data
      if (!analyticsVendorId) {
        return NextResponse.json({ error: 'No analytics available' }, { status: 400 });
      }

      const { data: events } = await supabaseAdmin()
        .from('vendor_analytics')
        .select('timestamp, event_type, product_name')
        .eq('vendor_id', analyticsVendorId)
        .in('event_type', ['vendor_click', 'vendor_exposure', 'vendor_conversion'])
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true })
        .limit(50000);

      // Aggregate by date
      const dateMap = new Map<string, { clicks: number; impressions: number; conversions: number }>();
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        dateMap.set(d.toISOString().split('T')[0], { clicks: 0, impressions: 0, conversions: 0 });
      }

      for (const event of events || []) {
        const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
        const day = dateMap.get(dateStr) || { clicks: 0, impressions: 0, conversions: 0 };
        if (event.event_type === 'vendor_click') day.clicks++;
        else if (event.event_type === 'vendor_exposure') day.impressions++;
        else if (event.event_type === 'vendor_conversion') day.conversions++;
        dateMap.set(dateStr, day);
      }

      const headers = ['Date', 'Clicks', 'Impressions', 'Conversions', 'CTR (%)'];
      const rows = Array.from(dateMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, d]) => [
          date,
          d.clicks,
          d.impressions,
          d.conversions,
          d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : '0.00',
        ]);

      csv = toCsv(headers, rows);
      filename = `${vendor.name.replace(/\s+/g, '-').toLowerCase()}-analytics-${days}d-${now.toISOString().split('T')[0]}.csv`;

    } else if (type === 'products') {
      // Export all vendor products
      const { data: products } = await supabaseAdmin()
        .from(vpTable)
        .select('product_name, price, stock_status, updated_at')
        .eq(vendorIdColumn, vendorIdValue)
        .order('product_name', { ascending: true })
        .limit(10000);

      // Get mappings
      const { data: mappings } = await supabaseAdmin()
        .from(mappingTable)
        .select('vendor_product, product_id')
        .eq(vendorIdColumn, vendorIdValue);

      const mappingLookup = new Map((mappings || []).map((m: any) => [m.vendor_product?.toLowerCase(), m.product_id]));

      const headers = ['Product Name', 'Price', 'Stock Status', 'Mapped', 'Last Updated'];
      const rows = (products || []).map((p: any) => [
        p.product_name,
        p.price ? `£${parseFloat(p.price).toFixed(2)}` : 'N/A',
        p.stock_status || 'Unknown',
        mappingLookup.has(p.product_name?.toLowerCase()) ? 'Yes' : 'No',
        p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : '',
      ]);

      csv = toCsv(headers, rows);
      filename = `${vendor.name.replace(/\s+/g, '-').toLowerCase()}-products-${now.toISOString().split('T')[0]}.csv`;

    } else if (type === 'rankings') {
      // Export product-level price rankings (UK only)
      if (!vendor.realVendorId) {
        return NextResponse.json({ error: 'Rankings not available' }, { status: 400 });
      }

      const myVendorId = vendor.realVendorId;

      const { data: myMappings } = await supabaseAdmin()
        .from('vendor_product_mapping')
        .select('product_id, vendor_product')
        .eq('vendor_id', myVendorId)
        .not('product_id', 'is', null);

      if (!myMappings || myMappings.length === 0) {
        csv = toCsv(['Product', 'Your Price', 'Rank', 'Total Sellers', 'Best Price', 'Best Vendor'], []);
        filename = `${vendor.name.replace(/\s+/g, '-').toLowerCase()}-rankings-${now.toISOString().split('T')[0]}.csv`;
      } else {
        const productIds = myMappings.map((m: any) => m.product_id);

        const [productsRes, allMappingsRes, vendorsRes] = await Promise.all([
          supabaseAdmin().from('wp_products').select('id, name').in('id', productIds),
          supabaseAdmin().from('vendor_product_mapping').select('product_id, vendor_id, vendor_product').in('product_id', productIds),
          supabaseAdmin().from('vendors').select('id, name'),
        ]);

        const productMap = new Map((productsRes.data || []).map((p: any) => [p.id, p.name]));
        const vendorNameMap = new Map((vendorsRes.data || []).map((v: any) => [v.id, v.name]));

        const allVendorIds = Array.from(new Set((allMappingsRes.data || []).map((m: any) => m.vendor_id)));
        const { data: allPrices } = await supabaseAdmin()
          .from('vendor_products')
          .select('vendor_id, product_name, price, stock_status')
          .in('vendor_id', allVendorIds)
          .gt('price', 0)
          .limit(10000);

        const priceLookup = new Map<string, { price: number; stock: string }>();
        for (const vp of allPrices || []) {
          priceLookup.set(`${vp.vendor_id}::${vp.product_name?.toLowerCase()}`, {
            price: parseFloat(vp.price),
            stock: vp.stock_status,
          });
        }

        const headers = ['Product', 'Your Price', 'In Stock', 'Rank', 'Total Sellers', 'Best Price', 'Best Vendor', 'Price Difference'];
        const rows: any[][] = [];

        for (const mapping of myMappings) {
          const productName = productMap.get(mapping.product_id) || mapping.vendor_product;
          const competitors = (allMappingsRes.data || [])
            .filter((m: any) => m.product_id === mapping.product_id)
            .map((m: any) => {
              const info = priceLookup.get(`${m.vendor_id}::${m.vendor_product?.toLowerCase()}`);
              return info ? { vendorId: m.vendor_id, price: info.price, stock: info.stock } : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.price - b.price);

          const myEntry = competitors.find((c: any) => c.vendorId === myVendorId);
          const bestEntry = competitors[0];
          const myRank = competitors.findIndex((c: any) => c.vendorId === myVendorId) + 1;

          rows.push([
            productName,
            myEntry ? `£${myEntry.price.toFixed(2)}` : 'N/A',
            myEntry?.stock === 'in_stock' ? 'Yes' : 'No',
            myRank || 'N/A',
            competitors.length,
            bestEntry && bestEntry.vendorId !== myVendorId ? `£${bestEntry.price.toFixed(2)}` : '-',
            bestEntry && bestEntry.vendorId !== myVendorId ? vendorNameMap.get(bestEntry.vendorId) || '' : '-',
            myEntry && bestEntry && bestEntry.vendorId !== myVendorId
              ? `£${(myEntry.price - bestEntry.price).toFixed(2)}`
              : '-',
          ]);
        }

        rows.sort((a, b) => {
          const rankA = typeof a[3] === 'number' ? a[3] : 999;
          const rankB = typeof b[3] === 'number' ? b[3] : 999;
          return rankA - rankB;
        });

        csv = toCsv(headers, rows);
        filename = `${vendor.name.replace(/\s+/g, '-').toLowerCase()}-rankings-${now.toISOString().split('T')[0]}.csv`;
      }
    } else {
      return NextResponse.json({ error: 'Invalid export type. Use: analytics, products, rankings' }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in CSV export:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
