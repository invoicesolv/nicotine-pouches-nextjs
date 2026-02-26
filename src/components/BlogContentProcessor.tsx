'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Error boundary wrapper for content
function SafeContent({ html, className, style }: { html: string; className?: string; style?: React.CSSProperties }) {
  try {
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.error('Error rendering content:', error);
    return <div style={{ color: '#666', padding: '20px' }}>Content could not be displayed.</div>;
  }
}

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

// Extract brand names from title using word boundary matching
const extractBrandsFromTitle = (title: string): string[] => {
  // Brand keywords - order matters! More specific brands first, then shorter ones
  // This prevents "ON" from matching in words like "option"
  const brandKeywords = [
    // Brands with numbers/special chars first
    '4NX', '4nx', 'V&YOU', 'V&You', 'ARCTIC7', 'Arctic7',
    // Multi-word brands
    'WHITE FOX', 'White Fox', 'NORDIC SPIRIT', 'Nordic Spirit',
    // Regular brands (alphabetically, longer ones tend to be safer)
    'CHAINPOP', 'Chainpop', 'ICEBERG', 'Iceberg', 'LUNDGRENS', 'Lundgrens',
    'SIBERIA', 'Siberia', 'STELLAR', 'Stellar', 'THUNDER', 'Thunder',
    'HELWIT', 'Helwit', 'NICCOS', 'Niccos',
    'CHAPO', 'Chapo', 'CROWN', 'Crown', 'FEDRS', 'Fedrs',
    'KLINT', 'Klint', 'KILLA', 'Killa', 'KURWA', 'Kurwa',
    'LEVEL', 'Level', 'LYFT', 'Lyft', 'MAGGI', 'Maggi',
    'PABLO', 'Pablo', 'SKRUF', 'Skruf', 'APRES', 'Apres',
    'AVANT', 'Avant', 'BAGZ', 'Bagz', 'CAMO', 'Camo',
    'CLEW', 'Clew', 'COCO', 'Coco', 'FUMI', 'Fumi',
    'GOAT', 'Goat', 'LOOP', 'Loop', 'NOIS', 'Nois',
    'RAVE', 'Rave', 'RUSH', 'Rush', 'VELO', 'Velo',
    'VOLT', 'Volt', 'ZYN', 'Zyn', 'XQS', 'Xqs',
    // Short brands that need word boundary matching (2-3 chars)
    'ACE', 'Ace', 'ELF', 'Elf', 'FIX', 'Fix',
    'HIT', 'Hit', 'ICE', 'Ice', 'VID', 'Vid',
    'ON!', 'On!' // Use ON! with exclamation to be more specific
  ];

  const foundBrands: string[] = [];

  for (const brand of brandKeywords) {
    // Use word boundary regex for precise matching
    // This prevents "ON" from matching in "option" or "ICE" in "service"
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedBrand}\\b`, 'i');

    if (regex.test(title)) {
      foundBrands.push(brand);
      break; // Return first match only
    }
  }

  return foundBrands;
};

// Map brand names from title to database brand names
const mapBrandToDatabase = (brand: string): string => {
  const brandMappings: { [key: string]: string } = {
    '4NX': '4NX',
    '4nx': '4NX',
    'NORDIC SPIRIT': 'Nordic',
    'Nordic Spirit': 'Nordic',
    'WHITE FOX': 'White',
    'White Fox': 'White',
    'V&YOU': 'V&YOU',
    'V&You': 'V&YOU',
    'ARCTIC7': 'Arctic7',
    'Arctic7': 'Arctic7',
    'ON!': 'On!',
    'On!': 'On!',
    'ELF': 'ELF',
    'Elf': 'ELF',
    'FUMI': 'FUMi',
    'Fumi': 'FUMi',
    'MAGGI': 'Maggie',
    'Maggi': 'Maggie',
    'VID': 'ViD',
    'Vid': 'ViD',
    'WHITE': 'White',
    'White': 'White',
    'ZYN': 'ZYN',
    'Zyn': 'ZYN',
    'VELO': 'VELO',
    'Velo': 'VELO',
    'XQS': 'XQS',
    'Xqs': 'XQS',
    'SIBERIA': 'Siberia',
    'PABLO': 'Pablo',
    'KILLA': 'Killa',
    'LOOP': 'LOOP',
    'Loop': 'LOOP',
    'SKRUF': 'Skruf',
    'Skruf': 'Skruf',
    'ACE': 'Ace',
    'Ace': 'Ace'
  };

  return brandMappings[brand] || brand;
};

// Create product card HTML - matching product page vendor card style
const createProductCard = (product: any) => {
  const imageUrl = product.image_url || '/placeholder-product.svg';
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const brandName = product.name.split(' ')[0];

  return `
    <a href="/product/${productSlug}" style="
      display: block;
      text-decoration: none;
      color: inherit;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      margin-bottom: 12px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
      overflow: hidden;
    " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; this.style.borderColor='#d1d5db';" onmouseout="this.style.boxShadow='none'; this.style.borderColor='#e5e7eb';">
      <div style="
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 16px;
      ">
        <!-- Product Image -->
        <div style="
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img
            src="${imageUrl}"
            alt="${product.name}"
            style="
              max-width: 60px;
              max-height: 60px;
              object-fit: contain;
            "
          />
        </div>

        <!-- Product Info -->
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          ">
            ${product.name}
          </div>
          <div style="
            font-size: 14px;
            color: #6b7280;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          ">
            ${brandName} • Nicotine Pouches
          </div>
        </div>

        <!-- Price & Arrow -->
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        ">
          <div style="text-align: right;">
            <div style="
              font-size: 13px;
              color: #059669;
              font-weight: 500;
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              margin-bottom: 2px;
            ">
              From
            </div>
            <div style="
              font-size: 20px;
              font-weight: 700;
              color: #1f2937;
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            ">
              £3.99
            </div>
          </div>
          <div style="
            color: #9ca3af;
            font-size: 20px;
          ">
            ›
          </div>
        </div>
      </div>
    </a>
  `;
};

// Convert any remaining markdown to HTML (for content that wasn't properly converted before publishing)
const convertMarkdownToHtml = (content: string): string => {
  let result = content;

  // Convert markdown headers
  result = result
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Handle image containers with attribution from Axelio CRM
  result = result.replace(
    /<div class="image-container">[\s\r\n]*!\[(.*?)\]\((.*?)\)[\s\r\n]*<small>([\s\S]*?)<\/small>[\s\r\n]*<\/div>/gi,
    (match, alt, url, attribution) => {
      // Convert markdown links in the attribution to HTML links
      const htmlAttribution = attribution
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      return `<figure style="margin: 30px 0; text-align: center;">
        <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        <figcaption style="margin-top: 10px; font-size: 14px; color: #666; font-style: italic;">${htmlAttribution}</figcaption>
      </figure>`;
    }
  );

  // Convert standalone markdown images
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />');

  // Convert markdown links (after images to avoid conflicts)
  // Internal links should not have target="_blank"
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const isInternal = url.startsWith('/') || url.includes('nicotine-pouches.org');
    if (isInternal) {
      // Convert absolute internal URLs to relative and strip trailing slashes
      const relativeUrl = url.replace('https://nicotine-pouches.org', '').replace('http://nicotine-pouches.org', '').replace(/\/+$/, '') || '/';
      return `<a href="${relativeUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${text}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${text}</a>`;
  });

  // Convert bold and italic
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');

  return result;
};

// Clean HTML content for display
const cleanHtmlContent = (html: string): string => {
  // First convert any markdown to HTML
  const convertedHtml = convertMarkdownToHtml(html);
  // Remove WordPress-specific classes and clean up the content
  return convertedHtml
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
      // Check if internal link
      const isInternal = href.startsWith('/') || href.includes('nicotine-pouches.org');
      if (isInternal) {
        // Convert absolute internal URLs to relative and strip trailing slashes
        const relativeUrl = href.replace('https://nicotine-pouches.org', '').replace('http://nicotine-pouches.org', '').replace(/\/+$/, '') || '/';
        return `<a href="${relativeUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">`;
    })
    .replace(/<img[^>]*>/g, (match) => {
      // Try data-src first (WordPress lazy-loading), then fall back to regular src
      const dataSrcMatch = match.match(/data-src="([^"]*)"/);
      const srcMatch = match.match(/src="([^"]*)"/);
      const altMatch = match.match(/alt="([^"]*)"/);
      const styleMatch = match.match(/style="([^"]*)"/);
      const src = dataSrcMatch ? dataSrcMatch[1] : (srcMatch ? srcMatch[1] : '');
      const alt = altMatch ? altMatch[1] : '';
      const existingStyle = styleMatch ? styleMatch[1] : '';

      // Skip if no src found
      if (!src) {
        console.log('Image tag with no src found:', match);
        return match;
      }

      // Convert external image URLs to local paths if needed
      let localSrc = src;
      if (src.includes('nicotine-pouches.org/wp-content/uploads/')) {
        const filename = src.split('/').pop()?.split('?')[0] || '';
        localSrc = `/blog-images/${filename}`;
        console.log('Converting content image:', src, '->', localSrc);
      }

      // Preserve any existing max-width/height styles from the source, but ensure responsive
      const baseStyle = 'max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;';

      return `<img
        src="${localSrc}"
        alt="${alt}"
        style="${baseStyle}"
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
    // Preserve figure and figcaption tags for image containers
    .replace(/<figure[^>]*>/g, '<figure style="margin: 30px 0; text-align: center;">')
    .replace(/<figcaption[^>]*>/g, '<figcaption style="margin-top: 10px; font-size: 14px; color: #666; font-style: italic;">')
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
  // Process content synchronously on initial render to avoid hydration mismatch
  const initialProcessedContent = useMemo(() => cleanHtmlContent(content || ''), [content]);

  const [processedContent, setProcessedContent] = useState(initialProcessedContent);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const processContent = async () => {
      // Start with already-cleaned content
      let processed = initialProcessedContent;

      // Extract brands from title and get related products
      const extractedBrands = extractBrandsFromTitle(title);

      if (extractedBrands.length > 0) {
        // Map the brand name to database format
        const databaseBrand = mapBrandToDatabase(extractedBrands[0]);

        try {
          // Get products for the mapped brand
          const products = await getProductsByBrand(databaseBrand);
          setRelatedProducts(products);

          // Insert products into content
          if (products.length > 0) {
            // Find the first h2 tag and insert products after it
            const h2Index = processed.indexOf('<h2');
            if (h2Index !== -1) {
              const nextH2Index = processed.indexOf('<h2', h2Index + 1);
              const insertIndex = nextH2Index !== -1 ? nextH2Index : processed.length;

              const productCards = products.map(createProductCard).join('');
              const productSection = `
                <div class="related-products" style="
                  margin: 40px 0;
                  padding: 24px;
                  background: #f8fafc;
                  border-radius: 12px;
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                  ">
                    <h3 style="
                      font-size: 18px;
                      font-weight: 600;
                      color: #1f2937;
                      margin: 0;
                      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    ">
                      Related ${extractedBrands[0]} Products
                    </h3>
                    <a href="/brand/${extractedBrands[0].toLowerCase()}" style="
                      font-size: 14px;
                      color: #059669;
                      text-decoration: none;
                      font-weight: 500;
                      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    ">
                      View all →
                    </a>
                  </div>
                  <p style="
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0 0 16px 0;
                    line-height: 1.5;
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                  ">
                    Not all vendors are equal. Join <strong style="color: #1f2937; font-weight: 600;">10,000+ shoppers</strong> who use us to compare prices, Trustpilot ratings, and shipping speeds across 10+ UK vendors—so you pick who deserves your money.
                  </p>
                  ${productCards}
                </div>
              `;

              processed = processed.slice(0, insertIndex) + productSection + processed.slice(insertIndex);
              setProcessedContent(processed);
            }
          }
        } catch (error) {
          console.error('Error fetching related products:', error);
          // Continue without products - don't block rendering
        }
      }
    };

    processContent();
  }, [content, title, initialProcessedContent]);

  // Handle empty content gracefully
  if (!content || content.trim() === '') {
    return <div style={{ padding: '20px', color: '#666' }}>No content available.</div>;
  }

  return (
    <>
      <div 
        className="blog-post-content"
        style={{ 
          color: '#333333', 
          lineHeight: '1.8', 
          fontSize: '18px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}
        dangerouslySetInnerHTML={{ 
          __html: processedContent
            .replace(/<h2>/g, '<h2 style="font-size: 32px; font-weight: 700; color: #1A0033; margin: 50px 0 20px 0; font-family: \'Plus Jakarta Sans\', sans-serif; line-height: 1.3; display: block;">')
            .replace(/<h3>/g, '<h3 style="font-size: 24px; font-weight: 700; color: #1A0033; margin: 40px 0 15px 0; font-family: \'Plus Jakarta Sans\', sans-serif; line-height: 1.3; display: block;">')
            .replace(/<h4>/g, '<h4 style="font-size: 20px; font-weight: 600; color: #1A0033; margin: 30px 0 12px 0; font-family: \'Plus Jakarta Sans\', sans-serif; line-height: 1.4; display: block;">')
            .replace(/<ul>/g, '<ul style="margin: 20px 0; padding-left: 24px; font-family: \'Plus Jakarta Sans\', sans-serif; list-style-type: disc;">')
            .replace(/<ol>/g, '<ol style="margin: 20px 0; padding-left: 24px; font-family: \'Plus Jakarta Sans\', sans-serif; list-style-type: decimal;">')
            .replace(/<li>/g, '<li style="margin: 12px 0; font-size: 18px; line-height: 1.6; color: #333333; font-family: \'Plus Jakarta Sans\', sans-serif;">')
            .replace(/<p>/g, '<p style="margin: 20px 0; font-size: 18px; line-height: 1.8; color: #333333; font-family: \'Plus Jakarta Sans\', sans-serif;">')
            .replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: \'Plus Jakarta Sans\', sans-serif; border: 1px solid #e5e7eb;">')
            .replace(/<th>/g, '<th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 600; background-color: #f8f9fa;">')
            .replace(/<td>/g, '<td style="border: 1px solid #e5e7eb; padding: 12px; font-weight: 500;">')
            .replace(/<tr>/g, '<tr style="border-bottom: 1px solid #e5e7eb;">')
            .replace(/<a>/g, '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">')
        }}
      />
    </>
  );
}
