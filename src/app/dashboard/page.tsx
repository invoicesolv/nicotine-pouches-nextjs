'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Heart, Bell, Settings, LogOut, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import DashboardAlertCard from '@/components/DashboardAlertCard';
import LoginModal from '@/components/LoginModal';
import PriceAlertModal from '@/components/PriceAlertModal';

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

interface PriceAlert {
  id: number;
  product_id: number;
  alert_type: string;
  min_price_reduction?: number;
  target_price?: number;
  pack_size?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  products?: Product;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'favourites' | 'alerts'>('favourites');
  const [favourites, setFavourites] = useState<Product[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [priceAlertsSet, setPriceAlertsSet] = useState<Set<number>>(new Set());
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(new Set());
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user);
    console.log('Dashboard useEffect - authLoading:', authLoading);
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Handle URL parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'alerts') {
      setActiveTab('alerts');
    }
  }, []);

  const loadUserData = async () => {
    if (!user) {
      console.log('No user found, skipping data load');
      setLoading(false);
      return;
    }

    console.log('Loading user data for user:', user.id);
    console.log('User email:', user.email);

    try {
      // Load favourites
      console.log('Fetching wishlist data...');
      const { data: wishlistData, error: wishlistError } = await supabase()
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        console.error('Wishlist error details:', JSON.stringify(wishlistError, null, 2));
        setFavourites([]);
      } else {
        console.log('Wishlist data:', wishlistData);
        if (wishlistData && wishlistData.length > 0) {
          // Fetch product details for each wishlist item
          const productIds = wishlistData.map((item: any) => item.product_id);
          const { data: productsWithStoreCount, error: productsError } = await supabase()
            .from('wp_products')
            .select('*')
            .in('id', productIds);
          
          if (productsError) {
            console.error('Error fetching products for wishlist:', productsError);
            setFavourites([]);
          } else {
            console.log('Products for wishlist:', productsWithStoreCount);
            // Process products to add store count (random for now)
            const processedProducts = (productsWithStoreCount || []).map((product: any) => ({
              ...product,
              store_count: Math.floor(Math.random() * 5) + 1, // Random store count
              price: product.price ? `£${parseFloat(product.price).toFixed(2)}` : `£${(2.99 + Math.random() * 2).toFixed(2)}`,
              brand: product.name.split(' ')[0],
              flavour: product.name.split(' ').slice(1).join(' '),
              strength_group: 'Normal',
              format: 'Slim'
            }));
            setFavourites(processedProducts as Product[]);
          }
        } else {
          console.log('No wishlist items found for user');
          setFavourites([]);
        }
      }

      // Load price alerts
      console.log('Fetching price alerts data...');
      const { data: alertsData, error: alertsError } = await supabase()
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (alertsError) {
        console.error('Error fetching price alerts:', alertsError);
        console.error('Price alerts error details:', JSON.stringify(alertsError, null, 2));
        setPriceAlerts([]);
        setPriceAlertsSet(new Set());
      } else {
        console.log('Price alerts data:', alertsData);
        if (alertsData && alertsData.length > 0) {
          // Fetch product details for each price alert
          const productIds = alertsData.map((alert: any) => alert.product_id);
          const { data: productsWithStoreCount, error: productsError } = await supabase()
            .from('wp_products')
            .select('*')
            .in('id', productIds);
          
          if (productsError) {
            console.error('Error fetching products for price alerts:', productsError);
            setPriceAlerts([]);
            setPriceAlertsSet(new Set());
          } else {
            console.log('Products for price alerts:', productsWithStoreCount);
            // Process products to add store count (random for now)
            const processedProducts = (productsWithStoreCount || []).map((product: any) => ({
              ...product,
              store_count: Math.floor(Math.random() * 5) + 1, // Random store count
              price: product.price ? `£${parseFloat(product.price).toFixed(2)}` : `£${(2.99 + Math.random() * 2).toFixed(2)}`,
              brand: product.name.split(' ')[0],
              flavour: product.name.split(' ').slice(1).join(' '),
              strength_group: 'Normal',
              format: 'Slim'
            }));
            // Combine alerts with their products
            const alertsWithProducts = alertsData.map((alert: any) => ({
              ...alert,
              products: processedProducts?.find((p: any) => p.id === alert.product_id)
            }));
            setPriceAlerts(alertsWithProducts as PriceAlert[]);
            setPriceAlertsSet(new Set(alertsData.map((alert: any) => alert.product_id)));
          }
        } else {
          console.log('No price alerts found for user');
          setPriceAlerts([]);
          setPriceAlertsSet(new Set());
        }
      }

      // Load price alerts set for product cards (reuse data from above)
      if (alertsData && alertsData.length > 0) {
        setPriceAlertsSet(new Set(alertsData.map((alert: any) => alert.product_id)));
      } else {
        setPriceAlertsSet(new Set());
      }

      // Load wishlist set for product cards (reuse data from above)
      if (wishlistData && wishlistData.length > 0) {
        setWishlistSet(new Set(wishlistData.map((item: any) => item.product_id)));
      } else {
        setWishlistSet(new Set());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavourites = async (productId: number) => {
    if (!user) return;

    try {
      await supabase()
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      setFavourites(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error removing from favourites:', error);
    }
  };

  const removePriceAlert = async (alertId: number) => {
    if (!user) return;

    try {
      await supabase()
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error removing price alert:', error);
    }
  };


  // Handler functions for product cards
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handlePriceAlertClick = (productId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    
    const product = [...favourites, ...priceAlerts.map(alert => alert.products).filter(Boolean)] as Product[];
    const foundProduct = product.find(p => p.id === productId);
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      setPriceAlertModalOpen(true);
    }
  };

  const handleHeartClick = (productId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    
    setActivePopup(activePopup === productId ? null : productId);
  };

  const handlePriceAlertFromHeart = (productId: number) => {
    const product = [...favourites, ...priceAlerts.map(alert => alert.products).filter(Boolean)] as Product[];
    const foundProduct = product.find(p => p.id === productId);
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      setPriceAlertModalOpen(true);
    }
    setActivePopup(null);
  };

  const handleAddToListFromHeart = async (productId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    
    try {
      const isInWishlist = wishlistSet.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist
        await supabase()
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        setWishlistSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        
        // Also remove from favourites list
        setFavourites(prev => prev.filter(p => p.id !== productId));
      } else {
        // Add to wishlist
        await supabase()
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString()
          });
        
        setWishlistSet(prev => new Set([...Array.from(prev), productId]));
        
        // Also add to favourites list if not already there
        const product = [...favourites, ...priceAlerts.map(alert => alert.products).filter(Boolean)] as Product[];
        const foundProduct = product.find(p => p.id === productId);
        if (foundProduct && !favourites.find(p => p.id === productId)) {
          setFavourites(prev => [...prev, foundProduct]);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    
    setActivePopup(null);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopup !== null) {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access your dashboard.</p>
          <Link 
            href="/"
            className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: 'favourites' | 'alerts') => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (tab === 'alerts') {
      url.searchParams.set('tab', 'alerts');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const sidebarLinks = [
    {
      label: "My Favourites",
      href: "#",
      icon: <Heart className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      onClick: () => handleTabChange('favourites'),
    },
    {
      label: "Price Alerts", 
      href: "#",
      icon: <Bell className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      onClick: () => handleTabChange('alerts'),
    },
    {
      label: "Products",
      href: "/",
      icon: <Package className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <LogOut className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      onClick: signOut,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <Link
              href="/"
              className="font-normal flex items-center text-sm text-black py-1 relative z-20"
            >
              {sidebarOpen ? (
                <img
                  src="/product-images/us/logo-1.png"
                  alt="Nicotine Pouches Logo"
                  className="h-8 w-auto"
                  style={{ maxHeight: '32px' }}
                />
              ) : (
                <img
                  src="/favicon.ico"
                  alt="Nicotine Pouches"
                  className="h-7 w-7"
                />
              )}
            </Link>

            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link}
                />
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div>
            <SidebarLink
              link={{
                label: user?.user_metadata?.name || user?.email || "User",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-pink-200 flex items-center justify-center">
                    <span className="text-gray-800 font-bold text-sm">
                      {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className={`min-h-screen bg-white pt-10 md:pt-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[70px]'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeTab === 'favourites' ? 'My favourites' : 'Price Alerts'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'favourites' 
                  ? `${favourites.length} saved products`
                  : `${priceAlerts.length} active alerts`
                }
              </p>
            </div>
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 underline text-sm"
            >
              Go to your list
            </Link>
          </div>

          {/* Favourites Content */}
          {activeTab === 'favourites' && (
            <div>
              {favourites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favourites yet</h3>
                  <p className="text-gray-500 mb-6">Start adding products to your favourites to see them here.</p>
                  <Link 
                    href="/"
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${sidebarOpen ? 'xl:grid-cols-5' : 'xl:grid-cols-6 2xl:grid-cols-7'}`}>
                  {favourites.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priceAlerts={priceAlertsSet}
                      wishlist={wishlistSet}
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
              )}
              
              {/* Create New List Button */}
              <div className="mt-8 flex justify-end">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  + Create new list
                </button>
              </div>
            </div>
          )}

          {/* Price Alerts Content */}
          {activeTab === 'alerts' && (
            <div>
              {priceAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.5 19.5a3 3 0 01-3-3V5a3 3 0 013-3h9a3 3 0 013 3v11.5a3 3 0 01-3 3h-9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No price alerts yet</h3>
                  <p className="text-gray-500 mb-6">Set up price alerts to get notified when prices drop.</p>
                  <Link 
                    href="/"
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${sidebarOpen ? 'xl:grid-cols-5' : 'xl:grid-cols-6 2xl:grid-cols-7'}`}>
                  {priceAlerts.map((alert) => (
                    <DashboardAlertCard
                      key={alert.id}
                      alert={alert}
                      onRemove={removePriceAlert}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onLoginSuccess={(user) => {
          console.log('User logged in from dashboard:', user);
          loadUserData();
        }}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        product={selectedProduct}
        userId={user?.id || ''}
        onAlertCreated={() => {
          if (user) {
            loadUserData();
          }
        }}
      />
    </div>
  );
}
