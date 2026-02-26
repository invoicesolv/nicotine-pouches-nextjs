'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SortDropdownProps {
  basePath?: string;
}

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

export default function SortDropdown({ basePath = '/compare' }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'popularity';
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Popularity';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === 'popularity') {
      params.delete('sort');
    } else {
      params.set('sort', sortValue);
    }
    // Reset to page 1 when sorting
    params.delete('page');

    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ''}`);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#1f2937',
          fontWeight: '500',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          background: 'none',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '8px',
          transition: 'background-color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Sort by {currentLabel.toLowerCase()}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
          minWidth: '200px',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                color: currentSort === option.value ? '#1f2937' : '#4b5563',
                fontWeight: currentSort === option.value ? '600' : '400',
                backgroundColor: currentSort === option.value ? '#f3f4f6' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (currentSort !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSort !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.label}
              {currentSort === option.value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
