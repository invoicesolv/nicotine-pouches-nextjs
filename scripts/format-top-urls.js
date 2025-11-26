// Top 10 URLs by clicks from Google Search Console
const data = {
  "rows": [
    {
      "keys": ["https://nicotine-pouches.org/"],
      "clicks": 8,
      "impressions": 149,
      "ctr": 0.053691275167785234,
      "position": 62.308724832214764
    },
    {
      "keys": ["https://nicotine-pouches.org/careers/"],
      "clicks": 4,
      "impressions": 17,
      "ctr": 0.23529411764705882,
      "position": 6.117647058823529
    },
    {
      "keys": ["https://nicotine-pouches.org/product/icy-blackcurrant-nicotine-pouches-by-zyn-3/"],
      "clicks": 2,
      "impressions": 217,
      "ctr": 0.0092165898617511521,
      "position": 45.451612903225808
    },
    {
      "keys": ["https://nicotine-pouches.org/nicotine-pouches-api-doc-2/"],
      "clicks": 1,
      "impressions": 12,
      "ctr": 0.083333333333333329,
      "position": 22.083333333333332
    },
    {
      "keys": ["https://nicotine-pouches.org/product-category/helwit/"],
      "clicks": 1,
      "impressions": 633,
      "ctr": 0.0015797788309636651,
      "position": 80.262243285939974
    },
    {
      "keys": ["https://nicotine-pouches.org/product/berries-nicotine-pearls-by-nicopop-3/"],
      "clicks": 1,
      "impressions": 225,
      "ctr": 0.0044444444444444444,
      "position": 40.226666666666667
    },
    {
      "keys": ["https://nicotine-pouches.org/product/espressino-mini-nicotine-pouches-by-zyn-3/"],
      "clicks": 1,
      "impressions": 379,
      "ctr": 0.0026385224274406332,
      "position": 75.84696569920844
    },
    {
      "keys": ["https://nicotine-pouches.org/product/mocha-nicotine-pouches-by-helwit-3/"],
      "clicks": 1,
      "impressions": 238,
      "ctr": 0.0042016806722689074,
      "position": 64.529411764705884
    },
    {
      "keys": ["https://nicotine-pouches.org/product/one-paw-nicotine-pouches-by-white-fox-3/"],
      "clicks": 1,
      "impressions": 21,
      "ctr": 0.047619047619047616,
      "position": 29.095238095238095
    },
    {
      "keys": ["https://nicotine-pouches.org/what-you-need-to-know-about-black-buffalo/"],
      "clicks": 1,
      "impressions": 503,
      "ctr": 0.0019880715705765406,
      "position": 69.023856858846912
    }
  ]
};

console.log('🏆 TOP 10 URLs MED MEST KLICK (Senaste 30 dagarna)');
console.log('=' .repeat(80));
console.log('📅 Period: 2024-08-28 till 2024-09-28\n');

data.rows.forEach((row, index) => {
  const url = row.keys[0];
  const clicks = row.clicks;
  const impressions = row.impressions;
  const ctr = row.ctr;
  const position = row.position;
  
  // Extract page name from URL
  let pageName = url.replace('https://nicotine-pouches.org', '');
  if (pageName === '/') pageName = 'Hemsida';
  else if (pageName.startsWith('/product/')) {
    pageName = pageName.replace('/product/', '').replace(/-/g, ' ').replace(/\//g, '');
  } else if (pageName.startsWith('/product-category/')) {
    pageName = pageName.replace('/product-category/', '').replace(/-/g, ' ').replace(/\//g, '');
  } else {
    pageName = pageName.replace(/\//g, '').replace(/-/g, ' ');
  }
  
  console.log(`${index + 1}. ${pageName}`);
  console.log(`   🔗 URL: ${url}`);
  console.log(`   📊 Klick: ${clicks.toLocaleString()}`);
  console.log(`   👁️  Visningar: ${impressions.toLocaleString()}`);
  console.log(`   📈 CTR: ${(ctr * 100).toFixed(2)}%`);
  console.log(`   📍 Position: ${position.toFixed(1)}`);
  console.log('');
});

// Calculate summary stats
const totalClicks = data.rows.reduce((sum, row) => sum + row.clicks, 0);
const totalImpressions = data.rows.reduce((sum, row) => sum + row.impressions, 0);
const avgCTR = data.rows.reduce((sum, row) => sum + row.ctr, 0) / data.rows.length;
const avgPosition = data.rows.reduce((sum, row) => sum + row.position, 0) / data.rows.length;

console.log('📊 SAMMANFATTNING:');
console.log('=' .repeat(40));
console.log(`Totala klick: ${totalClicks.toLocaleString()}`);
console.log(`Totala visningar: ${totalImpressions.toLocaleString()}`);
console.log(`Genomsnittlig CTR: ${(avgCTR * 100).toFixed(2)}%`);
console.log(`Genomsnittlig position: ${avgPosition.toFixed(1)}`);

console.log('\n💡 INSIKTER:');
console.log('• Hemsidan får flest klick (8) men har låg CTR (5.4%)');
console.log('• Careers-sidan har högst CTR (23.5%) och bäst position (6.1)');
console.log('• Produktsidor får många visningar men få klick');
console.log('• Genomsnittlig position är 49.7 - behöver förbättras');
