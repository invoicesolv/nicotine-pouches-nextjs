import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SignupForm from '@/components/SignupForm';
import Link from 'next/link';
import { Metadata } from 'next';
import { generateUSBecomeMemberPageMeta, pageMetaToMetadata } from '@/lib/meta-generator';
import './us-become-member.css';

export default function USBecomeAMember() {
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
          <div className="us-member-container fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-content-wrap" 
               style={{
                 width: '100%',
                 maxWidth: '1200px',
                 margin: '0 auto',
                 padding: '0 20px',
                 display: 'flex',
                 gap: '60px'
               }}>
            
            {/* Sidebar */}
            <div className="us-member-sidebar fusion-layout-column fusion_builder_column fusion_builder_column_1_4 1_4 fusion-flex-column" 
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
                      <Link href="/us/about-us" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        About us
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/us/contact-us" style={{ 
                        color: '#666', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Contact us
                      </Link>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <Link href="/us/become-a-member" style={{ 
                        color: '#22c55e', 
                        textDecoration: 'none', 
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '8px 0',
                        display: 'block',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Become a Member
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="us-member-content fusion-layout-column fusion_builder_column fusion_builder_column_3_4 3_4 fusion-flex-column" 
                 style={{ width: '75%' }}>
              <div className="fusion-column-wrapper">
                <div className="fusion-title title fusion-title-2 fusion-sep-none fusion-title-text fusion-title-size-two" 
                     style={{ color: '#333', fontSize: '32px', marginBottom: '30px' }}>
                  <h2 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Become a Member (US)
                  </h2>
                </div>
                
                <div className="fusion-text fusion-text-1" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Join our community of nicotine pouch enthusiasts in the United States and unlock exclusive benefits! As a member of Nicotine Pouches Comparison US, you'll gain access to premium features, personalized recommendations, and a wealth of additional resources tailored for the US market.</p>
                  
                  <p>Our membership program is designed to enhance your nicotine pouch experience by providing you with tools and insights that help you make better purchasing decisions and discover new products that match your preferences in the US market.</p>
                  
                  <p>Whether you're a casual user or a serious enthusiast, becoming a member will give you access to exclusive content, early product reviews, and special offers from our partner retailers in the United States.</p>
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    How to Become a Member
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <div className="signup-steps" style={{ marginBottom: '30px' }}>
                    <div className="step" style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: '20px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div className="step-number" style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginRight: '15px',
                        flexShrink: 0
                      }}>
                        1
                      </div>
                      <div className="step-content">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>Enter Your Email</h4>
                        <p style={{ margin: '0', color: '#666' }}>Provide your email address in the form below. We'll use this to create your account and send you updates.</p>
                      </div>
                    </div>

                    <div className="step" style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: '20px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div className="step-number" style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginRight: '15px',
                        flexShrink: 0
                      }}>
                        2
                      </div>
                      <div className="step-content">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>Verify Your Email</h4>
                        <p style={{ margin: '0', color: '#666' }}>Check your inbox for a verification email and click the confirmation link to activate your account.</p>
                      </div>
                    </div>

                    <div className="step" style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: '20px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div className="step-number" style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginRight: '15px',
                        flexShrink: 0
                      }}>
                        3
                      </div>
                      <div className="step-content">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>Start Enjoying Benefits</h4>
                        <p style={{ margin: '0', color: '#666' }}>Once verified, you'll have immediate access to all member benefits and exclusive features.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="become-member-form" style={{
                  backgroundColor: '#ffffff',
                  padding: '30px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    marginBottom: '20px', 
                    color: '#333',
                    textAlign: 'center'
                  }}>
                    Sign Up Now
                  </h3>
                  <p style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    marginBottom: '25px',
                    fontSize: '16px'
                  }}>
                    Join thousands of US members and start enjoying exclusive benefits today!
                  </p>
                  <SignupForm 
                    source="us-become-member"
                    placeholder="Enter your email address"
                    buttonText="Become a Member"
                    className="become-member-signup-form"
                  />
                </div>

                <div className="fusion-title title fusion-title-3 fusion-sep-none fusion-title-text fusion-title-size-three" 
                     style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
                  <h3 className="fusion-title-heading title-heading-left" style={{ margin: '0', fontSize: '1em' }}>
                    Member Benefits
                  </h3>
                </div>

                <div className="fusion-text fusion-text-2" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>US Market Focus:</strong> Get early access to new product reviews and comparisons for US-available products.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Personalized Recommendations:</strong> Receive tailored suggestions based on your preferences and US market availability.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Member-Only Deals:</strong> Access special discounts and offers from our US partners.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Priority Support:</strong> Get faster response times for your inquiries and questions.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                      <strong>Advanced Search:</strong> Use our enhanced search tools to find exactly what you're looking for in the US market.
                    </li>
                  </ul>
                </div>

                <div className="fusion-text fusion-text-3" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                  <p>Membership is completely free and takes just a few minutes to set up. Simply create an account with your email address and start enjoying all the benefits of being part of our US community.</p>
                  
                  <p>Join thousands of satisfied US members who have enhanced their nicotine pouch experience through our platform.</p>
                </div>

                <div className="fusion-text fusion-text-4" style={{ color: '#333', lineHeight: '1.6', fontSize: '16px' }}>
                  <p>As a member, you'll be part of a growing community of nicotine pouch enthusiasts in the United States who share their experiences, recommendations, and insights. Our platform becomes more valuable with each new member who joins our US community.</p>
                  
                  <p>Ready to get started? Sign up today and discover why thousands of US users trust Nicotine Pouches Comparison for their nicotine pouch needs.</p>
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

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const metaData = pageMetaToMetadata(generateUSBecomeMemberPageMeta());
  return metaData;
}
