'use client';

import { useEffect } from 'react';

const ProductButtonScript = () => {
  useEffect(() => {
    // Wait for the page to be fully loaded
    const initButtons = () => {
      // Get the current user from localStorage or session
      const getUser = async () => {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          
          // Use the same config as the lib file
          const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
          const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
          
          const client = createClient(supabaseUrl, supabaseAnonKey);
          
          const { data: { session } } = await client.auth.getSession();
          return session?.user || null;
        } catch (error) {
          console.error('Error getting user:', error);
          return null;
        }
      };

      // Handle price alert button clicks (open price alert modal)
      const handlePriceAlertClick = async (productId: number) => {
        console.log('Price alert clicked for product:', productId);
        const user = await getUser();
        console.log('Current user:', user);
        
        if (!user) {
          console.log('No user found, triggering login modal');
          // Trigger login modal by dispatching a custom event
          window.dispatchEvent(new CustomEvent('triggerLoginModal'));
          return;
        }

        // Trigger price alert modal
        window.dispatchEvent(new CustomEvent('triggerPriceAlertModal', { 
          detail: { productId } 
        }));
      };

      // Handle wishlist button clicks (show popup menu)
      const handleWishlistClick = async (productId: number) => {
        console.log('Wishlist clicked for product:', productId);
        const user = await getUser();
        console.log('Current user:', user);
        
        if (!user) {
          console.log('No user found, triggering login modal');
          // Trigger login modal by dispatching a custom event
          window.dispatchEvent(new CustomEvent('triggerLoginModal'));
          return;
        }

        // Toggle popup menu
        const existingPopup = document.querySelector(`[data-popup-product-id="${productId}"]`);
        if (existingPopup) {
          existingPopup.remove();
          return;
        }

        // Create popup menu
        const button = document.querySelector(`[data-product-id="${productId}"].wishlist-toggle`);
        if (!button) return;

        const popup = document.createElement('div');
        popup.setAttribute('data-popup-product-id', productId.toString());
        popup.setAttribute('data-popup', 'true');
        popup.style.cssText = `
          position: absolute;
          top: 40px;
          right: 0;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 8px 0;
          min-width: 180px;
          z-index: 1000;
          border: 1px solid #e5e7eb;
        `;

        // Price alert button
        const priceAlertBtn = document.createElement('button');
        priceAlertBtn.style.cssText = `
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          transition: background-color 0.2s ease;
        `;
        priceAlertBtn.innerHTML = `
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Price alert
        `;
        priceAlertBtn.addEventListener('click', () => {
          // Trigger price alert modal
          window.dispatchEvent(new CustomEvent('triggerPriceAlertModal', { 
            detail: { productId } 
          }));
          popup.remove();
        });
        priceAlertBtn.addEventListener('mouseover', (e) => {
          if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
          }
        });
        priceAlertBtn.addEventListener('mouseout', (e) => {
          if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        });

        // Add to wishlist button
        const wishlistBtn = document.createElement('button');
        wishlistBtn.style.cssText = `
          width: 100%;
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          transition: background-color 0.2s ease;
        `;
        wishlistBtn.innerHTML = `
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add to wishlist
        `;
        wishlistBtn.addEventListener('click', async () => {
          await handleAddToWishlist(productId);
          popup.remove();
        });
        wishlistBtn.addEventListener('mouseover', (e) => {
          if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
          }
        });
        wishlistBtn.addEventListener('mouseout', (e) => {
          if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        });

        popup.appendChild(priceAlertBtn);
        popup.appendChild(wishlistBtn);

        // Position popup relative to button
        const buttonRect = button.getBoundingClientRect();
        const buttonContainer = button.closest('.favorite-button') as HTMLElement;
        if (buttonContainer) {
          buttonContainer.style.position = 'relative';
          buttonContainer.appendChild(popup);
        }

        // Close popup when clicking outside
        const closePopup = (e: Event) => {
          if (!popup.contains(e.target as Node) && !button.contains(e.target as Node)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
          }
        };
        setTimeout(() => document.addEventListener('click', closePopup), 0);
      };

      // Handle adding to wishlist
      const handleAddToWishlist = async (productId: number) => {
        const user = await getUser();
        if (!user) return;

        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = 'https://vyolbmzuezpoqtdgongz.supabase.co';
          const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI';
          const client = createClient(supabaseUrl, supabaseAnonKey);
          
          await client
            .from('wishlist')
            .insert({
              user_id: user.id,
              product_id: productId,
              created_at: new Date().toISOString()
            });
          
          // Update button state
          const button = document.querySelector(`[data-product-id="${productId}"].wishlist-toggle`);
          if (button) {
            button.setAttribute('data-is-in-wishlist', 'true');
            const svg = button.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', '#ef4444');
              svg.setAttribute('stroke', '#ef4444');
            }
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);
        }
      };

      // Add event listeners to all price alert buttons
      const priceAlertButtons = document.querySelectorAll('.price-alert-toggle');
      priceAlertButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productId = parseInt(button.getAttribute('data-product-id') || '0');
          handlePriceAlertClick(productId);
        });
      });

      // Add event listeners to all wishlist buttons
      const wishlistButtons = document.querySelectorAll('.wishlist-toggle');
      wishlistButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productId = parseInt(button.getAttribute('data-product-id') || '0');
          handleWishlistClick(productId);
        });
      });

    // Listen for price alert modal trigger from popup
    const handlePriceAlertModalTrigger = (event: CustomEvent) => {
      const { productId } = event.detail;
      handlePriceAlertClick(productId);
    };
    window.addEventListener('triggerPriceAlertModal', handlePriceAlertModalTrigger as EventListener);

    console.log('Product buttons initialized');
    
    // Return cleanup function
    return () => {
      window.removeEventListener('triggerPriceAlertModal', handlePriceAlertModalTrigger as EventListener);
    };
  };

  // Initialize after a short delay to ensure DOM is ready
  const timer = setTimeout(() => {
    const cleanup = initButtons();
    return cleanup;
  }, 100);

  return () => {
    clearTimeout(timer);
  };
  }, []);

  return null;
};

export default ProductButtonScript;
