import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductButtonScript from './ProductButtonScript';
import ClientPriceAlertModal from './ClientPriceAlertModal';

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength: string;
  format: string;
  image: string;
  price: string;
  stores: number;
  watching: number;
  link: string;
}

interface SSRProductGridProps {
  brandFilter?: string;
  vendorFilter?: string;
  isUSRoute?: boolean;
}

const SSRProductGrid = async ({ brandFilter, vendorFilter, isUSRoute = false }: SSRProductGridProps) => {
  // Fetch products on the server
  let products: Product[] = [];

  try {
    let data: any[] = [];

    if (vendorFilter) {
      // For vendor filtering, get products through vendor_product_mapping
      const { data: vendor, error: vendorError } = await supabase()
        .from('vendors')
        .select('id')
        .ilike('name', `%${vendorFilter}%`)
        .single();

      if (vendorError || !vendor) {
        throw new Error('Vendor not found');
      }

      // Get mapped products for this vendor
      const { data: mappings, error: mappingError } = await supabase()
        .from('vendor_product_mapping')
        .select('product_id')
        .eq('vendor_id', vendor.id);

      if (mappingError) {
        throw mappingError;
      }

      if (mappings && mappings.length > 0) {
        const productIds = mappings.map((m: any) => m.product_id);
        const { data: productData, error: productError } = await supabase()
          .from('wp_products')
          .select('*')
          .in('id', productIds);

        if (productError) {
          throw productError;
        }
        data = productData || [];
      }
    } else {
      // For brand filtering or no filter, get products directly
      let query = supabase().from('wp_products').select('*');
      
      // Apply brand filter if provided (extract brand from name)
      if (brandFilter) {
        query = query.ilike('name', `${brandFilter}%`);
      }
      
      const { data: productData, error } = await query;
      
      if (error) {
        throw error;
      }
      
      data = productData || [];
    }

    // Fetch vendor product mappings to calculate real store counts
    const { data: mappings, error: mappingsError } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id');

    if (mappingsError) {
      console.error('Error fetching mappings:', mappingsError);
    }

    // Count stores per product
    const storeCounts = new Map<number, number>();
    mappings?.forEach((mapping: any) => {
      const count = storeCounts.get(mapping.product_id) || 0;
      storeCounts.set(mapping.product_id, count + 1);
    });

    // Function to generate watching count between 400-800, round up to nearest hundred
    const generateWatchingCount = (min: number = 400, max: number = 800) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const rounded = Math.ceil(count / 100) * 100;
      return rounded;
    };

    // Transform data to match expected format
    products = data.map((product: any, index: number) => {
      // Extract brand from product name (first word)
      const brand = product.name.split(' ')[0];
      const flavour = product.name.split(' ').slice(1).join(' ');
      
      return {
        id: product.id,
        name: product.name,
        price: product.price ? `${isUSRoute ? '$' : '£'}${parseFloat(product.price).toFixed(2)}` : `${isUSRoute ? '$' : '£'}${(2.99 + Math.random() * 2).toFixed(2)}`,
        strength: 'Normal', // Default strength since wp_products doesn't have this field
        stores: storeCounts.get(product.id) || 0, // Real store count from mappings
        watching: generateWatchingCount(400, 800), // Use same watching logic as homepage
        image: product.image_url || '/placeholder-product.jpg',
        link: `/product/${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        brand: brand,
        flavour: flavour,
        format: 'Slim' // Default format since wp_products doesn't have this field
      };
    });

  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Normal':
        return { bg: '#E6FFE6', color: '#228B22' };
      case 'Strong':
        return { bg: '#FFF2CC', color: '#D6B656' };
      case 'Extra Strong':
        return { bg: '#FFE6E6', color: '#D63384' };
      default:
        return { bg: '#E6FFE6', color: '#228B22' };
    }
  };

  const renderProductCard = (product: Product) => {
    const strengthStyle = getStrengthColor(product.strength);
    
    return (
      <div key={product.id} className="swiper-slide" style={{ 
        width: '100%',
        minWidth: '0',
        flex: 'none',
        marginRight: '0',
        opacity: '1',
        visibility: 'visible',
        transform: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div className="product-card" 
             data-product-id={product.id}
             style={{
               position: 'relative',
               background: 'transparent',
               backgroundColor: 'transparent',
               borderRadius: '0',
               overflow: 'visible',
               transition: 'transform 0.2s',
               height: '100%',
               display: 'flex',
               flexDirection: 'column',
               padding: '0',
               boxShadow: 'none',
               width: '100%',
               cursor: 'pointer',
               margin: '0',
               minHeight: '200px',
               opacity: '1',
               visibility: 'visible'
             }}>
          
          {/* Watching Badge */}
          <div className="watching-badge" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#e5ff7d',
            padding: '3px 8px',
            borderRadius: '100px',
            fontSize: '11px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2,
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }}>
            {product.watching}+ watching
          </div>
          
          {/* Button Group */}
          <div className="button-group" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px',
            zIndex: 100
          }}>
            <div className="alert-button">
              <button className="price-alert-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        transition: 'all 0.2s ease',
                        margin: '0'
                      }}>
                <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>

            <div className="favorite-button">
              <button className="wishlist-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      data-is-in-wishlist="false"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        transition: 'all 0.2s ease',
                        margin: '0'
                      }}>
                <svg viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <Link href={product.link} className="product-link" style={{ 
            position: 'relative',
            zIndex: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            pointerEvents: 'auto'
          }}>
            <div className="product-image" style={{
              width: '100%',
              paddingBottom: '60%',
              position: 'relative',
              marginBottom: '8px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#fefefe',
              border: '1px solid #e0e0e0'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '12px',
                  margin: '0',
                  border: 'none',
                  borderRadius: '0',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="product-details" style={{ 
              padding: '4px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              margin: '0',
              background: 'transparent',
              border: 'none'
            }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <h2 className="product-title" style={{
                      fontSize: '14px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      fontWeight: '500',
                      color: '#000',
                      margin: '0',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      lineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      boxOrient: 'vertical',
                      overflow: 'hidden',
                      maxHeight: '2.6em',
                      letterSpacing: '-0.2px',
                      padding: '0',
                      textAlign: 'left',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      {product.name}
                    </h2>

                    <span className="product-strength-label" 
                          style={{
                            backgroundColor: strengthStyle.bg,
                            color: strengthStyle.color,
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                            fontWeight: '600',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                      {product.strength}
                    </span>
                  </div>

              <div className="rating-price-container" style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div className="product-price" style={{
                  fontSize: '14px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  fontWeight: '600',
                  color: '#000',
                  letterSpacing: '-0.2px',
                  margin: '0',
                  padding: '0',
                  lineHeight: '1'
                }}>
                  {product.price}
                </div>
              </div>

              <div className="store-count" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '10px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: '#666',
                marginTop: '4px',
                letterSpacing: '-0.2px',
                lineHeight: '1'
              }}>
                <span className="store-count-badge" style={{
                  fontWeight: '500',
                  color: '#666'
                }}>
                  {product.stores}
                </span>
                <span className="store-count-text" style={{ color: '#666' }}>stores</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      <ProductButtonScript />
      <ClientPriceAlertModal />
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Large Desktop (1400px+) */
          @media (min-width: 1400px) {
            .sidebar-mobile {
              width: 20% !important;
              min-width: 280px !important;
            }
            .products-mobile {
              width: 80% !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(5, 1fr) !important;
              gap: 12px !important;
            }
          }
          
          /* Desktop (1200px - 1399px) */
          @media (min-width: 1200px) and (max-width: 1399px) {
            .sidebar-mobile {
              width: 22% !important;
              min-width: 260px !important;
            }
            .products-mobile {
              width: 78% !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 10px !important;
            }
          }
          
          /* Small Desktop (1024px - 1199px) */
          @media (min-width: 1024px) and (max-width: 1199px) {
            .sidebar-mobile {
              width: 25% !important;
              min-width: 240px !important;
            }
            .products-mobile {
              width: 75% !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
            }
          }
          
          /* Tablet (768px - 1023px) */
          @media (min-width: 768px) and (max-width: 1023px) {
            .sidebar-mobile {
              width: 30% !important;
              min-width: 200px !important;
            }
            .products-mobile {
              width: 70% !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 8px !important;
            }
          }
          
          /* Mobile (max-width: 767px) */
          @media (max-width: 767px) {
            .product-grid-container {
              flex-direction: column !important;
              gap: 0 !important;
            }
            .sidebar-mobile {
              display: none !important;
            }
            .mobile-filters {
              display: block !important;
              background: #fff !important;
              padding: 15px !important;
              border-bottom: 1px solid #e5e7eb !important;
              margin-bottom: 0 !important;
            }
            .mobile-filter-row {
              display: flex !important;
              gap: 10px !important;
              flex-wrap: wrap !important;
              align-items: center !important;
            }
            .mobile-filter-select {
              flex: 1 !important;
              min-width: 120px !important;
              padding: 8px 12px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: #fff !important;
            }
            .mobile-filter-button {
              padding: 8px 16px !important;
              background: #1e40af !important;
              color: #fff !important;
              border: none !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
            }
            .products-mobile {
              width: 100% !important;
              order: 2 !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 15px !important;
              padding: 15px !important;
            }
            .section-header-mobile {
              padding: 15px !important;
              margin-bottom: 0 !important;
            }
            .section-header-mobile h2 {
              font-size: 20px !important;
            }
          }
          
          /* Hide mobile filters on desktop */
          @media (min-width: 768px) {
            .mobile-filters {
              display: none !important;
            }
          }
          
          /* Small Mobile (max-width: 480px) */
          @media (max-width: 480px) {
            .mobile-filter-row {
              flex-direction: column !important;
              gap: 8px !important;
            }
            .mobile-filter-select {
              width: 100% !important;
              min-width: auto !important;
            }
            .mobile-filter-button {
              width: 100% !important;
            }
            .products-grid-mobile {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
              padding: 10px !important;
            }
          }
        `
      }} />
      
      <div className="product-grid-container" style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        width: '100%',
        minHeight: '600px',
        backgroundColor: '#f4f5f9',
        padding: '0',
        margin: '0'
      }}>
        
        {/* Products Section - 82% of space on desktop, full width on mobile */}
        <div className="products-mobile" style={{
          flexShrink: 0,
          width: '82%',
          overflow: 'hidden'
        }}>
        <div style={{
           backgroundColor: '#f4f5f9',
               padding: '10px',
               width: '100%',
               margin: '0',
               boxSizing: 'border-box'
             }}>
          <div style={{
             width: '100%',
                 margin: '0',
                 padding: '0',
                 boxSizing: 'border-box'
           }}>
        
        {/* Section Header */}
        <div className="section-header-mobile fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '10px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    fontSize: '24px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#333',
                    letterSpacing: '-0.3px'
                  }}>
                    Products
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <div style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 boxSizing: 'border-box'
               }}>
            
            <div className="products-grid-mobile swiper-wrapper" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '0',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '18px', color: '#666' }}>No products found</div>
                </div>
              ) : (
                products.map(renderProductCard)
              )}
            </div>
          </div>
        </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SSRProductGrid;
