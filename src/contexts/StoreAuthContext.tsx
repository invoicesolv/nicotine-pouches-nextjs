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
  realVendorId?: number | null;
}

interface StoreAuthContextType {
  user: StoreUser | null;
  vendor: VendorInfo | null;
  loading: boolean;
  error: string | null;
  isImpersonating: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean | string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchVendor: (vendorId: string) => Promise<boolean>;
  stopImpersonating: () => Promise<void>;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  // Track the real role (before impersonation overrides vendor_id)
  const [realRole, setRealRole] = useState<string | null>(null);
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
        setIsImpersonating(data.isImpersonating || false);
        // Store the real role on first load (super_admin persists even when impersonating)
        if (!realRole) {
          setRealRole(data.user.role);
        }
        setError(null);
      } else {
        setUser(null);
        setVendor(null);
        setIsImpersonating(false);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  }, [realRole]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean | string> => {
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
        setRealRole(data.user.role);
        return true;
      } else {
        const errorMsg = data.error || 'Login failed';
        setError(errorMsg);
        return errorMsg;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return 'An error occurred during login';
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
      setRealRole(null);
      setIsImpersonating(false);
      router.push('/store/login');
    }
  };

  const switchVendor = async (vendorId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/store/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vendorId }),
      });

      if (response.ok) {
        // Refresh to pick up new vendor context
        await fetchCurrentUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const stopImpersonating = async () => {
    try {
      await fetch('/api/store/admin/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      });
      await fetchCurrentUser();
    } catch (err) {
      console.error('Stop impersonating error:', err);
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
        isImpersonating,
        isSuperAdmin: realRole === 'super_admin' || user?.role === 'super_admin',
        login,
        logout,
        refreshUser,
        switchVendor,
        stopImpersonating,
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
