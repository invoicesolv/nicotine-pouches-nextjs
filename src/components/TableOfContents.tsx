'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

const TableOfContents = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Extract headings from the page
    const headings = document.querySelectorAll('h2, h3');
    const items: TOCItem[] = Array.from(headings).map((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;
      return {
        id,
        title: heading.textContent || '',
        level: heading.tagName === 'H2' ? 1 : 2
      };
    });
    setTocItems(items);

    // Set up intersection observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="sticky top-4 w-96 bg-white rounded-lg shadow-xl p-6 h-fit border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-3">
        Table of Contents
      </h3>
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
              item.level === 1
                ? 'font-medium text-gray-800'
                : 'font-normal text-gray-600 ml-4'
            } ${
              activeSection === item.id
                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                : 'hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {item.title}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;
