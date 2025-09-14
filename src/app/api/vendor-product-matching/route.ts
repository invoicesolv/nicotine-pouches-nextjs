import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper function to extract brand and flavor from product name
function extractBrandAndFlavor(productName: string): { brand: string; flavor: string } {
  const name = productName.trim();
  const parts = { brand: '', flavor: '' };
  
  // Common nicotine pouch patterns
  const patterns = [
    // Pattern: "4NX Arctic Mint" -> brand: "4NX", flavor: "Arctic Mint"
    /^([A-Z0-9]+)\s+(.+)$/,
    // Pattern: "77 Apple & Mint" -> brand: "77", flavor: "Apple & Mint"
    /^(\d+)\s+(.+)$/,
    // Pattern: "Velo Ice Cool" -> brand: "Velo", flavor: "Ice Cool"
    /^([A-Za-z]+)\s+(.+)$/
  ];
  
  for (const pattern of patterns) {
    const matches = name.match(pattern);
    if (matches) {
      parts.brand = matches[1].trim();
      parts.flavor = matches[2].trim();
      break;
    }
  }
  
  // If no pattern matched, try to split on common separators
  if (!parts.brand) {
    const separators = [' - ', ' | ', ' / ', ' & '];
    for (const sep of separators) {
      if (name.includes(sep)) {
        const split = name.split(sep, 2);
        parts.brand = split[0].trim();
        parts.flavor = split[1].trim();
        break;
      }
    }
  }
  
  return parts;
}

// Helper function to calculate flavor similarity
function calculateFlavorSimilarity(flavor1: string, flavor2: string): number {
  const f1 = flavor1.toLowerCase();
  const f2 = flavor2.toLowerCase();
  
  // Exact match
  if (f1 === f2) return 1.0;
  
  // Common flavor variations mapping
  const variations: { [key: string]: string[] } = {
    'mint': ['mint', 'minty', 'fresh mint', 'cool mint'],
    'arctic': ['arctic', 'ice', 'icy', 'cool', 'frost'],
    'berry': ['berry', 'berries', 'forest fruits', 'mixed berries'],
    'apple': ['apple', 'green apple', 'red apple'],
    'cherry': ['cherry', 'cherries', 'sour cherry'],
    'vanilla': ['vanilla', 'cream', 'sweet'],
    'cola': ['cola', 'coke', 'cola flavor'],
    'peach': ['peach', 'peaches', 'peachy'],
    'raspberry': ['raspberry', 'raspberries'],
    'tropical': ['tropical', 'tropical fruits', 'exotic'],
    'energy': ['energy', 'energizing', 'boost'],
    'fire': ['fire', 'spicy', 'hot', 'burning']
  };
  
  // Check if flavors are in the same variation group
  for (const [group, flavors] of Object.entries(variations)) {
    const f1_in_group = flavors.includes(f1);
    const f2_in_group = flavors.includes(f2);
    
    if (f1_in_group && f2_in_group) {
      return 0.9; // High similarity for same flavor group
    }
  }
  
  // Check for partial matches
  if (f1.includes(f2) || f2.includes(f1)) {
    return 0.7; // Medium similarity for partial matches
  }
  
  // Use Levenshtein distance for other cases
  const levenshtein = levenshteinDistance(f1, f2);
  const maxLength = Math.max(f1.length, f2.length);
  return 1 - (levenshtein / maxLength);
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Main similarity calculation function
function calculateSimilarity(str1: string, str2: string): number {
  // Convert to lowercase for better matching
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Extract brand and flavor for nicotine pouches
  const parts1 = extractBrandAndFlavor(s1);
  const parts2 = extractBrandAndFlavor(s2);
  
  // Calculate multiple similarity scores
  const scores: { [key: string]: number } = {};
  
  // 1. Basic string similarity
  const levenshtein = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  scores.basic = 1 - (levenshtein / maxLength);
  
  // 2. Brand matching (high weight)
  let brandScore = 0;
  if (parts1.brand && parts2.brand) {
    if (parts1.brand === parts2.brand) {
      brandScore = 1.0; // Exact brand match
    } else if (s2.includes(parts1.brand) || s1.includes(parts2.brand)) {
      brandScore = 0.8; // Partial brand match
    }
  }
  scores.brand = brandScore;
  
  // 3. Flavor matching (medium weight)
  let flavorScore = 0;
  if (parts1.flavor && parts2.flavor) {
    flavorScore = calculateFlavorSimilarity(parts1.flavor, parts2.flavor);
  }
  scores.flavor = flavorScore;
  
  // 4. Combined weighted score
  const combinedScore = (scores.basic * 0.2) + (scores.brand * 0.5) + (scores.flavor * 0.3);
  
  return combinedScore;
}

export async function POST(request: NextRequest) {
  try {
    const { vendor_product_name, vendor_id, threshold = 0.6 } = await request.json();

    if (!vendor_product_name) {
      return NextResponse.json(
        { error: 'Vendor product name is required' },
        { status: 400 }
      );
    }

    // Get all products from Supabase
    const { data: products, error } = await supabaseAdmin()
      .from('products')
      .select('id, name, brand, flavour')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Find potential matches using the sophisticated algorithm
    const matches = [];
    for (const product of products || []) {
      const similarity = calculateSimilarity(vendor_product_name, product.name);
      if (similarity >= threshold) {
        matches.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          flavour: product.flavour,
          similarity: Math.round(similarity * 100) / 100
        });
      }
    }

    // Sort by similarity score (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    // Return top 10 matches
    const topMatches = matches.slice(0, 10);

    return NextResponse.json({
      vendor_product: vendor_product_name,
      matches: topMatches,
      total_matches: matches.length
    });
  } catch (error) {
    console.error('Error in vendor product matching API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const threshold = parseFloat(searchParams.get('threshold') || '0.6');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Get vendor products
    const { data: vendorProducts, error: vendorError } = await supabaseAdmin()
      .from('vendor_products')
      .select('name')
      .eq('vendor_id', parseInt(vendorId));

    if (vendorError) {
      console.error('Error fetching vendor products:', vendorError);
      return NextResponse.json(
        { error: 'Failed to fetch vendor products' },
        { status: 500 }
      );
    }

    // Get all products
    const { data: products, error: productsError } = await supabaseAdmin()
      .from('products')
      .select('id, name, brand, flavour')
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Find matches for each vendor product
    const allMatches = [];
    for (const vendorProduct of vendorProducts || []) {
      const matches = [];
      for (const product of products || []) {
        const similarity = calculateSimilarity(vendorProduct.name, product.name);
        if (similarity >= threshold) {
          matches.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            flavour: product.flavour,
            similarity: Math.round(similarity * 100) / 100
          });
        }
      }

      // Sort by similarity and take top 5
      matches.sort((a, b) => b.similarity - a.similarity);
      const topMatches = matches.slice(0, 5);

      allMatches.push({
        vendor_product: vendorProduct.name,
        matches: topMatches
      });
    }

    return NextResponse.json({
      vendor_id: parseInt(vendorId),
      threshold,
      matches: allMatches
    });
  } catch (error) {
    console.error('Error in vendor product matching GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
