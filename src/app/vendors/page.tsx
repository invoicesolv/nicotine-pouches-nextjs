import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VendorLogo from '@/components/VendorLogo';
import ReviewBalls from '@/components/ReviewBalls';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Where to Buy Nicotine Pouches UK | Trusted Online Shops Compared',
  description: 'Compare trusted UK nicotine pouch retailers. Find the best online shops for ZYN, VELO, Nordic Spirit with verified reviews, fast shipping, and price comparisons.',
  keywords: 'where to buy nicotine pouches uk, nicotine pouch shops uk, buy nicotine pouches online uk, best nicotine pouch retailers, trusted nicotine pouch vendors',
  alternates: {
    canonical: 'https://nicotine-pouches.org/vendors',
  },
};

// Fetch all vendors
async function getVendors() {
  try {
    const { data: vendors, error } = await supabase()
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return vendors || [];
  } catch (error) {
    console.error('Error in getVendors:', error);
    return [];
  }
}

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main id="main-content">
      {/* Breadcrumb */}
      <div style={{
        backgroundColor: '#333',
        borderBottom: '1px solid #555',
        padding: '12px 0',
        marginBottom: '20px'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-white hover:text-gray-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">/</span>
              </li>
              <li>
                <span className="text-white text-sm font-medium">
                  Vendors
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Where to Buy Nicotine Pouches UK
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare trusted UK nicotine pouch shops. We've verified each retailer for fast shipping,
            competitive prices, and reliable customer service.
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((vendor: any) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="text-center">
                {/* Vendor Logo */}
                <div className="flex justify-center mb-4">
                  <VendorLogo 
                    logo={vendor.logo_url || ''} 
                    name={vendor.name} 
                    size={100} 
                  />
                </div>

                {/* Vendor Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vendor.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center justify-center mb-4">
                  <ReviewBalls rating={vendor.rating || 4.5} size={20} />
                  <span className="ml-2 text-sm text-gray-600">
                    {(vendor.rating || 4.5).toFixed(1)}
                  </span>
                </div>

                {/* Description */}
                {vendor.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {vendor.description}
                  </p>
                )}

                {/* Shipping Info */}
                {vendor.shipping_info && (
                  <p className="text-sm text-blue-600 mb-4">
                    {vendor.shipping_info}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-6">
                  {vendor.contact_email && (
                    <p className="text-sm text-gray-600">
                      📧 {vendor.contact_email}
                    </p>
                  )}
                  {vendor.contact_phone && (
                    <p className="text-sm text-gray-600">
                      📞 {vendor.contact_phone}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href={`/vendor/${vendor.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block w-full bg-gray-900 text-white py-1.5 px-3 rounded-xl hover:bg-gray-800 transition-colors text-xs font-medium"
                  >
                    View Products
                  </Link>
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {vendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No vendors available at the moment.
            </p>
          </div>
        )}
      </div>
      </main>

      <Footer />
    </div>
  );
}
