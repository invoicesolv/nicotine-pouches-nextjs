import { BlogPostLocalePage, generateLocalePostMetadata } from '@/i18n/locale-pages/blog-post';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateLocalePostMetadata('es', slug);
}

export default async function ESBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostLocalePage locale="es" slug={slug} />;
}
