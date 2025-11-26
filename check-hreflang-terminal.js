#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test URLs from your Search Console data
const testUrls = [
  'https://www.nicotine-pouches.org/product/ace-red-apple-cinnamon',
  'https://www.nicotine-pouches.org/product/iceberg-sweet-mint',
  'https://www.nicotine-pouches.org/product/cuba-cola',
  'https://www.nicotine-pouches.org/product/lyft-eucalyptus-honey',
  'https://www.nicotine-pouches.org/product/77-ice-mint',
  'https://www.nicotine-pouches.org/product/nordic-spirit-spearmint',
  'https://www.nicotine-pouches.org/product/cuba-jogurt',
  'https://www.nicotine-pouches.org/product/helwit-cola',
  'https://www.nicotine-pouches.org/us/blog/do-nicotine-pouches-help-quit-smoking',
  'https://www.nicotine-pouches.org/us/blog/norwegian-nicotine-pouches'
];

// Expected US product URLs
const expectedUSProductUrls = [
  'https://www.nicotine-pouches.org/us/product/ace-red-apple-cinnamon',
  'https://www.nicotine-pouches.org/us/product/iceberg-sweet-mint',
  'https://www.nicotine-pouches.org/us/product/cuba-cola',
  'https://www.nicotine-pouches.org/us/product/lyft-eucalyptus-honey',
  'https://www.nicotine-pouches.org/us/product/77-ice-mint',
  'https://www.nicotine-pouches.org/us/product/nordic-spirit-spearmint',
  'https://www.nicotine-pouches.org/us/product/cuba-jogurt',
  'https://www.nicotine-pouches.org/us/product/helwit-cola'
];

let results = {
  totalChecked: 0,
  issuesFound: 0,
  hreflangIssues: [],
  redirectIssues: [],
  missingPages: [],
  workingPages: []
};

// Function to make HTTP request
function makeRequest(url, followRedirects = true) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HreflangChecker/1.0)'
      },
      followRedirects: followRedirects
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      const finalUrl = res.headers.location ? new URL(res.headers.location, url).href : url;
      resolve({
        status: res.statusCode,
        finalUrl: finalUrl,
        redirected: finalUrl !== url,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Function to get page content and extract hreflang links
function getPageContent(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HreflangChecker/1.0)'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Function to extract hreflang links from HTML
function extractHreflangLinks(html) {
  const hreflangRegex = /<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"[^>]*>/gi;
  const matches = [];
  let match;
  
  while ((match = hreflangRegex.exec(html)) !== null) {
    matches.push({
      lang: match[1],
      href: match[2]
    });
  }
  
  return matches;
}

// Function to check a single URL
async function checkUrl(url, expectedUSUrl = null) {
  try {
    console.log(`\n🔍 Checking: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Final URL: ${response.finalUrl}`);
    
    if (response.redirected) {
      console.log(`   ⚠️  REDIRECTED from ${url} to ${response.finalUrl}`);
    }
    
    if (response.status === 404) {
      console.log(`   ❌ 404 ERROR`);
      results.missingPages.push({
        url: url,
        status: response.status,
        finalUrl: response.finalUrl,
        redirected: response.redirected
      });
      results.issuesFound++;
    } else if (response.status === 200) {
      console.log(`   ✅ Working`);
      results.workingPages.push({
        url: url,
        status: response.status,
        finalUrl: response.finalUrl,
        redirected: response.redirected
      });
      
      // If this is a UK product page, check its hreflang
      if (url.includes('/product/') && !url.includes('/us/') && expectedUSUrl) {
        await checkHreflangOnPage(url, expectedUSUrl);
      }
      
      // If this is a US blog page, check its hreflang
      if (url.includes('/us/blog/')) {
        await checkHreflangOnPage(url);
      }
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
    }
    
    results.totalChecked++;
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    results.issuesFound++;
  }
}

// Function to check hreflang on a specific page
async function checkHreflangOnPage(url, expectedUSUrl = null) {
  try {
    console.log(`   🔍 Checking hreflang on: ${url}`);
    
    const html = await getPageContent(url);
    const hreflangLinks = extractHreflangLinks(html);
    
    console.log(`   📋 Found ${hreflangLinks.length} hreflang links:`);
    
    for (const link of hreflangLinks) {
      console.log(`      - ${link.lang}: ${link.href}`);
      
      // Check if this hreflang link works
      await checkHreflangLink(link.href, link.lang, url);
    }
    
    // If we have an expected US URL, check if it's properly referenced
    if (expectedUSUrl) {
      const hasUSHreflang = hreflangLinks.some(link => 
        link.lang === 'en-US' && link.href === expectedUSUrl
      );
      
      if (!hasUSHreflang) {
        console.log(`   ❌ Missing en-US hreflang pointing to: ${expectedUSUrl}`);
        results.hreflangIssues.push({
          sourceUrl: url,
          missingHreflang: expectedUSUrl,
          issue: 'Missing en-US hreflang'
        });
      } else {
        console.log(`   ✅ Found en-US hreflang pointing to: ${expectedUSUrl}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking hreflang: ${error.message}`);
  }
}

// Function to check if a hreflang link works
async function checkHreflangLink(href, lang, sourceUrl) {
  try {
    const response = await makeRequest(href);
    
    if (response.status === 404) {
      console.log(`      ❌ ${lang} hreflang (${href}) returns 404`);
      results.hreflangIssues.push({
        sourceUrl: sourceUrl,
        hreflangUrl: href,
        lang: lang,
        status: response.status,
        issue: 'Hreflang link returns 404'
      });
    } else if (response.status === 308 || response.status === 301 || response.status === 302) {
      console.log(`      ⚠️  ${lang} hreflang (${href}) redirects to ${response.finalUrl}`);
      results.redirectIssues.push({
        sourceUrl: sourceUrl,
        hreflangUrl: href,
        lang: lang,
        status: response.status,
        finalUrl: response.finalUrl,
        issue: 'Hreflang link redirects'
      });
    } else if (response.status === 200) {
      console.log(`      ✅ ${lang} hreflang (${href}) works`);
    } else {
      console.log(`      ⚠️  ${lang} hreflang (${href}) returns ${response.status}`);
    }
  } catch (error) {
    console.log(`      ❌ Error checking hreflang link ${href}: ${error.message}`);
  }
}

// Main execution function
async function runHreflangCheck() {
  console.log('🚀 Starting hreflang check for all test URLs...\n');
  
  // Check UK product pages
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const expectedUSUrl = expectedUSProductUrls[i] || null;
    await checkUrl(url, expectedUSUrl);
    
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Check expected US product pages
  console.log('\n🔍 Checking expected US product pages...');
  for (const url of expectedUSProductUrls) {
    await checkUrl(url);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate summary report
  console.log('\n📊 SUMMARY REPORT');
  console.log('================');
  console.log(`Total URLs checked: ${results.totalChecked}`);
  console.log(`Issues found: ${results.issuesFound}`);
  console.log(`Working pages: ${results.workingPages.length}`);
  console.log(`Missing pages (404): ${results.missingPages.length}`);
  console.log(`Hreflang issues: ${results.hreflangIssues.length}`);
  console.log(`Redirect issues: ${results.redirectIssues.length}`);
  
  if (results.missingPages.length > 0) {
    console.log('\n❌ MISSING PAGES (404):');
    results.missingPages.forEach(page => {
      console.log(`   - ${page.url} (redirected: ${page.redirected})`);
    });
  }
  
  if (results.hreflangIssues.length > 0) {
    console.log('\n❌ HREFLANG ISSUES:');
    results.hreflangIssues.forEach(issue => {
      console.log(`   - ${issue.sourceUrl}`);
      console.log(`     ${issue.issue}: ${issue.hreflangUrl || issue.missingHreflang}`);
    });
  }
  
  if (results.redirectIssues.length > 0) {
    console.log('\n⚠️  REDIRECT ISSUES:');
    results.redirectIssues.forEach(issue => {
      console.log(`   - ${issue.sourceUrl}`);
      console.log(`     ${issue.hreflangUrl} redirects to ${issue.finalUrl}`);
    });
  }
  
  console.log('\n✅ Hreflang check complete!');
  
  // Return results for further analysis
  return results;
}

// Run the check
if (require.main === module) {
  runHreflangCheck().then(results => {
    console.log('\n📋 Full results object:', JSON.stringify(results, null, 2));
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error running hreflang check:', error);
    process.exit(1);
  });
}

module.exports = { runHreflangCheck, checkUrl, checkHreflangOnPage };

