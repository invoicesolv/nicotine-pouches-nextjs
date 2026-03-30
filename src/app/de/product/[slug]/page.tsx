import { ProductLocalePage, generateLocaleProductMetadata } from '@/i18n/locale-pages/product';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateLocaleProductMetadata('de', slug);
}

export default async function DEProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductLocalePage locale="de" slug={slug} />;
}
