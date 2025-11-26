'use client';

import { useEffect, useState } from 'react';

interface FilterState {
  brands: string[];
  vendors: string[];
  flavours: string[];
  strengths: string[];
  formats: string[];
  priceRange: { min: number; max: number };
  rating: number;
  onSale: boolean;
}

const FilterHandler = () => {
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    vendors: [],
    flavours: [],
    strengths: [],
    formats: [],
    priceRange: { min: 0, max: 15 },
    rating: 0,
    onSale: false
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add event listeners to all filter inputs
    const initFilters = () => {
      // Brand filters
      const brandCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="brand"]');
      brandCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleBrandChange);
      });

      // Vendor filters
      const vendorCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="vendor"]');
      vendorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleVendorChange);
      });

      // Flavour filters
      const flavourCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="flavour"]');
      flavourCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFlavourChange);
      });

      // Strength filters (radio buttons)
      const strengthRadios = document.querySelectorAll('input[type="radio"][name="strength"]');
      strengthRadios.forEach(radio => {
        radio.addEventListener('change', handleStrengthChange);
      });

      // Format filters
      const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="format"]');
      formatCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFormatChange);
      });

      // Price range inputs
      const priceInputs = document.querySelectorAll('input[type="number"][placeholder*="Min"], input[type="number"][placeholder*="Max"]');
      priceInputs.forEach(input => {
        input.addEventListener('change', handlePriceChange);
      });

      // Price range radio buttons
      const priceRadios = document.querySelectorAll('input[type="radio"][name="price"]');
      priceRadios.forEach(radio => {
        radio.addEventListener('change', handlePriceRangeChange);
      });

      // Rating filters
      const ratingInputs = document.querySelectorAll('input[type="radio"][name*="rating"]');
      ratingInputs.forEach(input => {
        input.addEventListener('change', handleRatingChange);
      });

      // On sale filters
      const saleInputs = document.querySelectorAll('input[type="checkbox"][name*="sale"]');
      saleInputs.forEach(input => {
        input.addEventListener('change', handleSaleChange);
      });

      // Search inputs
      const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Find"]');
      searchInputs.forEach(input => {
        input.addEventListener('input', handleSearchChange);
      });
    };

    const handleBrandChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const brandName = target.value;
      
      setFilters(prev => ({
        ...prev,
        brands: target.checked 
          ? [...prev.brands, brandName]
          : prev.brands.filter(b => b !== brandName)
      }));
    };

    const handleVendorChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const vendorName = target.value;
      
      setFilters(prev => ({
        ...prev,
        vendors: target.checked 
          ? [...prev.vendors, vendorName]
          : prev.vendors.filter(v => v !== vendorName)
      }));
    };

    const handleFlavourChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const flavourName = target.value;
      
      setFilters(prev => ({
        ...prev,
        flavours: target.checked 
          ? [...prev.flavours, flavourName]
          : prev.flavours.filter(f => f !== flavourName)
      }));
    };

    const handleStrengthChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const strengthName = target.value;
      
      setFilters(prev => ({
        ...prev,
        strengths: target.checked ? [strengthName] : []
      }));
    };

    const handleFormatChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const formatName = target.value;
      
      setFilters(prev => ({
        ...prev,
        formats: target.checked 
          ? [...prev.formats, formatName]
          : prev.formats.filter(f => f !== formatName)
      }));
    };

    const handlePriceChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = parseFloat(target.value) || 0;
      
      setFilters(prev => ({
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [target.placeholder?.toLowerCase().includes('min') ? 'min' : 'max']: value
        }
      }));
    };

    const handlePriceRangeChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const range = target.value;
      
      // Parse predefined ranges
      let min = 0, max = 15;
      if (range.includes('Up to £3')) {
        max = 3;
      } else if (range.includes('£3 - £5')) {
        min = 3;
        max = 5;
      } else if (range.includes('£5 - £8')) {
        min = 5;
        max = 8;
      } else if (range.includes('At least £8')) {
        min = 8;
        max = 15;
      }
      
      setFilters(prev => ({
        ...prev,
        priceRange: { min, max }
      }));
    };

    const handleRatingChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const rating = parseInt(target.value) || 0;
      
      setFilters(prev => ({
        ...prev,
        rating
      }));
    };

    const handleSaleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      
      setFilters(prev => ({
        ...prev,
        onSale: target.checked
      }));
    };

    const handleSearchChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      
      // Filter the visible options based on search term
      const container = target.closest('div');
      if (container) {
        const options = container.querySelectorAll('label');
        options.forEach(option => {
          const text = option.textContent?.toLowerCase() || '';
          const shouldShow = text.includes(searchTerm);
          option.style.display = shouldShow ? 'flex' : 'none';
        });
      }
    };

    // Initialize filters after a short delay
    const timer = setTimeout(initFilters, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup event listeners
      const allInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"], input[type="number"], input[type="text"]');
      allInputs.forEach(input => {
        input.removeEventListener('change', handleBrandChange);
        input.removeEventListener('change', handleVendorChange);
        input.removeEventListener('change', handleFlavourChange);
        input.removeEventListener('change', handleStrengthChange);
        input.removeEventListener('change', handleFormatChange);
        input.removeEventListener('change', handlePriceChange);
        input.removeEventListener('change', handlePriceRangeChange);
        input.removeEventListener('change', handleRatingChange);
        input.removeEventListener('change', handleSaleChange);
        input.removeEventListener('input', handleSearchChange);
      });
    };
  }, []);

  // Apply filters to products
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      
      try {
        // Get all product cards
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
          const productElement = card as HTMLElement;
          let shouldShow = true;

          // Get product data from the card
          const productName = productElement.querySelector('.product-title')?.textContent || '';
          const productBrand = productElement.querySelector('.product-brand')?.textContent || '';
          const productPrice = productElement.querySelector('.product-price')?.textContent || '';
          const productStrength = productElement.querySelector('.product-strength-label')?.textContent || '';

          // Brand filter
          if (filters.brands.length > 0) {
            const brandMatch = filters.brands.some(brand => 
              productBrand.toLowerCase().includes(brand.toLowerCase()) ||
              productName.toLowerCase().startsWith(brand.toLowerCase())
            );
            if (!brandMatch) shouldShow = false;
          }

          // Flavour filter
          if (filters.flavours.length > 0) {
            const flavourMatch = filters.flavours.some(flavour => 
              productName.toLowerCase().includes(flavour.toLowerCase())
            );
            if (!flavourMatch) shouldShow = false;
          }

          // Strength filter
          if (filters.strengths.length > 0) {
            const strengthMatch = filters.strengths.some(strength => 
              productStrength.toLowerCase().includes(strength.toLowerCase())
            );
            if (!strengthMatch) shouldShow = false;
          }

          // Price filter
          if (filters.priceRange.min > 0 || filters.priceRange.max < 15) {
            const priceMatch = productPrice.match(/[£$]?(\d+\.?\d*)/);
            if (priceMatch) {
              const price = parseFloat(priceMatch[1]);
              if (price < filters.priceRange.min || price > filters.priceRange.max) {
                shouldShow = false;
              }
            }
          }

          // Show/hide the product card and its container
          if (shouldShow) {
            productElement.style.display = 'block';
            productElement.style.visibility = 'visible';
            productElement.style.height = 'auto';
            productElement.style.margin = '';
            productElement.style.padding = '';
          } else {
            productElement.style.display = 'none';
            productElement.style.visibility = 'hidden';
            productElement.style.height = '0';
            productElement.style.margin = '0';
            productElement.style.padding = '0';
            productElement.style.overflow = 'hidden';
          }
          
          // Also hide the swiper-slide container if the product is hidden
          const swiperSlide = productElement.closest('.swiper-slide');
          if (swiperSlide) {
            if (shouldShow) {
              (swiperSlide as HTMLElement).style.display = '';
              (swiperSlide as HTMLElement).style.visibility = 'visible';
              (swiperSlide as HTMLElement).style.height = 'auto';
            } else {
              (swiperSlide as HTMLElement).style.display = 'none';
              (swiperSlide as HTMLElement).style.visibility = 'hidden';
              (swiperSlide as HTMLElement).style.height = '0';
              (swiperSlide as HTMLElement).style.margin = '0';
              (swiperSlide as HTMLElement).style.padding = '0';
              (swiperSlide as HTMLElement).style.overflow = 'hidden';
            }
          }
        });

        // Update product count
        const visibleProducts = document.querySelectorAll('.product-card[style*="display: block"], .product-card:not([style*="display: none"])');
        const productCount = document.querySelector('.product-count');
        if (productCount) {
          productCount.textContent = `${visibleProducts.length} products`;
        }

      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    applyFilters();
  }, [filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      brands: [],
      vendors: [],
      flavours: [],
      strengths: [],
      formats: [],
      priceRange: { min: 0, max: 15 },
      rating: 0,
      onSale: false
    });

    // Uncheck all filter inputs
    const allInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    allInputs.forEach(input => {
      (input as HTMLInputElement).checked = false;
    });

    // Clear search inputs
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Find"]');
    searchInputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });

    // Show all product cards and their containers
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      const cardElement = card as HTMLElement;
      cardElement.style.display = 'block';
      cardElement.style.visibility = 'visible';
      cardElement.style.height = 'auto';
      cardElement.style.margin = '';
      cardElement.style.padding = '';
      cardElement.style.overflow = '';
    });
    
    // Also show all swiper-slide containers
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    swiperSlides.forEach(slide => {
      const slideElement = slide as HTMLElement;
      slideElement.style.display = '';
      slideElement.style.visibility = 'visible';
      slideElement.style.height = 'auto';
      slideElement.style.margin = '';
      slideElement.style.padding = '';
      slideElement.style.overflow = '';
    });
  };

  // Add clear filters button
  useEffect(() => {
    const addClearButton = () => {
      const sidebar = document.querySelector('.sidebar-mobile');
      if (sidebar && !document.querySelector('.clear-filters-btn')) {
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-filters-btn';
        clearButton.textContent = 'Clear All Filters';
        clearButton.style.cssText = `
          width: calc(100% - 24px);
          margin: 20px auto;
          padding: 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        `;
        
        clearButton.addEventListener('click', clearFilters);
        clearButton.addEventListener('mouseover', () => {
          clearButton.style.backgroundColor = '#dc2626';
        });
        clearButton.addEventListener('mouseout', () => {
          clearButton.style.backgroundColor = '#ef4444';
        });

        sidebar.appendChild(clearButton);
      }
    };

    const timer = setTimeout(addClearButton, 200);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
};

export default FilterHandler;
