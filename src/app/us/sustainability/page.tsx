'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USSustainability() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-sustainability-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-sustainability-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-sustainability-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-sustainability-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-sustainability-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-sustainability-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-sustainability-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-sustainability-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-sustainability-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-sustainability-content ul {
            margin-bottom: 20px !important;
          }
          .us-sustainability-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-sustainability-container {
            padding: 0 10px !important;
          }
          .us-sustainability-content h1 {
            font-size: 24px !important;
          }
          .us-sustainability-content h2 {
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
          <div className="us-sustainability-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-sustainability-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
            <div className="us-sustainability-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Sustainability at Nicotine Pouches Comparison (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>At Nicotine Pouches Comparison US, we are committed to promoting sustainable practices within the nicotine pouch industry in the United States. We believe that environmental responsibility and consumer education go hand in hand.</p>
                  
                  <p>Our platform not only helps you find the best nicotine pouches available in the US but also provides information about environmentally conscious brands and sustainable packaging options. We understand the importance of making informed choices that benefit both you and the planet.</p>
                  
                  <p>We work closely with US manufacturers and retailers who share our commitment to sustainability, ensuring that our recommendations include products from companies that prioritize environmental responsibility and comply with US environmental standards.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Our Sustainability Initiatives
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Eco-Friendly Brand Promotion:</strong> We highlight US brands that use sustainable packaging and environmentally friendly practices.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Recycling Information:</strong> We provide guidance on proper disposal and recycling of nicotine pouch packaging in the US.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Carbon Footprint Awareness:</strong> We help you understand the environmental impact of different US products and brands.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Sustainable Alternatives:</strong> We showcase US products that offer more sustainable options without compromising quality.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Environmental Compliance:</strong> We ensure all recommended products meet US environmental standards and regulations.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We believe that every small step towards sustainability makes a difference. By choosing products from environmentally conscious US brands and properly disposing of packaging, we can all contribute to a more sustainable future.</p>
                  
                  <p>Our commitment to sustainability extends beyond just product recommendations. We continuously work to improve our own environmental footprint and support initiatives that promote sustainability in the US nicotine pouch industry.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Together, we can make a positive impact on the environment while still enjoying the products we love. Join us in our mission to promote sustainability within the US nicotine pouch community.</p>
                  
                  <p>Thank you for being part of our sustainable journey and for making environmentally conscious choices in your nicotine pouch purchases in the United States.</p>
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
