'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  image_url: string | null;
  slug: string;
  type: 'product' | 'brand' | 'category';
  category?: string;
}

interface LiveSearchProps {
  hideInput?: boolean;
  externalQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  showArrowButton?: boolean;
}

const LiveSearch = ({
  hideInput = false,
  externalQuery = '',
  onQueryChange,
  placeholder = 'What are you looking for?',
  showArrowButton = false
}: LiveSearchProps = {}) => {
  const [query, setQuery] = useState(externalQuery || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUSRoute } = useLanguage();

  // Use external query if provided
  const currentQuery = externalQuery || query;

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentQuery.length >= 2) {
        searchProducts(currentQuery);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuery]);

  // Show results when external query is provided
  useEffect(() => {
    if (externalQuery && externalQuery.length >= 2) {
      setShowResults(true);
    }
  }, [externalQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const allResults: SearchResult[] = [];
      
      if (isUSRoute) {
        // Search US products
        const { data: products, error: productsError } = await supabase()
          .from('us_products')
          .select('id, product_title, image_url, brand, flavour')
          .or(`product_title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,flavour.ilike.%${searchQuery}%`)
          .not('image_url', 'is', null)
          .limit(6);

        if (!productsError && products) {
          const productResults: SearchResult[] = products.map((product: any) => ({
            id: product.id.toString(),
            name: product.product_title,
            brand: product.brand || product.product_title.split(' ')[0],
            image_url: product.image_url,
            slug: product.product_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            type: 'product' as const,
            category: product.flavour || 'Original'
          }));
          allResults.push(...productResults);
        }

        // Search US brands
        const { data: brandData, error: brandError } = await supabase()
          .from('us_products')
          .select('brand')
          .ilike('brand', `%${searchQuery}%`)
          .not('brand', 'is', null)
          .limit(3);

        if (!brandError && brandData) {
          const uniqueBrands = Array.from(new Set(brandData.map((item: any) => item.brand))) as string[];
          const brandResults: SearchResult[] = uniqueBrands.map((brand: string) => ({
            id: `brand-${brand.toLowerCase()}`,
            name: brand,
            brand: brand,
            image_url: null,
            slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            type: 'brand' as const
          }));
          allResults.push(...brandResults);
        }

      } else {
        // Search UK products
        const { data: products, error: productsError } = await supabase()
          .from('wp_products')
          .select('id, name, image_url')
          .ilike('name', `%${searchQuery}%`)
          .not('image_url', 'is', null)
          .limit(6);

        if (!productsError && products) {
          const productResults: SearchResult[] = products.map((product: any) => {
            const brand = product.name.split(' ')[0];
            return {
              id: product.id.toString(),
              name: product.name,
              brand: brand,
              image_url: product.image_url,
              slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              type: 'product' as const
            };
          });
          allResults.push(...productResults);
        }

        // Search UK brands (extract from product names)
        const { data: brandData, error: brandError } = await supabase()
          .from('wp_products')
          .select('name')
          .ilike('name', `%${searchQuery}%`)
          .not('name', 'is', null)
          .limit(10);

        if (!brandError && brandData) {
          const brandNames = brandData.map((item: any) => item.name.split(' ')[0]);
              const uniqueBrands = Array.from(new Set(brandNames)) as string[];
          const brandResults: SearchResult[] = uniqueBrands.slice(0, 3).map((brand: string) => ({
            id: `brand-${brand.toLowerCase()}`,
            name: brand,
            brand: brand,
            image_url: null,
            slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            type: 'brand' as const
          }));
          allResults.push(...brandResults);
        }
      }

      // Add category suggestions based on common nicotine pouch categories
      const categories = ['Mint', 'Berry', 'Citrus', 'Tobacco', 'Coffee', 'Vanilla', 'Apple', 'Cherry'];
      const matchingCategories = categories.filter(cat => 
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 2);

      const categoryResults: SearchResult[] = matchingCategories.map((category: string) => ({
        id: `category-${category.toLowerCase()}`,
        name: `${category} Flavors`,
        brand: 'Category',
        image_url: null,
        slug: category.toLowerCase().replace(/\s+/g, '-'),
        type: 'category' as const,
        category: category
      }));

      allResults.push(...categoryResults);

      setResults(allResults.slice(0, 8)); // Limit total results
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selectedResult = results[selectedIndex];
          window.location.href = `/product/${selectedResult.slug}`;
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      const searchPath = isUSRoute ? '/us/compare' : '/compare';
      window.location.href = `${searchPath}?search=${encodeURIComponent(query.trim())}`;
    } else {
      const comparePath = isUSRoute ? '/us/compare' : '/compare';
      window.location.href = comparePath;
    }
  };

  return (
    <div ref={searchRef} className="search-container" style={{ position: 'relative', width: '100%' }}>
      {!hideInput && (
        <>
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onQueryChange?.(e.target.value);
            }}
            onKeyDown={(e) => {
              handleKeyDown(e);
              if (e.key === 'Enter' && selectedIndex === -1) {
                handleSubmit();
              }
            }}
            onFocus={() => query.length >= 2 && setShowResults(true)}
          />
          {isLoading && (
            <div className="search-loading-spinner" style={{
              width: '18px',
              height: '18px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #1f2544',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }} />
          )}
          <button
            type="button"
            className="search-button"
            onClick={handleSubmit}
            aria-label="Search"
          >
            {showArrowButton ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            )}
          </button>
        </>
      )}

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="search-results" style={{
          position: hideInput ? 'relative' : 'absolute',
          top: hideInput ? '0' : '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: 'none',
          borderRadius: hideInput ? '0' : '12px',
          boxShadow: hideInput ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: hideInput ? '0' : '4px',
          maxHeight: hideInput ? 'none' : '400px',
          overflowY: hideInput ? 'visible' : 'auto',
          overflowX: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {results.map((result, index) => {
            let href = '';
            let icon = '';
            
            if (result.type === 'product') {
              href = isUSRoute ? `/us/product/${result.slug}` : `/product/${result.slug}`;
              icon = '🛍️';
            } else if (result.type === 'brand') {
              href = isUSRoute ? `/us/brands/${result.slug}` : `/brands/${result.slug}`;
              icon = '🏷️';
            } else if (result.type === 'category') {
              href = isUSRoute ? `/us/search?category=${result.category}` : `/search?category=${result.category}`;
              icon = '📂';
            }

            return (
              <Link
                key={result.id}
                href={href}
                onClick={() => handleResultClick(result)}
                className="search-result-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: selectedIndex === index ? '#f3f4f6' : 'transparent',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {result.image_url ? (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    marginRight: '12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={result.image_url}
                      alt={result.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    marginRight: '12px',
                    borderRadius: '6px',
                    backgroundColor: result.type === 'brand' ? '#f3f4f6' : result.type === 'category' ? '#e0f2fe' : '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '20px'
                  }}>
                    {icon}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {result.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{
                      backgroundColor: result.type === 'product' ? '#dbeafe' : result.type === 'brand' ? '#fef3c7' : '#d1fae5',
                      color: result.type === 'product' ? '#1e40af' : result.type === 'brand' ? '#92400e' : '#065f46',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {result.type}
                    </span>
                    {result.brand && result.type !== 'brand' && (
                      <span>{result.brand}</span>
                    )}
                    {result.category && (
                      <span>• {result.category}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="search-no-results" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          marginTop: '4px',
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>No products found</div>
          <div style={{ fontSize: '12px' }}>Try a different search term</div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LiveSearch;
