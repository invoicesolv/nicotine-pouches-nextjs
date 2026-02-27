import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRUSProductGridWithSidebar from '@/components/SSRUSProductGridWithSidebar';
import Link from 'next/link';
import { Metadata } from 'next';

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
    format: params.format || ''
  };

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
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              color: '#666'
            }}>
              <Link href="/us" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>Compare Nicotine Pouches (US)</span>
            </div>
          </div>

          {/* Page Header */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: '#333',
                margin: '0 0 15px 0'
              }}>
                Compare Nicotine Pouches (US)
              </h1>
              <p style={{
                fontSize: '18px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Find the best prices for nicotine pouches from top US vendors. 
                Compare ratings, strengths, and flavors to find your perfect match.
              </p>
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
