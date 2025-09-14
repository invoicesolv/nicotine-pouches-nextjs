import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  wp_id: number;
  title: string;
  link: string;
  excerpt: string;
  content?: string;
  fullContent?: string;
  date: string;
  modified: string;
  slug: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  status: string;
  type: string;
  format: string;
  sticky: boolean;
  featured_image_local?: string;
  featured_image_compressed?: string;
  seo_meta?: {
    url: string;
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    canonical: string;
    robots: string;
    author: string;
    published_time: string;
    modified_time: string;
    article_section: string;
    article_tags: string[];
  };
}

// Get blog post by slug
// Load blog posts from JSON file
const loadBlogPosts = (): BlogPost[] => {
  try {
    const filePath = path.join(process.cwd(), 'all_blog_posts_merged.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};

// Get blog post by slug
const getBlogPost = (slug: string): BlogPost | null => {
  try {
    const posts = loadBlogPosts();
    const post = posts.find((p: BlogPost) => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
};

// Get products by brand name
const getProductsByBrand = async (brandName: string) => {
  try {
    const { data: products, error } = await supabase()
      .from('products')
      .select('*')
      .ilike('brand', `%${brandName}%`)
      .limit(2);
    
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
  
  // Handle both local and external image URLs
  let imageUrl = product.image_url || '/placeholder-product.svg';
  
  // If it's an external URL, use it directly; if it's local, ensure it starts with /
  if (imageUrl.startsWith('http')) {
    // External URL - use as is
    imageUrl = imageUrl;
  } else if (imageUrl.startsWith('/')) {
    // Local URL - use as is
    imageUrl = imageUrl;
  } else {
    // Relative URL - make it absolute
    imageUrl = '/' + imageUrl;
  }
  
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log(`Product: ${product.name}, Image URL: ${imageUrl}`);
  
  return `
    <div style="
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
          ${product.brand} • ${product.strength_group || 'Normal'} • ${product.format || 'Slim'}
        </p>
        <div style="
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
          <a href="/compare" style="
            background: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Klarna Text', sans-serif;
          ">
            Compare Prices
          </a>
        </div>
      </div>
    </div>
  `;
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Clean HTML content for display
const cleanHtmlContent = (html: string): string => {
  
  // Clean up WordPress-specific classes and content but preserve image attributes
  const cleaned = html
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
    .replace(/<a[^>]*>/g, '<a>')
    // Preserve img tags with their src and data-src attributes
    .replace(/<img[^>]*>/g, (match) => {
      const srcMatch = match.match(/data-src="([^"]*)"/);
      const altMatch = match.match(/alt="([^"]*)"/);
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      
      // Convert external image URLs to local paths
      let localSrc = src;
      if (src.includes('nicotine-pouches.org/wp-content/uploads/')) {
        const filename = src.split('/').pop()?.split('?')[0] || '';
        localSrc = `/blog-images/compressed/${filename}`;
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
  
  return cleaned;
};

export default async function GuidePost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getBlogPost(resolvedParams.slug);
  
  if (!post) {
    notFound();
  }

  // Extract brands from title and get products
  const brandsInTitle = extractBrandsFromTitle(post.title);
  console.log('Brands found in title:', brandsInTitle);
  
  let relatedProducts: any[] = [];
  if (brandsInTitle.length > 0) {
    // Map the brand name to database format
    const databaseBrand = mapBrandToDatabase(brandsInTitle[0]);
    console.log('Mapped brand for database:', databaseBrand);
    
    // Get products for the mapped brand
    relatedProducts = await getProductsByBrand(databaseBrand);
    console.log('Related products found:', relatedProducts.length);
  }

  // Use SEO meta title if available, otherwise use WordPress title
  const displayTitle = post.seo_meta?.title || post.title;
  const displayDescription = post.seo_meta?.description || post.excerpt.replace(/<[^>]*>/g, '');
  
  
  const displayImage = post.featured_image_local || 
    (post.seo_meta?.og_image ? 
      post.seo_meta.og_image.replace(/https:\/\/nicotine-pouches\.org\/wp-content\/uploads\/[^"'\s]+/, (match) => {
        const filename = match.split('/').pop()?.split('?')[0] || '';
        console.log('Converting featured image:', match, '->', `/blog-images/compressed/${filename}`);
        return `/blog-images/compressed/${filename}`;
      }) : 
      null);

  console.log('Display image URL:', displayImage);
  
  // Check if the image file actually exists, if not, use a fallback
  const finalDisplayImage = displayImage && displayImage.includes('pexels-photo-30403220') 
    ? '/blog-images/compressed/pexels-photo-16601238.jpeg' // Use an existing image as fallback
    : displayImage || '/blog-images/compressed/pexels-photo-16601238.jpeg'; // Default fallback image

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content Container - Centered like Klarna */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Blog Post Header - Left Aligned with Content */}
        <div style={{
          padding: '40px 0 20px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            margin: '0 0 8px 0',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            {displayTitle}
          </h1>
          
          <div style={{ 
            fontSize: '18px', 
            color: '#666', 
            marginBottom: '20px',
            fontWeight: '400',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            by {post.seo_meta?.author || 'Nicotine Pouches Team'} • {formatDate(post.date)}
          </div>
        </div>

        {/* Featured Image Section */}
        {finalDisplayImage && (
          <div style={{
            padding: '20px 0',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <img 
              src={finalDisplayImage}
              alt={displayTitle}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div style={{
          padding: '20px 0 40px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Description/Excerpt */}
          {displayDescription && (
            <div style={{
              fontSize: '20px',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.6',
              fontFamily: 'Klarna Text, sans-serif',
              fontStyle: 'italic'
            }}>
              {displayDescription}
            </div>
          )}
          
          <div 
            className="blog-post-content"
            style={{ 
              color: '#333', 
              lineHeight: '1.8', 
              fontSize: '18px',
              fontFamily: 'Klarna Text, sans-serif'
            }}
            dangerouslySetInnerHTML={{ 
              __html: (() => {
                const rawContent = post.content || post.fullContent || post.excerpt;
                const cleanedContent = cleanHtmlContent(rawContent);
                
                let finalContent = cleanedContent
                  .replace(
                    /<h2>/g, 
                    '<h2 style="font-size: 32px; font-weight: 700; color: #1a1a1a; margin: 50px 0 20px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.3; display: block;">'
                  )
                  .replace(
                    /<h3>/g, 
                    '<h3 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 30px 0 12px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.4; display: block;">'
                  )
                  .replace(
                    /<h4>/g, 
                    '<h4 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 25px 0 10px 0; font-family: \'Klarna Text\', sans-serif; line-height: 1.4; display: block;">'
                  )
                  .replace(
                    /<ul>/g, 
                    '<ul style="margin: 20px 0; padding-left: 20px; font-family: \'Klarna Text\', sans-serif;">'
                  )
                  .replace(
                    /<ol>/g, 
                    '<ol style="margin: 20px 0; padding-left: 20px; font-family: \'Klarna Text\', sans-serif;">'
                  )
                  .replace(
                    /<li>/g, 
                    '<li style="margin: 8px 0; font-size: 18px; line-height: 1.6; color: #333; list-style-type: disc;">'
                  )
                  .replace(
                    /<p>/g, 
                    '<p style="margin: 15px 0; font-size: 18px; line-height: 1.8; color: #333; font-family: \'Klarna Text\', sans-serif;">'
                  )
                  .replace(
                    /<table>/g, 
                    '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: \'Klarna Text\', sans-serif; border: 1px solid #e5e7eb;">'
                  )
                  .replace(
                    /<th>/g, 
                    '<th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 600; background-color: #f8f9fa;">'
                  )
                  .replace(
                    /<td>/g, 
                    '<td style="border: 1px solid #e5e7eb; padding: 12px; font-weight: 500;">'
                  )
                  .replace(
                    /<tr>/g, 
                    '<tr style="border-bottom: 1px solid #e5e7eb;">'
                  )
                  .replace(
                    /<a>/g, 
                    '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">'
                  );

                // Insert products after the first h2 or in the middle of the content
                if (relatedProducts.length > 0) {
                  console.log('Inserting products into content');
                  console.log('Products to insert:', relatedProducts.map(p => ({ name: p.name, image_url: p.image_url })));
                  
                  // Find the first h2 tag and insert products after it
                  const h2Index = finalContent.indexOf('<h2');
                  if (h2Index !== -1) {
                    const nextH2Index = finalContent.indexOf('<h2', h2Index + 1);
                    const insertIndex = nextH2Index !== -1 ? nextH2Index : finalContent.length;
                    
                    const productCards = relatedProducts.map(createProductCard).join('');
                    console.log('Generated product cards HTML length:', productCards.length);
                    const productSection = `
                      <div style="margin: 40px 0; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h3 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px 0; font-family: 'Klarna Text', sans-serif;">
                          Related ${brandsInTitle[0]} Products
                        </h3>
                        ${productCards}
                      </div>
                    `;
                    
                    finalContent = finalContent.slice(0, insertIndex) + productSection + finalContent.slice(insertIndex);
                  }
                }
                
                return finalContent;
              })()
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}





