import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductButtonScript from './ProductButtonScript';
import ClientPriceAlertModal from './ClientPriceAlertModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalImagePath } from '@/utils/imageUtils';

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength_group: string;
  format: string;
  image_url?: string;
  page_url?: string;
  description?: string;
  store_count: number;
  price?: string;
}

interface SSRProductSectionProps {
  isUSRoute?: boolean;
  brandFilter?: string;
}

const SSRProductSection = async ({ isUSRoute = false, brandFilter }: SSRProductSectionProps) => {
  // Fetch products on the server
  let products: Product[] = [];
  let secondRowProducts: Product[] = [];
  let veloProducts: Product[] = [];
  let zynProducts: Product[] = [];

  try {
    // Use appropriate products table based on route
    const tableName = isUSRoute ? 'us_products' : 'wp_products';
    const nameField = isUSRoute ? 'product_title' : 'name';
    
    let query = supabase()
      .from(tableName)
      .select('*')
      .not('image_url', 'is', null)
      .order(isUSRoute ? 'product_title' : 'created_at', { ascending: false })
      .limit(50); // Limit to 50 products for faster loading
    
    // Apply brand filter if provided
    if (brandFilter) {
      query = query.ilike(nameField, `${brandFilter}%`);
    }
    
    const { data: wpProducts, error: wpError } = await query;

    if (wpError) throw wpError;

    // Only fetch mappings for the products we retrieved (much faster)
    const productIds = wpProducts?.map((p: any) => p.id) || [];
    const { data: mappings, error: mappingsError } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id')
      .in('product_id', productIds);

    if (mappingsError) throw mappingsError;

    // Count stores per product
    const storeCounts = new Map<number, number>();
    mappings?.forEach((mapping: any) => {
      const count = storeCounts.get(mapping.product_id) || 0;
      storeCounts.set(mapping.product_id, count + 1);
    });

    // Process WordPress products to match expected format
    const processedProducts = (wpProducts || []).map((product: any) => {
      const productName = isUSRoute ? product.product_title : product.name;
      const brand = isUSRoute ? (product.brand || product.product_title.split(' ')[0]) : product.name.split(' ')[0];
      const flavour = isUSRoute ? (product.flavour || product.product_title.split(' ').slice(1).join(' ')) : product.name.split(' ').slice(1).join(' ');
      
      return {
        id: product.id,
        name: productName,
        brand: brand,
        flavour: flavour,
        strength_group: isUSRoute ? (product.strength || 'Normal') : 'Normal',
        format: isUSRoute ? (product.format || 'Slim') : 'Slim',
        image_url: product.image_url,
        description: product.content || product.description,
        store_count: storeCounts.get(product.id) || 0, // Real store count from mappings
        price: product.price ? `${isUSRoute ? '$' : '£'}${parseFloat(product.price).toFixed(2)}` : `${isUSRoute ? '$' : '£'}${(2.99 + Math.random() * 2).toFixed(2)}`,
        created_at: product.created_at
      };
    });

    // Sort by store count (highest first) for most popular products
    const sortedProducts = processedProducts.sort((a: any, b: any) => 
      (b.store_count || 0) - (a.store_count || 0)
    );

    // Take first 20 products (10 for each row)
    products = sortedProducts.slice(0, 10);
    secondRowProducts = sortedProducts.slice(10, 20);

    // Filter Velo products
    veloProducts = sortedProducts.filter((product: any) => 
      product.name.toLowerCase().includes('velo')
    ).slice(0, 10);

    // Filter Zyn products
    zynProducts = sortedProducts.filter((product: any) => 
      product.name.toLowerCase().includes('zyn')
    ).slice(0, 10);

  } catch (error) {
    console.error('Error fetching products:', error);
  }

  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Use actual store count from database
  const getStoreCount = (product: Product) => {
    return product.store_count || 0;
  };

  // Function to generate watching count between 400-800, round up to nearest hundred
  const generateWatchingCount = (min: number = 400, max: number = 800) => {
    // Generate random number between 400-800
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Round up to nearest hundred
    const rounded = Math.ceil(count / 100) * 100;
    
    return rounded;
  };

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
    const strengthStyle = getStrengthColor(product.strength_group);
    const currencySymbol = isUSRoute ? '$' : '£';
    const price = product.price || `${currencySymbol}2.99`;
    const stores = getStoreCount(product);
    const watching = generateWatchingCount(400, 800);
    const slug = generateSlug(product.name);
    
    return (
      <div key={product.id} className="product-card-mobile swiper-slide" style={{ 
        width: '200px',
        minWidth: '200px',
        flex: '0 0 200px',
        marginRight: '0',
        opacity: '1',
        visibility: 'visible',
        transform: 'translateX(0)'
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
               minHeight: '326px',
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
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2,
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }}>
            {watching}+ watching
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
          
          <Link href={`/product/${slug}`} className="product-link" style={{ 
            position: 'relative',
            zIndex: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            pointerEvents: 'auto'
          }}>
            <div className="product-image" style={{
              width: '100%',
              paddingBottom: '108%',
              position: 'relative',
              marginBottom: '10px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#fefefe'
            }}>
              <img 
                src={getLocalImagePath(product.image_url, product.id, product.name)} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '22px',
                  margin: '0',
                  border: 'none',
                  borderRadius: '0',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="product-details" style={{ 
              padding: '8px',
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
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <h2 className="product-title" style={{
                      fontSize: '14px',
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
                            fontSize: '9px',
                            fontWeight: '600',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                      {product.strength_group}
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
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#000',
                  letterSpacing: '-0.2px',
                  margin: '0',
                  padding: '0',
                  lineHeight: '1'
                }}>
                  {price}
                </div>
              </div>

              <div className="store-count" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '9px',
                color: '#666',
                marginTop: '4px',
                letterSpacing: '-0.2px',
                lineHeight: '1'
              }}>
                <span className="store-count-badge" style={{
                  fontWeight: '500',
                  color: '#666'
                }}>
                  {stores}
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
          @media (max-width: 768px) {
            .product-section-mobile {
              padding: 20px 0 !important;
            }
            .product-section-container {
              padding: 0 15px !important;
            }
            .product-section-header h2 {
              font-size: 24px !important;
              margin-bottom: 20px !important;
            }
            .product-section-header {
              margin-bottom: 20px !important;
            }
            .swiper-wrapper-mobile {
              display: flex !important;
              flex-wrap: nowrap !important;
              gap: 12px !important;
              overflow-x: auto !important;
              scroll-behavior: smooth !important;
              width: 100% !important;
              padding: 0 0 10px 0 !important;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            .swiper-wrapper-mobile::-webkit-scrollbar {
              display: none !important;
            }
            .product-card-mobile {
              min-width: 280px !important;
              flex: 0 0 280px !important;
              margin-right: 0 !important;
            }
            .tier-1-products, .tier-2-products, .tier-3-products, .tier-4-products {
              margin-bottom: 30px !important;
            }
          }
          @media (max-width: 480px) {
            .swiper-wrapper-mobile {
              gap: 10px !important;
              padding: 0 0 10px 0 !important;
            }
            .product-card-mobile {
              min-width: 260px !important;
              flex: 0 0 260px !important;
            }
            .product-section-container {
              padding: 0 10px !important;
            }
          }
        `
      }} />
      
      <div className="product-section-mobile fusion-fullwidth fullwidth-box fusion-builder-row-9 fusion-flex-container has-pattern-background has-mask-background hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
           style={{
             backgroundColor: '#f4f5f9',
             padding: '40px 0',
             width: '100vw',
             marginLeft: 'calc(50% - 50vw)',
             marginRight: 'calc(50% - 50vw)',
             overflow: 'hidden',
             position: 'relative'
           }}>
        <div className="product-section-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
             style={{
               width: '100%',
               maxWidth: 'none',
               margin: '0',
               padding: '0 20px',
               overflow: 'visible',
               position: 'relative'
             }}>
        
        {/* Section Header */}
        <div className="product-section-header fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '30px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: '"Klarna 700"',
                    fontSize: '28px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#333',
                    letterSpacing: '-0.3px'
                  }}>
                    Most Popular Products
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* First Row - Last visited products */}
        <div className="tier-1-products" style={{ width: '100%', position: 'relative', marginBottom: '40px' }}>
          <div className="swiper product-cards-swiper" 
               data-columns-desktop="5"
               data-columns-tablet="3"
               data-columns-mobile="2"
               style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 position: 'relative',
                 zIndex: 1,
                 isolation: 'isolate'
               }}>
            
            <div className="swiper-wrapper-mobile swiper-wrapper" style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '12px',
              transform: 'translateX(0)',
              transition: 'transform 300ms ease',
              padding: '0',
              boxSizing: 'content-box',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              {products.map(renderProductCard)}
            </div>
          </div>
        </div>

        {/* Second Row Header */}
        <div className="product-section-header fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '30px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: '"Klarna 700"',
                    fontSize: '28px',
                    fontWeight: '400',
                    margin: '0',
                    color: '#333',
                    letterSpacing: '-0.3px'
                  }}>
                    Trending Now
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Trending products */}
        <div className="tier-1-products" style={{ width: '100%', position: 'relative' }}>
          <div className="swiper product-cards-swiper" 
               data-columns-desktop="5"
               data-columns-tablet="3"
               data-columns-mobile="2"
               style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 position: 'relative',
                 zIndex: 1,
                 isolation: 'isolate'
               }}>
            
            <div className="swiper-wrapper-mobile swiper-wrapper" style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '12px',
              transform: 'translateX(0)',
              transition: 'transform 300ms ease',
              padding: '0',
              boxSizing: 'content-box',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              {secondRowProducts.map(renderProductCard)}
            </div>
          </div>
        </div>


        {/* Third Row - Velo products */}
        <div className="tier-1-products" style={{ width: '100%', position: 'relative', marginBottom: '40px' }}>
          <div className="swiper product-cards-swiper" 
               data-columns-desktop="5"
               data-columns-tablet="3"
               data-columns-mobile="2"
               style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 position: 'relative',
                 zIndex: 1,
                 isolation: 'isolate'
               }}>
            
            <div className="swiper-wrapper-mobile swiper-wrapper" style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '12px',
              transform: 'translateX(0)',
              transition: 'transform 300ms ease',
              padding: '0',
              boxSizing: 'content-box',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              {veloProducts.map(renderProductCard)}
            </div>
          </div>
        </div>


        {/* Fourth Row - Zyn products */}
        <div className="tier-1-products" style={{ width: '100%', position: 'relative' }}>
          <div className="swiper product-cards-swiper" 
               data-columns-desktop="5"
               data-columns-tablet="3"
               data-columns-mobile="2"
               style={{
                 width: '100%',
                 padding: '0',
                 margin: '0',
                 overflow: 'hidden',
                 position: 'relative',
                 zIndex: 1,
                 isolation: 'isolate'
               }}>
            
            <div className="swiper-wrapper-mobile swiper-wrapper" style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '12px',
              transform: 'translateX(0)',
              transition: 'transform 300ms ease',
              padding: '0',
              boxSizing: 'content-box',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              {zynProducts.map(renderProductCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SSRProductSection;
