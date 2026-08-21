import { NextResponse } from 'next/server'
import { recordAuthEvent } from '../../../../lib/audit'

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}))
  const email = String(input.email || '').trim().toLowerCase()
  const name = String(input.name || '').trim()
  if (!email || !name || email.length > 254 || name.length > 100) {
    return NextResponse.json({ error: 'Foydalanuvchi maʼlumoti xato' }, { status: 400 })
  }

  await recordAuthEvent({
    name,
    email,
    event: 'USER_LOGIN',
    request
  })
  return NextResponse.json({ ok: true })
}
