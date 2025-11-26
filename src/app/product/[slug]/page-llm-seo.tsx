import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import { generateLLMSEO, extractLLMSEODataFromDB } from '@/lib/llm-seo';
import SEOHead from '@/components/SEOHead';
import LLMSEOHead from '@/components/LLMSEOHead';
import LLMTableEnhancer from '@/components/LLMTableEnhancer';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import FAQSection from '@/components/FAQSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import ReviewBalls from '@/components/ReviewBalls';

// Fetch product data from Supabase
async function getProduct(slug: string) {
  try {
    // Convert slug back to proper case name
    const properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // First try to find by exact name match
    let { data: product, error } = await supabase()
      .from('wp_products')
      .select('*')
      .eq('name', properCaseName)
      .single();

    // If not found, try case-insensitive match
    if (error || !product) {
      const { data: products, error: searchError } = await supabase()
        .from('wp_products')
        .select('*')
        .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
        .limit(1);

      if (searchError || !products || products.length === 0) {
        return null;
      }
      product = products[0];
    }

    // Get vendor products that are mapped to this product
    const { data: mappings, error: mappingError } = await supabase()
      .from('vendor_product_mapping')
      .select('vendor_product, vendor_id')
      .eq('product_id', product.id);

    if (mappingError) {
      console.error('Error fetching mappings:', mappingError);
    }

    // Get vendor products based on the mappings
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
            shipping_info,
            created_at
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

    // Extract both regular SEO and LLM SEO data
    const regularSeoInputs = extractProductDataFromDB(product, vendorProducts);
    const llmSeoInputs = extractLLMSEODataFromDB(product, vendorProducts);
    
    const regularSeoData = generateProductSEO(regularSeoInputs);
    const llmSeoData = generateLLMSEO(llmSeoInputs);

    // Transform product data to match expected format
    const nameParts = product.name.split(' ');
    const brand = nameParts[0] || '';
    const flavour = nameParts.slice(1).join(' ') || '';
    
    return {
      id: product.id,
      slug: slug,
      title: product.name,
      name: product.name,
      image: product.image_url || '/placeholder-product.jpg',
      rating: 4.5,
      description: product.content || product.excerpt || `Compare ${product.name} packs - best prices and deals UK.`,
      brand: brand,
      flavour: flavour,
      strength_group: '',
      format: '',
      page_url: product.page_url,
      content: product.content,
      excerpt: product.excerpt || `${brand} HERE`,
      regularSeoData,
      llmSeoData
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const { regularSeoData, llmSeoData } = product;

  return (
    <>
      {/* Regular SEO Head */}
      <SEOHead seoData={regularSeoData} hreflang={regularSeoData.schema_json_ld.WebPage.hreflang} />
      
      {/* LLM SEO Head (additional layer) */}
      <LLMSEOHead llmSeoData={llmSeoData} hreflang={llmSeoData.schema_json_ld['@graph'].find((item: any) => item['@type'] === 'WebPage')?.hreflang} />
      
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          <Header />

          <main id="main" className="clearfix" style={{
            backgroundColor: '#f3f3f5',
            minHeight: '100vh'
          }}>
            
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation breadcrumbs={regularSeoData.schema_json_ld.BreadcrumbList.itemListElement} />

            {/* Product Hero Section */}
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
                gridTemplateColumns: '400px 1fr',
                gap: '60px',
                alignItems: 'center'
              }}>
                
                {/* Product Image */}
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
                    src={product.image}
                    alt={product.title}
                    width={300}
                    height={300}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Product Info */}
                <div>
                  <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '1000',
                    color: '#0B051D',
                    margin: '0 0 15px 0',
                    lineHeight: '1.1',
                    fontFamily: 'Klarna Text, sans-serif',
                    letterSpacing: '-0.05em'
                  }}>
                    {product.title}
                  </h1>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginRight: '8px' }}>
                      <ReviewBalls rating={4.5} size={24} />
                    </div>
                    <span style={{
                      color: '#666',
                      fontSize: '18px',
                      fontWeight: '500'
                    }}>
                      {(product.rating || 4.5).toFixed(1)}
                    </span>
                  </div>

                  {/* Short Description */}
                  <p style={{
                    fontSize: '18px',
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '30px'
                  }}>
                    {(product.excerpt || '').replace(/<[^>]*>/g, '').replace(/\\n/g, '').trim()}
                  </p>

                  <button style={{
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Klarna Text, sans-serif'
                  }}>
                    Compare prices
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px 0'
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
              }}>
                
                {/* LLM-Enhanced Price Comparison Table */}
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 20px 0',
                    textAlign: 'center'
                  }}>
                    Live pack & price comparison
                  </h2>
                  
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <LLMTableEnhancer llmSeoData={llmSeoData}>
                      <div>
                        {/* Table content is rendered by LLMTableEnhancer itself */}
                      </div>
                    </LLMTableEnhancer>
                  </div>
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
                    Specs & flavour profile
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
                      {regularSeoData.on_page_copy_scaffold.specs_section.bullets.map((bullet, index) => (
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
                  <FAQSection faqs={regularSeoData.faq_plaintext} />
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
                      href={regularSeoData.internal_linking.to_brand_hub}
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
                      All {product.brand} Products
                    </Link>
                    <Link 
                      href={regularSeoData.internal_linking.to_flavour_hub}
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
                      All {product.flavour} Products
                    </Link>
                    <Link 
                      href={regularSeoData.internal_linking.to_strength_filter}
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
                      {llmSeoData.schema_json_ld['@graph'].find((item: any) => item['@type'] === 'Product')?.additionalProperty?.find((prop: any) => prop.name === 'strength_mg')?.value || 'Standard'} mg Products
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

// Generate metadata using regular SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const { regularSeoData } = product;

  return {
    title: regularSeoData.meta.title,
    description: regularSeoData.meta.description,
    robots: regularSeoData.meta.robots,
    alternates: {
      canonical: regularSeoData.meta.canonical,
    },
    openGraph: {
      title: regularSeoData.meta.og['og:title'],
      description: regularSeoData.meta.og['og:description'],
      url: regularSeoData.meta.og['og:url'],
      siteName: regularSeoData.meta.og['og:site_name'],
      type: 'website',
      images: [
        {
          url: regularSeoData.meta.og['og:image'],
          width: 1200,
          height: 630,
          alt: regularSeoData.meta.og['og:title'],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: regularSeoData.meta.twitter.title,
      description: regularSeoData.meta.twitter.description,
      images: [regularSeoData.meta.twitter.image],
    },
  };
}
