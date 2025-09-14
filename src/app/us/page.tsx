import Header from '@/components/Header';
import HomepageGrid from '@/components/HomepageGrid';
import USProductSection from '@/components/USProductSection';
import USSymmetricalContentSection from '@/components/USSymmetricalContentSection';
import Footer from '@/components/Footer';

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
      </div>
    </div>
  );
}
