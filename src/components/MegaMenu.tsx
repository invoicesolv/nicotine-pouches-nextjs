'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
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

// Old hardcoded function removed - now using database images

// Categories will be populated dynamically from database
const categories: Category[] = [
  {
    id: 'velo',
    name: 'Velo',
    brandImage: '/uploads/products/product_68865_velo_crispy_peppermint.jpg',
    subcategories: [
      {
        name: 'Velo Freeze',
        items: [
          { title: 'Velo Freezing Peppermint', image_url: '/uploads/products/product_68872_velo_freezing_peppermint.jpg' }
        ],
        count: 12
      },
      {
        name: 'Velo Ice',
        items: [
          { title: 'Velo Icy Berries', image_url: '/uploads/products/product_68882_velo_icy_berries.jpg' }
        ],
        count: 8
      },
      {
        name: 'Velo Urban',
        items: [
          { title: 'Velo Arctic Grapefruit', image_url: '/uploads/products/product_68847_velo_arctic_grapefruit.jpg' }
        ],
        count: 6
      },
      {
        name: 'Velo Max',
        items: [
          { title: 'Velo Bright Spearmint', image_url: '/uploads/products/product_68858_velo_bright_spearmint.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'zyn',
    name: 'ZYN',
    brandImage: '/uploads/products/product_69258_zyn_cool_mint.jpg',
    subcategories: [
      {
        name: 'ZYN Mint',
        items: [
          { title: 'ZYN Cool Mint', image_url: '/uploads/products/product_69258_zyn_cool_mint.jpg' }
        ],
        count: 12
      },
      {
        name: 'ZYN Citrus',
        items: [
          { title: 'ZYN Apple Mint', image_url: '/uploads/products/product_69229_zyn_apple_mint.jpg' }
        ],
        count: 8
      },
      {
        name: 'ZYN Berry',
        items: [
          { title: 'ZYN Black Cherry', image_url: '/uploads/products/product_69236_zyn_black_cherry.jpg' }
        ],
        count: 6
      },
      {
        name: 'ZYN Cool',
        items: [
          { title: 'ZYN Cool Blueberry', image_url: '/uploads/products/product_69250_zyn_cool_blueberry.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'helwit',
    name: 'Helwit',
    brandImage: '/uploads/products/product_67541_helwit_lingonberry.jpg',
    subcategories: [
      {
        name: 'Helwit Original',
        items: [
          { title: 'Helwit Lingonberry', image_url: '/uploads/products/product_67541_helwit_lingonberry.jpg' }
        ],
        count: 10
      },
      {
        name: 'Helwit Fruit',
        items: [
          { title: 'Helwit Blueberry', image_url: '/uploads/products/product_67525_helwit_blueberry.jpg' }
        ],
        count: 8
      },
      {
        name: 'Helwit Berry',
        items: [
          { title: 'Helwit Cherry', image_url: '/uploads/products/product_67528_helwit_cherry.jpg' }
        ],
        count: 6
      },
      {
        name: 'Helwit Fresh',
        items: [
          { title: 'Helwit Banana', image_url: '/uploads/products/product_67518_helwit_banana.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'apres',
    name: 'Apres',
    brandImage: '/uploads/products/product_67026_apres_mint.jpg',
    subcategories: [
      {
        name: 'Apres Mint',
        items: [
          { title: 'Apres Mint', image_url: '/uploads/products/product_67026_apres_mint.jpg' }
        ],
        count: 8
      },
      {
        name: 'Apres Fresh',
        items: [
          { title: 'Apres Cactus Lime', image_url: '/uploads/products/product_67009_apres_cactus_lime.jpg' }
        ],
        count: 6
      },
      {
        name: 'Apres Cola',
        items: [
          { title: 'Apres Cola', image_url: '/uploads/products/product_67016_apres_cola.jpg' }
        ],
        count: 5
      },
      {
        name: 'Apres Citrus',
        items: [
          { title: 'Apres Tangerine', image_url: '/uploads/products/product_67033_apres_tangerine.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'on',
    name: 'On!',
    brandImage: '/uploads/products/product_68434_on_mint.jpg',
    subcategories: [
      {
        name: 'On! Mint',
        items: [
          { title: 'On! Mint', image_url: '/uploads/products/product_68434_on_mint.jpg' }
        ],
        count: 10
      },
      {
        name: 'On! Citrus',
        items: [
          { title: 'On! Citrus', image_url: '/uploads/products/product_68412_on_citrus.jpg' }
        ],
        count: 8
      },
      {
        name: 'On! Berry',
        items: [
          { title: 'On! Berry', image_url: '/uploads/products/product_68416_on_berry.jpg' }
        ],
        count: 6
      },
      {
        name: 'On! Coffee',
        items: [
          { title: 'On! Coffee', image_url: '/uploads/products/product_68420_on_coffee.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'lyft',
    name: 'Lyft',
    brandImage: '/uploads/products/product_68163_lyft_citrus_mint.jpg',
    subcategories: [
      {
        name: 'Lyft Mint',
        items: [
          { title: 'Lyft Citrus Mint', image_url: '/uploads/products/product_68163_lyft_citrus_mint.jpg' }
        ],
        count: 10
      },
      {
        name: 'Lyft Berry',
        items: [
          { title: 'Lyft Black Currant', image_url: '/uploads/products/product_68160_lyft_black_currant.jpg' }
        ],
        count: 8
      },
      {
        name: 'Lyft Cool',
        items: [
          { title: 'Lyft Cool Eucalyptus', image_url: '/uploads/products/product_68170_lyft_cool_eucalyptus.jpg' }
        ],
        count: 6
      },
      {
        name: 'Lyft Fresh',
        items: [
          { title: 'Lyft Cucumber Mint', image_url: '/uploads/products/product_68173_lyft_cucumber_mint.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'loop',
    name: 'Loop',
    brandImage: '/uploads/products/product_68094_loop_creamy_cappuccino.jpg',
    subcategories: [
      {
        name: 'Loop Original',
        items: [
          { title: 'Loop Creamy Cappuccino', image_url: '/uploads/products/product_68094_loop_creamy_cappuccino.jpg' }
        ],
        count: 8
      },
      {
        name: 'Loop Hot',
        items: [
          { title: 'Loop Hot Mango', image_url: '/uploads/products/product_68105_loop_hot_mango.jpg' }
        ],
        count: 6
      },
      {
        name: 'Loop Fruit',
        items: [
          { title: 'Loop Hot Peach', image_url: '/uploads/products/product_68108_loop_hot_peach.jpg' }
        ],
        count: 5
      },
      {
        name: 'Loop Spicy',
        items: [
          { title: 'Loop Jalapeno Lime', image_url: '/uploads/products/product_68122_loop_jalapeno_lime.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'ace',
    name: 'Ace',
    brandImage: '/uploads/products/product_66960_ace_cool_mint.jpg',
    subcategories: [
      {
        name: 'Ace Mint',
        items: [
          { title: 'Ace Cool Mint', image_url: '/uploads/products/product_66960_ace_cool_mint.jpg' }
        ],
        count: 10
      },
      {
        name: 'Ace Berry',
        items: [
          { title: 'Ace Berry Breeze', image_url: '/uploads/products/product_66956_ace_berry_breeze.jpg' }
        ],
        count: 8
      },
      {
        name: 'Ace Fruit',
        items: [
          { title: 'Ace Red Apple Cinnamon', image_url: '/uploads/products/product_66989_ace_red_apple_cinnamon.jpg' }
        ],
        count: 6
      },
      {
        name: 'Ace Strong',
        items: [
          { title: 'Ace X Black Raspberry Chilli', image_url: '/uploads/products/product_66996_ace_x_black_raspberry_chilli.jpg' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'elf',
    name: 'ELF',
    brandImage: '/uploads/products/product_67324_elf_cool_storm.jpg',
    subcategories: [
      {
        name: 'ELF Cool',
        items: [
          { title: 'ELF Cool Storm', image_url: '/uploads/products/product_67324_elf_cool_storm.jpg' }
        ],
        count: 8
      },
      {
        name: 'ELF Berry',
        items: [
          { title: 'ELF Blueberry Raspberry', image_url: '/uploads/products/product_67320_elf_blueberry_raspberry.jpg' }
        ],
        count: 6
      },
      {
        name: 'ELF Citrus',
        items: [
          { title: 'ELF Fantasy Orange', image_url: '/uploads/products/product_67328_elf_fantasy_orange.jpg' }
        ],
        count: 5
      },
      {
        name: 'ELF Fruit',
        items: [
          { title: 'ELF Grape Ice', image_url: '/uploads/products/product_67332_elf_grape_ice.jpg' }
        ],
        count: 4
      }
    ]
  }
];

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});
  const [productData, setProductData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { getLocalizedPath } = useLanguage();

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch product data from database
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data: products, error } = await supabase()
          .from('wp_products')
          .select('name, image_url')
          .not('image_url', 'is', null)
          .limit(200);

        if (error) {
          console.error('Error fetching product data:', error);
          return;
        }

        if (products) {
          const imageMap: { [key: string]: string } = {};
          const productMap: { [key: string]: any } = {};
          
          products.forEach((product: any) => {
            // Extract brand from product name (first word)
            const brand = product.name.split(' ')[0].toLowerCase();
            
            // Create a key for each brand and product name
            const key = `${brand}-${product.name}`;
            imageMap[key] = product.image_url;
            productMap[key] = product;
            
            // Also create a mapping for brand only (for fallback)
            if (!imageMap[brand]) {
              imageMap[brand] = product.image_url;
            }
          });
          
          setProductImages(imageMap);
          setProductData(productMap);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, []);

  const getProductImageFromDB = (brandId: string, subcategoryName: string): string => {
    // First try exact brand-subcategory match
    const searchKey = `${brandId}-${subcategoryName}`;
    if (productImages[searchKey]) {
      return productImages[searchKey];
    }
    
    // Fallback to any product from this brand
    if (productImages[brandId]) {
      return productImages[brandId];
    }
    
    // Use images from productData if available, otherwise use placeholder
    const brandProducts = Object.values(productData).filter(p =>
      p.name.toLowerCase().startsWith(brandId.toLowerCase())
    );

    if (brandProducts.length > 0 && brandProducts[0].image_url) {
      return brandProducts[0].image_url;
    }

    // Return a placeholder - no external URLs
    return '/placeholder-product.svg';
  };

  // Get real products for a brand from database
  const getRealProductsForBrand = (brandName: string) => {
    // Check if we have product data loaded
    if (Object.keys(productData).length === 0) {
      console.log('No product data loaded yet for brand:', brandName);
      return [];
    }
    
    console.log('Searching for brand:', brandName);
    console.log('Available brands in productData:', Array.from(new Set(Object.values(productData).map(p => p.name.split(' ')[0].toLowerCase()))));
    
    const products = Object.values(productData).filter(product => {
      // Extract brand from product name (first word)
      const dbBrand = product.name.split(' ')[0].toLowerCase().trim();
      const searchBrand = brandName.toLowerCase().trim();
      
      // Direct match
      return dbBrand === searchBrand;
    }).slice(0, 10); // Limit to 10 products per brand
    
    console.log(`Found ${products.length} products for brand ${brandName}:`, products.map(p => p.name));
    
    return products;
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="relative">
      {/* All Brands Button */}
      <button
        className="mega-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          color: '#1f2544',
          fontSize: '16px',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          fontWeight: '600',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
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
          className="mega-menu-dropdown fixed bg-white shadow-lg"
          onMouseLeave={() => setIsOpen(false)}
          style={{
            top: '56px',
            left: '0',
            width: '100vw',
            height: 'calc(100vh - 56px)',
            zIndex: 9999,
            overflowY: 'auto'
          }}
        >
          <div className="w-full px-6 py-3">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsOpen(false)}
                className="mega-menu-close text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mega-menu-container flex gap-8">
              {/* Left Sidebar - Brands */}
              <div className="mega-menu-sidebar w-64 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brands</h3>
                <nav className="mega-menu-categories space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/brand/${category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      onMouseEnter={() => setActiveCategory(category.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        backgroundColor: activeCategory === category.id ? '#f8fafc' : 'transparent',
                        borderColor: activeCategory === category.id ? '#e2e8f0' : 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        transform: activeCategory === category.id ? 'translateX(4px)' : 'translateX(0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
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
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {category.brandImage && category.brandImage.trim() !== '' ? (
                          <img
                            src={category.brandImage}
                            alt={category.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
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
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: activeCategory === category.id ? '#1e40af' : '#374151',
                            marginBottom: '2px'
                          }}
                        >
                          {category.name}
                        </span>
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
                    </Link>
                  ))}
                  {/* Show more brands link */}
                  <Link
                    href="/brands"
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
              <div className="mega-menu-content flex-1">
                {activeCategoryData ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeCategoryData.name}
                      </h2>
                    </div>
                    
                    <div className="mega-menu-subcategories grid grid-cols-4 gap-6">
                      {activeCategoryData.subcategories.map((subcategory, index) => (
                        <div key={index} className="mega-menu-subcategory space-y-3">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                            {subcategory.items[0]?.image_url && subcategory.items[0].image_url.trim() !== '' ? (
                              <img 
                                src={subcategory.items[0].image_url}
                                alt={subcategory.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg">
                                {subcategory.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <h3 className="mega-menu-subcategory-title font-semibold text-gray-900 text-sm">
                            {subcategory.name}
                          </h3>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            No products available
                          </div>
                          
                          <Link
                            href={getLocalizedPath(`/brand/${activeCategoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)}
                            className="inline-block text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            Show all ({subcategory.count})
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Select a category to view subcategories</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .mega-menu-button {
              display: none !important;
            }
            .mega-menu-dropdown {
              top: 56px !important;
              height: calc(100vh - 56px) !important;
              padding: 15px !important;
            }
            .mega-menu-close {
              font-size: 18px !important;
              margin-bottom: 15px !important;
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
              margin-bottom: 20px !important;
            }
            .mega-menu-category-button {
              padding: 10px 12px !important;
              font-size: 14px !important;
              text-align: center !important;
              flex-direction: column !important;
              gap: 4px !important;
            }
            .mega-menu-category-icon {
              font-size: 20px !important;
            }
            .mega-menu-category-name {
              font-size: 12px !important;
              font-weight: 500 !important;
            }
            .mega-menu-subcategories {
              grid-template-columns: repeat(1, 1fr) !important;
              gap: 20px !important;
            }
            .mega-menu-subcategory {
              margin-bottom: 15px !important;
            }
            .mega-menu-subcategory-title {
              font-size: 16px !important;
              margin-bottom: 8px !important;
            }
            .mega-menu-products {
              display: grid !important;
              grid-template-columns: repeat(1, 1fr) !important;
              gap: 8px !important;
            }
            .mega-menu-product-item {
              font-size: 13px !important;
              padding: 6px 0 !important;
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
              padding: 12px !important;
              font-size: 13px !important;
            }
            .mega-menu-subcategory-title {
              font-size: 14px !important;
            }
            .mega-menu-product-item {
              font-size: 12px !important;
            }
          }
        `
      }} />
    </div>
  );
}
