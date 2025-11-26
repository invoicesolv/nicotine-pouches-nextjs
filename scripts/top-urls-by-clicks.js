const { google } = require('googleapis');

async function getTopUrlsByClicks() {
  try {
    // Initialize the Search Console API
    const searchconsole = google.searchconsole('v1');
    
    // Your access token
    const accessToken = 'REDACTED_GOOGLE_TOKEN';
    
    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const siteUrl = 'https://nicotine-pouches.org/';
    
    console.log('🔍 Getting top 10 URLs by clicks for:', siteUrl);
    console.log('📅 Last 30 days data\n');
    
    // Get search analytics data for pages (URLs) - using the correct API structure
    const response = await searchconsole.searchAnalytics.query({
      auth: oauth2Client,
      siteUrl: siteUrl,
      requestBody: {
        startDate: '2024-08-28', // 30 days ago
        endDate: '2024-09-28',   // Today
        dimensions: ['page'],     // Group by page URL
        rowLimit: 10,            // Top 10 results
        dimensionFilterGroups: [{
          groupType: 'and',
          filters: [{
            dimension: 'page',
            operator: 'contains',
            expression: 'nicotine-pouches.org'
          }]
        }]
      }
    });
    
    if (!response.data.rows || response.data.rows.length === 0) {
      console.log('❌ No data found for the specified period');
      return;
    }
    
    console.log('🏆 TOP 10 URLs BY CLICKS:');
    console.log('=' .repeat(80));
    
    response.data.rows.forEach((row, index) => {
      const url = row.keys[0];
      const clicks = row.clicks;
      const impressions = row.impressions;
      const ctr = row.ctr;
      const position = row.position;
      
      console.log(`${index + 1}. ${url}`);
      console.log(`   📊 Clicks: ${clicks.toLocaleString()}`);
      console.log(`   👁️  Impressions: ${impressions.toLocaleString()}`);
      console.log(`   📈 CTR: ${(ctr * 100).toFixed(2)}%`);
      console.log(`   📍 Position: ${position.toFixed(1)}`);
      console.log('');
    });
    
    // Get summary stats
    const totalClicks = response.data.rows.reduce((sum, row) => sum + row.clicks, 0);
    const totalImpressions = response.data.rows.reduce((sum, row) => sum + row.impressions, 0);
    const avgCTR = response.data.rows.reduce((sum, row) => sum + row.ctr, 0) / response.data.rows.length;
    const avgPosition = response.data.rows.reduce((sum, row) => sum + row.position, 0) / response.data.rows.length;
    
    console.log('📊 SUMMARY STATISTICS:');
    console.log('=' .repeat(40));
    console.log(`Total Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`Average CTR: ${(avgCTR * 100).toFixed(2)}%`);
    console.log(`Average Position: ${avgPosition.toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the function
getTopUrlsByClicks();