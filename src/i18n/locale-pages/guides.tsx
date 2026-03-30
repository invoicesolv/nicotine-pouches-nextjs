import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getDictionary } from '@/i18n/getDictionary';
import type { TranslatedLocale } from '@/i18n/config';
import { supabase } from '@/lib/supabase';
import { localeSlugs } from '@/i18n/config';

async function getLocalePosts(locale: string) {
  const tableName = locale === 'de' ? 'blog_posts_de' : locale === 'it' ? 'blog_posts_it' : locale === 'es' ? 'blog_posts_es' : 'blog_posts';
  const { data, error } = await supabase()
    .from(tableName)
    .select('id, title, slug, excerpt, date, created_at, featured_image, seo_meta')
    .eq('status', 'publish')
    .order('date', { ascending: false })
    .limit(50);
  if (error) return [];
  return data || [];
}

function getGuidesSlug(locale: string) {
  const slugs = localeSlugs[locale as keyof typeof localeSlugs];
  return slugs?.['guides'] || 'guides';
}

export async function GuidesLocalePage({
  locale,
  searchParams,
}: {
  locale: TranslatedLocale;
  searchParams: { [key: string]: string | undefined };
}) {
  const [dict, posts] = await Promise.all([getDictionary(locale), getLocalePosts(locale)]);
  const guidesSlug = getGuidesSlug(locale);

  return (
    <>
      <div id="boxed-wrapper">
        <div id="wrapper" className="fusion-wrapper">
          <Header />
          <main id="main" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '0' }}>
              <div style={{ padding: '0 20px 0 70px', fontSize: '14px', color: '#666', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                <Link href={`/${locale}`} style={{ color: '#0B051D', textDecoration: 'none', fontWeight: '800' }}>Start</Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <span>{dict.pages.guides.title}</span>
              </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0B051D', margin: '0 0 40px 0', lineHeight: '1.1', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
                {dict.pages.guides.title}
              </h1>

              {posts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                  {posts.map((post: any) => (
                    <Link key={post.id} href={`/${locale}/${guidesSlug}/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s', height: '100%' }}>
                        {post.featured_image && (
                          <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f5f5f5' }}>
                            <Image src={post.featured_image} alt={post.title || ''} fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ padding: '20px' }}>
                          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0B051D', margin: '0 0 8px', lineHeight: '1.3', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                            {post.title}
                          </h2>
                          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', margin: '0 0 12px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                            {(post.excerpt || '').replace(/<[^>]*>/g, '').slice(0, 160)}...
                          </p>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            {post.date ? new Date(post.date).toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : 'en-GB') : ''}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    {dict.pages.guides.title}
                  </p>
                  <Link href="/guides" style={{ display: 'inline-block', backgroundColor: '#0B051D', color: 'white', padding: '12px 28px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    {dict.common.readMore} (English)
                  </Link>
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
