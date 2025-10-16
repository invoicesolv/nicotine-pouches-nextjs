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
  onPackSizeChange?: (packSize: string) => void;
}

export default function PackFilter({ stores, onPackSizeChange }: PackFilterProps) {
  useEffect(() => {
    // Set stores data globally
    (window as any).storesData = stores;

    function updatePackFilter() {
      const packSizeSelect = document.getElementById('pack-size');
      
      if (!packSizeSelect) {
        console.error('Pack size select not found');
        return;
      }
      
      const selectedPack = (packSizeSelect as HTMLSelectElement).value;
      console.log('Updating pack filter to:', selectedPack);
      
      // Track pack size change in analytics
      if ((window as any).vendorAnalytics) {
        (window as any).vendorAnalytics.trackPackSizeChange(
          (window as any).currentProductId || 'unknown',
          selectedPack
        );
      }
      
      // Call the callback to update React state
      if (onPackSizeChange) {
        onPackSizeChange(selectedPack);
      }

      // **ADD THESE CALLS**:
      // Update prices for the selected pack size
      if ((window as any).updatePrices) {
        (window as any).updatePrices(selectedPack);
      }

      // Filter and sort vendor cards
      if ((window as any).filterVendorCards) {
        (window as any).filterVendorCards(selectedPack);
      }

      // Update pack size display labels
      if ((window as any).updatePackSizeDisplay) {
        (window as any).updatePackSizeDisplay(selectedPack);
      }
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
        return true; // Successfully initialized
      }
      return false; // Not found
    }

    // Try to initialize immediately
    let initialized = initializePackFilter();
    
    // If not found, wait a bit and try again
    if (!initialized) {
      const timer = setTimeout(() => {
        initializePackFilter();
      }, 100);
      
      // Also use MutationObserver to watch for the element
      const observer = new MutationObserver(() => {
        if (initializePackFilter()) {
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Cleanup function
      return () => {
        clearTimeout(timer);
        observer.disconnect();
        const packSizeSelect = document.getElementById('pack-size');
        
        if (packSizeSelect) {
          packSizeSelect.removeEventListener('change', updatePackFilter);
        }
      };
    }

    // Cleanup function for immediate initialization
    return () => {
      const packSizeSelect = document.getElementById('pack-size');
      
      if (packSizeSelect) {
        packSizeSelect.removeEventListener('change', updatePackFilter);
      }
    };
  }, [stores, onPackSizeChange]);

  return null; // This component doesn't render anything
}
