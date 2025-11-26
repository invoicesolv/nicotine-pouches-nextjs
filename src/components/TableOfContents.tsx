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
    // Wait for DOM to be fully loaded before scanning for headings
    const scanForHeadings = () => {
      // Extract headings ONLY from the main content area
      const mainContentArea = document.querySelector('.fusion-builder-column-36');
      
      let headings: Element[];
      if (mainContentArea) {
        // Only get headings from the main content area
        headings = Array.from(mainContentArea.querySelectorAll('h2, h3')) as Element[];
      } else {
        // Fallback: scan entire page but filter out common non-content areas
        const allHeadings = document.querySelectorAll('h2, h3');
        headings = (Array.from(allHeadings) as Element[]).filter((heading: Element) => {
          // Get all parent elements to check the hierarchy
          const parents = [];
          let current = heading.parentElement;
          while (current && current !== document.body) {
            parents.push(current);
            current = current.parentElement;
          }
          
          // Check if any parent is in excluded areas
          const isInExcludedArea = parents.some(parent => {
            const classes = parent.className || '';
            return classes.includes('fusion-builder-column-37') || // TOC area
                   classes.includes('fusion-builder-column-38') || // TOC area
                   classes.includes('fusion-builder-column-39') || // TOC area
                   classes.includes('fusion-builder-column-40') || // TOC area
                   classes.includes('fusion-builder-column-41') || // TOC area
                   classes.includes('fusion-builder-column-42') || // TOC area
                   classes.includes('fusion-builder-column-43') || // TOC area
                   classes.includes('fusion-builder-column-44') || // TOC area
                   classes.includes('fusion-builder-column-45') || // TOC area
                   classes.includes('fusion-builder-column-46') || // TOC area
                   classes.includes('fusion-builder-column-47') || // TOC area
                   classes.includes('fusion-builder-column-48') || // TOC area
                   classes.includes('fusion-builder-column-49') || // TOC area
                   classes.includes('fusion-builder-column-50') || // TOC area
                   classes.includes('product-section') ||
                   classes.includes('products-mobile') ||
                   classes.includes('sidebar-mobile') ||
                   classes.includes('filter-sidebar') ||
                   classes.includes('mega-menu') ||
                   classes.includes('header') ||
                   classes.includes('footer') ||
                   classes.includes('navigation') ||
                   classes.includes('menu') ||
                   classes.includes('sidebar') ||
                   classes.includes('toc-content') ||
                   classes.includes('product-grid') ||
                   classes.includes('product-card') ||
                   classes.includes('vendor-card') ||
                   classes.includes('trending') ||
                   classes.includes('popular') ||
                   classes.includes('brand') ||
                   classes.includes('category');
          });
          
          // Only include if NOT in excluded areas AND is in content area
          const isInContentArea = parents.some(parent => {
            const classes = parent.className || '';
            return classes.includes('fusion-builder-column-36') || 
                   classes.includes('main-content') ||
                   classes.includes('content-area');
          });
          
          return !isInExcludedArea && isInContentArea;
        });
      }
      
      // Filter out product names and other non-content headings
      const filteredHeadings = Array.from(headings).filter(heading => {
        const text = heading.textContent || '';
        
        // Only include headings that are specifically content headings
        const isContentHeading = text.includes('Compare Prices on Nicotine Pouches UK Today') ||
                                text.includes('Explore a Wide Range of Nicotine Pouches in the UK') ||
                                text.includes('Why Choose Nicotine Pouches UK?') ||
                                text.includes('Nicotine Pouches UK: Fast Delivery, Great Prices') ||
                                text.includes('Start Saving on Nicotine Pouches UK Now') ||
                                text.includes('Discover the Best Nicotine Pouches UK with Our Price Comparison Service');
        
        // Exclude everything else
        const isProductName = text.includes('ZYN') || 
                             text.includes('Velo') || 
                             text.includes('Loop') || 
                             text.includes('Ice') || 
                             text.includes('Apres') ||
                             text.includes('Cool Mint') ||
                             text.includes('Jalapeno Lime') ||
                             text.includes('Freezing Peppermint') ||
                             text.includes('Bright Spearmint') ||
                             text.includes('Ruby Berry') ||
                             text.includes('Crispy Peppermint') ||
                             text.includes('Hot Peach') ||
                             text.includes('Apple Mint') ||
                             text.includes('Creamy Cappuccino') ||
                             text.includes('Habanero Mint') ||
                             text.includes('Ice Cool Mint') ||
                             text.includes('Red Chilli Melon') ||
                             text.includes('Tangerine Spritz') ||
                             text.includes('Orange Spark') ||
                             text.includes('Peppermint Storm') ||
                             text.includes('Purple Grape') ||
                             text.includes('Tropical Mango') ||
                             text.includes('Wintry Watermelon') ||
                             text.includes('Cherry Ice') ||
                             text.includes('Violet Licorice') ||
                             text.includes('Cool Frost') ||
                             text.includes('Cool Blueberry') ||
                             text.includes('Chili Guava') ||
                             text.includes('Black Licorice') ||
                             text.includes('Bellini') ||
                             text.includes('Black Cherry') ||
                             text.includes('Citrus') ||
                             text.includes('Work with') ||
                             text.includes('Join Community') ||
                             text.includes('Compare prices') ||
                             text.includes('Most Popular') ||
                             text.includes('Trending') ||
                             text.includes('Products') ||
                             text.includes('Velo Products') ||
                             text.includes('Zyn Products') ||
                             text.includes('Discover the Best') ||
                             text.includes('Subscribe to') ||
                             text.includes('Learn more') ||
                             text.includes('Business') ||
                             text.includes('Table of content') ||
                             text.includes('Feeling strong') ||
                             text.includes('Trending UK');
        
        return isContentHeading && !isProductName;
      });
      
      const items: TOCItem[] = filteredHeadings.map((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;
      return {
        id,
        title: heading.textContent || '',
        level: heading.tagName === 'H2' ? 1 : 2
      };
    });
    setTocItems(items);
    };

    // Try immediately, then with a delay to ensure DOM is ready
    scanForHeadings();
    const timeoutId = setTimeout(scanForHeadings, 500);

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

    // Observe headings after they're found
    const observeHeadings = () => {
      const mainContentArea = document.querySelector('.fusion-builder-column-36');
      let headings: Element[];
      
      if (mainContentArea) {
        headings = Array.from(mainContentArea.querySelectorAll('h2, h3'));
      } else {
        const allHeadings = document.querySelectorAll('h2, h3');
        headings = Array.from(allHeadings).filter(heading => {
          const parents = [];
          let current = heading.parentElement;
          while (current && current !== document.body) {
            parents.push(current);
            current = current.parentElement;
          }
          
          const isInExcludedArea = parents.some(parent => {
            const classes = parent.className || '';
            return classes.includes('fusion-builder-column-37') ||
                   classes.includes('fusion-builder-column-38') ||
                   classes.includes('fusion-builder-column-39') ||
                   classes.includes('fusion-builder-column-40') ||
                   classes.includes('fusion-builder-column-41') ||
                   classes.includes('fusion-builder-column-42') ||
                   classes.includes('fusion-builder-column-43') ||
                   classes.includes('fusion-builder-column-44') ||
                   classes.includes('fusion-builder-column-45') ||
                   classes.includes('fusion-builder-column-46') ||
                   classes.includes('fusion-builder-column-47') ||
                   classes.includes('fusion-builder-column-48') ||
                   classes.includes('fusion-builder-column-49') ||
                   classes.includes('fusion-builder-column-50') ||
                   classes.includes('product-section') ||
                   classes.includes('products-mobile') ||
                   classes.includes('sidebar-mobile') ||
                   classes.includes('filter-sidebar') ||
                   classes.includes('mega-menu') ||
                   classes.includes('header') ||
                   classes.includes('footer') ||
                   classes.includes('navigation') ||
                   classes.includes('menu') ||
                   classes.includes('sidebar') ||
                   classes.includes('toc-content') ||
                   classes.includes('product-grid') ||
                   classes.includes('product-card') ||
                   classes.includes('vendor-card') ||
                   classes.includes('trending') ||
                   classes.includes('popular') ||
                   classes.includes('brand') ||
                   classes.includes('category');
          });
          
          const isInContentArea = parents.some(parent => {
            const classes = parent.className || '';
            return classes.includes('fusion-builder-column-36') || 
                   classes.includes('main-content') ||
                   classes.includes('content-area');
          });
          
          return !isInExcludedArea && isInContentArea;
        });
      }

    headings.forEach((heading) => observer.observe(heading));
    };

    // Set up observer with delay
    const observerTimeoutId = setTimeout(observeHeadings, 600);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(observerTimeoutId);
      observer.disconnect();
    };
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
    <div className="sticky top-4 w-full max-w-sm bg-white rounded-lg shadow-xl p-4 md:p-6 h-fit border border-gray-200">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 border-b-2 border-blue-500 pb-2 md:pb-3">
        Table of Contents
      </h3>
      <nav className="space-y-1 md:space-y-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`block w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm transition-colors duration-200 ${
              item.level === 1
                ? 'font-medium text-gray-800'
                : 'font-normal text-gray-600 ml-2 md:ml-4'
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
