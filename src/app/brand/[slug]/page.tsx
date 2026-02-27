import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRProductGridWithSidebar from '@/components/SSRProductGridWithSidebar';
import SortDropdown from '@/components/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
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

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
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
          
          {/* Hero Section - PriceRunner Style */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px 20px 32px 20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Breadcrumb */}
            <nav style={{
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <Link href="/" style={{
                color: '#1f2937',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '400'
              }}>Start</Link>
              <span style={{
                margin: '0 10px',
                color: '#9ca3af',
                fontSize: '15px'
              }}>/</span>
              <Link href="/compare" style={{
                color: '#1f2937',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '400'
              }}>Compare</Link>
              <span style={{
                margin: '0 10px',
                color: '#9ca3af',
                fontSize: '15px'
              }}>/</span>
              <span style={{
                color: '#6b7280',
                fontSize: '15px'
              }}>{brandData.brandName}</span>
            </nav>

            {/* Brand Logo and Title Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '16px'
            }}>
              {/* Brand Logo */}
              {getBrandLogo(brandData.brandName) && (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #e5e7eb'
                }}>
                  <Image
                    src={getBrandLogo(brandData.brandName)!}
                    alt={`${brandData.brandName} logo`}
                    width={60}
                    height={60}
                    style={{
                      objectFit: 'contain'
                    }}
                    unoptimized
                  />
                </div>
              )}
              <h1 style={{
                fontSize: '42px',
                fontWeight: '800',
                color: '#1f2937',
                margin: '0',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                letterSpacing: '-0.5px',
                lineHeight: '1.1'
              }}>
                {brandData.brandName} Nicotine Pouches
              </h1>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '17px',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0',
              lineHeight: '1.7',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Find the best prices for {brandData.brandName} nicotine pouches from top UK vendors.
              Compare ratings, strengths, and flavors to find your perfect match.
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{
            backgroundColor: '#f4f5f9',
            padding: '16px 20px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  Filter
                </span>
                <span style={{
                  fontSize: '15px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {brandData.totalProducts}+ products
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </span>
              </div>
              <Suspense fallback={<span style={{ fontSize: '14px', color: '#1f2937' }}>Sort by popularity</span>}>
                <SortDropdown basePath={`/brand/${slug}`} />
              </Suspense>
            </div>
          </div>

          {/* UK Products Section with Sidebar - Responsive */}
          <SSRProductGridWithSidebar
            brandFilter={brandData.brandName}
            filters={{
              brand: brandData.brandName,
              vendor: '',
              flavour: '',
              strength: '',
              minPrice: '',
              maxPrice: '',
              format: '',
              sort: resolvedSearchParams.sort || 'popularity'
            }}
            currentPage={parseInt(resolvedSearchParams.page || '1', 10)}
          />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}