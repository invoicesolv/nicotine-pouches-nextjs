// SEO validation helper to ensure all pages have proper metadata

export interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface PageSEOData {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  schema?: any;
  [key: string]: any;
}

/**
 * Validate SEO data for any page type
 */
export function validateSEO(pageType: string, seoData: PageSEOData): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Required fields validation
  if (!seoData.title || seoData.title.trim() === '') {
    errors.push('Title is required');
    score -= 20;
  } else if (seoData.title.length < 30) {
    warnings.push('Title is too short (recommended: 30-60 characters)');
    score -= 5;
  } else if (seoData.title.length > 60) {
    warnings.push('Title is too long (recommended: 30-60 characters)');
    score -= 5;
  }

  if (!seoData.description || seoData.description.trim() === '') {
    errors.push('Description is required');
    score -= 20;
  } else if (seoData.description.length < 120) {
    warnings.push('Description is too short (recommended: 120-160 characters)');
    score -= 5;
  } else if (seoData.description.length > 160) {
    warnings.push('Description is too long (recommended: 120-160 characters)');
    score -= 5;
  }

  if (!seoData.canonical || seoData.canonical.trim() === '') {
    errors.push('Canonical URL is required');
    score -= 15;
  }

  // Page type specific validation
  switch (pageType) {
    case 'product':
      validateProductSEO(seoData, errors, warnings, score);
      break;
    case 'brand':
      validateBrandSEO(seoData, errors, warnings, score);
      break;
    case 'location':
      validateLocationSEO(seoData, errors, warnings, score);
      break;
    case 'blog':
      validateBlogSEO(seoData, errors, warnings, score);
      break;
    case 'homepage':
      validateHomepageSEO(seoData, errors, warnings, score);
      break;
  }

  // Schema validation
  if (!seoData.schema) {
    warnings.push('Schema markup is missing');
    score -= 10;
  } else {
    validateSchema(seoData.schema, errors, warnings, score);
  }

  // Image validation
  if (!seoData.image || seoData.image.trim() === '') {
    warnings.push('Featured image is missing');
    score -= 5;
  }

  // Keywords validation
  if (!seoData.keywords || seoData.keywords.trim() === '') {
    warnings.push('Keywords are missing');
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Validate product page SEO
 */
function validateProductSEO(seoData: PageSEOData, errors: string[], warnings: string[], score: number): void {
  if (!seoData.product?.name) {
    errors.push('Product name is required');
  }
  
  if (!seoData.product?.brand) {
    errors.push('Product brand is required');
  }
  
  if (!seoData.aggregateRating) {
    warnings.push('Aggregate rating is missing');
  } else {
    if (!seoData.aggregateRating.ratingValue) {
      errors.push('Rating value is missing');
    }
    if (!seoData.aggregateRating.reviewCount) {
      warnings.push('Review count is missing');
    }
  }
  
  if (!seoData.product?.lowestPrice && !seoData.product?.highestPrice) {
    warnings.push('Price information is missing');
  }
}

/**
 * Validate brand page SEO
 */
function validateBrandSEO(seoData: PageSEOData, errors: string[], warnings: string[], score: number): void {
  if (!seoData.brandName) {
    errors.push('Brand name is required');
  }
  
  if (!seoData.productCount || seoData.productCount === 0) {
    warnings.push('Product count is missing or zero');
  }
  
  if (!seoData.aggregateRating) {
    warnings.push('Brand aggregate rating is missing');
  }
}

/**
 * Validate location page SEO
 */
function validateLocationSEO(seoData: PageSEOData, errors: string[], warnings: string[], score: number): void {
  if (!seoData.cityName) {
    errors.push('City name is required');
  }
  
  if (!seoData.region) {
    warnings.push('Region is missing');
  }
  
  if (!seoData.geo) {
    warnings.push('Geographic coordinates are missing');
  }
}

/**
 * Validate blog page SEO
 */
function validateBlogSEO(seoData: PageSEOData, errors: string[], warnings: string[], score: number): void {
  if (!seoData.author?.name) {
    warnings.push('Author name is missing');
  }
  
  if (!seoData.datePublished) {
    warnings.push('Publication date is missing');
  }
  
  if (!seoData.category) {
    warnings.push('Blog category is missing');
  }
  
  if (!seoData.tags || seoData.tags.length === 0) {
    warnings.push('Blog tags are missing');
  }
}

/**
 * Validate homepage SEO
 */
function validateHomepageSEO(seoData: PageSEOData, errors: string[], warnings: string[], score: number): void {
  // Homepage should have organization and website schemas
  if (!seoData.schema) {
    errors.push('Homepage schema is missing');
  }
}

/**
 * Validate schema markup
 */
function validateSchema(schema: any, errors: string[], warnings: string[], score: number): void {
  if (!schema['@context']) {
    errors.push('Schema missing @context');
  }
  
  if (!schema['@type']) {
    errors.push('Schema missing @type');
  }
  
  // Validate based on schema type
  switch (schema['@type']) {
    case 'Product':
      validateProductSchema(schema, errors, warnings);
      break;
    case 'Brand':
      validateBrandSchema(schema, errors, warnings);
      break;
    case 'Article':
      validateArticleSchema(schema, errors, warnings);
      break;
    case 'Organization':
      validateOrganizationSchema(schema, errors, warnings);
      break;
    case 'WebSite':
      validateWebsiteSchema(schema, errors, warnings);
      break;
    case 'LocalBusiness':
      validateLocalBusinessSchema(schema, errors, warnings);
      break;
  }
}

function validateProductSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.name) errors.push('Product schema missing name');
  if (!schema.brand) warnings.push('Product schema missing brand');
  if (!schema.offers) warnings.push('Product schema missing offers');
  if (!schema.aggregateRating) warnings.push('Product schema missing aggregateRating');
}

function validateBrandSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.name) errors.push('Brand schema missing name');
  if (!schema.description) warnings.push('Brand schema missing description');
}

function validateArticleSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.headline) errors.push('Article schema missing headline');
  if (!schema.author) warnings.push('Article schema missing author');
  if (!schema.datePublished) warnings.push('Article schema missing datePublished');
  if (!schema.dateModified) warnings.push('Article schema missing dateModified');
  if (!schema.keywords) warnings.push('Article schema missing keywords');
  if (!schema.publisher) errors.push('Article schema missing publisher');
  if (!schema.description) warnings.push('Article schema missing description');
  // Optional but recommended
  if (!schema.speakable) warnings.push('Article schema missing speakable specification');
}

function validateOrganizationSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.name) errors.push('Organization schema missing name');
  if (!schema.url) warnings.push('Organization schema missing url');
  if (!schema.logo) warnings.push('Organization schema missing logo');
}

function validateWebsiteSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.name) errors.push('Website schema missing name');
  if (!schema.url) warnings.push('Website schema missing url');
  if (!schema.potentialAction) warnings.push('Website schema missing SearchAction');
}

function validateLocalBusinessSchema(schema: any, errors: string[], warnings: string[]): void {
  if (!schema.name) errors.push('LocalBusiness schema missing name');
  if (!schema.address) errors.push('LocalBusiness schema missing address');
  if (!schema.geo) warnings.push('LocalBusiness schema missing geo coordinates');
  if (!schema.telephone) warnings.push('LocalBusiness schema missing telephone');
  if (!schema.aggregateRating) warnings.push('LocalBusiness schema missing aggregateRating');
  if (!schema.openingHoursSpecification) warnings.push('LocalBusiness schema missing opening hours');
}

/**
 * Get SEO score color based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // green
  if (score >= 70) return '#f59e0b'; // yellow
  if (score >= 50) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Get SEO score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Generate SEO report for a page
 */
export function generateSEOReport(pageType: string, seoData: PageSEOData): string {
  const validation = validateSEO(pageType, seoData);
  
  let report = `SEO Report for ${pageType} page\n`;
  report += `Score: ${validation.score}/100 (${getScoreLabel(validation.score)})\n\n`;
  
  if (validation.errors.length > 0) {
    report += `Errors (${validation.errors.length}):\n`;
    validation.errors.forEach(error => report += `- ${error}\n`);
    report += '\n';
  }
  
  if (validation.warnings.length > 0) {
    report += `Warnings (${validation.warnings.length}):\n`;
    validation.warnings.forEach(warning => report += `- ${warning}\n`);
    report += '\n';
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    report += '✅ All SEO requirements met!\n';
  }
  
  return report;
}
