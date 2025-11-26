// Comprehensive hreflang issue checker
// Run this in the browser console to check live hreflang issues

console.log('🔍 Starting comprehensive hreflang issue check...');

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

// Expected US blog URLs
const expectedUSBlogUrls = [
  'https://www.nicotine-pouches.org/us/blog/do-nicotine-pouches-help-quit-smoking',
  'https://www.nicotine-pouches.org/us/blog/norwegian-nicotine-pouches'
];

let results = {
  totalChecked: 0,
  issuesFound: 0,
  hreflangIssues: [],
  redirectIssues: [],
  missingPages: [],
  workingPages: []
};

// Function to check a single URL
async function checkUrl(url, expectedUSUrl = null) {
  try {
    console.log(`\n🔍 Checking: ${url}`);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow'
    });
    
    const finalUrl = response.url;
    const status = response.status;
    
    console.log(`   Status: ${status}`);
    console.log(`   Final URL: ${finalUrl}`);
    
    // Check if redirected
    const wasRedirected = finalUrl !== url;
    if (wasRedirected) {
      console.log(`   ⚠️  REDIRECTED from ${url} to ${finalUrl}`);
    }
    
    // Check if it's a 404
    if (status === 404) {
      console.log(`   ❌ 404 ERROR`);
      results.missingPages.push({
        url: url,
        status: status,
        finalUrl: finalUrl,
        redirected: wasRedirected
      });
      results.issuesFound++;
    } else if (status === 200) {
      console.log(`   ✅ Working`);
      results.workingPages.push({
        url: url,
        status: status,
        finalUrl: finalUrl,
        redirected: wasRedirected
      });
    } else {
      console.log(`   ⚠️  Status: ${status}`);
    }
    
    // If this is a UK product page, check its hreflang
    if (url.includes('/product/') && !url.includes('/us/') && status === 200) {
      await checkHreflangOnPage(url, expectedUSUrl);
    }
    
    // If this is a US blog page, check its hreflang
    if (url.includes('/us/blog/') && status === 200) {
      await checkHreflangOnPage(url);
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
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse hreflang links
    const hreflangRegex = /<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"[^>]*>/gi;
    const hreflangMatches = [...html.matchAll(hreflangRegex)];
    
    console.log(`   📋 Found ${hreflangMatches.length} hreflang links:`);
    
    hreflangMatches.forEach(match => {
      const lang = match[1];
      const href = match[2];
      console.log(`      - ${lang}: ${href}`);
      
      // Check if this hreflang link works
      checkHreflangLink(href, lang, url);
    });
    
    // If we have an expected US URL, check if it's properly referenced
    if (expectedUSUrl) {
      const hasUSHreflang = hreflangMatches.some(match => 
        match[1] === 'en-US' && match[2] === expectedUSUrl
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
    const response = await fetch(href, { method: 'HEAD', redirect: 'follow' });
    const status = response.status;
    const finalUrl = response.url;
    
    if (status === 404) {
      console.log(`      ❌ ${lang} hreflang (${href}) returns 404`);
      results.hreflangIssues.push({
        sourceUrl: sourceUrl,
        hreflangUrl: href,
        lang: lang,
        status: status,
        issue: 'Hreflang link returns 404'
      });
    } else if (status === 308 || status === 301 || status === 302) {
      console.log(`      ⚠️  ${lang} hreflang (${href}) redirects to ${finalUrl}`);
      results.redirectIssues.push({
        sourceUrl: sourceUrl,
        hreflangUrl: href,
        lang: lang,
        status: status,
        finalUrl: finalUrl,
        issue: 'Hreflang link redirects'
      });
    } else if (status === 200) {
      console.log(`      ✅ ${lang} hreflang (${href}) works`);
    } else {
      console.log(`      ⚠️  ${lang} hreflang (${href}) returns ${status}`);
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
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Check expected US product pages
  console.log('\n🔍 Checking expected US product pages...');
  for (const url of expectedUSProductUrls) {
    await checkUrl(url);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Check expected US blog pages
  console.log('\n🔍 Checking expected US blog pages...');
  for (const url of expectedUSBlogUrls) {
    await checkUrl(url);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
runHreflangCheck().then(results => {
  console.log('\n📋 Full results object:', results);
}).catch(error => {
  console.error('❌ Error running hreflang check:', error);
});

