'use client';

import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export default function USAboutUs() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-about-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-about-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-about-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-about-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-about-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-about-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-about-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-about-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-about-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-about-content ul {
            margin-bottom: 20px !important;
          }
          .us-about-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-about-container {
            padding: 0 10px !important;
          }
          .us-about-content h1 {
            font-size: 24px !important;
          }
          .us-about-content h2 {
            font-size: 20px !important;
          }
        }
      `}</style>
      
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
          <div className="us-about-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-about-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
                      <Link href="/us/about-us" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        About us
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/us/contact-us" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Contact us
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/us/become-a-member" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Become a Member
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="us-about-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    About Nicotine Pouches Comparison (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Welcome to Nicotine Pouches Comparison US, your trusted destination for comprehensive and unbiased nicotine pouch reviews and comparisons in the United States. We are dedicated to providing you with the most accurate, up-to-date information to help you make informed decisions about your nicotine pouch purchases.</p>
                  
                  <p>Our mission is to simplify the complex world of nicotine pouches by offering detailed comparisons, honest reviews, and expert insights tailored for the US market. Whether you're a seasoned user or new to nicotine pouches, our platform is designed to help you find the perfect product that matches your preferences and needs.</p>
                  
                  <p>At Nicotine Pouches Comparison US, we understand that choosing the right nicotine pouch can be overwhelming with the vast array of options available in the US market. That's why we've created a user-friendly platform that brings together information from various brands, flavors, and strengths in one convenient location.</p>
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
                      <strong>US Market Focus:</strong> Specialized in nicotine pouch brands and products available in the United States.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Comprehensive Listings:</strong> Explore a wide range of nicotine pouch brands and flavors available in the US.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>User-Friendly Interface:</strong> Navigate our intuitive tool effortlessly to find exactly what you're looking for.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Up-to-Date Information:</strong> Stay informed about the latest product releases and reviews in the US market.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Join thousands of US users who trust Nicotine Pouches Comparison for their nicotine pouch research and purchasing decisions. Our commitment to accuracy, transparency, and user satisfaction sets us apart in the industry.</p>
                  
                  <p>Explore, compare, and discover your ideal nicotine pouch today. We're here to guide you every step of the way in the US market.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Founded with the vision of creating a comprehensive resource for nicotine pouch enthusiasts in the United States, Nicotine Pouches Comparison US has grown to become a trusted platform for consumers seeking reliable information and honest reviews.</p>
                  
                  <p>We believe that everyone deserves access to accurate, unbiased information when making purchasing decisions. That's why we've built our platform with transparency and user experience at its core, ensuring that you have all the tools you need to make informed choices about your nicotine pouch purchases in the US market.</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}
