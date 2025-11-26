// FAQ extraction utility for blog posts
export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQExtractionResult {
  faqs: FAQItem[];
  language: string;
  source_selector: string;
  rejected_count: number;
}

// FAQ extraction selectors (in priority order)
const FAQ_SELECTORS = [
  '.faq, .faq-block, .faq-section, .faqs',
  '[itemtype*="FAQPage"]',
  'section[id*="faq"], div[id*="faq"]',
  'details[itemscope][itemtype*="Question"]',
  'h2:contains("FAQ"), h3:contains("FAQ"), h4:contains("FAQ")',
  'h2:contains("Questions"), h3:contains("Questions"), h4:contains("Questions")'
];

const QUESTION_SELECTORS = [
  '[itemprop="name"]',
  'h3, h4, summary, .faq-question, [role="heading"]',
  'strong, b'
];

const ANSWER_SELECTORS = [
  '[itemprop="acceptedAnswer"] [itemprop="text"]',
  '.faq-answer, .answer, p, div'
];

// Extract FAQs from HTML content
export function extractFAQsFromHTML(htmlContent: string, maxFAQs: number = 12): FAQExtractionResult {
  // Create a temporary DOM parser (this would work in a browser environment)
  // For server-side, we'll use regex-based extraction
  
  const faqs: FAQItem[] = [];
  let language = 'en-GB';
  let source_selector = 'none';
  let rejected_count = 0;

  // Try to detect language from HTML
  const langMatch = htmlContent.match(/lang=["']([^"']+)["']/i);
  if (langMatch) {
    language = langMatch[1];
  }

  // Extract FAQs using regex patterns
  const faqPatterns = [
    // Pattern 1: FAQ sections with h3/h4 questions
    /<h[34][^>]*>([^<]+)<\/h[34]>\s*<p[^>]*>([^<]+)<\/p>/gi,
    // Pattern 2: FAQ sections with strong/bold questions
    /<strong[^>]*>([^<]+)<\/strong>\s*<p[^>]*>([^<]+)<\/p>/gi,
    // Pattern 3: FAQ sections with details/summary
    /<summary[^>]*>([^<]+)<\/summary>\s*<div[^>]*>([^<]+)<\/div>/gi,
    // Pattern 4: FAQ sections with question/answer pairs
    /<div[^>]*class="[^"]*faq[^"]*"[^>]*>.*?<h[34][^>]*>([^<]+)<\/h[34]>.*?<p[^>]*>([^<]+)<\/p>/gi
  ];

  for (const pattern of faqPatterns) {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null && faqs.length < maxFAQs) {
      const question = cleanText(match[1]);
      const answer = cleanText(match[2]);

      // Validate FAQ
      if (isValidFAQ(question, answer)) {
        faqs.push({ q: question, a: answer });
        source_selector = 'regex_pattern';
      } else {
        rejected_count++;
      }
    }
  }

  // If no FAQs found with patterns, try to extract from structured content
  if (faqs.length === 0) {
    const structuredFAQs = extractStructuredFAQs(htmlContent, maxFAQs);
    faqs.push(...structuredFAQs.faqs);
    rejected_count += structuredFAQs.rejected_count;
    if (structuredFAQs.faqs.length > 0) {
      source_selector = 'structured_content';
    }
  }

  return {
    faqs: faqs.slice(0, maxFAQs),
    language,
    source_selector,
    rejected_count
  };
}

// Extract FAQs from structured content (h2/h3 sections)
function extractStructuredFAQs(htmlContent: string, maxFAQs: number): { faqs: FAQItem[], rejected_count: number } {
  const faqs: FAQItem[] = [];
  let rejected_count = 0;

  // Look for FAQ-related headings
  const faqHeadings = [
    'FAQ', 'Frequently Asked Questions', 'Questions', 'Q&A', 'Common Questions'
  ];

  const headingPattern = /<h[234][^>]*>([^<]+)<\/h[234]>/gi;
  let match;
  const headings: { text: string, position: number }[] = [];

  while ((match = headingPattern.exec(htmlContent)) !== null) {
    const headingText = cleanText(match[1]);
    if (faqHeadings.some(faqHeading => 
      headingText.toLowerCase().includes(faqHeading.toLowerCase())
    )) {
      headings.push({ text: headingText, position: match.index });
    }
  }

  // Extract content after FAQ headings
  for (const heading of headings) {
    const afterHeading = htmlContent.substring(heading.position);
    const sectionFAQs = extractFAQsFromSection(afterHeading, maxFAQs - faqs.length);
    faqs.push(...sectionFAQs.faqs);
    rejected_count += sectionFAQs.rejected_count;
  }

  return { faqs, rejected_count };
}

// Extract FAQs from a specific section
function extractFAQsFromSection(htmlContent: string, maxFAQs: number): { faqs: FAQItem[], rejected_count: number } {
  const faqs: FAQItem[] = [];
  let rejected_count = 0;

  // Look for question-answer pairs in the section
  const qaPatterns = [
    // h3/h4 followed by p
    /<h[34][^>]*>([^<]+)<\/h[34]>\s*<p[^>]*>([^<]+)<\/p>/gi,
    // strong followed by p
    /<strong[^>]*>([^<]+)<\/strong>\s*<p[^>]*>([^<]+)<\/p>/gi,
    // li with question-answer structure
    /<li[^>]*>([^<]+)\?[^<]*<\/li>\s*<li[^>]*>([^<]+)<\/li>/gi
  ];

  for (const pattern of qaPatterns) {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null && faqs.length < maxFAQs) {
      const question = cleanText(match[1]);
      const answer = cleanText(match[2]);

      if (isValidFAQ(question, answer)) {
        faqs.push({ q: question, a: answer });
      } else {
        rejected_count++;
      }
    }
  }

  return { faqs, rejected_count };
}

// Clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "...")
    .replace(/\s+/g, ' ')
    .trim();
}

// Validate FAQ item
function isValidFAQ(question: string, answer: string): boolean {
  // Reject if too short
  if (question.length < 5 || answer.length < 10) {
    return false;
  }

  // Reject if contains medical/cessation claims
  const medicalTerms = ['cure', 'treatment', 'medical', 'health', 'doctor', 'physician'];
  const content = (question + ' ' + answer).toLowerCase();
  if (medicalTerms.some(term => content.includes(term))) {
    return false;
  }

  // Reject if age-inappropriate
  const inappropriateTerms = ['underage', 'minor', 'child', 'teen'];
  if (inappropriateTerms.some(term => content.includes(term))) {
    return false;
  }

  return true;
}

// Generate FAQPage schema from extracted FAQs
export function generateFAQPageSchema(faqs: FAQItem[], pageUrl: string): any {
  if (faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": faqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `${pageUrl}#q-${slugify(faq.q)}`,
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
}

// Generate FAQ plaintext for SEO
export function generateFAQPlaintext(faqs: FAQItem[]): FAQItem[] {
  return faqs.map(faq => ({
    q: faq.q,
    a: faq.a
  }));
}

// Utility function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Main FAQ extraction function for blog posts
export function extractBlogPostFAQs(htmlContent: string, pageUrl: string): {
  faqs: FAQItem[];
  schema: any;
  plaintext: FAQItem[];
  extraction_result: FAQExtractionResult;
} {
  const extraction_result = extractFAQsFromHTML(htmlContent);
  const schema = generateFAQPageSchema(extraction_result.faqs, pageUrl);
  const plaintext = generateFAQPlaintext(extraction_result.faqs);

  return {
    faqs: extraction_result.faqs,
    schema,
    plaintext,
    extraction_result
  };
}
