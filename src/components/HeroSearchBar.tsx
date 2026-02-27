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
      router.push(`${getLocalizedPath('/compare')}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
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
        placeholder="What are you looking for today?"
        showArrowButton={true}
      />

      <style jsx>{`
        .hero-search-wrapper {
          width: 100%;
          max-width: 520px;
          margin: 0;
        }

        .hero-search-wrapper :global(.search-container) {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 50px;
          padding: 4px 4px 4px 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          max-width: 100%;
          margin: 0;
          border: none;
        }

        .hero-search-wrapper :global(.search-container:hover) {
          box-shadow: 0 6px 25px rgba(0,0,0,0.15);
        }

        .hero-search-wrapper :global(.search-container:focus-within) {
          box-shadow: 0 6px 30px rgba(0,0,0,0.18);
        }

        .hero-search-wrapper :global(.search-input) {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          color: #333;
          background: transparent;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          box-shadow: none;
          padding: 6px 0;
        }

        .hero-search-wrapper :global(.search-input::placeholder) {
          color: #888;
          font-size: 16px;
        }

        .hero-search-wrapper :global(.search-icon) {
          width: 20px;
          height: 20px;
          color: #666;
          margin-right: 14px;
          flex-shrink: 0;
        }

        .hero-search-wrapper :global(.search-button) {
          background: #1f2544;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 10px;
        }

        .hero-search-wrapper :global(.search-button:hover) {
          background: #151933;
          transform: scale(1.05);
        }

        .hero-search-wrapper :global(.search-button:active) {
          transform: scale(0.98);
        }

        .hero-search-wrapper :global(.search-button svg) {
          width: 20px;
          height: 20px;
        }

        .hero-search-wrapper :global(.search-container) {
          position: relative !important;
          z-index: 9999 !important;
        }

        .hero-search-wrapper :global(.search-results) {
          position: absolute !important;
          top: 100% !important;
          bottom: auto !important;
          left: 0 !important;
          right: 0 !important;
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
          z-index: 9999 !important;
          max-height: 400px !important;
          overflow-y: auto !important;
          margin-top: 10px !important;
          margin-bottom: 0 !important;
        }

        .hero-search-wrapper :global(.search-result-item) {
          padding: 14px 18px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hero-search-wrapper :global(.search-result-item:hover) {
          background-color: #f8f9fa;
        }

        .hero-search-wrapper :global(.search-result-item:last-child) {
          border-bottom: none;
        }

        .hero-search-wrapper :global(.search-result-image) {
          width: 44px;
          height: 44px;
          border-radius: 10px;
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
            max-width: 100%;
          }

          .hero-search-wrapper :global(.search-container) {
            padding: 6px 6px 6px 18px;
            border-radius: 40px;
          }

          .hero-search-wrapper :global(.search-input) {
            font-size: 15px;
            padding: 6px 0;
          }

          .hero-search-wrapper :global(.search-input::placeholder) {
            font-size: 15px;
          }

          .hero-search-wrapper :global(.search-button) {
            width: 42px;
            height: 42px;
            margin-left: 10px;
          }

          .hero-search-wrapper :global(.search-icon) {
            margin-right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSearchBar;