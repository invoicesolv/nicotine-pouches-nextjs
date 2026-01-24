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

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandData = await getBrandData(slug);

  if (!brandData) {
    notFound();
  }

  // TypeScript type narrowing - brandData is guaranteed to be non-null here
  const { brandName, totalProducts } = brandData;

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
                <span>{brandName}</span>
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
                  {brandName} Nicotine Pouches
                </h1>
                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  Find the best prices for {brandName} nicotine pouches from top US vendors. 
                  Compare ratings, strengths, and flavors to find your perfect match.
                </p>
              </div>
            </div>

            {/* US Products Section with Sidebar - Responsive */}
            <SSRUSProductGridWithSidebar brandFilter={brandName} isUSRoute={true} />

          </main>

        {/* Footer */}
        <Footer showBrandsLink={false} isUSRoute={true} />
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
  
  // Generate hreflang using the fixed function (only US, no cross-region links)
  const hreflang = generateSafeHreflang(generateBrandHreflang(slug, true));
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