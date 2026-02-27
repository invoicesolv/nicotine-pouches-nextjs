'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { useEffect } from 'react';

export default function ThankYou() {
  useEffect(() => {
    // Clear any search params or state that might affect the product grid
    // This ensures we show all products on the thank you page
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Thank You Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '80px 0',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '100%',
          padding: '0 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Thank You Message */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 30px',
              fontSize: '36px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 20px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              Thank You for Subscribing!
            </h1>
            
            <p style={{
              fontSize: '20px',
              color: '#666',
              margin: '0 0 30px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              lineHeight: '1.6',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              You're now subscribed to our newsletter! We'll keep you updated with the latest nicotine pouch news, product reviews, and exclusive deals.
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '40px'
            }}>
              <div style={{
                padding: '12px 24px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                borderRadius: '25px',
                fontSize: '16px',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                fontWeight: '600'
              }}>
                Check your email for confirmation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Section - Full Width */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        padding: '60px 0'
      }}>
        <div style={{
          width: '100%',
          padding: '0 40px'
        }}>
          {/* Section Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Compare Prices & Find Your Perfect Match
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#666',
              margin: '0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Browse our comprehensive collection of nicotine pouches and compare prices across different vendors to find the best deals.
            </p>
          </div>

          {/* Product Grid - Full Width */}
          <ProductGrid />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
