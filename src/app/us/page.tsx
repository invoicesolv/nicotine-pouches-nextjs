import Header from '@/components/Header';
import { CTASection } from '@/components/ui/hero-dithering-card';
import USHomepageBrandLogos from '@/components/USHomepageBrandLogos';
import USDynamicProductSections from '@/components/USDynamicProductSections';
import USSymmetricalContentSection from '@/components/USSymmetricalContentSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FAQSchema from '@/components/FAQSchema';
import { Metadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nicotine Pouches US - Compare Prices & Find Best Deals',
    description: 'Compare nicotine pouches from top US brands including ZYN, VELO, and LOOP. Find the best prices, strengths, and flavours with live price updates.',
    keywords: 'nicotine pouches, US, compare prices, ZYN, VELO, LOOP, best deals',
    robots: 'index, follow',
    authors: [{ name: 'Nicotine Pouches US' }],
    publisher: 'Nicotine Pouches US',
    metadataBase: new URL('https://nicotine-pouches.org'),
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
      locale: 'en_US',
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
      'content-language': 'en-US',
      'author': 'Nicotine Pouches US',
      'publisher': 'Nicotine Pouches US',
      'article:author': 'Nicotine Pouches US',
      'article:publisher': 'Nicotine Pouches US',
      'og:author': 'Nicotine Pouches US',
      'og:publisher': 'Nicotine Pouches US',
    },
  };
}

export default function USHome() {
  return (
    <div id="boxed-wrapper" className="page-transition">
      <div id="wrapper" className="fusion-wrapper">

        {/* Header */}
        <Header />

        <main id="main-content">
          {/* Homepage Hero */}
          <div className="fade-in">
            <CTASection />
          </div>

          {/* Brand Logos */}
          <USHomepageBrandLogos />

          {/* US Product Section */}
          <USDynamicProductSections />

          {/* US Symmetrical Content Section with TOC */}
          <USSymmetricalContentSection />
        </main>

        {/* Footer */}
        <Footer showBrandsLink={false} isUSRoute={true} />

        {/* Cookie Consent Banner */}
        <CookieConsent />

        {/* FAQ Schema */}
        <FAQSchema />
      </div>
    </div>
  );
}
