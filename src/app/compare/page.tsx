import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';

export default function ComparePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ 
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            fontSize: '14px',
            color: '#666'
          }}>
            <a href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</a>
            <span style={{ margin: '0 8px' }}>»</span>
            <span style={{ color: '#333', fontWeight: '500' }}>Compare Products</span>
          </div>
        </div>

        {/* Page Header */}
        <div style={{ 
          backgroundColor: '#ffffff',
          padding: '40px 0',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{ 
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#333', 
              marginBottom: '16px'
            }}>
              Compare Nicotine Pouches
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Compare different nicotine pouch products side by side. Use the filters to find exactly what you're looking for.
            </p>
          </div>
        </div>

        {/* Product Grid - Full Width */}
        <ProductGrid />
      </main>
      
      <Footer />
    </div>
  );
}