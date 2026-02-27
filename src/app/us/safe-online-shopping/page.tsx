'use client';

import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USSafeOnlineShopping() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-safe-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-safe-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-safe-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-safe-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-safe-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-safe-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-safe-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-safe-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-safe-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-safe-content ul {
            margin-bottom: 20px !important;
          }
          .us-safe-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-safe-container {
            padding: 0 10px !important;
          }
          .us-safe-content h1 {
            font-size: 24px !important;
          }
          .us-safe-content h2 {
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
          <div className="us-safe-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-safe-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
            <div className="us-safe-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Safe Online Shopping (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Your safety and security are our top priorities when shopping for nicotine pouches online in the United States. We've compiled essential tips and guidelines to help you make secure purchases and protect your personal information while complying with US regulations.</p>
                  
                  <p>At Nicotine Pouches Comparison US, we only recommend trusted retailers and verified sellers who meet our strict security and quality standards for the US market. We thoroughly vet each partner to ensure they provide a safe and secure shopping experience while following US laws.</p>
                  
                  <p>When shopping online for nicotine pouches in the US, it's important to be aware of potential risks and take appropriate precautions to protect yourself and your personal information while ensuring compliance with age restrictions and regulations.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Safety Guidelines
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Verify Seller Authenticity:</strong> Always check that you're purchasing from authorized US retailers and verified sellers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Secure Payment Methods:</strong> Use trusted payment methods and avoid sharing sensitive information via email or phone.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Check Website Security:</strong> Look for HTTPS encryption and security certificates before entering personal information.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Read Reviews and Ratings:</strong> Check customer reviews and ratings to ensure the seller has a good reputation.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Understand Return Policies:</strong> Familiarize yourself with return and refund policies before making a purchase.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Age Verification:</strong> Ensure you're 21 or older and that the retailer verifies age appropriately.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Compliance:</strong> Verify that products comply with US regulations and are legally available in your state.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We work exclusively with verified US retailers who have demonstrated their commitment to customer safety and satisfaction while complying with all applicable US laws. All our recommended sellers undergo regular security audits and maintain high standards for data protection.</p>
                  
                  <p>If you ever encounter any issues with a recommended seller or have concerns about a transaction, please contact us immediately so we can investigate and take appropriate action.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Remember, if a deal seems too good to be true, it probably is. Always be cautious of unusually low prices or sellers requesting unusual payment methods, especially when dealing with age-restricted products.</p>
                  
                  <p>By following these guidelines and shopping through our verified US partners, you can enjoy a safe and secure online shopping experience for all your nicotine pouch needs while staying compliant with US regulations.</p>
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
