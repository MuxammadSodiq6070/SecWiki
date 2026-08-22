import { createClient } from '@supabase/supabase-js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL va SUPABASE_SECRET_KEY env qiymatlari kerak')
  return { url, key }
}

export function supabaseServer() {
  const { url, key } = getSupabaseConfig()
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
