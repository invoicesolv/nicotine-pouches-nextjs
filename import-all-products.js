const fs = require('fs');

// Read the ZYN products data
const zynData = JSON.parse(fs.readFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json', 'utf8'));

console.log(`Processing ${zynData.length} products...`);

// Process each product to extract numeric nicotine value
const processedProducts = zynData.map(product => {
  const nicotineMatch = product.nicotine_mg_pouch.match(/(\d+)/);
  const nicotineValue = nicotineMatch ? parseInt(nicotineMatch[1]) : 6;
  
  return {
    product_title: product.product_title.replace(/'/g, "''"),
    brand: product.brand,
    flavour: product.flavour,
    strength: product.strength,
    format: product.format,
    nicotine_mg_pouch: nicotineValue,
    td_element: product.td_element,
    description: product.description.replace(/'/g, "''"),
    page_url: product.page_url,
    image_url: product.image_url
  };
});

// Generate SQL insert statements in batches of 50
const batchSize = 50;
const batches = [];

for (let i = 0; i < processedProducts.length; i += batchSize) {
  const batch = processedProducts.slice(i, i + batchSize);
  const values = batch.map(product => 
    `('${product.product_title}', '${product.brand}', '${product.flavour}', '${product.strength}', '${product.format}', ${product.nicotine_mg_pouch}, '${product.td_element}', '${product.description}', '${product.page_url}', '${product.image_url}')`
  ).join(',\n');
  
  batches.push(`INSERT INTO us_products (product_title, brand, flavour, strength, format, nicotine_mg_pouch, td_element, description, page_url, image_url) VALUES \n${values};`);
}

// Write to SQL file
fs.writeFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/import_all_products.sql', batches.join('\n\n'));

console.log(`Created SQL file with ${batches.length} batches`);
console.log(`First batch preview:`);
console.log(batches[0].substring(0, 500) + '...');
