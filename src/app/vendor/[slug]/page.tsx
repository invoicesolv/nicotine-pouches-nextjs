import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import VendorLogo from '@/components/VendorLogo';
import ReviewBalls from '@/components/ReviewBalls';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

// Fetch vendor data and their products
async function getVendorData(slug: string) {
  try {
    // Convert slug back to proper case name
    const properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // First try to find by exact name match
    let { data: vendor, error } = await supabase()
      .from('vendors')
      .select('*')
      .eq('name', properCaseName)
      .single();

    // If not found, try case-insensitive match
    if (error || !vendor) {
      const { data: vendors, error: searchError } = await supabase()
        .from('vendors')
        .select('*')
        .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
        .limit(1);

      if (searchError || !vendors || vendors.length === 0) {
        return null;
      }
      vendor = vendors[0];
    }

    // Get mapped products for this vendor
    const { data: mappings, error: mappingError } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id, vendor_id')
      .eq('vendor_id', vendor.id);

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
    }

    // Get the actual products
    let products = [];
    if (mappings && mappings.length > 0) {
      const productIds = mappings.map((m: any) => m.product_id);
      const { data: productData, error: productError } = await supabase()
        .from('wp_products')
        .select('*')
        .in('id', productIds);

      if (productError) {
        console.error('Error fetching products:', productError);
      } else {
        products = productData || [];
      }
    }

    // Get the first product as the featured product for the header
    const featuredProduct = products.length > 0 ? products[0] : null;

    return {
      vendorName: vendor.name,
      vendor: vendor,
      featuredProduct: featuredProduct ? {
        id: featuredProduct.id,
        name: featuredProduct.name,
        image: featuredProduct.image_url || '/placeholder-product.jpg',
        description: featuredProduct.description || `Premium products from ${vendor.name}.`,
        brand: featuredProduct.brand,
        strength_group: featuredProduct.strength_group,
        flavour: featuredProduct.flavour,
        format: featuredProduct.format
      } : null,
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error in getVendorData:', error);
    return null;
  }
}

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendorData = await getVendorData(slug);

  if (!vendorData) {
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
              <Link href="/vendors" style={{ color: '#666', textDecoration: 'none' }} rel="nofollow">Vendors</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>{vendorData.vendorName}</span>
            </div>
          </div>

          {/* Vendor Header Section */}
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
              
              {/* Vendor Info - Left Side */}
              <div>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 15px 0',
                  lineHeight: '1.1'
                }}>
                  {vendorData.vendorName} Products
                </h1>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    <ReviewBalls rating={vendorData.vendor.rating || 4.5} />
                  </div>
                  <span style={{
                    color: '#666',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    {(vendorData.vendor.rating || 4.5).toFixed(1)}
                  </span>
                </div>

                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  Compare prices for all {vendorData.vendorName} nicotine pouches from top UK vendors. 
                  Find the best deals on {vendorData.totalProducts} products.
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
                      {vendorData.totalProducts}
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
                      {vendorData.featuredProduct ? vendorData.featuredProduct.name : 'No products available'}
                    </p>
                  </div>
                </div>

                <a
                  href={`/vendor/${slug}#products`}
                  rel="nofollow"
                  style={{
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  className="hover:bg-gray-700"
                >
                  Compare all {vendorData.vendorName} products
                </a>
              </div>

              {/* Vendor Logo - Right Side */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '40px',
                padding: '40px',
                minHeight: '400px'
              }}>
                <VendorLogo 
                  logo={vendorData.vendor.logo_url || ''} 
                  name={vendorData.vendorName} 
                  size={250} 
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div id="products">
            <ProductGrid vendorFilter={vendorData.vendorName} />
          </div>

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Generate static params for known vendors
export async function generateStaticParams() {
  try {
    const { data: vendors } = await supabase()
      .from('vendors')
      .select('name')
      .eq('is_active', true);

    if (!vendors) return [];

    return vendors.map((vendor: any) => ({
      slug: vendor.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Dynamic metadata
export async function generateMetadata({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendorData = await getVendorData(slug);
  
  if (!vendorData) {
    return {
      title: 'Vendor Not Found',
    };
  }

  return {
    title: `${vendorData.vendorName} - Compare Prices | Nicotine Pouches`,
    description: `Compare prices for all ${vendorData.vendorName} nicotine pouches across multiple UK stores. ${vendorData.totalProducts} products available.`,
    openGraph: {
      title: `${vendorData.vendorName} - Compare Prices`,
      description: `Compare prices for all ${vendorData.vendorName} nicotine pouches across multiple UK stores.`,
      images: vendorData.featuredProduct ? [vendorData.featuredProduct.image] : [],
    },
  };
}
