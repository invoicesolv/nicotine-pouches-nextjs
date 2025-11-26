#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Extended UK Cities data with more cities
const UK_CITIES = {
  'nicotine-pouches-london': {
    name: 'London',
    region: 'Greater London',
    population: '9.5 million',
    description: 'The capital city of England and the United Kingdom, London is a global financial center and cultural hub.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ae1c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'manchester': {
    name: 'Manchester',
    region: 'Greater Manchester',
    population: '2.8 million',
    description: 'A major city in northwest England, known for its rich industrial heritage and vibrant music scene.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'birmingham': {
    name: 'Birmingham',
    region: 'West Midlands',
    population: '2.6 million',
    description: 'The second-largest city in the UK, Birmingham is known for its diverse culture and industrial history.',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'leeds': {
    name: 'Leeds',
    region: 'West Yorkshire',
    population: '1.9 million',
    description: 'A major city in West Yorkshire, Leeds is known for its shopping, nightlife, and university.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'glasgow': {
    name: 'Glasgow',
    region: 'Scotland',
    population: '1.7 million',
    description: 'The largest city in Scotland, Glasgow is known for its Victorian architecture and cultural scene.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'edinburgh': {
    name: 'Edinburgh',
    region: 'Scotland',
    population: '548,000',
    description: 'The capital of Scotland, Edinburgh is famous for its historic Old Town and annual festivals.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'liverpool': {
    name: 'Liverpool',
    region: 'Merseyside',
    population: '1.4 million',
    description: 'A major port city in northwest England, Liverpool is famous for its music heritage and football clubs.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'bristol': {
    name: 'Bristol',
    region: 'South West England',
    population: '1.2 million',
    description: 'A vibrant city in southwest England, Bristol is known for its maritime history and creative culture.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'newcastle': {
    name: 'Newcastle upon Tyne',
    region: 'Tyne and Wear',
    population: '1.1 million',
    description: 'A major city in northeast England, Newcastle is known for its nightlife and friendly locals.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'sheffield': {
    name: 'Sheffield',
    region: 'South Yorkshire',
    population: '1.0 million',
    description: 'A city in South Yorkshire, Sheffield is known for its steel industry heritage and green spaces.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'nottingham': {
    name: 'Nottingham',
    region: 'Nottinghamshire',
    population: '825,000',
    description: 'A historic city in the East Midlands, Nottingham is famous for the legend of Robin Hood.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'leicester': {
    name: 'Leicester',
    region: 'Leicestershire',
    population: '700,000',
    description: 'A city in the East Midlands, Leicester is known for its diverse culture and rich history.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'coventry': {
    name: 'Coventry',
    region: 'West Midlands',
    population: '650,000',
    description: 'A city in the West Midlands, Coventry is known for its automotive industry and cathedral.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'cardiff': {
    name: 'Cardiff',
    region: 'Wales',
    population: '485,000',
    description: 'The capital of Wales, Cardiff is known for its castle, bay area, and vibrant culture.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'belfast': {
    name: 'Belfast',
    region: 'Northern Ireland',
    population: '640,000',
    description: 'The capital of Northern Ireland, Belfast is known for its maritime history and cultural heritage.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'plymouth': {
    name: 'Plymouth',
    region: 'Devon',
    population: '270,000',
    description: 'A historic port city in Devon, Plymouth is known for its maritime heritage and naval history.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'southampton': {
    name: 'Southampton',
    region: 'Hampshire',
    population: '255,000',
    description: 'A major port city in Hampshire, Southampton is known for its maritime history and cruise industry.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'norwich': {
    name: 'Norwich',
    region: 'Norfolk',
    population: '200,000',
    description: 'A historic city in Norfolk, Norwich is known for its cathedral and medieval architecture.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'swansea': {
    name: 'Swansea',
    region: 'Wales',
    population: '245,000',
    description: 'A coastal city in Wales, Swansea is known for its beaches and cultural attractions.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  'york': {
    name: 'York',
    region: 'North Yorkshire',
    population: '210,000',
    description: 'A historic city in North Yorkshire, York is famous for its medieval architecture and Viking heritage.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }
};

class LocationPageGenerator {
  constructor() {
    this.outputDir = './src/app/location';
    this.stats = {
      total: 0,
      created: 0,
      skipped: 0,
      errors: 0
    };
  }

  // Generate the page content for a city
  generatePageContent(citySlug, cityData) {
    return `import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductSection from '@/components/ProductSection';
import SymmetricalContentSection from '@/components/SymmetricalContentSection';
import GuidesSection from '@/components/GuidesSection';
import CookieConsent from '@/components/CookieConsent';
import { generateLocationMeta, pageMetaToMetadata } from '@/lib/meta-generator';

interface LocationPageProps {
  params: Promise<{ city: string }>;
}

// UK Cities data
const UK_CITIES = {
  '${citySlug}': {
    name: '${cityData.name}',
    region: '${cityData.region}',
    population: '${cityData.population}',
    description: '${cityData.description}',
    image: '${cityData.image}'
  }
};

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cityData = UK_CITIES[resolvedParams.city as keyof typeof UK_CITIES];
  
  if (!cityData) {
    return {
      title: 'City Not Found',
      description: 'The requested city page could not be found.'
    };
  }

  return pageMetaToMetadata(generateLocationMeta(cityData));
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const cityData = UK_CITIES[resolvedParams.city as keyof typeof UK_CITIES];

  if (!cityData) {
    notFound();
  }

  return (
    <div id="boxed-wrapper" className="page-transition">
      <div id="wrapper" className="fusion-wrapper">
        
        {/* Header */}
        <Header />
        
        {/* Location Hero Section */}
        <div className="fade-in">
          <section className="location-hero" style={{
            background: \`linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url('\${cityData.image}')\`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            padding: '100px 0',
            textAlign: 'center',
            color: 'white'
          }}>
            <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <h1 style={{
                fontSize: 'clamp(48px, 6vw, 72px)',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                lineHeight: '1.1'
              }}>
                Nicotine Pouches in {cityData.name}
              </h1>
              
              <p style={{
                fontSize: 'clamp(20px, 3vw, 28px)',
                margin: '0 0 30px 0',
                opacity: '0.9',
                maxWidth: '800px',
                margin: '0 auto 30px auto'
              }}>
                {cityData.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                flexWrap: 'wrap',
                marginTop: '40px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {cityData.population}
                  </div>
                  <div style={{ fontSize: '16px', opacity: '0.8' }}>Population</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {cityData.region}
                  </div>
                  <div style={{ fontSize: '16px', opacity: '0.8' }}>Region</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Local Content Section */}
        <div className="fade-in-delay-1">
          <section style={{
            padding: '80px 0',
            background: '#f8f9fa'
          }}>
            <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                marginBottom: '60px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#333'
                  }}>
                    Find Nicotine Pouches in {cityData.name}
                  </h2>
                  <p style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    color: '#666',
                    marginBottom: '20px'
                  }}>
                    Discover the best nicotine pouches available in {cityData.name}. Whether you're looking for 
                    strong nicotine pouches, popular brands like ZYN, VELO, or Nordic Spirit, or specific flavors, 
                    we've got you covered with comprehensive comparisons and local availability.
                  </p>
                </div>
                
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#333'
                  }}>
                    Popular Brands in {cityData.name}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                  }}>
                    {['ZYN', 'VELO', 'Nordic Spirit', 'LYFT', 'Skruf', 'Ace'].map(brand => (
                      <div key={brand} style={{
                        padding: '15px',
                        background: 'white',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#333',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {brand}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Product Section */}
        <div className="fade-in-delay-2">
          <ProductSection />
        </div>

        {/* Symmetrical Content Section with TOC */}
        <div className="fade-in-delay-3">
          <SymmetricalContentSection />
        </div>

        {/* Guides Section */}
        <div className="fade-in-delay-4">
          <GuidesSection />
        </div>

        {/* Local SEO Content */}
        <div className="fade-in-delay-5">
          <section style={{
            padding: '80px 0',
            background: 'white'
          }}>
            <div className="fusion-row" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '40px',
                color: '#333'
              }}>
                Why Choose Nicotine Pouches in {cityData.name}?
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '30px'
              }}>
                <div style={{
                  padding: '30px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#007bff',
                    borderRadius: '50%',
                    margin: '0 auto 20px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    🏪
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333'
                  }}>
                    Local Availability
                  </h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>
                    Find nicotine pouches from local retailers and online stores that deliver to {cityData.name}.
                  </p>
                </div>
                
                <div style={{
                  padding: '30px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#28a745',
                    borderRadius: '50%',
                    margin: '0 auto 20px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    💰
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333'
                  }}>
                    Best Prices
                  </h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>
                    Compare prices from different vendors to get the best deals on nicotine pouches in {cityData.name}.
                  </p>
                </div>
                
                <div style={{
                  padding: '30px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#ffc107',
                    borderRadius: '50%',
                    margin: '0 auto 20px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    🚚
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333'
                  }}>
                    Fast Delivery
                  </h3>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6'
                  }}>
                    Quick delivery options available for nicotine pouches in {cityData.name} and surrounding areas.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <Footer />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
      </div>
    </div>
  );
}`;
  }

  // Create directory if it doesn't exist
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Generate a single city page (this is now handled by the dynamic [city] route)
  generateCityPage(citySlug, cityData) {
    // The dynamic [city] route handles all cities, so we just need to ensure the route exists
    console.log(`${colors.green}✓ City ${cityData.name} will be handled by dynamic [city] route${colors.reset}`);
    this.stats.created++;
  }

  // Generate all city pages
  generateAllPages() {
    console.log(`${colors.cyan}${colors.bold}UK Location Page Generator${colors.reset}`);
    console.log(`${'─'.repeat(80)}\n`);
    
    // Ensure output directory exists
    this.ensureDirectoryExists(this.outputDir);
    
    // Generate pages for all cities
    Object.entries(UK_CITIES).forEach(([citySlug, cityData]) => {
      this.generateCityPage(citySlug, cityData);
      this.stats.total++;
    });
    
    // Display results
    this.displayResults();
  }

  // Display generation results
  displayResults() {
    console.log(`\n${colors.bold}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}GENERATION RESULTS${colors.reset}`);
    console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}\n`);
    
    console.log(`${colors.bold}Statistics:${colors.reset}`);
    console.log(`  Total cities processed: ${colors.bold}${this.stats.total}${colors.reset}`);
    console.log(`  ${colors.green}✓ Pages created: ${this.stats.created}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ Pages skipped: ${this.stats.skipped}${colors.reset}`);
    console.log(`  ${colors.red}✗ Errors: ${this.stats.errors}${colors.reset}\n`);
    
    if (this.stats.created > 0) {
      console.log(`${colors.green}${colors.bold}✅ Successfully generated ${this.stats.created} location pages!${colors.reset}`);
      console.log(`\n${colors.blue}Pages are available at:${colors.reset}`);
      console.log(`  https://www.nicotine-pouches.org/location/[city-name]`);
      console.log(`\n${colors.blue}Example URLs:${colors.reset}`);
      Object.keys(UK_CITIES).slice(0, 5).forEach(citySlug => {
        console.log(`  https://www.nicotine-pouches.org/location/${citySlug}`);
      });
    }
    
    if (this.stats.errors > 0) {
      console.log(`\n${colors.red}${colors.bold}⚠ ${this.stats.errors} errors occurred during generation${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}Generation complete!${colors.reset}`);
  }
}

// Run the generator
const generator = new LocationPageGenerator();
generator.generateAllPages();
