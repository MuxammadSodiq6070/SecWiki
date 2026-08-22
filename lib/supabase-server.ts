import { createClient } from '@supabase/supabase-js'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL (yoki NEXT_PUBLIC_SUPABASE_URL) va Supabase API Key topilmadi.')
  }
  return { url, key }
}

export function supabaseServer() {
  const { url, key } = getSupabaseConfig()
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
