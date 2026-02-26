'use client';

import { useState } from 'react';

interface BrandSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function BrandSearchBar({ onSearch, placeholder = "Search brands..." }: BrandSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div style={{
      width: '100%',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px'
      }}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px 45px 12px 15px',
            border: '2px solid #e5e7eb',
            borderRadius: '25px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            backgroundColor: '#f9f9f9'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007bff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {searchQuery && (
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280'
              }}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

