#!/usr/bin/env node
/**
 * Product Description Rewriter
 *
 * Transforms generic AI-generated product descriptions into unique,
 * humanized copy following copywriting best practices.
 *
 * Usage: node scripts/rewrite-product-descriptions.js
 * Output: extracted-products/products_rewritten.json
 */

const fs = require('fs');
const path = require('path');

// Input/output paths
const INPUT_FILE = path.join(__dirname, '../extracted-products/wordpress_products.json');
const OUTPUT_FILE = path.join(__dirname, '../extracted-products/products_rewritten.json');

// Flavor profile descriptions - specific, sensory language
const FLAVOR_PROFILES = {
  mint: [
    "Clean mint that hits right away and fades smoothly",
    "Spearmint-forward with a cool finish",
    "Classic mint without the artificial aftertaste",
    "Crisp peppermint that refreshes without burning",
    "Balanced mint - not too sweet, not too harsh"
  ],
  'icy mint': [
    "Intense menthol cooling with a mint base",
    "The kind of cold that wakes you up",
    "Strong cooling effect that builds gradually",
    "Menthol lovers will appreciate this one",
    "Arctic-level cooling with subtle mint underneath"
  ],
  'arctic mint': [
    "Serious cooling that numbs slightly - in a good way",
    "Menthol-heavy with a sharp mint edge",
    "Not for the faint-hearted - proper cold",
    "The cooling hits before the mint does"
  ],
  'fresh mint': [
    "Light, clean mint that doesn't overpower",
    "Garden-fresh spearmint vibes",
    "Subtle coolness, prominent mint flavour",
    "Easy-going mint for everyday use"
  ],
  spearmint: [
    "Classic spearmint - think chewing gum",
    "Sweeter mint profile, gentle cooling",
    "Familiar spearmint taste done well"
  ],
  peppermint: [
    "Sharp peppermint with real cooling",
    "Traditional peppermint, no surprises",
    "Strong mint with a slight sweetness"
  ],
  berry: [
    "Mixed berry sweetness without being cloying",
    "Berry-forward with a natural taste",
    "Think summer berries, not artificial candy"
  ],
  'blue raspberry': [
    "Sweet blue raspberry with icy undertones",
    "Candy-shop raspberry flavour",
    "Fruity and sweet with cooling finish"
  ],
  blueberry: [
    "Natural blueberry taste, not too sweet",
    "Ripe blueberry with subtle tartness",
    "Berry sweetness that doesn't overpower"
  ],
  strawberry: [
    "Fresh strawberry with natural sweetness",
    "Ripe strawberry without artificial notes",
    "Summery strawberry that tastes real"
  ],
  watermelon: [
    "Juicy watermelon - refreshing and light",
    "Sweet watermelon with a clean finish",
    "Summer watermelon vibes"
  ],
  tropical: [
    "Mixed tropical fruits - mango, pineapple, hints of citrus",
    "Tropical fruit blend that travels well",
    "Exotic fruit mix without being overwhelming"
  ],
  citrus: [
    "Bright citrus zing that perks you up",
    "Lemon-forward with orange undertones",
    "Tangy and refreshing citrus blend"
  ],
  cola: [
    "Proper cola taste - nostalgic and fun",
    "Classic cola flavour done right",
    "Like your favourite fizzy drink, minus the fizz"
  ],
  coffee: [
    "Real coffee notes, not artificial",
    "Espresso undertones with mild sweetness",
    "For coffee lovers who want that flavour all day"
  ],
  vanilla: [
    "Smooth vanilla without being too sweet",
    "Creamy vanilla that complements other notes",
    "Natural vanilla taste"
  ],
  liquorice: [
    "Traditional Scandinavian liquorice",
    "Proper salty liquorice for those who love it",
    "Aniseed notes with earthy undertones"
  ],
  cinnamon: [
    "Warm cinnamon spice - not too sweet",
    "Cinnamon heat that builds gradually",
    "Spicy cinnamon with a pleasant warmth"
  ],
  eucalyptus: [
    "Eucalyptus freshness with menthol undertones",
    "Distinctive eucalyptus - medicinal in the best way",
    "Cool eucalyptus with clearing properties"
  ],
  grapefruit: [
    "Tangy grapefruit with bitter-sweet notes",
    "Citrus punch from real grapefruit",
    "Pink grapefruit tartness"
  ],
  coconut: [
    "Creamy coconut - tropical without being overpowering",
    "Natural coconut sweetness",
    "Smooth coconut flavour"
  ],
  bubblegum: [
    "Classic bubblegum sweetness",
    "Nostalgic bubblegum flavour",
    "Sweet and fun - like the candy"
  ],
  lemon: [
    "Sharp lemon zing",
    "Fresh lemon citrus",
    "Tangy lemon that cuts through"
  ],
  cherry: [
    "Sweet cherry with natural tartness",
    "Dark cherry notes - not too candy-like",
    "Ripe cherry flavour"
  ],
  grape: [
    "Concord grape sweetness",
    "Rich grape without artificial taste",
    "Sweet grape with subtle tartness"
  ],
  apple: [
    "Crisp green apple with slight tartness",
    "Fresh apple taste - think orchard, not candy",
    "Natural apple sweetness"
  ],
  mango: [
    "Ripe mango with tropical sweetness",
    "Juicy mango that tastes authentic",
    "Exotic mango notes"
  ],
  peach: [
    "Sweet peach with summery vibes",
    "Ripe peach flavour - natural and light",
    "Peachy sweetness done well"
  ],
  default: [
    "Balanced flavour profile",
    "Clean taste throughout",
    "Well-crafted flavour blend"
  ]
};

// Strength descriptions - honest, practical language
const STRENGTH_PROFILES = {
  light: [
    "Light strength - good for beginners or casual users",
    "Gentle nicotine delivery that doesn't overwhelm",
    "Entry-level strength for those new to pouches"
  ],
  regular: [
    "Standard strength for everyday use",
    "Moderate nicotine that satisfies without being intense",
    "Middle-ground strength that works for most"
  ],
  strong: [
    "Solid strength for regular users",
    "Noticeable kick without going overboard",
    "Strong enough to satisfy experienced users"
  ],
  'extra strong': [
    "For experienced users who want more",
    "Serious strength - know your tolerance",
    "Not for newcomers - this one kicks"
  ],
  ultra: [
    "Maximum strength - experienced users only",
    "Intense hit that's not for everyone",
    "The strongest option - proceed accordingly"
  ]
};

// Format descriptions
const FORMAT_PROFILES = {
  slim: [
    "Slim format sits discreetly under your lip",
    "Slim pouches - comfortable for extended wear",
    "Low-profile slim design"
  ],
  mini: [
    "Mini pouches for maximum discretion",
    "Smallest format - barely noticeable",
    "Compact mini size"
  ],
  regular: [
    "Standard pouch size",
    "Regular format for full flavour delivery",
    "Classic pouch dimensions"
  ],
  large: [
    "Larger pouch for extended release",
    "Full-size format",
    "Bigger pouch, longer lasting"
  ]
};

// Duration phrases
const DURATION_PHRASES = [
  "Flavour lasts around 20-30 minutes",
  "Expect 25-40 minutes of flavour",
  "Good for about half an hour",
  "Typically lasts 20-35 minutes",
  "Around 30 minutes of use"
];

// Use case phrases - practical, not promotional
const USE_CASES = [
  "Works well during commutes or at the desk",
  "Good for work, travel, or anywhere you can't smoke",
  "Handy when you need nicotine without stepping outside",
  "Discreet enough for meetings or public transport",
  "Practical for situations where smoking isn't an option"
];

/**
 * Parse product info from image filename
 */
function parseImageFilename(imageTitle) {
  if (!imageTitle) return {};

  const info = {
    format: null,
    strength: null,
    nicotineMg: null
  };

  const lower = imageTitle.toLowerCase();

  // Extract format
  if (lower.includes('_mini_') || lower.includes('_mi_')) info.format = 'mini';
  else if (lower.includes('_slim_') || lower.includes('_sl_')) info.format = 'slim';
  else if (lower.includes('_large_')) info.format = 'large';
  else info.format = 'regular';

  // Extract strength
  if (lower.includes('_ultra_') || lower.includes('ultra strong')) info.strength = 'ultra';
  else if (lower.includes('_extra_strong_') || lower.includes('extra strong')) info.strength = 'extra strong';
  else if (lower.includes('_strong_')) info.strength = 'strong';
  else if (lower.includes('_light_') || lower.includes('_mild_')) info.strength = 'light';
  else info.strength = 'regular';

  // Extract nicotine mg
  const mgMatch = imageTitle.match(/(\d+)mg/i);
  if (mgMatch) {
    info.nicotineMg = parseInt(mgMatch[1]);
  } else {
    // Try pattern like "4_5" meaning 4.5 or just strength number
    const altMatch = imageTitle.match(/_(\d+)_(\d+)_/);
    if (altMatch) {
      info.nicotineMg = parseInt(altMatch[1]) * 2; // Rough estimate
    }
  }

  return info;
}

/**
 * Detect primary flavour from product name
 */
function detectFlavour(productName) {
  const lower = productName.toLowerCase();

  // Check specific flavours first (longer matches)
  if (lower.includes('blue raspberry')) return 'blue raspberry';
  if (lower.includes('arctic mint')) return 'arctic mint';
  if (lower.includes('icy mint') || lower.includes('ice mint')) return 'icy mint';
  if (lower.includes('fresh mint')) return 'fresh mint';
  if (lower.includes('cola') && lower.includes('vanilla')) return 'cola';
  if (lower.includes('forest fruit')) return 'berry';
  if (lower.includes('arctic berry')) return 'berry';

  // Single-word flavours
  const flavours = [
    'mint', 'spearmint', 'peppermint', 'menthol',
    'berry', 'blueberry', 'strawberry', 'raspberry', 'blackberry',
    'watermelon', 'melon', 'tropical', 'mango', 'peach', 'apple', 'grape',
    'citrus', 'lemon', 'lime', 'orange', 'grapefruit',
    'cola', 'coffee', 'espresso', 'vanilla', 'liquorice', 'licorice',
    'cherry', 'bubblegum', 'bubble gum',
    'cinnamon', 'eucalyptus', 'coconut'
  ];

  for (const flavour of flavours) {
    if (lower.includes(flavour)) {
      // Normalize some variations
      if (flavour === 'menthol') return 'icy mint';
      if (flavour === 'licorice') return 'liquorice';
      if (flavour === 'bubblegum' || flavour === 'bubble gum') return 'bubblegum';
      if (flavour === 'espresso') return 'coffee';
      return flavour;
    }
  }

  // Check for "ice" suffix indicating cooling
  if (lower.includes(' ice')) return 'icy mint';

  return 'default';
}

/**
 * Get random item from array with seed for consistency
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeededItem(array, seed) {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

/**
 * Generate humanized product description
 */
function generateDescription(product, index) {
  const name = product.name.replace(/&amp;/g, '&');
  const imageInfo = parseImageFilename(product.image?.title);
  const flavour = detectFlavour(name);

  // Use product ID as seed for consistent results
  const seed = product.id || index;

  // Get flavour description
  const flavourProfiles = FLAVOR_PROFILES[flavour] || FLAVOR_PROFILES.default;
  const flavourDesc = getSeededItem(flavourProfiles, seed);

  // Get strength description
  const strengthProfiles = STRENGTH_PROFILES[imageInfo.strength] || STRENGTH_PROFILES.regular;
  const strengthDesc = getSeededItem(strengthProfiles, seed + 1);

  // Get format description
  const formatProfiles = FORMAT_PROFILES[imageInfo.format] || FORMAT_PROFILES.regular;
  const formatDesc = getSeededItem(formatProfiles, seed + 2);

  // Build description with variety
  const parts = [];

  // Opening - vary the structure
  const openingStyle = Math.floor(seededRandom(seed + 3) * 4);
  switch (openingStyle) {
    case 0:
      parts.push(`${flavourDesc}.`);
      break;
    case 1:
      parts.push(`${name}: ${flavourDesc.toLowerCase()}.`);
      break;
    case 2:
      if (imageInfo.nicotineMg) {
        parts.push(`At ${imageInfo.nicotineMg}mg per pouch, this one delivers ${flavourDesc.toLowerCase()}.`);
      } else {
        parts.push(`${flavourDesc}.`);
      }
      break;
    case 3:
      parts.push(`${flavourDesc.charAt(0).toUpperCase() + flavourDesc.slice(1)}.`);
      break;
  }

  // Add strength info
  if (imageInfo.nicotineMg && openingStyle !== 2) {
    parts.push(`${imageInfo.nicotineMg}mg strength - ${strengthDesc.toLowerCase()}.`);
  } else if (imageInfo.strength !== 'regular') {
    parts.push(`${strengthDesc}.`);
  }

  // Add format info (50% chance)
  if (seededRandom(seed + 4) > 0.5 && imageInfo.format !== 'regular') {
    parts.push(formatDesc + '.');
  }

  // Add duration (30% chance)
  if (seededRandom(seed + 5) > 0.7) {
    parts.push(getSeededItem(DURATION_PHRASES, seed + 6) + '.');
  }

  // Add use case (40% chance)
  if (seededRandom(seed + 7) > 0.6) {
    parts.push(getSeededItem(USE_CASES, seed + 8) + '.');
  }

  return parts.join(' ').replace(/\.\./g, '.').trim();
}

/**
 * Generate humanized excerpt
 */
function generateExcerpt(product, description) {
  const name = product.name.replace(/&amp;/g, '&');
  const imageInfo = parseImageFilename(product.image?.title);

  // Short, factual excerpt
  const parts = [name];

  if (imageInfo.nicotineMg) {
    parts.push(`${imageInfo.nicotineMg}mg`);
  }

  if (imageInfo.format && imageInfo.format !== 'regular') {
    parts.push(imageInfo.format);
  }

  if (imageInfo.strength && imageInfo.strength !== 'regular') {
    parts.push(imageInfo.strength);
  }

  return parts.join(' - ');
}

/**
 * Main processing function
 */
async function main() {
  console.log('Loading products from:', INPUT_FILE);

  // Read input file
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const products = JSON.parse(rawData);

  console.log(`Processing ${products.length} products...`);

  // Process each product
  const rewrittenProducts = products.map((product, index) => {
    const newDescription = generateDescription(product, index);
    const newExcerpt = generateExcerpt(product, newDescription);
    const imageInfo = parseImageFilename(product.image?.title);

    return {
      ...product,
      content_original: product.content,
      content: newDescription,
      excerpt_original: product.excerpt,
      excerpt: newExcerpt,
      parsed_info: {
        format: imageInfo.format,
        strength: imageInfo.strength,
        nicotine_mg: imageInfo.nicotineMg,
        detected_flavour: detectFlavour(product.name)
      }
    };
  });

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rewrittenProducts, null, 2));

  console.log(`\nDone! Output written to: ${OUTPUT_FILE}`);
  console.log(`\nSample outputs:\n`);

  // Show samples
  for (let i = 0; i < 5; i++) {
    const p = rewrittenProducts[i];
    console.log(`--- ${p.name} ---`);
    console.log(`BEFORE: ${p.content_original.substring(0, 100)}...`);
    console.log(`AFTER:  ${p.content}`);
    console.log(`EXCERPT: ${p.excerpt}`);
    console.log(`INFO: ${JSON.stringify(p.parsed_info)}`);
    console.log('');
  }
}

main().catch(console.error);
