'use client';

import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'prices', label: 'Prices' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'product-details', label: 'Product details' },
  { id: 'features', label: 'Features' },
];

export default function ProductSectionNav() {
  const [activeSection, setActiveSection] = useState('prices');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      borderBottom: '1px solid #e5e7eb',
      marginTop: '12px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {sections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#1f2544' : '#6b7280',
              cursor: 'pointer',
              position: 'relative',
              fontFamily: 'inherit',
              transition: 'color 0.2s ease'
            }}
          >
            {section.label}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#1f2544',
                borderRadius: '1px'
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
