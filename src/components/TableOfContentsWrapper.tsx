'use client';

import dynamic from 'next/dynamic';

// Dynamically import the TOC component with ssr: false
const TableOfContents = dynamic(() => import('./TableOfContents'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '200px' }}>Loading...</div>
});

const TableOfContentsWrapper = () => {
  return <TableOfContents />;
};

export default TableOfContentsWrapper;
