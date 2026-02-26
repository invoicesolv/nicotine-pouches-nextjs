import { Metadata } from 'next';
import { StoreAuthProvider } from '@/contexts/StoreAuthContext';

export const metadata: Metadata = {
  title: 'Store Portal | Nicotine Pouches',
  description: 'Manage your products and view analytics',
  robots: 'noindex, nofollow',
};

export default function StoreRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreAuthProvider>
      {children}
    </StoreAuthProvider>
  );
}
