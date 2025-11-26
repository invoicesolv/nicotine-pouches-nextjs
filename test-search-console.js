// Test script to verify Google Search Console implementation
// Run this in the browser console after loading any page

console.log('Testing Google Search Console implementation...');

// Check for Google Search Console verification meta tag
const verificationMeta = document.querySelector('meta[name="google-site-verification"]');
if (verificationMeta) {
  console.log('✅ Google Search Console verification meta tag found');
  console.log('Verification code:', verificationMeta.getAttribute('content'));
} else {
  console.log('❌ Google Search Console verification meta tag not found');
}

// Check for robots meta tag
const robotsMeta = document.querySelector('meta[name="robots"]');
if (robotsMeta) {
  console.log('✅ Robots meta tag found');
  console.log('Robots content:', robotsMeta.getAttribute('content'));
} else {
  console.log('❌ Robots meta tag not found');
}

// Check for canonical URL
const canonicalLink = document.querySelector('link[rel="canonical"]');
if (canonicalLink) {
  console.log('✅ Canonical URL found');
  console.log('Canonical URL:', canonicalLink.getAttribute('href'));
} else {
  console.log('❌ Canonical URL not found');
}

// Check for hreflang tags
const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
if (hreflangLinks.length > 0) {
  console.log(`✅ ${hreflangLinks.length} hreflang tags found`);
  hreflangLinks.forEach(link => {
    console.log(`  - ${link.getAttribute('hreflang')}: ${link.getAttribute('href')}`);
  });
} else {
  console.log('❌ No hreflang tags found');
}

// Check for structured data
const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
if (structuredDataScripts.length > 0) {
  console.log(`✅ ${structuredDataScripts.length} structured data scripts found`);
  structuredDataScripts.forEach((script, index) => {
    try {
      const data = JSON.parse(script.textContent);
      console.log(`  - Script ${index + 1}: ${data['@type'] || 'Unknown type'}`);
    } catch (e) {
      console.log(`  - Script ${index + 1}: Invalid JSON`);
    }
  });
} else {
  console.log('❌ No structured data scripts found');
}

// Check for sitemap reference in robots.txt
fetch('/robots.txt')
  .then(response => response.text())
  .then(text => {
    if (text.includes('sitemap.xml')) {
      console.log('✅ Sitemap reference found in robots.txt');
      const sitemapMatch = text.match(/Sitemap:\s*(.+)/);
      if (sitemapMatch) {
        console.log('Sitemap URL:', sitemapMatch[1]);
      }
    } else {
      console.log('❌ No sitemap reference found in robots.txt');
    }
  })
  .catch(error => {
    console.log('❌ Error fetching robots.txt:', error);
  });

// Check for sitemap accessibility
fetch('/sitemap.xml')
  .then(response => {
    if (response.ok) {
      console.log('✅ Sitemap is accessible');
      return response.text();
    } else {
      console.log('❌ Sitemap not accessible:', response.status);
      throw new Error('Sitemap not accessible');
    }
  })
  .then(text => {
    const urlCount = (text.match(/<url>/g) || []).length;
    console.log(`Sitemap contains ${urlCount} URLs`);
    
    // Check for image sitemaps
    const imageCount = (text.match(/<image:image>/g) || []).length;
    if (imageCount > 0) {
      console.log(`Sitemap contains ${imageCount} images`);
    }
  })
  .catch(error => {
    console.log('❌ Error fetching sitemap:', error);
  });

// Check page title and meta description
const title = document.title;
const metaDescription = document.querySelector('meta[name="description"]');
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDescription = document.querySelector('meta[property="og:description"]');

console.log('\n--- SEO Meta Tags ---');
console.log('Title:', title);
console.log('Meta Description:', metaDescription ? metaDescription.getAttribute('content') : 'Not found');
console.log('OG Title:', ogTitle ? ogTitle.getAttribute('content') : 'Not found');
console.log('OG Description:', ogDescription ? ogDescription.getAttribute('content') : 'Not found');

// Check for duplicate content issues
const duplicateTitles = document.querySelectorAll('title');
if (duplicateTitles.length > 1) {
  console.log('⚠️ Multiple title tags found - this may cause SEO issues');
} else {
  console.log('✅ Single title tag found');
}

console.log('\n--- Search Console Test Complete ---');
console.log('If all items show ✅, your Search Console setup is working correctly!');
