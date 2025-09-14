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
  fs.writeFileSync(`/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/batch_${index + 1}.sql`, batch);
});

console.log(`Created ${batches.length} batch files`);
console.log(`Each batch has ${batchSize} products`);
