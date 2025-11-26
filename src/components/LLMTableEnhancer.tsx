'use client';

import { LLMSEOOutput } from '@/lib/llm-seo';

interface LLMTableEnhancerProps {
  llmSeoData: LLMSEOOutput;
  children: React.ReactNode;
}

export default function LLMTableEnhancer({ llmSeoData, children }: LLMTableEnhancerProps) {
  const { table_data_attributes } = llmSeoData;

  return (
    <div>
      {/* LLM-Optimized Table with Data Attributes */}
      <table 
        id={table_data_attributes.table_id}
        aria-caption={table_data_attributes.aria_caption}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {table_data_attributes.columns.map((column) => (
              <th 
                key={column.key}
                scope={column.scope}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table_data_attributes.rows.map((row, index) => (
            <tr 
              key={index}
              {...row.data_attributes}
              style={{
                borderBottom: index < table_data_attributes.rows.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.2s ease'
              }}
              className="hover:bg-gray-50"
            >
              {row.cells.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  style={{ 
                    padding: '1rem',
                    ...(cellIndex === 8 && { textAlign: 'center' }) // CTA column
                  }}
                >
                  {cellIndex === 8 ? (
                    <a 
                      href={cell.value}
                      rel="nofollow sponsored"
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                      className="hover:underline"
                    >
                      {cell.display}
                    </a>
                  ) : (
                    <span style={{
                      ...(cellIndex === 1 && { fontWeight: '600', color: '#1f2937' }), // Price column
                      ...(cellIndex === 2 && { color: '#6b7280' }), // Price per pouch column
                      ...(cellIndex === 6 && { fontWeight: '500' }), // Retailer column
                      ...(cellIndex === 7 && { 
                        backgroundColor: row.data_attributes['data-in-stock'] === 'true' ? '#dcfce7' : '#fef2f2',
                        color: row.data_attributes['data-in-stock'] === 'true' ? '#166534' : '#dc2626',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      })
                    }}>
                      {cell.display}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Freshness Indicator */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Prices updated regularly • Last updated: {new Date().toLocaleDateString('en-GB')} • 
        <a 
          href={llmSeoData.freshness_signals.changelog_url}
          style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '0.5rem' }}
          className="hover:underline"
        >
          View changelog
        </a>
      </div>

      {/* LLM Readability Hints (Hidden from users) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {llmSeoData.llm_readability_hints.map((hint, index) => (
          <div key={index} data-llm-hint={hint} />
        ))}
      </div>
    </div>
  );
}
