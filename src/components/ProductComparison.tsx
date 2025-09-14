'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProductComparison = () => {
  const [selectedBrand, setSelectedBrand] = useState('all');

  const products = [
    {
      id: 1,
      name: 'ZYN Cool Mint',
      brand: 'ZYN',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/08/zyn-citrus-mini-strong-6-mg-1.png',
      price: '£4.99',
      strength: '6mg',
      flavor: 'Cool Mint',
      link: '/product/zyn-cool-mint/'
    },
    {
      id: 2,
      name: 'Velo Polar Mint',
      brand: 'Velo',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/06/velo-cooling-storm-10-9-mg.png',
      price: '£5.49',
      strength: '9mg',
      flavor: 'Polar Mint',
      link: '/product/velo-polar-mint/'
    },
    {
      id: 3,
      name: 'Killa Cold Mint',
      brand: 'Killa',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/03/pouches-_0017_killa-bubblegum-1.png',
      price: '£4.79',
      strength: '12mg',
      flavor: 'Cold Mint',
      link: '/product/killa-cold-mint/'
    },
    {
      id: 4,
      name: 'XQS Wintergreen',
      brand: 'XQS',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/08/xqs-wintergreen-normal-1.png',
      price: '£5.99',
      strength: '8mg',
      flavor: 'Wintergreen',
      link: '/product/xqs-wintergreen/'
    },
    {
      id: 5,
      name: 'On! Mint',
      brand: 'On!',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/08/on-plus-smooth-mint-slim-strong-1.png',
      price: '£4.29',
      strength: '6mg',
      flavor: 'Mint',
      link: '/product/on-mint/'
    },
    {
      id: 6,
      name: 'Loop Smooth Mint',
      brand: 'Loop',
      image: 'https://gianna.templweb.com/wp-content/uploads/2024/08/loop-smooth-mint-strong-1.png',
      price: '£5.19',
      strength: '10mg',
      flavor: 'Smooth Mint',
      link: '/product/loop-smooth-mint/'
    }
  ];

  const filteredProducts = selectedBrand === 'all' 
    ? products 
    : products.filter(product => product.brand.toLowerCase() === selectedBrand.toLowerCase());

  return (
    <section className="fusion-fullwidth fullwidth-box fusion-builder-row-3 fusion-flex-container hundred-percent-fullwidth non-hundred-percent-height-scrolling">
      <div className="fusion-builder-row fusion-row fusion-flex-align-items-flex-start fusion-flex-justify-content-center fusion-flex-content-wrap">
        
        {/* Section Header */}
        <div className="fusion-layout-column fusion_builder_column fusion-builder-column-9 fusion_builder_column_1_1 1_1 fusion-flex-column">
          <div className="fusion-column-wrapper fusion-column-has-shadow fusion-flex-justify-content-center fusion-content-layout-column">
            
            <div className="fusion-title title fusion-title-13 fusion-sep-none fusion-title-text fusion-title-size-two">
              <h2 className="fusion-title-heading title-heading-center" style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: 'var(--awb-color8)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                Compare Nicotine Pouches
              </h2>
            </div>

            <div className="fusion-text fusion-text-12">
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'var(--awb-color6)',
                textAlign: 'center',
                marginBottom: '40px'
              }}>
                Find the best deals on nicotine pouches from top UK suppliers
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="fusion-builder-row fusion-builder-row-inner fusion-row fusion-flex-align-items-center fusion-flex-justify-content-center fusion-flex-content-wrap" style={{ marginBottom: '40px', gap: '10px' }}>
              <button 
                className={`fusion-button button-flat fusion-button-small-size ${selectedBrand === 'all' ? 'button-custom' : 'button-outline'}`}
                onClick={() => setSelectedBrand('all')}
              >
                <span className="fusion-button-text">All Brands</span>
              </button>
              {['ZYN', 'Velo', 'Killa', 'XQS', 'On!', 'Loop'].map(brand => (
                <button 
                  key={brand}
                  className={`fusion-button button-flat fusion-button-small-size ${selectedBrand === brand.toLowerCase() ? 'button-custom' : 'button-outline'}`}
                  onClick={() => setSelectedBrand(brand.toLowerCase())}
                >
                  <span className="fusion-button-text">{brand}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Products Grid */}
        <div className="fusion-layout-column fusion_builder_column fusion-builder-column-10 fusion_builder_column_1_1 1_1 fusion-flex-column">
          <div className="fusion-column-wrapper fusion-column-has-shadow fusion-flex-justify-content-center fusion-content-layout-column">
            
            <div className="products-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              padding: '20px 0'
            }}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card" style={{
                  background: 'var(--awb-color1)',
                  border: '1px solid var(--awb-color3)',
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="product-image" style={{ marginBottom: '15px' }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      style={{ 
                        objectFit: 'contain',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name" style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'var(--awb-color8)',
                      marginBottom: '8px'
                    }}>
                      {product.name}
                    </h3>
                    
                    <div className="product-details" style={{
                      fontSize: '0.9rem',
                      color: 'var(--awb-color6)',
                      marginBottom: '15px'
                    }}>
                      <p>Brand: {product.brand}</p>
                      <p>Strength: {product.strength}</p>
                      <p>Flavor: {product.flavor}</p>
                    </div>
                    
                    <div className="product-price" style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--awb-color5)',
                      marginBottom: '15px'
                    }}>
                      {product.price}
                    </div>
                    
                    <Link href={product.link} className="fusion-button button-flat fusion-button-default-size button-custom">
                      <span className="fusion-button-text">View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="fusion-button-wrapper" style={{ textAlign: 'center', marginTop: '40px' }}>
              <a href="/shop" className="fusion-button button-flat fusion-button-large-size button-custom">
                <span className="fusion-button-text">View All Products</span>
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductComparison;
