'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PriceAlertModal from './PriceAlertModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchAndCachePrices, priceCache, warmPriceCache } from '@/lib/price-cache';

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
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<Set<number>>(new Set());
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPrices, setProductPrices] = useState<Map<number, string>>(new Map());
  const [watchingCounts, setWatchingCounts] = useState<Map<number, number>>(new Map());
  const [watchingCache, setWatchingCache] = useState<Map<number, number>>(new Map());
  const { user, triggerLoginModal } = useAuth();
  const { getLocalizedPath, isUSRoute } = useLanguage();


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
    const fetchProducts = async () => {
      try {
        // Use wp_products table for WordPress products with images
        const { data: wpProducts, error: wpError } = await supabase()
          .from('wp_products')
          .select('*')
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false });

        if (wpError) throw wpError;

        // Fetch vendor product mappings to calculate real store counts
        const { data: mappings, error: mappingsError } = await supabase()
          .from('vendor_product_mapping')
          .select('product_id');

        if (mappingsError) throw mappingsError;

        // Count stores per product
        const storeCounts = new Map<number, number>();
        mappings?.forEach((mapping: any) => {
          const count = storeCounts.get(mapping.product_id) || 0;
          storeCounts.set(mapping.product_id, count + 1);
        });

        // Process WordPress products to match expected format
        const processedProducts = (wpProducts || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.name.split(' ')[0], // Extract brand from name
          flavour: product.name.split(' ').slice(1).join(' '), // Rest is flavour
          strength_group: 'Normal', // Default strength
          format: 'Slim', // Default format
          image_url: product.image_url,
          description: product.content,
          store_count: storeCounts.get(product.id) || 0, // Real store count from mappings
          created_at: product.created_at
        }));

        // Sort by store count (highest first) for most popular products
        const sortedProducts = processedProducts.sort((a: any, b: any) => 
          (b.store_count || 0) - (a.store_count || 0)
        );

        // Take first 20 products (10 for each row)
        const firstRow = sortedProducts.slice(0, 10);
        const secondRow = sortedProducts.slice(10, 20);

        // Filter Velo products
        const veloProducts = sortedProducts.filter((product: any) => 
          product.name.toLowerCase().includes('velo')
        ).slice(0, 10);

        // Filter Zyn products
        const zynProducts = sortedProducts.filter((product: any) => 
          product.name.toLowerCase().includes('zyn')
        ).slice(0, 10);


        // Set products immediately for faster display
        setProducts(firstRow);
        setSecondRowProducts(secondRow);
        setVeloProducts(veloProducts);
        setZynProducts(zynProducts);
        setProductsLoaded(true);
        setLoading(false); // Stop loading immediately when products are set
        
        // Load prices and watching counts in parallel (non-blocking)
        const allProducts = [...firstRow, ...secondRow, ...veloProducts, ...zynProducts];
        const productIds = allProducts.map(p => p.id);
        
        // Warm cache for popular products in background
        warmPriceCache(productIds.slice(0, 10), isUSRoute, supabase);
        
        // Log cache statistics for debugging
        const stats = priceCache.getStats();
        console.log('Price cache stats:', stats);
        
        // Fetch prices and watching counts in parallel
        Promise.all([
          fetchAndCachePrices(productIds, isUSRoute, supabase),
          fetchWatchingCounts(productIds)
        ]).then(([priceMap]) => {
          setProductPrices(priceMap);
          setPricesLoaded(true);
        }).catch(error => {
          console.error('Error fetching prices or watching counts:', error);
          setPricesLoaded(true); // Still show products even if prices fail
        });
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false); // Stop loading on error too
      }
    };

    fetchProducts();
  }, [isUSRoute]);


  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };


  // Generate price from wp_products table
  const generatePrice = async (productId: number) => {
    try {
      const currencySymbol = isUSRoute ? '$' : '£';
      
      // Get product price from wp_products table
      const { data: product, error: productError } = await supabase()
        .from('wp_products')
        .select('name, price')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        console.log(`Product ${productId} not found`);
        return `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
      }

      // Use the price from wp_products table, or default price
      const productPrice = parseFloat(product.price) || 0;
      const finalPrice = productPrice > 0 
        ? `${currencySymbol}${productPrice.toFixed(2)}`
        : `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`; // Random price between £2.99-£4.99
      
      return finalPrice;
    } catch (error) {
      console.error('Error fetching product price:', error);
      const currencySymbol = isUSRoute ? '$' : '£';
      return `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
    }
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

  // Fetch real watching counts from database with caching
  const fetchWatchingCounts = async (productIds: number[]) => {
    try {
      const watchingMap = new Map<number, number>();
      const uncachedIds: number[] = [];
      
      // Check cache first
      productIds.forEach(productId => {
        if (watchingCache.has(productId)) {
          watchingMap.set(productId, watchingCache.get(productId)!);
        } else {
          uncachedIds.push(productId);
        }
      });

      // If all watching counts are cached, return immediately
      if (uncachedIds.length === 0) {
        setWatchingCounts(watchingMap);
        return;
      }

      // Get wishlist counts for uncached products only
      const { data: wishlistData, error: wishlistError } = await supabase()
        .from('wishlist')
        .select('product_id')
        .in('product_id', uncachedIds);

      // Get price alert counts for uncached products only
      const { data: alertData, error: alertError } = await supabase()
        .from('price_alerts')
        .select('product_id')
        .in('product_id', uncachedIds);

      if (wishlistError || alertError) {
        console.error('Error fetching watching data:', wishlistError || alertError);
        return;
      }

      // Count occurrences for each uncached product
      const wishlistCounts = new Map<number, number>();
      const alertCounts = new Map<number, number>();

      wishlistData?.forEach((item: any) => {
        wishlistCounts.set(item.product_id, (wishlistCounts.get(item.product_id) || 0) + 1);
      });

      alertData?.forEach((item: any) => {
        alertCounts.set(item.product_id, (alertCounts.get(item.product_id) || 0) + 1);
      });

      // Process uncached products only
      const newCacheEntries = new Map<number, number>();
      uncachedIds.forEach(productId => {
        const wishlistCount = wishlistCounts.get(productId) || 0;
        const alertCount = alertCounts.get(productId) || 0;
        const baseCount = wishlistCount + alertCount;
        
        // Generate watching count between 400-800, rounded up to nearest hundred
        const generatedWatching = generateWatchingCount(400, 800);
        const totalWatching = baseCount + generatedWatching;
        
        const finalWatching = Math.max(400, totalWatching); // At least 400 watchers
        watchingMap.set(productId, finalWatching);
        newCacheEntries.set(productId, finalWatching);
      });

      // Update cache with new entries
      if (newCacheEntries.size > 0) {
        setWatchingCache(prev => {
          const newCache = new Map(prev);
          newCacheEntries.forEach((value, key) => newCache.set(key, value));
          return newCache;
        });
      }

      setWatchingCounts(watchingMap);
    } catch (error) {
      console.error('Error fetching watching counts:', error);
    }
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
    const price = productPrices.get(product.id) || (pricesLoaded ? `${currencySymbol}2.99` : 'Loading...');
    const stores = getStoreCount(product);
    const watching = watchingCounts.get(product.id) || generateWatchingCount(400, 800); // Fallback to generated watching count
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
                <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={priceAlerts.has(product.id) ? "#3b82f6" : "none"} stroke={priceAlerts.has(product.id) ? "#3b82f6" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: priceAlerts.has(product.id) ? "#3b82f6" : "none", stroke: priceAlerts.has(product.id) ? "#3b82f6" : "#666" }}>
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
                <svg viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill={wishlist.has(product.id) ? "#ef4444" : "none"} stroke={wishlist.has(product.id) ? "#ef4444" : "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: wishlist.has(product.id) ? "#ef4444" : "none", stroke: wishlist.has(product.id) ? "#ef4444" : "#666" }}>
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
              paddingBottom: '108%',
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

  if (loading && !productsLoaded) {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Loading products...
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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

        {/* Third Row Header - Velo */}
        <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '30px', marginTop: '60px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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

        {/* Fourth Row Header - Zyn */}
        <div className="product-section-header fusion-layout-column fusion_builder_column fusion_builder_column_1_1 1_1 fusion-flex-column" 
             style={{ width: '100%', marginBottom: '30px' }}>
          <div className="fusion-column-wrapper">
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row">
              <div className="fusion-layout-column fusion_builder_column_inner fusion_builder_column_inner_1_2 1_2 fusion-flex-column" 
                   style={{ width: '50%' }}>
                <div className="fusion-column-wrapper">
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
      

      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        product={selectedProduct}
        userId={user?.id || ''}
        region="UK"
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

export default ProductSection;
