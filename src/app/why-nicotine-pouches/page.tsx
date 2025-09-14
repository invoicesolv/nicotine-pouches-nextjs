import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SignupForm from '@/components/SignupForm';

export default function WhyNicotinePouches() {
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
                    Business
                  </h3>
                </div>
                <nav className="fusion-menu">
                  <ul className="fusion-menu-list" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <a href="/why-nicotine-pouches" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
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
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
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
            <div className="fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Why Nicotine Pouches?
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Nicotine pouches offer a modern, discreet, and convenient way to enjoy nicotine without the harmful effects of smoking. They provide a clean alternative that fits seamlessly into your lifestyle while delivering the satisfaction you're looking for.</p>
                  
                  <p>Unlike traditional tobacco products, nicotine pouches don't require spitting, produce no smoke or vapor, and can be used virtually anywhere. This makes them an ideal choice for people who want to enjoy nicotine without the social stigma or health concerns associated with smoking.</p>
                  
                  <p>With a wide variety of flavors, strengths, and brands available, nicotine pouches offer something for everyone, whether you're looking for a mild experience or something more intense.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Key Benefits
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Discreet Use:</strong> Small, white pouches that are virtually invisible when in use.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>No Spitting Required:</strong> Unlike traditional snus, nicotine pouches don't require spitting.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Variety of Flavors:</strong> From mint and fruit to coffee and tobacco, there's a flavor for every taste.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Different Strengths:</strong> Choose from mild to extra strong options to match your preferences.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Long-Lasting:</strong> Effects can last 30-60 minutes, providing sustained satisfaction.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Nicotine pouches are particularly popular among people who are looking to quit smoking or reduce their tobacco consumption. They provide a way to satisfy nicotine cravings without the harmful effects of combustion and smoke inhalation.</p>
                  
                  <p>Many users find that nicotine pouches help them transition away from traditional tobacco products while still enjoying the benefits of nicotine in a cleaner, more socially acceptable way.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Whether you're new to nicotine pouches or looking to explore different options, our comprehensive comparison tool helps you find the perfect product for your needs and preferences.</p>
                  
                  <p>Discover why millions of people worldwide have made the switch to nicotine pouches and find your ideal match today.</p>
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
                
                <SignupForm 
                  source="why-nicotine-pouches"
                  placeholder="Your email*"
                  buttonText="Submit"
                />
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
