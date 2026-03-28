import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { getBrandLogo } from '@/lib/brand-logos';
import { getDictionary } from '@/i18n/getDictionary';
import { getTranslatedSlug } from '@/i18n/config';
import type { TranslatedLocale } from '@/i18n/config';

async function getAllBrands(locale?: string) {
  try {
    const tableName = locale === 'de' ? 'de_vendor_products' : locale === 'it' ? 'it_vendor_products' : 'wp_products';
    const { data: products, error } = await supabase()
      .from(tableName)
      .select('name')
      .not('name', 'is', null);

    if (error) return [];

    const brandNames: string[] = (products || [])
      .map((p: any) => p.name?.split(' ')[0])
      .filter(Boolean);

    const uniqueBrands = Array.from(new Set(brandNames));
    return uniqueBrands.sort().map((brand: string) => ({
      name: brand,
      slug: brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  } catch {
    return [];
  }
}

export async function BrandsLocalePage({ locale }: { locale: TranslatedLocale }) {
  const [dict, brands] = await Promise.all([
    getDictionary(locale),
    getAllBrands(locale),
  ]);
  const s = (slug: string) => `/${locale}/${getTranslatedSlug(slug, locale)}`;

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        <main id="main" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px 0', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px', fontSize: '14px', color: '#666' }}>
              <Link href={`/${locale}`} style={{ color: '#666', textDecoration: 'none' }}>Start</Link>
              <span style={{ margin: '0 8px' }}>&raquo;</span>
              <span>{dict.pages.brands.title}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '40px 0', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', margin: '0 0 15px 0' }}>
                {dict.pages.brands.title}
              </h1>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {brands.map((brand) => {
                  const logoUrl = getBrandLogo(brand.name);
                  return (
                    <Link key={brand.slug} href={`/${locale}/brand/${brand.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e9ecef',
                        borderRadius: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        {logoUrl ? (
                          <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image src={logoUrl} alt={brand.name} width={48} height={48} style={{ objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px', fontWeight: '700', color: '#6b7280' }}>
                            {brand.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>{brand.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
