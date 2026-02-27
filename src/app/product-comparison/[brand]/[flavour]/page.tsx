'use client';

import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateProductSEO, extractProductDataFromDB, ProductSEOInputs } from '@/lib/seo';
import SEOHead from '@/components/SEOHead';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import ProductComparisonTable from '@/components/ProductComparisonTable';
import FAQSection from '@/components/FAQSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

// Fetch product comparison data
async function getProductComparisonData(brand: string, flavour: string) {
  try {
    // Get products matching brand and flavour
    const { data: products, error } = await supabase()
      .from('wp_products')
      .select('*')
      .ilike('name', `${brand}%${flavour}%`)
      .not('image_url', 'is', null);

    if (error || !products || products.length === 0) {
      return null;
    }

    // Get vendor products for these products
    const productIds = products.map((p: any) => p.id);
    const { data: mappings, error: mappingError } = await supabase()
      .from('vendor_product_mapping')
      .select('vendor_product, vendor_id, product_id')
      .in('product_id', productIds);

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
      return null;
    }

    // Get vendor products
    let vendorProducts = [];
    if (mappings && mappings.length > 0) {
      const { data: vpData, error: vpError } = await supabase()
        .from('vendor_products')
        .select(`
          *,
          vendors!inner(
            id,
            name,
            logo_url,
            rating,
            shipping_info
          )
        `)
        .in('name', mappings.map((m: any) => m.vendor_product))
        .in('vendor_id', mappings.map((m: any) => m.vendor_id));

      if (vpError) {
        console.error('Error fetching vendor products:', vpError);
      } else {
        vendorProducts = vpData || [];
      }
    }

    // Use the first product as the main product for SEO data
    const mainProduct = products[0];
    
    // Extract SEO data
    const seoInputs = extractProductDataFromDB(mainProduct, vendorProducts);
    
    // Override specific values for comparison page
    seoInputs.brand = brand;
    seoInputs.flavour = flavour;
    seoInputs.page_url = `https://nicotine-pouches.org/product-comparison/${brand.toLowerCase()}/${flavour.toLowerCase()}`;
    
    // Update breadcrumbs for comparison page
    seoInputs.breadcrumbs = [
      { name: 'Home', url: 'https://nicotine-pouches.org' },
      { name: 'Nicotine Pouches', url: 'https://nicotine-pouches.org/compare' },
      { name: 'Flavours', url: 'https://nicotine-pouches.org/flavours' },
      { name: flavour, url: `https://nicotine-pouches.org/flavours/${flavour.toLowerCase().replace(/\s+/g, '-')}` },
      { name: `${brand} Comparison`, url: `https://nicotine-pouches.org/product-comparison/${brand.toLowerCase()}/${flavour.toLowerCase()}` }
    ];

    const seoData = generateProductSEO(seoInputs);

    return {
      seoData,
      products,
      vendorProducts,
      mainProduct
    };
  } catch (error) {
    console.error('Error fetching product comparison data:', error);
    return null;
  }
}

interface ProductComparisonPageProps {
  params: Promise<{
    brand: string;
    flavour: string;
  }>;
}

export default async function ProductComparisonPage({ params }: ProductComparisonPageProps) {
  const { brand, flavour } = await params;
  const data = await getProductComparisonData(brand, flavour);

  if (!data) {
    notFound();
  }

  const { seoData, products, vendorProducts, mainProduct } = data;

  return (
    <>
      <SEOHead seoData={seoData} hreflang={seoData.schema_json_ld.WebPage?.hreflang || []} />
      
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          <Header />

          <main id="main" className="clearfix" style={{
            backgroundColor: '#f3f3f5',
            minHeight: '100vh'
          }}>
            
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation breadcrumbs={seoData.schema_json_ld.BreadcrumbList?.itemListElement || []} />

            {/* Hero Section */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '60px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                textAlign: 'center'
              }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '1000',
                  color: '#0B051D',
                  margin: '0 0 20px 0',
                  lineHeight: '1.1',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  letterSpacing: '-0.05em'
                }}>
                  {seoData.on_page_copy_scaffold?.h1 || `${brand} ${flavour} Comparison`}
                </h1>

                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '30px',
                  maxWidth: '800px',
                  margin: '0 auto 30px auto'
                }}>
                  {seoData.on_page_copy_scaffold?.intro || `Compare ${brand} ${flavour} nicotine pouches from top UK retailers.`}
                </p>

                {/* Product Image */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  padding: '40px',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <Image
                    src={mainProduct.image_url || '/placeholder-product.jpg'}
                    alt={mainProduct.name}
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

            {/* Main Content */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px 0'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                
                {/* Top Picks Section */}
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 20px 0',
                    textAlign: 'center'
                  }}>
                    {seoData.on_page_copy_scaffold?.top_picks_section?.h2 || 'Top Picks'}
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                  }}>
                    {products.slice(0, 3).map((product: any, index: number) => (
                      <div key={index} style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '15px'
                        }}>
                          <Image
                            src={product.image_url || '/placeholder-product.jpg'}
                            alt={product.name}
                            width={60}
                            height={60}
                            style={{
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#1f2937',
                              margin: '0 0 4px 0'
                            }}>
                              {product.name}
                            </h3>
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              margin: 0
                            }}>
                              {product.brand} • {product.flavour}
                            </p>
                          </div>
                        </div>
                        <Link 
                          href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                          }}
                          className="hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Comparison Table */}
                <div style={{ marginBottom: '40px' }}>
                  <ProductComparisonTable product={{
                    id: 'comparison',
                    slug: `${brand}-${flavour}`,
                    title: `${brand} ${flavour} Comparison`,
                    name: `${brand} ${flavour}`,
                    image: '/placeholder-product.jpg',
                    rating: 0,
                    description: `Compare ${brand} ${flavour} nicotine pouches from top UK vendors`,
                    brand: brand,
                    flavour: flavour,
                    strength_group: 'Various',
                    format: 'Pouches',
                    page_url: `/product-comparison/${brand}/${flavour}`,
                    stores: (seoData.schema_json_ld.Product_set || []).map((p: any) => ({
                      id: p.sku || Math.random().toString(),
                      name: p.brand?.name || 'Unknown Brand',
                      logo: '/placeholder-logo.jpg',
                      rating: parseFloat(p.aggregateRating?.ratingValue || '0'),
                      shipping_info: 'Standard shipping available',
                      prices: {
                        '1pack': p.offers?.price || 'N/A',
                        '5pack': 'N/A',
                        '10pack': 'N/A',
                        '20pack': 'N/A'
                      },
                      url: p.url || '#',
                      in_stock: p.offers?.availability === 'https://schema.org/InStock',
                      shipping_cost: 'Free over £20',
                      free_shipping_threshold: 20
                    })),
                    content: '',
                    excerpt: '',
                    regularSeoData: seoData,
                    llmSeoData: null
                  }} />
                </div>

                {/* Specs Section */}
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 20px 0',
                    textAlign: 'center'
                  }}>
                    {seoData.on_page_copy_scaffold?.specs_section?.h2 || 'Specifications'}
                  </h2>
                  
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '15px'
                    }}>
                      {(seoData.on_page_copy_scaffold?.specs_section?.bullets || []).map((bullet, index) => (
                        <li key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            marginRight: '12px',
                            flexShrink: 0
                          }}></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* FAQ Section */}
                <div style={{ marginBottom: '40px' }}>
                  <FAQSection faqs={seoData.faq_plaintext} />
                </div>

                {/* Internal Linking Section */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 20px 0'
                  }}>
                    Explore More
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <Link 
                      href={seoData.internal_linking.to_brand_hub}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-gray-200"
                    >
                      All {brand} Products
                    </Link>
                    <Link 
                      href={seoData.internal_linking.to_flavour_hub}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-gray-200"
                    >
                      All {flavour} Products
                    </Link>
                    <Link 
                      href={seoData.internal_linking.to_strength_filter}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-gray-200"
                    >
                      {(seoData.schema_json_ld.Product_set?.[0]?.additionalProperty.find((prop: any) => prop.name === 'Strength (mg)')?.value) || 'Standard'} mg Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

// Note: generateMetadata removed since this is now a client component
// Metadata is handled by SEOHead component instead

// Generate static params for known brand/flavour combinations
// Note: generateStaticParams removed since this is now a client component
// Static generation is not compatible with "use client" directive
