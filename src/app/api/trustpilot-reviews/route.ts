import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Vendor logo mapping for local paths
const vendorLogoMapping: { [key: string]: string } = {
  'Two Wombats': '/vendor-logos/two-wombats.jpg',
  'HAYYP': '/vendor-logos/HAYPP.jpg',
  'Snusifer': '/vendor-logos/Snusifer.png',
  'Emeraldpods': '/vendor-logos/Emeraldpods.webp',
  'Emerald': '/vendor-logos/Emeraldpods.webp',
  'Snus Vikings': '/vendor-logos/Snus-viking.png',
  'Northerner UK': '/vendor-logos/northerner_black_mobile.webp',
  'Northerner US': '/vendor-logos/northerner_black_mobile.webp',
  'Nicokick': '/vendor-logos/Nicokick.png',
  'Nicokick (55788)': '/vendor-logos/Nicokick.png',
  'Nicpouch': '/vendor-logos/NICPOUCHUK.jpg',
  'GotPouches': '/vendor-logos/gotpouches.png',
  'SnusDirect': '/vendor-logos/snusdirekt.avif',
  'SnusDaddy': '/vendor-logos/pouchdaddy.png',
  'Prime Nic Pouches': '/vendor-logos/PrimeNicPouches.png',
  'Prime': '/vendor-logos/PrimeNicPouches.png',
  'PrimeNicPouches': '/vendor-logos/PrimeNicPouches.png',
  'PrimeVapes': '/vendor-logos/PrimeVapes.png',
  'NicoUK': '/vendor-logos/NicoUK.png',
  'NicPouches': '/vendor-logos/NicPouches.svg',
  'SnusBoys': '/vendor-logos/SnusBoys.png',
  'NicPouchesDirect': '/vendor-logos/NicPouchesDirect.png',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Support single vendorId OR multiple vendorIds (comma-separated)
    const vendorId = searchParams.get('vendorId');
    const vendorIdsParam = searchParams.get('vendorIds');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Parse vendor IDs
    let vendorIds: number[] = [];
    if (vendorIdsParam) {
      vendorIds = vendorIdsParam.split(',').map(Number).filter(Boolean);
    } else if (vendorId) {
      vendorIds = [parseInt(vendorId)];
    }

    if (vendorIds.length === 0) {
      return NextResponse.json(
        { error: 'vendorId or vendorIds is required' },
        { status: 400 }
      );
    }

    // Fetch Trustpilot reviews for the vendor(s)
    const { data: reviews, error } = await supabaseAdmin()
      .from('trustpilot_reviews')
      .select('*')
      .in('vendor_id', vendorIds)
      .order('review_date', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching Trustpilot reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabaseAdmin()
      .from('trustpilot_reviews')
      .select('*', { count: 'exact', head: true })
      .in('vendor_id', vendorIds);

    // Get vendor names for the reviews
    const uniqueVendorIds = [...new Set(reviews?.map(r => r.vendor_id) || [])];
    const { data: vendors } = await supabaseAdmin()
      .from('vendors')
      .select('id, name, logo_url')
      .in('id', uniqueVendorIds);

    const vendorMap = new Map(vendors?.map(v => [v.id, { name: v.name, logo: v.logo_url }]) || []);

    // Add vendor info to reviews
    const enrichedReviews = reviews?.map(review => {
      const vendor = vendorMap.get(review.vendor_id);
      const vendorName = vendor?.name || 'Unknown Vendor';
      const localLogo = vendorLogoMapping[vendorName];
      return {
        ...review,
        vendor_name: vendorName,
        vendor_logo: localLogo || vendor?.logo || null
      };
    }) || [];

    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      reviews: enrichedReviews,
      total,
      limit,
      offset,
      hasMore
    });
  } catch (error: any) {
    console.error('Error in trustpilot-reviews API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

