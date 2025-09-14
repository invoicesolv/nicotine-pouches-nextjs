'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface BlogPost {
  wp_id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  featured_image: string;
  featured_image_local?: string;
  seo_meta?: {
    title?: string;
    description?: string;
    author?: string;
  };
}

interface BlogSearchProps {
  posts: BlogPost[];
  onSearchResults?: (results: BlogPost[]) => void;
}

const BlogSearch = ({ posts, onSearchResults }: BlogSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function
  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = posts.filter(post => {
        const searchTerm = query.toLowerCase();
        const title = (post.seo_meta?.title || post.title || '').toLowerCase();
        const excerpt = (post.excerpt || '').toLowerCase();
        const author = (post.seo_meta?.author || post.author || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               excerpt.includes(searchTerm) || 
               author.includes(searchTerm);
      });
      
      setResults(searchResults);
      setShowResults(true);
      setSelectedIndex(-1);
      
      if (onSearchResults) {
        onSearchResults(searchResults);
      }
    } else {
      setResults([]);
      setShowResults(false);
      if (onSearchResults) {
        onSearchResults(posts);
      }
    }
  }, [query, posts, onSearchResults]);

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
          window.location.href = `/${selectedResult.slug}`;
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: BlogPost) => {
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="search-container" style={{ position: 'relative', width: '100%' }}>
      <input 
        ref={inputRef}
        type="text" 
        placeholder="Search guides and articles..." 
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setShowResults(true)}
        style={{
          width: '100%',
          padding: '12px 45px 12px 15px',
          border: '2px solid #e5e7eb',
          borderRadius: '25px',
          fontSize: '14px',
          fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
          outline: 'none',
          transition: 'border-color 0.3s ease',
          backgroundColor: '#f9f9f9'
        }}
      />
      <div className="search-icon" style={{
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="search-results" style={{
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
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {results.map((result, index) => {
            const displayTitle = result.seo_meta?.title || result.title;
            const displayImage = result.featured_image_local || result.featured_image || '/placeholder-product.jpg';
            
            return (
              <Link
                key={result.wp_id}
                href={`/${result.slug}`}
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
                <div style={{
                  width: '40px',
                  height: '40px',
                  marginRight: '12px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
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
                    {displayTitle}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {result.seo_meta?.author || result.author || 'Unknown Author'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && results.length === 0 && (
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
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>No articles found</div>
          <div style={{ fontSize: '12px' }}>Try a different search term</div>
        </div>
      )}
    </div>
  );
};

export default BlogSearch;
