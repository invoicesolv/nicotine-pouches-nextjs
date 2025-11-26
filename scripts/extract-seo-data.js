#!/usr/bin/env node

const ACCESS_TOKEN = 'REDACTED_GOOGLE_TOKEN';

async function fetchData(url, method = 'GET', body = null) {
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
}

async function extractAllSEOData() {
    const siteUrl = 'https://nicotine-pouches.org/';
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    
    console.log('🔍 EXTRACTING ALL SEO DATA FROM GOOGLE SEARCH CONSOLE');
    console.log('=' .repeat(60));
    console.log(`🌐 Site: ${siteUrl}`);
    console.log('');

    const data = {};

    try {
        // 1. Get all sites
        console.log('📋 Getting all accessible sites...');
        const sites = await fetchData('https://www.googleapis.com/webmasters/v3/sites');
        data.sites = sites.siteEntry || [];
        console.log(`✅ Found ${data.sites.length} sites`);
        console.log('');

        // 2. Search Analytics - Top Queries
        console.log('🔍 Getting top search queries...');
        const topQueries = await fetchData(
            `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
            'POST',
            {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                dimensions: ['query'],
                rowLimit: 50
            }
        );
        data.topQueries = topQueries.rows || [];
        console.log(`✅ Found ${data.topQueries.length} top queries`);
        console.log('');

        // 3. Search Analytics - Top Pages
        console.log('📄 Getting top pages...');
        const topPages = await fetchData(
            `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
            'POST',
            {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                dimensions: ['page'],
                rowLimit: 50
            }
        );
        data.topPages = topPages.rows || [];
        console.log(`✅ Found ${data.topPages.length} top pages`);
        console.log('');

        // 4. Search Analytics - Countries
        console.log('🌍 Getting traffic by country...');
        const countries = await fetchData(
            `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
            'POST',
            {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                dimensions: ['country'],
                rowLimit: 20
            }
        );
        data.countries = countries.rows || [];
        console.log(`✅ Found ${data.countries.length} countries`);
        console.log('');

        // 5. Search Analytics - Devices
        console.log('📱 Getting traffic by device...');
        const devices = await fetchData(
            `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
            'POST',
            {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                dimensions: ['device'],
                rowLimit: 10
            }
        );
        data.devices = devices.rows || [];
        console.log(`✅ Found ${data.devices.length} device types`);
        console.log('');

        // 6. URL Inspection for homepage
        console.log('🔍 Inspecting homepage...');
        const urlInspection = await fetchData(
            'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
            'POST',
            {
                inspectionUrl: siteUrl,
                siteUrl: siteUrl
            }
        );
        data.urlInspection = urlInspection.inspectionResult || {};
        console.log('✅ Homepage inspection completed');
        console.log('');

        // 7. Sitemaps
        console.log('🗺️ Getting sitemap information...');
        const sitemaps = await fetchData(`https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`);
        data.sitemaps = sitemaps.sitemap || [];
        console.log(`✅ Found ${data.sitemaps.length} sitemaps`);
        console.log('');

        // 8. Overall search performance
        console.log('📊 Getting overall search performance...');
        const overallStats = await fetchData(
            `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
            'POST',
            {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                rowLimit: 1
            }
        );
        data.overallStats = overallStats.rows?.[0] || {};
        console.log('✅ Overall stats retrieved');
        console.log('');

        // Display comprehensive results
        console.log('📈 COMPREHENSIVE SEO DATA SUMMARY');
        console.log('=' .repeat(60));

        // Overall Performance
        console.log('\n🎯 OVERALL PERFORMANCE');
        console.log('─'.repeat(30));
        console.log(`Total Clicks: ${data.overallStats.clicks || 0}`);
        console.log(`Total Impressions: ${data.overallStats.impressions || 0}`);
        console.log(`Average CTR: ${((data.overallStats.ctr || 0) * 100).toFixed(2)}%`);
        console.log(`Average Position: ${(data.overallStats.position || 0).toFixed(1)}`);

        // Top Queries
        console.log('\n🔍 TOP SEARCH QUERIES');
        console.log('─'.repeat(30));
        data.topQueries.slice(0, 10).forEach((query, i) => {
            console.log(`${i + 1}. "${query.keys[0]}"`);
            console.log(`   Clicks: ${query.clicks} | Impressions: ${query.impressions} | Position: ${query.position.toFixed(1)} | CTR: ${(query.ctr * 100).toFixed(2)}%`);
        });

        // Top Pages
        console.log('\n📄 TOP PAGES');
        console.log('─'.repeat(30));
        data.topPages.slice(0, 10).forEach((page, i) => {
            console.log(`${i + 1}. ${page.keys[0]}`);
            console.log(`   Clicks: ${page.clicks} | Impressions: ${page.impressions} | Position: ${page.position.toFixed(1)} | CTR: ${(page.ctr * 100).toFixed(2)}%`);
        });

        // Countries
        console.log('\n🌍 TRAFFIC BY COUNTRY');
        console.log('─'.repeat(30));
        data.countries.slice(0, 10).forEach((country, i) => {
            console.log(`${i + 1}. ${country.keys[0].toUpperCase()}`);
            console.log(`   Clicks: ${country.clicks} | Impressions: ${country.impressions} | CTR: ${(country.ctr * 100).toFixed(2)}%`);
        });

        // Devices
        console.log('\n📱 TRAFFIC BY DEVICE');
        console.log('─'.repeat(30));
        data.devices.forEach((device, i) => {
            console.log(`${i + 1}. ${device.keys[0]}`);
            console.log(`   Clicks: ${device.clicks} | Impressions: ${device.impressions} | CTR: ${(device.ctr * 100).toFixed(2)}%`);
        });

        // URL Inspection Results
        console.log('\n🔍 HOMEPAGE INSPECTION');
        console.log('─'.repeat(30));
        const indexResult = data.urlInspection.indexStatusResult;
        if (indexResult) {
            console.log(`Index Status: ${indexResult.verdict}`);
            console.log(`Coverage State: ${indexResult.coverageState}`);
            console.log(`Robots.txt: ${indexResult.robotsTxtState}`);
            console.log(`Indexing: ${indexResult.indexingState}`);
            console.log(`Last Crawl: ${indexResult.lastCrawlTime}`);
            console.log(`Crawled As: ${indexResult.crawledAs}`);
            console.log(`Google Canonical: ${indexResult.googleCanonical}`);
            console.log(`Referring URLs: ${indexResult.referringUrls?.length || 0}`);
        }

        // Sitemap Info
        console.log('\n🗺️ SITEMAP INFORMATION');
        console.log('─'.repeat(30));
        data.sitemaps.forEach((sitemap, i) => {
            console.log(`${i + 1}. ${sitemap.path}`);
            console.log(`   Type: ${sitemap.type}`);
            console.log(`   Last Submitted: ${sitemap.lastSubmitted}`);
            console.log(`   Status: ${sitemap.isPending ? 'Pending' : 'Processed'}`);
            if (sitemap.contents) {
                sitemap.contents.forEach(content => {
                    console.log(`   ${content.type}: ${content.submitted} submitted, ${content.indexed} indexed`);
                });
            }
        });

        // Save to file
        const fs = require('fs');
        const filename = `seo-data-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\n💾 Complete data saved to: ${filename}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the extraction
extractAllSEOData().catch(console.error);
