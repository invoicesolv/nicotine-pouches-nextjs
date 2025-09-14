'use client';

import Link from 'next/link';
import TableOfContents from './TableOfContents';

const SymmetricalHomepage = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover the Best Nicotine Pouches UK with Our Price Comparison Service
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Looking for the top deals on nicotine pouches UK? You've come to the right place! At Nicotine Pouches, we're dedicated to helping you find the best prices on nicotine pouches in the UK, ensuring you get premium products at unbeatable value. Whether you're new to nicotine pouches or a seasoned user, our price comparison platform simplifies your search for affordable, high-quality options across the market.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with TOC */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Compare Prices Section */}
              <article id="section-0" className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Compare Prices on Nicotine Pouches UK Today
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Nicotine pouches UK</strong> have surged in popularity as a smoke-free, tobacco-free alternative for nicotine enthusiasts. Discreet, convenient, and available in a variety of flavors and strengths, nicotine pouches are perfect for those looking to enjoy nicotine without the hassle of smoking or vaping. From minty freshness to fruity bursts, the <strong>UK nicotine pouches</strong> market offers something for everyone.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  With our service, you can compare prices on leading brands like VELO, Skruf, and LOOP, ensuring you never overpay for your favorite <strong>nicotine pouches in the UK</strong>. Our comprehensive database covers all major retailers, from established brands to emerging favorites, giving you the power to make informed purchasing decisions.
                </p>
              </article>

              {/* Explore Wide Range Section */}
              <article id="section-1" className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Explore a Wide Range of Nicotine Pouches in the UK
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The <strong>nicotine pouches UK</strong> scene is packed with variety. Love a refreshing mint flavor? Try VELO Crispy Peppermint. Craving something fruity? LOOP's offerings might be your go-to. Our price comparison service covers all the top categories, including:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-700">
                  <li><strong>Slim Nicotine Pouches UK</strong> – Perfect for discreet use.</li>
                  <li><strong>Strong Nicotine Pouches UK</strong> – For a powerful nicotine hit.</li>
                  <li><strong>Nicotine-Free Pouches UK</strong> – Ideal for cutting down without losing the habit.</li>
                  <li><strong>Flavored Nicotine Pouches UK</strong> – From coffee to liquorice, explore unique tastes.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-6">
                  No matter your preference, we help you find the best deals on <strong>nicotine pouches UK</strong> tailored to your needs. Our advanced filtering system allows you to narrow down options by strength, flavor, brand, and price range.
                </p>
              </article>

              {/* Why Choose Section */}
              <article id="section-2" className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Choose Nicotine Pouches UK?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Why spend more when you can save with our expertly curated price comparisons? We scour the web to bring you the latest deals on nicotine pouches UK, from slim pouches to extra-strong varieties. Whether you prefer low-strength options or bold, high-nicotine kicks, our platform lists the best prices from trusted retailers across the UK. Save time and money by letting us do the heavy lifting—finding the cheapest nicotine pouches in the UK has never been easier!
                </p>
              </article>

              {/* Fast Delivery Section */}
              <article id="section-3" className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Nicotine Pouches UK: Fast Delivery, Great Prices
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ordering <strong>nicotine pouches UK</strong> through our platform means you'll enjoy fast, reliable shipping to your door. Many of the retailers we feature offer free delivery on orders above a certain amount, and we make sure you know exactly where to find those perks. From London to Glasgow, get your <strong>nicotine pouches in the UK</strong> delivered quickly and at the lowest possible cost.
                </p>
              </article>

              {/* Start Saving Section */}
              <article id="section-4" className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Start Saving on Nicotine Pouches UK Now
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ready to find the best <strong>nicotine pouches UK</strong> deals? Use our price comparison tool today and discover how much you can save. Whether you're after bestselling products like White Fox or new arrivals like Lynx Cool Mint, we bring you the cheapest options for <strong>nicotine pouches in the UK</strong> in one convenient place. Don't settle for less—shop smarter with Nicotine Pouches and make us your number-one stop for <strong>UK nicotine pouches</strong>.
                </p>
                <div className="mt-8">
                  <Link 
                    href="/compare" 
                    className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
                  >
                    Compare Prices Now
                  </Link>
                </div>
              </article>

            </div>

            {/* Table of Contents - 1/3 width */}
            <div className="lg:col-span-1">
              <TableOfContents />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default SymmetricalHomepage;
