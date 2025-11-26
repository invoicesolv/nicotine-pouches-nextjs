import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { generateAboutPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';
import './about-us.css';

export default function AboutUs() {
  return (
      <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <div className="fusion-fullwidth fullwidth-box fusion-builder-row-1 fusion-flex-container has-pattern-background has-mask-background hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
             style={{
               backgroundColor: 'white',
               padding: '60px 0',
               width: '100vw',
               marginLeft: 'calc(50% - 50vw)',
               marginRight: 'calc(50% - 50vw)'
             }}>
          <div className="page-main-content fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="page-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
                 style={{ width: '25%', minWidth: '250px' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-1 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '30px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    About us
                  </h3>
                </div>
                <nav className="fusion-menu">
                  <ul className="fusion-menu-list" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/about-us" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        About us
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/contact-us" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Contact us
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/become-a-member" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Become a Member
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="page-main-text fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    About Nicotine Pouches Comparison
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Welcome to Nicotine Pouches Comparison, your trusted destination for comprehensive and unbiased nicotine pouch reviews and comparisons. We are dedicated to providing you with the most accurate, up-to-date information to help you make informed decisions about your nicotine pouch purchases.</p>
                  
                  <p>Our mission is to simplify the complex world of nicotine pouches by offering detailed comparisons, honest reviews, and expert insights. Whether you're a seasoned user or new to nicotine pouches, our platform is designed to help you find the perfect product that matches your preferences and needs.</p>
                  
                  <p>At Nicotine Pouches Comparison, we understand that choosing the right nicotine pouch can be overwhelming with the vast array of options available in the market. That's why we've created a user-friendly platform that brings together information from various brands, flavors, and strengths in one convenient location.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Why choose us?
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Comprehensive Listings:</strong> Explore a wide range of nicotine pouch brands and flavors in one place.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>User-Friendly Interface:</strong> Navigate our intuitive tool effortlessly to find exactly what you're looking for.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Up-to-Date Information:</strong> Stay informed about the latest product releases and reviews.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Join thousands of users who trust Nicotine Pouches Comparison for their nicotine pouch research and purchasing decisions. Our commitment to accuracy, transparency, and user satisfaction sets us apart in the industry.</p>
                  
                  <p>Explore, compare, and discover your ideal nicotine pouch today. We're here to guide you every step of the way.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Founded with the vision of creating a comprehensive resource for nicotine pouch enthusiasts, Nicotine Pouches Comparison has grown to become a trusted platform for consumers seeking reliable information and honest reviews. Our team of experts is passionate about nicotine pouches and dedicated to helping you find the perfect product.</p>
                  
                  <p>We believe that everyone deserves access to accurate, unbiased information when making purchasing decisions. That's why we've built our platform with transparency and user experience at its core, ensuring that you have all the tools you need to make informed choices about your nicotine pouch purchases.</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const metaData = pageMetaToMetadata(generateAboutPageMeta());
  return metaData;
}
