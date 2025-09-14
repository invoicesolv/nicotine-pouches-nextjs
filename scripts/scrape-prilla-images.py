#!/usr/bin/env python3

import csv
import requests
from bs4 import BeautifulSoup
import os
import time
import re
from urllib.parse import urljoin, urlparse
import json

def extract_product_image(page_url):
    """Extract product image from a product page"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(page_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for product images in various common selectors
        image_selectors = [
            'img[class*="product"]',
            'img[class*="main"]',
            'img[class*="featured"]',
            '.product-image img',
            '.main-image img',
            '.featured-image img',
            '.woocommerce-product-gallery img',
            '.product-gallery img',
            'img[src*="product"]',
            'img[src*="wp-content"]',
            'img[src*="prilla"]',
            '.wp-post-image',
            '.attachment-woocommerce_single'
        ]
        
        for selector in image_selectors:
            images = soup.select(selector)
            for img in images:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src and ('product' in src.lower() or 'wp-content' in src.lower() or 'prilla' in src.lower()):
                    # Convert relative URLs to absolute
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(page_url, src)
                    elif not src.startswith('http'):
                        src = urljoin(page_url, src)
                    
                    # Skip placeholder images
                    if any(placeholder in src.lower() for placeholder in ['placeholder', 'no-image', 'default', 'blank']):
                        continue
                        
                    print(f"Found image for {page_url}: {src}")
                    return src
        
        print(f"No image found for {page_url}")
        return None
        
    except Exception as e:
        print(f"Error extracting image from {page_url}: {e}")
        return None

def main():
    # Read CSV file and extract first 10 products for testing
    csv_file = 'buy-2one-chewy-watermelon-8mg---order-online---save-up-to-19----prilla-com-2025-09-11T19-48-11-943Z.csv'
    
    product_images = {}
    
    with open(csv_file, 'r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        
        for i, row in enumerate(reader):
            if i >= 10:  # Test with first 10 products
                break
                
            page_url = row['PAGE URL']
            product_title = row['Product Title']
            brand = row['Brand']
            
            print(f"\nProcessing {i+1}: {product_title}")
            
            # Extract image URL
            image_url = extract_product_image(page_url)
            
            if image_url:
                product_images[product_title] = {
                    'image_url': image_url,
                    'brand': brand
                }
            else:
                product_images[product_title] = {
                    'image_url': None,
                    'brand': brand
                }
            
            # Be respectful with requests
            time.sleep(2)
    
    # Save mapping to JSON file
    with open('prilla_image_urls.json', 'w') as f:
        json.dump(product_images, f, indent=2)
    
    print(f"\nProcessed {len(product_images)} products")
    print(f"Image mapping saved to: prilla_image_urls.json")

if __name__ == "__main__":
    main()
