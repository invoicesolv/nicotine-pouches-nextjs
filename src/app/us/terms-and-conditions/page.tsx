'use client';

import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USTermsAndConditions() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-terms-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-terms-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-terms-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-terms-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-terms-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-terms-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-terms-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-terms-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-terms-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-terms-content ul {
            margin-bottom: 20px !important;
          }
          .us-terms-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-terms-container {
            padding: 0 10px !important;
          }
          .us-terms-content h1 {
            font-size: 24px !important;
          }
          .us-terms-content h2 {
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
          <div className="us-terms-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-terms-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
            <div className="us-terms-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Terms and Conditions (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Welcome to Nicotine Pouches Comparison US. These terms and conditions outline the rules and regulations for the use of our website and services in the United States. By accessing this website, you accept these terms and conditions in full.</p>
                  
                  <p>If you do not agree with any part of these terms and conditions, you must not use our website or services. We reserve the right to modify these terms at any time, and your continued use of the website constitutes acceptance of any changes.</p>
                  
                  <p>Please read these terms carefully before using our services. Your use of our website is subject to these terms and our privacy policy, and you must comply with all applicable US laws and regulations.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Use of Our Service
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Eligibility:</strong> You must be at least 21 years old to use our services and purchase nicotine products in the United States.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Accurate Information:</strong> You agree to provide accurate and complete information when using our services.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Prohibited Uses:</strong> You may not use our website for any unlawful purpose or to solicit others to perform unlawful acts.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Intellectual Property:</strong> All content on our website is protected by copyright and other intellectual property laws.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>User Accounts:</strong> You are responsible for maintaining the confidentiality of your account information.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Compliance:</strong> You must comply with all applicable US federal, state, and local laws and regulations.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We provide information and comparison services for nicotine pouches available in the United States. We do not sell nicotine products directly, but we may receive compensation from US retailers when you make purchases through our links.</p>
                  
                  <p>We strive to provide accurate and up-to-date information about US-available products, but we cannot guarantee the accuracy, completeness, or timeliness of all information on our website.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions. If you have any questions about these terms, please contact us.</p>
                  
                  <p>These terms are governed by the laws of the United States and any disputes will be subject to the exclusive jurisdiction of the courts of the United States.</p>
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
