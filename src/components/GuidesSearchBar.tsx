'use client';

import { useState } from 'react';

interface GuidesSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function GuidesSearchBar({ onSearch, placeholder = "Search guides..." }: GuidesSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Live search - trigger search on every keystroke
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
      margin: '0 0 40px 0',
      padding: '0 20px'
    }}>
      <form onSubmit={handleSearch} style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '16px 50px 16px 20px',
              borderRadius: '50px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontSize: '16px',
              fontFamily: 'Klarna Text, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }}
          />
          
          {/* Search Icon */}
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            fontSize: '20px',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>
      </form>
      
      {/* Clear Button */}
      {searchQuery && (
        <div style={{
          textAlign: 'left',
          marginTop: '15px'
        }}>
          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              borderRadius: '25px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
              color: '#666',
              fontSize: '14px',
              fontFamily: 'Klarna Text, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#666';
            }}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
