'use client';

import { useEffect } from 'react';

interface ShippingFilterProps {
  containerSelector?: string;
  sortSelectId?: string;
}

export default function ShippingFilter({ 
  containerSelector = '.vendor-card',
  sortSelectId = 'shipping-sort'
}: ShippingFilterProps) {
  useEffect(() => {
    function updateShippingSort() {
      const shippingSortSelect = document.getElementById(sortSelectId);
      
      if (!shippingSortSelect) {
        console.error(`Shipping sort select with id "${sortSelectId}" not found`);
        return;
      }
      
      const sortOrder = (shippingSortSelect as HTMLSelectElement).value;
      const vendorCards = document.querySelectorAll(containerSelector);
      
      if (vendorCards.length === 0) {
        console.warn(`No vendor cards found with selector "${containerSelector}"`);
        return;
      }
      
      // Convert NodeList to Array and sort
      const cardsArray = Array.from(vendorCards);
      
      cardsArray.sort((a, b) => {
        const shippingA = a.querySelector('.shipping-text')?.textContent?.toLowerCase();
        const shippingB = b.querySelector('.shipping-text')?.textContent?.toLowerCase();
        
        // Define shipping priority (lower number = faster shipping)
        const getShippingPriority = (shipping: string) => {
          if (!shipping) return 999;
          if (shipping.includes('same day') || shipping.includes('instant')) return 1;
          if (shipping.includes('next day') || shipping.includes('1 day')) return 2;
          if (shipping.includes('2 day') || shipping.includes('2-day')) return 3;
          if (shipping.includes('3 day') || shipping.includes('3-day')) return 4;
          if (shipping.includes('free') && shipping.includes('express')) return 5;
          if (shipping.includes('express')) return 6;
          if (shipping.includes('free')) return 7;
          if (shipping.includes('standard')) return 8;
          return 9; // Unknown shipping
        };
        
        const priorityA = getShippingPriority(shippingA || '');
        const priorityB = getShippingPriority(shippingB || '');
        
        return sortOrder === 'fastest' ? priorityA - priorityB : priorityB - priorityA;
      });
      
      // Find the parent container
      const firstCard = cardsArray[0];
      if (!firstCard) return;
      
      const parentContainer = firstCard.parentElement;
      if (!parentContainer) {
        console.error('Parent container not found');
        return;
      }
      
      // Re-append sorted cards to maintain DOM order
      cardsArray.forEach(card => card.remove());
      cardsArray.forEach(card => parentContainer.appendChild(card));
      
      console.log(`Shipping sorting updated: ${sortOrder}`, cardsArray.length, 'cards sorted');
    }

    function initializeShippingFilter() {
      const shippingSortSelect = document.getElementById(sortSelectId);
      
      if (shippingSortSelect) {
        shippingSortSelect.removeEventListener('change', updateShippingSort);
        shippingSortSelect.addEventListener('change', updateShippingSort);
        updateShippingSort();
      } else {
        console.warn(`Shipping sort select with id "${sortSelectId}" not found during initialization`);
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    setTimeout(initializeShippingFilter, 100);

    // Listen for changes to other filters
    const priceSortSelect = document.getElementById('price-sort');
    const packSizeSelect = document.getElementById('pack-size');
    
    if (priceSortSelect) {
      priceSortSelect.addEventListener('change', () => {
        setTimeout(updateShippingSort, 100);
      });
    }
    
    if (packSizeSelect) {
      packSizeSelect.addEventListener('change', () => {
        setTimeout(updateShippingSort, 100);
      });
    }

    // Cleanup function
    return () => {
      const shippingSortSelect = document.getElementById(sortSelectId);
      const priceSortSelect = document.getElementById('price-sort');
      const packSizeSelect = document.getElementById('pack-size');
      
      if (shippingSortSelect) {
        shippingSortSelect.removeEventListener('change', updateShippingSort);
      }
      if (priceSortSelect) {
        priceSortSelect.removeEventListener('change', updateShippingSort);
      }
      if (packSizeSelect) {
        packSizeSelect.removeEventListener('change', updateShippingSort);
      }
    };
  }, [containerSelector, sortSelectId]);

  return null; // This component doesn't render anything
}
