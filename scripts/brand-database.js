/**
 * Brand Database - Heritage, Founders, and Brand Information
 *
 * Contains detailed information about nicotine pouch brands including:
 * - Country of origin
 * - Parent company
 * - Founding year
 * - Founder names (where known)
 * - Brand story/heritage
 * - Notable facts
 */

const BRAND_DATABASE = {
  'ZYN': {
    country: 'Sweden',
    parentCompany: 'Swedish Match (Philip Morris International)',
    founded: 2016,
    founders: 'Swedish Match R&D team',
    heritage: 'ZYN was developed by Swedish Match, a company with over 100 years of tobacco expertise dating back to 1915. The brand launched in 2016 as one of the first major tobacco-free nicotine pouches, drawing on Sweden\'s long snus tradition. Swedish Match was acquired by Philip Morris International in 2022 for $16 billion, largely due to ZYN\'s success.',
    story: 'Born from Swedish snus culture, ZYN pioneered the modern nicotine pouch category. Swedish Match applied their century of expertise to create a tobacco-free alternative that maintains the oral nicotine experience Scandinavians have enjoyed for generations.',
    facts: ['Market leader in the US', 'Available in over 20 countries', 'First major tobacco-free pouch brand'],
    website: 'zyn.com'
  },

  'Velo': {
    country: 'Sweden',
    parentCompany: 'British American Tobacco (BAT)',
    founded: 2019,
    founders: 'British American Tobacco',
    heritage: 'VELO emerged from BAT\'s modern oral nicotine portfolio, rebranding from the earlier Lyft/Epok products. BAT, founded in 1902, invested heavily in smoke-free alternatives. VELO represents their flagship tobacco-free pouch brand, developed in their Swedish innovation hub.',
    story: 'VELO combines British American Tobacco\'s global reach with Swedish pouch expertise. The brand focuses on accessibility and a wide flavour range, making nicotine pouches approachable for those transitioning from smoking.',
    facts: ['Formerly known as Lyft in some markets', 'Sold in over 40 countries', 'Part of BAT\'s £5 billion smoke-free investment'],
    website: 'velo.com'
  },

  'Lyft': {
    country: 'Sweden',
    parentCompany: 'British American Tobacco',
    founded: 2018,
    founders: 'British American Tobacco',
    heritage: 'Lyft was BAT\'s original all-white nicotine pouch brand, launched in Scandinavia before being rebranded to VELO in most markets. Some regions still sell under the Lyft name.',
    story: 'Lyft paved the way for VELO, establishing BAT\'s presence in the tobacco-free pouch market. The brand\'s clean, minimal design appealed to users wanting to move away from traditional tobacco products.',
    facts: ['Rebranded to VELO in most markets', 'Still available as Lyft in some countries'],
    website: 'velo.com'
  },

  'On!': {
    country: 'Sweden',
    parentCompany: 'Altria (formerly Swedish Match USA)',
    founded: 2020,
    founders: 'Altria Group',
    heritage: 'On! was created specifically for the American market by Helix Innovations, later acquired by Altria. The brand focuses on smaller, mini-format pouches with lower nicotine levels, targeting a different demographic than traditional snus users.',
    story: 'Designed with American consumers in mind, On! offers a gentler introduction to nicotine pouches. The mini format and varied nicotine strengths (2mg to 8mg) make it approachable for newcomers.',
    facts: ['Mini pouch format specialist', 'Lower nicotine range than competitors', 'Popular with first-time pouch users'],
    website: 'onnicotine.com'
  },

  'Skruf': {
    country: 'Sweden',
    parentCompany: 'Imperial Brands',
    founded: 2002,
    founders: 'Jonas Engwall, Adam Gillberg',
    heritage: 'Skruf started in Skruv, a small village in southern Sweden, founded by two entrepreneurs who wanted to challenge the Swedish Match monopoly. The brand name plays on both the village name and Swedish slang. Imperial Brands acquired Skruf in 2019.',
    story: 'What began as two friends\' rebellion against tobacco giants became one of Sweden\'s most respected snus and nicotine pouch makers. Skruf maintains its craft approach while benefiting from Imperial\'s global distribution.',
    facts: ['Named after the village of Skruv', 'Known for quality tobacco and now pouches', 'Acquired by Imperial Brands in 2019'],
    website: 'skruf.se'
  },

  'Siberia': {
    country: 'Sweden',
    parentCompany: 'GN Tobacco',
    founded: 2004,
    founders: 'GN Tobacco Sweden',
    heritage: 'Siberia became legendary in the snus world for its extreme nicotine strength, originally launched as a traditional snus before tobacco-free versions appeared. The name evokes the harsh Siberian cold, matching its intense menthol kick.',
    story: 'Siberia built its reputation on being unapologetically strong. When the brand moved into tobacco-free pouches, it maintained this identity. Not for beginners - Siberia is for experienced users who want maximum impact.',
    facts: ['Known for extremely high nicotine content', 'Cult following among strength seekers', 'Iconic red packaging'],
    website: 'gntobacco.com'
  },

  'KILLA': {
    country: 'Poland',
    parentCompany: 'N.G.P. Empire',
    founded: 2019,
    founders: 'N.G.P. Empire team',
    heritage: 'KILLA emerged from Poland\'s growing nicotine pouch industry, quickly gaining a reputation for bold flavours and strong nicotine content. The brand targets younger users with edgy branding and fruit-forward flavours.',
    story: 'KILLA doesn\'t pretend to be subtle. With names like "Cold Mint" and "Watermelon" and strength levels that compete with Siberia, the brand appeals to users who want an intense experience.',
    facts: ['Polish brand with European distribution', 'Known for bold flavours and high strength', 'Popular in Eastern European markets'],
    website: 'killabrand.com'
  },

  'Pablo': {
    country: 'Poland',
    parentCompany: 'N.G.P. Empire',
    founded: 2019,
    founders: 'N.G.P. Empire',
    heritage: 'Pablo quickly became infamous for producing some of the strongest nicotine pouches available, with products reaching up to 50mg per pouch. The brand doesn\'t shy away from its reputation for extreme strength.',
    story: 'Named provocatively, Pablo carved out a niche as the go-to brand for users seeking extreme nicotine delivery. The brand is upfront about its strength - these products are strictly for experienced users.',
    facts: ['Among the strongest pouches available', 'Products up to 50mg nicotine', 'Not recommended for beginners'],
    website: 'pablonicopods.com'
  },

  'Iceberg': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Undisclosed',
    heritage: 'Iceberg positioned itself in the premium strong pouch segment, offering a wide variety of flavours with substantial nicotine content. The brand name reflects its cooling, intense experience.',
    story: 'Iceberg fills the gap between mainstream brands and extreme-strength products. With 20-50mg options and adventurous flavours, it appeals to experienced users wanting variety without going to extremes.',
    facts: ['Wide flavour range', 'Strong to very strong nicotine levels', 'Growing European presence'],
    website: 'icebergnicopods.com'
  },

  'Loop': {
    country: 'Sweden',
    parentCompany: 'Another Snus Factory (ASF)',
    founded: 2019,
    founders: 'Another Snus Factory team',
    heritage: 'Loop was created by Another Snus Factory, known for innovative product development. The brand uses a unique "Instant Rush" technology for faster nicotine release and focuses on sustainability.',
    story: 'Loop aims to reinvent the nicotine pouch with technology-driven improvements. Their patented delivery system provides quicker satisfaction, while eco-conscious packaging appeals to environmentally aware consumers.',
    facts: ['Uses "Instant Rush" technology', 'Focus on sustainability', 'Unique flavour combinations'],
    website: 'loopnicopods.com'
  },

  'Helwit': {
    country: 'Sweden',
    parentCompany: 'Habit Factory',
    founded: 2020,
    founders: 'Habit Factory AB',
    heritage: 'Helwit was developed as a clean, straightforward nicotine pouch brand with a focus on quality ingredients and transparent manufacturing. Swedish-made with Scandinavian design principles.',
    story: 'Helwit keeps things simple: quality pouches, honest flavours, no gimmicks. The brand appeals to users who want reliable performance without flashy marketing.',
    facts: ['Swedish manufactured', 'Clean, minimal branding', 'Focus on quality ingredients'],
    website: 'helwit.se'
  },

  'Klint': {
    country: 'Sweden',
    parentCompany: 'The Snus Brothers',
    founded: 2019,
    founders: 'The Snus Brothers',
    heritage: 'Klint offers a more accessible entry point to nicotine pouches with moderate strengths and approachable flavours. Swedish-made with attention to comfort and taste.',
    story: 'Klint targets users who want quality without extremes. With nicotine levels from 4mg to 12mg and subtle flavours, it\'s designed for everyday use.',
    facts: ['Moderate strength range', 'Comfortable pouch format', 'Swedish quality'],
    website: 'klint.com'
  },

  '77': {
    country: 'Sweden',
    parentCompany: 'Swedish Match',
    founded: 2020,
    founders: 'Swedish Match',
    heritage: '77 is Swedish Match\'s value-oriented nicotine pouch brand, offering quality at accessible prices. The brand leverages Swedish Match\'s manufacturing expertise while targeting budget-conscious consumers.',
    story: 'Not everyone needs premium prices. 77 delivers Swedish Match quality in a no-frills package, making nicotine pouches accessible to more users without compromising on the basics.',
    facts: ['Value brand from Swedish Match', 'Wide flavour range', 'Budget-friendly option'],
    website: 'swedishmatch.com'
  },

  'Ace': {
    country: 'Denmark',
    parentCompany: 'Ministry of Snus',
    founded: 2019,
    founders: 'Ministry of Snus',
    heritage: 'Ace comes from Denmark\'s Ministry of Snus, a company focused on innovative nicotine products. The brand offers a balanced range of strengths and flavours with Scandinavian quality.',
    story: 'Ace brings Danish design sensibility to nicotine pouches. Clean flavours, thoughtful packaging, and reliable performance define the brand.',
    facts: ['Danish brand', 'Part of Ministry of Snus portfolio', 'Balanced strength range'],
    website: 'ministryofsnus.com'
  },

  'Nordic': {
    country: 'Sweden',
    parentCompany: 'Nordic Spirit (JTI)',
    founded: 2019,
    founders: 'Japan Tobacco International',
    heritage: 'Nordic Spirit is JTI\'s entry into the tobacco-free pouch market, leveraging the company\'s Scandinavian operations and global distribution network.',
    story: 'Backed by one of the world\'s largest tobacco companies, Nordic Spirit brings manufacturing scale and consistent quality to the nicotine pouch category.',
    facts: ['Owned by Japan Tobacco International', 'Global distribution', 'Consistent quality'],
    website: 'nordicspirit.co.uk'
  },

  'White': {
    country: 'Sweden',
    parentCompany: 'Swedish Match',
    founded: 2016,
    founders: 'Swedish Match',
    heritage: 'White Fox was an early tobacco-free pouch brand from Swedish Match, known for its iconic arctic fox branding and strong mint flavours.',
    story: 'White Fox established the visual language for strong nicotine pouches with its distinctive packaging. The brand remains popular among users who want reliable strength.',
    facts: ['Iconic white fox branding', 'Strong nicotine focus', 'Early market entrant'],
    website: 'swedishmatch.com'
  },

  'Thunder': {
    country: 'Sweden',
    parentCompany: 'V2 Tobacco',
    founded: 2018,
    founders: 'V2 Tobacco',
    heritage: 'Thunder builds on V2 Tobacco\'s legacy of strong snus products. The nicotine pouch version maintains the brand\'s reputation for intensity.',
    story: 'Thunder doesn\'t do subtle. The brand serves users who graduated from regular strength products and need something with more impact.',
    facts: ['Known for high strength', 'V2 Tobacco heritage', 'Strong following in Scandinavia'],
    website: 'v2tobacco.com'
  },

  'Kurwa': {
    country: 'Poland',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Independent producers',
    heritage: 'Kurwa takes its name from a Polish expletive, signaling its irreverent approach. The brand is known for extremely high nicotine content and bold marketing.',
    story: 'Kurwa embraces controversy with its name and extreme products. Strictly for experienced users who want maximum nicotine delivery.',
    facts: ['Provocative branding', 'Extremely high nicotine', 'Cult following'],
    website: 'N/A'
  },

  'XQS': {
    country: 'Sweden',
    parentCompany: 'XQS Nicotine Pouches AB',
    founded: 2019,
    founders: 'Swedish entrepreneurs',
    heritage: 'XQS focuses on creating smooth, enjoyable nicotine pouches with carefully crafted flavours. Swedish manufacturing with attention to pouch quality.',
    story: 'XQS prioritizes the user experience - comfortable pouches, balanced flavours, and consistent nicotine delivery. Quality over extremes.',
    facts: ['Swedish made', 'Focus on comfort', 'Balanced strength options'],
    website: 'xqs.se'
  },

  'Volt': {
    country: 'Sweden',
    parentCompany: 'NGP Empire',
    founded: 2020,
    founders: 'NGP Empire',
    heritage: 'Volt entered the market with a range of strengths from mild to intense, appealing to users across the experience spectrum.',
    story: 'Volt offers something for everyone - from 4mg for beginners to 12mg+ for experienced users. The brand emphasizes choice and accessibility.',
    facts: ['Wide strength range', 'Accessible pricing', 'Growing brand'],
    website: 'voltnicopods.com'
  },

  'Fix': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'European producers',
    heritage: 'Fix positioned itself as a reliable, no-nonsense nicotine pouch brand with straightforward products and honest marketing.',
    story: 'Fix does what it says - delivers nicotine in a convenient format without fancy claims or extreme marketing.',
    facts: ['Straightforward approach', 'Reliable products', 'Value-oriented'],
    website: 'N/A'
  },

  'Chapo': {
    country: 'Germany',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'German manufacturers',
    heritage: 'Chapo emerged from Germany\'s growing nicotine pouch market with a focus on strong products and bold flavours.',
    story: 'Chapo brings German precision to nicotine pouches, offering consistent products with reliable strength.',
    facts: ['German brand', 'Strong product focus', 'Growing European presence'],
    website: 'N/A'
  },

  'ELF': {
    country: 'Europe',
    parentCompany: 'ELF Bar (ELFWORLD)',
    founded: 2021,
    founders: 'ELF Bar team',
    heritage: 'ELF expanded from disposable vapes into nicotine pouches, bringing their flavour expertise to the oral nicotine category.',
    story: 'Known for innovative vape flavours, ELF applies the same creativity to nicotine pouches with unique taste combinations.',
    facts: ['From ELF Bar vape brand', 'Flavour innovation focus', 'Young brand'],
    website: 'elfbar.com'
  },

  'ELUX': {
    country: 'UK',
    parentCompany: 'ELUX',
    founded: 2021,
    founders: 'ELUX team',
    heritage: 'ELUX moved from vaping products into nicotine pouches, targeting UK consumers with accessible products.',
    story: 'ELUX brings vape-inspired flavours to the pouch format, appealing to users who enjoy bold, creative tastes.',
    facts: ['UK brand', 'Vape brand origins', 'Creative flavours'],
    website: 'eluxbar.co.uk'
  },

  'Lundgrens': {
    country: 'Sweden',
    parentCompany: 'Fiedler & Lundgren',
    founded: 2003,
    founders: 'Fiedler & Lundgren',
    heritage: 'Lundgrens has deep roots in Swedish snus tradition, producing quality products for over two decades before entering the tobacco-free pouch market.',
    story: 'With authentic Swedish heritage, Lundgrens brings traditional craftsmanship to modern nicotine pouches. Quality and consistency are paramount.',
    facts: ['Traditional Swedish brand', 'Long heritage', 'Quality focus'],
    website: 'lundgrens.se'
  },

  'Hit': {
    country: 'Sweden',
    parentCompany: 'Swedish Match',
    founded: 2021,
    founders: 'Swedish Match',
    heritage: 'Hit is Swedish Match\'s entry-level pouch brand, designed to make nicotine pouches accessible to a broader audience.',
    story: 'Hit keeps things simple - straightforward products at accessible prices, backed by Swedish Match quality.',
    facts: ['Budget-friendly', 'Swedish Match quality', 'Simple product line'],
    website: 'swedishmatch.com'
  },

  'Rave': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'European producers',
    heritage: 'Rave targets younger consumers with vibrant branding and bold flavour profiles.',
    story: 'Rave brings energy to the nicotine pouch category with party-inspired branding and fun flavour combinations.',
    facts: ['Youth-oriented branding', 'Bold flavours', 'Growing presence'],
    website: 'N/A'
  },

  'Snatch': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'European producers',
    heritage: 'Snatch entered the market with strong products and edgy branding, targeting experienced users.',
    story: 'Snatch doesn\'t hold back with strength or flavour intensity, appealing to users who want maximum impact.',
    facts: ['Strong products', 'Edgy branding', 'For experienced users'],
    website: 'N/A'
  },

  'Cuba': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'European producers',
    heritage: 'Cuba plays on tropical themes with its branding and flavour selection.',
    story: 'Cuba brings island vibes to nicotine pouches with tropical flavours and relaxed branding.',
    facts: ['Tropical theme', 'Fruit-forward flavours', 'Casual branding'],
    website: 'N/A'
  },

  'FUMi': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish entrepreneurs',
    heritage: 'FUMi focuses on pure, clean nicotine pouches with minimal additives and straightforward formulations.',
    story: 'FUMi appeals to health-conscious users who want nicotine without unnecessary additives.',
    facts: ['Clean formulation focus', 'Swedish made', 'Minimal additives'],
    website: 'fuminicopods.com'
  },

  'Lynx': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish producers',
    heritage: 'Lynx entered the market with a focus on premium ingredients and comfortable pouch design.',
    story: 'Lynx prioritizes the user experience with soft pouches and natural flavour profiles.',
    facts: ['Premium positioning', 'Comfortable pouches', 'Natural flavours'],
    website: 'N/A'
  },

  'Chainpop': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Chainpop offers a wide variety of creative flavour combinations at accessible prices.',
    story: 'Chainpop experiments with flavours that other brands might consider too unusual, appealing to adventurous users.',
    facts: ['Creative flavours', 'Affordable pricing', 'Wide selection'],
    website: 'N/A'
  },

  'Crown': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Crown positions itself as a premium option with refined flavours and quality ingredients.',
    story: 'Crown aims for sophistication in the nicotine pouch market with elegant packaging and balanced flavours.',
    facts: ['Premium positioning', 'Refined flavours', 'Quality focus'],
    website: 'N/A'
  },

  '4NX': {
    country: 'UK',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'UK entrepreneurs',
    heritage: '4NX (pronounced "for nix" or "for kicks") is a UK brand focusing on accessible nicotine pouches for the British market.',
    story: '4NX brings locally-relevant products to UK consumers with flavours and strengths suited to British preferences.',
    facts: ['UK brand', 'Local market focus', 'Accessible products'],
    website: '4nx.co.uk'
  },

  'Apres': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Apres (French for "after") positions itself for moments of relaxation and unwinding.',
    story: 'Apres creates products for downtime - after work, after dinner, after the gym.',
    facts: ['Relaxation-focused branding', 'Moderate strengths', 'Lifestyle positioning'],
    website: 'N/A'
  },

  'Arctic7': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Arctic7 specializes in cooling, menthol-forward products with an icy theme.',
    story: 'Arctic7 is for users who love intense cooling - every product delivers that frozen sensation.',
    facts: ['Menthol specialist', 'Strong cooling', 'Icy theme'],
    website: 'N/A'
  },

  'BAGZ': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'BAGZ offers straightforward nicotine pouches with no-frills branding.',
    story: 'BAGZ keeps it simple - good pouches at fair prices without elaborate marketing.',
    facts: ['Simple approach', 'Value pricing', 'No-frills'],
    website: 'N/A'
  },

  'BAOW': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'BAOW (pronounced "bow") makes an impact with bold branding and strong products.',
    story: 'BAOW aims to make a statement with punchy flavours and eye-catching packaging.',
    facts: ['Bold branding', 'Strong products', 'Statement brand'],
    website: 'N/A'
  },

  'BLOW': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'BLOW entered the market targeting younger consumers with contemporary branding.',
    story: 'BLOW brings a fresh, modern approach to nicotine pouches with updated aesthetics.',
    facts: ['Modern branding', 'Youth focus', 'Contemporary design'],
    website: 'N/A'
  },

  'Camo': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Camo plays on military/outdoor themes with camouflage-inspired branding.',
    story: 'Camo appeals to outdoors enthusiasts and those who appreciate rugged branding.',
    facts: ['Outdoor theme', 'Camouflage branding', 'Rugged positioning'],
    website: 'N/A'
  },

  'Clew': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Clew offers a range of products focused on flavour quality and pouch comfort.',
    story: 'Clew emphasizes the essentials - good taste and comfortable fit.',
    facts: ['Flavour focus', 'Comfortable pouches', 'Quality emphasis'],
    website: 'N/A'
  },

  'Coco': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Coco specializes in tropical and coconut-themed flavour profiles.',
    story: 'Coco brings island flavours to nicotine pouches for users who want something different from mint.',
    facts: ['Tropical flavours', 'Coconut theme', 'Unique profiles'],
    website: 'N/A'
  },

  'Eos': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Eos (Greek goddess of dawn) positions itself as a fresh, new beginning in nicotine products.',
    story: 'Eos offers clean, light products for users who want a gentler nicotine experience.',
    facts: ['Light products', 'Fresh theme', 'Gentle experience'],
    website: 'N/A'
  },

  'FEDRS': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'FEDRS creates strong nicotine pouches with intense flavours.',
    story: 'FEDRS targets experienced users who want high strength and bold taste.',
    facts: ['Strong products', 'Intense flavours', 'For experienced users'],
    website: 'N/A'
  },

  'Avant': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Avant positions itself as forward-thinking with innovative flavour combinations.',
    story: 'Avant experiments with unique flavours that push boundaries in the pouch category.',
    facts: ['Innovative flavours', 'Forward-thinking', 'Experimental'],
    website: 'N/A'
  },

  'Frokens': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish producers',
    heritage: 'Frokens (Swedish for "miss" or "young woman") targets a female demographic with thoughtful product design.',
    story: 'Frokens recognized that women are an underserved market in nicotine pouches and created products with their preferences in mind.',
    facts: ['Female-focused', 'Thoughtful design', 'Swedish made'],
    website: 'N/A'
  },

  'GOAT': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'GOAT (Greatest Of All Time) makes bold claims with its branding and delivers strong products.',
    story: 'GOAT aims to be the best in class with premium quality and memorable branding.',
    facts: ['Bold branding', 'Premium claims', 'Strong products'],
    website: 'N/A'
  },

  'Garant': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish producers',
    heritage: 'Garant focuses on guaranteed quality with consistent products.',
    story: 'Garant is about reliability - users know exactly what to expect every time.',
    facts: ['Quality guarantee', 'Consistent products', 'Swedish made'],
    website: 'N/A'
  },

  'Ice': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Ice specializes in cooling, menthol products with maximum freshness.',
    story: 'Ice is for users who want the coldest possible experience from their pouches.',
    facts: ['Maximum cooling', 'Menthol focus', 'Fresh theme'],
    website: 'N/A'
  },

  'Kelly': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Kelly offers approachable products with friendly branding.',
    story: 'Kelly aims to make nicotine pouches less intimidating with welcoming design.',
    facts: ['Approachable branding', 'Friendly design', 'Accessible products'],
    website: 'N/A'
  },

  'Klar': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish producers',
    heritage: 'Klar (Swedish for "clear" or "ready") emphasizes transparency and straightforward products.',
    story: 'Klar is about clarity - clear ingredients, clear strength levels, clear expectations.',
    facts: ['Transparent approach', 'Swedish made', 'Clear products'],
    website: 'N/A'
  },

  'Level': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Level offers a range of precisely measured nicotine strengths for consistent dosing.',
    story: 'Level is for users who want to know exactly how much nicotine they\'re getting.',
    facts: ['Precise dosing', 'Consistent strength', 'Controlled experience'],
    website: 'N/A'
  },

  'Lips': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Lips focuses on comfortable pouches designed for extended wear.',
    story: 'Lips prioritizes how the pouch feels - soft materials and ergonomic design.',
    facts: ['Comfort focus', 'Soft pouches', 'Extended wear'],
    website: 'N/A'
  },

  'Maggie': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Maggie offers friendly, approachable products with classic flavours.',
    story: 'Maggie keeps things traditional with tried-and-tested flavours that work.',
    facts: ['Classic flavours', 'Friendly branding', 'Traditional approach'],
    website: 'N/A'
  },

  'Miami': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Miami brings vice city vibes with tropical flavours and vibrant branding.',
    story: 'Miami is about fun, sun, and fruit flavours - a vacation in a pouch.',
    facts: ['Tropical theme', 'Vibrant branding', 'Fruit flavours'],
    website: 'N/A'
  },

  'Morko': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Morko offers strong products with bold, dark branding.',
    story: 'Morko goes dark with its aesthetic while delivering intense nicotine experiences.',
    facts: ['Dark branding', 'Strong products', 'Bold aesthetic'],
    website: 'N/A'
  },

  'Niccos': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Niccos offers straightforward nicotine pouches with no-nonsense branding.',
    story: 'Niccos is direct - it\'s about nicotine, nothing more, nothing less.',
    facts: ['Direct branding', 'Straightforward products', 'No-nonsense'],
    website: 'N/A'
  },

  'Noat': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Noat focuses on natural ingredients and clean formulations.',
    story: 'Noat appeals to users who want fewer artificial ingredients in their pouches.',
    facts: ['Natural focus', 'Clean formulation', 'Minimal additives'],
    website: 'N/A'
  },

  'Nois': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Nois offers bold products with punchy branding.',
    story: 'Nois makes noise in the market with striking design and strong flavours.',
    facts: ['Bold branding', 'Strong flavours', 'Eye-catching'],
    website: 'N/A'
  },

  'Poke': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Poke offers playful products with light-hearted branding.',
    story: 'Poke doesn\'t take itself too seriously - fun flavours, casual vibes.',
    facts: ['Playful branding', 'Fun flavours', 'Casual approach'],
    website: 'N/A'
  },

  'Rabbit': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Rabbit offers quick-release nicotine pouches for fast satisfaction.',
    story: 'Rabbit is about speed - fast nicotine delivery for users who don\'t want to wait.',
    facts: ['Fast release', 'Quick satisfaction', 'Speed focus'],
    website: 'N/A'
  },

  'Rush': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Rush delivers intense products for users seeking immediate impact.',
    story: 'Rush is for users who want to feel something right away - no slow builds here.',
    facts: ['Intense products', 'Fast acting', 'Immediate impact'],
    website: 'N/A'
  },

  'STNG': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'STNG (Sting) delivers sharp, intense products that live up to the name.',
    story: 'STNG warns you in the name - these pouches have bite.',
    facts: ['Intense products', 'Sharp experience', 'Strong nicotine'],
    website: 'N/A'
  },

  'Stellar': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Stellar positions itself as a premium option with star-quality products.',
    story: 'Stellar aims high with premium ingredients and refined flavours.',
    facts: ['Premium positioning', 'Quality focus', 'Refined products'],
    website: 'N/A'
  },

  'Stripe': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'Stripe offers clean, minimal products with straightforward branding.',
    story: 'Stripe keeps things stripped back - essential products without extras.',
    facts: ['Minimal branding', 'Clean products', 'Stripped back'],
    website: 'N/A'
  },

  'TACJA': {
    country: 'Poland',
    parentCompany: 'ELF Bar (ELFWORLD)',
    founded: 2022,
    founders: 'ELF Bar team',
    heritage: 'TACJA is ELF Bar\'s dedicated nicotine pouch brand for the European market.',
    story: 'TACJA brings ELF Bar\'s flavour expertise to nicotine pouches with creative combinations.',
    facts: ['From ELF Bar', 'Creative flavours', 'European focus'],
    website: 'tacja.com'
  },

  'UBBS': {
    country: 'UK',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'UK entrepreneurs',
    heritage: 'UBBS targets UK consumers with locally-relevant products and British branding.',
    story: 'UBBS is unashamedly British, creating products for UK tastes and preferences.',
    facts: ['UK brand', 'Local focus', 'British branding'],
    website: 'ubbs.co.uk'
  },

  'V&YOU': {
    country: 'UK',
    parentCompany: 'V&YOU Ltd',
    founded: 2019,
    founders: 'V&YOU team',
    heritage: 'V&YOU focuses on functional nicotine pouches with added benefits like CBD or vitamins.',
    story: 'V&YOU goes beyond nicotine with functional ingredients for users seeking additional benefits.',
    facts: ['Functional products', 'Added ingredients', 'UK brand'],
    website: 'vandyou.com'
  },

  'ViD': {
    country: 'Sweden',
    parentCompany: 'Independent',
    founded: 2020,
    founders: 'Swedish producers',
    heritage: 'ViD offers a range of nicotine strengths with consistent Swedish quality.',
    story: 'ViD is about variety - different strengths and flavours for different moments.',
    facts: ['Swedish made', 'Variety focus', 'Consistent quality'],
    website: 'N/A'
  },

  'XO': {
    country: 'Europe',
    parentCompany: 'Independent',
    founded: 2021,
    founders: 'European producers',
    heritage: 'XO positions itself as a premium choice with sophisticated branding.',
    story: 'XO brings elegance to nicotine pouches with refined products and tasteful design.',
    facts: ['Premium branding', 'Sophisticated', 'Elegant design'],
    website: 'N/A'
  }
};

// Default brand info for unknown brands
const DEFAULT_BRAND = {
  country: 'Europe',
  parentCompany: 'Independent',
  founded: 2021,
  founders: 'Independent producers',
  heritage: 'Part of the growing European nicotine pouch market.',
  story: 'Creating quality nicotine pouches for modern consumers.',
  facts: ['European brand', 'Growing presence'],
  website: 'N/A'
};

/**
 * Get brand info, handling variations in brand names
 */
function getBrandInfo(brandName) {
  // Clean up brand name
  const cleaned = brandName
    .replace(/&amp;/g, '&')
    .replace(/[^a-zA-Z0-9&]/g, '')
    .toUpperCase();

  // Try to find matching brand
  for (const [key, value] of Object.entries(BRAND_DATABASE)) {
    if (key.toUpperCase() === cleaned || key.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleaned) {
      return { name: key, ...value };
    }
  }

  return { name: brandName, ...DEFAULT_BRAND };
}

module.exports = { BRAND_DATABASE, DEFAULT_BRAND, getBrandInfo };
