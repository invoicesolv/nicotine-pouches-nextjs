import Image from 'next/image';
import { unstable_cache } from 'next/cache';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContentProcessor from '@/components/BlogContentProcessor';
import DynamicProductSections from '@/components/DynamicProductSections';
import CookieConsent from '@/components/CookieConsent';
import LocalShopComparison from '@/components/LocalShopComparison';
import RelatedPosts from '@/components/RelatedPosts';
import { Metadata } from 'next';
import { getSEOTags, renderSchemaTag, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getLocationSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getCityAggregateRating } from '@/lib/aggregate-ratings';
import { UK_CITIES_GEO_DATA, isCitySlug } from '@/config/uk-cities-data';
import { SEO_CONFIG, getFullUrl } from '@/config/seo-config';
import { supabase } from '@/lib/supabase';

// ISR: revalidate every hour, pre-build at deploy
export const revalidate = 3600;
export const dynamicParams = true;
export const maxDuration = 30;

// Pre-generate all blog posts + city pages as static HTML at build time
export async function generateStaticParams() {
  // Don't pre-generate pages at build time — use ISR (revalidate = 3600) instead.
  // Pre-generating 600+ pages overwhelms Supabase connections during build and causes 522 timeouts.
  // With dynamicParams = true, pages are generated on first request and cached for 1 hour.
  return [];
}

// List of city slugs that should be handled as city pages
const CITY_SLUGS = [
  'aberdeen', 'armagh', 'bangor-wales', 'bangor-northern-ireland', 'bath', 'belfast', 'birmingham', 'bradford', 'brighton-and-hove', 'bristol',
  'cambridge', 'canterbury', 'cardiff', 'carlisle', 'chelmsford', 'chester', 'chichester', 'city-of-london', 'city-of-westminster', 'colchester',
  'coventry', 'derby', 'derry', 'doncaster', 'dundee', 'dunfermline', 'durham', 'edinburgh', 'ely', 'exeter',
  'glasgow', 'gloucester', 'hereford', 'inverness', 'kingston-upon-hull', 'lancaster', 'leeds', 'leicester', 'lichfield', 'lincoln',
  'lisburn', 'liverpool', 'london', 'manchester', 'milton-keynes', 'newcastle', 'newcastle-upon-tyne', 'newport', 'newry', 'norwich', 'nottingham',
  'oxford', 'perth', 'peterborough', 'plymouth', 'portsmouth', 'preston', 'ripon', 'salford', 'salisbury', 'sheffield',
  'southampton', 'southend-on-sea', 'st-albans', 'st-asaph', 'st-davids', 'stirling', 'stoke-on-trent', 'sunderland', 'swansea', 'truro',
  'wakefield', 'wells', 'winchester', 'wolverhampton', 'worcester', 'wrexham', 'york'
];

// UK Cities data with downloaded images
const UK_CITIES = {
  'london': {
    name: 'London',
    region: 'Greater London',
    population: '9.5 million',
    description: 'The capital city of England and the United Kingdom, London is a global financial center and cultural hub.',
    image: '/city-images/london.jpg'
  },
  'birmingham': {
    name: 'Birmingham',
    region: 'West Midlands',
    population: '1.1 million',
    description: 'The second-largest city in the UK, Birmingham is known for its industrial heritage and diverse culture.',
    image: '/city-images/birmingham.jpg'
  },
  'manchester': {
    name: 'Manchester',
    region: 'Greater Manchester',
    population: '547,000',
    description: 'A major city in northwest England, Manchester is known for its music scene and football culture.',
    image: '/city-images/manchester.jpg'
  },
  'glasgow': {
    name: 'Glasgow',
    region: 'Scotland',
    population: '635,000',
    description: 'The largest city in Scotland, Glasgow is known for its Victorian architecture and vibrant arts scene.',
    image: '/city-images/glasgow.jpg'
  },
  'liverpool': {
    name: 'Liverpool',
    region: 'Merseyside',
    population: '498,000',
    description: 'A port city in northwest England, Liverpool is famous for its maritime history and music heritage.',
    image: '/city-images/liverpool.jpg'
  },
  'leeds': {
    name: 'Leeds',
    region: 'West Yorkshire',
    population: '516,000',
    description: 'A major city in West Yorkshire, Leeds is known for its shopping, nightlife, and cultural attractions.',
    image: '/city-images/leeds.jpg'
  },
  'sheffield': {
    name: 'Sheffield',
    region: 'South Yorkshire',
    population: '584,000',
    description: 'A city in South Yorkshire, Sheffield is known for its steel industry heritage and green spaces.',
    image: '/city-images/sheffield.jpg'
  },
  'bristol': {
    name: 'Bristol',
    region: 'South West England',
    population: '467,000',
    description: 'A city in southwest England, Bristol is known for its maritime history and creative culture.',
    image: '/city-images/bristol.jpg'
  },
  'cardiff': {
    name: 'Cardiff',
    region: 'Wales',
    population: '366,000',
    description: 'The capital city of Wales, Cardiff is known for its castle, sports venues, and cultural attractions.',
    image: '/city-images/cardiff.jpg'
  },
  'edinburgh': {
    name: 'Edinburgh',
    region: 'Scotland',
    population: '549,000',
    description: 'The capital city of Scotland, Edinburgh is known for its historic architecture and annual festivals.',
    image: '/city-images/edinburgh.jpg'
  },
  'swansea': {
    name: 'Swansea',
    region: 'Wales',
    population: '245,000',
    description: 'A coastal city in Wales, Swansea is known for its beaches and cultural attractions.',
    image: '/city-images/swansea.jpg'
  },
  'lichfield': {
    name: 'Lichfield',
    region: 'Staffordshire',
    population: '35,000',
    description: 'A city in Staffordshire, Lichfield is known for its cathedral and medieval architecture.',
    image: '/city-images/lichfield.jpg'
  },
  'aberdeen': {
    name: 'Aberdeen',
    region: 'Scotland',
    population: '228,000',
    description: 'A port city in northeast Scotland, known as the "Granite City".',
    image: '/city-images/aberdeen.jpg'
  },
  'belfast': {
    name: 'Belfast',
    region: 'Northern Ireland',
    population: '342,000',
    description: 'The capital and largest city of Northern Ireland.',
    image: '/city-images/belfast.jpg'
  },
  'newcastle': {
    name: 'Newcastle upon Tyne',
    region: 'England',
    population: '300,000',
    description: 'A city in northeast England, on the River Tyne.',
    image: '/city-images/newcastle.jpg'
  },
  'nottingham': {
    name: 'Nottingham',
    region: 'England',
    population: '330,000',
    description: 'A city in the East Midlands, known for the legend of Robin Hood.',
    image: '/city-images/nottingham.jpg'
  },
  'cambridge': {
    name: 'Cambridge',
    region: 'England',
    population: '145,000',
    description: 'A historic university city in Cambridgeshire.',
    image: '/city-images/cambridge.jpg'
  },
  'oxford': {
    name: 'Oxford',
    region: 'England',
    population: '155,000',
    description: 'A historic university city in Oxfordshire.',
    image: '/city-images/oxford.jpg'
  },
  'york': {
    name: 'York',
    region: 'England',
    population: '140,000',
    description: 'A historic walled city in North Yorkshire.',
    image: '/city-images/york.jpg'
  },
  'bath': {
    name: 'Bath',
    region: 'England',
    population: '90,000',
    description: 'A historic city in Somerset, known for its Roman baths.',
    image: '/city-images/bath.jpg'
  },
  'armagh': {
    name: 'Armagh',
    region: 'Northern Ireland',
    population: '15,000',
    description: 'A historic city in Northern Ireland, known as the ecclesiastical capital.',
    image: '/city-images/armagh.jpg'
  },
  'bangor-wales': {
    name: 'Bangor',
    region: 'Wales',
    population: '18,000',
    description: 'A coastal city in North Wales, home to Bangor University.',
    image: '/city-images/bangor-wales.jpg'
  },
  'bangor-northern-ireland': {
    name: 'Bangor',
    region: 'Northern Ireland',
    population: '60,000',
    description: 'A coastal town in County Down, Northern Ireland.',
    image: '/city-images/bangor-northern-ireland.jpg'
  },
  'bradford': {
    name: 'Bradford',
    region: 'England',
    population: '350,000',
    description: 'A major city in West Yorkshire, known for its textile heritage.',
    image: '/city-images/bradford.jpg'
  },
  'brighton-and-hove': {
    name: 'Brighton and Hove',
    region: 'England',
    population: '290,000',
    description: 'A vibrant seaside city on the south coast of England.',
    image: '/city-images/brighton-and-hove.jpg'
  },
  'canterbury': {
    name: 'Canterbury',
    region: 'England',
    population: '55,000',
    description: 'A historic cathedral city in Kent, home to Canterbury Cathedral.',
    image: '/city-images/canterbury.jpg'
  },
  'carlisle': {
    name: 'Carlisle',
    region: 'England',
    population: '75,000',
    description: 'A historic border city in Cumbria, near the Scottish border.',
    image: '/city-images/carlisle.jpg'
  },
  'chelmsford': {
    name: 'Chelmsford',
    region: 'England',
    population: '120,000',
    description: 'A city in Essex, known as the county town.',
    image: '/city-images/chelmsford.jpg'
  },
  'chester': {
    name: 'Chester',
    region: 'England',
    population: '80,000',
    description: 'A historic walled city in Cheshire, known for its Roman heritage.',
    image: '/city-images/chester.jpg'
  },
  'chichester': {
    name: 'Chichester',
    region: 'England',
    population: '30,000',
    description: 'A cathedral city in West Sussex, known for its Roman palace.',
    image: '/city-images/chichester.jpg'
  },
  'city-of-london': {
    name: 'City of London',
    region: 'England',
    population: '10,000',
    description: 'The historic financial district and ceremonial county of London.',
    image: '/city-images/city-of-london.jpg'
  },
  'city-of-westminster': {
    name: 'City of Westminster',
    region: 'England',
    population: '260,000',
    description: 'A London borough containing the Palace of Westminster and Buckingham Palace.',
    image: '/city-images/city-of-westminster.jpg'
  },
  'colchester': {
    name: 'Colchester',
    region: 'England',
    population: '120,000',
    description: 'A historic town in Essex, known as Britain\'s oldest recorded town.',
    image: '/city-images/colchester.jpg'
  },
  'coventry': {
    name: 'Coventry',
    region: 'England',
    population: '370,000',
    description: 'A city in the West Midlands, known for its cathedral and automotive heritage.',
    image: '/city-images/coventry.jpg'
  },
  'derby': {
    name: 'Derby',
    region: 'England',
    population: '260,000',
    description: 'A city in Derbyshire, known for its railway heritage and Rolls-Royce.',
    image: '/city-images/derby.jpg'
  },
  'derry': {
    name: 'Derry',
    region: 'Northern Ireland',
    population: '85,000',
    description: 'A historic walled city in Northern Ireland, also known as Londonderry.',
    image: '/city-images/derry.jpg'
  },
  'doncaster': {
    name: 'Doncaster',
    region: 'England',
    population: '110,000',
    description: 'A large market town in South Yorkshire, known for its racecourse.',
    image: '/city-images/doncaster.jpg'
  },
  'dundee': {
    name: 'Dundee',
    region: 'Scotland',
    population: '150,000',
    description: 'A city on the east coast of Scotland, known as the City of Discovery.',
    image: '/city-images/dundee.jpg'
  },
  'dunfermline': {
    name: 'Dunfermline',
    region: 'Scotland',
    population: '55,000',
    description: 'A historic city in Fife, Scotland, known for its abbey.',
    image: '/city-images/dunfermline.jpg'
  },
  'durham': {
    name: 'Durham',
    region: 'England',
    population: '50,000',
    description: 'A historic cathedral city in County Durham, home to Durham University.',
    image: '/city-images/durham.jpg'
  },
  'ely': {
    name: 'Ely',
    region: 'England',
    population: '20,000',
    description: 'A cathedral city in Cambridgeshire, known for its magnificent cathedral.',
    image: '/city-images/ely.jpg'
  },
  'exeter': {
    name: 'Exeter',
    region: 'England',
    population: '130,000',
    description: 'A historic cathedral city in Devon, known for its Roman walls.',
    image: '/city-images/exeter.jpg'
  },
  'gloucester': {
    name: 'Gloucester',
    region: 'England',
    population: '130,000',
    description: 'A cathedral city in Gloucestershire, known for its historic docks.',
    image: '/city-images/gloucester.jpg'
  },
  'hereford': {
    name: 'Hereford',
    region: 'England',
    population: '60,000',
    description: 'A cathedral city in Herefordshire, known for its cathedral and cider.',
    image: '/city-images/hereford.jpg'
  },
  'inverness': {
    name: 'Inverness',
    region: 'Scotland',
    population: '70,000',
    description: 'A city in the Scottish Highlands, known as the capital of the Highlands.',
    image: '/city-images/inverness.jpg'
  },
  'kingston-upon-hull': {
    name: 'Kingston upon Hull',
    region: 'England',
    population: '260,000',
    description: 'A port city in East Yorkshire, known simply as Hull.',
    image: '/city-images/kingston-upon-hull.jpg'
  },
  'lancaster': {
    name: 'Lancaster',
    region: 'England',
    population: '50,000',
    description: 'A historic city in Lancashire, known for its castle and university.',
    image: '/city-images/lancaster.jpg'
  },
  'leicester': {
    name: 'Leicester',
    region: 'England',
    population: '350,000',
    description: 'A city in the East Midlands, known for its diverse culture and university.',
    image: '/city-images/leicester.jpg'
  },
  'lincoln': {
    name: 'Lincoln',
    region: 'England',
    population: '100,000',
    description: 'A cathedral city in Lincolnshire, known for its medieval cathedral.',
    image: '/city-images/lincoln.jpg'
  },
  'lisburn': {
    name: 'Lisburn',
    region: 'Northern Ireland',
    population: '50,000',
    description: 'A city in County Antrim, Northern Ireland.',
    image: '/city-images/lisburn.jpg'
  },
  'milton-keynes': {
    name: 'Milton Keynes',
    region: 'England',
    population: '280,000',
    description: 'A new town in Buckinghamshire, known for its grid system and roundabouts.',
    image: '/city-images/milton-keynes.jpg'
  },
  'newcastle-upon-tyne': {
    name: 'Newcastle upon Tyne',
    region: 'England',
    population: '300,000',
    description: 'A major city in North East England, known for its bridges and nightlife.',
    image: '/city-images/newcastle-upon-tyne.jpg'
  },
  'newport': {
    name: 'Newport',
    region: 'Wales',
    population: '150,000',
    description: 'A city in South Wales, known for its industrial heritage.',
    image: '/city-images/newport.jpg'
  },
  'newry': {
    name: 'Newry',
    region: 'Northern Ireland',
    population: '30,000',
    description: 'A city in County Down, Northern Ireland.',
    image: '/city-images/newry.jpg'
  },
  'norwich': {
    name: 'Norwich',
    region: 'England',
    population: '140,000',
    description: 'A cathedral city in Norfolk, known for its medieval architecture.',
    image: '/city-images/norwich.jpg'
  },
  'perth': {
    name: 'Perth',
    region: 'Scotland',
    population: '50,000',
    description: 'A city in central Scotland, known as the gateway to the Highlands.',
    image: '/city-images/perth.jpg'
  },
  'peterborough': {
    name: 'Peterborough',
    region: 'England',
    population: '200,000',
    description: 'A cathedral city in Cambridgeshire, known for its cathedral.',
    image: '/city-images/peterborough.jpg'
  },
  'plymouth': {
    name: 'Plymouth',
    region: 'England',
    population: '260,000',
    description: 'A historic port city in Devon, known for its maritime heritage.',
    image: '/city-images/plymouth.jpg'
  },
  'portsmouth': {
    name: 'Portsmouth',
    region: 'England',
    population: '240,000',
    description: 'A port city in Hampshire, known for its naval heritage and historic dockyard.',
    image: '/city-images/portsmouth.jpg'
  },
  'preston': {
    name: 'Preston',
    region: 'England',
    population: '140,000',
    description: 'A city in Lancashire, known as the administrative centre of the county.',
    image: '/city-images/preston.jpg'
  },
  'ripon': {
    name: 'Ripon',
    region: 'England',
    population: '17,000',
    description: 'A cathedral city in North Yorkshire, known for its cathedral and racecourse.',
    image: '/city-images/ripon.jpg'
  },
  'salford': {
    name: 'Salford',
    region: 'England',
    population: '250,000',
    description: 'A city in Greater Manchester, known for its media industry.',
    image: '/city-images/salford.jpg'
  },
  'salisbury': {
    name: 'Salisbury',
    region: 'England',
    population: '40,000',
    description: 'A cathedral city in Wiltshire, known for its cathedral and proximity to Stonehenge.',
    image: '/city-images/salisbury.jpg'
  },
  'southampton': {
    name: 'Southampton',
    region: 'England',
    population: '250,000',
    description: 'A major port city in Hampshire, known for its maritime history.',
    image: '/city-images/southampton.jpg'
  },
  'southend-on-sea': {
    name: 'Southend-on-Sea',
    region: 'England',
    population: '180,000',
    description: 'A seaside resort town in Essex, known for its pier.',
    image: '/city-images/southend-on-sea.jpg'
  },
  'st-albans': {
    name: 'St Albans',
    region: 'England',
    population: '85,000',
    description: 'A cathedral city in Hertfordshire, known for its Roman heritage.',
    image: '/city-images/st-albans.jpg'
  },
  'st-asaph': {
    name: 'St Asaph',
    region: 'Wales',
    population: '3,500',
    description: 'A small cathedral city in Denbighshire, Wales.',
    image: '/city-images/st-asaph.jpg'
  },
  'st-davids': {
    name: 'St Davids',
    region: 'Wales',
    population: '1,800',
    description: 'A small cathedral city in Pembrokeshire, Wales, Britain\'s smallest city.',
    image: '/city-images/st-davids.jpg'
  },
  'stirling': {
    name: 'Stirling',
    region: 'Scotland',
    population: '40,000',
    description: 'A city in central Scotland, known for its castle and university.',
    image: '/city-images/stirling.jpg'
  },
  'stoke-on-trent': {
    name: 'Stoke-on-Trent',
    region: 'England',
    population: '260,000',
    description: 'A city in Staffordshire, known for its pottery industry.',
    image: '/city-images/stoke-on-trent.jpg'
  },
  'sunderland': {
    name: 'Sunderland',
    region: 'England',
    population: '280,000',
    description: 'A city in Tyne and Wear, known for its shipbuilding heritage.',
    image: '/city-images/sunderland.jpg'
  },
  'truro': {
    name: 'Truro',
    region: 'England',
    population: '20,000',
    description: 'A cathedral city in Cornwall, known as the county town.',
    image: '/city-images/truro.jpg'
  },
  'wakefield': {
    name: 'Wakefield',
    region: 'England',
    population: '100,000',
    description: 'A city in West Yorkshire, known for its cathedral and coal mining heritage.',
    image: '/city-images/wakefield.jpg'
  },
  'wells': {
    name: 'Wells',
    region: 'England',
    population: '12,000',
    description: 'A cathedral city in Somerset, known for its cathedral and market.',
    image: '/city-images/wells.jpg'
  },
  'winchester': {
    name: 'Winchester',
    region: 'England',
    population: '45,000',
    description: 'A cathedral city in Hampshire, known as the ancient capital of England.',
    image: '/city-images/winchester.jpg'
  },
  'wolverhampton': {
    name: 'Wolverhampton',
    region: 'England',
    population: '260,000',
    description: 'A city in the West Midlands, known for its industrial heritage.',
    image: '/city-images/wolverhampton.jpg'
  },
  'worcester': {
    name: 'Worcester',
    region: 'England',
    population: '100,000',
    description: 'A cathedral city in Worcestershire, known for its cathedral and sauce.',
    image: '/city-images/worcester.jpg'
  },
  'wrexham': {
    name: 'Wrexham',
    region: 'Wales',
    population: '65,000',
    description: 'A city in North Wales, known for its football club and industrial heritage.',
    image: '/city-images/wrexham.jpg'
  }
};

// Helper function to generate city metadata using centralized SEO system
async function generateCityMetadata(slug: string): Promise<Metadata> {
  // Check if this is a valid city slug using the new geo data
  if (!isCitySlug(slug)) {
    return {
      title: `Nicotine Pouches in ${slug} - Compare Prices & Find Best Deals`,
      description: `Find the best nicotine pouches in ${slug}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit.`,
      robots: 'index, follow',
    };
  }

  const cityData = UK_CITIES_GEO_DATA[slug];
  if (!cityData) {
    return {
      title: `Nicotine Pouches in ${slug} - Compare Prices & Find Best Deals`,
      description: `Find the best nicotine pouches in ${slug}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit.`,
      robots: 'index, follow',
    };
  }

  // Fetch aggregate rating for the city
  const aggregateRating = await getCityAggregateRating(cityData.name);
  
  // Prepare location data for SEO template
  const locationData = {
    cityName: cityData.name,
    citySlug: slug,
    region: cityData.region,
    description: `Find the best nicotine pouches in ${cityData.name}, ${cityData.region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.`,
    image: SEO_CONFIG.defaultImages.ogImage,
    geo: cityData.geo,
    aggregateRating: aggregateRating?.aggregateRating
  };

  // Generate SEO data using centralized template
  const seoData = getLocationSEOTemplate(locationData);
  
  // Use centralized SEO function
  return getSEOTags('location', seoData);
}

// Generate metadata for SEO - MUST be at the top of the file
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Check if this is a city slug first
  if (CITY_SLUGS.includes(slug)) {
    return generateCityMetadata(slug);
  }

  // Blog posts (old + generated) and guides all render at root with full metadata below
  // If not a city, try to get the blog post
  try {
    const post = await getBlogPost(slug);

    if (!post) {
      return {
        title: 'Page Not Found - Nicotine Pouches',
        description: 'The page you are looking for could not be found.',
        robots: 'noindex,nofollow',
      };
    }

    const title = post.seo_meta?.title || post.title;
    const description = post.seo_meta?.description || post.excerpt.replace(/<[^>]*>/g, '').substring(0, 160);

    return {
      title: `${title} - Nicotine Pouches`,
      description,
      keywords: post.seo_meta?.keywords || 'nicotine pouches, blog, guide, review',
      robots: 'index, follow',
      authors: [{ name: post.author }],
      publisher: 'Nicotine Pouches UK',
      openGraph: {
        title: `${title} - Nicotine Pouches`,
        description,
        url: `https://nicotine-pouches.org/${slug}`,
        siteName: 'Nicotine Pouches',
        images: [
          {
            url: post.featured_image_local || post.featured_image || '/placeholder-blog.jpg',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en-GB',
        type: 'article',
        publishedTime: post.date,
        authors: [post.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - Nicotine Pouches`,
        description,
        images: [post.featured_image_local || post.featured_image || '/placeholder-blog.jpg'],
        creator: '@nicotinepouches',
        site: '@nicotinepouches',
      },
      alternates: {
        canonical: `https://nicotine-pouches.org/${slug}`,
        languages: {
          'en-GB': `https://nicotine-pouches.org/${slug}`,
          'x-default': `https://nicotine-pouches.org/${slug}`,
        },
      },
      // Explicit article meta so SEO extensions recognize as normal article (not "special page")
      other: {
        'article:author': post.author,
        'article:published_time': post.date,
        'article:modified_time': post.updated_at || post.date,
        'article:section': 'Guides',
        'article:publisher': 'Nicotine Pouches UK',
      },
    };
  } catch {
    return {
      title: 'Nicotine Pouches - Blog',
      description: 'Read our latest guides and reviews about nicotine pouches.',
      robots: 'index, follow',
    };
  }
}


interface BlogPost {
  wp_id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  fullContent?: string;
  date: string;
  updated_at?: string;
  author: string;
  featured_image: string;
  featured_image_local?: string;
  link?: string;
  source?: string;
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

const getBlogPost = (slug: string) => unstable_cache(
  async (): Promise<BlogPost | null> => {
    try {
      const { data: post, error } = await supabase()
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .in('status', ['publish', 'published'])
        .single();

      if (error || !post) return null;

      return {
        wp_id: post.wp_id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        fullContent: post.content,
        date: post.date || post.created_at,
        updated_at: post.updated_at || post.date || post.created_at,
        author: post.author || 'Nicotine Pouches',
        featured_image: post.featured_image,
        featured_image_local: post.featured_image_local || post.featured_image,
        link: post.link,
        source: 'database',
        seo_meta: post.seo_meta
      };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  },
  [`blog-post-${slug}`],
  { revalidate: 3600 }
)();

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Cities render here; blog posts (old + generated) fall through and render at root below
  // Check if this is a city slug
  if (CITY_SLUGS.includes(slug)) {
    const cityData = UK_CITIES[slug as keyof typeof UK_CITIES];
    const geoData = UK_CITIES_GEO_DATA[slug];
    
    if (cityData && geoData) {
      // Fetch aggregate rating for the city
      const aggregateRating = await getCityAggregateRating(geoData.name);
      
      // Generate breadcrumb data
      const breadcrumbs = generateBreadcrumbData('location', {
        cityName: geoData.name,
        citySlug: slug,
        region: geoData.region
      });

      return (
        <>
          {/* LocalBusiness Schema */}
          {renderSchemaTag('localBusiness', {
            businessName: `${SEO_CONFIG.appName} - ${geoData.name}`,
            cityName: geoData.name,
            region: geoData.region,
            description: `Find the best nicotine pouches in ${geoData.name}, ${geoData.region}. Compare prices from top UK brands including ZYN, VELO, and Nordic Spirit. Local availability and delivery options.`,
            url: getFullUrl(`/${slug}`),
            geo: geoData.geo,
            telephone: geoData.telephone,
            aggregateRating: aggregateRating?.aggregateRating,
            openingHours: "Mo-Su 00:00-23:59"
          })}

          {/* Breadcrumb Schema */}
          {generateBreadcrumbSchema(breadcrumbs)}

          {/* City Page Styles - Match Homepage */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

              .city-page-wrapper {
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              }
              .city-page-wrapper * {
                font-family: inherit;
              }
              .city-page-wrapper h1,
              .city-page-wrapper h2,
              .city-page-wrapper h3,
              .city-page-wrapper h4,
              .city-page-wrapper p,
              .city-page-wrapper span,
              .city-page-wrapper div {
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              }
              @media (max-width: 768px) {
                .city-hero-section {
                  min-height: 50vh !important;
                  padding: 60px 16px !important;
                }
                .city-hero-section h1 {
                  font-size: 2rem !important;
                }
                .city-info-grid {
                  grid-template-columns: 1fr !important;
                  gap: 30px !important;
                }
                .city-stats-row {
                  gap: 30px !important;
                }
                .city-stats-row > div {
                  min-width: 80px;
                }
              }
            `
          }} />

          <div className="city-page-wrapper" style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
            <Header />
        
            {/* Hero Section with Dark Background */}
            <div className="city-hero-section" style={{
              background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(' + cityData.image + ')',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center',
              padding: '80px 20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <div style={{ maxWidth: '800px', width: '100%' }}>
                <h1 style={{
                  fontSize: '3.5rem',
                  fontWeight: '800',
                  marginBottom: '20px',
                  lineHeight: '1.2',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  letterSpacing: '-0.5px'
                }}>
                  Nicotine Pouches in {cityData.name}
                </h1>
                <p style={{
                  fontSize: '1.2rem',
                  marginBottom: '40px',
                  opacity: '0.9',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  fontWeight: '400'
                }}>
                  {cityData.description}
                </p>
                <div className="city-stats-row" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '60px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {cityData.population}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: '0.8',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      Population
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      {cityData.region}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: '0.8',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      Region
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* City-Specific Content Sections */}
            <div id="home" className="content-area" style={{ backgroundColor: '#f4f5f9', padding: '60px 0' }}>
              <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div className="city-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
                  {/* Left Column - City Info */}
                  <div>
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      marginBottom: '20px',
                      color: '#1f2544',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      letterSpacing: '-0.3px'
                    }}>
                      Nicotine Pouches in {cityData.name}
                    </h2>
                    <p style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.7',
                      color: '#4b5563',
                      marginBottom: '20px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      Find the best nicotine pouches in {cityData.name}, {cityData.region}. Our local comparison service helps you discover the top brands and best prices available in your area. Whether you&apos;re looking for ZYN, VELO, or Nordic Spirit, we&apos;ve got you covered with local availability and delivery options.
                    </p>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      marginBottom: '20px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        marginBottom: '15px',
                        color: '#1f2544',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                      }}>
                        Local Availability
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#4b5563',
                        margin: '0',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                      }}>
                        Discover where to buy nicotine pouches in {cityData.name}. From convenience stores to specialty shops, we compare prices and availability across all local retailers to help you find the best deals.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Popular Brands */}
                  <div>
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      marginBottom: '20px',
                      color: '#1f2544',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      letterSpacing: '-0.3px'
                    }}>
                      Popular Brands in {cityData.name}
                    </h2>
                    <p style={{
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      color: '#4b5563',
                      marginBottom: '20px',
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                    }}>
                      These are the most popular nicotine pouch brands available in {cityData.name}:
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '15px'
                    }}>
                      {['ZYN', 'VELO', 'Nordic Spirit', 'LYFT', 'Skruf', 'Ace'].map((brand) => (
                        <div key={brand} style={{
                          backgroundColor: 'white',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2544',
                            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                          }}>
                            {brand}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      backgroundColor: '#eef6ff',
                      padding: '16px',
                      borderRadius: '12px',
                      marginTop: '20px',
                      border: '1px solid #c7d9f5'
                    }}>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#1f2544',
                        margin: '0',
                        textAlign: 'center',
                        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                        fontWeight: '500'
                      }}>
                        💡 Compare prices for these brands across local retailers in {cityData.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      {/* Product Sections - Same as Homepage */}
      <DynamicProductSections />
      <LocalShopComparison cityName={cityData.name} />
      <Footer />
      <CookieConsent />
    </div>
    </>
  );
    }
  }
  
  // If not a city, try to get the blog post
  const post = await getBlogPost(slug);
  console.log(`[slug] Post found:`, post ? post.title : 'null');

  if (!post) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          fontSize: '18px',
          color: '#666',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>Page not found</div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Slug: {slug}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = getFullUrl(`/${slug}`);
  const articleImage = post.featured_image_local || post.featured_image || '/placeholder-blog.jpg';
  const articleImageUrl = articleImage.startsWith('http') ? articleImage : getFullUrl(articleImage);
  const articleKeywords = post.seo_meta?.keywords
    ? post.seo_meta.keywords.split(/,\s*/).map((k: string) => k.trim()).filter(Boolean)
    : [post.title];

  return (
    <>
      {/* Article JSON-LD */}
      {renderSchemaTag('article', {
        title: post.seo_meta?.title || post.title,
        description: (post.seo_meta?.description || post.excerpt || '').replace(/<[^>]*>/g, '').substring(0, 160),
        image: articleImageUrl,
        author: { name: post.author },
        datePublished: post.date,
        dateModified: post.updated_at || post.date,
        url: canonicalUrl,
        keywords: articleKeywords,
        speakableSections: ['.article-body'],
      })}

      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .guide-page-wrapper {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          }
          .guide-page-wrapper * {
            font-family: inherit;
          }
          .guide-content-container {
            width: calc(100% - 80px);
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
          }
          .article-body iframe {
            max-width: 100% !important;
          }
          .article-body div[style*="position:relative"] {
            max-width: 100% !important;
          }
          @media (max-width: 768px) {
            .guide-content-container {
              width: 100%;
              padding: 0 16px;
            }
            .guide-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .guide-featured-image {
              max-width: 100% !important;
            }
            .guide-title {
              font-size: 1.75rem !important;
            }
            .guide-meta-row {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
          }
        `
      }} />

      <div className="guide-page-wrapper" style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
        <Header />

        {/* Breadcrumb - Modern Style */}
        <div style={{ backgroundColor: '#ffffff', padding: '0' }}>
          <div className="guide-content-container" style={{
            padding: '16px 0',
            fontSize: '15px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            <a href="/" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: '600' }}>Home</a>
            <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
            <a href="/guides" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '400' }}>Guides</a>
            <span style={{ margin: '0 12px', color: '#9ca3af' }}>/</span>
            <span style={{ color: '#6b7280', fontWeight: '400' }}>
              {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
            </span>
          </div>
        </div>

        {/* Guide Hero Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px 0 40px 0' }}>
          <div className="guide-content-container" style={{ maxWidth: '800px' }}>
            {/* Category Badge */}
            <div style={{
              display: 'inline-block',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              Guide
            </div>

            {/* Title */}
            <h1 className="guide-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#0B051D',
              margin: '0 0 24px 0',
              lineHeight: '1.2',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.02em'
            }}>
              {post.title}
            </h1>

            {/* Meta Row */}
            <div className="guide-meta-row" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}>
              {/* Author */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                }}>
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1f2937',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    {post.author}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  }}>
                    {new Date(post.date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '32px',
                backgroundColor: '#e5e7eb'
              }} />

              {/* Read Time */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                5 min read
              </div>
            </div>

            {/* Featured Image - Full Width Row */}
            {(post.featured_image || post.featured_image_local) && (
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                marginBottom: '40px'
              }}>
                <Image
                  src={post.featured_image_local || post.featured_image || '/placeholder-blog.jpg'}
                  alt={post.title}
                  width={800}
                  height={450}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ backgroundColor: '#ffffff', padding: '0 0 60px 0' }}>
          <div className="guide-content-container" style={{ maxWidth: '800px' }}>
            <div className="article-body" style={{ overflow: 'hidden' }}>
              <BlogContentProcessor
                content={post.fullContent || post.content || ''}
                title={post.title}
                post={post}
              />
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div style={{ backgroundColor: '#f8fafc', padding: '64px 0' }}>
          <div className="guide-content-container">
            <RelatedPosts
              currentPostSlug={slug}
              currentPostTitle={post.title}
            />
          </div>
        </div>

        <Footer />
        <CookieConsent />
      </div>
    </>
  );
}