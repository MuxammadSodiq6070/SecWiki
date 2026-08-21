import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { ADMIN_COOKIE, createAdminToken } from '../../../../lib/admin-auth'

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}))
  const username = String(input.username || '').trim()
  const password = String(input.password || '')

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Login yoki parol xato' }, { status: 401 })
  }

  await prisma.authEvent.create({
    data: {
      name: username,
      email: `${username}@admin.local`,
      event: 'ADMIN_LOGIN',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      userAgent: request.headers.get('user-agent') || null
    }
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
