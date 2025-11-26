import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Fetch all brands from both UK and US products
async function getAllBrands() {
  try {
    // Get UK brands
    const { data: ukProducts, error: ukError } = await supabase()
      .from('wp_products')
      .select('name')
      .not('name', 'is', null);

    // Get US brands
    const { data: usProducts, error: usError } = await supabase()
      .from('us_products')
      .select('product_title')
      .not('product_title', 'is', null);

    if (ukError || usError) {
      console.error('Error fetching brands:', { ukError, usError });
      return [];
    }

    // Extract unique brands
    const ukBrandNames: string[] = (ukProducts || [])
      .map((p: any) => p.name?.split(' ')[0])
      .filter(Boolean);

    const usBrandNames: string[] = (usProducts || [])
      .map((p: any) => p.product_title?.split(' ')[0])
      .filter(Boolean);

    const ukBrands = new Set(ukBrandNames);
    const usBrands = new Set(usBrandNames);

    // Combine and sort brands
    const combinedBrands = ukBrandNames.concat(usBrandNames);
    const uniqueBrands = Array.from(new Set(combinedBrands));
    const allBrands = uniqueBrands
      .sort()
      .map((brand: string) => ({
        name: brand,
        slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        hasUK: ukBrands.has(brand),
        hasUS: usBrands.has(brand)
      }));

    return allBrands;
  } catch (error) {
    console.error('Error in getAllBrands:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'All Nicotine Pouch Brands - Compare Prices & Reviews UK',
  description: 'Browse all nicotine pouch brands available in the UK. Compare prices, reviews, and find the best deals on ZYN, VELO, Nordic Spirit, and more.',
  alternates: {
    canonical: 'https://nicotine-pouches.org/brands',
    languages: {
      'en-GB': 'https://nicotine-pouches.org/brands',
      'en-US': 'https://nicotine-pouches.org/us/brands',
      'x-default': 'https://nicotine-pouches.org/brands',
    },
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
              <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/compare" style={{ color: '#666', textDecoration: 'none' }}>Compare Nicotine Pouches</Link>
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
                Discover all nicotine pouch brands available in the UK. Compare prices, 
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                {brands.map((brand) => (
                  <div key={brand.slug} style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      margin: '0 0 10px 0'
                    }}>
                      {brand.name}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      {brand.hasUK && (
                        <Link 
                          href={`/brand/${brand.slug}`}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          UK
                        </Link>
                      )}
                      {brand.hasUS && (
                        <Link 
                          href={`/us/brand/${brand.slug}`}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          US
                        </Link>
                      )}
                    </div>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '0'
                    }}>
                      {brand.hasUK && brand.hasUS ? 'Available in UK & US' : 
                       brand.hasUK ? 'Available in UK' : 'Available in US'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
