import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function USFrequentlyAskedQuestions() {
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
                    Frequently Asked Questions (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Find answers to the most common questions about nicotine pouches, our platform, and how to make the best purchasing decisions in the US market. Our comprehensive FAQ section covers everything you need to know.</p>
                  
                  <p>If you can't find the answer you're looking for, don't hesitate to contact our support team. We're here to help you with any questions or concerns you may have about US-available products.</p>
                  
                  <p>Our FAQ section is regularly updated to include new questions and provide the most current information about nicotine pouches and our services in the United States.</p>
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
                      <strong>Are nicotine pouches legal in the US?</strong> Yes, nicotine pouches are legal in the United States and can be purchased by adults 21 and over.
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
                    <li style={{ marginBottom: '15px' }}>
                      <strong>What brands are available in the US?</strong> Popular brands include ZYN, Velo, ON!, Rogue, and Swedish Match products.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>We understand that choosing the right nicotine pouch can be overwhelming, especially if you're new to the product. Our comparison tool and detailed reviews are designed to help you make informed decisions about US-available products.</p>
                  
                  <p>If you have specific questions about a particular brand or product available in the US, our detailed product pages provide comprehensive information to help you understand what you're purchasing.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>Remember, everyone's experience with nicotine pouches is different. What works for one person may not work for another, so it's important to find products that suit your individual preferences and needs.</p>
                  
                  <p>For additional support or personalized recommendations about US products, feel free to reach out to our customer service team who are always ready to help.</p>
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
