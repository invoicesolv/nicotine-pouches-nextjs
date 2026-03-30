import { BlogPostLocalePage, generateLocalePostMetadata } from '@/i18n/locale-pages/blog-post';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateLocalePostMetadata('it', slug);
}

export default async function ITBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostLocalePage locale="it" slug={slug} />;
}
