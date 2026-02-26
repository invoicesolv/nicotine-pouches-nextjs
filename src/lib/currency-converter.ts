import { getExchangeRate, CURRENCY_CONFIG } from '@/config/currency';

/**
 * Converts a price from one currency to another
 * @param price - The price value (can be string with currency symbol or number)
 * @param fromCurrency - Source currency (default: EUR)
 * @param toCurrency - Target currency (default: GBP)
 * @returns Converted price as number
 */
export async function convertCurrency(
  price: string | number,
  fromCurrency: string = 'EUR',
  toCurrency: string = 'GBP'
): Promise<number> {
  if (fromCurrency === toCurrency) {
    // No conversion needed
    return parsePrice(price);
  }
  
  const basePrice = parsePrice(price);
  if (isNaN(basePrice) || basePrice === 0) {
    return 0;
  }
  
  const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
  return basePrice * exchangeRate;
}

/**
 * Converts a price synchronously using cached/default rate
 * Use this for client-side rendering where async is not ideal
 * @param price - The price value
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted price as number
 */
export function convertCurrencySync(
  price: string | number,
  fromCurrency: string = 'EUR',
  toCurrency: string = 'GBP'
): number {
  if (fromCurrency === toCurrency) {
    return parsePrice(price);
  }
  
  const basePrice = parsePrice(price);
  if (isNaN(basePrice) || basePrice === 0) {
    return 0;
  }
  
  // Use default rate for synchronous conversion
  if (fromCurrency === 'EUR' && toCurrency === 'GBP') {
    return basePrice * CURRENCY_CONFIG.DEFAULT_EUR_TO_GBP_RATE;
  }
  
  return basePrice;
}

/**
 * Formats a price with currency symbol
 * @param price - The price value
 * @param currency - Currency code (default: GBP)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, currency: string = 'GBP'): string {
  const priceNum = typeof price === 'string' ? parsePrice(price) : price;
  const symbol = CURRENCY_CONFIG.CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_CONFIG.CURRENCY_SYMBOLS] || '£';
  return `${symbol}${priceNum.toFixed(2)}`;
}

/**
 * Parses a price string to number, removing currency symbols and formatting
 * @param price - Price string or number
 * @returns Parsed price as number
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') {
    return price;
  }
  
  if (!price || price === 'N/A' || price === '') {
    return 0;
  }
  
  // Remove currency symbols and whitespace
  const cleaned = price
    .replace(/[£€$]/g, '')
    .replace(/,/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converts vendor product prices from EUR to GBP if vendor needs conversion
 * @param vendor - Vendor object with currency and needs_currency_conversion fields
 * @param prices - Object with price fields (price_1pack, price_5pack, etc.)
 * @returns Object with converted prices
 */
export function convertVendorPrices(
  vendor: { currency?: string; needs_currency_conversion?: boolean } | null,
  prices: Record<string, string | number | null | undefined>
): Record<string, string> {
  if (!vendor || !vendor.needs_currency_conversion || vendor.currency !== 'EUR') {
    // No conversion needed, return prices as-is
    return Object.fromEntries(
      Object.entries(prices).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : value ? formatPrice(value) : ''
      ])
    );
  }
  
  // Convert all prices from EUR to GBP
  const converted: Record<string, string> = {};
  for (const [key, value] of Object.entries(prices)) {
    if (value && value !== 'N/A' && value !== '') {
      const convertedPrice = convertCurrencySync(value, 'EUR', 'GBP');
      converted[key] = formatPrice(convertedPrice, 'GBP');
    } else {
      converted[key] = '';
    }
  }
  
  return converted;
}

/**
 * Converts a single price value if vendor needs conversion
 * @param vendor - Vendor object
 * @param price - Price value
 * @returns Converted price string
 */
export function convertVendorPrice(
  vendor: { currency?: string; needs_currency_conversion?: boolean } | null,
  price: string | number | null | undefined
): string {
  if (!price || price === 'N/A' || price === '') {
    return 'N/A';
  }
  
  if (!vendor || !vendor.needs_currency_conversion || vendor.currency !== 'EUR') {
    // If price is a string, check if it has a currency symbol
    if (typeof price === 'string') {
      // Check if price already has a currency symbol
      if (/^[£€$]/.test(price.trim())) {
        return price; // Already has currency symbol
      }
      // No currency symbol, add one based on vendor currency or default to GBP
      const vendorCurrency = vendor?.currency || 'GBP';
      const priceNum = parsePrice(price);
      return formatPrice(priceNum, vendorCurrency);
    }
    // Price is a number, format it
    const vendorCurrency = vendor?.currency || 'GBP';
    return formatPrice(price, vendorCurrency);
  }
  
  const converted = convertCurrencySync(price, 'EUR', 'GBP');
  return formatPrice(converted, 'GBP');
}

