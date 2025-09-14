'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import VendorLogo from '@/components/VendorLogo';
import PackFilter from '@/components/PackFilter';
import PriceSortFilter from '@/components/PriceSortFilter';
import ShippingFilter from '@/components/ShippingFilter';
import ReviewFilter from '@/components/ReviewFilter';
import ReviewBalls from '@/components/ReviewBalls';
import ReviewForm from '@/components/ReviewForm';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import VendorAnalytics from '@/components/VendorAnalytics';
import { getImageStyles } from '@/utils/imageUtils';

// Fetch US product data from Supabase
async function getUSProduct(slug: string) {
  try {
    // Convert slug back to proper case name
    const properCaseName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // First try to find by exact name match
    let { data: product, error } = await supabase()
      .from('us_products')
      .select('*')
      .eq('product_title', properCaseName)
      .single();

    // If not found, try case-insensitive match
    if (error || !product) {
      const { data: products, error: searchError } = await supabase()
        .from('us_products')
        .select('*')
        .ilike('product_title', `%${slug.replace(/-/g, ' ')}%`)
        .limit(1);

      if (searchError || !products || products.length === 0) {
        return null;
      }
      product = products[0];
    }

    // Get US vendor products that are mapped to this product
    const { data: vendorProducts, error: vpError } = await supabase()
      .from('us_vendor_products')
      .select(`
        *,
        us_vendors!inner(
          id,
          name,
          website,
          status
        )
      `)
      .eq('us_product_id', product.id);

    if (vpError) {
      console.error('Error fetching US vendor products:', vpError);
    }

    // Helper function to format prices consistently
    const formatPrice = (price: any) => {
      if (!price) return 'N/A';
      const priceStr = price.toString();
      if (priceStr.includes('$')) {
        // Extract number from $X.XX format and reformat
        const numStr = priceStr.replace('$', '');
        return `$${parseFloat(numStr).toFixed(2)}`;
      } else {
        // Add $ and format to 2 decimal places
        return `$${parseFloat(priceStr).toFixed(2)}`;
      }
    };

    // Transform vendor products to store format and deduplicate by vendor
    const storesMap = new Map();
    vendorProducts?.forEach((vp: any) => {
      const key = `${vp.us_vendor_id}-${product.name}`;
      if (!storesMap.has(key)) {
        storesMap.set(key, {
          name: vp.us_vendors.name,
          logo: vp.us_vendors.name, // Pass vendor name instead of broken logo URL
          rating: 4.0, // Default rating since us_vendors doesn't have rating column
          shipping: 'Standard shipping', // Default shipping since us_vendors doesn't have shipping_info
          product: product.name,
          price: formatPrice(vp.price_1pack),
          link: vp.product_url || '#',
          vendorId: vp.us_vendor_id,
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
      }
    });
    
    const stores = Array.from(storesMap.values());

    // If no vendor products found, create a default Prilla store
    if (stores.length === 0) {
      stores.push({
        name: 'Prilla',
        logo: 'Prilla',
        rating: 4.5,
        product: product.product_title,
        price: '$3.99',
        shipping: 'Free shipping on orders over $25',
        link: product.page_url || '#',
        vendorId: 'prilla',
        prices: {
          '1pack': '$3.99',
          '3pack': '$11.97',
          '5pack': '$19.95',
          '10pack': '$39.90',
          '20pack': '$79.80',
          '25pack': '$99.75',
          '30pack': '$119.70',
          '50pack': '$199.50'
        }
      });
    }

    // Transform product data to match expected format
    return {
      id: product.id,
      slug: slug,
      title: product.product_title,
      name: product.product_title,
      image: product.image_url || '/placeholder-product.svg',
      rating: 4.5, // Default rating
      description: product.description || `Premium ${product.brand} ${product.flavour} nicotine pouches with ${product.strength} strength.`,
      brand: product.brand,
      flavour: product.flavour,
      strength_group: product.strength,
      format: product.format,
      page_url: product.page_url,
      stores: stores
    };
  } catch (error) {
    console.error('Error fetching US product:', error);
    return null;
  }
}

interface USProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function USProductPage({ params }: USProductPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const productData = await getUSProduct(resolvedParams.slug);
      setProduct(productData);
      setLoading(false);
    };
    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!product) {
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
          minHeight: '100vh'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#333',
            padding: '15px 0',
            borderBottom: '1px solid #555'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              fontSize: '14px',
              color: '#fff'
            }}>
              <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
              <span style={{ margin: '0 8px' }}>»</span>
              <a href="/us" style={{ color: '#fff', textDecoration: 'none' }}>US Products</a>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>{product.title}</span>
            </div>
          </div>

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
                  style={getImageStyles(product.image)}
                />
              </div>

              {/* Product Info */}
              <div>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 15px 0',
                  lineHeight: '1.1'
                }}>
                  {product.title}
                </h1>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginRight: '8px' }}>
                    <ReviewBalls rating={product.rating} size={24} />
                  </div>
                  <span style={{
                    color: '#666',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    {product.rating.toFixed(1)}
                  </span>
                </div>

                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  {product.description}
                </p>

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
                  Compare prices
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0 auto',
              padding: '0 20px',
              display: 'flex',
              gap: '2rem'
            }}>
              
              {/* Left Column - Vendor Price Comparison */}
              <div style={{ flex: '1', minWidth: '0' }}>
                {/* Filter Options */}
                <div style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  {/* Filter Icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '20px',
                    border: '1px solid #e9ecef'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                    </svg>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: '#495057'
                    }}>
                      Filters
                    </span>
                  </div>
                  
                  {/* Sort Filter */}
                  <select id="price-sort" style={{
                    padding: '6px 12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    backgroundColor: '#fff',
                    color: '#495057',
                    cursor: 'pointer',
                    fontWeight: '500',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '32px'
                  }}>
                    <option value="low-high">Lowest Price</option>
                    <option value="high-low">Highest Price</option>
                  </select>
                  
                  {/* Pack Size Filter */}
                  <select id="pack-size" style={{
                    padding: '6px 12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    backgroundColor: '#fff',
                    color: '#495057',
                    cursor: 'pointer',
                    fontWeight: '500',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '32px'
                  }}>
                    <option value="1pack">1 Pack</option>
                    <option value="3pack">3 Pack</option>
                    <option value="5pack">5 Pack</option>
                    <option value="10pack">10 Pack</option>
                    <option value="20pack">20 Pack</option>
                    <option value="25pack">25 Pack</option>
                    <option value="30pack">30 Pack</option>
                    <option value="50pack">50 Pack</option>
                  </select>
                </div>

                {/* Vendor List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                {product.stores.map((store: any, index: number) => (
                   <div key={index} 
                        className="vendor-card"
                        data-vendor-id={store.vendorId}
                        data-vendor-name={store.name}
                        data-price={store.prices['1pack']?.replace('$', '') || '0'}
                        data-store-name={store.name}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          padding: '0',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                     
                     {/* Top Section - Logo and Vendor Name */}
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       padding: '1rem 1.5rem 0.75rem 1.5rem',
                       borderBottom: '1px solid #e5e7eb'
                     }}>
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '12px'
                       }}>
                         <a href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`}>
                           <VendorLogo 
                             logo={store.logo} 
                             name={store.name} 
                             size={38}
                           />
                         </a>
                         <a 
                           href={`/vendor/${store.name.toLowerCase().replace(/\s+/g, '-')}`}
                           style={{
                             fontSize: '0.95rem',
                             fontWeight: '600',
                             color: '#1f2937',
                             textDecoration: 'none'
                           }}
                           className="hover:text-blue-600 transition-colors"
                         >
                           {store.name}
                         </a>
                       </div>
                     </div>

                     {/* Bottom Section - Product Details and Price */}
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'space-between',
                       padding: '0.75rem 1.5rem 1rem 1.5rem'
                     }}>
                       <div style={{
                         display: 'flex',
                         flexDirection: 'column',
                         gap: '4px',
                         flex: '1'
                       }}>
                         <a href={store.link}
                            className="product-title-link"
                            style={{
                              fontSize: '0.9rem',
                              color: '#0073aa',
                              textDecoration: 'none',
                              fontWeight: '500'
                            }}>
                           {store.product}
                           <span className="pack-size-display" style={{ color: '#6b7280', fontSize: '0.85rem' }}> (1 Pack)</span>
                         </a>
                         
                         <div style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px',
                           fontSize: '0.8rem',
                           color: '#6b7280'
                         }}>
                           <span>Lowest price</span>
                           <span>·</span>
                           <span>{store.shipping}</span>
                         </div>
                       </div>

                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '12px'
                       }}>
                         <div style={{
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'flex-end',
                           gap: '2px'
                         }}>
                           <span className="price-display" style={{
                             fontSize: '1.25rem',
                             fontWeight: 'bold',
                             color: '#1f2937'
                           }}>
                             {store.prices['1pack'] || 'N/A'}
                           </span>
                         </div>
                         
                         <a href={store.link}
                            target="_blank"
                            rel="nofollow"
                            className="buy-now-button"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: 'none',
                              padding: '8px',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              borderRadius: '4px'
                            }}>
                           <span style={{
                             fontSize: '1.1rem',
                             color: '#6b7280',
                             fontWeight: 'bold'
                           }}>
                             &gt;
                           </span>
                         </a>
                       </div>
                     </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Right Column - Product Info Sidebar */}
              <div style={{ flex: '0 0 300px', maxWidth: '300px' }}>
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(209, 213, 219, 0.3)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  position: 'sticky',
                  top: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#1f2937'
                  }}>
                    Product Details
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Product Name */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Product Name
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.name}
                      </p>
                    </div>

                    {/* Brand */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Brand
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.brand}
                      </p>
                    </div>

                    {/* Flavour */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Flavour
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.flavour}
                      </p>
                    </div>

                    {/* Strength */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Strength
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.strength_group}
                      </p>
                    </div>

                    {/* Format */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Format
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.format}
                      </p>
                    </div>

                    {/* Available Vendors */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Available From
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {product.stores.length} vendor{product.stores.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Price Range */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Price Range (1 Pack)
                      </span>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {(() => {
                          const prices = product.stores
                            .map((store: any) => {
                              const priceStr = store.prices['1pack'] || 'N/A';
                              if (priceStr === 'N/A') return null;
                              return parseFloat(priceStr.replace('$', ''));
                            })
                            .filter((price: any): price is number => price !== null);
                          
                          if (prices.length === 0) return 'N/A';
                          if (prices.length === 1) return `$${prices[0]?.toFixed(2) || '0.00'}`;
                          
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
                        })()}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Description
                      </span>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        lineHeight: '1.5'
                      }}>
                        {product.description}
                      </p>
                    </div>

                    {/* Product Link */}
                    {product.page_url && (
                      <div>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Original Product
                        </span>
                        <a 
                          href={product.page_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.875rem',
                            color: '#0073aa',
                            textDecoration: 'none',
                            margin: '0.25rem 0 0 0',
                            display: 'block',
                            wordBreak: 'break-all'
                          }}
                        >
                          View Original →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '40px 0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '2rem'
            }}>
              
              {/* Reviews Display */}
              <div>
                <ReviewsDisplay productId={product.id} />
              </div>

              {/* Review Form */}
              <div>
                <ReviewForm 
                  productId={product.id}
                  productName={product.name}
                  vendors={product.stores.map((store: any) => ({
                    id: store.vendorId,
                    name: store.name,
                    logo: store.logo
                  }))}
                />
              </div>
            </div>
          </div>

        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      {/* Vendor Analytics Component */}
      <VendorAnalytics 
        productId={product.id.toString()} 
        productName={product.name} 
        region="US" 
      />
      
      {/* Pack Filter Component */}
      <PackFilter stores={product.stores} />
      
      {/* Price Sort Filter Component */}
      <PriceSortFilter />
      
      {/* Shipping Filter Component */}
      <ShippingFilter />
      
      {/* Review Filter Component */}
      <ReviewFilter />
    </div>
  );
}


