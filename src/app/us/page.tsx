import Header from '@/components/Header';
import HomepageGrid from '@/components/HomepageGrid';
import USProductSection from '@/components/USProductSection';
import USSymmetricalContentSection from '@/components/USSymmetricalContentSection';
import Footer from '@/components/Footer';
import FAQSchema from '@/components/FAQSchema';
import { Metadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nicotine Pouches US - Compare Prices & Find Best Deals',
    description: 'Compare nicotine pouches from top US brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
    keywords: 'nicotine pouches, US, compare prices, ZYN, VELO, LOOP, best deals',
    robots: 'index, follow',
    openGraph: {
      title: 'Nicotine Pouches US - Compare Prices & Find Best Deals',
      description: 'Compare nicotine pouches from top US brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
      url: 'https://nicotine-pouches.org/us',
      siteName: 'Nicotine Pouches US',
      images: [
        {
          url: 'https://nicotine-pouches.org/us-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Nicotine Pouches US',
        },
      ],
      locale: 'en-US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Nicotine Pouches US - Compare Prices & Find Best Deals',
      description: 'Compare nicotine pouches from top US brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
      images: ['https://nicotine-pouches.org/us-og-image.jpg'],
      creator: '@nicotinepouches',
      site: '@nicotinepouches',
    },
    alternates: {
      canonical: 'https://nicotine-pouches.org/us',
      languages: {
        'en-US': 'https://nicotine-pouches.org/us',
        'en-GB': 'https://nicotine-pouches.org',
        'x-default': 'https://nicotine-pouches.org/us',
      },
    },
    other: {
      'geo.region': 'US',
    },
  };
}

export default function USHome() {
  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        
        {/* Header */}
        <Header />
        
        {/* Homepage Grid Layout */}
        <HomepageGrid />
        
        {/* US Product Section */}
        <USProductSection />

        {/* US Symmetrical Content Section with TOC */}
        <USSymmetricalContentSection />

        {/* Footer */}
        <Footer />
        
        {/* FAQ Schema */}
        <FAQSchema />
      </div>
    </div>
  );
}
