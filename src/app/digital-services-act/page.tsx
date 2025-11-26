'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DigitalServicesAct() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .page-main-content {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 40px 0 !important;
          }
          .page-sidebar {
            width: 100% !important;
            min-width: 100% !important;
            order: 2 !important;
          }
          .page-main-text {
            width: 100% !important;
            order: 1 !important;
          }
          .page-sidebar h3 {
            font-size: 20px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          .page-sidebar ul {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 15px !important;
          }
          .page-sidebar li {
            margin-bottom: 0 !important;
          }
          .page-sidebar a {
            padding: 10px 15px !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            background: #f9fafb !important;
            text-align: center !important;
            min-width: 120px !important;
          }
          .page-main-text h2 {
            font-size: 28px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          .page-main-text h3 {
            font-size: 20px !important;
            margin-bottom: 15px !important;
          }
          .page-main-text p {
            font-size: 15px !important;
            line-height: 1.5 !important;
            margin-bottom: 20px !important;
          }
          .page-main-text ul {
            padding-left: 15px !important;
          }
          .page-main-text li {
            font-size: 15px !important;
            margin-bottom: 10px !important;
          }
          .newsletter-section h2 {
            font-size: 24px !important;
          }
          .newsletter-section p {
            font-size: 14px !important;
          }
          .newsletter-form {
            flex-direction: column !important;
            max-width: 300px !important;
          }
          .newsletter-form input {
            border-radius: 8px !important;
            margin-bottom: 10px !important;
          }
          .newsletter-form button {
            border-radius: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .page-main-text h2 {
            font-size: 24px !important;
          }
          .page-main-text h3 {
            font-size: 18px !important;
          }
          .page-sidebar h3 {
            font-size: 18px !important;
          }
          .page-sidebar a {
            font-size: 14px !important;
            padding: 8px 12px !important;
            min-width: 100px !important;
          }
          .newsletter-section h2 {
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
                    Learn more
                  </h3>
                </div>
                <nav className="fusion-menu">
                  <ul className="fusion-menu-list" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/how-to-use" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Getting started
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/safe-online-shopping" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Safe online shopping
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
                        Membership
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/frequently-asked-questions" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Frequently asked questions
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/terms-and-conditions" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Policies & privacy
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/terms-and-conditions" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Privacy settings
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/digital-services-act" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Digital Services Act (DSA)
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
                    Digital Services Act (DSA)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Nicotine Pouches Comparison complies with the European Union's Digital Services Act (DSA), which establishes new rules for online platforms and services. We are committed to transparency, user safety, and responsible content moderation.</p>
                  
                  <p>The DSA aims to create a safer digital space where the fundamental rights of users are protected, and to establish a level playing field for businesses. As a comparison service, we take our responsibilities under this regulation seriously.</p>
                  
                  <p>We have implemented measures to ensure compliance with DSA requirements, including transparent reporting, content moderation policies, and user protection mechanisms.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Our DSA Compliance
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Transparency Reporting:</strong> We provide regular reports on our content moderation activities and decisions.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>User Rights Protection:</strong> We respect and protect the fundamental rights of our users.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Content Moderation:</strong> We have clear policies and procedures for content moderation and user safety.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Dispute Resolution:</strong> We provide mechanisms for users to appeal content moderation decisions.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Data Protection:</strong> We comply with all applicable data protection regulations, including GDPR.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We continuously monitor and update our practices to ensure full compliance with the DSA and other applicable regulations. Our commitment to user safety and platform integrity remains our top priority.</p>
                  
                  <p>If you have any questions about our DSA compliance or would like to report content that may violate our policies, please contact us through our designated channels.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>We believe that responsible platform governance benefits everyone. By adhering to DSA requirements, we create a safer, more transparent environment for our users and partners.</p>
                  
                  <p>For more information about the Digital Services Act and how it affects our services, please refer to our detailed compliance documentation or contact our legal team.</p>
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
