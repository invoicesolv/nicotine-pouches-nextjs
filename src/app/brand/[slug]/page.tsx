import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRProductGridWithSidebar from '@/components/SSRProductGridWithSidebar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getSEOTags, renderSchemaTag, generateStandaloneAggregateRating, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getBrandSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getBrandAggregateRating } from '@/lib/aggregate-ratings';
import { generateBrandHreflang, generateSafeHreflang } from '@/lib/hreflang';
import './brand-page.css';

// Fetch brand data from Supabase
async function getBrandData(slug: string) {
  try {
    const brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Get all products for this brand (filter by name starting with brand)
    const { data: products, error } = await supabase()
      .from('wp_products')
      .select('*')
      .ilike('name', `${brandName}%`)
      .not('image_url', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching brand products:', error);
      return null;
    }

    if (!products || products.length === 0) {
      return null;
    }

    // Get the first product as featured
    const featuredProduct = products[0];

    return {
      brandName: brandName,
      featuredProduct: {
        id: featuredProduct.id,
        name: featuredProduct.name,
        image: featuredProduct.image_url || '/placeholder-product.jpg',
        description: featuredProduct.content || `Compare ${brandName} nicotine pouches - best prices and deals UK.`,
        brand: featuredProduct.name.split(' ')[0],
        strength_group: 'Normal',
        flavour: featuredProduct.name.split(' ').slice(1).join(' '),
        format: 'Slim'
      },
      totalProducts: products.length
    };
  } catch (error) {
    console.error('Error in getBrandData:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brandData = await getBrandData(slug);
  
  if (!brandData) {
    return {
      title: 'Brand Not Found',
      description: 'The requested brand could not be found.'
    };
  }

  // Fetch aggregate rating for the brand
  const ratingData = await getBrandAggregateRating(brandData.brandName);
  
  // Prepare brand data for SEO template
  const brandSEOData = {
    brandName: brandData.brandName,
    description: brandData.featuredProduct.description,
    productCount: brandData.totalProducts,
    image: brandData.featuredProduct.image,
    aggregateRating: ratingData?.aggregateRating || {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": 0,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Generate SEO data using centralized template
  const seoData = getBrandSEOTemplate(brandSEOData);
  
  // Use centralized SEO function
  return getSEOTags('brand', seoData);
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandData = await getBrandData(slug);

  if (!brandData) {
    notFound();
  }

  // Fetch aggregate rating for the brand
  const ratingData = await getBrandAggregateRating(brandData.brandName);
  
  // Prepare brand data for schema
  const brandSEOData = {
    brandName: brandData.brandName,
    description: brandData.featuredProduct.description,
    productCount: brandData.totalProducts,
    image: brandData.featuredProduct.image,
    aggregateRating: ratingData?.aggregateRating || {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": 0,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Generate breadcrumb data
  const breadcrumbs = generateBreadcrumbData('brand', brandSEOData);

  return (
    <>
      {/* Standalone AggregateRating Schema */}
      {ratingData && generateStandaloneAggregateRating('Brand', brandData.brandName, ratingData.aggregateRating)}
      
      {/* Brand Schema */}
      {renderSchemaTag('brand', brandSEOData)}
      
      {/* Breadcrumb Schema */}
      {generateBreadcrumbSchema(breadcrumbs)}
      
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          {/* Header */}
          <Header />

        {/* Main Content */}
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          padding: '0',
          margin: '0',
          width: '100%'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="compare-container" style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 15px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/compare" style={{ color: '#666', textDecoration: 'none' }}>Compare Nicotine Pouches</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/guides" style={{ color: '#666', textDecoration: 'none' }}>Guides</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <Link href="/here-we-are" style={{ color: '#666', textDecoration: 'none' }}>About Us</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>{brandData.brandName}</span>
            </div>
          </div>

          {/* Page Header */}
          <div className="page-header" style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div className="compare-container" style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 15px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 15px 0'
              }}>
                {brandData.brandName} Nicotine Pouches
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Find the best prices for {brandData.brandName} nicotine pouches from top UK vendors. 
                Compare ratings, strengths, and flavors to find your perfect match.
              </p>
            </div>
          </div>

          {/* UK Products Section with Sidebar - Responsive */}
          <SSRProductGridWithSidebar brandFilter={brandData.brandName} />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}