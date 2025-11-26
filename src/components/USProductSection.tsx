'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PriceAlertModal from './PriceAlertModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import USProductCard from './USProductCard';

interface USProduct {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength: string;
  format: string;
  nicotine_strength: string;
  manufacturer: string;
  description?: string;
  store_count: number;
  watching_count: number;
  external_url?: string;
  image_url?: string;
}

const USProductSection = () => {
  const [products, setProducts] = useState<USProduct[]>([]);
  const [secondRowProducts, setSecondRowProducts] = useState<USProduct[]>([]);
  const [veloProducts, setVeloProducts] = useState<USProduct[]>([]);
  const [zynProducts, setZynProducts] = useState<USProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState<Set<number>>(new Set());
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<USProduct | null>(null);
  const { user, triggerLoginModal } = useAuth();
  const { getLocalizedPath } = useLanguage();

  // Function to generate watching count between 400-800, round up to nearest hundred
  const generateWatchingCount = (min: number = 400, max: number = 800) => {
    // Generate random number between 400-800
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Round up to nearest hundred
    const rounded = Math.ceil(count / 100) * 100;
    
    return rounded;
  };


  // Load user's price alerts and wishlist
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setPriceAlerts(new Set());
      setWishlist(new Set());
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load price alerts
      const { data: alerts } = await supabase()
        .from('price_alerts')
        .select('product_id')
        .eq('user_id', user?.id);

      if (alerts) {
        setPriceAlerts(new Set(alerts.map((alert: any) => alert.product_id)));
      }

      // Load wishlist
      const { data: wishlistItems } = await supabase()
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user?.id);

      if (wishlistItems) {
        setWishlist(new Set(wishlistItems.map((item: any) => item.product_id)));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const togglePriceAlert = async (productId: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }

    try {
      const isAlertActive = priceAlerts.has(productId);
      
      if (isAlertActive) {
        // Remove alert
        await supabase()
          .from('price_alerts')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        setPriceAlerts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // Add alert
        await supabase()
          .from('price_alerts')
          .insert({
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString()
          });
        
        setPriceAlerts(prev => new Set([...Array.from(prev), productId]));
      }
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }

    try {
      const isInWishlist = wishlist.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist
        await supabase()
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        setWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // Add to wishlist
        await supabase()
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString()
          });
        
        setWishlist(prev => new Set([...Array.from(prev), productId]));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handlePriceAlertClick = (productId: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }
    
    const product = [...products, ...secondRowProducts].find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setPriceAlertModalOpen(true);
    }
  };

  const handleHeartClick = (productId: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }
    
    // Toggle popup for this product
    setActivePopup(activePopup === productId ? null : productId);
  };

  const handlePriceAlertFromHeart = (productId: number) => {
    const product = [...products, ...secondRowProducts].find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setPriceAlertModalOpen(true);
    }
    setActivePopup(null); // Close popup after action
  };

  const handleAddToListFromHeart = async (productId: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }
    
    const product = [...products, ...secondRowProducts].find(p => p.id === productId);
    const isInList = wishlist.has(productId);
    
    await toggleWishlist(productId);
    
    // Show feedback to user
    if (product) {
      if (isInList) {
        console.log(`Removed "${product.name}" from your favourites`);
      } else {
        console.log(`Added "${product.name}" to your favourites`);
      }
    }
    
    setActivePopup(null); // Close popup after action
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopup !== null) {
        // Check if the click is inside any popup
        const target = event.target as Element;
        const isInsidePopup = target.closest('[data-popup="true"]');
        
        if (!isInsidePopup) {
          setActivePopup(null);
        }
      }
    };

    if (activePopup !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activePopup]);

  useEffect(() => {
    const fetchUSProducts = async () => {
      try {
        // Query US products from us_products table
        const { data: usProducts, error } = await supabase()
          .from('us_products')
          .select('*')
          .order('id', { ascending: true })
          .limit(200);

        if (error) throw error;

        // Query US vendors (Prilla, Northerner US, Nickokick)
        const { data: usVendors, error: vendorsError } = await supabase()
          .from('us_vendors')
          .select('*')
          .in('name', ['Prilla', 'Northerner US', 'Nickokick']);

        if (vendorsError) throw vendorsError;

        // Query US vendor products
        const { data: usVendorProducts, error: vendorProductsError } = await supabase()
          .from('us_vendor_products')
          .select(`
            *,
            us_products!inner(product_title, brand, flavour, strength, format, image_url),
            us_vendors!inner(name)
          `)
          .in('us_vendor_id', usVendors?.map((v: any) => v.id) || []);

        if (vendorProductsError) throw vendorProductsError;


        // Process products to match USProduct interface
        const processedProducts = (usProducts || []).map((product: any) => ({
          id: product.id,
          name: product.product_title,
          brand: product.brand || 'Unknown',
          flavour: product.flavour || 'Unknown',
          strength: product.strength || 'Normal',
          format: product.format || 'Slim',
          nicotine_strength: product.nicotine_mg_pouch || '8mg',
          manufacturer: product.td_element || 'Unknown',
          description: product.description,
          store_count: Math.floor(Math.random() * 5) + 1, // Random store count 1-5
          watching_count: generateWatchingCount(400, 800), // Random watching count 400-800, avoiding even hundreds
          external_url: product.page_url,
          image_url: product.image_url
        }));

        // Process vendor products to match USProduct interface
        const processedVendorProducts = (usVendorProducts || []).map((vendorProduct: any) => ({
          id: `vendor_${vendorProduct.id}`,
          name: vendorProduct.us_products?.product_title || 'Unknown Product',
          brand: vendorProduct.us_products?.brand || 'Unknown',
          flavour: vendorProduct.us_products?.flavour || 'Unknown',
          strength: vendorProduct.us_products?.strength || 'Normal',
          format: vendorProduct.us_products?.format || 'Slim',
          nicotine_strength: '8mg',
          manufacturer: vendorProduct.us_vendors?.name || 'Unknown Vendor',
          description: '',
          store_count: Math.floor(Math.random() * 3) + 1, // Random store count 1-3 for vendor products
          watching_count: generateWatchingCount(400, 600), // Random watching count 400-600 for vendor products, avoiding even hundreds
          external_url: vendorProduct.product_url,
          image_url: vendorProduct.us_products?.image_url
        }));

        // Combine both product sources
        const allProducts = [...processedProducts, ...processedVendorProducts];

        // Sort by store count (most linked stores first)
        const sortedProducts = allProducts.sort((a: any, b: any) => b.store_count - a.store_count);

        // Take first 20 products (10 for each row)
        const firstRow = sortedProducts.slice(0, 10);
        const secondRow = sortedProducts.slice(10, 20);

        // Filter Velo products - comprehensive search
        const veloProducts = sortedProducts.filter((product: any) => {
          return product.brand?.toLowerCase().includes('velo') || 
                 product.name?.toLowerCase().includes('velo') ||
                 product.manufacturer?.toLowerCase().includes('velo') ||
                 product.flavour?.toLowerCase().includes('velo');
        }).slice(0, 10);

        // Filter Zyn products
        const zynProducts = sortedProducts.filter((product: any) => 
          product.brand.toLowerCase().includes('zyn') || 
          product.name.toLowerCase().includes('zyn')
        ).slice(0, 10);


        setProducts(firstRow);
        setSecondRowProducts(secondRow);
        setVeloProducts(veloProducts);
        setZynProducts(zynProducts);
      } catch (error) {
        console.error('Error fetching US products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUSProducts();
  }, []);

  if (loading) {
    console.log('USProductSection: Loading state is true');
    return (
      <div className="fusion-fullwidth fullwidth-box fusion-builder-row-9 fusion-flex-container has-pattern-background has-mask-background hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
           style={{
             backgroundColor: '#f4f5f9',
             padding: '40px 0',
             width: '100vw',
             marginLeft: 'calc(50% - 50vw)',
             marginRight: 'calc(50% - 50vw)'
           }}>
      <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
           style={{
             width: '100%',
             maxWidth: 'none',
             margin: '0',
             padding: '0 20px',
             overflow: 'visible',
             position: 'relative'
           }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading US products...
          </div>
        </div>
      </div>
    );
  }

  console.log('USProductSection: Rendering with products:', products.length);

  return (
    <>
      <style jsx>{`
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
          .swiper-wrapper {
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
          .swiper-wrapper::-webkit-scrollbar {
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
          .swiper-wrapper {
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
      `}</style>
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
      <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
           style={{
             width: '100%',
             maxWidth: 'none',
             margin: '0',
             padding: '0 20px',
             overflow: 'visible',
             position: 'relative'
           }}>
        
        {/* Section Header */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
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
                    Most Popular US Products
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* First Row - Most popular US products */}
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
            
            <div className="swiper-wrapper" style={{
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
              {products.map(product => {
                console.log('Rendering product:', product);
                return (
                  <USProductCard
                    key={product.id}
                    product={product}
                    priceAlerts={priceAlerts}
                    wishlist={wishlist}
                    onPriceAlertClick={handlePriceAlertClick}
                    onHeartClick={handleHeartClick}
                    onPriceAlertFromHeart={handlePriceAlertFromHeart}
                    onAddToListFromHeart={handleAddToListFromHeart}
                    showActions={true}
                    activePopup={activePopup}
                    onSetActivePopup={setActivePopup}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Second Row Header */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
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
                    Trending US Products
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Trending US products */}
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
            
            <div className="swiper-wrapper" style={{
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
              {secondRowProducts.map(product => (
                <USProductCard
                  key={product.id}
                  product={product}
                  priceAlerts={priceAlerts}
                  wishlist={wishlist}
                  onPriceAlertClick={handlePriceAlertClick}
                  onHeartClick={handleHeartClick}
                  onPriceAlertFromHeart={handlePriceAlertFromHeart}
                  onAddToListFromHeart={handleAddToListFromHeart}
                  showActions={true}
                  activePopup={activePopup}
                  onSetActivePopup={setActivePopup}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Third Row Header - Velo */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '30px', marginTop: '60px' }}>
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
                    Velo US Products
                  </h2>
                </div>
              </div>
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
            
            <div className="swiper-wrapper" style={{
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
              {veloProducts.map(product => (
                <USProductCard
                  key={product.id}
                  product={product}
                  priceAlerts={priceAlerts}
                  wishlist={wishlist}
                  onPriceAlertClick={handlePriceAlertClick}
                  onHeartClick={handleHeartClick}
                  onPriceAlertFromHeart={handlePriceAlertFromHeart}
                  onAddToListFromHeart={handleAddToListFromHeart}
                  showActions={true}
                  activePopup={activePopup}
                  onSetActivePopup={setActivePopup}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Fourth Row Header - Zyn */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
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
                    Zyn US Products
                  </h2>
                </div>
              </div>
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
            
            <div className="swiper-wrapper" style={{
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
              {zynProducts.map(product => (
                <USProductCard
                  key={product.id}
                  product={product}
                  priceAlerts={priceAlerts}
                  wishlist={wishlist}
                  onPriceAlertClick={handlePriceAlertClick}
                  onHeartClick={handleHeartClick}
                  onPriceAlertFromHeart={handlePriceAlertFromHeart}
                  onAddToListFromHeart={handleAddToListFromHeart}
                  showActions={true}
                  activePopup={activePopup}
                  onSetActivePopup={setActivePopup}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      

      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        product={selectedProduct as any}
        userId={user?.id || ''}
        region="US"
        onAlertCreated={() => {
          // Refresh price alerts
          if (user) {
            loadUserData();
          }
        }}
      />
    </div>
    </>
  );
};

export default USProductSection;
