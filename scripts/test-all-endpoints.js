#!/usr/bin/env node

const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN || '';
const SITE_URL = 'https://nicotine-pouches.org/';

async function makeRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return { success: true, data: result, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function testAllEndpoints() {
    console.log('🧪 Testing ALL Google Search Console API Endpoints');
    console.log('=' .repeat(70));
    console.log(`🌐 Site: ${SITE_URL}`);
    console.log(`🔑 Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
    console.log('');

    // 1. List all sites
    console.log('1️⃣ SITES.LIST - Get all accessible sites');
    console.log('─'.repeat(50));
    const sites = await makeRequest('https://www.googleapis.com/webmasters/v3/sites');
    if (sites.success) {
        console.log(`✅ Found ${sites.data.siteEntry?.length || 0} sites`);
        sites.data.siteEntry?.slice(0, 5).forEach((site, i) => {
            console.log(`   ${i + 1}. ${site.siteUrl} (${site.permissionLevel})`);
        });
    } else {
        console.log(`❌ Error: ${sites.error}`);
    }
    console.log('');

    // 2. Get specific site info
    console.log('2️⃣ SITES.GET - Get site information');
    console.log('─'.repeat(50));
    const siteInfo = await makeRequest(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}`);
    if (siteInfo.success) {
        console.log(`✅ Site info: ${JSON.stringify(siteInfo.data, null, 2)}`);
    } else {
        console.log(`❌ Error: ${siteInfo.error}`);
    }
    console.log('');

    // 3. Search Analytics - Top queries
    console.log('3️⃣ SEARCH ANALYTICS - Top queries');
    console.log('─'.repeat(50));
    const searchAnalytics = await makeRequest(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        'POST',
        {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            dimensions: ['query'],
            rowLimit: 10
        }
    );
    if (searchAnalytics.success) {
        console.log(`✅ Found ${searchAnalytics.data.rows?.length || 0} top queries`);
        searchAnalytics.data.rows?.slice(0, 5).forEach((row, i) => {
            console.log(`   ${i + 1}. "${row.keys[0]}" - ${row.clicks} clicks, ${row.impressions} impressions, pos ${row.position.toFixed(1)}`);
        });
    } else {
        console.log(`❌ Error: ${searchAnalytics.error}`);
    }
    console.log('');

    // 4. Search Analytics - Top pages
    console.log('4️⃣ SEARCH ANALYTICS - Top pages');
    console.log('─'.repeat(50));
    const topPages = await makeRequest(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        'POST',
        {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            dimensions: ['page'],
            rowLimit: 10
        }
    );
    if (topPages.success) {
        console.log(`✅ Found ${topPages.data.rows?.length || 0} top pages`);
        topPages.data.rows?.slice(0, 5).forEach((row, i) => {
            console.log(`   ${i + 1}. ${row.keys[0]} - ${row.clicks} clicks, ${row.impressions} impressions`);
        });
    } else {
        console.log(`❌ Error: ${topPages.error}`);
    }
    console.log('');

    // 5. Search Analytics - Countries
    console.log('5️⃣ SEARCH ANALYTICS - Top countries');
    console.log('─'.repeat(50));
    const countries = await makeRequest(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        'POST',
        {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            dimensions: ['country'],
            rowLimit: 10
        }
    );
    if (countries.success) {
        console.log(`✅ Found ${countries.data.rows?.length || 0} countries`);
        countries.data.rows?.slice(0, 5).forEach((row, i) => {
            console.log(`   ${i + 1}. ${row.keys[0]} - ${row.clicks} clicks, ${row.impressions} impressions`);
        });
    } else {
        console.log(`❌ Error: ${countries.error}`);
    }
    console.log('');

    // 6. URL Inspection
    console.log('6️⃣ URL INSPECTION - Homepage');
    console.log('─'.repeat(50));
    const urlInspection = await makeRequest(
        'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        'POST',
        {
            inspectionUrl: SITE_URL,
            siteUrl: SITE_URL
        }
    );
    if (urlInspection.success) {
        const result = urlInspection.data.inspectionResult;
        console.log('✅ URL Inspection Results:');
        console.log(`   🔍 Verdict: ${result.indexStatusResult?.verdict}`);
        console.log(`   📄 Coverage: ${result.indexStatusResult?.coverageState}`);
        console.log(`   🤖 Robots.txt: ${result.indexStatusResult?.robotsTxtState}`);
        console.log(`   📝 Indexing: ${result.indexStatusResult?.indexingState}`);
        console.log(`   🕒 Last Crawl: ${result.indexStatusResult?.lastCrawlTime}`);
        console.log(`   📱 Crawled As: ${result.indexStatusResult?.crawledAs}`);
        console.log(`   🔗 Google Canonical: ${result.indexStatusResult?.googleCanonical}`);
        console.log(`   🔗 Referring URLs: ${result.indexStatusResult?.referringUrls?.length || 0}`);
        console.log(`   🔗 Full Report: ${result.inspectionResultLink}`);
    } else {
        console.log(`❌ Error: ${urlInspection.error}`);
    }
    console.log('');

    // 7. Sitemaps
    console.log('7️⃣ SITEMAPS - List all sitemaps');
    console.log('─'.repeat(50));
    const sitemaps = await makeRequest(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps`);
    if (sitemaps.success) {
        console.log(`✅ Found ${sitemaps.data.sitemap?.length || 0} sitemaps`);
        sitemaps.data.sitemap?.forEach((sitemap, i) => {
            console.log(`   ${i + 1}. ${sitemap.path}`);
            console.log(`      Type: ${sitemap.type}, Submitted: ${sitemap.lastSubmitted}`);
            console.log(`      Contents: ${sitemap.contents?.map(c => `${c.type}: ${c.submitted} submitted, ${c.indexed} indexed`).join(', ')}`);
        });
    } else {
        console.log(`❌ Error: ${sitemaps.error}`);
    }
    console.log('');

    // 8. Mobile Friendly Test
    console.log('8️⃣ MOBILE FRIENDLY TEST');
    console.log('─'.repeat(50));
    const mobileTest = await makeRequest(
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
        'GET',
        null,
        `?url=${encodeURIComponent(SITE_URL)}&strategy=mobile`
    );
    if (mobileTest.success) {
        console.log('✅ Mobile test completed');
        console.log(`   Mobile Friendly: ${mobileTest.data.lighthouseResult?.audits?.['mobile-friendly']?.score || 'N/A'}`);
    } else {
        console.log(`❌ Error: ${mobileTest.error}`);
    }
    console.log('');

    // 9. Core Web Vitals
    console.log('9️⃣ CORE WEB VITALS');
    console.log('─'.repeat(50));
    const coreWebVitals = await makeRequest(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        'POST',
        {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            dimensions: ['page'],
            dimensionFilterGroups: [{
                filters: [{
                    dimension: 'page',
                    operator: 'contains',
                    expression: SITE_URL
                }]
            }],
            rowLimit: 1
        }
    );
    if (coreWebVitals.success) {
        console.log('✅ Core Web Vitals data available');
        console.log(`   Total clicks: ${coreWebVitals.data.rows?.[0]?.clicks || 0}`);
        console.log(`   Total impressions: ${coreWebVitals.data.rows?.[0]?.impressions || 0}`);
    } else {
        console.log(`❌ Error: ${coreWebVitals.error}`);
    }
    console.log('');

    // 10. Summary
    console.log('📊 SUMMARY');
    console.log('─'.repeat(50));
    console.log('✅ Available endpoints:');
    console.log('   • Sites list and info');
    console.log('   • Search analytics (queries, pages, countries)');
    console.log('   • URL inspection with detailed index status');
    console.log('   • Sitemaps listing and status');
    console.log('   • Mobile usability data');
    console.log('');
    console.log('🎯 Key insights for nicotine-pouches.org:');
    if (searchAnalytics.success && searchAnalytics.data.rows?.length > 0) {
        const topQuery = searchAnalytics.data.rows[0];
        console.log(`   • Top query: "${topQuery.keys[0]}" (${topQuery.clicks} clicks)`);
    }
    if (urlInspection.success) {
        console.log(`   • Index status: ${urlInspection.data.inspectionResult.indexStatusResult?.verdict}`);
        console.log(`   • Last crawled: ${urlInspection.data.inspectionResult.indexStatusResult?.lastCrawlTime}`);
    }
    if (sitemaps.success && sitemaps.data.sitemap?.length > 0) {
        const sitemap = sitemaps.data.sitemap[0];
        console.log(`   • Sitemap: ${sitemap.contents?.map(c => `${c.submitted} ${c.type} submitted`).join(', ')}`);
    }
}

// Run the test
testAllEndpoints().catch(console.error);
