import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VendorLogo from '@/components/VendorLogo';
import ReviewBalls from '@/components/ReviewBalls';
import { supabase } from '@/lib/supabase';
import { getDictionary } from '@/i18n/getDictionary';
import type { TranslatedLocale } from '@/i18n/config';

async function getVendors(locale?: string) {
  try {
    const tableName = locale === 'de' ? 'de_vendors' : locale === 'it' ? 'it_vendors' : locale === 'es' ? 'es_vendors' : locale === 'us' ? 'us_vendors' : 'vendors';
    let query = supabase().from(tableName).select('*').order('name');
    // Only UK vendors table has is_active column
    if (tableName === 'vendors') {
      query = query.eq('is_active', true);
    } else {
      query = query.eq('status', 'active');
    }
    const { data: vendors, error } = await query;
    if (error) return [];
    return vendors || [];
  } catch {
    return [];
  }
}

export async function VendorsLocalePage({ locale }: { locale: TranslatedLocale }) {
  const [dict, vendors] = await Promise.all([getDictionary(locale), getVendors(locale)]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main id="main-content">
        <div style={{ backgroundColor: '#333', borderBottom: '1px solid #555', padding: '12px 0', marginBottom: '20px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li><Link href={`/${locale}`} className="text-white hover:text-gray-300 text-sm">Start</Link></li>
                <li><span className="text-gray-400 text-sm">/</span></li>
                <li><span className="text-white text-sm font-medium">{dict.pages.vendors.title}</span></li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{dict.pages.vendors.title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor: any) => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <VendorLogo logo={vendor.logo_url || ''} name={vendor.name} size={100} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{vendor.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <ReviewBalls rating={vendor.rating || 4.5} size={20} />
                    <span className="ml-2 text-sm text-gray-600">{(vendor.rating || 4.5).toFixed(1)}</span>
                  </div>
                  {vendor.description && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{vendor.description}</p>}
                  {vendor.shipping_info && <p className="text-sm text-blue-600 mb-4">{vendor.shipping_info}</p>}
                  <div className="space-y-2">
                    <Link
                      href={`/vendor/${vendor.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block w-full bg-gray-900 text-white py-1.5 px-3 rounded-xl hover:bg-gray-800 transition-colors text-xs font-medium"
                    >
                      {dict.common.viewAll}
                    </Link>
                    {vendor.website && (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm">
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
