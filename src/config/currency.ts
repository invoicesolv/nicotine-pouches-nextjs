// Currency Configuration
export const CURRENCY_CONFIG = {
  // Default exchange rates (EUR to GBP)
  // Can be updated via environment variable or API
  DEFAULT_EUR_TO_GBP_RATE: parseFloat(process.env.EUR_TO_GBP_RATE || '0.85'),
  
  // Supported currencies
  SUPPORTED_CURRENCIES: ['GBP', 'EUR', 'USD'] as const,
  
  // Default currency for UK region
  DEFAULT_CURRENCY: 'GBP' as const,
  
  // Currency symbols
  CURRENCY_SYMBOLS: {
    'GBP': '£',
    'EUR': '€',
    'USD': '$'
  } as const,
  
  // Exchange rate cache duration (in milliseconds)
  EXCHANGE_RATE_CACHE_DURATION: 60 * 60 * 1000, // 1 hour
  
  // Whether to use live exchange rate API (optional)
  USE_LIVE_EXCHANGE_RATE: process.env.USE_LIVE_EXCHANGE_RATE === 'true',
  
  // Exchange rate API endpoint (optional)
  EXCHANGE_RATE_API_URL: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/EUR',
};

// Helper function to get exchange rate
export async function getExchangeRate(from: string = 'EUR', to: string = 'GBP'): Promise<number> {
  if (from === to) return 1;
  
  if (CURRENCY_CONFIG.USE_LIVE_EXCHANGE_RATE && from === 'EUR' && to === 'GBP') {
    try {
      const response = await fetch(CURRENCY_CONFIG.EXCHANGE_RATE_API_URL);
      const data = await response.json();
      return data.rates?.[to] || CURRENCY_CONFIG.DEFAULT_EUR_TO_GBP_RATE;
    } catch (error) {
      console.error('Error fetching live exchange rate:', error);
      return CURRENCY_CONFIG.DEFAULT_EUR_TO_GBP_RATE;
    }
  }
  
  // Use default rate for EUR to GBP
  if (from === 'EUR' && to === 'GBP') {
    return CURRENCY_CONFIG.DEFAULT_EUR_TO_GBP_RATE;
  }
  
  return 1;
}

