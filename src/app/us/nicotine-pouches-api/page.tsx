import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USNicotinePouchesApi() {
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
          <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
                      <a href="/us/about-us" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        About us
                      </a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/us/contact-us" style={{ 
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
                      <a href="/us/become-a-member" style={{ 
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
            <div className="fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Nicotine Pouches API (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We're excited to announce that our comprehensive nicotine pouches API for the US market is coming soon! This powerful tool will provide developers, retailers, and businesses with reliable access to our extensive nicotine pouch database focused on US-available products.</p>
                  
                  <p>Our upcoming API will offer real-time product information, pricing data, and availability across multiple US retailers all in one convenient place. Whether you're building a comparison tool, integrating product information into your website, or developing a mobile app, our API will have you covered with US market data.</p>
                  
                  <p>We're working hard to ensure our API provides the most current and accurate information about nicotine pouches, prices, and availability in the United States when it launches.</p>
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
                      <strong>US Product Information:</strong> Access detailed product data for US-available brands including flavors, strengths, and specifications.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Real-time US Pricing:</strong> Get up-to-date pricing information from multiple US retailers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Availability Status:</strong> Check stock levels and availability across different US retailers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Brand Information:</strong> Access comprehensive brand data and product catalogs for US market.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Easy Integration:</strong> RESTful API with clear documentation and examples for US developers.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Regulatory Compliance:</strong> Ensure all data complies with US regulations and age restrictions.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Our API is being built with scalability and reliability in mind, specifically tailored for the US market. We'll provide comprehensive documentation, code examples, and support to help you integrate our US data into your applications quickly and efficiently.</p>
                  
                  <p>Whether you're a small business looking to add US product information to your website or a large enterprise building a comprehensive comparison platform for the US market, our API will scale to meet your needs.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Stay tuned for updates on our US API launch! We'll be announcing availability, pricing, and how to get started with your integration very soon.</p>
                  
                  <p>Contact us if you'd like to be notified when our US API becomes available or if you have specific requirements you'd like us to consider for the US market.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="fusion-fullwidth fullwidth-box fusion-builder-row-2 fusion-flex-container has-pattern-background has-mask-background hundred-percent-fullwidth non-hundred-percent-height-scrolling" 
             style={{
               backgroundColor: '#1a1a1a',
               padding: '60px 0',
               width: '100vw',
               marginLeft: 'calc(50% - 50vw)',
               marginRight: 'calc(50% - 50vw)'
             }}>
          <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-justify-content-center fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 textAlign: 'center'
               }}>
            <div className="fusion-layout-column fusion_builder_column fusion-builder-column-1 fusion-flex-column" 
                 style={{ width: '100%' }}>
              <div className="fusion-column-wrapper">
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  margin: '0 0 16px 0',
                  color: 'white'
                }}>
                  Subscribe to our newsletter
                </h2>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#ccc', 
                  margin: '0 0 32px 0',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Easily keep up with the latest with Nicotine Pouches. We handpick the best in product news, trends and store deals.
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <input 
                    type="email" 
                    placeholder="Your email*" 
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px 0 0 8px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit" 
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Submit
                  </button>
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
