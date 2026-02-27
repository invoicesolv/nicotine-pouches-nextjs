import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRProductGridWithSidebar from '@/components/SSRProductGridWithSidebar';
import Link from 'next/link';
import { Metadata } from 'next';
import { generateComparePageMeta, pageMetaToMetadata } from '@/lib/meta-generator';
import './compare-page.css';

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

export default async function ComparePage({ searchParams }: PageProps) {
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
                <span>Compare Nicotine Pouches</span>
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
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  color: '#333',
                  margin: '0 0 15px 0'
                }}>
                  Compare Nicotine Pouches
                </h1>
                <p style={{
                  fontSize: '18px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  color: '#666',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  Find the best prices for nicotine pouches UK from top UK vendors. 
                  Compare ratings, strengths, and flavors to find your perfect match.
                </p>
              </div>
            </div>

            {/* UK Products Section with Sidebar - Responsive */}
            <SSRProductGridWithSidebar currentPage={currentPage} filters={filters} />

          </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const metaData = pageMetaToMetadata(generateComparePageMeta());
  return metaData;
}