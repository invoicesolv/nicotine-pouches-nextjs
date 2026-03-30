import { ProductLocalePage, generateLocaleProductMetadata } from '@/i18n/locale-pages/product';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateLocaleProductMetadata('it', slug);
}

export default async function ITProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductLocalePage locale="it" slug={slug} />;
}
