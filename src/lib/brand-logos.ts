// Brand logo mapping for UK brands
// Maps brand names to their logo file paths in /brand-logos/uk/

export const brandLogoMap: Record<string, string> = {
  '4NX': '/brand-logos/uk/4nx.webp',
  '77': '/brand-logos/uk/77_logo.webp',
  'Ace': '/brand-logos/uk/ace.png',
  'Apres': '/brand-logos/uk/apres_nicotine_pouches.webp',
  'Arctic7': '/brand-logos/uk/Brand_Logos_Arctic_7.webp',
  'Avant': '/brand-logos/uk/Brand_Logos_Avant.webp',
  'BAGZ': '/brand-logos/uk/bagz-logo-1.jpg',
  'BAOW': '/brand-logos/uk/baow-300x300.webp',
  'BLOW': '/brand-logos/uk/Brand_Logos_Blow.webp',
  'Camo': '/brand-logos/uk/Camo-Logo.png',
  'Chainpop': '/brand-logos/uk/Asset-3-3x-8.png',
  'Chapo': '/brand-logos/uk/Brand_Logos_Chapo.webp',
  'Clew': '/brand-logos/uk/clew-logo-800x800.jpg',
  'Coco': '/brand-logos/uk/COCO.jpeg',
  'Crown': '/brand-logos/uk/CROWN.png',
  'Cuba': '/brand-logos/uk/Cuba_Nicotine_Pouchesv01.webp',
  'ELF': '/brand-logos/uk/ELF_Nicotine_Pouches.webp',
  'ELUX': '/brand-logos/uk/elux-nicotine-pouches-261726.webp',
  'Eos': '/brand-logos/uk/Brand_Logos_EOS.webp',
  'FEDRS': '/brand-logos/uk/fedrs-969159.png',
  'Fix': '/brand-logos/uk/fix-logo-300-lila@2x.png',
  'Frokens': '/brand-logos/uk/Brand_Logos_Frokens_Nikotin.webp',
  'FUMi': '/brand-logos/uk/fumi_nicotine_pouches.webp',
  'GOAT': '/brand-logos/uk/goat-nicotine-pouches-logo-400.webp',
  'Garant': '/brand-logos/uk/Garant-Logo-1.png',
  'Helwit': '/brand-logos/uk/helwit.webp',
  'Hit': '/brand-logos/uk/hit_nicotine_pouches.webp',
  'Ice': '/brand-logos/uk/ICE_Logo_Black.png',
  'Iceberg': '/brand-logos/uk/iceberg-logo_medium.avif',
  'Kelly': '/brand-logos/uk/Kelly_White_Nicotine_Pouchesv01.webp',
  'Kelly White': '/brand-logos/uk/Kelly_White_Nicotine_Pouchesv01.webp',
  'KILLA': '/brand-logos/uk/killa_nicotine_pouches.webp',
  'Klar': '/brand-logos/uk/Brand_Logos_Klar.webp',
  'Klint': '/brand-logos/uk/klint_nicotine_pouches.webp',
  'Kurwa': '/brand-logos/uk/kurwa_nicotine_pouches.webp',
  'Level': '/brand-logos/uk/Brand_Logos_Level.webp',
  'Lips': '/brand-logos/uk/lips_nicotine_pouches.webp',
  'Loop': '/brand-logos/uk/loop_nicotine_pouches.webp',
  'Lundgrens': '/brand-logos/uk/LUNDGRENS.webp',
  'Lyft': '/brand-logos/uk/lyft_nicotine_pouches.webp',
  'Lynx': '/brand-logos/uk/4d4da563ab9d001d5893c1a228a5208b.w1201.h1200.jpg',
  'Maggie': '/brand-logos/uk/maggie-logo.webp',
  'Miami': '/brand-logos/uk/MIAMI.png',
  'Morko': '/brand-logos/uk/Brand_Logos_Morko.webp',
  'Niccos': '/brand-logos/uk/Niccos_snus_logo.webp',
  'Noat': '/brand-logos/uk/Brand_Logos_Noat.webp',
  'Nois': '/brand-logos/uk/nois-901735.webp',
  'Nordic': '/brand-logos/uk/nordic-spirit-258314.png',
  'Nordic Spirit': '/brand-logos/uk/nordic-spirit-258314.png',
  'On': '/brand-logos/uk/ON!.png',
  'On!': '/brand-logos/uk/ON!.png',
  'Pablo': '/brand-logos/uk/pablo_nicotine_pouches.webp',
  'Poke': '/brand-logos/uk/Poke-Nicotine-Pouches-Idea-Vape.webp',
  'Rabbit': '/brand-logos/uk/RABBIT.png',
  'Rave': '/brand-logos/uk/RAVE.png',
  'Rush': '/brand-logos/uk/Logo_footer.webp',
  'Siberia': '/brand-logos/uk/siberia_nicotine_pouches.webp',
  'Skruf': '/brand-logos/uk/Skruf_snus_logo.png',
  'Snatch': '/brand-logos/uk/snatch_nicotine_pouches.webp',
  'Stellar': '/brand-logos/uk/Brand_Logos_Stellar.webp',
  'STNG': '/brand-logos/uk/Brand_Logos_Stng.webp',
  'Stripe': '/brand-logos/uk/stripe_nicotine_pouches.webp',
  'TACJA': '/brand-logos/uk/tacja_nicotine_pouches.webp',
  'Thunder': '/brand-logos/uk/thunder-snus-the-royal-snus-online.png',
  'UBBS': '/brand-logos/uk/Ubbs_Logov01.webp',
  'Velo': '/brand-logos/uk/velo-1.svg',
  'ViD': '/brand-logos/uk/Logo_footer.webp',
  'Volt': '/brand-logos/uk/volt_nicotine_pouches.webp',
  'V&YOU': '/brand-logos/uk/V&YOU.png',
  'White': '/brand-logos/uk/whitefox_nicotine_pouches.webp',
  'White Fox': '/brand-logos/uk/whitefox_nicotine_pouches.webp',
  'XO': '/brand-logos/uk/Brand_Logos_XO.webp',
  'XQS': '/brand-logos/uk/xqs_nicotine_pouches.webp',
  'ZYN': '/brand-logos/uk/zyn-908781.png',
};

/**
 * Get the logo path for a brand name
 * @param brandName - The brand name (e.g., "ZYN", "Velo", "Nordic Spirit")
 * @returns The logo path or null if not found
 */
export function getBrandLogo(brandName: string): string | null {
  // Try exact match first
  if (brandLogoMap[brandName]) {
    return brandLogoMap[brandName];
  }
  
  // Try case-insensitive match
  const normalizedBrand = Object.keys(brandLogoMap).find(
    key => key.toLowerCase() === brandName.toLowerCase()
  );
  
  if (normalizedBrand) {
    return brandLogoMap[normalizedBrand];
  }
  
  // Try partial match (for variations like "On!" vs "ON")
  const partialMatch = Object.keys(brandLogoMap).find(
    key => key.toLowerCase().replace(/[^a-z0-9]/g, '') === brandName.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  
  if (partialMatch) {
    return brandLogoMap[partialMatch];
  }
  
  return null;
}

// US Brand logo mapping
// Maps brand names to their logo file paths in /brand-logos/us/
// Falls back to UK logos if US logo doesn't exist
export const usBrandLogoMap: Record<string, string> = {
  'ALP': '/brand-logos/us/alp-logo.webp',
  'ZEO': '/brand-logos/us/zeo.png',
  'FRE': '/brand-logos/us/fre_logo_black_a4714335-c526-4719-bd21-2c631938f82f.webp',
  'FRE Zone': '/brand-logos/us/fre_logo_black_a4714335-c526-4719-bd21-2c631938f82f.webp',
  'Rouge': '/brand-logos/us/rouge.png',
  'ROGUE': '/brand-logos/us/rouge.png',
  'Rogue': '/brand-logos/us/rouge.png',
  'SYX': '/brand-logos/us/zyx.jpeg',
  'Syx': '/brand-logos/us/zyx.jpeg',
  'ZYX': '/brand-logos/us/zyx.jpeg',
  'Zyx': '/brand-logos/us/zyx.jpeg',
  'Vito': '/brand-logos/us/vito.png',
  'VITO': '/brand-logos/us/vito.png',
  'Zone': '/brand-logos/us/zonex_nicotine_pouches_the_royal_snus_online3.png',
  'ZONE': '/brand-logos/us/zonex_nicotine_pouches_the_royal_snus_online3.png',
  'ZoneX': '/brand-logos/us/zonex_nicotine_pouches_the_royal_snus_online3.png',
  'sesh': '/brand-logos/us/sesh-logo_black.png',
  'Sesh': '/brand-logos/us/sesh-logo_black.png',
  'SESH': '/brand-logos/us/sesh-logo_black.png',
  'nics': '/brand-logos/us/nic-s.jpg',
  'Nics': '/brand-logos/us/nic-s.jpg',
  'NIC-S': '/brand-logos/us/nic-s.jpg',
  'Grizzly': '/brand-logos/us/Grizzly_snuff_logo.png',
  'Juice Head': '/brand-logos/us/juice-head.webp',
  'Lucy': '/brand-logos/us/lucy.jpeg',
  'Zimo': '/brand-logos/us/zimo-logo-white.png',
  'ZIMO': '/brand-logos/us/zimo-logo-white.png',
  'Bridge': '/brand-logos/us/brdige-logo.png',
};

/**
 * Get the logo path for a US brand name
 * @param brandName - The brand name (e.g., "ZYN", "Velo", "LOOP")
 * @returns The logo path or null if not found
 */
export function getUSBrandLogo(brandName: string): string | null {
  // Try exact match first
  if (usBrandLogoMap[brandName]) {
    return usBrandLogoMap[brandName];
  }
  
  // Try case-insensitive match in US map
  const normalizedUSBrand = Object.keys(usBrandLogoMap).find(
    key => key.toLowerCase() === brandName.toLowerCase()
  );
  
  if (normalizedUSBrand) {
    return usBrandLogoMap[normalizedUSBrand];
  }
  
  // Try partial match (e.g., "Zone" matches "ZoneX")
  const partialMatch = Object.keys(usBrandLogoMap).find(
    key => {
      const keyLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameLower = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return keyLower.includes(nameLower) || nameLower.includes(keyLower);
    }
  );
  
  if (partialMatch) {
    return usBrandLogoMap[partialMatch];
  }
  
  // Fallback to UK logos (many brands are the same)
  return getBrandLogo(brandName);
}

