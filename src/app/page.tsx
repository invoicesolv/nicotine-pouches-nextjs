import { Metadata } from 'next';
import Header from '@/components/Header';
import HomepageGrid from '@/components/HomepageGrid';
import SSRProductSection from '@/components/SSRProductSection';
import SymmetricalContentSection from '@/components/SymmetricalContentSection';
import GuidesSection from '@/components/GuidesSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FAQSchema from '@/components/FAQSchema';
import { getSEOTags, renderSchemaTag } from '@/lib/seo-core';
import { getHomepageSEOTemplate } from '@/lib/seo-templates';

export const metadata: Metadata = getSEOTags('homepage', getHomepageSEOTemplate());

// Enable aggressive caching for better performance
export const revalidate = 3600; // Revalidate every hour
export const fetchCache = 'force-cache'; // Force cache for all fetch requests

export default function Home() {
  return (
    <>
      {/* Organization Schema */}
      {renderSchemaTag('organization', {})}
      
      {/* Website Schema */}
      {renderSchemaTag('website', {})}
      
      <div id="boxed-wrapper" className="page-transition">
        <div id="wrapper" className="fusion-wrapper">
          
          {/* Header */}
          <Header />
        
        {/* Homepage Grid Layout */}
        <div className="fade-in">
          <HomepageGrid />
        </div>
        
        {/* Product Section */}
        <div className="fade-in-delay-1">
          <SSRProductSection />
        </div>

        {/* Symmetrical Content Section with TOC */}
        <div className="fade-in-delay-2">
          <SymmetricalContentSection />
        </div>

        {/* Guides Section */}
        <div className="fade-in-delay-3">
          <GuidesSection />
        </div>

        {/* Footer */}
        <Footer />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
        
        {/* FAQ Schema - moved to head */}
        <FAQSchema />
        </div>
      </div>
    </>
  );
}
