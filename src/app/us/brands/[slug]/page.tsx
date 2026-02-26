import { redirect } from 'next/navigation';

// Redirect /us/brands/[slug] to canonical /us/brand/[slug]
// This consolidates duplicate URLs for SEO
export default async function USBrandsSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/us/brand/${slug}`);
}
