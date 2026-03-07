// Vendor Analytics Configuration
export const VENDOR_ANALYTICS_CONFIG = {
  // CRM API Configuration
  CRM_API_URL: process.env.CRM_API_URL || '',
  CRM_WORKSPACE_ID: process.env.CRM_WORKSPACE_ID || '',
  VENDOR_SYNC_ENABLED: process.env.VENDOR_SYNC_ENABLED === 'true',
  
  // Google Analytics Configuration
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9FT722JELW', // Same as WordPress plugin
  
  // Analytics Settings
  EXPOSURE_THRESHOLD: 0.5, // 50% of vendor card must be visible
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Event Types
  EVENT_TYPES: {
    VENDOR_EXPOSURE: 'vendor_exposure',
    VENDOR_CLICK: 'vendor_click',
    PACK_SIZE_CHANGE: 'pack_size_change',
    PRICE_SORT: 'price_sort',
    COMPARISON_VIEW: 'comparison_view'
  },
  
  // Currency Mapping
  CURRENCY_SYMBOLS: {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'SEK': 'kr'
  },
  
  // Region Detection
  REGION_MAPPING: {
    'GBP': 'UK',
    'USD': 'US',
    'EUR': 'EU',
    'SEK': 'SE'
  }
};

// Helper functions
export const getCurrencySymbol = (currency: string): string => {
  return VENDOR_ANALYTICS_CONFIG.CURRENCY_SYMBOLS[currency as keyof typeof VENDOR_ANALYTICS_CONFIG.CURRENCY_SYMBOLS] || currency;
};

export const getRegionFromCurrency = (currency: string): string => {
  return VENDOR_ANALYTICS_CONFIG.REGION_MAPPING[currency as keyof typeof VENDOR_ANALYTICS_CONFIG.REGION_MAPPING] || 'UK';
};

export const isVendorSyncEnabled = (): boolean => {
  return VENDOR_ANALYTICS_CONFIG.VENDOR_SYNC_ENABLED && 
         !!VENDOR_ANALYTICS_CONFIG.CRM_API_URL && 
         !!VENDOR_ANALYTICS_CONFIG.CRM_WORKSPACE_ID;
};
