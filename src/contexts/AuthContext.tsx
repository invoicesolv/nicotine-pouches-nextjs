'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  triggerLoginModal: () => void;
  loginModalTrigger: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalTrigger, setLoginModalTrigger] = useState(0);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase().auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase().auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase().auth.signOut();
  };

  const triggerLoginModal = () => {
    setLoginModalTrigger(prev => prev + 1);
  };

  const value = {
    user,
    loading,
    signOut,
    triggerLoginModal,
    loginModalTrigger
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Default values for when provider is not available (SSR)
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  signOut: async () => {},
  triggerLoginModal: () => {},
  loginModalTrigger: 0
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return defaults instead of throwing - handles SSR case
    console.warn('useAuth called outside AuthProvider, using defaults');
    return defaultAuthContext;
  }
  return context;
}
