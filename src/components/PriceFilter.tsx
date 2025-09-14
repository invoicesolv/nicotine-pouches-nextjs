'use client';

import { useEffect } from 'react';

interface PriceFilterProps {
  containerSelector?: string;
}

export default function PriceFilter({ containerSelector = 'div[style*="flexDirection: column"]' }: PriceFilterProps) {
  useEffect(() => {
    function updatePriceSort() {
      const priceSortSelect = document.getElementById('price-sort');
      
      if (!priceSortSelect) {
        console.error('Price sort select not found');
        return;
      }
      
      const sortOrder = (priceSortSelect as HTMLSelectElement).value;
      const container = document.querySelector(containerSelector);
      
      if (container) {
        const cards = Array.from(container.children);
        
        cards.sort((a, b) => {
          const priceA = a.querySelector('.price-display')?.textContent;
          const priceB = b.querySelector('.price-display')?.textContent;
          
          // Extract numeric value from price string (handles £, $, commas, etc.)
          const numA = parseFloat(priceA?.replace(/[£$,]/g, '') || '0');
          const numB = parseFloat(priceB?.replace(/[£$,]/g, '') || '0');
          
          return sortOrder === 'low-high' ? numA - numB : numB - numA;
        });
        
        // Re-append sorted cards to maintain DOM order
        cards.forEach(card => container.appendChild(card));
      }
    }

    function initializePriceFilter() {
      const priceSortSelect = document.getElementById('price-sort');
      
      if (priceSortSelect) {
        // Remove existing event listeners
        priceSortSelect.removeEventListener('change', updatePriceSort);
        // Add new event listener
        priceSortSelect.addEventListener('change', updatePriceSort);
        // Initialize with current selection
        updatePriceSort();
      }
    }

    // Initialize immediately
    initializePriceFilter();

    // Cleanup function
    return () => {
      const priceSortSelect = document.getElementById('price-sort');
      
      if (priceSortSelect) {
        priceSortSelect.removeEventListener('change', updatePriceSort);
      }
    };
  }, [containerSelector]);

  return null; // This component doesn't render anything
}
