'use client';

import { useEffect } from 'react';

interface ReviewFilterProps {
  containerSelector?: string;
  sortSelectId?: string;
}

export default function ReviewFilter({ 
  containerSelector = '.vendor-card',
  sortSelectId = 'review-sort'
}: ReviewFilterProps) {
  useEffect(() => {
    function updateReviewSort() {
      const reviewSortSelect = document.getElementById(sortSelectId);
      
      if (!reviewSortSelect) {
        console.error(`Review sort select with id "${sortSelectId}" not found`);
        return;
      }
      
      const sortOrder = (reviewSortSelect as HTMLSelectElement).value;
      const vendorCards = document.querySelectorAll(containerSelector);
      
      if (vendorCards.length === 0) {
        console.warn(`No vendor cards found with selector "${containerSelector}"`);
        return;
      }
      
      // Convert NodeList to Array and sort
      const cardsArray = Array.from(vendorCards);
      
      cardsArray.sort((a, b) => {
        const reviewA = a.querySelector('.review-rating')?.textContent;
        const reviewB = b.querySelector('.review-rating')?.textContent;
        
        // Extract numeric value from review rating
        const numA = parseFloat(reviewA?.replace(/[^\d.]/g, '') || '0');
        const numB = parseFloat(reviewB?.replace(/[^\d.]/g, '') || '0');
        
        // Handle N/A or invalid ratings by putting them at the end
        if (isNaN(numA) && isNaN(numB)) return 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        
        return sortOrder === 'highest' ? numB - numA : numA - numB;
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
      
      console.log(`Review sorting updated: ${sortOrder}`, cardsArray.length, 'cards sorted');
    }

    function initializeReviewFilter() {
      const reviewSortSelect = document.getElementById(sortSelectId);
      
      if (reviewSortSelect) {
        reviewSortSelect.removeEventListener('change', updateReviewSort);
        reviewSortSelect.addEventListener('change', updateReviewSort);
        updateReviewSort();
      } else {
        console.warn(`Review sort select with id "${sortSelectId}" not found during initialization`);
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    setTimeout(initializeReviewFilter, 100);

    // Listen for changes to other filters
    const priceSortSelect = document.getElementById('price-sort');
    const packSizeSelect = document.getElementById('pack-size');
    const shippingSortSelect = document.getElementById('shipping-sort');
    
    if (priceSortSelect) {
      priceSortSelect.addEventListener('change', () => {
        setTimeout(updateReviewSort, 100);
      });
    }
    
    if (packSizeSelect) {
      packSizeSelect.addEventListener('change', () => {
        setTimeout(updateReviewSort, 100);
      });
    }
    
    if (shippingSortSelect) {
      shippingSortSelect.addEventListener('change', () => {
        setTimeout(updateReviewSort, 100);
      });
    }

    // Cleanup function
    return () => {
      const reviewSortSelect = document.getElementById(sortSelectId);
      const priceSortSelect = document.getElementById('price-sort');
      const packSizeSelect = document.getElementById('pack-size');
      const shippingSortSelect = document.getElementById('shipping-sort');
      
      if (reviewSortSelect) {
        reviewSortSelect.removeEventListener('change', updateReviewSort);
      }
      if (priceSortSelect) {
        priceSortSelect.removeEventListener('change', updateReviewSort);
      }
      if (packSizeSelect) {
        packSizeSelect.removeEventListener('change', updateReviewSort);
      }
      if (shippingSortSelect) {
        shippingSortSelect.removeEventListener('change', updateReviewSort);
      }
    };
  }, [containerSelector, sortSelectId]);

  return null; // This component doesn't render anything
}
