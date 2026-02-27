import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRUSProductGridWithSidebar from '@/components/SSRUSProductGridWithSidebar';
import SortDropdown from '@/components/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { generateUSBrandPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';
import { generateBrandHreflang, generateSafeHreflang } from '@/lib/hreflang';
import { getUSBrandLogo } from '@/lib/brand-logos';
import './brand-page.css';

// Fetch brand data from Supabase
async function getBrandData(slug: string): Promise<{ brandName: string; totalProducts: number } | null> {
  try {
    // First, get all unique brands to find the exact match
    const { data: allBrands } = await supabase()
      .from('us_products')
      .select('brand')
      .not('brand', 'is', null);
    
    // Convert slug to search terms
    const slugLower = slug.toLowerCase();
    
    // Find matching brand (case-insensitive, handle variations)
    const brandNames: string[] = (allBrands || [])
      .map((b: any) => b.brand)
      .filter((brand: any): brand is string => typeof brand === 'string' && brand !== 'UNKNOWN');
    const uniqueBrands = Array.from(new Set(brandNames));
    const matchingBrand: string | undefined = uniqueBrands.find((brand: string) => {
      if (!brand) return false;
      const brandLower = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
      const slugNormalized = slugLower.replace(/[^a-z0-9]/g, '');
      return brandLower === slugNormalized || 
             brand.toLowerCase() === slugLower ||
             brand.toLowerCase().replace(/[^a-z0-9]/g, '') === slugNormalized;
    });
    
    if (!matchingBrand) {
      return null;
    }
    
    // Get all products for this brand
    const { data: products, error } = await supabase()
      .from('us_products')
      .select('*')
      .eq('brand', matchingBrand)
      .not('image_url', 'is', null)
      .order('product_title');

    if (error) {
      console.error('Error fetching brand products:', error);
      return null;
    }

    if (!products || products.length === 0) {
      return null;
    }

    return {
      brandName: matchingBrand,
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error in getBrandData:', error);
    return null;
  }
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

  // TypeScript type narrowing - brandData is guaranteed to be non-null here
  const { brandName, totalProducts } = brandData;

  return (
    <>
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
                <Link href="/us" style={{
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
                <Link href="/us/compare" style={{
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
                }}>{brandName}</span>
              </nav>

              {/* Brand Logo and Title Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '16px'
              }}>
                {/* Brand Logo */}
                {getUSBrandLogo(brandName) && (
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
                      src={getUSBrandLogo(brandName)!}
                      alt={`${brandName} logo`}
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
                  {brandName} Nicotine Pouches
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
                Find the best prices for {brandName} nicotine pouches from top US vendors.
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
                    {totalProducts}+ products
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </span>
                </div>
                <Suspense fallback={<span style={{ fontSize: '14px', color: '#1f2937' }}>Sort by popularity</span>}>
                  <SortDropdown basePath={`/us/brand/${slug}`} />
                </Suspense>
              </div>
            </div>

            {/* US Products Section with Sidebar - Responsive */}
            <SSRUSProductGridWithSidebar
              brandFilter={brandName}
              isUSRoute={true}
              filters={{
                brand: brandName,
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
        <Footer showBrandsLink={false} isUSRoute={true} />
      </div>
    </div>
    </>
  );
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

  const metaData = pageMetaToMetadata(generateUSBrandPageMeta(
    String(brandData.brandName),
    brandData.totalProducts
  ));
  
  // Fix canonical URL - make it self-referential for US brand pages
  // since many UK brand pages don't exist (return 404)
  const baseUrl = 'https://nicotine-pouches.org';
  const usBrandUrl = `${baseUrl}/us/brand/${slug}`;
  
  // Generate hreflang using the fixed function (only US, no cross-region links)
  const hreflang = generateSafeHreflang(generateBrandHreflang(slug, true, false));
  const languages: Record<string, string> = {};
  hreflang.forEach(entry => {
    languages[entry.lang] = entry.url;
  });
  
  return {
    ...metaData,
    alternates: {
      canonical: usBrandUrl,
      languages,
    },
    openGraph: {
      ...metaData.openGraph,
      url: usBrandUrl, // Fix Open Graph URL to match canonical
    },
  };
}