#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test URLs from the original report
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

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let results = {
  totalChecked: 0,
  working: 0,
  broken: 0,
  issues: []
};

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HreflangChecker/1.0)'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      const finalUrl = res.headers.location ? new URL(res.headers.location, url).href : url;
      resolve({
        url,
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

// Function to get page content and check hreflang
async function checkHreflangOnPage(url) {
  try {
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
    
    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          // Extract hreflang links
          const hreflangRegex = /<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"[^>]*>/gi;
          const matches = [];
          let match;
          
          while ((match = hreflangRegex.exec(data)) !== null) {
            matches.push({
              lang: match[1],
              href: match[2]
            });
          }
          
          resolve({
            url,
            status: res.statusCode,
            hreflangLinks: matches
          });
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
  } catch (error) {
    throw error;
  }
}

// Function to check a single URL
async function checkUrl(url) {
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
      results.broken++;
      results.issues.push({
        url: url,
        issue: '404 Error',
        status: response.status
      });
    } else if (response.status === 200) {
      console.log(`   ✅ Working`);
      results.working++;
      
      // Check hreflang on this page
      try {
        const hreflangData = await checkHreflangOnPage(url);
        console.log(`   📋 Found ${hreflangData.hreflangLinks.length} hreflang links:`);
        
        hreflangData.hreflangLinks.forEach(link => {
          console.log(`      - ${link.lang}: ${link.href}`);
        });
        
        // Check if any hreflang links are broken
        for (const link of hreflangData.hreflangLinks) {
          try {
            const linkResponse = await makeRequest(link.href);
            if (linkResponse.status === 404) {
              console.log(`      ❌ ${link.lang} hreflang (${link.href}) returns 404`);
              results.issues.push({
                url: url,
                issue: 'Broken hreflang link',
                hreflangUrl: link.href,
                lang: link.lang,
                status: linkResponse.status
              });
            } else if (linkResponse.status === 200) {
              console.log(`      ✅ ${link.lang} hreflang (${link.href}) works`);
            } else {
              console.log(`      ⚠️  ${link.lang} hreflang (${link.href}) returns ${linkResponse.status}`);
            }
          } catch (error) {
            console.log(`      ❌ Error checking hreflang link ${link.href}: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking hreflang: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
    }
    
    results.totalChecked++;
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    results.broken++;
    results.issues.push({
      url: url,
      issue: 'Request Error',
      error: error.message
    });
  }
}

// Main execution function
async function runTest() {
  console.log(`${colors.cyan}${colors.bold}Testing Hreflang Fixes${colors.reset}`);
  console.log(`${'─'.repeat(80)}\n`);
  
  for (const url of testUrls) {
    await checkUrl(url);
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate summary report
  console.log(`\n${colors.bold}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}TEST RESULTS SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}\n`);
  
  console.log(`Total URLs checked: ${colors.bold}${results.totalChecked}${colors.reset}`);
  console.log(`${colors.green}✓ Working: ${results.working}${colors.reset}`);
  console.log(`${colors.red}✗ Broken: ${results.broken}${colors.reset}`);
  console.log(`Issues found: ${colors.bold}${results.issues.length}${colors.reset}\n`);
  
  if (results.issues.length > 0) {
    console.log(`${colors.red}${colors.bold}ISSUES FOUND:${colors.reset}`);
    results.issues.forEach(issue => {
      console.log(`  - ${issue.url}`);
      console.log(`    ${issue.issue}: ${issue.hreflangUrl || issue.error || 'N/A'}`);
    });
  } else {
    console.log(`${colors.green}${colors.bold}✅ No issues found! All hreflang links are working correctly.${colors.reset}`);
  }
  
  const successRate = ((results.working / results.totalChecked) * 100).toFixed(1);
  console.log(`\n${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  if (successRate >= 90) {
    console.log(`${colors.green}${colors.bold}🎉 Excellent! Your hreflang implementation is working great!${colors.reset}`);
  } else if (successRate >= 70) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Good progress, but there are still some issues to fix.${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ There are still significant issues that need attention.${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Test complete!${colors.reset}`);
}

// Run the test
if (require.main === module) {
  runTest().catch(error => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runTest, checkUrl };
