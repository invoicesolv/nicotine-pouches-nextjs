// Utility functions for image handling
import React from 'react';

/**
 * Converts a Supabase image URL to a local uploads path
 * @param imageUrl - The original image URL from Supabase
 * @param productId - The product ID for generating local filename
 * @param productName - The product name for generating local filename
 * @returns Local image path or original URL if conversion fails
 */
export function getLocalImagePath(
  imageUrl: string | null | undefined, 
  productId: number, 
  productName: string
): string {
  if (!imageUrl) {
    return '/placeholder-product.svg';
  }

  // If it's already a local path, return as is
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }

  // If it's a Supabase URL, convert to local path
  if (imageUrl.includes('supabase.co')) {
    const cleanName = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const extension = imageUrl.includes('.png') ? '.png' : '.jpg';
    return `/uploads/products/product_${productId}_${cleanName}${extension}`;
  }

  // For other URLs, return as is
  return imageUrl;
}

/**
 * Checks if a local image file exists
 * @param imagePath - The local image path
 * @returns Promise<boolean> - Whether the file exists
 */
export async function checkLocalImageExists(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the fallback image path
 * @returns string - The fallback image path
 */
export function getFallbackImagePath(): string {
  return '/placeholder-product.svg';
}

/**
 * Gets image styles for Next.js Image component
 * @param imageUrl - The image URL
 * @returns object - Style object for the image
 */
export function getImageStyles(imageUrl: string): React.CSSProperties {
  return {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '8px'
  };
}