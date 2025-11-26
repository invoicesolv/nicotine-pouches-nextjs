'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PriceAlertModal from './PriceAlertModal';

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour: string;
  strength_group: string;
  format: string;
  image_url?: string;
  page_url?: string;
  description?: string;
  store_count: number;
}

const ClientPriceAlertModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handlePriceAlertModal = (event: CustomEvent) => {
      const { productId } = event.detail;
      
      // Prevent opening if already open
      if (isOpen) return;
      
      console.log('Opening price alert modal for product:', productId);
      
      // Find the product data from the page
      const productElement = document.querySelector(`[data-product-id="${productId}"]`);
      if (productElement) {
        const productCard = productElement.closest('.product-card');
        if (productCard) {
          const titleElement = productCard.querySelector('.product-title');
          const brandElement = productCard.querySelector('.product-brand');
          const strengthElement = productCard.querySelector('.product-strength-label');
          const imageElement = productCard.querySelector('.product-image img');
          
          // Extract brand from the product title or look for brand-specific elements
          let brand = 'Unknown Brand';
          if (brandElement?.textContent) {
            brand = brandElement.textContent;
          } else if (titleElement?.textContent) {
            // Try to extract brand from title (e.g., "VELO Ruby Berry" -> "VELO")
            const titleText = titleElement.textContent;
            const brandMatch = titleText.match(/^([A-Z]+)\s/);
            if (brandMatch) {
              brand = brandMatch[1];
            }
          }
          
          const product: Product = {
            id: productId,
            name: titleElement?.textContent || 'Unknown Product',
            brand: brand,
            flavour: titleElement?.textContent || 'Unknown Flavour',
            strength_group: strengthElement?.textContent || 'Normal',
            format: 'Pouch',
            image_url: imageElement?.getAttribute('src') || undefined,
            store_count: 5
          };
          
          setSelectedProduct(product);
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('triggerPriceAlertModal', handlePriceAlertModal as EventListener);
    
    return () => {
      window.removeEventListener('triggerPriceAlertModal', handlePriceAlertModal as EventListener);
    };
  }, [isOpen]);

  return (
    <PriceAlertModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      product={selectedProduct}
      userId={user?.id || ''}
      onAlertCreated={() => {
        console.log('Price alert created');
        setIsOpen(false);
      }}
    />
  );
};

export default ClientPriceAlertModal;
