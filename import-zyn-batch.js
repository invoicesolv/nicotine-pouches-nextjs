const fs = require('fs');

// Read the ZYN products data
const zynData = JSON.parse(fs.readFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/zyn_products_data.json', 'utf8'));

console.log(`Total products: ${zynData.length}`);

// Show first few products
console.log('First 3 products:');
zynData.slice(0, 3).forEach((product, index) => {
  console.log(`${index + 1}. ${product.product_title} - ${product.image_url}`);
});

// Generate SQL insert statements
const insertStatements = zynData.map(product => {
  return `INSERT INTO us_products (product_title, brand, flavour, strength, format, nicotine_mg_pouch, td_element, description, page_url, image_url) VALUES ('${product.product_title.replace(/'/g, "''")}', '${product.brand}', '${product.flavour}', '${product.strength}', '${product.format}', '${product.nicotine_mg_pouch}', '${product.td_element}', '${product.description.replace(/'/g, "''")}', '${product.page_url}', '${product.image_url}');`;
});

// Write to SQL file
fs.writeFileSync('/Users/solvifyab/Desktop/NP/nicotine-pouches-nextjs/import_zyn_products.sql', insertStatements.join('\n'));

console.log('SQL file created: import_zyn_products.sql');
