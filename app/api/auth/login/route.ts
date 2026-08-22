import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, createAdminToken } from '../../../../lib/admin-auth'
import { recordAuthEvent } from '../../../../lib/audit'
import { supabaseServer } from '../../../../lib/supabase-server'

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}))
  const username = String(input.username || '').trim()
  const password = String(input.password || '')

  if (username.includes('@')) {
    try {
      const supabase = supabaseServer()
      const { data, error } = await supabase.auth.signInWithPassword({ email: username.toLowerCase(), password })
      if (error || !data.user || !data.session) return NextResponse.json({ error: error?.message || 'Login yoki parol xato' }, { status: 401 })

      const name = String(data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User')
      await recordAuthEvent({ name, email: data.user.email || username, event: 'USER_LOGIN', request })
      const response = NextResponse.json({ ok: true, user: { name, email: data.user.email || username } })
      response.cookies.set('hoogle-auth-token', data.session.access_token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7
      })
      return response
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Supabase Auth sozlanmagan yoki server xatosi' }, { status: 500 })
    }
  }

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Login yoki parol xato' }, { status: 401 })
  }

  await recordAuthEvent({
    name: username,
    email: `${username}@admin.local`,
    event: 'ADMIN_LOGIN',
    request
  })

  const response = NextResponse.json({ ok: true, username })
  response.cookies.set(ADMIN_COOKIE, createAdminToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12
  })
  return response
}
