import { redirect } from 'next/navigation';

// Redirect old /guides/{slug} URLs to canonical /{slug} URLs
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
