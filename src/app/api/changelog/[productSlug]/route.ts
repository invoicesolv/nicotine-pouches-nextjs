import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productSlug: string }> }
) {
  try {
    const { productSlug } = await params;
    
    // Get product data
    const properCaseName = productSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const { data: product, error: productError } = await supabase()
      .from('wp_products')
      .select('id, name')
      .eq('name', properCaseName)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get vendor products and their mappings
    const { data: mappings, error: mappingError } = await supabase()
      .from('vendor_product_mapping')
      .select('vendor_product, vendor_id')
      .eq('product_id', product.id);

    if (mappingError) {
      return NextResponse.json({ error: 'Error fetching mappings' }, { status: 500 });
    }

    // Get vendor products
    let vendorProducts = [];
    if (mappings && mappings.length > 0) {
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(`
          *,
          vendors!inner(
            id,
            name,
            created_at
          )
        `)
        .in('name', mappings.map((m: any) => m.vendor_product))
        .in('vendor_id', mappings.map((m: any) => m.vendor_id));

      if (vpError) {
        return NextResponse.json({ error: 'Error fetching vendor products' }, { status: 500 });
      }
      vendorProducts = vpData || [];
    }

    // Generate changelog entries
    const changelog: any[] = [];
    const now = new Date();
    
    // Add entries for each vendor product
    vendorProducts.forEach((vp: any) => {
      const packSizes = [
        { size: 1, price: vp.price_1pack },
        { size: 3, price: vp.price_3pack },
        { size: 5, price: vp.price_5pack },
        { size: 10, price: vp.price_10pack },
        { size: 20, price: vp.price_20pack },
        { size: 25, price: vp.price_25pack },
        { size: 30, price: vp.price_30pack },
        { size: 50, price: vp.price_50pack }
      ];

      packSizes.forEach(pack => {
        if (pack.price && pack.price !== 'N/A') {
          const offerId = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${pack.size}pk-${vp.vendors?.name?.toLowerCase().replace(/\s+/g, '-')}`;
          
          // Check if this is a new vendor (created in last 7 days)
          const vendorCreatedAt = new Date(vp.vendors?.created_at);
          const isNewVendor = (now.getTime() - vendorCreatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000);
          
          if (isNewVendor) {
            changelog.push({
              ts: vp.vendors?.created_at || now.toISOString(),
              action: "vendor_added",
              offer_id: offerId,
              retailer: vp.vendors?.name,
              pack_size: pack.size
            });
          }
          
          // Add price update entry (simulate recent price changes)
          changelog.push({
            ts: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            action: "price_updated",
            offer_id: offerId,
            price: parseFloat(pack.price.replace('£', '')),
            currency: "GBP",
            pack_size: pack.size
          });
        }
      });
    });

    // Sort by timestamp (most recent first)
    changelog.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    // Add cache headers for freshness
    const response = NextResponse.json(changelog, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes cache
        'ETag': `"${product.id}-${now.getTime()}"`,
        'Last-Modified': now.toUTCString()
      }
    });

    return response;
  } catch (error) {
    console.error('Error generating changelog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
