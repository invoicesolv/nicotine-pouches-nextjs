import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRUSProductGridWithSidebar from '@/components/SSRUSProductGridWithSidebar';
import SortDropdown from '@/components/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getUSBrandLogo } from '@/lib/brand-logos';
import { supabase } from '@/lib/supabase';

async function getTopUSBrandsAndCount() {
  try {
    // Fetch product names to extract brands - us_products uses product_title column
    const { data, error } = await supabase()
      .from('us_products')
      .select('product_title')
      .not('product_title', 'is', null);

    if (error || !data) return { brands: [], totalProducts: 0 };

    const totalProducts = data.length;

    // Extract brands from first word of product title
    const brandCounts: Record<string, number> = {};
    data.forEach((item: { product_title: string }) => {
      if (item.product_title) {
        const brandName = item.product_title.split(' ')[0];
        if (brandName) {
          brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
        }
      }
    });

    const brands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, logo: getUSBrandLogo(name) }));

    return { brands, totalProducts };
  } catch {
    return { brands: [], totalProducts: 0 };
  }
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    brand?: string;
    vendor?: string;
    flavour?: string;
    strength?: string;
    minPrice?: string;
    maxPrice?: string;
    format?: string;
    sort?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compare Nicotine Pouches US - Best Prices & Deals',
    description: 'Compare nicotine pouches by brand, strength, and flavour in the US. Find the best deals from top US retailers with live price updates and reviews.',
    keywords: 'nicotine pouches, US, compare, prices, deals, ZYN, VELO, LOOP',
    robots: 'index, follow',
    openGraph: {
      title: 'Compare Nicotine Pouches US - Best Prices & Deals',
      description: 'Compare nicotine pouches by brand, strength, and flavour in the US. Find the best deals from top US retailers with live price updates and reviews.',
      url: 'https://nicotine-pouches.org/us/compare',
      siteName: 'Nicotine Pouches US',
      images: [
        {
          url: 'https://nicotine-pouches.org/us-compare-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Compare Nicotine Pouches US',
        },
      ],
      locale: 'en-US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Compare Nicotine Pouches US - Best Prices & Deals',
      description: 'Compare nicotine pouches by brand, strength, and flavour in the US. Find the best deals from top US retailers with live price updates and reviews.',
      images: ['https://nicotine-pouches.org/us-compare-og-image.jpg'],
      creator: '@nicotinepouches',
      site: '@nicotinepouches',
    },
    alternates: {
      canonical: 'https://nicotine-pouches.org/us/compare',
      languages: {
        'en-GB': 'https://nicotine-pouches.org/compare',
        'en-US': 'https://nicotine-pouches.org/us/compare',
        'x-default': 'https://nicotine-pouches.org/us/compare',
      },
    },
  };
}

export default async function USComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const filters = {
    brand: params.brand || '',
    vendor: params.vendor || '',
    flavour: params.flavour || '',
    strength: params.strength || '',
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    format: params.format || '',
    sort: params.sort || 'popularity'
  };

  const { brands: topBrands, totalProducts } = await getTopUSBrandsAndCount();

  return (
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
              <span style={{
                color: '#6b7280',
                fontSize: '15px'
              }}>Compare Nicotine Pouches (US)</span>
            </nav>

            {/* Title */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.5px',
              lineHeight: '1.1'
            }}>
              Compare Nicotine Pouches (US)
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '17px',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 0 32px 0',
              lineHeight: '1.7',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Find the best prices for nicotine pouches from top US vendors.
              Compare ratings, strengths, and flavors to find your perfect match.
            </p>

            {/* Brand Tab */}
            <div style={{
              display: 'flex',
              gap: '32px',
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                paddingBottom: '8px',
                borderBottom: '3px solid #1f2937'
              }}>
                Brand
              </div>
            </div>

            {/* Brand Pills */}
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {topBrands.length === 0 && (
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading brands...</span>
              )}
              {topBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/us/compare?brand=${encodeURIComponent(brand.name)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: brand.logo ? '8px 20px 8px 8px' : '12px 24px',
                    backgroundColor: filters.brand === brand.name ? '#f3f4f6' : '#ffffff',
                    border: filters.brand === brand.name ? '2px solid #1f2937' : '1px solid #e5e7eb',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    color: '#1f2937',
                    fontSize: '15px',
                    fontWeight: '500',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  {brand.logo && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f9fafb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={28}
                        height={28}
                        style={{
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )}
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Filter Bar - Full width with gray background */}
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
                <SortDropdown basePath="/us/compare" />
              </Suspense>
            </div>
          </div>

          {/* US Products Section with Sidebar */}
          <SSRUSProductGridWithSidebar currentPage={currentPage} filters={filters} />

        </main>

        {/* Footer */}
        <Footer showBrandsLink={false} isUSRoute={true} />
      </div>
    </div>
  );
}
