'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface USCategory {
  id: string;
  name: string;
  brandImage: string;
  subcategories: {
    name: string;
    items: {
      title: string;
      image_url: string;
    }[];
    count: number;
  }[];
}

const USMegaMenu = () => {
  const [categories, setCategories] = useState<USCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    console.log('USMegaMenu useEffect triggered');
    const fetchUSBrands = async () => {
      console.log('Starting to fetch US brands...');
      try {
        // Get all US brands
        const { data: brands, error: brandsError } = await supabase()
          .from('us_products')
          .select('brand')
          .not('brand', 'is', null);

        if (brandsError) {
          console.error('Error fetching US brands:', brandsError);
          return;
        }
        
        console.log('Fetched brands:', brands);

        // Get unique brands
        const uniqueBrands = Array.from(new Set(brands.map((b: any) => b.brand))).filter((b: any) => b && b !== 'UNKNOWN') as string[];
        console.log('Unique brands:', uniqueBrands);

        // For each brand, get products and group by flavor
        const brandCategories: USCategory[] = [];

        for (const brand of uniqueBrands.slice(0, 8)) { // Limit to 8 brands for performance
          const { data: products, error: productsError } = await supabase()
            .from('us_products')
            .select('product_title, flavour, image_url')
            .eq('brand', brand as string)
            .limit(20);

          if (productsError) {
            console.error(`Error fetching products for ${brand}:`, productsError);
            continue;
          }
          
          console.log(`Products for ${brand}:`, products);

          // Group products by flavor
          const flavorGroups: { [key: string]: { title: string; image_url: string }[] } = {};
          products.forEach((product: any) => {
            const flavor = product.flavour || 'Original';
            if (!flavorGroups[flavor]) {
              flavorGroups[flavor] = [];
            }
            flavorGroups[flavor].push({
              title: product.product_title,
              image_url: product.image_url || '/placeholder-product.png'
            });
          });

          // Create subcategories
          const subcategories = Object.entries(flavorGroups).map(([flavor, items]) => ({
            name: flavor,
            items: items.slice(0, 5), // Limit to 5 items per flavor
            count: items.length
          }));

          // Get brand image from first product with valid image_url
          const firstProductWithImage = products.find((p: any) => p.image_url && p.image_url.trim() !== '');
          const brandImage = firstProductWithImage?.image_url || null;
          
          console.log(`Brand: ${brand}, Products found: ${products.length}, Brand image: ${brandImage}`);

          brandCategories.push({
            id: brand.toLowerCase(),
            name: brand,
            brandImage: brandImage,
            subcategories: subcategories.slice(0, 4) // Limit to 4 subcategories per brand
          });
        }

        console.log('Setting categories:', brandCategories);
        setCategories(brandCategories);
      } catch (error) {
        console.error('Error fetching US brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUSBrands();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    console.log('Clicking category:', categoryId);
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const activeCategoryData = activeCategory ? categories.find(cat => cat.id === activeCategory) : undefined;

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .mega-menu-dropdown {
            top: 60px !important;
            height: calc(100vh - 60px) !important;
            padding: 15px !important;
          }
          .mega-menu-container {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .mega-menu-sidebar {
            width: 100% !important;
            flex-shrink: 1 !important;
          }
          .mega-menu-content {
            width: 100% !important;
            flex: 1 !important;
          }
          .mega-menu-categories {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .mega-menu-category-button {
            padding: 8px 12px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
          }
          .mega-menu-subcategories {
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 20px !important;
          }
          .mega-menu-subcategory > div {
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .mega-menu-dropdown {
            padding: 10px !important;
          }
          .mega-menu-categories {
            grid-template-columns: repeat(1, 1fr) !important;
          }
          .mega-menu-category-button {
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
      <div className="relative">
      {/* All Brands Button */}
      <button
        className="mega-menu-button"
        onClick={() => {
          console.log('Button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontWeight: '600',
          color: '#1f2544',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        All brands
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className="mega-menu-dropdown"
          style={{
            position: 'fixed',
            top: '56px',
            left: '0',
            width: '100vw',
            height: 'calc(100vh - 56px)',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div className="mega-menu-container" style={{ display: 'flex', gap: '32px' }}>
            {/* Left Sidebar - Categories */}
            <div className="mega-menu-sidebar" style={{ width: '280px', flexShrink: 0 }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: 'none'
              }}>
                Brands
              </h3>
              <nav className="mega-menu-categories" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      backgroundColor: activeCategory === category.id ? '#dbeafe' : 'transparent',
                      border: activeCategory === category.id ? '2px solid #3b82f6' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      width: '100%',
                      position: 'relative',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      border: '2px solid #e5e7eb'
                    }}>
                      {category.brandImage && category.brandImage !== null && category.brandImage.trim() !== '' ? (
                        <Image
                          src={category.brandImage}
                          alt={category.name}
                          fill
                          style={{
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Link 
                        href={`/us/brand/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: activeCategory === category.id ? '#1e40af' : '#374151',
                          marginBottom: '2px',
                          textDecoration: 'none'
                        }}
                      >
                        {category.name}
                      </Link>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {category.subcategories.reduce((total, sub) => total + sub.count, 0)} products
                      </span>
                    </div>
                    {activeCategory === category.id && (
                      <div style={{
                        position: 'absolute',
                        right: '12px',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                ))}
                {/* Show more brands link */}
                <Link
                  href="/us/brands"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    marginTop: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: '#1e40af',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>Show all brands</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </nav>
            </div>

            {/* Right Content - Subcategories */}
            <div className="mega-menu-content" style={{ flex: 1 }}>
              {activeCategoryData ? (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {activeCategoryData.name} Products
                    </h2>
                  </div>
                  
                        <div className="mega-menu-subcategories" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                          {activeCategoryData.subcategories.map((subcategory, index) => (
                            <div key={index} className="mega-menu-subcategory" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{
                                aspectRatio: '1',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '12px',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                {subcategory.items[0]?.image_url && subcategory.items[0].image_url.trim() !== '' ? (
                                  <Image
                                    src={subcategory.items[0].image_url}
                                    alt={subcategory.name}
                                    fill
                                    style={{
                                      objectFit: 'cover',
                                      borderRadius: '8px'
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#e5e7eb',
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderRadius: '8px'
                                  }}>
                                    {subcategory.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1f2937',
                                textAlign: 'left'
                              }}>
                                {subcategory.name}
                              </h3>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '8px'
                              }}>
                                No products available
                              </div>
                              <Link
                                href={`/us?brand=${activeCategoryData.name}&flavor=${subcategory.name}`}
                                style={{
                                  fontSize: '12px',
                                  color: '#3b82f6',
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                  transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#1e40af';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#3b82f6';
                                }}
                              >
                                Show all ({subcategory.count})
                              </Link>
                            </div>
                          ))}
                        </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
                  <p style={{ color: '#6b7280' }}>Select a brand to view products</p>
                </div>
              )}
            </div>
          </div>
          
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Link
              href="/us"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              View All US Products →
            </Link>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default USMegaMenu;
