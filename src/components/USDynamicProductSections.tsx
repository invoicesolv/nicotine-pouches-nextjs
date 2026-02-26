'use client';

import USDynamicProductSection from './USDynamicProductSection';

export default function USDynamicProductSections() {
  return (
    <div
      className="product-section-mobile"
      style={{
        backgroundColor: '#f4f5f9',
        padding: '40px 0',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        className="product-section-container"
        style={{
          width: '100%',
          maxWidth: 'none',
          margin: '0',
          padding: '0 20px',
          overflow: 'visible',
          position: 'relative'
        }}
      >
        {/* Most Popular - Uses store count + engagement */}
        <USDynamicProductSection
          title="Most Popular Products"
          section="popular"
          refreshInterval={0}
          rotateCount={0}
        />

        {/* Trending Now - Uses recent clicks (last 7 days) */}
        <USDynamicProductSection
          title="Trending Now"
          section="trending"
          refreshInterval={0}
          rotateCount={0}
        />

        {/* New Arrivals - Uses recency */}
        <USDynamicProductSection
          title="New Arrivals"
          section="new"
          refreshInterval={0}
          rotateCount={0}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .product-section-mobile {
            padding: 20px 0 !important;
          }
          .product-section-container {
            padding: 0 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
