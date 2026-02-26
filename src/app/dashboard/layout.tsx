import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Nicotine Pouches',
  description: 'User dashboard for managing favourites and price alerts',
  robots: 'noindex, nofollow',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

