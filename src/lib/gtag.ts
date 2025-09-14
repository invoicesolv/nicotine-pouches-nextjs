// Google Analytics 4 integration
// Based on the WordPress vendor plugin measurement ID: G-9FT722JELW

import { VENDOR_ANALYTICS_CONFIG } from '@/config/vendor-analytics';

export const GA_MEASUREMENT_ID = VENDOR_ANALYTICS_CONFIG.GA_MEASUREMENT_ID;

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
};

// Track page view
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Handle both full URLs and pathnames
  let pageLocation: string;
  let pagePath: string;

  if (url.startsWith('http')) {
    // Full URL provided
    pageLocation = url;
    pagePath = new URL(url).pathname;
  } else {
    // Pathname provided, construct full URL
    pageLocation = window.location.origin + url;
    pagePath = url;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: title || document.title,
    page_location: pageLocation,
    page_path: pagePath,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters: {
    event_category?: string;
    event_label?: string;
    value?: number;
    currency?: string;
    vendor_id?: string;
    vendor_name?: string;
    product_id?: string;
    product_name?: string;
    pack_size?: number;
    price?: number;
    session_id?: string;
    [key: string]: any;
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    ...parameters,
    // Add custom parameters for vendor tracking
    custom_map: {
      vendor_id: 'custom_parameter_1',
      vendor_name: 'custom_parameter_2',
      product_id: 'custom_parameter_3',
      product_name: 'custom_parameter_4',
      pack_size: 'custom_parameter_5',
      session_id: 'custom_parameter_6',
    },
  });
};

// Vendor-specific tracking functions (exact same as WordPress plugin)

// Track vendor exposure
export const trackVendorExposure = (vendorData: {
  vendor_id: string;
  vendor_name: string;
  product_id: string;
  product_name: string;
  price: number;
  currency: string;
  pack_size: number;
  session_id: string;
}) => {
  trackEvent('vendor_exposure', {
    event_category: 'vendor_exposure',
    event_label: `vendor_${vendorData.vendor_id}_exposed`,
    vendor_id: vendorData.vendor_id,
    vendor_name: vendorData.vendor_name,
    product_id: vendorData.product_id,
    product_name: vendorData.product_name,
    value: vendorData.price,
    currency: vendorData.currency,
    pack_size: vendorData.pack_size,
    session_id: vendorData.session_id,
  });
};

// Track vendor click
export const trackVendorClick = (vendorData: {
  vendor_id: string;
  vendor_name: string;
  product_id: string;
  product_name: string;
  price: number;
  currency: string;
  pack_size: number;
  session_id: string;
}) => {
  trackEvent('vendor_click', {
    event_category: 'vendor_interaction',
    event_label: `vendor_${vendorData.vendor_id}`,
    vendor_id: vendorData.vendor_id,
    vendor_name: vendorData.vendor_name,
    product_id: vendorData.product_id,
    product_name: vendorData.product_name,
    value: vendorData.price,
    currency: vendorData.currency,
    pack_size: vendorData.pack_size,
    session_id: vendorData.session_id,
  });
};

// Track vendor conversion (purchase click)
export const trackVendorConversion = (vendorData: {
  vendor_id: string;
  vendor_name: string;
  product_id: string;
  product_name: string;
  price: number;
  currency: string;
  pack_size: number;
  session_id: string;
}) => {
  trackEvent('purchase', {
    event_category: 'vendor_interaction',
    event_label: `vendor_${vendorData.vendor_id}`,
    vendor_id: vendorData.vendor_id,
    vendor_name: vendorData.vendor_name,
    product_id: vendorData.product_id,
    product_name: vendorData.product_name,
    value: vendorData.price,
    currency: vendorData.currency,
    pack_size: vendorData.pack_size,
    session_id: vendorData.session_id,
  });
};

// Track pack size change
export const trackPackSizeChange = (productId: string, packSize: number, sessionId: string) => {
  trackEvent('pack_size_change', {
    event_category: 'user_interaction',
    event_label: `pack_size_${packSize}`,
    product_id: productId,
    pack_size: packSize,
    session_id: sessionId,
  });
};

// Track price sort change
export const trackPriceSort = (productId: string, sortType: string, sessionId: string) => {
  trackEvent('price_sort', {
    event_category: 'user_interaction',
    event_label: `price_sort_${sortType}`,
    product_id: productId,
    sort_type: sortType,
    session_id: sessionId,
  });
};

// Track comparison view
export const trackComparisonView = (
  productId: string,
  vendorCount: number,
  sessionId: string
) => {
  trackEvent('comparison_view', {
    event_category: 'page_interaction',
    event_label: `comparison_${vendorCount}_vendors`,
    product_id: productId,
    vendor_count: vendorCount,
    session_id: sessionId,
  });
};
