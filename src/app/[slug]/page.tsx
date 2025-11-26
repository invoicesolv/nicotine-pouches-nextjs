import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContentProcessor from '@/components/BlogContentProcessor';
import ProductSection from '@/components/ProductSection';
import SymmetricalContentSection from '@/components/SymmetricalContentSection';
import GuidesSection from '@/components/GuidesSection';
import CookieConsent from '@/components/CookieConsent';
import LocalShopComparison from '@/components/LocalShopComparison';
import RelatedPosts from '@/components/RelatedPosts';
import { Metadata } from 'next';
import { getSEOTags, renderSchemaTag, generateBreadcrumbSchema } from '@/lib/seo-core';
import { getLocationSEOTemplate, generateBreadcrumbData } from '@/lib/seo-templates';
import { getCityAggregateRating } from '@/lib/aggregate-ratings';
import { UK_CITIES_GEO_DATA, isCitySlug } from '@/config/uk-cities-data';
import { SEO_CONFIG, getFullUrl } from '@/config/seo-config';

// Enable static optimization for better performance
export const revalidate = 60; // Revalidate every minute for faster updates

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
          'en-US': `https://nicotine-pouches.org/us/${slug}`,
          'x-default': `https://nicotine-pouches.org/${slug}`,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Nicotine Pouches - Blog',
      description: 'Read our latest guides and reviews about nicotine pouches.',
      robots: 'index, follow',
    };
  }
  
  return {
    title: 'Nicotine Pouches',
    description: 'Find the best nicotine pouches and compare prices.',
    robots: 'index, follow',
  };
}

// Load extracted blog posts data
const loadBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nicotine-pouches.org';
    const response = await fetch(`${baseUrl}/api/blog-posts`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
};

interface BlogPost {
  wp_id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  fullContent?: string;
  date: string;
  author: string;
  featured_image: string;
  featured_image_local?: string;
  seo_meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    // Try multiple fallback URLs for production
    const baseUrls = [
      process.env.NEXT_PUBLIC_API_URL,
      'https://nicotine-pouches.org',
      'https://nicotine-pouches.org'
    ].filter(Boolean);
    
    for (const baseUrl of baseUrls) {
      try {
        console.log(`[slug] Trying to fetch from: ${baseUrl}/api/blog-posts`);
        const response = await fetch(`${baseUrl}/api/blog-posts`, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const posts = await response.json();
          console.log(`[slug] Successfully fetched ${posts.length} blog posts from ${baseUrl}`);
          const post = posts.find((p: BlogPost) => p.slug === slug);
          if (post) {
            console.log(`[slug] Found post: ${post.title}`);
            return post;
          } else {
            console.log(`[slug] Post with slug '${slug}' not found in ${posts.length} posts`);
          }
        } else {
          console.log(`[slug] Failed to fetch from ${baseUrl}: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        console.log(`[slug] Error fetching from ${baseUrl}:`, fetchError);
        continue;
      }
    }
    
    console.log(`[slug] All API calls failed for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Check if this is a city slug first
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
          
          <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <Header />
        
            {/* Hero Section with Dark Background */}
            <div className="hero-section" style={{
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
              padding: '80px 20px'
          }}>
              <div style={{ maxWidth: '800px', width: '100%' }}>
              <h1 style={{
                  fontSize: '3.5rem',
                fontWeight: 'bold',
                  marginBottom: '20px',
                  lineHeight: '1.2'
              }}>
                Nicotine Pouches in {cityData.name}
              </h1>
              <p style={{
                  fontSize: '1.2rem',
                  marginBottom: '40px',
                  opacity: '0.9'
              }}>
                {cityData.description}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                  gap: '60px',
                  flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                    {cityData.population}
                  </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: '0.8'
                    }}>
                      Population
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                    {cityData.region}
                  </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: '0.8'
                    }}>
                      Region
                </div>
              </div>
            </div>
              </div>
        </div>

            {/* City-Specific Content Sections */}
            <div id="home" className="content-area" style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
            <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
                  {/* Left Column - City Info */}
                <div>
                  <h2 style={{
                      fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#333'
                  }}>
                      Nicotine Pouches in {cityData.name}
                  </h2>
                  <p style={{
                      fontSize: '1.1rem',
                    lineHeight: '1.6',
                    color: '#666',
                    marginBottom: '20px'
                  }}>
                      Find the best nicotine pouches in {cityData.name}, {cityData.region}. Our local comparison service helps you discover the top brands and best prices available in your area. Whether you're looking for ZYN, VELO, or Nordic Spirit, we've got you covered with local availability and delivery options.
                    </p>
                  <div style={{
                      backgroundColor: 'white',
                      padding: '20px',
                        borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      marginBottom: '20px'
                    }}>
                  <h3 style={{
                        fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333'
                  }}>
                    Local Availability
                  </h3>
                  <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.5',
                    color: '#666',
                        margin: '0'
                  }}>
                        Discover where to buy nicotine pouches in {cityData.name}. From convenience stores to specialty shops, we compare prices and availability across all local retailers to help you find the best deals.
                  </p>
                </div>
                  </div>
                  
                  {/* Right Column - Popular Brands */}
                  <div>
                    <h2 style={{
                      fontSize: '2rem',
                    fontWeight: 'bold',
                      marginBottom: '20px',
                    color: '#333'
                  }}>
                      Popular Brands in {cityData.name}
                    </h2>
                  <p style={{
                      fontSize: '1rem',
                      lineHeight: '1.5',
                    color: '#666',
                      marginBottom: '20px'
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
                          borderRadius: '8px',
                          textAlign: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          border: '1px solid #e0e0e0'
                        }}>
                          <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                    color: '#333'
                  }}>
                            {brand}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      backgroundColor: '#e8f4fd',
                      padding: '15px',
                      borderRadius: '8px',
                      marginTop: '20px',
                      border: '1px solid #b3d9ff'
                    }}>
                  <p style={{
                        fontSize: '0.9rem',
                        color: '#0066cc',
                        margin: '0',
                        textAlign: 'center'
                      }}>
                        💡 Compare prices for these brands across local retailers in {cityData.name}
                  </p>
                </div>
              </div>
            </div>
              </div>
        </div>

      <ProductSection />
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

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content Container - Centered like Klarna */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Blog Post Header - Left Aligned with Content */}
        <div style={{
          padding: '40px 0 20px 0',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#1A0033', 
            margin: '0 0 8px 0',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            {post.title}
          </h1>
          
          <div style={{ 
            fontSize: '18px', 
            color: '#1A0033', 
            marginBottom: '20px',
            fontWeight: '400',
            fontFamily: 'Klarna Text, sans-serif'
          }}>
            By {post.author}
          </div>
        </div>

        {/* Featured Image Section */}
        {(post.featured_image || post.featured_image_local) && (
          <div style={{
            padding: '20px 0',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <Image
              src={post.featured_image_local || post.featured_image || '/placeholder-blog.jpg'}
              alt={post.title}
              width={800}
              height={400}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px 0 60px 0'
        }}>
          <BlogContentProcessor 
            content={post.fullContent || post.content || ''} 
            title={post.title}
            post={post}
          />
        </div>

        {/* Related Posts */}
        <RelatedPosts 
          currentPostSlug={slug} 
          currentPostTitle={post.title}
        />
      </div>

      {/* My Products Floating Box */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1A0033',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontFamily: 'Klarna Text, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}>
        <span>My products</span>
        <span style={{ fontSize: '12px' }}>^</span>
      </div>

      <ProductSection />
      <SymmetricalContentSection />
      <GuidesSection />
      <LocalShopComparison cityName="UK" />
      <Footer />
      <CookieConsent />
    </div>
  );
}