'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USWhyNicotinePouches() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-why-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-why-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-why-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-why-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-why-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-why-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-why-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-why-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-why-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-why-content ul {
            margin-bottom: 20px !important;
          }
          .us-why-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-why-container {
            padding: 0 10px !important;
          }
          .us-why-content h1 {
            font-size: 24px !important;
          }
          .us-why-content h2 {
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
          <div className="us-why-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-why-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
            <div className="us-why-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Why Nicotine Pouches? (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Nicotine pouches offer a modern, discreet, and convenient way to enjoy nicotine without the harmful effects of smoking. They provide a clean alternative that fits seamlessly into your lifestyle while delivering the satisfaction you're looking for, all while complying with US regulations.</p>
                  
                  <p>Unlike traditional tobacco products, nicotine pouches don't require spitting, produce no smoke or vapor, and can be used virtually anywhere in the United States where permitted. This makes them an ideal choice for people who want to enjoy nicotine without the social stigma or health concerns associated with smoking.</p>
                  
                  <p>With a wide variety of flavors, strengths, and brands available in the US market, nicotine pouches offer something for everyone, whether you're looking for a mild experience or something more intense.</p>
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
                      <strong>Variety of Flavors:</strong> From mint and fruit to coffee and tobacco, there's a flavor for every taste in the US market.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Different Strengths:</strong> Choose from mild to extra strong options to match your preferences.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Long-Lasting:</strong> Effects can last 30-60 minutes, providing sustained satisfaction.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Legal:</strong> Nicotine pouches are legal for adults 21+ in the United States.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Nicotine pouches are particularly popular among people in the US who are looking to quit smoking or reduce their tobacco consumption. They provide a way to satisfy nicotine cravings without the harmful effects of combustion and smoke inhalation.</p>
                  
                  <p>Many US users find that nicotine pouches help them transition away from traditional tobacco products while still enjoying the benefits of nicotine in a cleaner, more socially acceptable way that complies with US regulations.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Whether you're new to nicotine pouches or looking to explore different US-available options, our comprehensive comparison tool helps you find the perfect product for your needs and preferences.</p>
                  
                  <p>Discover why millions of people in the United States have made the switch to nicotine pouches and find your ideal match today.</p>
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
