import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const brand = searchParams.get('brand');
    const flavour = searchParams.get('flavour');
    const strength = searchParams.get('strength');
    const format = searchParams.get('format');
    const locale = searchParams.get('locale') || 'uk';

    const offset = (page - 1) * limit;

    // Determine which products table to use based on locale
    const productsTable = locale === 'us' ? 'products_us' : 'products';

    // Build query with filters
    let query = supabase()
      .from(productsTable)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (brand) {
      query = query.eq('brand', brand);
    }
    if (flavour) {
      query = query.ilike('flavour', `%${flavour}%`);
    }
    if (strength) {
      query = query.eq('strength_group', strength);
    }
    if (format) {
      query = query.eq('format', format);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) throw productsError;

    // Get vendor products for price comparison
    const { data: vendorProducts, error: vendorError } = await supabase()
      .from('vendor_products')
      .select(`
        *,
        vendors (
          id,
          name,
          website,
          status
        )
      `)
      .eq('vendors.status', 'active');

    if (vendorError) throw vendorError;

    // Transform products to include vendor pricing
    const transformedProducts = products.map((product: any) => {
      // Find matching vendor products by name similarity
      const matchingVendorProducts = vendorProducts?.filter((vp: any) => 
        vp.product_name.toLowerCase().includes(product.name.toLowerCase().split(' ')[0]) ||
        product.name.toLowerCase().includes(vp.product_name.toLowerCase().split(' ')[0])
      ) || [];

      // Get the best price from vendor products
      const bestPrice = matchingVendorProducts.length > 0 
        ? Math.min(...matchingVendorProducts.map((vp: any) => vp.price))
        : 3.99; // Default price

      const storeCount = Math.min(matchingVendorProducts.length, 5);
      const watching = Math.floor(Math.random() * 30) + 10;

      const currencySymbol = locale === 'us' ? '$' : '£';
      const basePath = locale === 'us' ? '/us' : '';

      return {
        id: product.id,
        name: product.name,
        price: `${currencySymbol}${bestPrice.toFixed(2)}`,
        strength: product.strength_group,
        stores: storeCount,
        watching: watching,
        image: product.image_url || '/placeholder-product.jpg',
        link: `${basePath}/product/${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        brand: product.brand,
        flavour: product.flavour,
        format: product.format,
        vendor_products: matchingVendorProducts
      };
    });

    // Get total count for pagination
    let countQuery = supabase()
      .from(productsTable)
      .select('*', { count: 'exact', head: true });

    if (brand) {
      countQuery = countQuery.eq('brand', brand);
    }
    if (flavour) {
      countQuery = countQuery.ilike('flavour', `%${flavour}%`);
    }
    if (strength) {
      countQuery = countQuery.eq('strength_group', strength);
    }
    if (format) {
      countQuery = countQuery.eq('format', format);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
