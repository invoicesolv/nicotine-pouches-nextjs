'use client';

import { useEffect, useRef, useState } from 'react';
import { VENDOR_ANALYTICS_CONFIG, getCurrencySymbol, getRegionFromCurrency, isVendorSyncEnabled } from '@/config/vendor-analytics';
import { 
  trackVendorExposure as trackGA4VendorExposure,
  trackVendorClick as trackGA4VendorClick,
  trackVendorConversion as trackGA4VendorConversion,
  trackPackSizeChange as trackGA4PackSizeChange,
  trackPriceSort as trackGA4PriceSort,
  trackComparisonView as trackGA4ComparisonView
} from '@/lib/gtag';

interface VendorAnalyticsProps {
  productId: string;
  productName: string;
  region?: 'UK' | 'US';
}

interface VendorData {
  vendor_id: string;
  vendor_name: string;
  price: number;
  pack_size: number;
  currency: string;
  vendor_url?: string;
}

class VendorAnalytics {
  private sessionId: string;
  private viewedVendors: Set<string>;
  private comparisonViews: Map<string, any>;
  private region: string;

  constructor(region: string = 'UK') {
    this.sessionId = this.generateSessionId();
    this.viewedVendors = new Set();
    this.comparisonViews = new Map();
    this.region = region;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track vendor exposure (when vendor cards come into view) - exact same as WordPress plugin
  trackVendorExposure(vendorData: VendorData, productId: string, productName: string) {
    if (this.viewedVendors.has(vendorData.vendor_id)) {
      return; // Already tracked this vendor
    }

    this.viewedVendors.add(vendorData.vendor_id);

    const eventData = {
      event_category: 'vendor_exposure',
      event_label: `vendor_${vendorData.vendor_id}_exposed`,
      vendor_id: vendorData.vendor_id,
      vendor_name: vendorData.vendor_name,
      product_id: productId,
      product_name: productName,
      price: vendorData.price,
      currency: vendorData.currency,
      pack_size: vendorData.pack_size,
      interaction_type: 'vendor_exposure',
      session_id: this.sessionId
    };

    console.log('Vendor Exposure Tracked:', eventData);
    
    // Track in Google Analytics 4
    trackGA4VendorExposure({
      vendor_id: vendorData.vendor_id,
      vendor_name: vendorData.vendor_name,
      product_id: productId,
      product_name: productName,
      price: vendorData.price,
      currency: vendorData.currency,
      pack_size: vendorData.pack_size,
      session_id: this.sessionId
    });
    
    this.sendToBackend('vendor_exposure', eventData);
  }

  // Track vendor click (buy button or vendor link click)
  trackVendorClick(vendorData: VendorData, productId: string, productName: string, clickType: 'vendor_click' | 'vendor_conversion' = 'vendor_click') {
    const eventData = {
      event_category: 'vendor_interaction',
      event_label: `vendor_${vendorData.vendor_id}`,
      vendor_id: vendorData.vendor_id,
      vendor_name: vendorData.vendor_name,
      product_id: productId,
      product_name: productName,
      price: vendorData.price,
      currency: vendorData.currency,
      pack_size: vendorData.pack_size,
      interaction_type: clickType,
      session_id: this.sessionId
    };

    console.log('Vendor Click Tracked:', eventData);
    
    // Track in Google Analytics 4
    if (clickType === 'vendor_conversion') {
      trackGA4VendorConversion({
        vendor_id: vendorData.vendor_id,
        vendor_name: vendorData.vendor_name,
        product_id: productId,
        product_name: productName,
        price: vendorData.price,
        currency: vendorData.currency,
        pack_size: vendorData.pack_size,
        session_id: this.sessionId
      });
    } else {
      trackGA4VendorClick({
        vendor_id: vendorData.vendor_id,
        vendor_name: vendorData.vendor_name,
        product_id: productId,
        product_name: productName,
        price: vendorData.price,
        currency: vendorData.currency,
        pack_size: vendorData.pack_size,
        session_id: this.sessionId
      });
    }
    
    this.sendToBackend(clickType, eventData);
  }



  // Track comparison view
  trackComparisonView(productId: string, vendorCount: number, vendorList: VendorData[]) {
    const eventData = {
      event_category: 'page_interaction',
      event_label: `comparison_view`,
      product_id: productId,
      vendor_count: vendorCount,
      vendors: vendorList,
      interaction_type: 'comparison_view',
      session_id: this.sessionId
    };

    console.log('Comparison View Tracked:', eventData);
    
    // Track in Google Analytics 4
    trackGA4ComparisonView(productId, vendorCount, this.sessionId);
    
    this.sendToBackend('comparison_view', eventData);
  }

  // Track pack size change (exact same as WordPress plugin)
  trackPackSizeChange(productId: string, packSize: string) {
    const eventData = {
      event_category: 'user_interaction',
      event_label: `pack_size_${packSize}`,
      product_id: productId,
      pack_size: parseInt(packSize),
      interaction_type: 'pack_size_change',
      session_id: this.sessionId
    };

    console.log('Pack Size Change Tracked:', eventData);
    
    // Track in Google Analytics 4
    trackGA4PackSizeChange(productId, parseInt(packSize), this.sessionId);
    
    this.sendToBackend('pack_size_change', eventData);
  }

  // Track price sort change (exact same as WordPress plugin)
  trackPriceSort(productId: string, sortType: string) {
    const eventData = {
      event_category: 'user_interaction',
      event_label: `price_sort_${sortType}`,
      product_id: productId,
      sort_type: sortType,
      interaction_type: 'price_sort',
      session_id: this.sessionId
    };

    console.log('Price Sort Tracked:', eventData);
    
    // Track in Google Analytics 4
    trackGA4PriceSort(productId, sortType, this.sessionId);
    
    this.sendToBackend('price_sort', eventData);
  }

  // Send analytics data to backend (exact same as WordPress plugin)
  private async sendToBackend(eventType: string, eventData: any) {
    try {
      // Send to analytics handler first (exact same as WordPress)
      await this.sendToAnalytics(eventType, eventData);
      
      // Send click data to CRM for all vendor interactions and pack changes
      if (eventType === 'vendor_conversion' || eventType === 'vendor_click' || eventType === 'vendor_exposure' || eventType === 'pack_size_change') {
        await this.sendToCRM(eventData);
      }
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  }

  // Send to analytics handler (exact same as WordPress log_vendor_analytics)
  private async sendToAnalytics(eventType: string, eventData: any) {
    try {
      const analyticsData = {
        event_type: eventType,
        event_data: JSON.stringify(eventData) // Exact same as WordPress stripslashes($_POST['event_data'])
      };

      const response = await fetch('/api/vendor-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Analytics logged successfully');
      } else {
        console.warn('Analytics logging failed:', data.error);
      }
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  }

  // Send click data to CRM via Next.js API
  private async sendToCRM(eventData: any) {
    // Check if CRM sync is enabled
    if (!isVendorSyncEnabled()) {
      console.log('CRM sync disabled, skipping tracking');
      return;
    }

    try {
      // Exact same data structure as WordPress plugin
      const crmData = {
        action: 'vendor_click_tracking', // Exact same as WordPress
        nonce: '', // WordPress uses nonce, we'll handle this in API
        vendor_id: eventData.vendor_id || '',
        product_id: eventData.product_id,
        vendor_name: eventData.vendor_name || '',
        product_name: eventData.product_name || '',
        vendor_url: eventData.vendor_id ? this.getCurrentVendorUrl(eventData.vendor_id) : '',
        page_url: window.location.href,
        click_type: eventData.interaction_type,
        session_id: eventData.session_id,
        price: eventData.price || eventData.value || '0',
        currency: eventData.currency || 'GBP',
        pack_size: eventData.pack_size || '1'
      };

      const response = await fetch('/api/vendor-click-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crmData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('CRM tracking successful:', data.data);
      } else {
        console.warn('CRM tracking failed:', data.error);
      }
    } catch (error) {
      console.warn('Failed to send click data to CRM:', error);
    }
  }

  // Get current vendor URL from the clicked element or construct it
  private getCurrentVendorUrl(vendorId: string): string | null {
    const vendorCard = document.querySelector(`[data-vendor-id="${vendorId}"]`);
    if (vendorCard) {
      const buyButton = vendorCard.querySelector('.buy-now-button, .product-title-link, a[href]');
      if (buyButton && buyButton.getAttribute('href')) {
        return buyButton.getAttribute('href');
      }
    }
    return null;
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      sessionId: this.sessionId,
      viewedVendors: Array.from(this.viewedVendors),
      comparisonViews: Object.fromEntries(this.comparisonViews)
    };
  }
}

export default function VendorAnalyticsComponent({ productId, productName, region = 'UK' }: VendorAnalyticsProps) {
  const analyticsRef = useRef<VendorAnalytics | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize analytics
    analyticsRef.current = new VendorAnalytics(region);
    setIsInitialized(true);

    // Set up intersection observer for vendor exposure tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const vendorCard = entry.target as HTMLElement;
          const vendorData = extractVendorData(vendorCard);
          
          if (vendorData && analyticsRef.current) {
            analyticsRef.current.trackVendorExposure(vendorData, productId, productName);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    // Observe all vendor cards
    const vendorCards = document.querySelectorAll('.vendor-card[data-vendor-id]');
    vendorCards.forEach(card => {
      observer.observe(card);
    });

    // Set up click tracking
    const handleVendorClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const vendorCard = target.closest('.vendor-card[data-vendor-id]') as HTMLElement;
      
      if (vendorCard && analyticsRef.current) {
        const vendorData = extractVendorData(vendorCard);
        if (vendorData) {
          // Determine click type based on element
          const isBuyButton = target.closest('.buy-now-button, a[href]');
          const clickType = isBuyButton ? 'vendor_conversion' : 'vendor_click';
          
          analyticsRef.current.trackVendorClick(vendorData, productId, productName, clickType);
        }
      }
    };

    // Set up pack size change tracking
    const handlePackSizeChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (target.id === 'pack-size' && analyticsRef.current) {
        analyticsRef.current.trackPackSizeChange(productId, target.value);
      }
    };

    // Set up price sort tracking
    const handlePriceSort = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (target.id === 'price-sort' && analyticsRef.current) {
        analyticsRef.current.trackPriceSort(productId, target.value);
      }
    };

    // Add event listeners
    document.addEventListener('click', handleVendorClick);
    document.addEventListener('change', handlePackSizeChange);
    document.addEventListener('change', handlePriceSort);

    // Track initial comparison view
    if (analyticsRef.current) {
      const vendorCards = document.querySelectorAll('.vendor-card[data-vendor-id]');
      const vendorList = Array.from(vendorCards).map(card => {
        const vendorData = extractVendorData(card as HTMLElement);
        return vendorData;
      }).filter(Boolean) as VendorData[];

      analyticsRef.current.trackComparisonView(productId, vendorList.length, vendorList);
    }

    // Cleanup
    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleVendorClick);
      document.removeEventListener('change', handlePackSizeChange);
      document.removeEventListener('change', handlePriceSort);
    };
  }, [productId, productName, region]);

  // Extract vendor data from DOM element
  function extractVendorData(vendorCard: HTMLElement): VendorData | null {
    const vendorId = vendorCard.dataset.vendorId;
    const vendorName = vendorCard.dataset.vendorName;
    const priceElement = vendorCard.querySelector('.price-display');
    const packSizeElement = vendorCard.querySelector('.pack-size-display');
    
    if (!vendorId || !vendorName) return null;

    const priceText = priceElement?.textContent || '0';
    const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    
    const packSizeText = packSizeElement?.textContent || '1';
    const packSize = parseInt(packSizeText.replace(/[^0-9]/g, '')) || 1;
    
    const currency = priceText.includes('$') ? 'USD' : 'GBP';

    return {
      vendor_id: vendorId,
      vendor_name: vendorName,
      price: price,
      pack_size: packSize,
      currency: currency
    };
  }

  // Expose analytics instance for manual tracking
  useEffect(() => {
    if (analyticsRef.current) {
      (window as any).vendorAnalytics = analyticsRef.current;
    }
  }, [isInitialized]);

  return null; // This component doesn't render anything
}

// Export the class for manual use
export { VendorAnalytics };
