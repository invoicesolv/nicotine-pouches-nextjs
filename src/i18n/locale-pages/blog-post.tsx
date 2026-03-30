import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContentProcessor from '@/components/BlogContentProcessor';
import { getDictionary } from '@/i18n/getDictionary';
import type { TranslatedLocale } from '@/i18n/config';
import { supabase } from '@/lib/supabase';
import { localeSlugs } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

function getTableName(locale: string) {
  if (locale === 'de') return 'blog_posts_de';
  if (locale === 'it') return 'blog_posts_it';
  if (locale === 'es') return 'blog_posts_es';
  return 'blog_posts';
}

function getGuidesSlug(locale: string) {
  const slugs = localeSlugs[locale as keyof typeof localeSlugs];
  return slugs?.['guides'] || 'guides';
}

export async function getLocalePost(locale: string, slug: string) {
  const { data, error } = await supabase()
    .from(getTableName(locale))
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publish')
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateLocalePostMetadata(locale: string, slug: string): Promise<Metadata> {
  const post = await getLocalePost(locale, slug);
  if (!post) return { title: 'Not Found' };
  const seo = post.seo_meta || {};
  return {
    title: seo.title || post.title,
    description: seo.description || post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: seo.og_title || seo.title || post.title,
      description: seo.og_description || seo.description || post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 160),
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

export async function BlogPostLocalePage({
  locale,
  slug,
}: {
  locale: TranslatedLocale;
  slug: string;
}) {
  const [dict, post] = await Promise.all([getDictionary(locale), getLocalePost(locale, slug)]);

  if (!post) notFound();

  const guidesSlug = getGuidesSlug(locale);
  const dateStr = post.date ? new Date(post.date).toLocaleDateString(
    locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : locale === 'es' ? 'es-ES' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  ) : '';

  return (
    <div id="boxed-wrapper">
      <div id="wrapper" className="fusion-wrapper">
        <Header />
        <main id="main" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '0' }}>
            <div style={{ padding: '0 20px 0 70px', fontSize: '14px', color: '#666', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              <Link href={`/${locale}`} style={{ color: '#0B051D', textDecoration: 'none', fontWeight: '800' }}>Start</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <Link href={`/${locale}/${guidesSlug}`} style={{ color: '#0B051D', textDecoration: 'none', fontWeight: '800' }}>{dict.pages.guides.title}</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>{post.title}</span>
            </div>
          </div>

          {/* Hero with title over image */}
          {post.featured_image && (
            <div style={{ position: 'relative', width: '100%', height: '480px', overflow: 'hidden' }}>
              <Image src={post.featured_image} alt={post.title || ''} fill style={{ objectFit: 'cover' }} priority />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)' }} />
              <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '800px', padding: '0 20px' }}>
                <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#ffffff', margin: '0 0 12px', lineHeight: '1.15', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {post.title}
                </h1>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {dateStr}
                </div>
              </div>
            </div>
          )}

          {/* Fallback if no image */}
          {!post.featured_image && (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 0' }}>
              <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#0B051D', margin: '0 0 12px', lineHeight: '1.15', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
                {post.title}
              </h1>
              <div style={{ fontSize: '14px', color: '#999', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                {dateStr}
              </div>
            </div>
          )}

          <article style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>

            <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#333', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              <BlogContentProcessor content={post.content || ''} />
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </div>
  );
}
