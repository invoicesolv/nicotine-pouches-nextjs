import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { getDictionary } from '@/i18n/getDictionary';
import { localeSlugs } from '@/i18n/config';
import type { TranslatedLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

function getTableConfig(locale: string) {
  if (locale === 'it') return { products: 'it_vendor_products', vendors: 'it_vendors', vendorIdCol: 'it_vendor_id' };
  if (locale === 'es') return { products: 'es_vendor_products', vendors: 'es_vendors', vendorIdCol: 'es_vendor_id' };
  return { products: 'de_vendor_products', vendors: 'de_vendors', vendorIdCol: 'de_vendor_id' };
}

export async function getLocaleProduct(locale: string, slug: string) {
  const { products, vendors, vendorIdCol } = getTableConfig(locale);

  // Convert slug back to approximate product name for matching
  const searchName = slug.replace(/-/g, ' ');

  // Try exact ilike match on name
  const { data, error } = await supabase()
    .from(products)
    .select(`id, name, ${vendorIdCol}, url, price_1pack, price_5pack, price_10pack, price_30pack, stock_status, image_url`)
    .ilike('name', `%${searchName}%`)
    .eq('stock_status', 'in_stock')
    .not('price_1pack', 'is', null)
    .order('price_1pack', { ascending: true })
    .limit(20);

  if (error || !data || data.length === 0) return null;

  // Group by vendor - get vendor names
  const vendorIds = [...new Set(data.map((p: any) => p[vendorIdCol]))];
  const { data: vendorData } = await supabase()
    .from(vendors)
    .select('id, name, website')
    .in('id', vendorIds);

  const vendorMap = new Map((vendorData || []).map((v: any) => [v.id, v]));

  // Build product with vendor comparison
  const firstProduct = data[0];
  const stores = data.map((p: any) => {
    const vendor = vendorMap.get(p[vendorIdCol]) || {};
    return {
      vendor_name: (vendor as any).name || 'Unknown',
      vendor_website: (vendor as any).website || '',
      price: p.price_1pack,
      url: p.url,
    };
  });

  return {
    name: firstProduct.name,
    image_url: firstProduct.image_url,
    brand: firstProduct.name?.split(' ')[0] || '',
    stores,
    lowestPrice: Math.min(...stores.map((s: any) => Number(s.price)).filter((p: number) => p > 0)),
  };
}

export async function generateLocaleProductMetadata(locale: string, slug: string): Promise<Metadata> {
  const product = await getLocaleProduct(locale, slug);
  if (!product) return { title: 'Not Found' };
  return {
    title: `${product.name} - Compare Prices | Nicotine Pouches`,
    description: `Compare ${product.name} prices across ${product.stores.length} stores. Best price: €${product.lowestPrice?.toFixed(2)}`,
  };
}

export async function ProductLocalePage({ locale, slug }: { locale: TranslatedLocale; slug: string }) {
  const [dict, product] = await Promise.all([getDictionary(locale), getLocaleProduct(locale, slug)]);

  if (!product) notFound();

  const guidesSlug = localeSlugs[locale]?.['compare'] || 'compare';

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        <main id="main" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
          {/* Breadcrumb */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', fontSize: '14px', color: '#666' }}>
              <Link href={`/${locale}`} style={{ color: '#333', textDecoration: 'none', fontWeight: '600' }}>Start</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <Link href={`/${locale}/${guidesSlug}`} style={{ color: '#333', textDecoration: 'none' }}>{dict.pages.compare?.title || 'Compare'}</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>{product.name}</span>
            </div>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {/* Product Image */}
              <div style={{ flex: '0 0 300px', maxWidth: '300px' }}>
                {product.image_url ? (
                  <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                    <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'contain', padding: '20px' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '300px', borderRadius: '12px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ fontSize: '12px', color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{product.brand}</div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0B051D', margin: '0 0 16px', lineHeight: '1.2', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {product.name}
                </h1>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0B051D', marginBottom: '8px' }}>
                  €{product.lowestPrice?.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                  {dict.common?.availableAt || 'Available at'} {product.stores.length} {dict.common?.shops || 'shops'}
                </div>

                {/* Store comparison */}
                <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                  {product.stores.map((store: any, i: number) => (
                    <a
                      key={i}
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px', borderBottom: i < product.stores.length - 1 ? '1px solid #eee' : 'none',
                        textDecoration: 'none', color: 'inherit',
                        backgroundColor: i === 0 ? '#f0fdf4' : 'white',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#0B051D', fontSize: '15px' }}>{store.vendor_name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{store.vendor_website.replace('https://', '')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: i === 0 ? '#16a34a' : '#0B051D' }}>
                          €{Number(store.price).toFixed(2)}
                        </span>
                        <span style={{ backgroundColor: '#0B051D', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          {dict.common?.buyNow || 'Buy now'} →
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
