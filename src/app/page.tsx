import Header from '@/components/Header';
import HomepageGrid from '@/components/HomepageGrid';
import ProductSection from '@/components/ProductSection';
import SymmetricalContentSection from '@/components/SymmetricalContentSection';
import GuidesSection from '@/components/GuidesSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';

export default function Home() {
  return (
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
          <ProductSection />
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
      </div>
    </div>
  );
}
