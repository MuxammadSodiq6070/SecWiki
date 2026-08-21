import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}))
  const email = String(input.email || '').trim().toLowerCase()
  const name = String(input.name || '').trim()
  if (!email || !name || email.length > 254 || name.length > 100) {
    return NextResponse.json({ error: 'Foydalanuvchi maʼlumoti xato' }, { status: 400 })
  }

  await prisma.authEvent.create({
    data: {
      name,
      email,
      event: 'USER_LOGIN',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      userAgent: request.headers.get('user-agent') || null
    }
  })
  return NextResponse.json({ ok: true })
}
