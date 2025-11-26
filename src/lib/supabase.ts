import { createClient } from '@supabase/supabase-js'

// Load environment variables with fallbacks
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vyolbmzuezpoqtdgongz.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjk2ODQsImV4cCI6MjA3Mjk0NTY4NH0.-ZffqZvPjUnHHbVdY68sSKYMH4jmmsTvE69ld1TVBUI'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b2xibXp1ZXpwb3F0ZGdvbmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2OTY4NCwiZXhwIjoyMDcyOTQ1Njg0fQ.6hmw_0XGzLCvMQ-OopDg7NMFMC_MYwWO4HnXUTaqV0w'

  // Only check for required variables in runtime, not during build
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
}

// Lazy initialization of Supabase clients
let _supabase: any = null
let _supabaseAdmin: any = null

export const supabase = () => {
  if (!_supabase) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return localStorage.getItem(key)
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem(key, value)
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(key)
            }
          }
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    })
  }
  return _supabase
}

// For server-side operations that need elevated permissions
export const supabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig()
    if (supabaseServiceKey) {
      _supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }
  }
  return _supabaseAdmin
}
