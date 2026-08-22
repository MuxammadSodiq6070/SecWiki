import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '../../../../lib/supabase-server'

export async function GET() {
  const token = cookies().get('hoogle-auth-token')?.value
  if (!token) return NextResponse.json({ user: null })
  try {
    const { data, error } = await supabaseServer().auth.getUser(token)
    if (error || !data.user) return NextResponse.json({ user: null })
    return NextResponse.json({ user: { name: data.user.user_metadata?.name || data.user.email?.split('@')[0], email: data.user.email } })
  } catch {
    return NextResponse.json({ user: null })
  }
}