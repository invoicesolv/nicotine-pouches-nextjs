'use client';

import Link from 'next/link';
import { BreadcrumbItem } from '@/lib/seo';

interface BreadcrumbNavigationProps {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNavigation({ 
  breadcrumbs, 
  className = '' 
}: BreadcrumbNavigationProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`breadcrumb ${className}`}
      style={{
        backgroundColor: '#ffffff',
        padding: '15px 0',
        borderBottom: '1px solid #e9ecef'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        fontSize: '14px',
        color: '#666',
        fontFamily: 'Klarna Text, sans-serif'
      }}>
        <ol style={{
          display: 'flex',
          flexWrap: 'wrap',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          alignItems: 'center'
        }}>
          {breadcrumbs.map((item, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <span 
                  style={{ 
                    margin: '0 8px',
                    color: '#999',
                    fontSize: '12px'
                  }}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span 
                  style={{
                    color: '#0B051D',
                    fontFamily: 'Klarna Text, sans-serif',
                    fontWeight: '500'
                  }}
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  style={{
                    color: '#0B051D',
                    textDecoration: 'none',
                    fontFamily: 'Klarna Text, sans-serif',
                    fontWeight: '800',
                    transition: 'color 0.2s ease'
                  }}
                  className="hover:text-blue-600"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
