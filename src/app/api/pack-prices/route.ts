import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const packSize = searchParams.get('packSize');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // For now, we'll return mock data since we don't have real vendor APIs
    // In a real implementation, this would fetch from actual vendor APIs
    const mockPackPrices = [
      {
        vendor_name: 'Northerner',
        pack_price: 15.99,
        pack_size: parseInt(packSize || '20'),
        price_per_pouch: 0.80,
        last_updated: new Date().toISOString(),
        is_active: true
      },
      {
        vendor_name: 'SnusDirect',
        pack_price: 16.49,
        pack_size: parseInt(packSize || '20'),
        price_per_pouch: 0.82,
        last_updated: new Date().toISOString(),
        is_active: true
      },
      {
        vendor_name: 'SnusViking',
        pack_price: 14.99,
        pack_size: parseInt(packSize || '20'),
        price_per_pouch: 0.75,
        last_updated: new Date().toISOString(),
        is_active: true
      },
      {
        vendor_name: 'TwoWombats',
        pack_price: 17.99,
        pack_size: parseInt(packSize || '20'),
        price_per_pouch: 0.90,
        last_updated: new Date().toISOString(),
        is_active: true
      }
    ];

    // Store the pack prices in the database
    const { error: insertError } = await supabase()
      .from('pack_prices')
      .upsert(
        mockPackPrices.map(price => ({
          product_id: parseInt(productId),
          ...price
        })),
        { onConflict: 'product_id,vendor_name,pack_size' }
      );

    if (insertError) {
      console.error('Error storing pack prices:', insertError);
    }

    return NextResponse.json({
      success: true,
      data: mockPackPrices,
      message: 'Pack prices fetched and stored successfully'
    });

  } catch (error) {
    console.error('Error fetching pack prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pack prices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, packSize, priceThreshold } = body;

    if (!productId || !packSize || !priceThreshold) {
      return NextResponse.json(
        { error: 'Product ID, pack size, and price threshold are required' },
        { status: 400 }
      );
    }

    // Fetch current pack prices
    const { data: packPrices, error: fetchError } = await supabase()
      .from('pack_prices')
      .select('*')
      .eq('product_id', productId)
      .eq('pack_size', packSize)
      .eq('is_active', true)
      .order('pack_price', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    // Find the lowest price
    const lowestPrice = packPrices?.[0]?.pack_price || 0;
    
    // Check if any price has dropped below threshold
    const priceDrops = packPrices?.filter((price: any) => 
      (lowestPrice - price.pack_price) >= priceThreshold
    ) || [];

    return NextResponse.json({
      success: true,
      data: {
        currentLowestPrice: lowestPrice,
        priceDrops: priceDrops,
        allPrices: packPrices
      }
    });

  } catch (error) {
    console.error('Error checking pack price drops:', error);
    return NextResponse.json(
      { error: 'Failed to check pack price drops' },
      { status: 500 }
    );
  }
}
