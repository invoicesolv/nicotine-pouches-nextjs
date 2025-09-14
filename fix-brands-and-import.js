const fs = require('fs');

// Read the ZYN products data
const zynData = JSON.parse(fs.readFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json', 'utf8'));

console.log(`Processing ${zynData.length} products...`);

// Function to extract brand from product title
function extractBrand(productTitle) {
  const title = productTitle.toUpperCase();
  
  // List of known brands in order of preference (longer names first)
  const brands = [
    'WHITE FOX', 'JUICE HEAD', 'SIBERIA', 'XQS', 'LUCY', 'FRE', 'GRIZZLY', 
    'BRIDGE', 'HIT', 'SESH', 'VELO', 'ROGUE', 'SYX', 'NICS', 'VITO', 
    'ZIMO', 'ZONE', 'ZEO', 'ON', 'ALP', '2ONE', 'ZYN'
  ];
  
  for (const brand of brands) {
    if (title.includes(brand)) {
      return brand;
    }
  }
  
  // If no brand found, try to extract from the beginning of the title
  const words = productTitle.split(' ');
  if (words.length > 0) {
    return words[0].toUpperCase();
  }
  
  return 'UNKNOWN';
}

// Function to extract flavour from product title
function extractFlavour(productTitle, brand) {
  let flavour = productTitle;
  
  // Remove brand name
  if (brand !== 'UNKNOWN') {
    flavour = flavour.replace(new RegExp(`^${brand}\\s*`, 'i'), '');
  }
  
  // Remove strength (mg)
  flavour = flavour.replace(/\s*\d+mg\s*$/, '');
  
  // Remove common suffixes
  flavour = flavour.replace(/\s*(tin|can|pouch|pouches)$/i, '');
  
  return flavour.trim() || 'Original';
}

// Process each product with correct brand extraction
const processedProducts = zynData.map(product => {
  const brand = extractBrand(product.product_title);
  const flavour = extractFlavour(product.product_title, brand);
  const nicotineMatch = product.nicotine_mg_pouch.match(/(\d+)/);
  const nicotineValue = nicotineMatch ? parseInt(nicotineMatch[1]) : 6;
  
  return {
    product_title: product.product_title.replace(/'/g, "''"),
    brand: brand,
    flavour: flavour,
    strength: product.strength,
    format: product.format,
    nicotine_mg_pouch: nicotineValue,
    td_element: brand,
    description: product.description.replace(/'/g, "''"),
    page_url: product.page_url,
    image_url: product.image_url
  };
});

// Count brands
const brandCounts = {};
processedProducts.forEach(product => {
  brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
});

console.log('Brand distribution:');
Object.entries(brandCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([brand, count]) => {
    console.log(`${brand}: ${count} products`);
  });

// Generate SQL insert statements in batches of 20
const batchSize = 20;
const batches = [];

for (let i = 0; i < processedProducts.length; i += batchSize) {
  const batch = processedProducts.slice(i, i + batchSize);
  const values = batch.map(product => 
    `('${product.product_title}', '${product.brand}', '${product.flavour}', '${product.strength}', '${product.format}', ${product.nicotine_mg_pouch}, '${product.td_element}', '${product.description}', '${product.page_url}', '${product.image_url}')`
  ).join(',\n');
  
  batches.push(`INSERT INTO us_products (product_title, brand, flavour, strength, format, nicotine_mg_pouch, td_element, description, page_url, image_url) VALUES \n${values};`);
}

// Write each batch to separate files
batches.forEach((batch, index) => {
  fs.writeFileSync(`/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/fixed_batch_${index + 1}.sql`, batch);
});

console.log(`Created ${batches.length} fixed batch files`);
console.log(`Each batch has ${batchSize} products`);
