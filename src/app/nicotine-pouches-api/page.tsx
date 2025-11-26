'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NicotinePouchesApi() {
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
                    Business
                  </h3>
                </div>
                <nav className="fusion-menu">
                  <ul className="fusion-menu-list" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/why-nicotine-pouches" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Why Nicotine Pouches?
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/dashboard" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Register your store
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/dashboard" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Login for stores
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/dashboard" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Register your brand
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/dashboard" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Login for brands
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="#" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Advertise with us
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/nicotine-pouches-api" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Nicotine Pouches API
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
                    Nicotine Pouches API
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We're excited to announce that our comprehensive nicotine pouches API is coming soon! This powerful tool will provide developers, retailers, and businesses with reliable access to our extensive nicotine pouch database.</p>
                  
                  <p>Our upcoming API will offer real-time product information, pricing data, and availability across multiple retailers all in one convenient place. Whether you're building a comparison tool, integrating product information into your website, or developing a mobile app, our API will have you covered.</p>
                  
                  <p>We're working hard to ensure our API provides the most current and accurate information about nicotine pouches, prices, and availability when it launches.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Planned API Features
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Product Information:</strong> Access detailed product data including flavors, strengths, and specifications.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Real-time Pricing:</strong> Get up-to-date pricing information from multiple retailers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Availability Status:</strong> Check stock levels and availability across different retailers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Brand Information:</strong> Access comprehensive brand data and product catalogs.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Easy Integration:</strong> RESTful API with clear documentation and examples.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Our API is being built with scalability and reliability in mind. We'll provide comprehensive documentation, code examples, and support to help you integrate our data into your applications quickly and efficiently.</p>
                  
                  <p>Whether you're a small business looking to add product information to your website or a large enterprise building a comprehensive comparison platform, our API will scale to meet your needs.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Stay tuned for updates on our API launch! We'll be announcing availability, pricing, and how to get started with your integration very soon.</p>
                  
                  <p>Contact us if you'd like to be notified when our API becomes available or if you have specific requirements you'd like us to consider.</p>
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
