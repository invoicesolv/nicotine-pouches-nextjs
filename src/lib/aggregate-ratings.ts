import { supabase } from '@/lib/supabase';
import { SEO_CONFIG } from '@/config/seo-config';

export interface AggregateRating {
  "@type": "AggregateRating";
  "ratingValue": string;
  "reviewCount": number;
  "bestRating": "5";
  "worstRating": "1";
}

export interface ProductRatingData {
  productId: number;
  ratingValue: number;
  reviewCount: number;
  aggregateRating: AggregateRating;
}

export interface BrandRatingData {
  brandName: string;
  ratingValue: number;
  reviewCount: number;
  productCount: number;
  aggregateRating: AggregateRating;
}

export interface VendorRatingData {
  vendorId: number;
  ratingValue: number;
  reviewCount: number;
  aggregateRating: AggregateRating;
}

/**
 * Get aggregate rating for a specific product
 */
export async function getProductAggregateRating(productId: number): Promise<ProductRatingData | null> {
  try {
    const { data: reviews, error } = await supabase()
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching product reviews:', error);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      // Return default rating if no reviews
      return {
        productId,
        ratingValue: 4.5,
        reviewCount: 0,
        aggregateRating: {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": 0,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    }

    const ratingValue = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    return {
      productId,
      ratingValue,
      reviewCount,
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": ratingValue.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  } catch (error) {
    console.error('Error in getProductAggregateRating:', error);
    return null;
  }
}

/**
 * Get aggregate rating for all products of a brand
 */
export async function getBrandAggregateRating(brandName: string): Promise<BrandRatingData | null> {
  try {
    // First get all products for this brand
    const { data: products, error: productsError } = await supabase()
      .from('wp_products')
      .select('id')
      .ilike('name', `${brandName}%`);

    if (productsError || !products || products.length === 0) {
      console.error('Error fetching brand products:', productsError);
      return null;
    }

    const productIds = products.map((p: any) => p.id);

    // Get all reviews for these products
    const { data: reviews, error: reviewsError } = await supabase()
      .from('reviews')
      .select('rating')
      .in('product_id', productIds)
      .eq('is_approved', true);

    if (reviewsError) {
      console.error('Error fetching brand reviews:', reviewsError);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      // Return default rating if no reviews
      return {
        brandName,
        ratingValue: 4.5,
        reviewCount: 0,
        productCount: products.length,
        aggregateRating: {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": 0,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    }

    const ratingValue = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    return {
      brandName,
      ratingValue,
      reviewCount,
      productCount: products.length,
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": ratingValue.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  } catch (error) {
    console.error('Error in getBrandAggregateRating:', error);
    return null;
  }
}

/**
 * Get aggregate rating for a vendor across all products
 */
export async function getVendorAggregateRating(vendorId: number): Promise<VendorRatingData | null> {
  try {
    const { data: reviews, error } = await supabase()
      .from('reviews')
      .select('rating')
      .eq('vendor_id', vendorId)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching vendor reviews:', error);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      // Return default rating if no reviews
      return {
        vendorId,
        ratingValue: 4.5,
        reviewCount: 0,
        aggregateRating: {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": 0,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    }

    const ratingValue = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    return {
      vendorId,
      ratingValue,
      reviewCount,
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": ratingValue.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  } catch (error) {
    console.error('Error in getVendorAggregateRating:', error);
    return null;
  }
}

/**
 * Get aggregate rating for multiple products at once (for performance)
 */
export async function getMultipleProductRatings(productIds: number[]): Promise<Map<number, ProductRatingData>> {
  const ratingsMap = new Map<number, ProductRatingData>();
  
  try {
    const { data: reviews, error } = await supabase()
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', productIds)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching multiple product reviews:', error);
      return ratingsMap;
    }

    // Group reviews by product ID
    const reviewsByProduct = new Map<number, number[]>();
    reviews?.forEach((review: any) => {
      if (!reviewsByProduct.has(review.product_id)) {
        reviewsByProduct.set(review.product_id, []);
      }
      reviewsByProduct.get(review.product_id)!.push(review.rating);
    });

    // Calculate ratings for each product
    productIds.forEach(productId => {
      const productReviews = reviewsByProduct.get(productId) || [];
      
      if (productReviews.length === 0) {
        ratingsMap.set(productId, {
          productId,
          ratingValue: 4.5,
          reviewCount: 0,
          aggregateRating: {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "reviewCount": 0,
            "bestRating": "5",
            "worstRating": "1"
          }
        });
      } else {
        const ratingValue = productReviews.reduce((sum, rating) => sum + rating, 0) / productReviews.length;
        ratingsMap.set(productId, {
          productId,
          ratingValue,
          reviewCount: productReviews.length,
          aggregateRating: {
            "@type": "AggregateRating",
            "ratingValue": ratingValue.toFixed(1),
            "reviewCount": productReviews.length,
            "bestRating": "5",
            "worstRating": "1"
          }
        });
      }
    });

    return ratingsMap;
  } catch (error) {
    console.error('Error in getMultipleProductRatings:', error);
    return ratingsMap;
  }
}

/**
 * Get aggregate rating for all products available in a city
 */
export async function getCityAggregateRating(cityName: string): Promise<ProductRatingData | null> {
  try {
    // Get all products (they're available nationwide in UK)
    const { data: products, error } = await supabase()
      .from('wp_products')
      .select('id');
      
    if (error || !products) {
      console.error('Error fetching products for city rating:', error);
      return null;
    }
    
    const productIds = products.map((p: any) => p.id);
    
    // Get all reviews for products available in this city
    const { data: reviews, error: reviewsError } = await supabase()
      .from('reviews')
      .select('rating')
      .in('product_id', productIds)
      .eq('is_approved', true);
      
    if (reviewsError) {
      console.error('Error fetching city reviews:', reviewsError);
      return null;
    }
    
    if (!reviews || reviews.length === 0) {
      // Return default rating if no reviews
      return {
        productId: 0,
        ratingValue: 4.5,
        reviewCount: 0,
        aggregateRating: {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": 0,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    }
    
    const ratingValue = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
    
    return {
      productId: 0,
      ratingValue,
      reviewCount: reviews.length,
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": ratingValue.toFixed(1),
        "reviewCount": reviews.length,
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  } catch (error) {
    console.error('Error in getCityAggregateRating:', error);
    return null;
  }
}
