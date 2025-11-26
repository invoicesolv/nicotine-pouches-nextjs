import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { productId, vendorId, rating, reviewText, userId } = await request.json();

    // Validate required fields
    if (!productId || !vendorId || !rating || !reviewText || !userId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate review text length
    if (reviewText.length > 160) {
      return NextResponse.json(
        { error: 'Review text must be 160 characters or less' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase()
      .from('wp_products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase()
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Insert review
    const { data, error } = await supabase()
      .from('reviews')
      .insert([
        {
          product_id: productId,
          vendor_id: vendorId,
          user_id: userId,
          rating,
          review_text: reviewText.trim(),
          is_approved: true
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reviewed this product from this vendor' },
          { status: 409 }
        );
      }
      console.error('Review submission error:', error);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Review submitted successfully', review: data[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Review API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const vendorId = searchParams.get('vendorId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    let query = supabase()
      .from('reviews')
      .select(`
        *,
        vendors!inner(
          id,
          name,
          logo_url
        )
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    console.error('Review fetch API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
