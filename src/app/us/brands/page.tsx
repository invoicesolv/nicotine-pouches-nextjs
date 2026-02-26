import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUSBrandLogo } from '@/lib/brand-logos';
import BrandsGrid from './BrandsGrid';

// Fetch only US brands
async function getAllBrands() {
  try {
    // Get US brands only
    const { data: usProducts, error: usError } = await supabase()
      .from('us_products')
      .select('brand')
      .not('brand', 'is', null);

    if (usError) {
      console.error('Error fetching US brands:', usError);
      return [];
    }

    // Extract unique US brands
    const usBrandNames: string[] = (usProducts || [])
      .map((p: any) => p.brand)
      .filter(Boolean)
      .filter((brand: string) => brand !== 'UNKNOWN');

    const uniqueBrands = Array.from(new Set(usBrandNames));
    const allBrands = uniqueBrands
      .sort()
      .map((brand: string) => ({
        name: brand,
        slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));

    return allBrands;
  } catch (error) {
    console.error('Error in getAllBrands:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'All Nicotine Pouch Brands - Compare Prices & Reviews US',
  description: 'Browse all nicotine pouch brands available in the US. Compare prices, reviews, and find the best deals on ZYN, VELO, LOOP, and more.',
  keywords: 'nicotine pouches brands, ZYN, VELO, LOOP, nicotine pouch brands US, all nicotine pouch brands, compare nicotine pouch brands, nicotine pouch reviews, best nicotine pouch brands',
  robots: 'index, follow',
  authors: [{ name: 'Nicotine Pouches US' }],
  publisher: 'Nicotine Pouches US',
  alternates: {
    canonical: 'https://nicotine-pouches.org/us/brands',
    languages: {
      'en-GB': 'https://nicotine-pouches.org/brands',
      'en-US': 'https://nicotine-pouches.org/us/brands',
      'x-default': 'https://nicotine-pouches.org/us/brands',
    },
  },
  openGraph: {
    title: 'All Nicotine Pouch Brands - Compare Prices & Reviews US',
    description: 'Browse all nicotine pouch brands available in the US. Compare prices, reviews, and find the best deals on ZYN, VELO, LOOP, and more.',
    url: 'https://nicotine-pouches.org/us/brands',
    siteName: 'Nicotine Pouches',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Nicotine Pouch Brands - Compare Prices & Reviews US',
    description: 'Browse all nicotine pouch brands available in the US. Compare prices, reviews, and find the best deals on ZYN, VELO, LOOP, and more.',
  },
  other: {
    'keywords': 'nicotine pouches brands, ZYN, VELO, LOOP, nicotine pouch brands US, all nicotine pouch brands, compare nicotine pouch brands, nicotine pouch reviews, best nicotine pouch brands',
    'author': 'Nicotine Pouches US',
    'publisher': 'Nicotine Pouches US',
    'article:author': 'Nicotine Pouches US',
    'article:publisher': 'Nicotine Pouches US',
    'og:author': 'Nicotine Pouches US',
    'og:publisher': 'Nicotine Pouches US',
  },
};

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="compare-container" style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 15px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Link href="/us" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/us" style={{ color: '#666', textDecoration: 'none' }}>Compare Nicotine Pouches</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>All Brands</span>
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
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 15px 0'
              }}>
                All Nicotine Pouch Brands
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Discover all nicotine pouch brands available in the US. Compare prices, 
                read reviews, and find the best deals on your favorite brands.
              </p>
            </div>
          </div>

          {/* Brands Grid */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px 0'
          }}>
            <div className="compare-container" style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 15px'
            }}>
              <BrandsGrid brands={brands} />
            </div>
          </div>
        </main>

        <Footer isUSRoute={true} />
      </div>
    </div>
  );
}
