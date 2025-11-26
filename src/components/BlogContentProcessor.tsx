'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Get products by brand name
const getProductsByBrand = async (brandName: string) => {
  try {
    // For Nordic Spirit, be more specific to avoid getting other brands
    let query = supabase()
      .from('wp_products')
      .select('*')
      .not('name', 'ilike', '%bundle%')
      .not('name', 'ilike', '%variety%')
      .not('name', 'ilike', '%mix%')
      .not('image_url', 'is', null)
      .limit(2);
    
    if (brandName.toLowerCase().includes('nordic')) {
      // For Nordic Spirit, only get products that start with "Nordic Spirit"
      query = query.ilike('name', 'Nordic Spirit%');
    } else {
      // For other brands, use the original logic
      query = query.ilike('name', `%${brandName}%`);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      console.error('Error fetching products by brand:', error);
      return [];
    }
    
    return products || [];
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    return [];
  }
};

// Extract brand names from title
const extractBrandsFromTitle = (title: string): string[] => {
  const brandKeywords = [
    'ZYN', 'Zyn', 'VELO', 'Velo', 'ON', 'On', 'LOOP', 'Loop', 'WHITE FOX', 'White Fox',
    'SKRUF', 'Skruf', 'NORDIC SPIRIT', 'Nordic Spirit', 'PABLO', 'Pablo', 'KILLA', 'Killa',
    'KURWA', 'Kurwa', 'SIBERIA', 'Siberia', 'THUNDER', 'Thunder', 'LYFT', 'Lyft',
    'XQS', 'Xqs', 'V&YOU', 'V&You', 'VID', 'Vid', 'VOLT', 'Volt', 'STELLAR', 'Stellar',
    'RUSH', 'Rush', 'RAVE', 'Rave', 'NOIS', 'Nois', 'NICCOS', 'Niccos', 'MAGGI', 'Maggi',
    'LUNDGRENS', 'Lundgrens', 'LEVEL', 'Level', 'KLINT', 'Klint', 'KURWA', 'Kurwa',
    'ICE', 'Ice', 'ICEBERG', 'Iceberg', 'HIT', 'Hit', 'HELWIT', 'Helwit', 'GOAT', 'Goat',
    'FUMI', 'Fumi', 'FEDRS', 'Fedrs', 'FIX', 'Fix', 'ELF', 'Elf', 'CROWN', 'Crown',
    'CLEW', 'Clew', 'COCO', 'Coco', 'CHAPO', 'Chapo', 'CHAINPOP', 'Chainpop', 'CAMO', 'Camo',
    'BAGZ', 'Bagz', 'AVANT', 'Avant', 'ARCTIC7', 'Arctic7', 'APRES', 'Apres', 'ACE', 'Ace'
  ];
  
  const foundBrands: string[] = [];
  
  for (const brand of brandKeywords) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      foundBrands.push(brand);
    }
  }
  
  return foundBrands;
};

// Map brand names from title to database brand names
const mapBrandToDatabase = (brand: string): string => {
  const brandMappings: { [key: string]: string } = {
    'NORDIC SPIRIT': 'Nordic',
    'Nordic Spirit': 'Nordic',
    'WHITE FOX': 'White',
    'White Fox': 'White',
    'V&YOU': 'V&YOU',
    'V&You': 'V&YOU',
    'ARCTIC7': 'Arctic7',
    'Arctic7': 'Arctic7',
    'ON': 'On!',
    'On': 'On!',
    'ELF': 'ELF',
    'Elf': 'ELF',
    'FUMI': 'FUMi',
    'Fumi': 'FUMi',
    'MAGGI': 'Maggie',
    'Maggi': 'Maggie',
    'VID': 'ViD',
    'Vid': 'ViD',
    'WHITE': 'White',
    'White': 'White'
  };
  
  return brandMappings[brand] || brand;
};

// Create product card HTML
const createProductCard = (product: any) => {
  console.log('createProductCard called with:', product.name);
  
  // Use the actual image URL from the database
  let imageUrl = product.image_url || '/placeholder-product.svg';
  
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log(`Product: ${product.name}, Image URL: ${imageUrl}`);
  
  return `
    <div class="product-card" style="
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      gap: 20px;
      align-items: center;
    ">
      <div style="flex-shrink: 0;">
        <img 
          src="${imageUrl}" 
          alt="${product.name}"
          style="
            width: 120px;
            height: 120px;
            object-fit: contain;
            border-radius: 8px;
            background: #f8f9fa;
            padding: 10px;
          "
        />
      </div>
      <div style="flex: 1;">
        <h3 style="
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          font-family: 'Klarna Text', sans-serif;
        ">
          ${product.name}
        </h3>
        <p style="
          font-size: 16px;
          color: #666;
          margin: 0 0 12px 0;
          font-family: 'Klarna Text', sans-serif;
        ">
          ${product.name.split(' ')[0]} • Normal • Slim
        </p>
        <div class="price-section" style="
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <span style="
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            font-family: 'Klarna Text', sans-serif;
          ">
            £3.99
          </span>
          <a href="/product/${productSlug}" style="
            background: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Klarna Text', sans-serif;
          ">
            View Product
          </a>
        </div>
      </div>
    </div>
  `;
};

// Clean HTML content for display
const cleanHtmlContent = (html: string): string => {
  // Remove WordPress-specific classes and clean up the content
  return html
    .replace(/class="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/<div[^>]*>/g, '<div>')
    .replace(/<span[^>]*>/g, '<span>')
    .replace(/<p[^>]*>/g, '<p>')
    .replace(/<h[1-6][^>]*>/g, (match) => {
      const level = match.charAt(2);
      return `<h${level}>`;
    })
    .replace(/<ul[^>]*>/g, '<ul>')
    .replace(/<ol[^>]*>/g, '<ol>')
    .replace(/<li[^>]*>/g, '<li>')
    .replace(/<table[^>]*>/g, '<table>')
    .replace(/<tr[^>]*>/g, '<tr>')
    .replace(/<td[^>]*>/g, '<td>')
    .replace(/<th[^>]*>/g, '<th>')
    .replace(/<a[^>]*>/g, (match) => {
      const hrefMatch = match.match(/href="([^"]*)"/);
      const href = hrefMatch ? hrefMatch[1] : '#';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
    })
    .replace(/<img[^>]*>/g, (match) => {
      const srcMatch = match.match(/data-src="([^"]*)"/);
      const altMatch = match.match(/alt="([^"]*)"/);
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      
      // Convert external image URLs to local paths
      let localSrc = src;
      if (src.includes('nicotine-pouches.org/wp-content/uploads/')) {
        const filename = src.split('/').pop()?.split('?')[0] || '';
        localSrc = `/blog-images/${filename}`;
        console.log('Converting content image:', src, '->', localSrc);
      }
      
      return `<img 
        src="${localSrc}" 
        alt="${alt}" 
        style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;"
      >`;
    })
    // Process iframe tags (YouTube embeds) to convert data-src to src
    .replace(/<iframe[^>]*>/g, (match) => {
      const srcMatch = match.match(/data-src="([^"]*)"/);
      const titleMatch = match.match(/title="([^"]*)"/);
      const src = srcMatch ? srcMatch[1] : '';
      const title = titleMatch ? titleMatch[1] : '';
      
      if (src && src.includes('youtube.com')) {
        return `<iframe src="${src}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="width: 100%; height: 400px; border-radius: 8px; margin: 20px 0;"></iframe>`;
      }
      
      return match; // Return original if not YouTube
    })
    .replace(/<br[^>]*>/g, '<br>')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "...");
};

interface BlogContentProcessorProps {
  content: string;
  title: string;
  post: any;
}

export default function BlogContentProcessor({ content, title, post }: BlogContentProcessorProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processContent = async () => {
      // Process YouTube videos and images
      let processed = cleanHtmlContent(content);

      // Extract brands from title and get related products
      const extractedBrands = extractBrandsFromTitle(title);
      console.log('Brands found in title:', extractedBrands);
      
      if (extractedBrands.length > 0) {
        // Map the brand name to database format
        const databaseBrand = mapBrandToDatabase(extractedBrands[0]);
        console.log('Mapped brand for database:', databaseBrand);
        
        // Get products for the mapped brand
        const products = await getProductsByBrand(databaseBrand);
        console.log('Related products found:', products.length);
        setRelatedProducts(products);
        
        // Insert products into content like the backup does
        if (products.length > 0) {
          console.log('Inserting products into content');
          console.log('Products to insert:', products.map((p: any) => ({ name: p.name, image_url: p.image_url })));
          
          // Find the first h2 tag and insert products after it
          const h2Index = processed.indexOf('<h2');
          if (h2Index !== -1) {
            const nextH2Index = processed.indexOf('<h2', h2Index + 1);
            const insertIndex = nextH2Index !== -1 ? nextH2Index : processed.length;
            
            const productCards = products.map(createProductCard).join('');
            console.log('Generated product cards HTML length:', productCards.length);
            const productSection = `
              <div class="related-products" style="margin: 40px 0; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; font-family: 'Klarna Text', sans-serif;">
                  Related ${extractedBrands[0]} Products
                </h3>
                ${productCards}
              </div>
            `;
            
            processed = processed.slice(0, insertIndex) + productSection + processed.slice(insertIndex);
          }
        }
      }

      setProcessedContent(processed);
      setLoading(false);
    };

    processContent();
  }, [content, title]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div 
        className="blog-post-content"
        style={{ 
          color: '#333333', 
          lineHeight: '1.8', 
          fontSize: '18px',
          fontFamily: 'Klarna Text, sans-serif'
        }}
        dangerouslySetInnerHTML={{ 
          __html: processedContent
            .replace(/<h2>/g, '<h2 style="font-size: 32px; font-weight: 700; color: #1A0033; margin: 50px 0 20px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.3; display: block;">')
            .replace(/<h3>/g, '<h3 style="font-size: 24px; font-weight: 700; color: #1A0033; margin: 40px 0 15px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.3; display: block;">')
            .replace(/<h4>/g, '<h4 style="font-size: 20px; font-weight: 600; color: #1A0033; margin: 30px 0 12px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.4; display: block;">')
            .replace(/<ul>/g, '<ul style="margin: 20px 0; padding-left: 0; font-family: \'Klarna Text\', sans-serif; list-style: none;">')
            .replace(/<ol>/g, '<ol style="margin: 20px 0; padding-left: 0; font-family: \'Klarna Text\', sans-serif; list-style: none;">')
            .replace(/<li>/g, (match, offset, string) => {
              // Check if this is inside an ordered list
              const beforeText = string.substring(0, offset);
              const lastOlIndex = beforeText.lastIndexOf('<ol');
              const lastUlIndex = beforeText.lastIndexOf('<ul');
              const isOrderedList = lastOlIndex > lastUlIndex;
              
              if (isOrderedList) {
                // For ordered lists, create custom numbered styling
                const listItemNumber = (beforeText.match(/<li>/g) || []).length + 1;
                return `<li style="margin: 15px 0; font-size: 20px; font-weight: 700; color: #1A0033; line-height: 1.6; display: flex; align-items: flex-start; font-family: \'Klarna Text\', sans-serif;">
                  <span style="margin-right: 12px; min-width: 24px;">${listItemNumber}.</span>
                  <span style="font-weight: 400; color: #333333;">`;
              } else {
                // For unordered lists, use bullet points
                return `<li style="margin: 15px 0; font-size: 18px; line-height: 1.6; color: #333333; display: flex; align-items: flex-start; font-family: \'Klarna Text\', sans-serif;">
                  <span style="margin-right: 12px; color: #1A0033; font-weight: 700;">•</span>
                  <span>`;
              }
            })
            .replace(/<\/li>/g, '</span></li>')
            .replace(/<p>/g, '<p style="margin: 20px 0; font-size: 18px; line-height: 1.8; color: #333333; font-family: \'Klarna Text\', sans-serif;">')
            .replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: \'Klarna Text\', sans-serif; border: 1px solid #e5e7eb;">')
            .replace(/<th>/g, '<th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 600; background-color: #f8f9fa;">')
            .replace(/<td>/g, '<td style="border: 1px solid #e5e7eb; padding: 12px; font-weight: 500;">')
            .replace(/<tr>/g, '<tr style="border-bottom: 1px solid #e5e7eb;">')
            .replace(/<a>/g, '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">')
        }}
      />
    </>
  );
}
