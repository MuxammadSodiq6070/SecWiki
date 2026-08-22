import { NextResponse } from 'next/server'
import { recordAuthEvent } from '../../../../lib/audit'
import { supabaseServer } from '../../../../lib/supabase-server'

export async function POST(request: Request) {
  try {
    const input = await request.json().catch(() => ({}))
    const name = String(input.name || '').trim()
    const email = String(input.email || '').trim().toLowerCase()
    const password = String(input.password || '')

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: 'Ism, email va kamida 6 belgili parol kerak' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data.user) return NextResponse.json({ error: 'Foydalanuvchi yaratilmadi' }, { status: 400 })

    if (data.session?.access_token) {
      await recordAuthEvent({ name, email, event: 'USER_REGISTER', request })
    }

    const response = NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !data.session,
      user: { name, email }
    })
    if (data.session?.access_token) {
      response.cookies.set('hoogle-auth-token', data.session.access_token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7
      })
    }
    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Registration server xatosi' }, { status: 500 })
  }
}
