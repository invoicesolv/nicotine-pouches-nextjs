import { createClient } from '@supabase/supabase-js'

// Load environment variables — no hardcoded fallbacks for security
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Check your .env.local file.')
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
