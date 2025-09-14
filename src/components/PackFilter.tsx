'use client';

import { useEffect } from 'react';

interface Store {
  name: string;
  prices: {
    [key: string]: string;
  };
}

interface PackFilterProps {
  stores: Store[];
}

export default function PackFilter({ stores }: PackFilterProps) {
  useEffect(() => {
    // Set stores data globally
    (window as any).storesData = stores;

    function updatePackFilter() {
      const packSizeSelect = document.getElementById('pack-size');
      const vendorCards = document.querySelectorAll('.vendor-card');
      
      if (!packSizeSelect) {
        console.error('Pack size select not found');
        return;
      }
      
      const selectedPack = (packSizeSelect as HTMLSelectElement).value;
      console.log('Updating pack filter to:', selectedPack);
      
      vendorCards.forEach((card) => {
        try {
          const priceElement = card.querySelector('.price-display');
          const packSizeElement = card.querySelector('.pack-size-display');
          
          if (priceElement && packSizeElement) {
            const storeName = card.getAttribute('data-store-name');
            const store = stores.find(s => s.name === storeName);
            
            if (store && store.prices) {
              const newPrice = store.prices[selectedPack] || 'N/A';
              priceElement.textContent = newPrice;
              
              const packNumber = selectedPack.replace('pack', '');
              packSizeElement.textContent = ' (' + packNumber + ' Pack)';
            }
          }
        } catch (error) {
          console.warn('Error updating vendor card:', error);
        }
      });
    }

    function initializePackFilter() {
      const packSizeSelect = document.getElementById('pack-size');
      
      if (packSizeSelect) {
        // Remove existing event listeners
        packSizeSelect.removeEventListener('change', updatePackFilter);
        // Add new event listener
        packSizeSelect.addEventListener('change', updatePackFilter);
        // Initialize with current selection
        updatePackFilter();
      }
    }

    // Initialize immediately
    initializePackFilter();

    // Cleanup function
    return () => {
      const packSizeSelect = document.getElementById('pack-size');
      
      if (packSizeSelect) {
        packSizeSelect.removeEventListener('change', updatePackFilter);
      }
    };
  }, [stores]);

  return null; // This component doesn't render anything
}
