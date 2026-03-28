import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SSRProductGridWithSidebar from '@/components/SSRProductGridWithSidebar';
import SortDropdown from '@/components/SortDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { getBrandLogo } from '@/lib/brand-logos';
import { supabase } from '@/lib/supabase';
import { getDictionary } from '@/i18n/getDictionary';
import { getTranslatedSlug } from '@/i18n/config';
import type { TranslatedLocale } from '@/i18n/config';

async function getTopBrandsAndCount(locale?: string) {
  try {
    if (locale === 'de' || locale === 'it') {
      const tableName = locale === 'it' ? 'it_vendor_products' : 'de_vendor_products';
      const { data: products } = await supabase()
        .from(tableName)
        .select('name')
        .not('name', 'is', null)
        .eq('stock_status', 'in_stock');

      const brandCounts = new Map<string, number>();
      (products || []).forEach((p: any) => {
        const brand = p.name?.split(' ')[0];
        if (brand) brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
      });

      const brands = Array.from(brandCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count, logo: getBrandLogo(name) }));

      const totalProducts = (products || []).length;
      return { brands, totalProducts };
    }

    const [brandResult, totalResult] = await Promise.all([
      supabase().rpc('get_sidebar_brand_counts'),
      supabase().rpc('get_total_product_count')
    ]);

    const totalProducts = Number(totalResult.data) || 0;
    const brands = (brandResult.data || [])
      .slice(0, 10)
      .map((b: any) => ({ name: b.brand_name, count: Number(b.product_count), logo: getBrandLogo(b.brand_name) }));

    return { brands, totalProducts };
  } catch {
    return { brands: [], totalProducts: 0 };
  }
}

export async function CompareLocalePage({
  locale,
  searchParams,
}: {
  locale: TranslatedLocale;
  searchParams: { [key: string]: string | undefined };
}) {
  const dict = await getDictionary(locale);
  const s = (slug: string) => `/${locale}/${getTranslatedSlug(slug, locale)}`;
  const currentPage = parseInt(searchParams.page || '1', 10);
  const filters = {
    brand: searchParams.brand || '',
    vendor: searchParams.vendor || '',
    flavour: searchParams.flavour || '',
    strength: searchParams.strength || '',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
    format: searchParams.format || '',
    sort: searchParams.sort || 'popularity'
  };

  const { brands: topBrands, totalProducts } = await getTopBrandsAndCount(locale);

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        <main id="main" className="clearfix" style={{
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          padding: '0',
          margin: '0',
          width: '100%'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px 20px 32px 20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <nav style={{
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <Link href={`/${locale}`} style={{
                color: '#1f2937',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '400'
              }}>Start</Link>
              <span style={{ margin: '0 10px', color: '#9ca3af', fontSize: '15px' }}>/</span>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>{dict.pages.compare.title}</span>
            </nav>

            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 16px 0',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              letterSpacing: '-0.5px',
              lineHeight: '1.1'
            }}>
              {dict.pages.compare.title}
            </h1>

            <p style={{
              fontSize: '17px',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 0 32px 0',
              lineHeight: '1.7',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              {dict.pages.homepage.metaDescription}
            </p>

            <div style={{
              display: 'flex',
              gap: '32px',
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                paddingBottom: '8px',
                borderBottom: '3px solid #1f2937'
              }}>
                {dict.filter.brand}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none'
            }}>
              {topBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`${s('compare')}?brand=${encodeURIComponent(brand.name)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: brand.logo ? '8px 20px 8px 8px' : '12px 24px',
                    backgroundColor: filters.brand === brand.name ? '#f3f4f6' : '#ffffff',
                    border: filters.brand === brand.name ? '2px solid #1f2937' : '1px solid #e5e7eb',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    color: '#1f2937',
                    fontSize: '15px',
                    fontWeight: '500',
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  {brand.logo && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f9fafb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <Image src={brand.logo} alt={brand.name} width={28} height={28} style={{ objectFit: 'contain' }} />
                    </div>
                  )}
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f4f5f9',
            padding: '16px 20px',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {dict.filter.sortBy === 'Sort by' ? 'Filter' : 'Filter'}
                </span>
                <span style={{ fontSize: '15px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {totalProducts}+ {dict.megaMenu.products}
                </span>
              </div>
              <Suspense fallback={<span style={{ fontSize: '14px', color: '#1f2937' }}>{dict.filter.sortBy}</span>}>
                <SortDropdown basePath={s('compare')} />
              </Suspense>
            </div>
          </div>

          <SSRProductGridWithSidebar currentPage={currentPage} filters={filters} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
