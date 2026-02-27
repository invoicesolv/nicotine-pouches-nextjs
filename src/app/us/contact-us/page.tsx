'use client';

import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USContactUs() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-contact-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-contact-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-contact-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-contact-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-contact-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-contact-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-contact-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-contact-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-contact-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-contact-content ul {
            margin-bottom: 20px !important;
          }
          .us-contact-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-contact-container {
            padding: 0 10px !important;
          }
          .us-contact-content h1 {
            font-size: 24px !important;
          }
          .us-contact-content h2 {
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
          <div className="us-contact-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-contact-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        About us
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/us/contact-us" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
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
            <div className="us-contact-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Contact Nicotine Pouches Comparison (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We'd love to hear from you! Whether you have questions about our platform, suggestions for improvement, or need assistance with your nicotine pouch research in the US market, our team is here to help.</p>
                  
                  <p>At Nicotine Pouches Comparison US, we value your feedback and are committed to providing excellent customer service. Our knowledgeable team is ready to assist you with any inquiries you may have about US-available products.</p>
                  
                  <p>Feel free to reach out to us through any of the contact methods below, and we'll get back to you as soon as possible.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Get in Touch
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Email Support:</strong> Contact us via email for detailed inquiries and support about US products.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Quick Response:</strong> We typically respond to all inquiries within 24 hours.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Expert Advice:</strong> Our team includes nicotine pouch experts familiar with the US market.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Your satisfaction is our priority. We're committed to providing you with the best possible experience on our platform and ensuring that all your questions about US nicotine pouch products are answered thoroughly.</p>
                  
                  <p>Don't hesitate to contact us if you need any assistance or have suggestions for how we can improve our service for US users.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>We believe that open communication is key to building a strong community of nicotine pouch enthusiasts in the United States. Whether you're a first-time visitor or a long-time user, we want to make sure you have the best possible experience on our platform.</p>
                  
                  <p>Thank you for choosing Nicotine Pouches Comparison as your trusted resource for nicotine pouch information and comparisons in the US market.</p>
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
