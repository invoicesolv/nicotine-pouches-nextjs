'use client';

import { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxVisiblePages = 5 
}: PaginationProps) {
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);

  // Calculate which pages to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '40px',
      marginBottom: '20px'
    }}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
          color: currentPage === 1 ? '#6c757d' : '#495057',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}
        onMouseEnter={() => currentPage !== 1 && setHoveredPage(-1)}
        onMouseLeave={() => setHoveredPage(null)}
      >
        <span style={{
          transform: hoveredPage === -1 && currentPage !== 1 ? 'translateX(-2px)' : 'translateX(0)',
          transition: 'transform 0.2s ease'
        }}>
          ←
        </span>
        Previous
      </button>

      {/* Page Numbers */}
      <div className="pagination-buttons" style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span style={{
                padding: '8px 4px',
                color: '#6c757d',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                ...
              </span>
            ) : (
              <button
                className="pagination-button"
                onClick={() => onPageChange(page as number)}
                style={{
                  padding: '8px 12px',
                  border: currentPage === page ? '1px solid #000' : '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: currentPage === page ? '#000' : '#fff',
                  color: currentPage === page ? '#fff' : '#495057',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentPage === page ? '600' : '500',
                  transition: 'all 0.2s ease',
                  minWidth: '40px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  transform: hoveredPage === page ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: hoveredPage === page ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={() => setHoveredPage(page as number)}
                onMouseLeave={() => setHoveredPage(null)}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
          color: currentPage === totalPages ? '#6c757d' : '#495057',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}
        onMouseEnter={() => currentPage !== totalPages && setHoveredPage(-2)}
        onMouseLeave={() => setHoveredPage(null)}
      >
        Next
        <span style={{
          transform: hoveredPage === -2 && currentPage !== totalPages ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 0.2s ease'
        }}>
          →
        </span>
      </button>
    </div>
  );
}
