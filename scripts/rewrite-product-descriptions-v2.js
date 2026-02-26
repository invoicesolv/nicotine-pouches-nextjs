#!/usr/bin/env node
/**
 * Product Description Rewriter v2
 *
 * Enhanced version with:
 * - Short descriptions (for listings/cards)
 * - Long descriptions (for product pages)
 * - Brand heritage and founder info
 * - Detailed usage instructions
 * - Strength-specific guidance
 *
 * Usage: node scripts/rewrite-product-descriptions-v2.js
 */

const fs = require('fs');
const path = require('path');
const { getBrandInfo } = require('./brand-database');

// Paths
const INPUT_FILE = path.join(__dirname, '../extracted-products/wordpress_products.json');
const OUTPUT_FILE = path.join(__dirname, '../extracted-products/products_enhanced.json');

// =============================================================================
// FLAVOR PROFILES - Sensory descriptions
// =============================================================================
const FLAVOR_PROFILES = {
  mint: {
    short: ['Classic mint', 'Clean spearmint', 'Fresh mint'],
    long: ['A balanced mint flavour that\'s neither too sweet nor too sharp. The cooling sensation comes through smoothly, making it a reliable everyday choice.', 'Traditional spearmint with a clean finish. No artificial aftertaste, just straightforward mint the way it should be.'],
    sensory: 'Cooling builds gradually over 2-3 minutes, peaking around 10 minutes before settling into a mild freshness.'
  },
  'icy mint': {
    short: ['Intense menthol', 'Arctic mint', 'Maximum cooling'],
    long: ['Serious cooling that hits immediately. The menthol is front and centre, with mint flavour supporting underneath. Not subtle - this is for users who want to feel the cold.', 'The kind of cooling that makes your eyes water slightly. Intense menthol blast followed by a lingering icy sensation.'],
    sensory: 'Immediate cooling that intensifies for the first 5 minutes. Expect a numbing sensation on the gums.'
  },
  'arctic mint': {
    short: ['Extreme cold', 'Icy fresh', 'Polar mint'],
    long: ['Menthol-forward with substantial cooling power. The mint is secondary to the ice - this is about maximum freshness.', 'Arctic-level cooling that hits hard and fast. For users who find regular mint too mild.'],
    sensory: 'Intense cooling from first contact. The sensation spreads across the mouth within seconds.'
  },
  'fresh mint': {
    short: ['Light mint', 'Garden fresh', 'Mild spearmint'],
    long: ['A gentler mint experience with subtle cooling. Good for extended use without overwhelming the palate.', 'Light spearmint with just enough cooling to notice. Perfect for users who want flavour without intensity.'],
    sensory: 'Mild cooling that remains consistent throughout use. Comfortable for 30+ minutes.'
  },
  spearmint: {
    short: ['Classic spearmint', 'Sweet mint', 'Traditional'],
    long: ['Traditional spearmint flavour like the gum you grew up with. Slightly sweet, moderately cool, universally approachable.', 'Sweet spearmint that\'s been a favourite for decades. Nostalgic flavour with modern pouch delivery.'],
    sensory: 'Gentle cooling with sweetness that develops over time. Pleasant throughout the full duration.'
  },
  peppermint: {
    short: ['Sharp peppermint', 'Strong mint', 'Classic peppermint'],
    long: ['Sharper than spearmint with more pronounced cooling. Traditional peppermint that balances sweetness and intensity.', 'Peppermint with real bite. More cooling than spearmint, with that familiar candy cane character.'],
    sensory: 'Immediate sharpness followed by steady cooling. Clean finish without lingering sweetness.'
  },
  berry: {
    short: ['Mixed berries', 'Berry blend', 'Forest fruits'],
    long: ['A blend of berry flavours - think raspberries, blackberries, and a hint of strawberry. Sweet but not cloying.', 'Mixed berry sweetness that avoids the artificial candy taste. Natural-tasting fruit flavour.'],
    sensory: 'Sweet berry taste from the start, developing subtle tartness. Flavour remains consistent.'
  },
  'blue raspberry': {
    short: ['Blue raspberry', 'Sweet berry', 'Candy berry'],
    long: ['Classic blue raspberry - the same flavour profile as the sweets. Unashamedly sweet with artificial charm.', 'Nostalgic blue raspberry that doesn\'t pretend to be natural. Fun, sweet, and tasty.'],
    sensory: 'Immediate sweetness with berry tang. The icy variants add cooling after initial taste.'
  },
  blueberry: {
    short: ['Fresh blueberry', 'Natural berry', 'Ripe blueberry'],
    long: ['Natural blueberry taste with appropriate sweetness. Not the artificial candy version - more like actual fruit.', 'Ripe blueberry flavour that tastes real. Subtle tartness balances the sweetness.'],
    sensory: 'Berry sweetness builds slowly, peaks around 10 minutes, then fades to a mild finish.'
  },
  strawberry: {
    short: ['Fresh strawberry', 'Ripe strawberry', 'Summer berry'],
    long: ['Strawberry that tastes like the fruit, not strawberry candy. Natural sweetness with realistic flavour.', 'Summer strawberry in pouch form. Sweet without being artificial.'],
    sensory: 'Sweet fruit flavour from first use. Maintains consistency throughout.'
  },
  watermelon: {
    short: ['Juicy watermelon', 'Fresh melon', 'Summer watermelon'],
    long: ['Refreshing watermelon with that distinctive light sweetness. Summery and light.', 'Juicy watermelon flavour that\'s perfect for warm weather. Not too sweet, genuinely refreshing.'],
    sensory: 'Light, refreshing sweetness. Often paired with cooling for extra freshness.'
  },
  tropical: {
    short: ['Tropical mix', 'Exotic fruits', 'Island blend'],
    long: ['A blend of tropical fruits - mango, pineapple, maybe some passion fruit. Like a holiday in your mouth.', 'Exotic fruit combination that transports you somewhere warmer. Complex but balanced.'],
    sensory: 'Layered fruit flavours reveal themselves over time. Sweet start, tangy middle, smooth finish.'
  },
  citrus: {
    short: ['Bright citrus', 'Citrus zing', 'Fresh citrus'],
    long: ['Zesty citrus that wakes you up. Lemon, lime, and orange notes combine for brightness.', 'Tangy citrus blend with genuine zing. Refreshing and energizing.'],
    sensory: 'Immediate tang that stimulates saliva. Clean, fresh finish.'
  },
  lemon: {
    short: ['Sharp lemon', 'Fresh citrus', 'Zesty lemon'],
    long: ['Sharp lemon zing with appropriate sourness. Refreshing and clean.', 'Real lemon flavour with that tongue-tingling tartness.'],
    sensory: 'Immediate sourness followed by sweet undertones. Very refreshing.'
  },
  cola: {
    short: ['Classic cola', 'Nostalgic cola', 'Cola flavour'],
    long: ['That familiar cola taste you know and love, minus the fizz. Nostalgic and fun.', 'Classic cola flavour executed well. Surprisingly authentic.'],
    sensory: 'Sweet cola taste with spice notes. Very much like flat cola - in a good way.'
  },
  coffee: {
    short: ['Real coffee', 'Espresso', 'Coffee lovers'],
    long: ['Genuine coffee notes for caffeine lovers. Roasted, slightly bitter, properly coffee.', 'Espresso-inspired flavour for users who want coffee taste all day.'],
    sensory: 'Roasted coffee from the start, with slight bitterness. No cream or sugar notes.'
  },
  vanilla: {
    short: ['Smooth vanilla', 'Creamy vanilla', 'Sweet vanilla'],
    long: ['Creamy vanilla sweetness without being overwhelming. Smooth and comforting.', 'Natural vanilla taste that complements rather than dominates.'],
    sensory: 'Gentle sweetness that develops over time. Very smooth throughout.'
  },
  liquorice: {
    short: ['Scandinavian liquorice', 'Salty liquorice', 'Traditional liquorice'],
    long: ['Traditional Scandinavian liquorice - slightly salty, very distinctive. You either love it or you don\'t.', 'Proper liquorice for true enthusiasts. Aniseed notes with earthy depth.'],
    sensory: 'Distinctive aniseed hit followed by salt and sweetness. Very traditional Nordic taste.'
  },
  cinnamon: {
    short: ['Spicy cinnamon', 'Warm cinnamon', 'Cinnamon spice'],
    long: ['Warm cinnamon spice that builds gradually. Not burning hot, just pleasantly warm.', 'Cinnamon heat without the fire. Warming and satisfying.'],
    sensory: 'Gradual warmth that spreads through the mouth. Spicy but comfortable.'
  },
  eucalyptus: {
    short: ['Fresh eucalyptus', 'Medicinal fresh', 'Herbal cooling'],
    long: ['Distinctive eucalyptus freshness - medicinal in the best way. Clears the sinuses.', 'Herbal eucalyptus with substantial cooling. Different from mint.'],
    sensory: 'Herbal cooling that feels almost medicinal. Very clearing for the airways.'
  },
  coconut: {
    short: ['Tropical coconut', 'Creamy coconut', 'Island coconut'],
    long: ['Creamy coconut without being suntan-lotion sweet. Genuinely tastes like coconut.', 'Natural coconut flavour that\'s tropical but not artificial.'],
    sensory: 'Creamy sweetness that builds. Very smooth and mellow.'
  },
  cherry: {
    short: ['Sweet cherry', 'Ripe cherry', 'Dark cherry'],
    long: ['Dark cherry flavour with natural sweetness and slight tartness. Not cherry candy.', 'Ripe cherry taste that avoids the artificial medicine flavour.'],
    sensory: 'Sweet fruit with tart undertones. Flavour develops nicely over time.'
  },
  grape: {
    short: ['Sweet grape', 'Concord grape', 'Rich grape'],
    long: ['Rich grape flavour like Concord grapes. Sweet and slightly tart.', 'Grapey goodness without artificial notes. Natural-tasting fruit.'],
    sensory: 'Full grape sweetness from the start. Pleasant tartness in the finish.'
  },
  apple: {
    short: ['Crisp apple', 'Green apple', 'Fresh apple'],
    long: ['Crisp green apple with appropriate tartness. Like biting into a Granny Smith.', 'Fresh apple flavour that\'s more orchard than candy.'],
    sensory: 'Crisp tartness initially, sweetness develops. Very clean finish.'
  },
  mango: {
    short: ['Ripe mango', 'Tropical mango', 'Exotic mango'],
    long: ['Ripe mango with tropical sweetness. Exotic but not overpowering.', 'Authentic mango flavour that captures the fruit\'s complexity.'],
    sensory: 'Rich tropical sweetness that develops over use. Very satisfying.'
  },
  peach: {
    short: ['Sweet peach', 'Ripe peach', 'Summer peach'],
    long: ['Sweet peach with summery vibes. Ripe and juicy tasting.', 'Natural peach flavour - sweet, slightly tart, very refreshing.'],
    sensory: 'Soft sweetness that\'s gentle on the palate. Very mellow.'
  },
  grapefruit: {
    short: ['Tangy grapefruit', 'Pink grapefruit', 'Citrus bitter'],
    long: ['Tangy grapefruit with characteristic bitter-sweet notes. Refreshingly tart.', 'Pink grapefruit tartness that wakes up the palate.'],
    sensory: 'Immediate tartness followed by subtle sweetness. Very refreshing.'
  },
  bubblegum: {
    short: ['Classic bubblegum', 'Sweet bubblegum', 'Nostalgic'],
    long: ['Classic bubblegum sweetness from your childhood. Unashamedly candy-like.', 'Nostalgic bubblegum flavour done right. Fun and sweet.'],
    sensory: 'Immediate sweetness that\'s very familiar. Long-lasting flavour.'
  },
  default: {
    short: ['Balanced flavour', 'Smooth taste', 'Well-crafted'],
    long: ['A balanced flavour profile designed for everyday enjoyment.', 'Well-crafted taste that delivers consistent satisfaction.'],
    sensory: 'Consistent flavour throughout use.'
  }
};

// =============================================================================
// STRENGTH PROFILES - Guidance based on nicotine level
// =============================================================================
const STRENGTH_PROFILES = {
  light: {
    range: '1-4mg',
    who: 'Perfect for beginners or light users',
    experience: 'Mild nicotine delivery with minimal throat sensation. Suitable for those new to nicotine pouches or users who prefer a gentler experience.',
    usage: 'Can be used frequently throughout the day without concerns about overconsumption. Good for social situations.',
    warning: null
  },
  regular: {
    range: '5-8mg',
    who: 'Ideal for everyday users',
    experience: 'Moderate nicotine that satisfies without overwhelming. The sweet spot for most regular users.',
    usage: 'Suitable for regular use throughout the day. Most users find 5-10 pouches per day comfortable.',
    warning: 'Monitor usage if new to pouches - effects are more noticeable than light strength.'
  },
  strong: {
    range: '9-12mg',
    who: 'For experienced users',
    experience: 'Substantial nicotine kick that regular users will appreciate. Noticeable throat sensation and quicker satisfaction.',
    usage: 'Experienced users typically use 4-8 pouches daily. Space out usage for best results.',
    warning: 'Not recommended for beginners. Build up tolerance with lower strengths first.'
  },
  'extra strong': {
    range: '13-20mg',
    who: 'Experienced users only',
    experience: 'Intense nicotine delivery with strong throat hit. Significant effects within minutes.',
    usage: 'Limit usage and space pouches further apart. Effects can be too intense for some.',
    warning: 'Can cause nausea, dizziness, or discomfort if tolerance is insufficient. Start with half a pouch if unsure.'
  },
  ultra: {
    range: '20mg+',
    who: 'Heavy users with high tolerance',
    experience: 'Maximum nicotine intensity. Very strong effects that last. Not for casual users.',
    usage: 'Use sparingly - effects are powerful. Many users limit to 2-4 per day maximum.',
    warning: 'Serious strength that requires substantial tolerance. Overconsumption can cause significant discomfort. Know your limits.'
  }
};

// =============================================================================
// FORMAT PROFILES - Pouch size and comfort
// =============================================================================
const FORMAT_PROFILES = {
  mini: {
    description: 'Smallest format',
    comfort: 'Nearly invisible under the lip. Perfect for situations requiring absolute discretion.',
    duration: 'Slightly shorter duration (15-25 minutes) due to smaller size.',
    who: 'Users who prioritize discretion over flavour intensity.'
  },
  slim: {
    description: 'Low-profile format',
    comfort: 'Sits flat against the gum. Comfortable for extended wear without noticeable bulge.',
    duration: 'Standard duration of 20-35 minutes depending on product.',
    who: 'The most popular format - balances comfort, discretion, and performance.'
  },
  regular: {
    description: 'Standard format',
    comfort: 'Traditional pouch size. More noticeable but delivers fuller flavour.',
    duration: 'Longer duration of 25-40 minutes. More nicotine capacity.',
    who: 'Users who prioritize flavour and nicotine delivery over maximum discretion.'
  },
  large: {
    description: 'Full-size format',
    comfort: 'Larger pouch with maximum capacity. Noticeable presence under the lip.',
    duration: 'Extended duration of 30-45+ minutes. Maximum flavour and nicotine.',
    who: 'Users who want the most from each pouch and don\'t mind visibility.'
  }
};

// =============================================================================
// USAGE TIPS - General and specific guidance
// =============================================================================
const USAGE_TIPS = {
  general: [
    'Place the pouch between your upper lip and gum. The nicotine absorbs through the gum tissue.',
    'A slight tingling sensation is normal - this is the nicotine being released.',
    'Keep the pouch in place for 20-45 minutes depending on strength and format.',
    'Dispose of used pouches responsibly - most cans have a compartment for used pouches.',
    'Stay hydrated. Nicotine pouches can cause dry mouth.',
    'Store pouches in a cool, dry place. Refrigeration extends freshness but isn\'t required.'
  ],
  firstTime: [
    'Start with a lower strength (4-6mg) if you\'re new to nicotine pouches.',
    'Use for 10-15 minutes initially to gauge your tolerance.',
    'If you feel dizzy or nauseous, remove the pouch immediately.',
    'Don\'t swallow - while not dangerous, it\'s uncomfortable.',
    'Wait at least an hour before trying a second pouch if new to these products.'
  ],
  switching: [
    'Former smokers often start with regular strength (6-8mg) and adjust from there.',
    'Vape users may need less nicotine than expected - start lower and increase if needed.',
    'The absorption is different from smoking - effects may feel different even at equivalent nicotine levels.',
    'Give yourself a week to adjust to the different delivery method.'
  ]
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function parseImageFilename(imageTitle) {
  if (!imageTitle) return {};

  const info = { format: 'regular', strength: 'regular', nicotineMg: null };
  const lower = imageTitle.toLowerCase();

  // Format
  if (lower.includes('_mini_') || lower.includes('_mi_')) info.format = 'mini';
  else if (lower.includes('_slim_') || lower.includes('_sl_')) info.format = 'slim';
  else if (lower.includes('_large_')) info.format = 'large';

  // Strength
  if (lower.includes('_ultra_') || lower.includes('ultra strong')) info.strength = 'ultra';
  else if (lower.includes('_extra_strong_') || lower.includes('extra strong')) info.strength = 'extra strong';
  else if (lower.includes('_strong_')) info.strength = 'strong';
  else if (lower.includes('_light_') || lower.includes('_mild_')) info.strength = 'light';

  // Nicotine mg
  const mgMatch = imageTitle.match(/(\d+)mg/i);
  if (mgMatch) info.nicotineMg = parseInt(mgMatch[1]);

  // Infer strength from mg if not detected
  if (info.nicotineMg && info.strength === 'regular') {
    if (info.nicotineMg <= 4) info.strength = 'light';
    else if (info.nicotineMg <= 8) info.strength = 'regular';
    else if (info.nicotineMg <= 12) info.strength = 'strong';
    else if (info.nicotineMg <= 20) info.strength = 'extra strong';
    else info.strength = 'ultra';
  }

  return info;
}

function detectFlavour(productName) {
  const lower = productName.toLowerCase();

  // Multi-word flavours first
  const multiWord = [
    ['blue raspberry', 'blue raspberry'],
    ['arctic mint', 'arctic mint'],
    ['icy mint', 'icy mint'],
    ['ice mint', 'icy mint'],
    ['fresh mint', 'fresh mint'],
    ['bubble gum', 'bubblegum'],
    ['forest fruit', 'berry'],
    ['arctic berry', 'berry']
  ];

  for (const [pattern, flavour] of multiWord) {
    if (lower.includes(pattern)) return flavour;
  }

  // Single-word flavours (longer words first to avoid partial matches)
  const singleWord = [
    'grapefruit', 'strawberry', 'blueberry', 'blackberry', 'raspberry', // Long berry words first
    'watermelon', 'spearmint', 'peppermint', 'eucalyptus', 'liquorice', 'licorice',
    'bubblegum', 'cinnamon', 'tropical', 'coconut', 'espresso',
    'menthol', 'vanilla', 'cherry', 'citrus', 'coffee', 'orange',
    'mango', 'peach', 'apple', 'grape', 'lemon', 'melon', 'berry',
    'cola', 'lime', 'mint' // Short words last
  ];

  for (const flavour of singleWord) {
    if (lower.includes(flavour)) {
      if (flavour === 'menthol') return 'icy mint';
      if (flavour === 'licorice') return 'liquorice';
      if (flavour === 'espresso') return 'coffee';
      return flavour;
    }
  }

  if (lower.includes(' ice')) return 'icy mint';
  return 'default';
}

function extractBrand(productName) {
  const parts = productName.replace(/&amp;/g, '&').split(' ');
  return parts[0] || 'Unknown';
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeededItem(array, seed) {
  return array[Math.floor(seededRandom(seed) * array.length)];
}

// =============================================================================
// DESCRIPTION GENERATORS
// =============================================================================

function generateShortDescription(product, info, flavourData, brandInfo) {
  const name = product.name.replace(/&amp;/g, '&');
  const seed = product.id || 0;

  const parts = [];

  // Flavour + strength
  const flavourShort = getSeededItem(flavourData.short, seed);
  parts.push(flavourShort);

  if (info.nicotineMg) {
    parts.push(`${info.nicotineMg}mg`);
  }

  if (info.format !== 'regular') {
    parts.push(info.format);
  }

  // Add brand origin for known brands
  if (brandInfo.country && brandInfo.country !== 'Europe') {
    parts.push(`from ${brandInfo.country}`);
  }

  return parts.join(' · ');
}

function generateLongDescription(product, info, flavourData, brandInfo) {
  const name = product.name.replace(/&amp;/g, '&');
  const brandName = extractBrand(product.name);
  const seed = product.id || 0;

  const strengthInfo = STRENGTH_PROFILES[info.strength] || STRENGTH_PROFILES.regular;
  const formatInfo = FORMAT_PROFILES[info.format] || FORMAT_PROFILES.regular;

  const sections = [];

  // Opening paragraph - flavour and strength
  const flavourLong = getSeededItem(flavourData.long, seed);
  const mgText = info.nicotineMg ? `At ${info.nicotineMg}mg per pouch, this` : 'This';
  sections.push(`${flavourLong}\n\n${mgText} falls into the ${info.strength} category. ${strengthInfo.experience}`);

  // Brand heritage section
  if (brandInfo.heritage && brandInfo.name !== 'Unknown') {
    sections.push(`\n\n**About ${brandInfo.name}**\n${brandInfo.heritage}`);
    if (brandInfo.founded) {
      const foundersText = brandInfo.founders !== 'Independent producers'
        ? ` by ${brandInfo.founders}`
        : '';
      sections.push(`Founded in ${brandInfo.founded}${foundersText} in ${brandInfo.country}.`);
    }
  }

  // Format and usage section
  sections.push(`\n\n**Format & Usage**\n${formatInfo.description}. ${formatInfo.comfort} ${formatInfo.duration}`);

  // Sensory experience
  if (flavourData.sensory) {
    sections.push(`\n\n**What to Expect**\n${flavourData.sensory}`);
  }

  // Strength guidance
  sections.push(`\n\n**Who Is This For?**\n${strengthInfo.who}. ${strengthInfo.usage}`);

  // Warning if applicable
  if (strengthInfo.warning) {
    sections.push(`\n\n**Note:** ${strengthInfo.warning}`);
  }

  return sections.join('');
}

function generateUsageGuide(info) {
  const tips = [...USAGE_TIPS.general];

  if (info.strength === 'extra strong' || info.strength === 'ultra') {
    tips.push('For high-strength products: start with partial pouches if unsure of tolerance.');
    tips.push('Space out usage more than you would with regular strength products.');
  }

  if (info.strength === 'light') {
    tips.push('Light strength pouches are great for frequent use throughout the day.');
  }

  return tips;
}

// =============================================================================
// MAIN PROCESSING
// =============================================================================

async function main() {
  console.log('Loading products...');
  const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`Processing ${products.length} products with enhanced descriptions...\n`);

  const enhanced = products.map((product, index) => {
    const brandName = extractBrand(product.name);
    const brandInfo = getBrandInfo(brandName);
    const imageInfo = parseImageFilename(product.image?.title);
    const flavour = detectFlavour(product.name);
    const flavourData = FLAVOR_PROFILES[flavour] || FLAVOR_PROFILES.default;

    const shortDesc = generateShortDescription(product, imageInfo, flavourData, brandInfo);
    const longDesc = generateLongDescription(product, imageInfo, flavourData, brandInfo);
    const usageGuide = generateUsageGuide(imageInfo);

    return {
      ...product,
      name: product.name.replace(/&amp;/g, '&'),
      descriptions: {
        short: shortDesc,
        long: longDesc,
        original: product.content
      },
      brand: {
        name: brandInfo.name,
        country: brandInfo.country,
        parentCompany: brandInfo.parentCompany,
        founded: brandInfo.founded,
        founders: brandInfo.founders,
        heritage: brandInfo.heritage,
        story: brandInfo.story,
        facts: brandInfo.facts,
        website: brandInfo.website
      },
      product_info: {
        format: imageInfo.format,
        strength: imageInfo.strength,
        nicotine_mg: imageInfo.nicotineMg,
        flavour_category: flavour
      },
      usage: {
        tips: usageGuide,
        for_beginners: USAGE_TIPS.firstTime,
        for_switchers: USAGE_TIPS.switching
      }
    };
  });

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhanced, null, 2));
  console.log(`Output written to: ${OUTPUT_FILE}\n`);

  // Show samples
  console.log('='.repeat(80));
  console.log('SAMPLE OUTPUTS');
  console.log('='.repeat(80));

  for (let i = 0; i < 3; i++) {
    const p = enhanced[i];
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`PRODUCT: ${p.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`\nSHORT: ${p.descriptions.short}`);
    console.log(`\nLONG:\n${p.descriptions.long}`);
    console.log(`\nBRAND: ${p.brand.name} (${p.brand.country}) - Founded ${p.brand.founded || 'N/A'}`);
    console.log(`PRODUCT INFO: ${JSON.stringify(p.product_info)}`);
  }

  // Show a ZYN and VELO sample
  const zyn = enhanced.find(p => p.name.startsWith('ZYN'));
  const velo = enhanced.find(p => p.name.startsWith('Velo'));

  if (zyn) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`PRODUCT: ${zyn.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`\nSHORT: ${zyn.descriptions.short}`);
    console.log(`\nLONG:\n${zyn.descriptions.long}`);
    console.log(`\nHERITAGE: ${zyn.brand.heritage}`);
  }

  if (velo) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`PRODUCT: ${velo.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`\nSHORT: ${velo.descriptions.short}`);
    console.log(`\nLONG:\n${velo.descriptions.long}`);
    console.log(`\nHERITAGE: ${velo.brand.heritage}`);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Total products enhanced: ${enhanced.length}`);
  console.log(`Brands with heritage info: ${new Set(enhanced.map(p => p.brand.name)).size}`);
}

main().catch(console.error);
