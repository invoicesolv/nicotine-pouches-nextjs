'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USCareers() {
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .us-careers-container {
            flex-direction: column !important;
            gap: 30px !important;
            padding: 0 15px !important;
          }
          .us-careers-sidebar {
            width: 100% !important;
            min-width: auto !important;
            order: 2 !important;
          }
          .us-careers-content {
            width: 100% !important;
            order: 1 !important;
          }
          .us-careers-sidebar h3 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          .us-careers-sidebar ul li {
            margin-bottom: 10px !important;
          }
          .us-careers-sidebar ul li a {
            font-size: 14px !important;
            padding: 6px 0 !important;
          }
          .us-careers-content h1 {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          .us-careers-content h2 {
            font-size: 22px !important;
            margin: 30px 0 15px 0 !important;
          }
          .us-careers-content p {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }
          .us-careers-content ul {
            margin-bottom: 20px !important;
          }
          .us-careers-content ul li {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .us-careers-container {
            padding: 0 10px !important;
          }
          .us-careers-content h1 {
            font-size: 24px !important;
          }
          .us-careers-content h2 {
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
          <div className="us-careers-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-careers-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
            <div className="us-careers-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Careers at Nicotine Pouches Comparison (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Join our team and help us revolutionize the way people discover and compare nicotine pouches in the United States. We're looking for passionate individuals who share our commitment to providing accurate, unbiased information and exceptional user experiences for the US market.</p>
                  
                  <p>At Nicotine Pouches Comparison US, we believe that our team is our greatest asset. We foster a collaborative, innovative environment where every team member can make a meaningful impact on our mission to simplify nicotine pouch shopping for consumers in the United States.</p>
                  
                  <p>We offer competitive benefits, flexible working arrangements, and opportunities for professional growth in a fast-paced, dynamic industry focused on the US market.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Why Work With Us
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Market Focus:</strong> Work on cutting-edge technology and innovative solutions specifically for the US nicotine pouch market.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Innovation Focus:</strong> Work on cutting-edge technology and innovative solutions in the comparison shopping space.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Growth Opportunities:</strong> Advance your career with clear growth paths and professional development support.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Flexible Work:</strong> Enjoy flexible working arrangements and work-life balance.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Competitive Benefits:</strong> Receive competitive salary, health benefits, and other perks.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Impact:</strong> Make a real difference in helping US consumers make informed purchasing decisions.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We're always looking for talented individuals to join our US team. Whether you're a developer, designer, marketer, or have expertise in the nicotine pouch industry, we'd love to hear from you.</p>
                  
                  <p>Our current openings include positions in software development, product management, content creation, and business development focused on the US market. Check our job board regularly for new opportunities.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>If you don't see a position that matches your skills but believe you'd be a great fit for our US team, we encourage you to send us your resume and a cover letter explaining how you could contribute to our mission in the United States.</p>
                  
                  <p>Join us in building the future of nicotine pouch comparison shopping in the US and help millions of users make better purchasing decisions.</p>
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
