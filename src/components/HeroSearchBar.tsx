'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LiveSearch from './LiveSearch';

const HeroSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { getLocalizedPath } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to compare page with search query
      router.push(`${getLocalizedPath('/compare')}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Navigate to compare page without search
      router.push(getLocalizedPath('/compare'));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="hero-search-wrapper">
      <LiveSearch 
        externalQuery={searchQuery}
        onQueryChange={setSearchQuery}
      />
      
      <style jsx>{`
        .hero-search-wrapper {
          width: 100%;
          max-width: 800px;
          margin: 0; /* Remove auto centering to align with text */
        }
        
        .hero-search-wrapper :global(.search-container) {
          position: relative;
          display: flex;
          align-items: center;
          background: transparent;
          border-radius: 25px;
          padding: 10px 20px;
          box-shadow: none;
          transition: all 0.3s ease;
          max-width: 700px;
          margin: 0; /* Remove auto centering to align with text */
          border: none;
        }
        
        .hero-search-wrapper :global(.search-container:hover) {
          box-shadow: none;
          transform: none;
        }
        
        .hero-search-wrapper :global(.search-input) {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: #333;
          background: transparent;
          font-family: inherit;
          box-shadow: none;
        }
        
        .hero-search-wrapper :global(.search-input::placeholder) {
          color: #999;
          font-size: 16px;
        }
        
        .hero-search-wrapper :global(.search-button) {
          background: #1a1f3a;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          margin-left: 12px;
        }
        
        .hero-search-wrapper :global(.search-button:hover) {
          background: #0a0e27;
          transform: scale(1.05);
        }
        
        .hero-search-wrapper :global(.search-button:active) {
          transform: scale(0.95);
        }
        
        .hero-search-wrapper :global(.search-icon) {
          width: 20px;
          height: 20px;
          color: #666;
          margin-right: 15px;
          flex-shrink: 0;
        }
        
        .hero-search-wrapper :global(.search-results) {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 8px;
        }
        
        .hero-search-wrapper :global(.search-result-item) {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .hero-search-wrapper :global(.search-result-item:hover) {
          background-color: #f8f9fa;
        }
        
        .hero-search-wrapper :global(.search-result-item:last-child) {
          border-bottom: none;
        }
        
        .hero-search-wrapper :global(.search-result-image) {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        
        .hero-search-wrapper :global(.search-result-content) {
          flex: 1;
          min-width: 0;
        }
        
        .hero-search-wrapper :global(.search-result-name) {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .hero-search-wrapper :global(.search-result-brand) {
          font-size: 14px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .hero-search-wrapper :global(.search-result-category) {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        
        .hero-search-wrapper :global(.search-loading) {
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        .hero-search-wrapper :global(.search-no-results) {
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .hero-search-wrapper {
            max-width: 90%;
          }
          
          .hero-search-wrapper :global(.search-container) {
            padding: 8px 15px;
            border-radius: 20px;
            max-width: 100%;
          }
          
          .hero-search-wrapper :global(.search-input) {
            font-size: 14px;
          }
          
          .hero-search-wrapper :global(.search-input::placeholder) {
            font-size: 14px;
          }
          
          .hero-search-wrapper :global(.search-button) {
            width: 35px;
            height: 35px;
            margin-left: 10px;
          }
          
          .hero-search-wrapper :global(.search-icon) {
            margin-right: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSearchBar;