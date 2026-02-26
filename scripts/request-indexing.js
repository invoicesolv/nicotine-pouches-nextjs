const { google } = require('googleapis');

async function requestIndexing() {
  try {
    // Initialize the Search Console API
    const searchconsole = google.searchconsole('v1');
    
    // Your access token
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';
    
    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Request indexing for the homepage
    const siteUrl = 'https://nicotine-pouches.org/';
    const inspectionUrl = 'https://nicotine-pouches.org/';
    
    console.log('🔍 Requesting indexing for:', inspectionUrl);
    console.log('📋 Site URL:', siteUrl);
    
    // First, let's inspect the URL to get current status
    console.log('\n📊 Current URL Status:');
    const inspectionResult = await searchconsole.urlInspection.index.inspect({
      auth: oauth2Client,
      requestBody: {
        inspectionUrl: inspectionUrl,
        siteUrl: siteUrl
      }
    });
    
    console.log('Coverage State:', inspectionResult.data.inspectionResult.indexStatusResult.coverageState);
    console.log('Last Crawl:', inspectionResult.data.inspectionResult.indexStatusResult.lastCrawlTime);
    console.log('Google Canonical:', inspectionResult.data.inspectionResult.indexStatusResult.googleCanonical);
    
    // Note: The Google Search Console API doesn't have a direct "request indexing" endpoint
    // The request indexing feature is only available through the web interface
    console.log('\n⚠️  Note: The Google Search Console API does not support programmatic indexing requests.');
    console.log('📝 You need to request indexing manually through the Search Console web interface:');
    console.log('   1. Go to: https://search.google.com/search-console');
    console.log('   2. Select your property: https://nicotine-pouches.org/');
    console.log('   3. Use the URL Inspection tool');
    console.log('   4. Enter: https://nicotine-pouches.org/');
    console.log('   5. Click "Request Indexing"');
    
    // However, we can submit the sitemap to help with discovery
    console.log('\n🗺️  Submitting sitemap to help with discovery...');
    
    try {
      const sitemapResult = await searchconsole.sitemaps.submit({
        auth: oauth2Client,
        siteUrl: siteUrl,
        feedpath: 'sitemap.xml'
      });
      console.log('✅ Sitemap submitted successfully');
    } catch (sitemapError) {
      console.log('⚠️  Sitemap submission failed (this is normal if sitemap was already submitted)');
    }
    
    // Let's also check what sitemaps are currently registered
    console.log('\n📋 Current sitemaps:');
    try {
      const sitemaps = await searchconsole.sitemaps.list({
        auth: oauth2Client,
        siteUrl: siteUrl
      });
      
      if (sitemaps.data.sitemap) {
        sitemaps.data.sitemap.forEach(sitemap => {
          console.log(`- ${sitemap.path} (${sitemap.type})`);
        });
      } else {
        console.log('No sitemaps found');
      }
    } catch (sitemapListError) {
      console.log('Could not retrieve sitemap list');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the function
requestIndexing();
