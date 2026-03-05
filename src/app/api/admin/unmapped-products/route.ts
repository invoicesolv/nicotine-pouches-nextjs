import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple admin key check
function checkAdminKey(request: NextRequest): boolean {
  const url = new URL(request.url);
  const adminKey = url.searchParams.get('adminKey');
  return adminKey === '9503283252';
}

// GET - Fetch unmapped products with filters
export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const vendor = url.searchParams.get('vendor');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin()
      .from('unmapped_products')
      .select('*', { count: 'exact' })
      .order('total_stores', { ascending: false })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (vendor) {
      query = query.eq('source_vendor', vendor);
    }

    if (search) {
      query = query.ilike('product_name', `%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching unmapped products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get list of unique vendors for filter dropdown
    const { data: vendors } = await supabaseAdmin()
      .from('unmapped_products')
      .select('source_vendor')
      .order('source_vendor');

    const vendorList = vendors?.map((v: { source_vendor: string }) => v.source_vendor) || [];
    const uniqueVendors = Array.from(new Set(vendorList));

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      vendors: uniqueVendors
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update unmapped product status or create as new product
export async function PATCH(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, mappedProductId, newProductData } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action required' }, { status: 400 });
    }

    // Get the unmapped product
    const { data: unmapped, error: fetchError } = await supabaseAdmin()
      .from('unmapped_products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !unmapped) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    switch (action) {
      case 'reject':
        // Mark as rejected
        await supabaseAdmin()
          .from('unmapped_products')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', id);
        return NextResponse.json({ success: true, message: 'Product rejected' });

      case 'map':
        // Map to existing product
        if (!mappedProductId) {
          return NextResponse.json({ error: 'mappedProductId required for map action' }, { status: 400 });
        }

        // Create vendor_product_mapping
        const { error: mappingError } = await supabaseAdmin()
          .from('vendor_product_mapping')
          .insert({
            product_id: mappedProductId,
            vendor_id: unmapped.source_vendor_id,
            vendor_product_name: unmapped.product_name,
            vendor_product_url: unmapped.source_url,
            created_at: new Date().toISOString()
          });

        if (mappingError) {
          console.error('Error creating mapping:', mappingError);
          return NextResponse.json({ error: mappingError.message }, { status: 500 });
        }

        // Update unmapped product status
        await supabaseAdmin()
          .from('unmapped_products')
          .update({
            status: 'mapped',
            mapped_product_id: mappedProductId,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        return NextResponse.json({ success: true, message: 'Product mapped successfully' });

      case 'create':
        // Create as new product in wp_products
        const productName = newProductData?.name || unmapped.product_name;
        const brand = newProductData?.brand || productName.split(' ')[0];

        const { data: newProduct, error: createError } = await supabaseAdmin()
          .from('wp_products')
          .insert({
            id: newProductData?.id || undefined,
            name: productName,
            brand_name: brand,
            image_url: newProductData?.image_url || unmapped.image_url || null,
            price: newProductData?.price || null,
            nicotine_mg: newProductData?.nicotine_mg || null,
            flavour_category: newProductData?.flavour_category || null,
            pouch_format: newProductData?.pouch_format || null,
            strength_category: newProductData?.strength_category || null,
            status: 'publish',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating product:', createError);
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        // Create vendor_product_mapping for the new product
        if (unmapped.source_vendor_id) {
          await supabaseAdmin()
            .from('vendor_product_mapping')
            .insert({
              product_id: newProduct.id,
              vendor_id: unmapped.source_vendor_id,
              vendor_product_name: unmapped.product_name,
              vendor_product_url: unmapped.source_url,
              created_at: new Date().toISOString()
            });
        }

        // Also create mappings for other stores that have this product
        if (unmapped.other_stores && unmapped.other_stores.length > 0) {
          for (const store of unmapped.other_stores) {
            if (store.vendorId && store.matchConfidence >= 0.8) {
              await supabaseAdmin()
                .from('vendor_product_mapping')
                .insert({
                  product_id: newProduct.id,
                  vendor_id: store.vendorId,
                  vendor_product_name: store.productName,
                  vendor_product_url: store.url || null,
                  created_at: new Date().toISOString()
                });
            }
          }
        }

        // Update unmapped product status
        await supabaseAdmin()
          .from('unmapped_products')
          .update({
            status: 'approved',
            mapped_product_id: newProduct.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        return NextResponse.json({
          success: true,
          message: 'New product created and mapped',
          productId: newProduct.id
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove unmapped product
export async function DELETE(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin()
      .from('unmapped_products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
