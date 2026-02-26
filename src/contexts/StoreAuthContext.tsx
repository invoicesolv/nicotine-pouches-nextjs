'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface StoreUser {
  id: string;
  email: string;
  vendor_id: string | null;
  us_vendor_id: string | null;
  role: string;
  is_active: boolean;
  last_login: string | null;
  permissions: {
    can_view_analytics: boolean;
    can_export_data: boolean;
  };
}

interface VendorInfo {
  id: string;
  name: string;
  country: 'uk' | 'us';
  logo_url?: string;
  website_url?: string;
}

interface StoreAuthContextType {
  user: StoreUser | null;
  vendor: VendorInfo | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/store/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setVendor(data.vendor);
        setError(null);
      } else {
        setUser(null);
        setVendor(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setVendor(data.vendor);
        return true;
      } else {
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/store/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setVendor(null);
      router.push('/store/login');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <StoreAuthContext.Provider
      value={{
        user,
        vendor,
        loading,
        error,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </StoreAuthContext.Provider>
  );
}

export function useStoreAuth() {
  const context = useContext(StoreAuthContext);
  if (context === undefined) {
    throw new Error('useStoreAuth must be used within a StoreAuthProvider');
  }
  return context;
}

// Hook for protecting store routes
export function useRequireStoreAuth() {
  const { user, loading } = useStoreAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/store/login');
    }
  }, [user, loading, router]);

  return { user, loading, isAuthenticated: !!user };
}
