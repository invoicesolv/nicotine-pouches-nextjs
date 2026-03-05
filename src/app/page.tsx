import { Metadata } from 'next';
import Header from '@/components/Header';
import HomepageHero from '@/components/HomepageHero';
import { CTASection } from '@/components/ui/hero-dithering-card';
import HomepageBrandLogos from '@/components/HomepageBrandLogos';
import DynamicProductSections from '@/components/DynamicProductSections';
import SymmetricalContentSection from '@/components/SymmetricalContentSection';
import GuidesSection from '@/components/GuidesSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FAQSchema from '@/components/FAQSchema';
import { getSEOTags, renderSchemaTag } from '@/lib/seo-core';
import { getHomepageSEOTemplate } from '@/lib/seo-templates';
import { supabase } from '@/lib/supabase';
import { getFullUrl } from '@/config/seo-config';

export const metadata: Metadata = getSEOTags('homepage', getHomepageSEOTemplate());

// Enable aggressive caching for better performance
export const revalidate = 3600; // Revalidate every hour
export const fetchCache = 'force-cache'; // Force cache for all fetch requests

// Fetch products for ItemList schema - same products shown in carousel
async function getHomepageProducts() {
  try {
    // Get vendor IDs for Snusifer and Emerald (they pay us, prioritize them)
    const { data: priorityVendors } = await supabase()
      .from('vendors')
      .select('id')
      .in('name', ['Snusifer', 'Emeraldpods']);
    
    const priorityVendorIds = priorityVendors?.map((v: any) => v.id) || [5085, 9];
    
    // Fetch products available from priority vendors (Snusifer/Emerald)
    const { data: priorityMappings } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id')
      .in('vendor_id', priorityVendorIds);
    
    // Fetch products for schema - only need 20 displayed, fetch 30 for filtering buffer
    const { data: wpProducts, error: wpError } = await supabase()
      .from('wp_products')
      .select('id, name, image_url, price, content')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (wpError) {
      console.error('Error fetching products for ItemList:', wpError);
      return [];
    }
    
    if (!wpProducts || wpProducts.length === 0) {
      console.warn('No products found for ItemList schema');
      return [];
    }
    
    // Fetch all mappings for products with price data
    const productIds = wpProducts.map((p: any) => p.id);
    const { data: mappings } = await supabase()
      .from('vendor_product_mapping')
      .select('product_id, vendor_id, price')
      .in('product_id', productIds);
    
    // Count stores per product, identify priority products, and get price range
    const storeCounts = new Map<number, number>();
    const isPriorityProduct = new Map<number, boolean>();
    const priceRanges = new Map<number, { low: number; high: number }>();
    
    mappings?.forEach((mapping: any) => {
      const count = storeCounts.get(mapping.product_id) || 0;
      storeCounts.set(mapping.product_id, count + 1);
      
      if (priorityVendorIds.includes(mapping.vendor_id)) {
        isPriorityProduct.set(mapping.product_id, true);
      }
      
      // Track price ranges
      if (mapping.price) {
        const price = parseFloat(String(mapping.price).replace(/[£$]/g, ''));
        if (!isNaN(price)) {
          const existing = priceRanges.get(mapping.product_id) || { low: price, high: price };
          priceRanges.set(mapping.product_id, {
            low: Math.min(existing.low, price),
            high: Math.max(existing.high, price)
          });
        }
      }
    });
    
    // Process products with full details
    const processedProducts = wpProducts.map((product: any) => {
      const prices = priceRanges.get(product.id) || { low: 2.99, high: 9.99 };
      return {
      id: product.id,
      name: product.name,
        image_url: product.image_url,
        description: product.content,
      store_count: storeCounts.get(product.id) || 0,
        isPriority: isPriorityProduct.get(product.id) || false,
        lowPrice: prices.low.toFixed(2),
        highPrice: prices.high.toFixed(2)
      };
    });
    
    // Separate priority products and others
    const priorityProducts = processedProducts.filter((p: any) => p.isPriority);
    const otherProducts = processedProducts.filter((p: any) => !p.isPriority);
    
    // Sort priority products by store count (highest first)
    priorityProducts.sort((a: any, b: any) => (b.store_count || 0) - (a.store_count || 0));
    otherProducts.sort((a: any, b: any) => (b.store_count || 0) - (a.store_count || 0));
    
    // Combine: priority products first, then others (same as carousel)
    const combinedProducts = [...priorityProducts, ...otherProducts];
    
    // Take first 20 products (same as carousel displays)
    const carouselProducts = combinedProducts.slice(0, 20);
    
    // Generate slug from product name
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    };
    
    // Get local image path
    const getLocalImagePath = (imageUrl: string | undefined, productId: number, productName: string) => {
      if (!imageUrl) return `${getFullUrl('/placeholder-product.svg')}`;
      
      // If already a local path, use it
      if (imageUrl.startsWith('/wordpress-images/') || imageUrl.startsWith('/uploads/')) {
        return getFullUrl(imageUrl);
      }
      
      // Generate local path from product info
      const safeName = productName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      return getFullUrl(`/wordpress-images/product_${productId}_${safeName}.jpg`);
    };
    
    const items = carouselProducts.map((product: any) => ({
      name: product.name || 'Unknown Product',
      url: getFullUrl(`/product/${generateSlug(product.name)}`),
      image: getLocalImagePath(product.image_url, product.id, product.name),
      description: product.description ? 
        product.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
        `Compare prices for ${product.name} from ${product.store_count || 1} UK retailers`,
      brand: product.name ? product.name.split(' ')[0] : 'Unknown',
      lowPrice: product.lowPrice,
      highPrice: product.highPrice,
      storeCount: product.store_count || 1,
      currency: 'GBP'
    })).filter(item => item.name && item.url);
    
    console.log(`ItemList: Generated ${items.length} items with full product data`);
    return items;
  } catch (error) {
    console.error('Error in getHomepageProducts:', error);
    return [];
  }
}

export default async function Home() {
  // Fetch products for ItemList schema
  const products = await getHomepageProducts();
  console.log('Homepage products for ItemList:', products.length);
  
  return (
    <>
      {/* Organization Schema */}
      {renderSchemaTag('organization', {})}
      
      {/* Website Schema */}
      {renderSchemaTag('website', {})}
      
      {/* ItemList Schema */}
      {products.length > 0 ? renderSchemaTag('itemList', {
        numberOfItems: products.length,
        items: products,
        startPage: getFullUrl('/')
      }) : null}
      
      <div id="boxed-wrapper" className="page-transition" suppressHydrationWarning>
        <div id="wrapper" className="fusion-wrapper" suppressHydrationWarning>

          {/* Header */}
          <Header />

        <main id="main-content" suppressHydrationWarning>
          {/* Homepage Hero */}
          <div className="fade-in">
            <CTASection />
          </div>

          {/* Brand Logos */}
          <HomepageBrandLogos />

          {/* Product Section */}
          <DynamicProductSections />

          {/* Symmetrical Content Section with TOC */}
          <SymmetricalContentSection />

          {/* Guides Section */}
          <GuidesSection />
        </main>

        {/* Footer */}
        <Footer />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
        
        {/* FAQ Schema - moved to head */}
        <FAQSchema />
        </div>
      </div>
    </>
  );
}
