#!/usr/bin/env python3

import csv
import requests
from bs4 import BeautifulSoup
import os
import time
import re
from urllib.parse import urljoin, urlparse
import json

def download_image(url, filename, folder):
    """Download an image from URL to local folder"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        filepath = os.path.join(folder, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

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
            'img[src*="wp-content"]'
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
                        
                    return src
        
        return None
        
    except Exception as e:
        print(f"Error extracting image from {page_url}: {e}")
        return None

def main():
    # Create US product images directory
    us_images_dir = 'public/product-images/us'
    os.makedirs(us_images_dir, exist_ok=True)
    
    # Read CSV file
    csv_file = 'buy-2one-chewy-watermelon-8mg---order-online---save-up-to-19----prilla-com-2025-09-11T19-48-11-943Z.csv'
    
    product_images = {}
    downloaded_count = 0
    
    with open(csv_file, 'r', encoding='utf-8-sig') as file:  # utf-8-sig handles BOM
        reader = csv.DictReader(file)
        
        for i, row in enumerate(reader):
            if i >= 50:  # Limit to first 50 products for now
                break
                
            page_url = row['PAGE URL']
            product_title = row['Product Title']
            brand = row['Brand']
            
            print(f"\nProcessing {i+1}: {product_title}")
            
            # Extract image URL
            image_url = extract_product_image(page_url)
            
            if image_url:
                # Create filename from product title
                safe_title = re.sub(r'[^a-zA-Z0-9\s-]', '', product_title)
                safe_title = re.sub(r'\s+', '-', safe_title).lower()
                filename = f"{safe_title}.jpg"
                
                # Download image
                if download_image(image_url, filename, us_images_dir):
                    product_images[product_title] = {
                        'image_url': image_url,
                        'local_path': f"/product-images/us/{filename}",
                        'brand': brand
                    }
                    downloaded_count += 1
                else:
                    product_images[product_title] = {
                        'image_url': None,
                        'local_path': '/placeholder-product.jpg',
                        'brand': brand
                    }
            else:
                print(f"No image found for {product_title}")
                product_images[product_title] = {
                    'image_url': None,
                    'local_path': '/placeholder-product.jpg',
                    'brand': brand
                }
            
            # Be respectful with requests
            time.sleep(1)
    
    # Save mapping to JSON file
    with open('us_product_images.json', 'w') as f:
        json.dump(product_images, f, indent=2)
    
    print(f"\nDownloaded {downloaded_count} product images")
    print(f"Images saved to: {us_images_dir}")
    print(f"Image mapping saved to: us_product_images.json")

if __name__ == "__main__":
    main()
