import { ProductLocalePage, generateLocaleProductMetadata } from '@/i18n/locale-pages/product';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateLocaleProductMetadata('es', slug);
}

export default async function ESProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductLocalePage locale="es" slug={slug} />;
}
