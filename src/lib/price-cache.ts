// Price caching utility for vendor prices
interface CachedPrice {
  price: string;
  timestamp: number;
  vendor: string;
  vendorId: string;
}

interface PriceCacheEntry {
  [productId: string]: CachedPrice;
}

class PriceCache {
  private cache: PriceCacheEntry = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly STORAGE_KEY = 'nicotine_pouches_price_cache';

  constructor() {
    this.loadFromStorage();
  }

  // Load cache from localStorage
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired entries
        const now = Date.now();
        this.cache = {};
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          if (now - value.timestamp < this.CACHE_DURATION) {
            this.cache[key] = value;
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load price cache from storage:', error);
      this.cache = {};
    }
  }

  // Save cache to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save price cache to storage:', error);
    }
  }

  // Get cached price for a product
  get(productId: number): CachedPrice | null {
    const cached = this.cache[productId.toString()];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      // Cache expired, remove it
      delete this.cache[productId.toString()];
      this.saveToStorage();
      return null;
    }

    return cached;
  }

  // Set cached price for a product
  set(productId: number, price: string, vendor: string, vendorId: string) {
    this.cache[productId.toString()] = {
      price,
      timestamp: Date.now(),
      vendor,
      vendorId
    };
    this.saveToStorage();
  }

  // Get all cached prices for multiple products
  getMultiple(productIds: number[]): Map<number, CachedPrice> {
    const result = new Map<number, CachedPrice>();
    const now = Date.now();
    const expiredKeys: string[] = [];

    productIds.forEach(id => {
      const cached = this.cache[id.toString()];
      if (cached && now - cached.timestamp < this.CACHE_DURATION) {
        result.set(id, cached);
      } else if (cached) {
        expiredKeys.push(id.toString());
      }
    });

    // Clean up expired entries
    if (expiredKeys.length > 0) {
      expiredKeys.forEach(key => delete this.cache[key]);
      this.saveToStorage();
    }

    return result;
  }

  // Clear all cache
  clear() {
    this.cache = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const valid = Object.values(this.cache).filter(
      entry => now - entry.timestamp < this.CACHE_DURATION
    ).length;
    const expired = Object.values(this.cache).filter(
      entry => now - entry.timestamp >= this.CACHE_DURATION
    ).length;

    return {
      total: Object.keys(this.cache).length,
      valid,
      expired,
      hitRate: valid / (valid + expired) || 0
    };
  }
}

// Export singleton instance
export const priceCache = new PriceCache();

// Cache warming function for popular products
export async function warmPriceCache(
  productIds: number[], 
  isUSRoute: boolean,
  supabase: any
): Promise<void> {
  try {
    // Only warm cache for products that aren't already cached
    const uncachedIds = productIds.filter(id => !priceCache.get(id));
    
    if (uncachedIds.length === 0) {
      return; // All products already cached
    }

    // Fetch and cache prices in background
    await fetchAndCachePrices(uncachedIds, isUSRoute, supabase);
    
    console.log(`Warmed price cache for ${uncachedIds.length} products`);
  } catch (error) {
    console.warn('Failed to warm price cache:', error);
  }
}

// Helper function to get price from wp_products
export function getProductPrice(product: any, currencySymbol: string = '£'): string {
  if (!product) {
    return `${currencySymbol}2.99`;
  }

  const productPrice = parseFloat(product.price) || 0;
  return productPrice > 0 
    ? `${currencySymbol}${productPrice.toFixed(2)}`
    : `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
}

// Helper function to fetch and cache prices for multiple products
export async function fetchAndCachePrices(
  productIds: number[], 
  isUSRoute: boolean,
  supabase: any
): Promise<Map<number, string>> {
  const currencySymbol = isUSRoute ? '$' : '£';
  const priceMap = new Map<number, string>();
  
  // Get cached prices first
  const cachedPrices = priceCache.getMultiple(productIds);
  const uncachedIds: number[] = [];

  productIds.forEach(id => {
    const cached = cachedPrices.get(id);
    if (cached) {
      priceMap.set(id, cached.price);
    } else {
      uncachedIds.push(id);
    }
  });

  // If all prices are cached, return immediately
  if (uncachedIds.length === 0) {
    return priceMap;
  }

  // Fetch uncached prices from wp_products table
  try {
    console.log('Fetching prices for product IDs:', uncachedIds);
    
    const { data: products, error } = await supabase()
      .from('wp_products')
      .select('id, name, price')
      .in('id', uncachedIds);

    console.log('Products query result:', { products, error });

    if (error) {
      console.error('Error fetching product prices:', error);
      // Fallback to random prices for uncached products
      uncachedIds.forEach(id => {
        const price = `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
        priceMap.set(id, price);
      });
      return priceMap;
    }

    // Process each uncached product
    uncachedIds.forEach(productId => {
      const product = products?.find((p: any) => p.id === productId);
      if (!product) {
        // Fallback price if product not found
        const price = `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
        priceMap.set(productId, price);
        return;
      }

      // Use the price from wp_products table, or default price
      const productPrice = parseFloat(product.price) || 0;
      const finalPrice = productPrice > 0 
        ? `${currencySymbol}${productPrice.toFixed(2)}`
        : `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
      
      // Cache the result
      priceCache.set(productId, finalPrice, 'Direct', 'direct');
      priceMap.set(productId, finalPrice);
    });

  } catch (error) {
    console.error('Error in fetchAndCachePrices:', error);
    // Fallback to random prices for uncached products
    uncachedIds.forEach(id => {
      const price = `${currencySymbol}${(2.99 + Math.random() * 2).toFixed(2)}`;
      priceMap.set(id, price);
    });
  }

  return priceMap;
}
