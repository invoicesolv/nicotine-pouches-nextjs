'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';
import PriceAlertModal from './PriceAlertModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

const ProductSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [secondRowProducts, setSecondRowProducts] = useState<Product[]>([]);
  const [veloProducts, setVeloProducts] = useState<Product[]>([]);
  const [zynProducts, setZynProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<Set<number>>(new Set());
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { getLocalizedPath, isUSRoute } = useLanguage();

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
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
      openLoginModal();
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
      openLoginModal();
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
      openLoginModal();
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
      openLoginModal();
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
      openLoginModal();
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
    const fetchProducts = async () => {
      try {
        // Determine which products table to use based on locale
        const productsTable = isUSRoute ? 'products_us' : 'products';
        
        // Query products with real store count from vendor_product_mapping
        const { data: productsWithStoreCount, error: storeCountError } = await supabase()
          .from(productsTable)
          .select(`
            *,
            vendor_product_mapping!vendor_product_mapping_product_id_fkey(
              vendor_id
            )
          `);

        if (storeCountError) throw storeCountError;

        // Process products to add store count
        const processedProducts = (productsWithStoreCount || []).map((product: any) => ({
          ...product,
          store_count: product.vendor_product_mapping?.length || 0
        }));

        // Sort by store count (most linked stores first)
        const sortedProducts = processedProducts.sort((a: any, b: any) => b.store_count - a.store_count);

        // Take first 20 products (10 for each row)
        const firstRow = sortedProducts.slice(0, 10);
        const secondRow = sortedProducts.slice(10, 20);

        // Filter Velo products
        const veloProducts = sortedProducts.filter((product: any) => 
          product.brand.toLowerCase().includes('velo') || 
          product.name.toLowerCase().includes('velo')
        ).slice(0, 10);

        // Filter Zyn products
        const zynProducts = sortedProducts.filter((product: any) => 
          product.brand.toLowerCase().includes('zyn') || 
          product.name.toLowerCase().includes('zyn')
        ).slice(0, 10);

        console.log('Top products by store count:', firstRow.map((p: any) => `${p.name}: ${p.store_count} stores`));
        console.log('Second row products:', secondRow.map((p: any) => `${p.name}: ${p.store_count} stores`));
        console.log('Velo products:', veloProducts.map((p: any) => `${p.name}: ${p.store_count} stores`));
        console.log('Zyn products:', zynProducts.map((p: any) => `${p.name}: ${p.store_count} stores`));

        setProducts(firstRow);
        setSecondRowProducts(secondRow);
        setVeloProducts(veloProducts);
        setZynProducts(zynProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Generate random price (since we don't have price data)
  const generatePrice = () => {
    const currencySymbol = isUSRoute ? '$' : '£';
    const prices = [`${currencySymbol}2.99`, `${currencySymbol}3.49`, `${currencySymbol}3.99`, `${currencySymbol}4.49`, `${currencySymbol}4.99`, `${currencySymbol}5.49`];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  // Use actual store count from database
  const getStoreCount = (product: Product) => {
    return product.store_count || 0;
  };

  // Generate random watching count
  const generateWatchingCount = () => {
    return Math.floor(Math.random() * 50) + 10; // 10-59 watching
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
    const price = generatePrice();
    const stores = getStoreCount(product);
    const watching = generateWatchingCount();
    const slug = generateSlug(product.name);
    
    return (
      <div key={product.id} className="swiper-slide" style={{ 
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
               minHeight: '260px',
               opacity: '1',
               visibility: 'visible'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-1px)';
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
                      onClick={() => handlePriceAlertClick(product.id)}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={priceAlerts.has(product.id) ? "#3b82f6" : "none"} stroke={priceAlerts.has(product.id) ? "#3b82f6" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: priceAlerts.has(product.id) ? "#3b82f6" : "none", stroke: priceAlerts.has(product.id) ? "#3b82f6" : "#666" }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>

            <div className="favorite-button" style={{ position: 'relative' }}>
              <button className="wishlist-toggle" 
                      data-product-id={product.id}
                      data-nonce="0510cae8a4"
                      data-is-in-wishlist={wishlist.has(product.id)}
                      onClick={() => handleHeartClick(product.id)}
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
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={wishlist.has(product.id) ? "#ef4444" : "none"} stroke={wishlist.has(product.id) ? "#ef4444" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: wishlist.has(product.id) ? "#ef4444" : "none", stroke: wishlist.has(product.id) ? "#ef4444" : "#666" }}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              {/* Popup Menu for Heart */}
              {activePopup === product.id && (
                <div 
                  data-popup="true"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '8px 0',
                    minWidth: '180px',
                    zIndex: 1000,
                    border: '1px solid #e5e7eb'
                  }}>
                  <button
                    onClick={() => handlePriceAlertFromHeart(product.id)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Price alert
                  </button>
                  
                  <button
                    onClick={() => handleAddToListFromHeart(product.id)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #374151',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: wishlist.has(product.id) ? '#ef4444' : 'transparent'
                    }}>
                      {wishlist.has(product.id) && (
                        <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </div>
                    {wishlist.has(product.id) ? 'Remove from favourites' : 'Add to favourites'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <Link href={getLocalizedPath(`/product/${slug}`)} className="product-link" style={{ 
            position: 'relative',
            zIndex: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            pointerEvents: 'auto'
          }}>
            <div className="product-image" style={{
              width: '100%',
              paddingBottom: '90%',
              position: 'relative',
              marginBottom: '10px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#fefefe'
            }}>
              <img 
                src={product.image_url || '/placeholder-product.jpg'} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '18px',
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
                      fontSize: '12px',
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
                  fontSize: '12px',
                  fontWeight: '600',
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

  if (loading) {
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
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fusion-fullwidth fullwidth-box fusion-builder-row-9 fusion-flex-container has-pattern-background has-mask-background hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
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
              {products.map(renderProductCard)}
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
              {secondRowProducts.map(renderProductCard)}
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
                    Velo Products
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
              {veloProducts.map(renderProductCard)}
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
                    Zyn Products
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
              {zynProducts.map(renderProductCard)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onLoginSuccess={(user) => {
          console.log('User logged in from product section:', user);
        }}
      />

      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        product={selectedProduct}
        userId={user?.id || ''}
        onAlertCreated={() => {
          // Refresh price alerts
          if (user) {
            loadUserData();
          }
        }}
      />
    </div>
  );
};

export default ProductSection;
