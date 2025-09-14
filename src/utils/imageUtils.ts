/**
 * Utility functions for image handling
 */

/**
 * Detects if an image URL is a PNG format
 * @param imageUrl - The image URL to check
 * @returns boolean - true if the image is PNG, false otherwise
 */
export function isPngImage(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  // Check file extension
  const url = imageUrl.toLowerCase();
  return url.includes('.png') || url.endsWith('.png');
}

/**
 * Gets the appropriate border radius for an image based on its format
 * @param imageUrl - The image URL to check
 * @returns string - CSS border radius value
 */
export function getImageBorderRadius(imageUrl: string): string {
  return isPngImage(imageUrl) ? '0px' : '5px';
}

/**
 * Gets the appropriate image styling based on format
 * @param imageUrl - The image URL to check
 * @returns object - CSS style object for the image
 */
export function getImageStyles(imageUrl: string): React.CSSProperties {
  return {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: getImageBorderRadius(imageUrl)
  };
}
