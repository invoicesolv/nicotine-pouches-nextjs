#!/usr/bin/env python3
import pymysql
import requests
import os
import json
from urllib.parse import urlparse
import time

# WordPress database connection
DB_CONFIG = {
    'host': '35.197.229.176',
    'port': 23012,
    'user': 'app_13619_staging',
    'password': '{5xcOdP1Au4NNWE',
    'database': 'app_13619_staging',
    'charset': 'utf8mb4'
}

# Supabase configuration
SUPABASE_URL = 'https://vyolbmzuezpoqtdgongz.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI'

def create_images_directory():
    """Create the images directory if it doesn't exist"""
    images_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'wordpress-images')
    os.makedirs(images_dir, exist_ok=True)
    return images_dir

def connect_to_wordpress_db():
    """Connect to WordPress database"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("✅ Connected to WordPress database")
        return connection
    except Exception as e:
        print(f"❌ Failed to connect to WordPress database: {e}")
        return None

def get_products_with_images(connection):
    """Get all products with their image thumbnail IDs"""
    try:
        with connection.cursor() as cursor:
            query = """
            SELECT p.ID, p.post_title, pm.meta_value as thumbnail_id
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
            WHERE p.post_type = 'product' 
            AND p.post_status = 'publish' 
            AND pm.meta_key = '_thumbnail_id'
            ORDER BY p.ID
            """
            cursor.execute(query)
            products = cursor.fetchall()
            print(f"📦 Found {len(products)} products with thumbnails")
            return products
    except Exception as e:
        print(f"❌ Error getting products: {e}")
        return []

def get_image_urls(connection, thumbnail_ids):
    """Get image URLs for thumbnail IDs"""
    try:
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(thumbnail_ids))
            query = f"""
            SELECT ID, guid, post_mime_type
            FROM wp_posts 
            WHERE ID IN ({placeholders}) 
            AND post_type = 'attachment'
            """
            cursor.execute(query, thumbnail_ids)
            images = cursor.fetchall()
            print(f"🖼️ Found {len(images)} image URLs")
            return images
    except Exception as e:
        print(f"❌ Error getting image URLs: {e}")
        return []

def download_image(url, filepath):
    """Download an image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def upload_to_supabase(filepath, filename):
    """Upload image to Supabase storage"""
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filename, f, 'image/jpeg')}
            headers = {
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'apikey': SUPABASE_KEY
            }
            
            url = f"{SUPABASE_URL}/storage/v1/object/blog-images/wordpress-images/{filename}"
            
            response = requests.post(url, files=files, headers=headers)
            
            if response.status_code in [200, 201]:
                public_url = f"{SUPABASE_URL}/storage/v1/object/public/blog-images/wordpress-images/{filename}"
                print(f"✅ Uploaded to Supabase: {filename}")
                return public_url
            else:
                print(f"❌ Failed to upload {filename}: {response.status_code}")
                return None
    except Exception as e:
        print(f"❌ Error uploading {filename}: {e}")
        return None

def update_supabase_product(product_id, image_url):
    """Update product in Supabase with new image URL"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/products"
        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        data = {
            'image_url': image_url
        }
        
        response = requests.patch(
            f"{url}?id=eq.{product_id}",
            headers=headers,
            json=data
        )
        
        if response.status_code in [200, 204]:
            print(f"✅ Updated product {product_id} with new image")
            return True
        else:
            print(f"❌ Failed to update product {product_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error updating product {product_id}: {e}")
        return False

def main():
    """Main function to download and process WordPress images"""
    print("🚀 Starting WordPress image download process...")
    
    # Create images directory
    images_dir = create_images_directory()
    
    # Connect to WordPress database
    connection = connect_to_wordpress_db()
    if not connection:
        return
    
    try:
        # Get products with images
        products = get_products_with_images(connection)
        if not products:
            print("❌ No products found")
            return
        
        # Get unique thumbnail IDs
        thumbnail_ids = list(set([p[2] for p in products if p[2]]))
        print(f"🔍 Found {len(thumbnail_ids)} unique thumbnail IDs")
        
        # Get image URLs
        images = get_image_urls(connection, thumbnail_ids)
        if not images:
            print("❌ No images found")
            return
        
        # Create mapping
        image_urls = {img[0]: img[1] for img in images}
        product_image_map = {}
        
        for product_id, title, thumbnail_id in products:
            if thumbnail_id and int(thumbnail_id) in image_urls:
                product_image_map[product_id] = image_urls[int(thumbnail_id)]
        
        print(f"🗺️ Mapped {len(product_image_map)} products to images")
        
        # Download and process images
        successful_downloads = 0
        successful_uploads = 0
        successful_updates = 0
        
        for product_id, image_url in product_image_map.items():
            print(f"\n📥 Processing product {product_id}...")
            
            # Determine file extension
            parsed_url = urlparse(image_url)
            file_ext = os.path.splitext(parsed_url.path)[1] or '.jpg'
            filename = f"product_{product_id}{file_ext}"
            filepath = os.path.join(images_dir, filename)
            
            # Download image
            if download_image(image_url, filepath):
                successful_downloads += 1
                
                # Upload to Supabase
                public_url = upload_to_supabase(filepath, filename)
                if public_url:
                    successful_uploads += 1
                    
                    # Update product in Supabase
                    if update_supabase_product(product_id, public_url):
                        successful_updates += 1
                
                # Small delay to avoid overwhelming the server
                time.sleep(0.5)
        
        # Save mapping to file
        mapping_file = os.path.join(os.path.dirname(__file__), '..', 'wordpress_image_mapping.json')
        with open(mapping_file, 'w') as f:
            json.dump(product_image_map, f, indent=2)
        
        print(f"\n🎉 Process completed!")
        print(f"📊 Statistics:")
        print(f"   - Products processed: {len(product_image_map)}")
        print(f"   - Images downloaded: {successful_downloads}")
        print(f"   - Images uploaded to Supabase: {successful_uploads}")
        print(f"   - Products updated in Supabase: {successful_updates}")
        print(f"💾 Mapping saved to: {mapping_file}")
        
    except Exception as e:
        print(f"❌ Error in main process: {e}")
    finally:
        connection.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    main()
