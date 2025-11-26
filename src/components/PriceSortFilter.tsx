'use client';

import { useEffect } from 'react';

interface PriceSortFilterProps {
  containerSelector?: string;
  sortSelectId?: string;
}

export default function PriceSortFilter({ 
  containerSelector = '.vendor-card',
  sortSelectId = 'price-sort'
}: PriceSortFilterProps) {
  useEffect(() => {
    function updatePriceSort() {
      const priceSortSelect = document.getElementById(sortSelectId);
      
      if (!priceSortSelect) {
        console.error(`Price sort select with id "${sortSelectId}" not found`);
        return;
      }
      
      const sortOrder = (priceSortSelect as HTMLSelectElement).value;
      
      // Track price sort change in analytics
      if ((window as any).vendorAnalytics) {
        (window as any).vendorAnalytics.trackPriceSort(
          (window as any).currentProductId || 'unknown',
          sortOrder
        );
      }
      
      const vendorCards = document.querySelectorAll(containerSelector);
      
      if (vendorCards.length === 0) {
        console.warn(`No vendor cards found with selector "${containerSelector}"`);
        return;
      }
      
      // Convert NodeList to Array and sort
      const cardsArray = Array.from(vendorCards);
      
      cardsArray.sort((a, b) => {
        const priceA = a.querySelector('.price-display')?.textContent;
        const priceB = b.querySelector('.price-display')?.textContent;
        
        // Extract numeric value from price string (handles £, $, commas, etc.)
        const numA = parseFloat(priceA?.replace(/[£$,]/g, '') || '0');
        const numB = parseFloat(priceB?.replace(/[£$,]/g, '') || '0');
        
        // Handle N/A or invalid prices by putting them at the end
        if (isNaN(numA) && isNaN(numB)) return 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        
        return sortOrder === 'low-high' ? numA - numB : numB - numA;
      });
      
      // Find the parent container (the div with flexDirection: column)
      const firstCard = cardsArray[0];
      if (!firstCard) return;
      
      const parentContainer = firstCard.parentElement;
      if (!parentContainer) {
        console.error('Parent container not found');
        return;
      }
      
      // Re-append sorted cards to maintain DOM order
      // First, remove all vendor cards from the container
      cardsArray.forEach(card => card.remove());
      
      // Then re-append them in the sorted order
      cardsArray.forEach(card => parentContainer.appendChild(card));
      
      console.log(`Price sorting updated: ${sortOrder}`, cardsArray.length, 'cards sorted');
    }

    function initializePriceSortFilter() {
      const priceSortSelect = document.getElementById(sortSelectId);
      
      if (priceSortSelect) {
        // Remove existing event listeners
        priceSortSelect.removeEventListener('change', updatePriceSort);
        // Add new event listener
        priceSortSelect.addEventListener('change', updatePriceSort);
        // Initialize with current selection
        updatePriceSort();
      } else {
        console.warn(`Price sort select with id "${sortSelectId}" not found during initialization`);
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    setTimeout(initializePriceSortFilter, 100);

    // Also listen for changes to the pack filter, as it might affect prices
    const packSizeSelect = document.getElementById('pack-size');
    if (packSizeSelect) {
      packSizeSelect.addEventListener('change', () => {
        // Small delay to allow pack filter to update prices first
        setTimeout(updatePriceSort, 100);
      });
    }

    // Cleanup function
    return () => {
      const priceSortSelect = document.getElementById(sortSelectId);
      const packSizeSelect = document.getElementById('pack-size');
      
      if (priceSortSelect) {
        priceSortSelect.removeEventListener('change', updatePriceSort);
      }
      
      if (packSizeSelect) {
        packSizeSelect.removeEventListener('change', updatePriceSort);
      }
    };
  }, [containerSelector, sortSelectId]);

  return null; // This component doesn't render anything
}
