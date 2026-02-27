import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRProductGridWithSidebar from '@/components/SSRProductGridWithSidebar';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { getSEOTags, renderSchemaTag, generateStandaloneAggregateRating, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getBrandSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getBrandAggregateRating } from '@/lib/aggregate-ratings';
import { generateBrandHreflang, generateSafeHreflang } from '@/lib/hreflang';
import { getBrandLogo } from '@/lib/brand-logos';
import './brand-page.css';

// Slug-to-brand mapping: maps display name slugs to database brand values
// This handles cases where homepage uses full display names (e.g., "Nordic Spirit")
// but database stores shortened brand names (e.g., "Nordic")
const slugToBrandMap: Record<string, { displayName: string; queryPattern: string; useProductName: boolean }> = {
  'nordic-spirit': { displayName: 'Nordic Spirit', queryPattern: 'Nordic Spirit', useProductName: true },
  'white-fox': { displayName: 'White Fox', queryPattern: 'White Fox', useProductName: true },
  'vyou': { displayName: 'V&YOU', queryPattern: 'V&YOU', useProductName: false }, // Try regular ampersand first, code will try HTML entity as fallback
  'v-you': { displayName: 'V&YOU', queryPattern: 'V&YOU', useProductName: false }, // Try regular ampersand first, code will try HTML entity as fallback
  'juice-head': { displayName: 'Juice Head', queryPattern: 'Juice Head', useProductName: true },
};

// Helper function to convert slug to potential brand name for product name matching
function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Fetch brand data from Supabase
async function getBrandData(slug: string) {
  try {
    const slugLower = slug.toLowerCase();
    let displayBrandName: string | null = null;
    let queryPattern: string | null = null;
    let useProductNameQuery = false;
    
    // Strategy 1: Check slug-to-brand mapping first
    const mapping = slugToBrandMap[slugLower];
    if (mapping) {
      displayBrandName = mapping.displayName;
      queryPattern = mapping.queryPattern;
      useProductNameQuery = mapping.useProductName;
    } else {
      // Strategy 2: Try matching against brand column directly
      // Get all unique brands from database (first word of product name)
      const { data: allProducts } = await supabase()
        .from('wp_products')
        .select('name')
        .not('name', 'is', null);
      
      const brandNames: string[] = (allProducts || [])
        .map((p: any) => p.name?.split(' ')[0])
        .filter((brand: any): brand is string => typeof brand === 'string' && Boolean(brand));
      const uniqueBrands = Array.from(new Set(brandNames));
      
      const slugNormalized = slugLower.replace(/[^a-z0-9]/g, '');
      
      // Find matching brand (case-insensitive, handle special characters)
      const foundBrand = uniqueBrands.find((brand: string) => {
        if (!brand) return false;
        const brandLower = brand.toLowerCase();
        const brandNormalized = brandLower.replace(/[^a-z0-9]/g, '');
        
        return brandNormalized === slugNormalized || 
               brandLower === slugLower ||
               brandLower.replace(/[^a-z0-9]/g, '') === slugNormalized;
      });
      
      if (foundBrand) {
        displayBrandName = foundBrand;
        queryPattern = foundBrand;
        useProductNameQuery = false;
      } else {
        // Strategy 3: Try matching against product names (for multi-word brands)
        // Convert slug to display name: "nordic-spirit" -> "Nordic Spirit"
        const potentialDisplayName = slugToDisplayName(slug);
        
        // Check if any product name starts with this display name
        const { data: testProducts } = await supabase()
          .from('wp_products')
          .select('name')
          .ilike('name', `${potentialDisplayName}%`)
          .limit(1);
        
        if (testProducts && testProducts.length > 0) {
          displayBrandName = potentialDisplayName;
          queryPattern = potentialDisplayName;
          useProductNameQuery = true;
        }
      }
    }
    
    if (!displayBrandName || !queryPattern) {
      return null;
    }
    
    // Query products based on the matching strategy
    let products;
    let error;
    
    if (useProductNameQuery) {
      // For multi-word brands, query by product name pattern
      const result = await supabase()
        .from('wp_products')
        .select('*')
        .ilike('name', `${queryPattern}%`)
        .not('image_url', 'is', null)
        .order('name');
      
      products = result.data;
      error = result.error;
    } else {
      // Query by brand column (first word of product name)
      // For brands with special characters like V&YOU, try multiple patterns
      const patternsToTry: string[] = [queryPattern];
      
      // Add alternative patterns for ampersand handling
      if (queryPattern.includes('&amp;')) {
        patternsToTry.push(queryPattern.replace(/&amp;/g, '&'));
      }
      if (queryPattern.includes('&') && !queryPattern.includes('&amp;')) {
        patternsToTry.push(queryPattern.replace(/&/g, '&amp;'));
      }
      
      let result: any = { data: null, error: null };
      
      // Try each pattern until we find results
      for (const pattern of patternsToTry) {
        result = await supabase()
      .from('wp_products')
      .select('*')
          .ilike('name', `${pattern}%`)
      .not('image_url', 'is', null)
      .order('name');
        
        if (result.data && result.data.length > 0) {
          break;
        }
      }
      
      // If still no results with image filter, try without image filter
      if (!result.data || result.data.length === 0) {
        for (const pattern of patternsToTry) {
          result = await supabase()
            .from('wp_products')
            .select('*')
            .ilike('name', `${pattern}%`)
            .order('name');
          
          if (result.data && result.data.length > 0) {
            break;
          }
        }
      }
      
      products = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching brand products:', error);
      return null;
    }

    if (!products || products.length === 0) {
      return null;
    }

    // Get the first product as featured
    const featuredProduct = products[0];

    return {
      brandName: displayBrandName,
      featuredProduct: {
        id: featuredProduct.id,
        name: featuredProduct.name,
        image: featuredProduct.image_url || '/placeholder-product.jpg',
        description: featuredProduct.content || `Compare ${displayBrandName} nicotine pouches - best prices and deals UK.`,
        brand: featuredProduct.name.split(' ')[0],
        strength_group: 'Normal',
        flavour: featuredProduct.name.split(' ').slice(1).join(' '),
        format: 'Slim'
      },
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error in getBrandData:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brandData = await getBrandData(slug);
  
  if (!brandData) {
    return {
      title: 'Brand Not Found',
      description: 'The requested brand could not be found.'
    };
  }

  // Fetch aggregate rating for the brand
  const ratingData = await getBrandAggregateRating(brandData.brandName);
  
  // Prepare brand data for SEO template
  const brandSEOData = {
    brandName: brandData.brandName,
    description: brandData.featuredProduct.description,
    productCount: brandData.totalProducts,
    image: brandData.featuredProduct.image,
    // Only include aggregateRating if we have valid reviews (reviewCount > 0)
    // Google rejects schema with reviewCount: 0
    aggregateRating: ratingData?.aggregateRating && ratingData.reviewCount > 0 
      ? ratingData.aggregateRating 
      : undefined
  };

  // Generate SEO data using centralized template
  const seoData = getBrandSEOTemplate(brandSEOData);
  
  // Use centralized SEO function
  return getSEOTags('brand', seoData);
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandData = await getBrandData(slug);

  if (!brandData) {
    notFound();
  }

  // Fetch aggregate rating for the brand
  const ratingData = await getBrandAggregateRating(brandData.brandName);
  
  // Prepare brand data for schema
  const brandSEOData = {
    brandName: brandData.brandName,
    description: brandData.featuredProduct.description,
    productCount: brandData.totalProducts,
    image: brandData.featuredProduct.image,
    // Only include aggregateRating if we have valid reviews (reviewCount > 0)
    // Google rejects schema with reviewCount: 0
    aggregateRating: ratingData?.aggregateRating && ratingData.reviewCount > 0 
      ? ratingData.aggregateRating 
      : undefined
  };

  // Generate breadcrumb data
  const breadcrumbs = generateBreadcrumbData('brand', brandSEOData);

  return (
    <>
      {/* Standalone AggregateRating Schema - Only render if reviewCount > 0 */}
      {ratingData && ratingData.reviewCount > 0 && generateStandaloneAggregateRating('Brand', brandData.brandName, ratingData.aggregateRating)}
      
      {/* Brand Schema */}
      {renderSchemaTag('brand', brandSEOData)}
      
      {/* Breadcrumb Schema */}
      {generateBreadcrumbSchema(breadcrumbs)}
      
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          {/* Header */}
          <Header />

        {/* Main Content */}
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          padding: '0',
          margin: '0',
          width: '100%'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="compare-container" style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 15px',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              color: '#666'
            }}>
              <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/compare" style={{ color: '#666', textDecoration: 'none' }}>Compare Nicotine Pouches</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/guides" style={{ color: '#666', textDecoration: 'none' }}>Guides</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/here-we-are" style={{ color: '#666', textDecoration: 'none' }}>About Us</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>{brandData.brandName}</span>
            </div>
          </div>

          {/* Page Header */}
          <div className="page-header" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="compare-container" style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 15px',
              textAlign: 'center'
            }}>
              {/* Brand Logo */}
              {getBrandLogo(brandData.brandName) && (
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Image
                    src={getBrandLogo(brandData.brandName)!}
                    alt={`${brandData.brandName} logo`}
                    width={200}
                    height={200}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      height: 'auto',
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                    unoptimized
                  />
                </div>
              )}
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: '#333',
                margin: '0 0 15px 0'
              }}>
                {brandData.brandName} Nicotine Pouches
              </h1>
              <p style={{
                fontSize: '18px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Find the best prices for {brandData.brandName} nicotine pouches from top UK vendors. 
                Compare ratings, strengths, and flavors to find your perfect match.
              </p>
            </div>
          </div>

          {/* UK Products Section with Sidebar - Responsive */}
          <SSRProductGridWithSidebar brandFilter={brandData.brandName} />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}