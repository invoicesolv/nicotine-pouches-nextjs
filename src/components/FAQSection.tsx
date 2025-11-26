'use client';

import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  className?: string;
}

export default function FAQSection({ faqs, className = '' }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className={`faq-section ${className}`}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 1.5rem 0',
          textAlign: 'center'
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              style={{
                borderBottom: index < faqs.length - 1 ? '1px solid #e5e7eb' : 'none',
                marginBottom: index < faqs.length - 1 ? '0' : '0'
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 0',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  transition: 'color 0.2s ease'
                }}
                className="hover:text-blue-600"
              >
                <span>{faq.q}</span>
                <svg
                  style={{
                    width: '20px',
                    height: '20px',
                    transform: openItems.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#6b7280'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openItems.has(index) && (
                <div style={{
                  padding: '0 0 1.25rem 0',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  lineHeight: '1.6'
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          fontSize: '0.875rem',
          color: '#92400e',
          textAlign: 'center'
        }}>
          <strong>Disclaimer:</strong> Nicotine products are intended for adult consumers only. No health claims. Check local regulations.
        </div>
      </div>
    </div>
  );
}
