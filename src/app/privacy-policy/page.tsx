import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <>
      <style>{`
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
                      <Link href="/how-to-use" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Getting started
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/safe-online-shopping" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Safe online shopping
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/become-a-member" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Membership
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/frequently-asked-questions" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Frequently asked questions
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/terms-and-conditions" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Terms and conditions
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/privacy-policy" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Privacy policy
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/digital-services-act" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Digital Services Act (DSA)
                      </Link>
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
                    Privacy Policy
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p><strong>Last Updated:</strong> {lastUpdated}</p>
                  
                  <p>At Nicotine Pouches Comparison, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
                  
                  <p>By using our website, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our services.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Information We Collect
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We collect information that you provide directly to us and information that is automatically collected when you use our services:</p>
                  
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Personal Information:</strong> When you create an account, subscribe to our newsletter, or contact us, we may collect your name, email address, and other contact information.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Usage Data:</strong> We automatically collect information about how you interact with our website, including pages visited, time spent on pages, and links clicked.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Device Information:</strong> We collect information about your device, including IP address, browser type, operating system, and device identifiers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track your activity on our website and store certain information.
                    </li>
                  </ul>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    How We Use Your Information
                  </h3>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We use the information we collect for various purposes, including:</p>
                  
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>To provide, maintain, and improve our services</li>
                    <li style={{ marginBottom: '15px' }}>To process your requests and transactions</li>
                    <li style={{ marginBottom: '15px' }}>To send you newsletters, updates, and promotional communications (with your consent)</li>
                    <li style={{ marginBottom: '15px' }}>To analyze usage patterns and improve user experience</li>
                    <li style={{ marginBottom: '15px' }}>To detect, prevent, and address technical issues and security threats</li>
                    <li style={{ marginBottom: '15px' }}>To comply with legal obligations and enforce our terms</li>
                  </ul>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Information Sharing and Disclosure
                  </h3>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                  
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>With service providers who assist us in operating our website and conducting our business</li>
                    <li style={{ marginBottom: '15px' }}>When required by law or to respond to legal process</li>
                    <li style={{ marginBottom: '15px' }}>To protect our rights, property, or safety, or that of our users</li>
                    <li style={{ marginBottom: '15px' }}>In connection with a business transfer, merger, or acquisition</li>
                    <li style={{ marginBottom: '15px' }}>With your consent or at your direction</li>
                  </ul>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Your Rights and Choices
                  </h3>
                </div>

                <div className="fusion-text fusion-text-5" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>You have certain rights regarding your personal information, including:</p>
                  
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>The right to access and receive a copy of your personal data</li>
                    <li style={{ marginBottom: '15px' }}>The right to rectify inaccurate or incomplete information</li>
                    <li style={{ marginBottom: '15px' }}>The right to request deletion of your personal data</li>
                    <li style={{ marginBottom: '15px' }}>The right to object to processing of your personal data</li>
                    <li style={{ marginBottom: '15px' }}>The right to data portability</li>
                    <li style={{ marginBottom: '15px' }}>The right to withdraw consent at any time</li>
                  </ul>
                  
                  <p>To exercise these rights, please contact us using the information provided below.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Data Security
                  </h3>
                </div>

                <div className="fusion-text fusion-text-6" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Cookies and Tracking Technologies
                  </h3>
                </div>

                <div className="fusion-text fusion-text-7" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Changes to This Privacy Policy
                  </h3>
                </div>

                <div className="fusion-text fusion-text-8" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Contact Us
                  </h3>
                </div>

                <div className="fusion-text fusion-text-9" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                  
                  <p>
                    <strong>Email:</strong> <Link href="/contact-us" style={{ color: '#22c55e', textDecoration: 'none' }}>Contact Us</Link><br />
                    <strong>Website:</strong> <Link href="/contact-us" style={{ color: '#22c55e', textDecoration: 'none' }}>https://nicotine-pouches.org/contact-us</Link>
                  </p>
                  
                  <p>This Privacy Policy is governed by the laws of the United Kingdom and the European Union General Data Protection Regulation (GDPR).</p>
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

