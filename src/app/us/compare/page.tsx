import Header from '@/components/Header';
import Footer from '@/components/Footer';
import USProductGrid from '@/components/USProductGrid';
import Link from 'next/link';


export default function USComparePage() {
  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          padding: '0',
          margin: '0',
          width: '100%'
        }}>
          
          {/* Breadcrumb */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Link href="/us" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>»</span>
              <span>Compare Nicotine Pouches (US)</span>
            </div>
          </div>

          {/* Page Header */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 15px 0'
              }}>
                Compare Nicotine Pouches (US)
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Find the best prices for premium nicotine pouches from top US vendors. 
                Compare ratings, strengths, and flavors to find your perfect match.
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px 0',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              maxWidth: '100%',
              margin: '0',
              padding: '0 10px'
            }}>
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>Filter by:</span>
                
                <select style={{
                  padding: '8px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>All Brands</option>
                  <option>ZYN</option>
                  <option>VELO</option>
                  <option>On!</option>
                  <option>Rogue</option>
                  <option>2ONE</option>
                  <option>ALP</option>
                  <option>Bridge</option>
                  <option>FRE</option>
                  <option>Grizzly</option>
                  <option>HIT</option>
                  <option>Juice Head</option>
                  <option>LUCY</option>
                  <option>NIC-S</option>
                  <option>SYX</option>
                  <option>Sesh+</option>
                  <option>Siberia</option>
                  <option>VITO</option>
                  <option>White Fox</option>
                  <option>XQS</option>
                  <option>ZEO</option>
                  <option>ZIMO</option>
                  <option>zone</option>
                </select>

                <select style={{
                  padding: '8px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>All Strengths</option>
                  <option>Light</option>
                  <option>Normal</option>
                  <option>Regular</option>
                  <option>Strong</option>
                  <option>Extra Strong</option>
                  <option>Super Strong</option>
                  <option>Mini</option>
                </select>

                <select style={{
                  padding: '8px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>All Flavors</option>
                  <option>Mint</option>
                  <option>Berry</option>
                  <option>Cinnamon</option>
                  <option>Citrus</option>
                  <option>Coffee</option>
                  <option>Fruit</option>
                  <option>Strong</option>
                  <option>Unflavored</option>
                  <option>Wintergreen</option>
                </select>

                <select style={{
                  padding: '8px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>All Formats</option>
                  <option>Regular</option>
                  <option>Slim</option>
                  <option>Mini</option>
                </select>

                <select style={{
                  padding: '8px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>Sort by Price: Low to High</option>
                  <option>Sort by Price: High to Low</option>
                  <option>Sort by Rating</option>
                  <option>Sort by Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* US Products Section with Sidebar */}
          <USProductGrid />

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Compare Nicotine Pouches - Best US Prices | Nicotine Pouches',
  description: 'Compare prices for premium nicotine pouches from top US vendors. Find the best deals on ZYN, Velo, ON!, Rogue, and other popular brands.',
  openGraph: {
    title: 'Compare Nicotine Pouches - Best US Prices',
    description: 'Compare prices for premium nicotine pouches from top US vendors.',
  },
};
