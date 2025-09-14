import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import ReviewBalls from '@/components/ReviewBalls';
import Link from 'next/link';

// Fetch brand data from Supabase
async function getBrandData(slug: string) {
  try {
    const brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Get all products for this brand
    const { data: products, error } = await supabase()
      .from('products')
      .select('*')
      .ilike('brand', `%${brandName}%`)
      .order('name');

    if (error) {
      console.error('Error fetching brand products:', error);
      return null;
    }


    if (!products || products.length === 0) {
      return null;
    }

    // Get the first product as the featured product for the header
    const featuredProduct = products[0];

    return {
      brandName: brandName,
      featuredProduct: {
        id: featuredProduct.id,
        name: featuredProduct.name,
        image: featuredProduct.image_url || '/placeholder-product.jpg',
        description: featuredProduct.description || `Premium ${brandName} nicotine pouches with various strengths and flavors.`,
        brand: featuredProduct.brand,
        strength_group: featuredProduct.strength_group,
        flavour: featuredProduct.flavour,
        format: featuredProduct.format
      },
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error fetching brand data:', error);
    return null;
  }
}

interface BrandPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
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
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/compare" style={{ color: '#666', textDecoration: 'none' }}>Compare Nicotine Pouches</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>{brandData.brandName}</span>
            </div>
          </div>

          {/* Brand Header Section */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '60px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: '60px',
              alignItems: 'center'
            }}>
              
              {/* Brand Info - Left Side */}
              <div>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 15px 0',
                  lineHeight: '1.1'
                }}>
                  {brandData.brandName} Products
                </h1>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    <ReviewBalls rating={5} />
                  </div>
                  <span style={{
                    color: '#666',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    4.5
                  </span>
                </div>

                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  Compare prices for all {brandData.brandName} nicotine pouches from top UK vendors. 
                  Find the best deals on {brandData.totalProducts} products.
                </p>

                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '14px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Products
                    </span>
                    <p style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#333',
                      margin: '5px 0 0 0'
                    }}>
                      {brandData.totalProducts}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '14px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Featured
                    </span>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#333',
                      margin: '5px 0 0 0'
                    }}>
                      {brandData.featuredProduct.name}
                    </p>
                  </div>
                </div>

                <button style={{
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  Compare all {brandData.brandName} products
                </button>
              </div>

              {/* Featured Product Image - Right Side */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '20px',
                padding: '40px',
                minHeight: '400px'
              }}>
                <Image
                  src={brandData.featuredProduct.image}
                  alt={brandData.featuredProduct.name}
                  width={300}
                  height={300}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid brandFilter={brandData.brandName} />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Generate static params for known brands
export async function generateStaticParams() {
  try {
    const { data: products } = await supabase()
      .from('products')
      .select('brand')
      .not('brand', 'is', null);

    if (!products) return [];

    // Get unique brands
    const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand)));
    
    return uniqueBrands.map((brand: any) => ({
      slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Dynamic metadata
export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const brandData = await getBrandData(slug);
  
  if (!brandData) {
    return {
      title: 'Brand Not Found',
    };
  }

  return {
    title: `${brandData.brandName} - Compare Prices | Nicotine Pouches`,
    description: `Compare prices for all ${brandData.brandName} nicotine pouches across multiple UK stores. ${brandData.totalProducts} products available.`,
    openGraph: {
      title: `${brandData.brandName} - Compare Prices`,
      description: `Compare prices for all ${brandData.brandName} nicotine pouches across multiple UK stores.`,
      images: [brandData.featuredProduct.image],
    },
  };
}
