// CTR-Optimized SEO utilities for high-converting blog posts - PRESERVES KEYWORDS
export interface BlogCTRSEOInputs {
  title: string;
  excerpt: string;
  slug: string;
  author: string;
  date: string;
  modified: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  reading_time?: number;
  word_count?: number;
  page_url: string;
  site_name: string;
}

export interface BlogCTRSEOOutput {
  meta: {
    title: string;
    description: string;
    robots: string;
    canonical: string;
    og: {
      'og:title': string;
      'og:description': string;
      'og:url': string;
      'og:site_name': string;
      'og:type': string;
      'og:image': string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string;
    };
  };
  schema_json_ld: {
    "@context": string;
    "@graph": any[];
  };
  faq_plaintext: Array<{
    q: string;
    a: string;
  }>;
  ctr_optimization_hints: string[];
}

// Generate CTR-optimized blog title (max 60 chars) - PRESERVES MAIN KEYWORDS
function generateBlogCTRTitle(inputs: BlogCTRSEOInputs): string {
  const { title, category, reading_time, word_count } = inputs;
  
  // Extract key topics from title
  const titleWords = title.toLowerCase().split(' ');
  const hasNicotine = titleWords.some(word => ['nicotine', 'pouch', 'pouches', 'zyn', 'velo'].includes(word));
  const hasGuide = titleWords.some(word => ['guide', 'how', 'tips', 'tricks'].includes(word));
  const hasReview = titleWords.some(word => ['review', 'vs', 'compare', 'best'].includes(word));
  const hasAge = titleWords.some(word => ['age', 'old', 'buy', 'purchase'].includes(word));
  
  // Template variations that PRESERVE the main keywords
  const templates = [
    // Age-related posts (preserve "age" keyword)
    `How Old to Buy ${title.split(' ').slice(2).join(' ')} - Complete Guide 2025`,
    `Age to Buy ${title.split(' ').slice(2).join(' ')} - Everything You Need to Know`,
    `What Age Can You Buy ${title.split(' ').slice(2).join(' ')} - Legal Guide 2025`,
    
    // Guide/How-to posts (preserve main keywords)
    `Ultimate ${title} Guide 2025 - Expert Tips & Tricks`,
    `Complete ${title} Guide - Everything You Need to Know`,
    `How to ${title} - Step-by-Step Guide for Beginners`,
    `Best ${title} Tips - What Experts Don't Tell You`,
    
    // Review/Comparison posts (preserve main keywords)
    `Best ${title} 2025 - Top Picks & Reviews`,
    `${title} Review - Is It Worth It? (Honest Opinion)`,
    `${title} vs Alternatives - Complete Comparison`,
    `Top ${title} Options - Expert Reviews & Rankings`,
    
    // Problem-solving posts (preserve main keywords)
    `Why ${title} Matters - Complete Guide 2025`,
    `${title} Problems Solved - Expert Solutions`,
    `Everything About ${title} - Ultimate Resource`,
    `${title} Explained - What You Need to Know`,
    
    // News/Updates posts (preserve main keywords)
    `Latest ${title} News 2025 - What's New`,
    `${title} Update - What Changed & Why It Matters`,
    `New ${title} Trends - What to Expect`,
    `${title} 2025 - Everything You Need to Know`
  ];
  
  // Select template based on content analysis
  let selectedTemplate = templates[0]; // Default
  
  if (hasAge) {
    // Age-related content - preserve age keywords
    selectedTemplate = templates[0];
  } else if (hasGuide) {
    selectedTemplate = templates[3];
  } else if (hasReview) {
    selectedTemplate = templates[7];
  } else if (titleWords.includes('problem') || titleWords.includes('issue')) {
    selectedTemplate = templates[11];
  } else if (titleWords.includes('news') || titleWords.includes('update')) {
    selectedTemplate = templates[15];
  }
  
  // Add reading time if available and short
  if (reading_time && reading_time <= 5) {
    selectedTemplate = selectedTemplate.replace('Guide', `${reading_time}min Guide`);
  }
  
  // Ensure title is under 60 characters
  if (selectedTemplate.length > 60) {
    selectedTemplate = selectedTemplate.substring(0, 57) + '...';
  }
  
  return selectedTemplate;
}

// Generate CTR-optimized blog description (max 155 chars)
function generateBlogCTRDescription(inputs: BlogCTRSEOInputs): string {
  const { title, excerpt, reading_time, word_count, category } = inputs;
  
  // Clean excerpt
  const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '').substring(0, 100);
  
  // Template variations
  const templates = [
    // Age-related posts
    `🔥 ${title} - Complete legal guide! Find out the exact age requirements, where to buy, and legal restrictions. ${reading_time ? `${reading_time}min read` : 'Expert guide'}.`,
    
    // Benefit-focused
    `🔥 ${title} - Learn everything you need to know! Expert tips, tricks & insider secrets. ${reading_time ? `${reading_time}min read` : 'Complete guide'}.`,
    
    // Problem-solving
    `⚡ ${title} - Solve common problems with expert solutions! Step-by-step guide with real examples. ${word_count ? `${word_count} words` : 'Detailed'}.`,
    
    // Comparison/Review
    `⭐ ${title} - Honest reviews & comparisons! Find the best options with expert analysis. ${reading_time ? `${reading_time}min read` : 'Complete guide'}.`,
    
    // News/Updates
    `📰 ${title} - Latest updates & trends! Stay informed with expert insights. ${reading_time ? `${reading_time}min read` : 'Fresh content'}.`,
    
    // General
    `💡 ${title} - Everything you need to know! Expert guide with practical tips. ${reading_time ? `${reading_time}min read` : 'Complete resource'}.`
  ];
  
  // Select template based on content
  let selectedTemplate = templates[5]; // Default
  
  if (title.toLowerCase().includes('age') || title.toLowerCase().includes('old')) {
    selectedTemplate = templates[0];
  } else if (title.toLowerCase().includes('guide') || title.toLowerCase().includes('how')) {
    selectedTemplate = templates[1];
  } else if (title.toLowerCase().includes('problem') || title.toLowerCase().includes('solve')) {
    selectedTemplate = templates[2];
  } else if (title.toLowerCase().includes('review') || title.toLowerCase().includes('vs')) {
    selectedTemplate = templates[3];
  } else if (title.toLowerCase().includes('news') || title.toLowerCase().includes('update')) {
    selectedTemplate = templates[4];
  }
  
  // Ensure description is under 155 characters
  if (selectedTemplate.length > 155) {
    selectedTemplate = selectedTemplate.substring(0, 152) + '...';
  }
  
  return selectedTemplate;
}

// Generate CTR-optimized FAQ for blog posts
function generateBlogCTRFAQ(inputs: BlogCTRSEOInputs): Array<{q: string, a: string}> {
  const { title, category, reading_time } = inputs;
  
  return [
    {
      q: `What is ${title}?`,
      a: `${title} is a comprehensive topic we cover in detail. Our guide provides expert insights, practical tips, and real-world examples to help you understand everything you need to know.`
    },
    {
      q: `How long does it take to read about ${title}?`,
      a: `This ${title} guide takes approximately ${reading_time || 5} minutes to read. We've organized it for easy scanning with clear headings and practical examples.`
    },
    {
      q: `Is this ${title} guide up to date?`,
      a: `Yes! Our ${title} guide is regularly updated with the latest information and trends. We ensure all content reflects current best practices and industry standards.`
    },
    {
      q: `Who should read about ${title}?`,
      a: `This ${title} guide is perfect for beginners and experts alike. Whether you're just starting out or looking to deepen your knowledge, you'll find valuable insights here.`
    },
    {
      q: `What will I learn from this ${title} guide?`,
      a: `You'll learn everything about ${title} including practical tips, common mistakes to avoid, expert recommendations, and step-by-step guidance to help you succeed.`
    }
  ];
}

// Generate CTR-optimized schema markup for blog posts
function generateBlogCTRSchema(inputs: BlogCTRSEOInputs): any {
  const { title, excerpt, author, date, modified, featured_image, page_url, site_name, reading_time, word_count } = inputs;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${page_url}#webpage`,
        "url": page_url,
        "name": generateBlogCTRTitle(inputs),
        "inLanguage": "en-GB",
        "isPartOf": { "@id": `${site_name}#website` },
        "about": { "@id": `${page_url}#article` },
        "description": generateBlogCTRDescription(inputs)
      },
      {
        "@type": "Article",
        "@id": `${page_url}#article`,
        "headline": title,
        "description": generateBlogCTRDescription(inputs),
        "author": {
          "@type": "Person",
          "name": author,
          "url": `${site_name}/author/${author.toLowerCase().replace(' ', '-')}`
        },
        "publisher": {
          "@type": "Organization",
          "name": site_name,
          "url": site_name,
          "logo": {
            "@type": "ImageObject",
            "url": `${site_name}/logo.png`
          }
        },
        "datePublished": date,
        "dateModified": modified,
        "image": featured_image || `${site_name}/blog-default.jpg`,
        "mainEntityOfPage": {
          "@id": `${page_url}#webpage`
        },
        "wordCount": word_count || 1000,
        "timeRequired": reading_time ? `PT${reading_time}M` : "PT5M",
        "articleSection": "Nicotine Pouches",
        "keywords": title.toLowerCase().split(' ').join(', ')
      },
      {
        "@type": "WebSite",
        "@id": `${site_name}#website`,
        "url": site_name,
        "name": site_name,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${site_name}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

// Main CTR-optimized SEO generator for blog posts
export function generateBlogCTRSEO(inputs: BlogCTRSEOInputs): BlogCTRSEOOutput {
  const {
    title,
    excerpt,
    slug,
    author,
    date,
    modified,
    featured_image,
    page_url,
    site_name
  } = inputs;

  const optimizedTitle = generateBlogCTRTitle(inputs);
  const optimizedDescription = generateBlogCTRDescription(inputs);
  const faq = generateBlogCTRFAQ(inputs);
  const schema = generateBlogCTRSchema(inputs);

  return {
    meta: {
      title: optimizedTitle,
      description: optimizedDescription,
      robots: "index,follow",
      canonical: page_url,
      og: {
        'og:title': optimizedTitle,
        'og:description': optimizedDescription,
        'og:url': page_url,
        'og:site_name': site_name,
        'og:type': 'article',
        'og:image': featured_image || '/blog-default.jpg'
      },
      twitter: {
        card: 'summary_large_image',
        title: optimizedTitle,
        description: optimizedDescription,
        image: featured_image || '/blog-default.jpg'
      }
    },
    schema_json_ld: schema,
    faq_plaintext: faq,
    ctr_optimization_hints: [
      'Title includes power words and year for freshness',
      'Description uses emotional triggers and emojis',
      'FAQ addresses common reader questions',
      'Schema markup includes reading time and word count',
      'OpenGraph optimized for social sharing',
      'Content structured for easy scanning'
    ]
  };
}
