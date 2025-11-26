import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRUSProductGridWithSidebar from '@/components/SSRUSProductGridWithSidebar';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateBrandPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';
import { generateBrandHreflang, generateSafeHreflang } from '@/lib/hreflang';
import './brand-page.css';

// Fetch brand data from Supabase
async function getBrandData(slug: string) {
  try {
    const brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Get all products for this brand (filter by name starting with brand)
    const { data: products, error } = await supabase()
      .from('us_products')
      .select('*')
      .ilike('product_title', `${brandName}%`)
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
      brandName: brandName,
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error in getBrandData:', error);
    return null;
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandData = await getBrandData(slug);

  if (!brandData) {
    notFound();
  }
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
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 15px 0'
                }}>
                  {brandData.brandName} Nicotine Pouches
                </h1>
                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  Find the best prices for {brandData.brandName} nicotine pouches from top US vendors. 
                  Compare ratings, strengths, and flavors to find your perfect match.
                </p>
              </div>
            </div>

            {/* US Products Section with Sidebar - Responsive */}
            <SSRUSProductGridWithSidebar brandFilter={brandData.brandName} isUSRoute={true} />

          </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
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

  const metaData = pageMetaToMetadata(generateBrandPageMeta(
    String(brandData.brandName),
    brandData.totalProducts
  ));
  
  // Fix canonical URL - make it self-referential for US brand pages
  // since many UK brand pages don't exist (return 404)
  const baseUrl = 'https://nicotine-pouches.org';
  const usBrandUrl = `${baseUrl}/us/brand/${slug}`;
  
  // Add hreflang for US brand pages
  const hreflang = generateSafeHreflang(generateBrandHreflang(slug, true));
  
  return {
    ...metaData,
    alternates: {
      canonical: usBrandUrl,
      languages: {
        'en-US': usBrandUrl,
        'en-GB': `${baseUrl}/brand/${slug}`,
        'x-default': usBrandUrl,
      },
    },
  };
}