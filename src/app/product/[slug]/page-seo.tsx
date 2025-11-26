import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateProductSEO, extractProductDataFromDB } from '@/lib/seo';
import SEOHead from '@/components/SEOHead';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import ProductComparisonTable from '@/components/ProductComparisonTable';
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

    // Extract SEO data
    const seoInputs = extractProductDataFromDB(product, vendorProducts);
    seoInputs.page_url = `https://nicotinepouches.co.uk/product/${slug}`;
    
    // Update breadcrumbs for product page
    seoInputs.breadcrumbs = [
      { name: 'Home', url: 'https://nicotinepouches.co.uk' },
      { name: 'Nicotine Pouches', url: 'https://nicotinepouches.co.uk/compare' },
      { name: 'Products', url: 'https://nicotinepouches.co.uk/products' },
      { name: product.name, url: `https://nicotinepouches.co.uk/product/${slug}` }
    ];

    const seoData = generateProductSEO(seoInputs);

    // Helper function to format prices consistently
    const formatPrice = (price: any) => {
      if (!price) return 'N/A';
      const priceStr = price.toString();
      if (priceStr.includes('£')) {
        // Extract number from £X.XX format and reformat
        const numStr = priceStr.replace('£', '');
        return `£${parseFloat(numStr).toFixed(2)}`;
      } else {
        // Add £ and format to 2 decimal places
        return `£${parseFloat(priceStr).toFixed(2)}`;
      }
    };

    // Transform vendor products to store format and group by vendor
    const storesMap = new Map();
    vendorProducts?.forEach((vp: any) => {
      const vendorKey = vp.vendor_id;
      
      if (!storesMap.has(vendorKey)) {
        storesMap.set(vendorKey, {
          name: vp.vendors.name,
          logo: vp.vendors.name, // Pass vendor name instead of broken logo URL
          rating: vp.vendors.rating || 4.0,
          shipping: vp.vendors.shipping_info || 'Standard shipping',
          vendorId: vp.vendor_id,
          variants: []
        });
      }
      
      // Extract strength from product name (e.g., "6mg", "10mg", "Mini 3mg")
      const strengthMatch = vp.name.match(/(\d+(?:\.\d+)?mg|Mini|Strong|Normal|Extra Strong|Slim|Max|Ultra)/i);
      const strength = strengthMatch ? strengthMatch[1] : 'Standard';
      
      // Add variant to the vendor
      storesMap.get(vendorKey).variants.push({
        product: vp.name,
        strength: strength,
        price: formatPrice(vp.price_1pack),
        link: vp.url || '#',
        prices: {
          '1pack': formatPrice(vp.price_1pack),
          '3pack': formatPrice(vp.price_3pack),
          '5pack': formatPrice(vp.price_5pack),
          '10pack': formatPrice(vp.price_10pack),
          '20pack': formatPrice(vp.price_20pack),
          '25pack': formatPrice(vp.price_25pack),
          '30pack': formatPrice(vp.price_30pack),
          '50pack': formatPrice(vp.price_50pack)
        }
      });
    });
    
    // Convert to array and sort variants by strength
    const stores = Array.from(storesMap.values()).map(store => ({
      ...store,
      variants: store.variants.sort((a: any, b: any) => {
        // Sort by strength: Mini < Normal < Strong < Extra Strong
        const strengthOrder: { [key: string]: number } = { 'Mini': 1, 'Normal': 2, 'Strong': 3, 'Extra Strong': 4, 'Max': 5, 'Ultra': 6 };
        const aOrder = strengthOrder[a.strength] || 0;
        const bOrder = strengthOrder[b.strength] || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // If same strength category, sort by mg value
        const aMg = parseFloat(a.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        const bMg = parseFloat(b.strength.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
        return aMg - bMg;
      })
    }));

    // Transform product data to match expected format
    // Parse brand and flavour from product name
    const nameParts = product.name.split(' ');
    const brand = nameParts[0] || '';
    const flavour = nameParts.slice(1).join(' ') || '';
    
    return {
      id: product.id,
      slug: slug,
      title: product.name,
      name: product.name,
      image: product.image_url || '/placeholder-product.jpg',
      rating: 4.5, // Default rating
      description: product.content || product.excerpt || `Compare ${product.name} packs - best prices and deals UK.`,
      brand: brand,
      flavour: flavour,
      strength_group: '', // Not available in wp_products
      format: '', // Not available in wp_products
      page_url: product.page_url,
      stores: stores,
      content: product.content, // Long description
      excerpt: product.excerpt || `${brand} HERE`, // Short description
      seoData
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

  const { seoData } = product;

  return (
    <>
      <SEOHead seoData={seoData} hreflang={seoData.schema_json_ld.WebPage.hreflang} />
      
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          <Header />

          <main id="main" className="clearfix" style={{
            backgroundColor: '#f3f3f5',
            minHeight: '100vh'
          }}>
            
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation breadcrumbs={seoData.schema_json_ld.BreadcrumbList.itemListElement} />

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
                
                {/* Price Comparison Table */}
                <div style={{ marginBottom: '40px' }}>
                  <ProductComparisonTable product={{
                    id: 'seo-comparison',
                    slug: 'seo-comparison',
                    title: 'SEO Comparison',
                    name: 'SEO Comparison',
                    image: '/placeholder-product.jpg',
                    rating: 0,
                    description: 'SEO optimized product comparison',
                    brand: 'Various',
                    flavour: 'Various',
                    strength_group: 'Various',
                    format: 'Pouches',
                    page_url: '/seo-comparison',
                    stores: seoData.schema_json_ld.Product_set.map((p: any) => ({
                      id: p.sku || Math.random().toString(),
                      name: p.brand.name,
                      logo: '/placeholder-logo.jpg',
                      rating: parseFloat(p.aggregateRating.ratingValue),
                      shipping_info: 'Standard shipping available',
                      prices: {
                        '1pack': p.offers.price || 'N/A',
                        '5pack': 'N/A',
                        '10pack': 'N/A',
                        '20pack': 'N/A'
                      },
                      url: p.url || '#',
                      in_stock: p.offers.availability === 'https://schema.org/InStock',
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
                    {seoData.on_page_copy_scaffold.specs_section.h2}
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
                      {seoData.on_page_copy_scaffold.specs_section.bullets.map((bullet, index) => (
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
                      All {product.brand} Products
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
                      All {product.flavour} Products
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
                      {seoData.schema_json_ld.Product_set[0]?.additionalProperty.find((prop: any) => prop.name === 'Strength (mg)')?.value || 'Standard'} mg Products
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

// Generate metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const { seoData } = product;

  return {
    title: seoData.meta.title,
    description: seoData.meta.description,
    robots: seoData.meta.robots,
    alternates: {
      canonical: seoData.meta.canonical,
    },
    openGraph: {
      title: seoData.meta.og['og:title'],
      description: seoData.meta.og['og:description'],
      url: seoData.meta.og['og:url'],
      siteName: seoData.meta.og['og:site_name'],
      type: 'website',
      images: [
        {
          url: seoData.meta.og['og:image'],
          width: 1200,
          height: 630,
          alt: seoData.meta.og['og:title'],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.meta.twitter.title,
      description: seoData.meta.twitter.description,
      images: [seoData.meta.twitter.image],
    },
  };
}
