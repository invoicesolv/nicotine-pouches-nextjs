'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FrequentlyAskedQuestions() {
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

        <main id="main-content">
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
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
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
                        Policies & privacy
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
                        Privacy settings
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
                    Frequently Asked Questions
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Find answers to the most common questions about nicotine pouches, our platform, and how to make the best purchasing decisions. Our comprehensive FAQ section covers everything you need to know.</p>
                  
                  <p>If you can't find the answer you're looking for, don't hesitate to contact our support team. We're here to help you with any questions or concerns you may have.</p>
                  
                  <p>Our FAQ section is regularly updated to include new questions and provide the most current information about nicotine pouches and our services.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Common Questions
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>What are nicotine pouches?</strong> Nicotine pouches are small, white pouches containing nicotine and other ingredients that you place between your gum and lip.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>How do I choose the right strength?</strong> Start with lower strengths and gradually increase based on your tolerance and preferences.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Are nicotine pouches safe?</strong> When used as directed, nicotine pouches are considered a safer alternative to smoking, but they still contain nicotine.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>How long do the effects last?</strong> The effects typically last 30-60 minutes, depending on the strength and your tolerance.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Can I use nicotine pouches while driving?</strong> Yes, nicotine pouches are designed for discreet use and can be used while driving or working.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We understand that choosing the right nicotine pouch can be overwhelming, especially if you're new to the product. Our comparison tool and detailed reviews are designed to help you make informed decisions.</p>
                  
                  <p>If you have specific questions about a particular brand or product, our detailed product pages provide comprehensive information to help you understand what you're purchasing.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Remember, everyone's experience with nicotine pouches is different. What works for one person may not work for another, so it's important to find products that suit your individual preferences and needs.</p>
                  
                  <p>For additional support or personalized recommendations, feel free to reach out to our customer service team who are always ready to help.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}
